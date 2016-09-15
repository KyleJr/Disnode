const Service = require("../Service.js");
const tmi = require("tmi.js");
class TwitchService extends Service {
    constructor(pramas) {
        super(pramas);
        this.defaultConfig = {
            user: "",
            auth: "",
            channels: ["#victoryforphil"]
        };

        this.client = {};
    }
    Connect() {
        super.Connect();
        var self = this;

        var ircoptions = {
            options: {
                debug: true
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
                    break;
                case "whisper":
                    break;
                default:
                    break;
            }
        });

    }


    OnMessage(channel,message,user) {
      var self = this;
        var convertedPacket = {
            msg: message,
            sender: user.username,
            channel: channel,
            senderObj: user,
            type: "TwitchService"
        };
        self.dispatcher.OnMessage(convertedPacket);
    }

    SendMessage(msg, chan) {
        if (!chan) {
            return;
        }
        if (!msg) {
            return;
        }

        this.client.say(chan, msg);
    }

}
module.exports = TwitchService;
