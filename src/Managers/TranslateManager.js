const Manager = require("../Manager.js");
const googleTranslate = require('google-translate')("AIzaSyBqylIveMrdrDlOd1hfkFicgjcAh_e0zNo");
class TranslateManager extends Manager {
    constructor(pramas) {
        super(pramas);
        console.log("Loaded!");
        this.defaultConfig = {
            prefix: "translate",
            commands: [{
                command: "list",
                event: "list"
            }],
        };

        this.disnode.command.on("Command_translate", this.translate)
        this.disnode.command.on("Command_translate_list", this.list)
    }

    translate(data) {
        var self = this;

        if (!data.params[0] && !data.params[1]) {
            self.disnode.service.SendMessage("Please enter a language and a string!", data.msg);
            return;
        }

        googleTranslate.translate(data.params[1], data.params[0], function(err, translation) {
            console.log(translation);
            self.disnode.service.SendMessage(translation.translatedText, data.msg)
                // =>  Mi nombre es Brandon
        });
    }

    list(data) {
        var self = this;
        googleTranslate.getSupportedLanguages(function(err, languageCodes) {
          var string = "**Supported languages are: ** ";
          for (var i = 0; i < languageCodes.length; i++) {
            string += " " + languageCodes[i];
          }
            self.disnode.service.SendMessage(string, data.msg)
                // => ['af', 'ar', 'be', 'bg', 'ca', 'cs', ...]
        });
    }


}
module.exports = TranslateManager;
