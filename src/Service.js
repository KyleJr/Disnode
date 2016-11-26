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
    self.connected = false;

    if (self.disnode.config.services) {
      console.log(colors.grey("[Service-"+self.name+"]" ) + " Loaded!".green);
        self.config = self.disnode.config.services[self.name];
    }

  }

  Connect(){
    console.log(colors.grey("[Service-"+this.name+"]" ) + " Connecting!".cyan);
    this.connected = true;
  }

  Disconnect(){
    console.log(colors.grey("[Manager-"+this.name+"]" ) + " Disconnect!".yellow);
    this.connected = false;
  }


}

module.exports = Service;
