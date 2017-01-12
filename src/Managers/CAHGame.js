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
          {command: "new",event: "New-Game"},
          {command: "start",event: "Start-Game"},
          {command: "join",event: "Join-Game"},
          {command: "players",event: "Get-Players"},
          {command: "leave",event: "Leave-Game"},
          {command: "hand",event: "Get-Hand"},
          {command: "submit",event: "Submit-Card"},
          {command: "pick",event: "Pick-Card"},
          {command: "games",event: "debug-games"},
          {command: "join-in-progress",event: "join-in-progress"},
          {command: "points",event: "Points"},
          {command: "deck",event: "deck"},
          {command: "public",event: "public"},
          {command: "type",event: "type"},
          {command: "devmsg",event: "debug-devmsg"}
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
      this.debugdevmsg = this.debugdevmsg.bind(this);
      this.updateGameTimer = this.updateGameTimer.bind(this);
      this.deckCommand = this.deckCommand.bind(this);
      this.getDeck = this.getDeck.bind(this);
      this.publicListCommand = this.publicListCommand.bind(this);
      this.gameTypeCommand = this.gameTypeCommand.bind(this);
      this.addCardCastDeck = this.addCardCastDeck.bind(this);
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
      this.disnode.command.on("Command_cah_deck", this.deckCommand);
      this.disnode.command.on("Command_cah_public", this.publicListCommand);
      this.disnode.command.on("Command_cah_type", this.gameTypeCommand);
      this.disnode.command.on("Command_cah_join-in-progress", this.joinInProgress);
      this.disnode.command.on("Command_cah_debug-games", this.debugGame);
      this.disnode.command.on("Command_cah_debug-devmsg", this.debugdevmsg);
      this.games = [];
      this.players = [];
      this.allCards =  require('cah-cards');
      this.blackCard =  require('cah-cards/pick1');
      this.whiteCards =  require('cah-cards/answers');
      this.cc = require('cardcast-api');
      this.ccapi = new this.cc.CardcastAPI();
  }
  gameTypeCommand(data){
    var self = this;
    var player = self.GetPlayerByID(data.msg.userId);
    if(player && player.currentGame){
      var game = self.GetGameByCode(player.currentGame);
      if(!game){
        return;
      }
      if(game.host != player.id){
        this.disnode.service.SendMessage("***You are not host!***", data.msg);
      }
      switch (game.public) {
        case true:
          game.public = false;
          var oldID = game.id;
          game.id = shortid.generate();
          console.log("[CAD -" + self.getDateTime() + "] Game: " + oldID + ". Is now known as: " + game.id);
          for (var i = 0; i < game.players.length; i++) {
            game.players[i].currentGame = game.id;
          }
          for (var i = 0; i < self.players.length; i++) {
            if(self.players[i].currentGame == oldID){
              self.players[i].currentGame = game.id;
            }
          }
          self.disnode.service.SendMessage("**The game is now** `PRIVATE` **We also generated a new code for this game to keep it private for you:** `" + game.id + "`", data.msg);
          break;
        case false:
          game.public = true;
          self.disnode.service.SendMessage("**The game is now** `PUBLIC`", data.msg);
          break;
        default:
          break;
      }
    }
  }
  publicListCommand(data){
    var self = this;
    var publicGames = [];
    for (var i = 0; i < self.games.length; i++) {
      if(self.games[i].public)publicGames.push(self.games[i]);
    }
    if(publicGames.length == 0){
      self.disnode.service.SendMessage("**Oh No! we are sad to say this, but there is currently nobody to play CAD with publicly**", data.msg);
      return;
    }
    var msg = "**-=Public Games=-**\n";
    for (var i = 0; i < publicGames.length; i++) {
      msg += "**|| **`" + (i+1) + "`** - Players: **`" + publicGames[i].players.length + "`** -=- Started: **`" + publicGames[i].hasStarted + "` ** -=- Creator: **`" + publicGames[i].hostName + "`** -=- ID: **`" + publicGames[i].id + "`\n";
    }
    self.disnode.service.SendMessage(msg, data.msg);
  }
  deckCommand(data){
    var self = this;
    var player = self.GetPlayerByID(data.msg.userId);
    if(player && player.currentGame ){
      var game = self.GetGameByCode(player.currentGame);
      if(!game){
        return;
      }
      switch (data.params[0]) {
        case "add":
          if(game.host != player.id){
            this.disnode.service.SendMessage("***You are not host!***", data.msg);
            return;
          }
          if(game.hasStarted){
            this.disnode.service.SendMessage("***You cant modify the decks when the game has started!***", data.msg);
            return;
          }
          if(data.params[1] == undefined){
            self.disnode.service.SendMessage("**Please enter an ID** use `!cah deck list` to get a list of active decks", data.msg);
            break;
          }
          var outmsg = "";
          for (var i = 1; i < data.params.length; i++) {
            console.log("FOR: " + data.params[i]);
            if(data.params[i] == undefined)break;
            for (var x = 0; x < game.decks.length; x++) {
              if(game.decks[x].id == data.params[i]){
                self.disnode.service.SendMessage("A deck with ID:`" + data.params[i] + "` Was already in the Active Decks! Use `!cah deck list` to get a list of active decks", data.msg);
              }
            }
            if(data.params[i] == "0"){
              game.decks.push({name:"Default Deck", id: 0, calls: self.blackCard, responses: self.whiteCards});
              self.disnode.service.SendMessage("**Default Deck** Added", data.msg);
            }else{
              self.addCardCastDeck(game, data.params[i], data);
            }
          }
          break;
        case "list":
          var msg = "**Active Decks for **`" + game.id + "`**:**\n";
          for (var i = 0; i < game.decks.length; i++) {
            msg += "**ID:** " + game.decks[i].id + " **NAME:** " + game.decks[i].name + "\n";
          }
          self.disnode.service.SendMessage(msg, data.msg);
          break;
        case "remove":
          if(game.host != player.id){
            this.disnode.service.SendMessage("***You are not host!***", data.msg);
            return;
          }
          if(game.hasStarted){
            this.disnode.service.SendMessage("***You cant modify the decks when the game has started!***", data.msg);
            return;
          }
          if(data.params[1]){
            if(game.decks.length == 1){
              self.disnode.service.SendMessage("**ERROR**: You cant remove a deck if you only have one Active deck left!", data.msg);
              break;
            }
            for (var i = 0; i < game.decks.length; i++) {
              if(game.decks[i].id == data.params[1]){
                game.decks.splice(i,1);
                if(data.params[1] == 0){
                  self.disnode.service.SendMessage("**Default Deck** Removed if you wish to have the default deck back again use `!cah deck add 0`", data.msg);
                  return;
                }else{
                  self.disnode.service.SendMessage("**" + game.decks[i].name + "** `REMOVED`", data.msg);
                  return;
                }
              }
            }
            self.disnode.service.SendMessage("**ID:** " + data.params[1] + "Was not found! Be sure that you have the correct ID, use `!cah deck list` to get a list of active decks", data.msg);
            break;
          }else{
            self.disnode.service.SendMessage("**Please enter an ID** use `!cah deck list` to get a list of active decks", data.msg);
          }
          break;
        default:
          var client = this.disnode.service.GetService("DiscordService").client;
          var msg = "";
          msg+= " `cah deck list` - *List your current game's Active Decks*\n";
          msg+= " `cah deck add` - *Add a deck using its cardcast id e.g.* `!cah deck add JJDFG` *You can add more than one deck at a time seperate the decks with spaces! e.g.* `!cah deck add JJDFG DK593` **(host only / Pre-Game)**\n";
          msg+= " `cah deck remove` - *Remove a deck using its cardcast id e.g.* `!cah deck remove JJDFG` **(host only / Pre-Game)**\n";
          this.disnode.service.SendEmbed({
              color: 3447003,
              author: {},
              title: 'Deck Management',
              description: 'Manage your deck with packs that you can find on https://www.cardcastgame.com/browse/',
              fields: [ {
                  name: 'Commands',
                  inline: false,
                  value: msg,
              }],
              timestamp: new Date(),
              footer: {}
          }, data.msg);
          break;
      }
    }
  }
  debugdevmsg(data){
    var self = this;
    if((data.msg.userId != 112786170655600640) && (data.msg.userId != 131235236402036736))return;
    if(!data.params[0])return;
    for(var i = 0; i < this.games.length; i++){
      this.disnode.service.SendMessage(data.params[0], this.games[i].origchat);
    }
    this.disnode.service.SendMessage("**MSG SENT: **" + data.params[0], data.msg);
  }
  debugGame(data){
    var self = this;
    var msg = "**Game Listing:**\n";
    for(var i =0; i < this.games.length; i++){
      msg += "**|| **`" + (i+1) + "`** - Players: **`" + this.games[i].players.length + "`** -=- Started: **`" + this.games[i].hasStarted + "` ** -=- Creator: **`" + this.games[i].hostName + "`** -=- Last Active: **`" + this.games[i].lastActive + "`\n";
    }
    console.log("[CAD -" + self.getDateTime() + "] Games: " + this.games.length + ".Players: " + this.players.length);
    this.disnode.service.SendMessage("**Games:** `" + this.games.length + "`. ** Total Players:** `" + this.players.length + "`\n**Current Time: **`" + this.getDateTime() + "`\n" + msg, data.msg);
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
    if (data.msg.type == "DiscordService") {
      var client = this.disnode.service.GetService("DiscordService").client;
      var msg = "";
      msg+= " `cah new` - *New Game*\n";
      msg+= " `cah start` - *Start Game* **(host only / Pre-Game)**\n";
      msg+= " `cah join` - *Join Game*\n";
      msg+= " `cah leave` - *Leave Game*\n";
      msg+= " `cah players` - *Gets Players in a game*\n";
      msg+= " `cah hand` - *Sends Current Hand*\n";
      msg+= " `cah type` - *TOGGLES the game's privacy (public/private)* **(host only)**\n";
      msg+= " `cah public` - *Lists Public games*\n";
      msg+= " `cah pick` - *Pick a card to win*\n";
      msg+= " `cah submit` - *Submit your card*\n";
      msg+= " `cah deck` - *Deck Management* **(Conditions vary by subcommand)**\n";
      msg+= " `cah points` - *Change the points to win* **(host only / Pre-Game)**\n";
      msg+= " `cah join-in-progress` - *Enables and Disables join-in-progress* **(host only)**\n";
      this.disnode.service.SendEmbed({
          color: 3447003,
          author: {},
          title: 'Cards Against Discord',
          description: 'A Discord bot that allows users to play Cards Against Humanity on Discord',
          fields: [ {
              name: 'Commands',
              inline: false,
              value: msg,
          }, {
            name: 'Discord Server',
            inline: false,
            value: "**Join the Disnode Server for Support and More!:** https://discord.gg/gxQ7nbQ",
        }],
          timestamp: new Date(),
          footer: {}
      }, data.msg);
    }
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
    if(this.GetPlayerByID(data.msg.userId)){
      this.disnode.service.SendMessage("You were already in a game when joining a new game, Automatically leaving your last game!", data.msg);
      this.LeaveGame(data);
    }
    newPlayer.currentGame = code;
    self.players.push(newPlayer);      //Update All Players
    foundGame.players.push(newPlayer); //Update Players in Game
    var player = self.GetPlayerByID(data.msg.userId);
    if(foundGame.hasStarted){
      player.cards = []
      for(var i = 0; i < 10; i++){
        self.drawWhiteCard(foundGame, player);
      }
      if(foundGame.stage == 1)self.disnode.service.SendWhisper(newPlayer.sender, "**Current Card Czar: **`" + foundGame.currentCardCzar.name + "` \n**Current Black Card:** " + foundGame.currentBlackCard.text + "\n**Now you must submit one of your cards to respond with the black question card to submit use `!cah submit [index]` - where index is the card number next to your card (unless your the Card Czar where you can relax for this part.)**\n\n**Your Cards:**", {type: newPlayer.service});
      self.getHand(player);
    }
    this.updateGameTimer(foundGame);
    this.sendMsgToAllPlayers(foundGame,"`" + newPlayer.name + "` **joined! There are: ** `" +foundGame.players.length+"` **players in!**");
    console.log("[CAD -" + self.getDateTime() + "] Player ("+newPlayer.name+") joined game: " + code);
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
      this.updateGameTimer(game);
      this.disnode.service.SendMessage(msg, data.msg);
    }
  }
  newGame(data){
    var self = this;
    var id = shortid.generate();
    var newGame = {
      id: id,
      host: data.msg.userId,
      hostName: data.msg.username,
      public: false,
      players: [],
      decks: [
        {name:"Default Deck", id: 0, calls: self.blackCard, responses: self.whiteCards}
      ],
      hasStarted: false,
      pointsToWin: 10,
      allowJoinInProgress: true,
      stage: 0,
      origchat: data.msg,
      currentBlackCard: {},
      currentWhiteCards: [],
      currentCardCzar: {},
      CzarOrderCount: 0,
      timer: {},
      lastActive: ""
    };
    this.updateGameTimer(newGame);
    this.games.push(newGame);
    this.disnode.service.SendMessage("**New Game!** Code: `" + id + '`' + "\n**Tips:**\n1. You join a game you created **automatically**!\n2. Use `!cah` to see a list of commands. **Some might be useful for game setup!**\n3. **We support CardCast Decks!** use `!cah deck` for more info.\n4. If your lonely and want anyone to join your game use `!cah type` to toggle between **Private** and **Public** game type. We default to **PRIVATE** games.\n5. Want to be the first to know about **new features** on **Cards Against Discord**? Join our **Discord Server** to get notified when we publish a new update! (<https://discord.gg/gxQ7nbQ>)", data.msg);
    console.log("[CAD -" + self.getDateTime() + "] New Game by ("+newGame.hostName+") : " + id);
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
        console.log("[CAD -" + self.getDateTime() + "] Game Started : " + game.id);
        game.hasStarted = true;
        game.origchat = data.msg;
        this.updateGameTimer(game)
        self.DealCards(game);
        this.disnode.service.SendMessage("**Please use Direct Messages for the rest of the game!**", game.origchat);
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
        if(game.currentWhiteCards.length != 0){
          for(var x = 0; x < game.currentWhiteCards.length; x++){
            if(game.currentWhiteCards[x].player.id == player.id){
              game.currentWhiteCards.splice(x,1);
            }
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
            if(game.currentWhiteCards[x].player.id == game.currentCardCzar.id){
              game.currentWhiteCards.splice(x,1);
            }
          }
          self.sendMsgToAllPlayers(game, "**The current Card Czar has left so we are picking a new one!**\n**Current Card Czar: **`" + game.currentCardCzar.name);
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
      }else this.updateGameTimer(game);
      self.disnode.service.SendWhisper(player.sender, "**You left the game: **" + game.id + "** !**", {type: player.service});
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
      this.updateGameTimer(game);
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
            this.updateGameTimer(game);
            self.sendMsgToAllPlayers(game,"**Card has been picked! Card: `" + pickCard.text + "`** Submitted by: **`" + pickCard.player.name + '`');
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
  getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
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
      game.currentBlackCard = self.drawBlackCard(game);
      self.sendMsgToAllPlayers(game, "**Current Card Czar: **`" + game.currentCardCzar.name + "` \n**Current Black Card:** " + game.currentBlackCard.text + "\n**Now you must submit one of your cards to respond with the black question card to submit use `!cah submit [index]` - where index is the card number next to your card (unless your the Card Czar where you can relax for this part.)**\n\n**Your Cards:**");
      game.stage = 1;
      for(var i = 0; i < game.players.length; i++){
        self.getHand(game.players[i]);
      }
    }
    if (game.stage == 1){
      //Allow player to submit a white card for the black card move on to stage 2
      if(game.currentWhiteCards.length < (game.players.length - 1)){
        self.sendMsgToAllPlayers(game, "**Submitted Cards: **`" + game.currentWhiteCards.length + "/" + (game.players.length - 1) + "`");
      }else{
        if(game.players.length == 3){
          var rand = self.getRandomIntInclusive(0,1);
          var card = game.currentWhiteCards.splice(rand,1);
          game.currentWhiteCards.push(card[0]);
        }else{
          for (var i = 0; i < game.currentWhiteCards.length; i++) {
            var rand = self.getRandomIntInclusive(0,(game.currentWhiteCards.length - 1));
            var card = game.currentWhiteCards.splice(rand,1);
            game.currentWhiteCards.push(card[0]);
          }
        }
        self.sendMsgToAllPlayers(game, "**Current Black Card: **" + game.currentBlackCard.text + "**\n**Now the Card Czar must `!cah pick [index]` to pick what white card he/she likes the most. The cards are:**");
        var msg = " ";
        for(var i = 0; i < game.currentWhiteCards.length; i++){
          if(i == (game.currentWhiteCards.length - 1)){
            msg += "╚[ " + i + " ] - " + game.currentWhiteCards[i].text + "\n";
          }else{
            msg += "╠[ " + i + " ] - " + game.currentWhiteCards[i].text + "\n";
          }
        }
        self.sendMsgToAllPlayers(game, msg);
      }
    }
    if (game.stage == 2){
      //Card Czar will pick the winning card and points are awarded then move on to stage 3
      self.sendMsgToAllPlayers(game, "**Current Standings: **", game.origchat);
      msg = " ";
      for(var i = 0; i < game.players.length; i++){
        msg += "**[" + game.players[i].name + "]** Points: " + game.players[i].points + " \n";
      }
      msg += "`===-------Next Round-------===`\n"
      self.sendMsgToAllPlayers(game, msg, game.origchat);
      game.stage = 3;
    }
    if (game.stage == 3){
      //(check if there is a winner if no winner then draw up to ten cards and go back to stage 0)
      for(var i = 0; i < game.players.length; i++){
        if(game.players[i].points >= game.pointsToWin){
          self.sendMsgToAllPlayers(game, "**A player has Won! Winner: **`" + game.players[i].name + '`', game.origchat);
          self.endGame(game);
          return;
        }
      }
      self.DrawUpTopTen(game);
      game.stage = 0;
      self.GameFunction(game);
    }
  }
  endGame(game){
    var self = this;
    if(!game){
      return;
    }
    console.log("[CAD -" + self.getDateTime() + "] Game: " + game.id + " Has Ended!");
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
    clearTimeout(game.timer);
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
      for (var i = 0; i < 10; i++) {
        self.drawWhiteCard(game, player);
      }
      player.points = 0;
    }
    this.GameFunction(game);
  }
  //This generates a random White card then adds it to the players hand (returns the white card added to hand)
  drawWhiteCard(game, player){
    var self = this;
    var deck = self.getDeck(game);
    var obj_keys = Object.keys(deck.responses);
    var ran_key = obj_keys[Math.floor(Math.random() *obj_keys.length)];
    var cardToAdd = deck.responses[ran_key];
    player.cards.push(cardToAdd);
  }
  drawBlackCard(game){
    var self = this;
    var deck = self.getDeck(game);
    var obj_keys = Object.keys(deck.calls);
    var ran_key = obj_keys[Math.floor(Math.random() *obj_keys.length)];
    var cardToAdd = deck.calls[ran_key];
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
        self.drawWhiteCard(game, player);
      }
    }
  }
  //This removes the card in the given index
  removeCardFromHand(player,index){
    var self = this;
    if(index < 0 || index > 9) return;
    player.cards.splice(index,1);
  }
  updateGameTimer(game){
    var self = this;
    console.log("[CAD -" + self.getDateTime() + "] Game: " + game.id + " Timer Reset!");
    game.lastActive = self.getDateTime();
    if(game.timer == {}){
      game.timer = setTimeout(function() {
        self.sendMsgToAllPlayers(game, "The game was idle for 1 hour, the game will now end due to inactivity.");
        console.log("[CAD -" + self.getDateTime() + "] Game: " + game.id + " Has EXPIRED!");
        self.endGame(game);
      }, 3600000);
      //3600000
    }else{
      clearTimeout(game.timer);
      game.timer = setTimeout(function() {
        self.sendMsgToAllPlayers(game, "The game was idle for 1 hour, the game will now end due to inactivity.");
        console.log("[CAD -" + self.getDateTime() + "] Game: " + game.id + " Has EXPIRED!");
        self.endGame(game);
      }, 3600000);
    }
  }
  sendMsgToAllPlayers(game, msg){
    var self = this;
    for(var i = 0; i < game.players.length; i++){
      self.disnode.service.SendWhisper(game.players[i].sender, msg, {type: game.players[i].service})
    }
  }
  getDeck(game){
    var self = this;
    if(game.decks.length == 1)return game.decks[0];
    return game.decks[self.getRandomIntInclusive(0, (game.decks.length - 1))];
  }
  addCardCastDeck(game, id, data){
    var self = this;
    id = id.toUpperCase();
    return self.ccapi.deck(id).then(function(apideck) {
      if(apideck == null || apideck == undefined){
        self.disnode.service.SendMessage("I couldn't find a deck on CardCast with that ID, Sorry!", data.msg);
        return false;
      }
      var rdeck = {name: apideck.name,id: id, calls: [], responses: []};
      for (var i = 0; i < apideck.responses.length; i++) {
        rdeck.responses.push(apideck.responses[i].toJSON());
      }
      for (var i = 0; i < apideck.calls.length; i++) {
        var card = apideck.calls[i].toJSON();
        card.text = apideck.calls[i].text.join("____");
        if(card.numResponses == 1){
          rdeck.calls.push(card);
        }
      }
      if(rdeck.calls.length == 0){
        self.disnode.service.SendMessage("Deck ID: `" + id + "` **Is not compatable with Cards Against Discord since it has 0 Black cards**", data.msg);
        return;
      }
      if(rdeck.responses.length == 0){
        self.disnode.service.SendMessage("Deck ID: `" + id + "` **Is not compatable with Cards Against Discord since it has 0 White cards**", data.msg);
        return;
      }
      console.log("[CAD -" + self.getDateTime() + "] Found and populated a deck for CardCast ID: " + id);
      game.decks.push(rdeck);
      self.disnode.service.SendMessage("Deck ID: `" + id + "` Was Added use `!cah deck list` to get a list of active decks", data.msg);
      return true;
    }).catch(function(error) {
      self.disnode.service.SendMessage("I had trouble contacting the API Server. Please try again!\n Reason: " + error, data.msg);
      console.log("[CAD -" + self.getDateTime() + "] CardCast Request Error: " + error);
      return false;
    });
  }
  getDateTime() {
    var date = new Date();
    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;
    return hour + ":" + min + ":" + sec + " :: " + month + "/" + day + "/" + year;
  }
}
module.exports = cahGame;
