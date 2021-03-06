"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EventEmitter = require("events");
var Discord = require("discord.js");
var jsonfile = require('jsonfile');
var colors = require('colors');
var FS = require('fs');

var Disnode = function (_EventEmitter) {
  _inherits(Disnode, _EventEmitter);

  function Disnode(key, configPath) {
    _classCallCheck(this, Disnode);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Disnode).call(this));

    _this.key = key;
    _this.configPath = configPath;
    _this.config = {};
    return _this;
  }
  /**
   * [startBot Starts the botr]
   */


  _createClass(Disnode, [{
    key: "startBot",
    value: function startBot() {
      var _this2 = this;

      var self = this;

      this.bot = new Discord.Client();
      FS.stat(self.configPath, function (err, stat) {
        if (err == null) {} else if (err.code == 'ENOENT') {
          // file does not exist
          FS.writeFile(self.configPath, '{}');
          console.log('[Disnode]'.grey + " Config not found in: ".green + colors.cyan(self.configPath) + " Generating a new config!".green);
        } else {
          console.log('[Disnode]'.grey + colors.red(" Error:" + err.code));
        }
      });
      this.bot.loginWithToken(this.key);

      this.bot.on("ready", function () {
        return _this2.botReady();
      });
      this.bot.on("message", function (msg) {
        return _this2.botRawMessage(msg);
      });
      process.on('uncaughtException', function (err) {
        return _this2.ECONNRESETHandler(err);
      });

      this.botInit();
    }
  }, {
    key: "saveConfig",
    value: function saveConfig() {
      var self = this;
      jsonfile.writeFile(self.configPath, self.config, { spaces: 2 }, function (err) {
        if (err != null) {
          console.error(err);
        }
        console.log("[Disnode]".grey + " Config Saved!".green);
      });
    }
  }, {
    key: "loadConfig",
    value: function loadConfig(cb) {
      var self = this;
      console.log("[Disnode]".grey + " Loading Config: " + self.configPath);
      jsonfile.readFile(self.configPath, function (err, obj) {
        if (err != null) {
          console.log(colors.red(err));
          console.log("[Disnode]".grey + " Config Failed To Load. No Commmands will be loaded!".red);
          console.log("[Disnode]".grey + " -- Make Sure to create a botconfig with proper JSON!".red);
          return;
        }
        console.log("[Disnode]".grey + " Config Loaded!".green);
        if (!obj.commands) {
          obj.commands = [];
        }
        self.config = obj;
        cb();
      });
    }
  }, {
    key: "botInit",
    value: function botInit() {
      var self = this;
      this.emit("Bot_Init");
    }
  }, {
    key: "botReady",
    value: function botReady() {
      var self = this;
      self.emit("Bot_Ready");
    }
  }, {
    key: "botRawMessage",
    value: function botRawMessage(msg) {
      var self = this;
      if (self.CleverManager) {
        self.CleverManager.cleverMessage(msg);
      }
      if (self.CommandHandler) {
        self.CommandHandler.RunMessage(msg);
      }
      this.emit("Bot_RawMessage", msg);
    }
  }, {
    key: "addManager",
    value: function addManager(data) {
      var self = this;
      var path;
      var option = data.options;
      option.disnode = self;

      if (data.path) {
        path = data.path;
      } else {
        path = "./" + data.name + ".js";
      }

      self[data.name] = {};
      self[data.name].package = require(path);
      self[data.name] = new self[data.name].package(option);
      if (self.CommandHandler) {
        this.CommandHandler.AddContext(self[data.name], data.name);
      }
      if (!self.config[data.name] && self[data.name].defaultConfig) {
        self.addDefaultManagerConfig([data.name], self[data.name].defaultConfig);
      } else {}
      if (self.config[data.name]) {
        if (self.config[data.name].commands) {
          self.addDefaultManagerCommands(data.name, self.config[data.name].commands);
        }
      }
    }
  }, {
    key: "addDefaultManagerConfig",
    value: function addDefaultManagerConfig(name, config) {
      var self = this;
      console.log("[Disnode]".grey + " Loading Defaults for: ".cyan + colors.cyan(name));
      self.config[name] = {};
      self.config[name] = config;
      self.saveConfig();
    }
  }, {
    key: "addDefaultManagerCommands",
    value: function addDefaultManagerCommands(name, commands) {
      var self = this;
      console.log("[Disnode]".grey + " Loading Commands for: ".cyan + colors.cyan(name));
      for (var i = 0; i < commands.length; i++) {
        if (self.CommandHandler) {
          self.CommandHandler.AddCommand(commands[i]);
        }
      }
    }
  }, {
    key: "sendResponse",
    value: function sendResponse(parsedMsg, text, options) {
      var self = this;
      var sendText = text;
      var channel = parsedMsg.msg.channel;
      var sentMsg;

      var options = options || {};

      if (options.parse) {
        console.log('parsing');
        sendText = self.parseString(sendText, parsedMsg, options.shortcuts);
      }
      if (options.mention) {
        sendText = sendText + parsedMsg.msg.author.mention();
      }

      self.bot.sendMessage(channel, sendText, function (err, msg) {
        if (err) {
          console.error(err);
          return;
        }
        sentMsg = msg;
        if (options.timeout) {
          self.bot.deleteMessage(sentMsg, { wait: options.timeout }, function (err) {
            if (err) {
              console.error(err);
              return;
            }
          });
        }
      });
    }
  }, {
    key: "parseString",
    value: function parseString(raw, parsedMsg, customShortCuts) {
      var final = raw;

      if (customShortCuts) {
        for (var i = 0; i < customShortCuts.length; i++) {
          var cur = customShortCuts[i];
          if (final.includes(cur.shortcut)) {
            final = final.replace(cur.shortcut, cur.data);
          }
        }
      }

      if (final.includes("[Sender]")) {
        final = final.replace("[Sender]", parsedMsg.msg.author.mention());
      }

      //TODO: Change to Dynamic Params
      if (final.includes("[Param0]")) {
        final = final.replace("[Param0]", parsedMsg.params[0]);
      }
      if (final.includes("[Param1]")) {
        final = final.replace("[Param1]", parsedMsg.params[1]);
      }
      if (final.includes("[Param2]")) {
        final = final.replace("[Param2]", parsedMsg.params[2]);
      }
      if (final.includes("[Param3]")) {
        final = final.replace("[Param3]", parsedMsg.params[3]);
      }
      if (final.includes("[Param4]")) {
        final = final.replace("[Param4]", parsedMsg.params[4]);
      }
      if (final.includes("[Param5]")) {
        final = final.replace("[Param5]", parsedMsg.params[5]);
      }

      return final;
    }
    /**
     * ECONNRESET hack credits to meew0
     */
    //process.on('uncaughtException', function(err) {

  }, {
    key: "ECONNRESETHandler",
    value: function ECONNRESETHandler(err) {
      // Handle ECONNRESETs caused by `next` or `destroy`
      if (err.code == 'ECONNRESET') {
        // Yes, I'm aware this is really bad node code. However, the uncaught exception
        // that causes this error is buried deep inside either discord.js, ytdl or node
        // itself and after countless hours of trying to debug this issue I have simply
        // given up. The fact that this error only happens *sometimes* while attempting
        // to skip to the next video (at other times, I used to get an EPIPE, which was
        // clearly an error in discord.js and was now fixed) tells me that this problem
        // can actually be safely prevented using uncaughtException. Should this bother
        // you, you can always try to debug the error yourself and make a PR.
        console.log('Got an ECONNRESET! This is *probably* not an error. Stacktrace:'.red);
        console.log(colors.red(err.stack));
      } else {
        // Normal error handling
        console.log(colors.red("Oh no! looks like there was an error, we are sorry if this happened to you, please post the details of the error (which is below this message) on our issues page\nHere: https://github.com/AtecStudios/Disnode/issues\n Thanks for understanding that disnode is constantly under development. and things may change\n\n"));
        console.log(colors.red(err.stack));
        this.bot.logout();
      }
    }
  }]);

  return Disnode;
}(EventEmitter);

module.exports = Disnode;