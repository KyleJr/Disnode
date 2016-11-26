const EventEmitter = require("events");
const RunMan = require('runman');
const colors = require('colors');
class ServiceDispatcher extends EventEmitter {
    constructor(disnode) {
        super();
        this.disnode = disnode;
        this.services = [];
        console.log("[ServiceDispatcher] Initzialized!");
    }

    AddService(name, filename, options) {
        console.log("[ServiceDispatcher] Adding Service:  " + filename);
        var self = this;

        var runManOptions = {
            parent: self,
            localPath: __dirname + "/Services/",
            array: true,
            arrayName: "services",
            params: {
                name: name,
                dispatcher: self,
                disnode: self.disnode
            }
        };

        RunMan.load(name, filename, runManOptions, function(err, res) {

            if (err) {
                console.error(err);
                return;
            }

            //HACK
            if (!self.disnode.config.services) {
                self.disnode.config.services = {};
            }

            if (!self.disnode.config.services[name]) {

                self.AddServiceDefaultConfig(name, res.defaultConfig);
            }

        });
    }

    AddServiceDefaultConfig(name, config) {
        var self = this;
        console.log("[ServiceDispatcher]".grey + " Loading Defaults for Service: ".cyan + colors.cyan(name));
        if (!self.disnode.config.services) {
            self.disnode.config.services = {};
        }

        self.disnode.config.services[name] = config;
        self.disnode.saveConfig();
    }

    GetService(name) {
        var found;
        for (var i = 0; i < this.services.length; i++) {
            if (this.services[i].name == name) {
                found = this.services[i];
            }
        }
        return found;
    }


    SendMessage(msg, data){
      this.GetService(data.type).SendMessage(msg, data);
    }

    SendWhisper(user, msg, data){
      this.GetService(data.type).SendWhisper(user, msg, data);
    }

    ConnectAll(){

      console.log('Connecting to all');
      for (var i = 0; i < this.services.length; i++) {

        if(this.services[i].connected == false){
          this.services[i].Connect();
        }
      }
    }

    Connect(name){
      var service =  this.GetService(name);
      if(!service){
        console.log("Cant find service: " + name);
        return;
      }
      service.Connect();
    }
    DisconnectAll(){
      for (var i = 0; i < this.services.length; i++) {
        if(this.services[i].connected == true){
          this.services[i].Connect();
        }
      }
    }

    Disconnect(name){

      var service = this.GetService(name);
      if(!service){
        console.log("Cant find service: " + name);
        return;
      }
      service.Disconnect();

    }
    OnServiceConnected(service) {
      console.log(colors.grey("[Service-"+service.name+"]" ) + " Connected!".green);
        this.emit("Service_OnConnected", service);
    }

    OnServiceError(serviceError) {
        this.emit("Service_OnError", serviceError);
    }

    OnMessage(msgObj) {
        this.emit("Service_OnMessage", msgObj);
    }

    OnMention(msgObj) {

        this.emit("Service_OnMention", msgObj);
    }

    OnWhisper(msgObj) {
        this.emit("Service_OnWhisper", msgObj);
    }
}
module.exports = ServiceDispatcher;
