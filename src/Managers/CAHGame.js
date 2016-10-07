const Manager = require("../Manager.js");
const Discord = require("discord.js");
class CAHGame extends Manager {
    constructor(pramas) {
        super(pramas);

        console.log("Loaded!");
        this.defaultConfig = {
          commands : [
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

        this.disnode.command.on("Command_CAH_Start-Game", this.newGame)
        this.disnode.command.on("Command_CAH_Join-Game", this.joinGame)
        this.disnode.command.on("Command_CAH_Get-Players", this.getPlayers)
    }

    joinGame(data){
      var self = this;
      var player = data.msg.sender;
      var service = data.msg.type;
      var newPlayer = {
        name: player,
        service: service
      }
      if(!this.players){
        this.players = [];
      }
      this.players.push(newPlayer);
      this.disnode.service.SendMessage(player + " joined! There are: " +this.players.length+" players in!", data.msg);
      self.disnode.service.SendWhisper(newPlayer.name, "Welcome " + newPlayer.name +"!", {type: newPlayer.service})


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
      var self = this;

      for (var i = 0; i < self.players.length; i++) {

        self.disnode.service.SendWhisper(this.players[i].name, "Starting!", {type: self.players[i].service})
      }
    }


}
module.exports = CAHGame;
