const EventEmitter = require('events');

class CommandDispatcher extends EventEmitter{
  constructor(disnode){
    super();
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

      if(!GetCommand(toAdd.command)){
        console.log("[CommandDispatcher]".grey + " Loaded Command: ".green + toAdd.command);
        self.commands.push(commands);
      }else{
        GetCommand(toAdd.command) = toAdd;
        console.log("[CommandDispatcher]".grey + " Updated Command: ".green + toAdd.command);
      }
    }
  }

  GetCommand(command){
    var found;
    for (var i = 0; i < this.commands.length; i++) {
      if(this.commands[i].command == command){
              found = this.commands[i];
      }
    }
    return found;
  }

  ParseMessage(msgObj,fullCommand){
    var self = this;
    var msg = msgObj.msg;
    var firstLetter = msg.substring(0,1);

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



    //Gets Command
    if(CheckSpace(msg)){
      command = msg.substring(prefixLength, msg.indexOf(" "));
    }else{
      command = msg.substring(prefixLength);
    }
    command = command.toLowerCase();
    console.log(command);
    if(self.GetCommand(command)){
      var cmbObject = GetCommand(command);

      var returnObj = {};
      returnObj.params = GetParams(msg);
      returnObj.command = cmbObject;
      returnObj.raw = msg;

      self.emit("Command_"+command, returnObj);

    }else{
      var returnObj = {};
      returnObj.params = GetParams(msg);
      returnObj.command = command;
      returnObj.msg = msgObj;

      self.emit("RawCommand_"+command, returnObj);
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
