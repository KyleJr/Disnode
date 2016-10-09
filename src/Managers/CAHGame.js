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
          ],
        };

        this.startGame = this.startGame.bind(this);
        this.joinGame = this.joinGame.bind(this);
        this.getPlayers = this.getPlayers.bind(this);
        this.newGame = this.newGame.bind(this);

        this.disnode.command.on("Command_CAH_Start-Game", this.startGame)
        this.disnode.command.on("Command_CAH_New-Game", this.newGame)
        this.disnode.command.on("Command_CAH_Join-Game", this.joinGame)
        this.disnode.command.on("Command_CAH_Get-Players", this.getPlayers);

        this.games = [];
        this.players = [];

    }
    joinGame(data){
      var self = this;
      //Test
      var player = data.msg.sender;
      var service = data.msg.type;
      var newPlayer = {
        name: player,
        service: service
      }

      var code = "";
      if(data.params[0]){
        code = data.params[0];
      }else{
        this.disnode.service.SendMessage("Please enter a code!", data.msg);
        return;
      }

      var foundGame;
      for (var i = 0; i < self.games.length; i++) {
        if(self.games[i].id === code){
          foundGame = self.games[i];
        }
      }

      if(!foundGame){
        this.disnode.service.SendMessage("No Game with code: " + code, data.msg);
        return;
      }

      foundGame.players.push(newPlayer);
      this.disnode.service.SendMessage(player + " joined! There are: " +foundGame.players.length+" players in!", data.msg);
      self.disnode.service.SendWhisper(newPlayer.name, "Welcome " + newPlayer.name +"!", {type: newPlayer.service});
    }

    getPlayers(data){
      console.log("get players");
      var self = this;
      var msg = "Current Players: \n";
      for (var i = 0; i < self.players.length; i++) {
        var curPlayer = self.players[i];
        console.log(msg);
        msg += curPlayer.name + " from " + curPlayer.service + '\n';

      }
      this.disnode.service.SendMessage(msg, data.msg);
    }

    newGame(data){
      var id = shortid.generate();
      var newGame = {
        id: id,
        host: 12312,
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
      for (var i = 0; i < self.players.length; i++) {

        self.disnode.service.SendWhisper(this.players[i].name, "Starting!", {type: self.players[i].service})
      }
    }
}
module.exports = CAHGame;
