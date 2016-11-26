const Manager = require("../Manager.js");
class ListManager extends Manager {
    constructor(pramas) {
        super(pramas);
        console.log("Loaded!");
        this.defaultConfig = {
          prefix: "list",
          commands : [
            {
              command: "managers",
              event: "managers"
            },
            {
              command: "services",
              event: "services"
            },
            {
              command: "commands",
              event: "commands"
            }
          ],
        };

        this.disnode.command.on("Command_list_managers", this.listManagers);
        this.disnode.command.on("Command_list_commands", this.listCommands)
        this.disnode.command.on("Command_list_services", this.listServices)
    }

    listManagers(data){
      var toPrint = "Managers Currently Installed: \n";
      for (var i = 0; i < this.disnode.manager.managers.length; i++) {
        var manager = this.disnode.manager.managers[i];
        toPrint += " - " + manager.name + " [Prefix: "+manager.config.prefix+"]\n";
      }

      this.disnode.service.SendMessage(toPrint, data.msg)
    }

    listServices(data){
      var toPrint = "Services Currently Installed: \n";
      for (var i = 0; i < this.disnode.service.services.length; i++) {
        var service = this.disnode.service.services[i];
        toPrint += " - " + service.name + " [Connected: "+service.connected+"]\n";
      }

      this.disnode.service.SendMessage(toPrint, data.msg)
    }

    listCommands(data){

      var commandsToPrint;
      if(data.params[0])
      {
        console.log(this.disnode.manager.GetManagerByPrefix(data.params[0]));
        if(!this.disnode.manager.GetManagerByPrefix(data.params[0])){
          return;
        }
        if(!this.disnode.manager.GetManagerByPrefix(data.params[0])){
          return;
        }
        commandsToPrint = this.disnode.manager.GetManagerByPrefix(data.params[0]).commands;
      }else{
        commandsToPrint = this.disnode.config.commands;
      }

      var toPrint = "Commands: \n";
      for (var i = 0; i < commandsToPrint.length; i++) {
          console.log(commandsToPrint[i].command);
        toPrint += " - " + this.disnode.command.prefix + commandsToPrint[i].command +"\n";
      }

      this.disnode.service.SendMessage(toPrint, data.msg)
    }


}
module.exports = ListManager;
