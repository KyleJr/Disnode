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
          if(message.type === "DM"){
            self.dispatcher.OnWhisper(convertedPacket);

          }else{
            self.dispatcher.OnMessage(convertedPacket);

            if(message.isMentioned(self.client.user)){

              self.dispatcher.OnMention(convertedPacket);
            }
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

    SendWhisper(user, msg,data){
      user.sendMessage(msg);
    }

}
module.exports = DiscordService;
