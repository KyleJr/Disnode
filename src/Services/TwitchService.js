const Service = require("../Service.js");
const tmi = require("tmi.js");

var MsgQue = [];


class TwitchService extends Service {
    constructor(pramas) {
        super(pramas);
        this.defaultConfig = {
            user: "",
            auth: "",
            channels: ["#victoryforphil"]
        };

        this.client = {};
        var self = this;
        setInterval(function () {
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

      msg = msg.replace(/[*]/g, ' ');
      var newLines = getIndicesOf("\n", msg,false);

      if(newLines.length == 0){
        MsgQue.push({msg: msg, channel: data.channel});
      }else{
        var lastStart;
        for (var i = 0; i < newLines.length; i++) {
          var startIndex = newLines[i];
          var endIndex = newLines[i+1] || newLines[newLines.length-1];
          MsgQue.push({msg: msg.substring(startIndex, endIndex), channel: data.channel});

        }
      }


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

function getIndicesOf(searchStr, str, caseSensitive) {
    var searchStrLen = searchStr.length;
    if (searchStrLen == 0) {
        return [];
    }
    var startIndex = 0, index, indices = [];
    if (!caseSensitive) {
        str = str.toLowerCase();
        searchStr = searchStr.toLowerCase();
    }
    while ((index = str.indexOf(searchStr, startIndex)) > -1) {
        indices.push(index);
        startIndex = index + searchStrLen;
    }
    return indices;
}
module.exports = TwitchService;
