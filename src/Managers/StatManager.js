const Manager = require("../Manager.js");
class StatManager extends Manager {
    constructor(pramas) {
        super(pramas);
        console.log("Loaded!");
        this.defaultConfig = {
          prefix: "stats",
          commands : [
            {
              command: "servers",
              event: "servers"
            }
          ],
        };

        this.disnode.command.on("Command_stats_servers", this.server)
    }

    server(data){
      var service = this.disnode.service.GetService("DisnodeService");
        if(service){
          this.disnode.service.SendMessage("Cant find DisnodeService", data.msg);
        }else{
          this.disnode.service.SendMessage("This bot is in: " + this.disnode.service.GetService("DisnodeService").client.guilds.length + " servers!", data.msg);
        }
    }





}
module.exports = StatManager;
