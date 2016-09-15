var DisnodeBot = require("../src/Disnode.js"); //defines DisnodeBot
// above is testing require use require("disnode"); instead if you installed via NPM
var testBot = new DisnodeBot("./TestBotConfig.json"); //Defines the testBot in the "" is where your discord bot oauth token would go


var OnLoad = function(){
  testBot.service.AddService("TwitchService", "TwitchService");

  testBot.service.on("Service_OnConnected",function(service){
    console.log(service.name + " Connected!");
  })

  testBot.command.on("RawCommand_test",function(objects){
      console.log(objects);
      testBot.service.SendMessage(objects.msg.type, "Works!", objects.msg.channel)
  })
  testBot.service.ConnectAll();
}

testBot.loadConfig(OnLoad);

exports.Start = function () {
  testBot.startBot();
};
