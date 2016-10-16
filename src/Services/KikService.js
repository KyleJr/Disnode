const Service = require("../Service.js");
const http = require('http');
const Bot = require('@kikinteractive/kik');
const ngrok = require('ngrok');
class KikService extends Service {
    constructor(pramas) {
        super(pramas);
        this.defaultConfig = {
            user: "",
            auth: ""
        };
    }
    Connect() {
        super.Connect();
        var self = this;

        ngrok.connect(4000, function (err, url) {
          console.log("[KikService] NGROK Connected!");
          self.bot = new Bot({
              username: self.config.user,
              apiKey: self.config.auth,
              baseUrl: url
          });
          self.bot.updateBotConfiguration();
          self.server = http.createServer(self.bot.incoming()).listen(process.env.PORT || 4000);
          self.dispatcher.OnServiceConnected(self);

          self.bot.onTextMessage((message) => {
            console.log(message);
            var convertedPacket = {
                msg: message.body,
                sender: message.from,
                channel: message.from,
                object: {
                    message: message
                },
                type: "KikService"
            };
            self.dispatcher.OnMessage(convertedPacket);
            self.dispatcher.OnWhisper(convertedPacket);
          });

        });

    }
    SendWhisper(user,msg,data){
      this.bot.send(Bot.Message.text(msg), user);
    }
    SendMessage(msg, data) {
      msg = msg.replace(/[*]/g, '');
      msg = msg.replace(/[_]/g, '');
      this.bot.send(Bot.Message.text(msg), data.channel,data.object.message.chatId);
    }

}
module.exports = KikService;
