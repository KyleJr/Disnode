const Manager = require("../Manager.js");
const Discord = require("discord.js");
const shortid = require('shortid');
class cahGame extends Manager {
    constructor(pramas) {
        super(pramas);

        console.log("Loaded!");
        this.defaultConfig = {
          prefix: "cah",
          commands : [
            {
              command: "new",
              event: "New-Game"
            },
            {
              command: "start",
              event: "Start-Game"
            },
            {
              command: "join",
              event: "Join-Game"
            },
            {
              command: "players",
              event: "Get-Players"
            },
            {
              command: "leave",
              event: "Leave-Game"
            },
            {
              command: "hand",
              event: "Get-Hand"
            },
            {
              command: "submit",
              event: "Submit-Card"
            },
            {
              command: "pick",
              event: "Pick-Card"
            },
            {
              command: "games",
              event: "debug-games"
            },
            {
              command: "join-in-progress",
              event: "join-in-progress"
            },
            {
              command: "points",
              event: "Points"
            }
          ],
        };

        this.startGame = this.startGame.bind(this);
        this.joinGame = this.joinGame.bind(this);
        this.getPlayers = this.getPlayers.bind(this);
        this.newGame = this.newGame.bind(this);
        this.LeaveGame = this.LeaveGame.bind(this);
        this.DealCards = this.DealCards.bind(this);
        this.drawWhiteCard = this.drawWhiteCard.bind(this);
        this.drawBlackCard = this.drawBlackCard.bind(this);
        this.removeCardFromHand = this.removeCardFromHand.bind(this);
        this.DrawUpTopTen = this.DrawUpTopTen.bind(this);
        this.GetPlayerHand = this.GetPlayerHand.bind(this);
        this.submitCard = this.submitCard.bind(this);
        this.GameFunction = this.GameFunction.bind(this);
        this.pickCard = this.pickCard.bind(this);
        this.debugGame = this.debugGame.bind(this);
        this.joinInProgress = this.joinInProgress.bind(this);
        this.points = this.points.bind(this);

        this.disnode.command.on("Command_cah", this.displayHelp);
        this.disnode.command.on("Command_cah_Start-Game", this.startGame)
        this.disnode.command.on("Command_cah_New-Game", this.newGame)
        this.disnode.command.on("Command_cah_Join-Game", this.joinGame)
        this.disnode.command.on("Command_cah_Get-Players", this.getPlayers);
        this.disnode.command.on("Command_cah_Leave-Game", this.LeaveGame);
        this.disnode.command.on("Command_cah_Get-Hand", this.GetPlayerHand);
        this.disnode.command.on("Command_cah_Submit-Card", this.submitCard);
        this.disnode.command.on("Command_cah_Pick-Card", this.pickCard);
        this.disnode.command.on("Command_cah_Points", this.points);
        this.disnode.command.on("Command_cah_join-in-progress", this.joinInProgress);
        this.disnode.command.on("Command_cah_debug-games", this.debugGame);


        this.games = [];
        this.players = [];
        this.allCards =  require('cah-cards');
        this.blackCard =  require('cah-cards/pick1');
        this.whiteCards =  require('cah-cards/answers');

    }

    debugGame(data){
      console.log("[CAD] Games: " + this.games.length + ".Players: " + this.players.length);
      this.disnode.service.SendMessage("**Games:** `" + this.games.length + "`. **Players:** `" + this.players.length + "`", data.msg);
    }
    joinInProgress(data){
      var self = this;
      var player = self.GetPlayerByID(data.msg.userId);

      if(player && player.currentGame ){
        var game = self.GetGameByCode(player.currentGame);
        if(!game){
          return;
        }
        if(game.host != player.id){
          this.disnode.service.SendMessage("***You are not host!***", data.msg);
          return;
        }
        if(game.allowJoinInProgress){
          game.allowJoinInProgress = false;
          this.disnode.service.SendMessage("**Join in Progress:** `DISABLED`", data.msg);
        }else{
          game.allowJoinInProgress = true;
          this.disnode.service.SendMessage("**Join in Progress:** `ENABLED`", data.msg);
        }
      }
    }

