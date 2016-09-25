const EventEmitter = require("events");
const colors = require('colors');

class Manager extends EventEmitter{
  constructor(pramas){
    super(pramas);
    var self = this;
    self.name = pramas.name;
    self.disnode = pramas.disnode;
    self.dispatcher = pramas.dispatcher;
    self.defaultConfig = {};
    self.config = {};
    if (self.disnode.config.managers) {
      console.log(colors.grey("[Manager-"+self.name+"]" ) + " Loaded!".green);
      self.config = self.disnode.config.managers[self.name];
    }

  }

  Connect(){
    console.log(colors.grey("[Manager-"+this.name+"]" ) + " Connecting!".cyan);
  }

}

module.exports = Manager;
