var DisnodeBot = require("../src/Disnode.js"); //defines DisnodeBot
// above is testing require use require("disnode"); instead if you installed via NPM
var testBot = new DisnodeBot("./Bots/TestBotConfig.json"); //Defines the testBot in the "" is where your discord bot oauth token would go

var OnLoad = function(){
  //testBot.service.AddService("KikService", "KikService");
<<<<<<< Updated upstream
  testBot.service.AddService("TwitchService", "TwitchService");
  testBot.service.AddService("DiscordService", "DiscordService")
  //testBot.service.AddService("KikService", "KikService");
    testBot.manager.AddManager("WeatherManager", "WeatherManager");
  testBot.manager.AddManager("CustomCommands", "CustomCommands");
=======
  //testBot.service.AddService("TwitchService", "TwitchService");
  testBot.service.AddService("DiscordService", "DiscordService");

testBot.manager.AddManager("CustomCommands", "CustomCommands");
>>>>>>> Stashed changes
testBot.manager.AddManager("CAHGame", "CAHGame");
testBot.command.on("RawCommand_test",function(commandData){
      testBot.service.SendMessage("Works!",commandData.msg);
  });

  testBot.service.ConnectAll();
}

testBot.loadConfig(OnLoad);

exports.Start = function () {
  testBot.startBot();
};
