const Service = require("../Service.js");
const tmi = require("tmi.js");
const Parser = require('../Parser.js');
var MsgQue = [];


class TwitchService extends Service {
    constructor(pramas) {
        super(pramas);
        this.defaultConfig = {
            user: "",
            auth: "",
            channels: ["#victoryforphil"]
        };

        this.parseSettings = {
          newLine: false,
        }
        this.client = {};
        var self = this;
        this.sendTimer = setInterval(function () {
          self.UpdateMessage()

        }, 2000);
    }
    Connect() {
        super.Connect();
        var self = this;
        if(!self.config){
          return;
        }
        if(self.config.user == "" || self.config.auth == ""){
          return;
        }
        var ircoptions = {
            options: {
                debug: false
            },
            connection: {
                reconnect: true
            },
            identity: {
                username: self.config.user,
                password: self.config.auth
            },
            channels: this.config.channels
        };
        self.client = new tmi.client(ircoptions);
        self.client.connect();

        self.client.on("connected", function() {
            self.dispatcher.OnServiceConnected(self);
        });

        self.client.on("message", function(channel, userstate, message, isSelf) {
            if (isSelf) return;

            switch (userstate["message-type"]) {
                case "action":
                    break;
                case "chat":
                    self.OnMessage(channel, message, userstate);

                    var isMentioned = message.includes("@" + self.config.user.toLowerCase());
                    if (isMentioned) {
                        var convertedPacket = {
                            msg: message,
                            username: userstate['display-name'],
                            userId: userstate['display-name'],
                            sender: userstate,
                            channel: channel,
                            object: {
                                message: message,
                                channel: channel,
                                user: userstate
                            },
                            type: "TwitchService"
                        };
                        console.log("Mention");
                        self.dispatcher.OnMention(convertedPacket);
                    }
                    break;
                case "whisper":
                    var convertedPacket = {
                        msg: message,
                        username: userstate['display-name'],
                        userId: userstate['display-name'],
                        sender: userstate,
                        channel: channel,
                        username: userstate,
                        object: {
                            message: message,
                            channel: channel,
                            user: userstate
                        },
                        type: "TwitchService"
                    };

                    self.dispatcher.OnWhisper(convertedPacket);
                    break;
                default:
                    break;
            }
        });

    }
    Disconnect(){
      clearInterval(this.sendTimer);
      super.Disconnect();
    }

    OnMessage(channel, message, user) {
        var self = this;
        var convertedPacket = {
            msg: message,
            username: user['display-name'],
            userId: user['user-id'],
            sender: user['display-name'],
            channel: channel,
            object: {
                message: message,
                channel: channel,
                user: user
            },
            type: "TwitchService"
        };
        console.log(convertedPacket);
        self.dispatcher.OnMessage(convertedPacket);
    }

    SendMessage(msg, data) {
      ///var re = new RegExp("/**", 'g');


      msg = Parser.ParseString(msg);
      console.log(msg);




    }

    SendWhisper(user, msg){
      this.client.whisper(user, msg);
    }

    UpdateMessage(){
      if(MsgQue.length != 0){
        this.client.say(MsgQue[0].channel, MsgQue[0].msg);
        MsgQue.shift();
      }
    }


}


module.exports = TwitchService;