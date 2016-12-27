const Manager = require("../Manager.js");
const Discord = require("discord.js");
const async = require('async');
const jsonfile = require('jsonfile');
const FS = require('fs');
const colors = require('colors');

class CasinoPlugin extends Manager {
  constructor(pramas) {
    super(pramas);
    console.log("Casino Loaded!");
    this.defaultConfig = {
      prefix: "casino",
      commands: [
        {command: "self",event: "stats"},
        {command: "slot",event: "slot"},

      ]
    }
    this.slotItems = [
      {item:":cherries:"},{item:":cherries:"},{item:":cherries:"},{item:":cherries:"},{item:":cherries:"},
      {item:":cherries:"},{item:":cherries:"},{item:":cherries:"},{item:":cherries:"},{item:":cherries:"},
      {item:":cherries:"},{item:":cherries:"},{item:":cherries:"},{item:":cherries:"},{item:":cherries:"},
      {item:":cherries:"},{item:":cherries:"},{item:":cherries:"},{item:":cherries:"},{item:":cherries:"},
      {item:":third_place:"},{item:":third_place:"},{item:":third_place:"},{item:":third_place:"},{item:":third_place:"},
      {item:":third_place:"},{item:":third_place:"},{item:":third_place:"},{item:":third_place:"},{item:":third_place:"},
      {item:":third_place:"},{item:":third_place:"},{item:":third_place:"},{item:":third_place:"},{item:":third_place:"},
      {item:":second_place:"},{item:":second_place:"},{item:":second_place:"},{item:":second_place:"},{item:":second_place:"},
      {item:":second_place:"},{item:":second_place:"},{item:":second_place:"},{item:":second_place:"},{item:":second_place:"},
      {item:":first_place:"},{item:":first_place:"},{item:":first_place:"},{item:":first_place:"},{item:":first_place:"},
      {item:":100:"},{item:":100:"},{item:":100:"}
    ]
    this.cobpath = "./casinoObj.json";
    this.casinoObj = {
      players:[],
      jackpotValue: 1000
    }
    this.load(this.cobpath);
    this.Starting = true;

    this.statsCommand = this.statsCommand.bind(this);
    this.slotCommand = this.slotCommand.bind(this);
    this.getPlayer = this.getPlayer.bind(this);
    this.didWin = this.didWin.bind(this);
    this.load = this.load.bind(this);
    this.save = this.save.bind(this);
    this.updateCoroutine = this.updateCoroutine.bind(this);
    this.defaultCommand = this.defaultCommand.bind(this);

    this.disnode.command.on("Command_casino_stats", this.statsCommand);
    this.disnode.command.on("Command_casino_slot", this.slotCommand);
    this.disnode.command.on("Command_casino", this.defaultCommand);
  }
  defaultCommand(data){
    if (data.msg.type == "DiscordService") {
      var client = this.disnode.service.GetService("DiscordService").client;
      var msg = "";
      msg+= " `casino self` - *Check your personal stats*\n";
      msg+= " `casino slot` - *Slots (general help)*\n";
      msg+= " `casino slot info` - *Slots info (help / Payouts)*\n";
      this.disnode.service.SendEmbed({
        color: 3447003,
        author: {},
        title: 'Casino',
        description: 'A Discord bot that allows users to play Casino Games on Discord **FOR AMUESMENT ONLY**',
        fields: [ {
          name: 'Commands',
          inline: false,
          value: msg,
        }, {
          name: 'Discord Server',
          inline: false,
          value: "**Join the Disnode Server for Support and More!:** https://discord.gg/gxQ7nbQ",
        }],
          timestamp: new Date(),
          footer: {}
        },
      data.msg);
    }
  }
  slotCommand(data){
    var self = this;
    if(data.params[0] == "info"){
      this.disnode.service.SendEmbed({
        color: 3447003,
        author: {},
        title: 'Casino Slots',
        description: 'Info',
        fields: [ {
          name: 'Slot Items',
          inline: false,
          value: ":cherries: - Cherries (Most Common)\n\n:third_place:\n\n:second_place:\n\n:first_place:\n\n:100: - 100 (Most Rare)",
        }, {
          name: 'Slot Wins and Payouts',
          inline: false,
          value: "If you have none of the winning sets and you have at least one :cherries: you get 1/2 your bet back\n\n"+
          ":cherries::cherries::cherries: - 2x bet 10XP\n"+
          ":third_place::third_place::third_place: - 4x bet 20XP\n"+
          ":second_place::second_place::second_place: - 8x bet 40XP\n"+
          ":first_place::first_place::first_place: - 16x bet 80XP\n"+
          ":100::100::100: - JACKPOT value - 1000XP",
        },{
          name: 'JACKPOT',
          inline: false,
          value: "JACKPOT Value is increased every time someone plays slots, the value is increased by the players bet amount and has a default value of $1000\n**Current JACKPOT Value: **$" + self.casinoObj.jackpotValue,
        }],
          timestamp: new Date(),
          footer: {}
        }, data.msg);
    }else{
      //else not looking for info
      if(data.params[0] == "" || data.params[0] == undefined){
        //no params give tidbit of info
        this.disnode.service.SendEmbed({
          color: 3447003,
          author: {},
          fields: [ {
            name: 'Slots Help',
            inline: false,
            value: "Hi, Welcome to the slots! If you need info on the slots the run `!casino slot info`\n\nIf you want to try the slots then do `!casino slot [bet]` for example `casino slot 100` that will run the slot with $100 as the bet",
          }],
            timestamp: new Date(),
            footer: {}
          },
        data.msg);
      }else{
        // there is something in params
        if(data.params[0] > 0){
          //greater than 0
          var player = self.getPlayer(data);
          if(data.params[0] > player.money){// Checks to see if player has enough money for their bet
            this.disnode.service.SendEmbed({
              color: 3447003,
              author: {},
              fields: [ {
                name: "Error",
                inline: false,
                value: ":warning: You dont have that much Money! You have $" + player.money,
              }],
                timestamp: new Date(),
                footer: {}
              },
            data.msg);
            return;
          }else{
            player.money -= data.params[0];
            self.casinoObj.jackpotValue += parseInt(data.params[0]);
          }
          var slotInfo = {
            bet: parseInt(data.params[0]),
            player: player,
            winText: "",
            winAmount: 0,
            reel1: self.slotItems[self.getRandomIntInclusive(0,(self.slotItems.length - 1))].item,
            reel2: self.slotItems[self.getRandomIntInclusive(0,(self.slotItems.length - 1))].item,
            reel3: self.slotItems[self.getRandomIntInclusive(0,(self.slotItems.length - 1))].item
          }
          self.didWin(slotInfo);

          this.disnode.service.SendEmbed({
            color: 3447003,
            author: {},
            fields: [ {
              name: 'Slots Result',
              inline: false,
              value: "[ " + slotInfo.reel1 + slotInfo.reel2 + slotInfo.reel3 +" ]\n\n" + slotInfo.winText,
            }, {
              name: 'Winnings',
              inline: false,
              value: "$" + slotInfo.winAmount,
            }, {
              name: 'Balance',
              inline: false,
              value: "$" + player.money,
            }, {
              name: 'JACKPOT Value',
              inline: false,
              value: "$" + self.casinoObj.jackpotValue,
            }],
              timestamp: new Date(),
              footer: {}
            },
          data.msg);
        }else {
          //not greater than 0 or isn't a number!
          this.disnode.service.SendEmbed({
            color: 3447003,
            author: {},
            fields: [ {
              name: "Error",
              inline: false,
              value: ":warning: Please use a Number for bet or `!casino slot` for general help",
            }],
              timestamp: new Date(),
              footer: {}
            },
          data.msg);
        }
        self.save(self.cobpath, self.casinoObj);
      }
    }
  }
  statsCommand(data){
    var self = this;
    var player = self.getPlayer(data);
    self.disnode.service.SendEmbed({
      color: 3447003,
      author: {},
      title: player.name,
      fields: [ {
        name: 'Money',
        inline: false,
        value: "$" + player.money,
      }, {
        name: 'Money per Update',
        inline: false,
        value: "$" + player.perUpdate + " **This amount is added to your current money in 30 Min increments**",
      }, {
        name: 'XP',
        inline: true,
        value: player.xp,
      }],
        timestamp: new Date(),
        footer: {}
      }, data.msg);
  }
  getPlayer(data){
    var self = this;
    for (var i = 0; i < self.casinoObj.players.length; i++) {
      if(data.msg.userId == self.casinoObj.players[i].id){
        return self.casinoObj.players[i];
      }
    }
    var newPlayer = {
      name:  data.msg.username,
      id: data.msg.userId,
      money: 5000,
      perUpdate: 100,
      xp: 0
    }
    self.casinoObj.players.push(newPlayer);
    self.save(self.cobpath, self.casinoObj);
    return newPlayer;
  }
  load(path) {
    var self = this;
    async.series([
      function(done) {
        console.log("Checking for file");
        FS.stat(path, function(err, stat) {
          if (err == null) {} else if (err.code == 'ENOENT') {
            // file does not exist
            jsonfile.writeFile(path, self.casinoObj, {spaces: 2}, function(err) {
              if (err != null) {
                console.error(err);
              }
              console.log("[Casino]".grey + " File Saved!".green);
            });
            console.log('[Casino]'.grey + " File not found in: ".green + colors.cyan(path) + " Generating a new File!".green);
          } else {
            done(new Error(err))
          }
          done();
        });
      },
      function(done) {
        FS.readFile(path, function read(err, data) {
          if (err) {
            done(new Error(err))
          }
          if(data = "" || data.length == 0){
            jsonfile.writeFile(path, self.casinoObj, {spaces: 2}, function(err) {
              if (err != null) {
                console.error(err);
              }
            });
            console.log('[Casino]'.grey + " Blank File: ".green + colors.cyan(path) + " Generating a new file!".green);
          }
          done();
        });
      },
      function(done) {
        jsonfile.readFile(path, function(err, obj) {
          if (err != null) {
            console.log(colors.red(err));
            console.log("[Casino]".grey + " File Failed To Load. No Commmands will be loaded!".red);
            done(new Error(err));
          }
          console.log("[Casino]".grey + " File Loaded!".green);
          self.casinoObj = obj;
          if(self.Starting){
            self.Starting = false;
            self.updateCoroutine();
          }
          done();
        });
      },
      ], function(err) {
        if(err){
          console.log(err);
        }
      })
      console.log("[Casino]".grey + " Loaded File: " + path);
  }
  save(path, obj) {
      var self = this;
      jsonfile.writeFile(path, obj, {
          spaces: 2
      }, function(err) {
          if (err != null) {
              console.error(err);
          }
      });
  }
  getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  didWin(slot){
    var self = this;
    if((slot.reel1 == ":100:") && (slot.reel2 == ":100:") && (slot.reel3 == ":100:")){
      slot.winAmount = self.casinoObj.jackpotValue;
      slot.winText = "JACKPOT JACKPOT JACKPOT!!!!!";
      slot.player.money += slot.winAmount;
      slot.player.xp += 1000;
      return;
    }
    if((slot.reel1 == ":first_place:") && (slot.reel2 == ":first_place:") && (slot.reel3 == ":first_place:")){
      slot.winAmount = slot.bet * 16;
      slot.winText = "WINNER WINNER HUUUUGE MONEY!";
      slot.player.money += slot.winAmount;
      slot.player.xp += 80;
      return;
    }
    if((slot.reel1 == ":second_place:") && (slot.reel2 == ":second_place:") && (slot.reel3 == ":second_place:")){
      slot.winAmount = slot.bet * 8;
      slot.winText = "WINNER WINNER BIG MONEY!";
      slot.player.money += slot.winAmount;
      slot.player.xp += 40;
      return;
    }
    if((slot.reel1 == ":third_place:") && (slot.reel2 == ":third_place:") && (slot.reel3 == ":third_place:")){
      slot.winAmount = slot.bet * 4;
      slot.winText = "WINNER!";
      slot.player.money += slot.winAmount;
      slot.player.xp += 20;
      return;
    }
    if((slot.reel1 == ":cherries:") && (slot.reel2 == ":cherries:") && (slot.reel3 == ":cherries:")){
      slot.winAmount = slot.bet * 2;
      slot.winText = "Winner";
      slot.player.money += slot.winAmount;
      slot.player.xp += 10;
      return;
    }
    if((slot.reel1 == ":cherries:") || (slot.reel2 == ":cherries:") || (slot.reel3 == ":cherries:")){
      slot.winAmount = slot.bet / 2;
      slot.winText = "Well at lease you didn't loose it all...";
      slot.player.money += slot.winAmount;
      slot.player.xp += 5;
      return;
    }
    slot.winAmount = 0;
    slot.winText = "DANG! Better luck next Time!";
    slot.player.xp += 1;
  }
  updateCoroutine(){
    var self = this;
    for (var i = 0; i < self.casinoObj.players.length; i++) {
      self.casinoObj.players[i].money += self.casinoObj.players[i].perUpdate;
    }
    self.save(self.cobpath, self.casinoObj);
    setTimeout(function() {
      self.updateCoroutine();
    }, 1800000);
  }
}
module.exports = CasinoPlugin;