    points(data){
      var self = this;
      var player = self.GetPlayerByID(data.msg.userId);

      if(player && player.currentGame ){
        var game = self.GetGameByCode(player.currentGame);
        if(!game){
          return;
        }
        if(game.host != player.id){
          this.disnode.service.SendMessage("***You are not host!***", data.msg);
          return;
        }
        if(game.hasStarted){
          this.disnode.service.SendMessage("***You cant change the point value while in game!***", data.msg);
          return;
        }
        if(data.params[0]){
          var points = data.params[0];
          if(points >= 5 && points <= 20){
            game.pointsToWin = points;
            this.disnode.service.SendMessage("***Point value set to:*** `" + points + "`***!***", data.msg);
            return;
          }else {
            this.disnode.service.SendMessage("***Point value out of range! Must be between*** `5` and `20`", data.msg);
          }
        }else{
          this.disnode.service.SendMessage("***Please enter a point value!***", data.msg);
        }
      }
    }
    displayHelp(data){
      var msg = "**Cards Against Humanity Manager**\n";
      msg+= " ***Commands***: \n";
      msg+= " `cah new` - *New Game*\n";
      msg+= " `cah start` - *Start Game*\n";
      msg+= " `cah join` - *Join Game*\n";
      msg+= " `cah leave` - *Leave Game*\n";
      msg+= " `cah players` - *Gets Players in a game*\n";
      msg+= " `cah hand` - *Sends Current Hand*\n";
      msg+= " `cah pick` - *Pick a card to win*\n";
      msg+= " `cah submit` - *Submit your card*\n";
      msg+= " `cah points` - *Change the points to win (host only)*\n";
      msg+= " `cah join-in-progress` - *Enables and Disables join-in-progress*\n";

      msg+= "**Join the Disnode Server for Support:** https://discord.gg/gxQ7nbQ";
          this.disnode.service.SendMessage(msg, data.msg);
    }

    joinGame(data){
      var self = this;

      var service = data.msg.type;
      var newPlayer = {
        name:  data.msg.username,
        id: data.msg.userId,
        sender: data.msg.sender,
        service: service,
        points: 0
      }

      var code = "";

      if(this.GetPlayerByID(data.msg.userId)){
        this.disnode.service.SendMessage(" **Already joined! Please** `"+this.disnode.command.prefix + "cah leave `", data.msg);
        return;
      }
      if(data.params[0]){
        code = data.params[0];
      }else{
        this.disnode.service.SendMessage("**Please enter a code!**", data.msg);
        return;
      }

      var foundGame = self.GetGameByCode(code);

      if(!foundGame){
        this.disnode.service.SendMessage("**No Game with code**: `" + code +'`', data.msg);
        return;
      }
      if(foundGame.hasStarted && !foundGame.allowJoinInProgress){
        this.disnode.service.SendMessage("**This game doesn't allow join in progress!**", data.msg);
        return;
      }
      newPlayer.currentGame = code;
      self.players.push(newPlayer);      //Update All Players
      foundGame.players.push(newPlayer); //Update Players in Game
      var player = self.GetPlayerByID(data.msg.userId);
      if(foundGame.hasStarted){
        player.cards = []
        for(var i = 0; i < 10; i++){
          self.drawWhiteCard(player);
        }
        self.getHand(player);
      }
      this.disnode.service.SendMessage("`" + newPlayer.name + "` **joined! There are: ** `" +foundGame.players.length+"` **players in!**", data.msg);
      console.log("[CAD] Player ("+newPlayer.name+") joined game: " + code);
      self.disnode.service.SendWhisper(newPlayer.sender, "**Welcome ** `" + newPlayer.name +"`!", {type: newPlayer.service});
    }

    getPlayers(data){

      var self = this;
      var player = self.GetPlayerByID(data.msg.userId);
      if(player && player.currentGame){
        var game = self.GetGameByCode(player.currentGame);
        if(!game){
          return;
        }
        var msg = "**Current player in [`"+player.currentGame+"`]: **\n";
        for (var i = 0; i < game.players.length; i++) {
          var curPlayer = game.players[i];
          msg += " - **" + curPlayer.name + "** from *" + curPlayer.service + '*\n';

        }
        this.disnode.service.SendMessage(msg, data.msg);
      }

    }

