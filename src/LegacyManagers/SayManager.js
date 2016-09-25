"use strict"
const colors = require('colors');
class SayManager{
  constructor(options){
    this.options = options;


    this.defaultConfig = {
      errEnterCommand: "Please Enter a Command (First Parameter)",
      errEnterSay: "Please Enter a Say (Secound Parameter)",
      resAddedCommand: "Added Command [Command]",
      commands:[
        {
          "cmd": "addSay",
          "context": "SayManager",
          "run": "cmdAddSay",
          "desc": "Create a new say command!",
          "usage": "addSay [command] [response]"
        },
      ]
    };

    this.config = this.options.disnode.config.SayManager;
  }
  cmdAddSay(parsedMsg){
    var self = this;
    var command = parsedMsg.params[0];
    var say = parsedMsg.params[1];
    if(!command){
      self.options.disnode.bot.sendMessage(parsedMsg.msg.channel, self.config.errEnterCommand );
    }
    if(!say){
      self.options.disnode.bot.sendMessage(parsedMsg.msg.channel, self.config.errEnterSay );
    }
    if(command && say){
      self.addSayCommand(command, say);
      var shortcuts = [{
        shortcut: "[Command]",
        data: say
      }];
      self.options.disnode.sendResponse(parsedMsg,"Added Command [Command]",
      {
        timeout: 2000,
        shortcuts: shortcuts,
        parse: true,
        mention: true
      });
    }
  }
  addSayCommand(command, say){
    var self = this;
      var config = self.options.disnode.config;

      var newSayComand = {
        cmd: command,
        run: "cmdSay",
        context: "SayManager",
        desc: "Prints Entered Command",
        usage: command,
        params: {
          sayText: say
        }
      }

      config.commands.push(newSayComand);
      self.options.disnode.saveConfig();
      self.options.disnode.loadConfig(function(){
        self.config = self.options.disnode.config.SayManager;
        self.options.disnode.addDefaultManagerCommands("SayManager", config.commands);
      });
      console.log("[SayManager]".grey + " New Say Command Added!".cyan);


  }

  cmdSay(parsedMsg, params){
    var self = this;


    var printText = self.options.disnode.parseString(params.sayText,parsedMsg);
    self.options.disnode.bot.sendMessage(parsedMsg.msg.channel, printText);
  }
}

function GetMsgOffCommand(cmdName, list){
  var found = null;
  for(var i=0;i<list.length;i++)
  {
    if(list[i].cmd == cmdName){
      found = list[i];
    }
  }

  return found;
}

module.exports = SayManager;
