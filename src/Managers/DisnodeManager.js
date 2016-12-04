const Manager = require("../Manager.js");
class DisnodeManager extends Manager {
    constructor(pramas) {
        super(pramas);
        console.log("Loaded!");
        this.defaultConfig = {
            prefix: "disnode",
            commands: [{
                command: "disconnect",
                event: "disconnect"
            }, {
                command: "connect",
                event: "connect"
            }, {
                command: "info",
                event: "info"
            }],
        };

        //this.disnode.command.on("Command_disnode_disconnect", this.disconnect)
        //this.disnode.command.on("Command_disnode_connect", this.connect);
        this.disnode.command.on("Command_disnode_info", this.info);
    }

    disconnect(data) {
        var disnode = this.disnode;
        if (data.params[0]) {
            disnode.service.SendMessage("Disconnecting " + data.params[0], data.msg);
            disnode.service.Disconnect(data.params[0]);
        } else {
            disnode.service.SendMessage("Disconnecting All Services. Goodbye.", data.msg);
            disnode.service.DisconnectAll();
        }
    }

    connect(data) {
        var disnode = this.disnode;
        if (data.params[0]) {
            disnode.service.SendMessage("Connecting " + data.params[0], data.msg);
            disnode.service.Connect(data.params[0]);
        } else {
            disnode.service.SendMessage("Connecting All Services.", data.msg);
            disnode.service.ConnectAll();
        }
    }

    info(data) {
        var disnode = this.disnode;
        var client = disnode.service.GetService("DiscordService").client;
        var managers = "";
        for (var i = 0; i < this.disnode.manager.managers.length; i++) {
          var manager = this.disnode.manager.managers[i];
          managers += " - **" + manager.name + "** [Prefix: "+manager.config.prefix+"]\n";
        }

        var servers = "";
        for (var i = 0; i < client.guilds.array().length; i++) {
          var server = client.guilds.array()[i];
          servers += " - **" + server.name + "** \n";
        }

        if (data.msg.type == "DiscordService") {
            disnode.service.SendEmbed({
                color: 3447003,
                author: {
                    name: client.user.username,
                    icon_url: client.user.avatarURL
                },
                title: 'Disnode Bot Info',
                description: 'A library for writing universal bots easily.',
                fields: [ {
                    name: 'Bot Config',
                    inline: true,
                    value: "**Prefix:** " + disnode.config.prefix + "\n" + "**Mention: **" + disnode.config.mention + "\n" ,
                }, {
                  name: 'Stats',
                                      inline: true,
                  value: "**Servers:** " + client.guilds.array().length+"\n ",
              }, {
                    name: 'Managers',
                    value: managers
                }],
                timestamp: new Date(),
                footer: {
                    icon_url: client.user.avatarURL,
                    text: "Disnode Manager"
                }
            }, data.msg);
        }
    }




}
module.exports = DisnodeManager;
