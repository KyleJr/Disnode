var DisnodeBot = require("../src/Disnode.js");
var testBot = new DisnodeBot("./bots/TestBotConfig.json");

var OnLoad = function(){
  testBot.startBot();
  testBot.service.AddService("DiscordService", "DiscordService")
  testBot.manager.AddManager("ListManager","ListManager");
  testBot.manager.AddManager("CasinoPlugin", "CasinoPlugin");
  testBot.manager.AddManager("DisnodeManager", "DisnodeManager");
  testBot.service.ConnectAll();
}

exports.Start = function () {
  testBot.loadConfig(OnLoad);
};