    newGame(data){

      var id = shortid.generate();
      var newGame = {
        id: id,
        host: data.msg.userId,
        hostName: data.msg.username,
        players: [],
        hasStarted: false,
        pointsToWin: 10,
        allowJoinInProgress: true,
        stage: 0,
        currentBlackCard: {},
        currentWhiteCards: [],
        currentCardCzar: {},
        CzarOrderCount: 0
      };
      this.games.push(newGame);
      this.disnode.service.SendMessage("**New Game!** Code: `" + id + '`', data.msg);
      console.log("[CAD] New Game by ("+newGame.hostName+") : " + id);
      data.params[0] = id;
      this.joinGame(data);
    }
    startGame(data){
      var self = this;
      var player = self.GetPlayerByID(data.msg.userId);

      if(player && player.currentGame ){
        var game = self.GetGameByCode(player.currentGame);
        if(!game){
          return;
        }
        if(game.host != player.id){

          this.disnode.service.SendMessage("***You are not host!***", data.msg);
          return;
        }
        if(game.hasStarted){
          this.disnode.service.SendMessage("**Game is already running!**", data.msg);
        }
        if(game.players.length >= 3){
          self.sendMsgToAllPlayers(game, "**Starting...**");
          console.log("[CAD] Game Started : " + game.id);
          game.hasStarted = true;
          game.origchat = data.msg;
          self.DealCards(game);
        }else{
          this.disnode.service.SendMessage("**cah requires at least 3 players!** Current: `" + game.players.length + '`', data.msg);
        }
      }
    }
    GetPlayerHand(data){
      var self = this;
      var player = self.GetPlayerByID(data.msg.userId);
      if(player && player.currentGame ){
        var game = self.GetGameByCode(player.currentGame);
        if(!game){
          return;
        }
        if(!game.hasStarted)return;
        self.getHand(player);
      }
    }
    LeaveGame(data){
      var self = this;
      var player = self.GetPlayerByID(data.msg.userId);
      if(player && player.currentGame ){
        var game = self.GetGameByCode(player.currentGame);
        if(!game){
          return;
        }
        if(game.hasStarted){
          for(var x = 0; x < game.currentWhiteCards.length; x++){
            if(game.currentWhiteCards[x].player.id == player.id){
              game.currentWhiteCards.splice(x,1);
            }
          }
          if(game.currentCardCzar.id == player.id){
            if(game.CzarOrderCount < game.players.length){
              game.currentCardCzar = game.players[game.CzarOrderCount];
              game.CzarOrderCount++;
            }else{
              game.CzarOrderCount = 0;
              game.currentCardCzar = game.players[game.CzarOrderCount];
              game.CzarOrderCount++;
            }
            for(var x = 0; x < game.currentWhiteCards.length; x++){
              if(game.currentWhiteCards[x].player.id == currentCardCzar.id){
                game.currentWhiteCards.splice(x,1);
              }
            }
            this.disnode.service.SendMessage("**The current Card Czar has left so we are picking a new one!**\n**Current Card Czar: **`" + game.currentCardCzar.name, game.origchat);
          }
        }
        for(var i = 0; i < game.players.length; i++){
          if(player.id == game.players[i].id){
            game.players.splice(i, 1); //Update Players in Game
            break;
          }
        }
        for(var i = 0; i < self.players.length; i++){
          if(player.id == self.players[i].id){
            self.players.splice(i, 1);      //Update All Players
            break;
          }
        }
        player.currentGame = "";
        self.sendMsgToAllPlayers(game,  "`" + player.name + "` left! **There are: `" + game.players.length + "` players left in the game!**");
        if(game.players.length < 3){
          self.sendMsgToAllPlayers(game,"**There are less than 3 players in the game so the game has ended!**");
          self.endGame(game);
        }

        self.disnode.service.SendWhisper(player.sender, "**You left the game!**", {type: player.service});
      }
    }
    GetPlayerByID(id){
      var self = this;
      var foundPlayer;

      for (var i = 0; i < self.players.length; i++) {
        if(self.players[i].id == id){
          foundPlayer = self.players[i];
        }
      }

      return foundPlayer;
    }

