const Manager = require("../Manager.js");
class DisnodeManager extends Manager {
    constructor(pramas) {
        super(pramas);
        console.log("Loaded!");
        this.defaultConfig = {
          prefix: "disnode",
          commands : [
            {
              command: "disconnect",
              event: "disconnect"
            },
            {
              command: "connect",
              event: "connect"
            }
          ],
        };

        this.disnode.command.on("Command_disnode_disconnect", this.disconnect)
        this.disnode.command.on("Command_disnode_connect", this.connect);
    }

    disconnect(data){
      var disnode = this.disnode;
      if(data.params[0]){
        disnode.service.SendMessage("Disconnecting " + data.params[0], data.msg);
        disnode.service.Disconnect(data.params[0]);
      }else{
        disnode.service.SendMessage("Disconnecting All Services. Goodbye.", data.msg);
        disnode.service.DisconnectAll();
      }
    }

    connect(data){
      var disnode = this.disnode;
      if(data.params[0]){
        disnode.service.SendMessage("Connecting " + data.params[0], data.msg);
        disnode.service.Connect(data.params[0]);
      }else{
        disnode.service.SendMessage("Connecting All Services.", data.msg);
        disnode.service.ConnectAll();
      }
    }

    


}
module.exports = DisnodeManager;
