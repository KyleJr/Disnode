const EventEmitter = require('events');

class CommandDispatcher extends EventEmitter{
  constructor(disnode){
    super(disnode);
    this.disnode = disnode;
    this.prefix = this.disnode.config.prefix || "!";
    this.commands = [];

    console.log("[CommandDispatcher]".grey + " Loaded!".green);
  }

  SetEvents(){
    var self = this;
    if(self.disnode.service){
      self.disnode.service.on("Service_OnMessage", function(msgObject){

        if(!self.disnode.config.mention){
          self.ParseMessage(msgObject, true);
        }
      });

      self.disnode.service.on("Service_OnMention", function(msgObject){

        if(self.disnode.config.mention){

          self.ParseMessage(msgObject, false);
        }
      });
    }
  }
  AddCommands(commands){
    var self = this;
    for (var i = 0; i < commands.length; i++) {
      var toAdd = commands[i];

      if(!self.GetCommand(toAdd.command)){
        console.log("[CommandDispatcher]".grey + " Loaded Command: ".green + toAdd.command);
        self.commands.push(commands[i]);
      }else{
        //self.GetCommand(toAdd.command) = toAdd;
        //console.log("[CommandDispatcher]".grey + " Updated Command: ".green + toAdd.command);
      }
    }
  }

  GetCommand(command){
    var found;
    var self = this;
    for (var i = 0; i < this.commands.length; i++) {

      if(this.commands[i].command.toLowerCase() === command){
          found = this.commands[i];
      }
    }
    return found;
  }

  GetManagerPrefix(prefix){
    var found = false;
    var self = this;
    var managers = self.disnode.manager.managers;
    for (var i = 0; i < managers.length; i++) {
      var manager = managers[i];

      if(manager.config.prefix){
        if(manager.config.prefix.toLowerCase() === prefix){
          found = true;
          return true;
        }
      }

    }
    return found;
  }

  ParseMessage(msgObj,fullCommand){
    var self = this;
    var msg = msgObj.msg;
    var firstLetter = msg.substring(0,1);
    console.log("Parsing: " + msg);
    if(fullCommand && firstLetter != self.prefix){
      return;
    }

    var command = "";
    var prefixLength = "";

    if(fullCommand){
      prefixLength = self.prefix.length;
    }
    if(!fullCommand){
      msg = msg.substring(msg.indexOf(" ") + 1, msg.length);
    }


    var firstWord = "";
    var secondWord = "";
    //Gets Command
    if(CheckSpace(msg)){
      var firstSpace = msg.indexOf(" ");
      var secoundSpace = msg.indexOf(" ", firstSpace + 1);

      firstWord = msg.substring(prefixLength, firstSpace);

      if(secoundSpace != -1){
          secondWord = msg.substring(firstSpace + 1,secoundSpace);
      }else{
          secondWord = msg.substring(firstSpace + 1);
      }

      console.log(firstWord + " + " + secondWord);
    }else{
      firstWord = msg.substring(prefixLength);
    }

    var prefix;
    if(self.GetManagerPrefix(firstWord)){
      command = secondWord;
      prefix = firstWord;
      console.log("PREFIX!");
    }else{
      command = firstWord;
    }


    command = command.toLowerCase();
    console.log(command);



    if(self.GetCommand(command)){
      var cmbObject = self.GetCommand(command);

      var returnObj = {};
      returnObj.params = GetParams(msg);
      returnObj.params.splice(0,1);
      returnObj.command = cmbObject;
      returnObj.msg = msgObj;
      console.log("FOUND!");
      if(cmbObject.response){
        if(self.disnode.service){
          self.disnode.service.SendMessage(cmbObject.response,msgObj);
        }
      }
      if(prefix){
        self.emit("Command_"+prefix+"_"+cmbObject.event, returnObj);
        console.log("Emitting: " + "Command_"+prefix+"_"+cmbObject.event);
      }else{
        self.emit("Command_"+cmbObject.event, returnObj);
          console.log("Emitting (No Prefix): " + "Command_"+cmbObject.event);
      }
    }else{
      var returnObj = {};
      returnObj.params = GetParams(msg);
      returnObj.command = command;
      returnObj.msg = msgObj;
      if(prefix){
        self.emit("Command_"+prefix, returnObj);
        console.log("Emitting (No Command): " + "Command_"+prefix);
      }else{
        self.emit("RawCommand_"+command, returnObj);
        console.log("Emitting: " + "RawCommand_"+command);
      }

    }


  }

}


// Helper Functions

function CheckSpace(toCheck){
  if(toCheck.indexOf(" ") != -1){
    return true;
  }
  else{
    return false;
  }
}
function GetParams(raw){
  var parms = [];
  var lastSpace = -1;
  var end = false;
  while(!end){


    var BeginSpace = raw.indexOf(" ", lastSpace);
    var EndSpace = -1;
    if(BeginSpace != -1){
       EndSpace = raw.indexOf(" ", BeginSpace + 1);


       if(EndSpace == -1){
         EndSpace = raw.length;
         end = true;
       }

       var param = raw.substring(BeginSpace + 1, EndSpace);
       var containsQuoteIndex = param.indexOf('"');



       var BeginQuote = -1;
       var EndQuote = -1;
       if(containsQuoteIndex != -1){
         BeginQuote = raw.indexOf('"', BeginSpace);


         EndQuote = raw.indexOf('"', BeginQuote + 1);

         if(EndQuote != -1){
           BeginSpace = BeginQuote;
           EndSpace = EndQuote;
           param = raw.substring(BeginSpace + 1, EndSpace);


           console.log(" ");
         }
       }

       lastSpace = EndSpace;

       if(param != ""){
         parms.push(param);
       }else{

       }



    }else{
      end = true;
    }
  }
  return parms;
}

module.exports = CommandDispatcher;
