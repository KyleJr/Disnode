const Manager = require("../Manager.js");
const Discord = require("discord.js");
const shortid = require('shortid');
class CAHGame extends Manager {
    constructor(pramas) {
        super(pramas);

        console.log("Loaded!");
        this.defaultConfig = {
          commands : [
            {
              command: "new-game",
              event: "CAH_New-Game"
            },
            {
              command: "start-game",
              event: "CAH_Start-Game"
            },
            {
              command: "join-game",
              event: "CAH_Join-Game"
            }
            ,
            {
              command: "get-players",
              event: "CAH_Get-Players"
            }
            ,
            {
              command: "leave-game",
              event: "CAH_Leave-Game"
            }
          ],
        };

        this.startGame = this.startGame.bind(this);
        this.joinGame = this.joinGame.bind(this);
        this.getPlayers = this.getPlayers.bind(this);
        this.newGame = this.newGame.bind(this);
        this.LeaveGame = this.LeaveGame.bind(this);
        this.DealCards = this.DealCards.bind(this);

        this.disnode.command.on("Command_CAH_Start-Game", this.startGame)
        this.disnode.command.on("Command_CAH_New-Game", this.newGame)
        this.disnode.command.on("Command_CAH_Join-Game", this.joinGame)
        this.disnode.command.on("Command_CAH_Get-Players", this.getPlayers);
        this.disnode.command.on("Command_CAH_Leave-Game", this.LeaveGame);

        this.games = [];
        this.players = [];
        this.allCards =  require('cah-cards');
        this.blackCard =  require('cah-cards/pick1');
        this.whiteCards =  require('cah-cards/answers');

    }
    joinGame(data){
      var self = this;

      var service = data.msg.type;
      var newPlayer = {
        name:  data.msg.username,
        id: data.msg.userId,
        sender: data.msg.sender,
        service: service
      }

      var code = "";

      if(this.GetPlayerByID(data.msg.userId)){
        this.disnode.service.SendMessage("Already joined! Please `"+this.disnode.command.prefix + "leave-game`", data.msg);
        return;
      }
      if(data.params[0]){
        code = data.params[0];
      }else{
        this.disnode.service.SendMessage("Please enter a code!", data.msg);
        return;
      }

      var foundGame = self.GetGameByCode(code);

      if(!foundGame){
        this.disnode.service.SendMessage("No Game with code: " + code, data.msg);
        return;
      }

      newPlayer.currentGame = code;
      self.players.push(newPlayer);      //Update All Players
      foundGame.players.push(newPlayer); //Update Players in Game

      this.disnode.service.SendMessage(newPlayer.name + " joined! There are: " +foundGame.players.length+" players in!", data.msg);
      self.disnode.service.SendWhisper(newPlayer.sender, "Welcome " + newPlayer.name +"!", {type: newPlayer.service});
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
          console.log(msg);
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
        players: [],
        hasStarted: false,
        allowJoinInProgress: true,
        round: 0,
        currentBlackCard: {},
        currentWhiteCards: []
      };
      this.games.push(newGame);
      console.log(this.games);
      this.disnode.service.SendMessage("New Game! Code: " + id, data.msg);
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

          this.disnode.service.SendMessage("You are not host!", data.msg);
          return;
        }
        for (var i = 0; i < game.players.length; i++) {

          self.disnode.service.SendWhisper(game.players[i].sender, "Starting!", {type: game.players[i].service})
        }
        self.DealCards(game);
      }

    }
    LeaveGame(data){
      var self = this;
      console.log("leaving");
      var player = self.GetPlayerByID(data.msg.userId);
      if(player && player.currentGame ){
        var game = self.GetGameByCode(player.currentGame);
        if(!game){
          return;
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
        this.disnode.service.SendMessage(player.name + " left! There are: " + game.players.length + " players in the game!", data.msg);
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

    //// ================ GAME LOGIC ======================== ///
    //// ================ GAME LOGIC ======================== ///
    //// ================ GAME LOGIC ======================== ///
    //// ================ GAME LOGIC ======================== ///

    DealCards(game){
      var self = this;
      var players = game.players;

      for (var x = 0; x < players.length; x++) {
        var player = players[x];
        player.cards = [];
        self.disnode.service.SendWhisper(player.sender, "Your Deck is: ", {type: player.service})
        var msg = "";
        for (var i = 0; i < 10; i++) {
          var cardToAdd = self.drawCard(player);

          msg += " [" + i + " - " + cardToAdd.text + "]\n"
        }
        console.log('sending: ' + player.name );
        self.disnode.service.SendWhisper(player.sender, msg, {type: player.service})
      }
    }
    //This generates a random White card then adds it to the players hand (returns the white card added to hand)
    drawCard(player){
      var obj_keys = Object.keys(self.whiteCards);
      var ran_key = obj_keys[Math.floor(Math.random() *obj_keys.length)];
      var cardToAdd = self.whiteCards[ran_key];
      player.cards.push(cardToAdd);
      return cardToAdd;
    }
    //This removes the card in the given index
    removeCardFromHand(player,index){
      if(index < 0 || index > 9) return;
      player.cards.splice(index,1);
    }
}
module.exports = CAHGame;