    GetGameByCode(code){
      var self = this;
      var foundGame;

      for (var i = 0; i < self.games.length; i++) {
        if(self.games[i].id === code){
          foundGame = self.games[i];
        }
      }

      return foundGame;
    }
    submitCard(data){
      var self = this;
      var player = self.GetPlayerByID(data.msg.userId);
      if(player && player.currentGame ){
        var game = self.GetGameByCode(player.currentGame);
        if(!game){
          return;
        }
        if(!game.hasStarted)return;
        if(player.id == game.currentCardCzar.id){
          self.disnode.service.SendWhisper(player.sender, " **You are the Card Czar you cant submit a card!**", {type: player.service});
          return;
        }
        if(player.cards.length < 10){
          self.disnode.service.SendWhisper(player.sender, "**You already submitted a card!**", {type: player.service});
          return;
        }
        if(data.params[0]){
          if(data.params[0] >= 1 && data.params[0] < 11){
              var index = data.params[0];
              index--;
              var submitCard = player.cards[index];
              submitCard.player = player;
              game.currentWhiteCards.push(submitCard);
              player.cards.splice(index,1);
              self.disnode.service.SendWhisper(player.sender, "**You submitted:** `" + submitCard.text + '`', {type: player.service});
          }else{
            this.disnode.service.SendMessage("**Invalid card index! must be (1-10) get your cards by typing  **`"+this.disnode.command.prefix + "get`", data.msg);
          }
        }else{
          this.disnode.service.SendMessage("**Please enter a card index! get your cards by typing:** `"+this.disnode.command.prefix + "get`", data.msg);
          return;
        }
        self.GameFunction(game);
      }
    }
    pickCard(data){
      var self = this;
      var player = self.GetPlayerByID(data.msg.userId);
      if(player && player.currentGame ){
        var game = self.GetGameByCode(player.currentGame);
        if(!game){
          return;
        }
        if(!game.hasStarted)return;
        if(player.id != game.currentCardCzar.id){
          self.disnode.service.SendWhisper(player.sender, "**You are not the Card Czar you cant pick a card!**", {type: player.service});
          return;
        }
        if(game.currentWhiteCards.length < (game.players.length - 1)){
          self.disnode.service.SendWhisper(player.sender, "**You can't pick a card yet!**", {type: player.service});
          return;
        }
        if(data.params[0]){
          if(data.params[0] >= 0 && data.params[0] < game.currentWhiteCards.length){
              var index = data.params[0];
              var pickCard = game.currentWhiteCards[index];
              for(var i = 0; i < game.players.length; i++){
                if(game.players[i].id == pickCard.player.id){
                  game.players[i].points++;
                  break;
                }
              }
              this.disnode.service.SendMessage("**Card has been picked! Card: `" + pickCard.text + "` **Submitted by:** `" + pickCard.player.name + '`', game.origchat);
              game.currentWhiteCards = [];
              game.stage = 2;
              self.GameFunction(game);
          }else{
            this.disnode.service.SendMessage("**Invalid card index! must be (0-" + (game.currentWhiteCards.length - 1) + ")**", data.msg);
          }
        }else{
          this.disnode.service.SendMessage("**Please enter a card index!**", data.msg);
          return;
        }
      }
    }
    //// ================ GAME LOGIC ======================== ///
    //// ================ GAME LOGIC ======================== ///
    //// ================ GAME LOGIC ======================== ///
    //// ================ GAME LOGIC ======================== ///
    GameFunction(game){
      var self = this;
      if(!game.hasStarted)return;
      if(game.stage == 0){
        //Pick a Card Czar, and black card then move on to stage 1
        if(game.CzarOrderCount < game.players.length){
          game.currentCardCzar = game.players[game.CzarOrderCount];
          game.CzarOrderCount++;
        }else{
          game.CzarOrderCount = 0;
          game.currentCardCzar = game.players[game.CzarOrderCount];
          game.CzarOrderCount++;
        }

        game.currentBlackCard = self.drawBlackCard();
        this.disnode.service.SendMessage("**Current Card Czar: **`" + game.currentCardCzar.name + "` \n**Current Black Card:** " + game.currentBlackCard.text, game.origchat);
        game.stage = 1;
        self.sendMsgToAllPlayers(game, "**Current Black Card:** " + game.currentBlackCard.text)
        self.sendMsgToAllPlayers(game, "**Now you must submit one of your cards to respond with the black question card to submit use `!cah submit [index]` - where index is the card number next to your card (unless your the Card Czar where you can relax for this part.)**");
      }
      if (game.stage == 1){
        //Allow player to submit a white card for the black card move on to stage 2
        if(game.currentWhiteCards.length < (game.players.length - 1)){
          this.disnode.service.SendMessage("**Submitted Cards: **`" + game.currentWhiteCards.length + "/" + (game.players.length - 1) + "`", game.origchat);
        }else{
          this.disnode.service.SendMessage("**All cards have been Submitted**", game.origchat);
          this.disnode.service.SendMessage("**Current Black Card: **" + game.currentBlackCard.text + "**\n**Now the Card Czar must `!cah pick [index]` to pick what white card he/she likes the most. The cards are:**", game.origchat);
          var msg = " ";
          for(var i = 0; i < game.currentWhiteCards.length; i++){
            if(i == (game.currentWhiteCards.length - 1)){
              msg += "╚[ " + i + " ] - " + game.currentWhiteCards[i].text + "\n";
            }else{
              msg += "╠[ " + i + " ] - " + game.currentWhiteCards[i].text + "\n";
            }
          }
          this.disnode.service.SendMessage(msg, game.origchat);
        }
      }
      if (game.stage == 2){
        //Card Czar will pick the winning card and points are awarded then move on to stage 3
        this.disnode.service.SendMessage("**Current Standings: **", game.origchat);
        msg = " ";
        for(var i = 0; i < game.players.length; i++){
          msg += "**[" + game.players[i].name + "]** Points: " + game.players[i].points + " \n";
        }
        this.disnode.service.SendMessage(msg, game.origchat);
        game.stage = 3;
      }
      if (game.stage == 3){
        //(check if there is a winner if no winner then draw up to ten cards and go back to stage 0)
        for(var i = 0; i < game.players.length; i++){
          if(game.players[i].points >= game.pointsToWin){
            this.disnode.service.SendMessage("**A player has Won! Winner: **`" + game.players[i].name + '`', game.origchat);
            self.endGame(game);
            return;
          }
        }
        self.DrawUpTopTen(game);
        for(var i = 0; i < game.players.length; i++){
          self.getHand(game.players[i]);
        }
        game.stage = 0;
        self.GameFunction(game);
      }
    }
    endGame(game){
      var self = this;
      if(!game){
        return;
      }
      var gameplayers = game.players.length;
      for(var i = 0; i < gameplayers; i++){
        var managerPlayers = self.players.length;
        var currentPlayer = game.players[0];
        for(var x = 0; x < managerPlayers; x++){
          if(self.players[x].id == currentPlayer.id){
            self.players.splice(x,1);
            break;
          }
        }
        game.players.splice(0,1);
      }
      for(var i = 0; i < self.games.length; i++){
        if(game.id == self.games[i].id){
          self.games.splice(i,1);
          break;
        }
      }
    }
    DealCards(game){
      var self = this;
      var players = game.players;

      for (var x = 0; x < players.length; x++) {
        var player = players[x];
        player.cards = [];
        self.disnode.service.SendWhisper(player.sender, "**Your Deck is: **", {type: player.service});
        var msg = "";
        for (var i = 0; i < 10; i++) {
          var cardToAdd = self.drawWhiteCard(player);
          if(i == 9){
            msg += "╚[ " + (i+1) + " ] - " + cardToAdd.text + "\n";
          }else{
            msg += "╠[ " + (i+1) + " ] - " + cardToAdd.text + "\n";
          }
        }
        player.points = 0;
        self.disnode.service.SendWhisper(player.sender, msg, {type: player.service});
        self.disnode.service.SendWhisper(player.sender, "**Please wait for the next stage of the game.**", {type: player.service});
      }
      this.GameFunction(game);
    }
    //This generates a random White card then adds it to the players hand (returns the white card added to hand)
    drawWhiteCard(player){
      var self = this;
      var obj_keys = Object.keys(self.whiteCards);
      var ran_key = obj_keys[Math.floor(Math.random() *obj_keys.length)];
      var cardToAdd = self.whiteCards[ran_key];
      player.cards.push(cardToAdd);
      return cardToAdd;
    }
    drawBlackCard(){
      var self = this;
      var obj_keys = Object.keys(self.blackCard);
      var ran_key = obj_keys[Math.floor(Math.random() *obj_keys.length)];
      var cardToAdd = self.blackCard[ran_key];
      return cardToAdd;
    }
    getHand(player){
      var self = this;
      var msg = " ";
      for (var i = 0; i < player.cards.length; i++) {
        var card = player.cards[i];
        if(i == 9){
          msg += "╚**[" + (i+1) + "** - " + card.text + "]\n";
        }else{
          msg += "╠**[" + (i+1) + "** - " + card.text + "]\n";
        }
      }
      self.disnode.service.SendWhisper(player.sender, msg, {type: player.service});
    }
    DrawUpTopTen(game){
      var self = this;
      for(var i = 0; i < game.players.length; i++){
        var player = game.players[i];
        while(player.cards.length < 10){
          self.drawWhiteCard(player);
        }
      }
    }
    //This removes the card in the given index
    removeCardFromHand(player,index){
      var self = this;
      if(index < 0 || index > 9) return;
      player.cards.splice(index,1);
    }
    sendMsgToAllPlayers(game, msg){
      var self = this;

      for(var i = 0; i < game.players.length; i++){
        self.disnode.service.SendWhisper(game.players[i].sender, msg, {type: game.players[i].service})
      }
    }
}
module.exports = cahGame;
