const Service = require("../Service.js");
const Discord = require("discord.js");
class DiscordService extends Service {
    constructor(pramas) {
        super(pramas);

        this.defaultConfig = {
            auth: "",
        };
        this.client = new Discord.Client();


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
        this.client.login(self.config.auth);
        this.client.on("ready", function() {
            self.dispatcher.OnServiceConnected(self);;
        });
        this.client.on('message', message => {
          var convertedPacket = {
            msg: message.content,
            sender: message.author,
            channel: message.channel,
            object: message,
            type: "DiscordService"
          };
          self.dispatcher.OnMessage(convertedPacket);

          if(message.isMentioned(self.client.user)){

            self.dispatcher.OnMention(convertedPacket);
          }
        });
        this.client.on('error', (error) => {
            console.log(error);
        });

    }

    OnConnected() {
        super.OnConnected();
        var self = this;

    }

    SendMessage(msg, data) {
      data.channel.sendMessage(msg);
    }

}
module.exports = DiscordService;
