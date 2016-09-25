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
              event: "CC_ADD_COMMAND"
            }
          ]
        };

        this.disnode.command.on("Command_CC_ADD_COMMAND", function(data){
          this.disnode.service.SendMessage("adding command.." , data.msg)
        })
    }



}
module.exports = CustomCommands;
