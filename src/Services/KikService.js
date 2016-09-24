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
          });

        });

    }

    SendMessage(msg, data) {
      this.bot.send(Bot.Message.text(msg), data.channel);
    }

}
module.exports = KikService;
