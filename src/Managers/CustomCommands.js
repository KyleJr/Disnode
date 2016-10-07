const Manager = require("../Manager.js");
const Discord = require("discord.js");
class CustomCommands extends Manager {
    constructor(pramas) {
        super(pramas);
        console.log("Loaded!");
        this.defaultConfig = {
          commands : [
            {
              command: "addCommand",
              event: "CC_ADD_COMMAND",
              response: "Added Command! [Command]"
            }
          ],
        };

        this.disnode.command.on("Command_CC_ADD_COMMAND", this.addNewCommand)
    }

    addNewCommand(data){
      var command = data.params[0];
      var response = data.params[1];

      if(command && response){
        var newCommand = {
          command : command,
          response: response
        };
        this.disnode.config.commands.push(newCommand);
        this.disnode.saveConfig();
        this.disnode.loadCommands();
      }
    }

    SayCommand(data){

    }


}
module.exports = CustomCommands;
