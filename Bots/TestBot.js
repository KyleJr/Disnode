var DisnodeBot = require("../src/Disnode.js"); //defines DisnodeBot
// above is testing require use require("disnode"); instead if you installed via NPM
var testBot = new DisnodeBot("./TestBotConfig.json"); //Defines the testBot in the "" is where your discord bot oauth token would go

var OnLoad = function(){
    testBot.service.AddService("KikService", "KikService");
  testBot.service.AddService("TwitchService", "TwitchService");
  testBot.service.AddService("DiscordService", "DiscordService");

  testBot.command.on("RawCommand_test",function(commandData){
      testBot.service.SendMessage("Works!",commandData.msg);
  });

  testBot.command.on("RawCommand_fire",function(commandData){
      testBot.service.SendMessage("FIREE " + commandData.params[0],commandData.msg);
  });

  testBot.service.ConnectAll();
}

testBot.loadConfig(OnLoad);

exports.Start = function () {
  testBot.startBot();
};
