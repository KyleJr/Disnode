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
            }
          ],
        };

        this.disnode.command.on("Command_list_managers", this.listManagers)
    }

    listManagers(data){
      var toPrint = "Managers Currently Installed: \n";
      for (var i = 0; i < this.disnode.manager.managers.length; i++) {
        var manager = this.disnode.manager.managers[i];
        toPrint += " - " + manager.name + " [Prefix: "+manager.config.prefix+"]\n";
      }

      this.disnode.service.SendMessage(toPrint, data.msg)
    }


}
module.exports = ListManager;
