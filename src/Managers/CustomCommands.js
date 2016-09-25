const Manager = require("../Manager.js");
const Discord = require("discord.js");
class CustomCommands extends Manager {
    constructor(pramas) {
        super(pramas);
        console.log("Loaded!");
        this.defaultConfig = {

        };
    }

}
module.exports = CustomCommands;
