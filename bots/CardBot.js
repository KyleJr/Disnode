var DisnodeBot = require("../src/Disnode.js"); //defines DisnodeBot
// above is testing require use require("disnode"); instead if you installed via NPM
var testBot = new DisnodeBot("./Bots/TestBotConfig.json"); //Defines the testBot in the "" is where your discord bot oauth token would go

var OnLoad = function(){
  testBot.startBot();
  testBot.service.AddService("DiscordService", "DiscordService")
  testBot.manager.AddManager("ListManager","ListManager");
  testBot.manager.AddManager("CAHGame", "CAHGame");
  testBot.manager.AddManager("StatManager", "StatManager");

  testBot.service.ConnectAll();
}

exports.Start = function () {
  testBot.loadConfig(OnLoad);
};
