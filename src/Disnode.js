"use strict";

const EventEmitter = require("events");
const Discord      = require( "discord.js");
const jsonfile     = require('jsonfile');
const colors       = require('colors');
const FS           = require('fs');

const ServiceDispatcher = require ("./ServiceDispatcher.js");
const CommandDispatcher = require ("./CommandDispatcher.js");
const ManagerDispatcher = require ("./ManagerDispatcher.js");
const ShortcutParser    = require ("./ShortcutParser.js");


const TestImport    = require ("./Managers/CAHGame");
class Disnode extends EventEmitter{
  constructor(configPath){
    super();

    this.configPath = configPath;
    this.config = {

    };
    this.services = [];


  }

  startBot(){
    var self = this;
    process.on('uncaughtException', (err) => this.ECONNRESETHandler(err));


    //Init Modules
    self.service = new ServiceDispatcher(self);
    self.command = new CommandDispatcher(self);
    self.manager = new ManagerDispatcher(self);
    self.shortcut= new ShortcutParser();
    self.command.SetEvents();
  }

  saveConfig(){
    var self = this;
    jsonfile.writeFile(self.configPath, self.config, {spaces: 2}, function(err) {
        if(err != null){
          console.error(err);
        }
        console.log("[Disnode]".grey + " Config Saved!".green);
    });
  }

  loadConfig(cb){
    var self = this;

    FS.stat(self.configPath, function(err, stat) {
      if(err == null) {
      } else if(err.code == 'ENOENT') {
          // file does not exist
          FS.writeFile(self.configPath, '{}');
          console.log('[Disnode]'.grey + " Config not found in: ".green + colors.cyan(self.configPath) + " Generating a new config!".green);
      } else {
          console.log('[Disnode]'.grey + colors.red(" Error:" + err.code));
      }
    });

    console.log("[Disnode]".grey + " Loading Config: " + self.configPath);
    jsonfile.readFile(self.configPath, function(err, obj) {
      if(err != null){
        console.log(colors.red(err));
        console.log("[Disnode]".grey + " Config Failed To Load. No Commmands will be loaded!".red);
        console.log("[Disnode]".grey + " -- Make Sure to create a botconfig with proper JSON!".red);
        return;
      }
      console.log("[Disnode]".grey + " Config Loaded!".green);
      if(!obj.commands){
        obj.commands = [];
      }


      self.config = obj;
      self.loadCommands();
      cb();
    });
  }

  loadCommands(){
    if(this.command){
      if(this.config.commands){
        console.log('Adding ' + this.config.commands.length + " commands!");
        this.command.AddCommands(this.config.commands);
      }
    }
  }

  /**
   * ECONNRESET hack credits to meew0
   */
  //process.on('uncaughtException', function(err) {
  ECONNRESETHandler(err){
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
}
module.exports = Disnode;
