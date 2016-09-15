const EventEmitter = require("events");
const colors = require('colors');

class Service extends EventEmitter{
  constructor(pramas){
    super(pramas);
    var self = this;
    self.name = pramas.name;
    self.disnode = pramas.disnode;
    self.dispatcher = pramas.dispatcher;
    self.defaultConfig = {};

    if (self.disnode.config.services) {
      console.log(colors.grey("[Service-"+self.name+"]" ) + " Loaded!".green);
        self.config = self.disnode.config.services[self.name];
    }

  }

  Connect(){
    console.log(colors.grey("[Service-"+this.name+"]" ) + " Connecting!".cyan);
  }

  OnInit(){
    this.emit("Service_OnInit");
  }

  OnConnected(){
    this.emit("Service_OnConnected", this);
    console.log(colors.grey("[Service-"+this.name+"]" ) + " Connected!".green);
  }
  OnMessage(msgObject){
    this.emit("Service_OnMessage", msgObject);
  }
  SendMessage(data){

  }
}

module.exports = Service;
