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
                        sender: userstate,
                        channel: channel,
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
            sender: user['display-name'],
            channel: channel,
            object: {
                message: message,
                channel: channel,
                user: user
            },
            type: "TwitchService"
        };
        self.dispatcher.OnMessage(convertedPacket);
    }

    SendMessage(msg, data) {
        this.client.say(data.channel, msg);
    }

    SendWhisper(user, msg){
      this.client.whisper(user, msg);
    }


}
module.exports = TwitchService;
