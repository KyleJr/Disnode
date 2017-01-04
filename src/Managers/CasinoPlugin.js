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
        {command: "store",event: "store"},
        {command: "top",event: "top"},
        {command: "look",event: "look"},
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
    this.store = [
      {cost: 100, item: "Instant $1,000"},
      {cost: 250, item: "Instant $2,500"},
      {cost: 500, item: "Instant $5,000"},
      {cost: 1000, item: "Instant $10,000"},
      {cost: 100, item: "Add $50 to your \'per update\' amount"},
      {cost: 200, item: "Add $100 to your \'per update\' amount"},
      {cost: 400, item: "Add $200 to your \'per update\' amount"}
    ]
    this.cobpath = "./casinoObj.json";
    this.casinoObj = {
      players:[],
      jackpotValue: 1000
    }
    this.load(this.cobpath);
    this.Starting = true;

    this.statsCommand = this.statsCommand.bind(this);
    this.storeCommand = this.storeCommand.bind(this);
    this.lookupCommand = this.lookupCommand.bind(this);
    this.topCommand = this.topCommand.bind(this);
    this.slotCommand = this.slotCommand.bind(this);
    this.getPlayer = this.getPlayer.bind(this);
    this.didWin = this.didWin.bind(this);
    this.load = this.load.bind(this);
    this.save = this.save.bind(this);
    this.updateCoroutine = this.updateCoroutine.bind(this);
    this.defaultCommand = this.defaultCommand.bind(this);

    this.disnode.command.on("Command_casino_stats", this.statsCommand);
    this.disnode.command.on("Command_casino_store", this.storeCommand);
    this.disnode.command.on("Command_casino_look", this.lookupCommand);
    this.disnode.command.on("Command_casino_top", this.topCommand);
    this.disnode.command.on("Command_casino_slot", this.slotCommand);
    this.disnode.command.on("Command_casino", this.defaultCommand);
  }
  defaultCommand(data){
    if (data.msg.type == "DiscordService") {
      var client = this.disnode.service.GetService("DiscordService").client;
      var msg = "";
      msg+= " `casino self` - *Check your personal stats*\n";
      msg+= " `casino look` - *Givers stats of the given username*\n";
      msg+= " `casino top` - *Lists the top 10 players based on cash*\n";
      msg+= " `casino store` - *Spend the XP you earn from playing here!*\n";
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
  topCommand(data){
    var self = this;
    var orderTop = []
    for (var i = 0; i < self.casinoObj.players.length; i++) {
      var placed = false;
      for (var x = 0; x < orderTop.length; x++) {
        if(self.casinoObj.players[i].money > orderTop[x].money){
          orderTop.splice(x, 0, self.casinoObj.players[i]);
          placed = true;
          break;
        }
      }
      if(!placed){
        orderTop.push(self.casinoObj.players[i]);
      }
    }
    var msg = "";
    for (var i = 0; i < orderTop.length; i++) {
      if(i == 9)break;
      msg += "" + (i + 1) + ". **" + orderTop[i].name + "** - $" + orderTop[i].money + "\n";
    }
    this.disnode.service.SendEmbed({
      color: 3447003,
      author: {},
      fields: [ {
        name: "High Rollers",
        inline: false,
        value: msg,
      }],
        timestamp: new Date(),
        footer: {}
      },
    data.msg);
  }
  lookupCommand(data){
    var self = this;
    var player;
    if(data.params[0]){
      for (var i = 0; i < self.casinoObj.players.length; i++) {
        if(self.casinoObj.players[i].name == data.params[0]){
          player = self.casinoObj.players[i];
          data.msg.userId = player.id;
          self.statsCommand(data);
          return;
        }
      }
      this.disnode.service.SendEmbed({
        color: 3447003,
        author: {},
        fields: [ {
          name: "Error",
          inline: false,
          value: ":warning: Could not find a player card for: `" + data.params[0] + "`",
        }],
          timestamp: new Date(),
          footer: {}
        },
      data.msg);
    }else{
      this.disnode.service.SendEmbed({
        color: 3447003,
        author: {},
        fields: [ {
          name: "Error",
          inline: false,
          value: ":warning: Please enter a username to lookup! example: `!casino look FireGamer3`\nIf the username has a space in it use quotes, Example: `!casino look \"VictoryForPhil / Atec\"`",
        }],
          timestamp: new Date(),
          footer: {}
        },
      data.msg);
    }
  }
  storeCommand(data){
    var self = this;
    if(data.params[0] == "buy"){
      if(data.params[1] && (data.params[1] >= 0 && data.params[1] <= (self.store.length - 1))){
        var player = self.getPlayer(data);
        var ID = parseInt(data.params[1]);
        if(player.xp < self.store[ID].cost){
          this.disnode.service.SendEmbed({
            color: 3447003,
            author: {},
            fields: [ {
              name: "Error",
              inline: false,
              value: ":warning: You dont have that much XP!\nNeed: " + self.store[ID].cost + "XP\nYou have: " + player.xp,
            }],
              timestamp: new Date(),
              footer: {}
            },
          data.msg);
          return;
        }
        switch (ID) {
          case 0:
            player.xp -= self.store[ID].cost;
            player.money += 1000;
            break;
          case 1:
            player.xp -= self.store[ID].cost;
            player.money += 2500;
            break;
          case 2:
            player.xp -= self.store[ID].cost;
            player.money += 5000;
            break;
          case 3:
            player.xp -= self.store[ID].cost;
            player.money += 10000;
            break;
          case 4:
            player.xp -= self.store[ID].cost;
            player.perUpdate += 50;
            break;
          case 5:
            player.xp -= self.store[ID].cost;
            player.perUpdate += 100;
            break;
          case 6:
            player.xp -= self.store[ID].cost;
            player.perUpdate += 200;
            break;
          default:
            break;
        }
        //:white_check_mark:
        this.disnode.service.SendEmbed({
          color: 3447003,
          author: {},
          fields: [ {
            name: "Store",
            inline: false,
            value: ":white_check_mark: Your purchase of `" + self.store[ID].item + "` was successful! Thank you for your business!",
          }],
            timestamp: new Date(),
            footer: {}
          },
        data.msg);
      }else {
        this.disnode.service.SendEmbed({
          color: 3447003,
          author: {},
          fields: [ {
            name: "Error",
            inline: false,
            value: ":warning: Please enter a numeric value for the Item ID you wish to buy `0 - "+ (self.store.length - 1) +"`. Example: `!casino store buy 0`",
          }],
            timestamp: new Date(),
            footer: {}
          },
        data.msg);
      }
    }else if(data.params[0] == "list"){
      var msg = "**ID**\t//\t**ITEM**\t//\t**COST**\n";
      for (var i = 0; i < self.store.length; i++) {
        self.store[i]
        msg += "" + i + "\t//\t" + self.store[i].item + "\t//\t" + self.store[i].cost + "XP\n";
      }
      msg += "Store items are subject to change, please be aware of prices and items PRIOR to making a purchase!";
      this.disnode.service.SendEmbed({
        color: 3447003,
        author: {},
        fields: [ {
          name: "Store List",
          inline: false,
          value: msg,
        }],
          timestamp: new Date(),
          footer: {}
        },
      data.msg);
    }else{
      this.disnode.service.SendEmbed({
        color: 3447003,
        author: {},
        fields: [ {
          name: "Store",
          inline: false,
          value: "Welcome to the store! to see a list of Items use `!casino store list` use the ID of the item when buying for example `!casino store buy 0`",
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
        if(parseFloat(data.params[0]) > 0.01){
          var bet = parseFloat(data.params[0]).toFixed(2);
          //greater than 0
          var player = self.getPlayer(data);
          var timeoutInfo = self.checkTimeout(player);
          if(!timeoutInfo.pass){
            this.disnode.service.SendEmbed({
              color: 3447003,
              author: {},
              fields: [ {
                name: "Error",
                inline: false,
                value: ":warning: You must wait **" + timeoutInfo.remain.sec + " seconds** before playing again.",
              }],
                timestamp: new Date(),
                footer: {}
              },
            data.msg);
            return;
          }
          if(bet > player.money){// Checks to see if player has enough money for their bet
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
            player.money -= parseFloat(bet);
            self.casinoObj.jackpotValue += parseFloat(bet);
          }
          var slotInfo = {
            bet: bet,
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
              inline: true,
              value: "$" + player.money,
            }, {
              name: 'JACKPOT Value',
              inline: true,
              value: "$" + self.casinoObj.jackpotValue,
            }, {
              name: 'XP',
              inline: true,
              value: player.xp,
            }],
              timestamp: new Date(),
              footer: {}
            },
          data.msg);
          var currentDate = new Date();
          var min  = currentDate.getMinutes();
          min = (min < 10 ? "0" : "") + min;
          var sec  = currentDate.getSeconds();
          sec = (sec < 10 ? "0" : "") + sec;
          player.lastMessage = {
            min: parseInt(min),
            sec: parseInt(sec),
          }
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
  checkTimeout(player){
    var currentDate = new Date();
    var min  = currentDate.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    var sec  = currentDate.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
    if(player.lastMessage == null){
      player.lastMessage = null;
      return {pass: true};
    }
    var remainingTime = {
      min: player.lastMessage.min - min,
      sec: (player.lastMessage.sec + 5) - sec
    }
    if(remainingTime.min < 0){
      return {pass: true};
    }else if((remainingTime.min <= 0) & (remainingTime.sec <= 0)){
      return {pass: true};
    }else return {pass: false, remain: remainingTime};
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
      self.casinoObj.jackpotValue = 1000;
      slot.winText = "JACKPOT JACKPOT JACKPOT!!!!!";
      slot.player.money += parseFloat(slot.winAmount);
      slot.player.xp += 1000;
      return;
    }
    if((slot.reel1 == ":first_place:") && (slot.reel2 == ":first_place:") && (slot.reel3 == ":first_place:")){
      slot.winAmount = (slot.bet * 16).toFixed(2);
      slot.winText = "WINNER WINNER HUUUUGE MONEY!";
      slot.player.money += parseFloat(slot.winAmount);
      slot.player.xp += 80;
      return;
    }
    if((slot.reel1 == ":second_place:") && (slot.reel2 == ":second_place:") && (slot.reel3 == ":second_place:")){
      slot.winAmount = (slot.bet * 8).toFixed(2);
      slot.winText = "WINNER WINNER BIG MONEY!";
      slot.player.money += parseFloat(slot.winAmount);
      slot.player.xp += 40;
      return;
    }
    if((slot.reel1 == ":third_place:") && (slot.reel2 == ":third_place:") && (slot.reel3 == ":third_place:")){
      slot.winAmount = (slot.bet * 4).toFixed(2);
      slot.winText = "WINNER!";
      slot.player.money += parseFloat(slot.winAmount);
      slot.player.xp += 20;
      return;
    }
    if((slot.reel1 == ":cherries:") && (slot.reel2 == ":cherries:") && (slot.reel3 == ":cherries:")){
      slot.winAmount = (slot.bet * 2).toFixed(2);
      slot.winText = "Winner";
      slot.player.money += parseFloat(slot.winAmount);
      slot.player.xp += 10;
      return;
    }
    if((slot.reel1 == ":cherries:") || (slot.reel2 == ":cherries:") || (slot.reel3 == ":cherries:")){
      slot.winAmount = (slot.bet / 2).toFixed(2);
      slot.winText = "Well at least you didn't lose it all...";
      slot.player.money += parseFloat(slot.winAmount);
      slot.player.xp += 5;
      return;
    }
    slot.winAmount = 0;
    slot.winText = "DANG! Better luck next time!";
    slot.player.xp += 1;
  }
  updateCoroutine(){
    var self = this;
    for (var i = 0; i < self.casinoObj.players.length; i++) {
      self.casinoObj.players[i].money += self.casinoObj.players[i].perUpdate;
      self.casinoObj.players[i].lastMessage = null;
    }
    if(self.casinoObj.jackpotValue == null)self.casinoObj.jackpotValue = 1000;
    self.save(self.cobpath, self.casinoObj);
    setTimeout(function() {
      self.updateCoroutine();
    }, 1800000);
  }
}
module.exports = CasinoPlugin;
