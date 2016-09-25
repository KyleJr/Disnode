const EventEmitter = require("events");
const RunMan = require('runman');
const colors = require('colors');
class ManagerDispatcher extends EventEmitter {
    constructor(disnode) {
        super();
        this.disnode = disnode;
        this.managers = [];
        console.log("[ManagerDispatcher] Initzialized!");
    }

    AddManager(name, filename, options) {
        console.log("[ManagerDispatcher] Adding Service:  " + filename);
        var self = this;

        var runManOptions = {
            parent: self,
            localPath: __dirname + "/Managers/",
            array: true,
            arrayName: "managers",
            params: {
                name: name,
                dispatcher: self,
                disnode: self.disnode
            }
        };

        RunMan.load(name, filename, runManOptions, function(err, res) {

            if (err) {
                console.error(err);
                return;
            }

            //HACK
            if (!self.disnode.config.managers) {
                self.disnode.config.managers = {};
            }

            if (!self.disnode.config.managers[name]) {

                self.AddDefaultConfig(name, res.defaultConfig);
            }

        });
    }

    AddDefaultConfig(name, config) {
        var self = this;
        console.log("[ManagerDispatcher]".grey + " Loading Defaults for Manager: ".cyan + colors.cyan(name));
        if (!self.disnode.config.managers) {
            self.disnode.config.managers = {};
        }

        self.disnode.config.managers[name] = config;
        self.disnode.saveConfig();
    }

    GetManager(name) {
        var found;
        for (var i = 0; i < this.managers.length; i++) {
            if (this.managers[i].name == name) {
                found = this.managers[i];
            }
        }
        return found;
    }
}
module.exports = ManagerDispatcher;
