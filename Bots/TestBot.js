var DisnodeBot = require("../src/Disnode.js"); //defines DisnodeBot
// above is testing require use require("disnode"); instead if you installed via NPM
var testBot = new DisnodeBot("./Bots/TestBotConfig.json"); //Defines the testBot in the "" is where your discord bot oauth token would go

var OnLoad = function(){
  testBot.service.AddService("TwitchService", "TwitchService");
  testBot.service.AddService("DiscordService", "DiscordService")
  testBot.service.AddService("KikService", "KikService");
  testBot.manager.AddManager("WeatherManager", "WeatherManager");
  testBot.manager.AddManager("CustomCommands", "CustomCommands");
  testBot.manager.AddManager("MusicManager","MusicManager");
  testBot.manager.AddManager("ListManager","ListManager");
  testBot.manager.AddManager("CAHGame", "CAHGame");
  testBot.manager.AddManager("DisnodeManager", "DisnodeManager");
  testBot.command.on("RawCommand_dc",function(commandData){
    var discord = testBot.service.GetService("DiscordService");
    testBot.service.SendMessage("Disconnecting!",commandData.msg);
    discord.client.destroy();
  });

  testBot.service.ConnectAll();
}

testBot.loadConfig(OnLoad);

exports.Start = function () {
  testBot.startBot();
};
