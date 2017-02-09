const Manager = require("../Manager.js");
const Discord = require("discord.js");
const async = require('async');
const jsonfile = require('jsonfile');
const FS = require('fs');
const colors = require('colors');
const numeral = require('numeral')
var probe = require('pmx').probe();
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
        {command: "admin",event: "admin"},
        {command: "flip",event: "flip"},
        {command: "transfer",event: "transfer"},
        {command: "bal",event: "bal"},
        {command: "betters",event: "betters"},
        {command: "wheel",event: "wheel"},
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
      {item:":100:"},{item:":100:"},{item:":100:"},{item:":100:"},{item:":100:"},{item:":100:"}
    ]
    this.store = [
      {cost: 200, type:0, item: "Instant $1,000"},
      {cost: 500, type:0, item: "Instant $2,500"},
      {cost: 1000, type:0, item: "Instant $5,000"},
      {cost: 2000, type:0, item: "Instant $10,000"},
      {cost: 4000, type:0, item: "Instant $20,000"},
      {cost: 6000, type:0, item: "Instant $30,000"},
      {cost: 100, type:0, item: "Add $50 to your income"},
      {cost: 200, type:0, item: "Add $100 to your income"},
      {cost: 400, type:0, item: "Add $200 to your income"},
      {cost: 800, type:0, item: "Add $400 to your income"},
      {cost: 1600, type:0, item: "Add $800 to your income"},
      {cost: 3200, type:0, item: "Add $1600 to your income"},
      {cost: 10000, type:1, item: "Instant 50XP"},
      {cost: 20000, type:1, item: "Instant 100XP"},
      {cost: 40000, type:1, item: "Instant 200XP"},
      {cost: 80000, type:1, item: "Instant 400XP"},
      {cost: 160000, type:1, item: "Instant 800XP"},
      {cost: 320000, type:1, item: "Instant 1600XP"},
      {cost: 640000, type:1, item: "Instant 3200XP"}
    ]
    this.wheelItems = [
      {display:":white_circle: :zero:", type: 0},
      {display:":red_circle: :one:", type: 1},
      {display:":red_circle: :two:", type: 1},
      {display:":black_circle: :three:", type: 2},
      {display:":black_circle: :four:", type: 2},
      {display:":red_circle: :five:", type: 1},
      {display:":red_circle: :six:", type: 1},
      {display:":black_circle: :seven:", type: 2},
      {display:":black_circle: :eight:", type: 2},
      {display:":red_circle: :nine:", type: 1},
      {display:":red_circle: :keycap_ten:", type: 1},
      {display:":black_circle: :one: :one:", type: 2},
      {display:":black_circle: :one: :two:", type: 2},
      {display:":red_circle: :one: :three:", type: 1},
      {display:":red_circle: :one: :four:", type: 1},
      {display:":black_circle: :one: :five:", type: 2},
      {display:":black_circle: :one: :six:", type: 2},
      {display:":red_circle: :one: :seven:", type: 1},
      {display:":red_circle: :one: :eight:", type: 1},
      {display:":black_circle: :one: :nine:", type: 2},
      {display:":black_circle: :two: :zero:", type: 2},
      {display:":red_circle: :two: :one:", type: 1},
      {display:":red_circle: :two: :two:", type: 1},
      {display:":black_circle: :two: :three:", type: 2},
      {display:":black_circle: :two: :four:", type: 2},
      {display:":red_circle: :two: :five:", type: 1},
      {display:":red_circle: :two: :six:", type: 1},
      {display:":black_circle: :two: :seven:", type: 2},
      {display:":black_circle: :two: :eight:", type: 2},
      {display:":red_circle: :two: :nine:", type: 1},
      {display:":red_circle: :three: :zero:", type: 1},
      {display:":black_circle: :three: :one:", type: 2},
      {display:":black_circle: :three: :two:", type: 2},
      {display:":red_circle: :three: :three:", type: 1},
      {display:":red_circle: :three: :four:", type: 1},
      {display:":black_circle: :three: :five:", type: 2},
      {display:":black_circle: :three: :six:", type: 2}
    ]
    this.cobpath = "./casinoObj.json";
    this.casinoObj = {
      players:[],
      jackpotValue: 100000,
      jackpotstat: {
        lastWon: "N/A",
        HighestWin: 0,
        HighestBy: "N/A"
      }
    }
    this.recentBetters = [];
    this.load(this.cobpath);
    this.Starting = true;
    this.transferCommand = this.transferCommand.bind(this);
    this.recentBettersCommand = this.recentBettersCommand.bind(this);
    this.quickbalCommand = this.quickbalCommand.bind(this);
    this.quickJPCommand = this.quickJPCommand.bind(this);
    this.statsCommand = this.statsCommand.bind(this);
    this.storeCommand = this.storeCommand.bind(this);
    this.topCommand = this.topCommand.bind(this);
    this.slotCommand = this.slotCommand.bind(this);
    this.getPlayer = this.getPlayer.bind(this);
    this.adminCommand = this.adminCommand.bind(this);
    this.wheelCommand = this.wheelCommand.bind(this);
    this.didWin = this.didWin.bind(this);
    this.load = this.load.bind(this);
    this.save = this.save.bind(this);
    this.getDateTime = this.getDateTime.bind(this);
    this.updateCoroutine = this.updateCoroutine.bind(this);
    this.defaultCommand = this.defaultCommand.bind(this);
    this.coinflipCommand = this.coinflipCommand.bind(this);

    this.disnode.command.on("Command_casino_stats", this.statsCommand);
    this.disnode.command.on("Command_casino_store", this.storeCommand);
    this.disnode.command.on("Command_casino_top", this.topCommand);
    this.disnode.command.on("Command_casino_slot", this.slotCommand);
    this.disnode.command.on("Command_casino_admin", this.adminCommand);
    this.disnode.command.on("Command_casino_flip", this.coinflipCommand);
    this.disnode.command.on("Command_casino_transfer", this.transferCommand);
    this.disnode.command.on("Command_casino_betters", this.recentBettersCommand);
    this.disnode.command.on("Command_casino_bal", this.quickbalCommand);
    this.disnode.command.on("Command_casino_jackpot", this.quickJPCommand);
    this.disnode.command.on("Command_casino_wheel", this.wheelCommand);
    this.disnode.command.on("Command_casino", this.defaultCommand);
    var self = this;
    var metric = probe.metric({
    	name: 'Jackpot',
    	value: function () {
    		return self.casinoObj.jackpotValue;
    	}
    });

    var metric2 = probe.metric({
    	name: 'Jackpot Winner',
    	value: function () {
    		return self.casinoObj.jackpotstat.lastWon;
    	}
    });


    var metric3 = probe.metric({
      name: 'Players',
      value: function () {
        return self.casinoObj.players.length;
      }
    });


  }
  defaultCommand(data){
    var self = this;
    var player = self.getPlayer(data);
    if(self.checkBan(player, data))return;
    if (data.msg.type == "DiscordService") {
      var client = this.disnode.service.GetService("DiscordService").client;
      var msg = "";
      msg+= " `casino stats` - *Check your personal stats And stats of other users*\n";
      msg+= " `casino bal` - *Check your Money and XP Quickly*\n";
      msg+= " `casino betters` - *View a list of who is currently Betting*\n";
      msg+= " `casino jackpot` - *Check the JACKPOT value Quickly*\n";
      msg+= " `casino top` - *Lists the top 10 players based on cash*\n";
      msg+= " `casino store` - *Spend the XP you earn from playing here!*\n";
      msg+= " `casino flip` - *Coin Flip (general help)*\n";
      msg+= " `casino wheel` - *The Wheel (Roulette) (general help)*\n";
      msg+= " `casino transfer` - *Transfer money to other players!* **Use:** `!casino transfer FireGamer3 100`\n";
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
        }, {
          name: 'Disnode Premium',
          inline: false,
          value: "**Help us keep the bots running 24/7 and get great perks by doing so by giving us a pledge of $1 a month :** https://www.patreon.com/Disnode",
        }],
          footer: {}
        },
      data.msg);
    }
  }
  recentBettersCommand(data){
    var self = this;
    var player = self.getPlayer(data);
    self.CheckforCreated(player, data);
    var msg = "Name // Last Time Played\n";
    for (var i = 0; i < self.recentBetters.length; i++) {
      msg += (i+1) + ". **" + self.recentBetters[i].name + "** -=- `" + self.recentBetters[i].time + "`\n";
    }
    self.sendCompactEmbed("Recent Betters -=- Current Time: " + self.getDateTime(), msg, data);
  }
  quickJPCommand(data){
    var self = this;
    var player = self.getPlayer(data);
    self.CheckforCreated(player, data);
    if(self.checkBan(player, data))return;
    if(player.money > 66000){
      var minJackpotBet = (player.money * 0.015);
    }else var minJackpotBet = 1000;
    self.updateLastSeen(player);
    this.disnode.service.SendEmbed({
      color: 3447003,
      author: {},
      fields: [ {
        name: 'JACKPOT Value',
        inline: true,
        value: "$" + numeral(self.casinoObj.jackpotValue).format('0,0.00'),
      },{
        name: 'Minimum bet to Win JACKPOT',
        inline: false,
        value: "$" + numeral(minJackpotBet).format('0,0.00')
      }, {
        name: 'JACKPOT History',
        inline: false,
        value: "**Last won by:** " + self.casinoObj.jackpotstat.lastWon,
      }],
        footer: {}
      },
    data.msg);
  }
  quickbalCommand(data){
    var self = this;
    var player = self.getPlayer(data);
    self.CheckforCreated(player, data);
    if(self.checkBan(player, data))return;
    player.money = Number(parseFloat(player.money).toFixed(2));
    if(data.params[0]){
      var otherID = self.parseMention(data.params[0]);
      for (var i = 0; i < self.casinoObj.players.length; i++) {
        if(self.casinoObj.players[i].id == otherID){
          var transferPlayer = self.casinoObj.players[i];
          this.disnode.service.SendEmbed({
            color: 3447003,
            author: {},
            title: transferPlayer.name + ' Quick Balance',
            fields: [ {
              name: 'Money',
              inline: true,
              value: "$" + numeral(transferPlayer.money).format('0,0.00'),
            }, {
              name: 'Income / 30min.',
              inline: true,
              value: "$" + numeral(transferPlayer.perUpdate).format('0,0.00'),
            }, {
              name: 'XP',
              inline: true,
              value: transferPlayer.xp,
            }, {
              name: 'Premium',
              inline: true,
              value: player.Premium,
            }],
              footer: {}
            },
          data.msg);
          return;
        }
      }
      for (var i = 0; i < self.casinoObj.players.length; i++) {
        if(self.casinoObj.players[i].name.toLowerCase() == data.params[0].toLowerCase()){
          var transferPlayer = self.casinoObj.players[i];
          this.disnode.service.SendEmbed({
            color: 3447003,
            author: {},
            title: transferPlayer.name + ' Quick Balance',
            fields: [ {
              name: 'Money',
              inline: true,
              value: "$" + numeral(transferPlayer.money).format('0,0.00'),
            }, {
              name: 'Income / 30min.',
              inline: true,
              value: "$" + numeral(transferPlayer.perUpdate).format('0,0.00'),
            }, {
              name: 'XP',
              inline: true,
              value: transferPlayer.xp,
            }, {
              name: 'Premium',
              inline: true,
              value: player.Premium,
            }],
              footer: {}
            },
          data.msg);
          return;
        }
      }
      var found = [];
      var msg = "Did you mean?\n";
      for (var i = 0; i < self.casinoObj.players.length; i++) {
      if(data.params[0].length < 3)break;
        if(self.casinoObj.players[i].name.toLowerCase().includes(data.params[0].toLowerCase())){
          found.push(self.casinoObj.players[i])
        }
      }
      if(found.length == 1){
        var transferPlayer = found[0];
        this.disnode.service.SendEmbed({
          color: 3447003,
          author: {},
          title: transferPlayer.name + ' Quick Balance',
          fields: [ {
            name: 'Money',
            inline: true,
            value: "$" + numeral(transferPlayer.money).format('0,0.00'),
          }, {
            name: 'Income / 30min.',
            inline: true,
            value: "$" + numeral(transferPlayer.perUpdate).format('0,0.00'),
          }, {
            name: 'XP',
            inline: true,
            value: transferPlayer.xp,
          }, {
            name: 'Premium',
            inline: true,
            value: player.Premium,
          }],
            footer: {}
          },
        data.msg);
        return;
      }
      for (var i = 0; i < found.length; i++) {
        msg += "**" + found[i].name + "**\n"
      }
      if(found.length > 0){
        this.sendCompactEmbed("Error", ":warning: Player card Not Found Please @mention the user you are trying to send to or make sure you have the correct name if not using a @mention! Also make sure they have a account on the game!\n\n" + msg, data);
      }else {
        this.sendCompactEmbed("Error", ":warning: Player card Not Found Please @mention the user you are trying to send to or make sure you have the correct name if not using a @mention! Also make sure they have a account on the game!", data);
      }
      return;
    }
    self.updateLastSeen(player);
    this.disnode.service.SendEmbed({
      color: 3447003,
      author: {},
      title: player.name + ' Quick Balance',
      fields: [ {
        name: 'Money',
        inline: true,
        value: "$" + numeral(player.money).format('0,0.00'),
      }, {
        name: 'Income / 30min.',
        inline: true,
        value: "$" + numeral(player.perUpdate).format('0,0.00'),
      }, {
        name: 'XP',
        inline: true,
        value: player.xp,
      }, {
        name: 'Premium',
        inline: true,
        value: player.Premium,
      }],
        footer: {}
      },
    data.msg);
  }
  wheelCommand(data){
    var self = this;
    var player = self.getPlayer(data);
    self.CheckforCreated(player, data);
    if(self.checkBan(player, data))return;
    player.money = Number(parseFloat(player.money).toFixed(2));
    switch (data.params[0]) {
      case "spin":
        if(data.params[1] == "allin"){
          var bet = numeral(player.money).value();
        }else {
          var bet = numeral(data.params[1]).value();
        }
        if(bet > 0){
          var timeoutInfo = self.checkTimeout(player, 5);
          if(player.Admin || player.Premium)timeoutInfo = self.checkTimeout(player, 2);
          if(!timeoutInfo.pass){
            this.disnode.service.SendEmbed({
              color: 3447003,
              author: {},
              fields: [ {
                name: "Error",
                inline: false,
                value: ":warning: You must wait **" + timeoutInfo.remain.sec + " seconds** before playing again.",
              }],
                footer: {}
              },
            data.msg);
            return;
          }
          var winspots = [];
          var whatcontains = {
            has1st: false,
            has2nd: false,
            has3rd: false
          }
          var invalidbets = [];
          for (var i = 2; i < data.params.length; i++) {
            if(data.params[i] == undefined)break;
            if(self.checkValidWheel(data.params[i])){
              if(data.params[i].toLowerCase() == "1st"){
                whatcontains.has1st = true;
              }
              if(data.params[i].toLowerCase() == "2nd"){
                whatcontains.has2nd = true;
              }
              if(data.params[i].toLowerCase() == "3rd"){
                whatcontains.has3rd = true;
              }
              winspots.push(data.params[i].toLowerCase());
            }else {
              invalidbets.push(data.params[i]);
            }
          }
          if(winspots.length == 0){
            if(invalidbets.length > 0){
              var msg = "";
              for (var i = 0; i < invalidbets.length; i++) {
                msg += invalidbets[i] + " ";
              }
              this.sendCompactEmbed("Error", ":warning: Please Enter valid bet types! Invalid: " + msg, data);
              return;
            }else {
              this.sendCompactEmbed("Error", ":warning: Please Enter valid bet types!", data);
              return;
            }
          }
          if(bet > 0){
            if(bet > player.money){// Checks to see if player has enough money for their bet
              this.sendCompactEmbed("Error", ":warning: You dont have that much Money! You have $" + numeral(player.money).format('0,0.00'), data);
              return;
            }else{
              player.money -= bet;
              player.money = numeral(player.money).value();
            }
            var wheelInfo = {
              bet: bet,
              betperspot: (bet / winspots.length),
              player: player,
              winAmount: 0,
              xpAward: 0,
              wheelNumber: self.getRandomIntInclusive(0,(this.wheelItems.length - 1)),
              winspots: winspots,
              whatcontains: whatcontains
            }
            wheelInfo.ball = self.wheelItems[wheelInfo.wheelNumber];
            self.calculateWheelWins(wheelInfo);
            player.money += wheelInfo.winAmount;
            player.xp += wheelInfo.xpAward;
            console.log("[Casino - " + self.getDateTime() + "] Wheel Player: " + player.name + " bet: " + bet + " Win: " + wheelInfo.winAmount);
            this.disnode.service.SendEmbed({
              color: 3447003,
              author: {},
              fields: [ {
                name: ':money_with_wings: The Wheel :money_with_wings:',
                inline: false,
                value: wheelInfo.ball.display,
              }, {
                name: 'Bet',
                inline: true,
                value: "$" + numeral(bet).format('0,0.00'),
              }, {
                name: 'bet per Type',
                inline: false,
                value: "$" + numeral(wheelInfo.betperspot).format('0,0.00'),
              }, {
                name: 'Winnings',
                inline: true,
                value: "$" + numeral(wheelInfo.winAmount).format('0,0.00'),
              }, {
                name: 'Net Gain',
                inline: true,
                value: "$" + numeral(wheelInfo.winAmount - bet).format('0,0.00'),
              }, {
                name: 'Balance',
                inline: true,
                value: "$" + numeral(player.money).format('0,0.00'),
              }, {
                name: 'XP',
                inline: true,
                value: player.xp,
              }],
                footer: {}
              },
            data.msg);
            var currentDate = new Date();
            var hour = currentDate.getHours();
            hour = (hour < 10 ? "0" : "") + hour;
            var min  = currentDate.getMinutes();
            min = (min < 10 ? "0" : "") + min;
            var sec  = currentDate.getSeconds();
            sec = (sec < 10 ? "0" : "") + sec;
            player.lastMessage = {
              hour: parseInt(hour),
              min: parseInt(min),
              sec: parseInt(sec),
            }
          }else{
            this.sendCompactEmbed("Error", ":warning: Please Enter a Number for your bet!", data);
          }
        }else {
          self.sendCompactEmbed("Error", ":warning: Please use a number for your bet!", data)
        }
        break;
      case "info":
        this.disnode.service.SendEmbed({
          color: 3447003,
          author: {},
          fields: [ {
            name: ':money_with_wings: The Wheel :money_with_wings:',
            inline: false,
            value: "The Wheel acts much like Roulette however it has a differeing rule set to Roulette.",
          }, {
            name: 'Playing The Wheel',
            inline: false,
            value: "You can play the wheel by typing in `!casino wheel spin [bet] [betType] [betType] ...` EXAMPLE: `!casino wheel spin 100 black`",
          }, {
            name: 'Bet Types',
            inline: true,
            value: "As shown bet types can be one of the following: `[black,red,(0-36),even,odd,1st,2nd,3rd,low,high]`\n`Black / Red` Number must match color to win.\n`Even / Odd` Win if the number is even or odd depending on what you choose\n`1st / 2nd / 3rd` 1st is numbers 1-12, 2nd is numbers 13-24, 3rd is numbers 25-36\n`Low / High` Low is 1-18, and High is 19-36",
          }, {
            name: 'Winnings',
            inline: true,
            value: "0 - 37x\nany other number - 36x\n1st/2nd/3rd 3x\nEven/odd/black/red/low/high 2x",
          }, {
            name: 'Numbers',
            inline: true,
            value: ":white_circle: # ~ 0\n:red_circle: # ~ 1, 2, 5, 6, 9, 10, 13, 14, 17, 18, 21, 22, 25, 26, 29, 30, 33, 34\n:black_circle:  # ~ 3, 4, 7, 8, 11, 12, 15, 16, 19, 20, 23, 24, 27, 28, 31, 32, 35, 36,"
          }],
            footer: {}
          },
        data.msg);
        break;
      default:
      this.disnode.service.SendEmbed({
        color: 3447003,
        author: {},
        fields: [ {
          name: "The Wheel (Roulette)",
          inline: false,
          value: "Welcome to The Wheel! You can play by using this command `!casino wheel spin [bet] [betType]` Examples `!casino wheel spin 100 black`\nFor more info on what win types are and how the game is payed out use `!casino wheel info`",
        }],
          footer: {}
        },
      data.msg);
        break;
    }
  }
  transferCommand(data){
    var self = this;
    var player = self.getPlayer(data);
    self.CheckforCreated(player, data);
    if(self.checkBan(player, data))return;
    var transferPlayer;
    if(data.params[0]){
      var otherID = self.parseMention(data.params[0]);
      for (var i = 0; i < self.casinoObj.players.length; i++) {
        if(self.casinoObj.players[i].id == otherID){
          transferPlayer = self.casinoObj.players[i];
          var toTransfer = numeral(data.params[1]).value();
          if(toTransfer > 0){
            if(toTransfer > player.money){
              this.sendCompactEmbed("Error", ":warning: You dont have that much Money! You have $" + numeral(player.money).format('0,0.00'), data);
              return;
            }else {
              var pbalbef = player.money
              var sbalbef = transferPlayer.money
              player.money -= toTransfer;
              transferPlayer.money += toTransfer
              player.money = Number(parseFloat(player.money).toFixed(2));
              transferPlayer.money = Number(parseFloat(transferPlayer.money).toFixed(2));
            }
            self.save(self.cobpath, self.casinoObj);
            this.disnode.service.SendEmbed({
              color: 3447003,
              author: {},
              fields: [ {
                name: 'From',
                inline: false,
                value: player.name + "\nBalance Proir: $" + numeral(pbalbef).format('0,0.00') + "\nBalance After: $" + numeral(player.money).format('0,0.00'),
              }, {
                name: 'To',
                inline: false,
                value: transferPlayer.name + "\nBalance Proir: $" + numeral(sbalbef).format('0,0.00') + "\nBalance After: $" + numeral(transferPlayer.money).format('0,0.00'),
              }, {
                name: 'Amount',
                inline: true,
                value: "$ " + numeral(toTransfer).format('0,0.00'),
              }, {
                name: "Status",
                inline: false,
                value: ":white_check_mark: Transfer complete!",
              }],
                footer: {}
              },
            data.msg);
            return;
          }else {
            this.sendCompactEmbed("Error", ":warning: Please enter a number for the transfer amount! example `!casino transfer FireGamer3 100`", data);
          }
          return;
        }
      }
      for (var i = 0; i < self.casinoObj.players.length; i++) {
        if(self.casinoObj.players[i].name.toLowerCase() == data.params[0].toLowerCase()){
          transferPlayer = self.casinoObj.players[i];
          var toTransfer = numeral(data.params[1]).value();
          if(toTransfer > 0){
            if(toTransfer > player.money){
              this.sendCompactEmbed("Error", ":warning: You dont have that much Money! You have $" + numeral(player.money).format('0,0.00'), data);
              return;
            }else {
              var pbalbef = player.money
              var sbalbef = transferPlayer.money
              player.money -= toTransfer;
              transferPlayer.money += toTransfer
              player.money = Number(parseFloat(player.money).toFixed(2));
              transferPlayer.money = Number(parseFloat(transferPlayer.money).toFixed(2));
            }
            self.save(self.cobpath, self.casinoObj);
            this.disnode.service.SendEmbed({
              color: 3447003,
              author: {},
              fields: [ {
                name: 'From',
                inline: false,
                value: player.name + "\nBalance Proir: $" + numeral(pbalbef).format('0,0.00') + "\nBalance After: $" + numeral(player.money).format('0,0.00'),
              }, {
                name: 'To',
                inline: false,
                value: transferPlayer.name + "\nBalance Proir: $" + numeral(sbalbef).format('0,0.00') + "\nBalance After: $" + numeral(transferPlayer.money).format('0,0.00'),
              }, {
                name: 'Amount',
                inline: true,
                value: "$ " + numeral(toTransfer).format('0,0.00'),
              }, {
                name: "Status",
                inline: false,
                value: ":white_check_mark: Transfer complete!",
              }],
                footer: {}
              },
            data.msg);
            return;
          }else {
            this.sendCompactEmbed("Error", ":warning: Please enter a number for the transfer amount! example `!casino transfer FireGamer3 100`", data);
          }
          return;
        }
      }
      var found = [];
      var msg = "Did you mean?\n";
      for (var i = 0; i < self.casinoObj.players.length; i++) {
      if(data.params[0].length < 3)break;
        if(self.casinoObj.players[i].name.toLowerCase().includes(data.params[0].toLowerCase())){
          found.push(self.casinoObj.players[i])
        }
      }
      if(found.length == 1){
        transferPlayer = found[0];
        var toTransfer = numeral(data.params[1]).value();
        if(toTransfer > 0){
          if(toTransfer > player.money){
            this.sendCompactEmbed("Error", ":warning: You dont have that much Money! You have $" + numeral(player.money).format('0,0.00'), data);
            return;
          }else {
            var pbalbef = player.money
            var sbalbef = transferPlayer.money
            player.money -= toTransfer;
            transferPlayer.money += toTransfer
            player.money = Number(parseFloat(player.money).toFixed(2));
            transferPlayer.money = Number(parseFloat(transferPlayer.money).toFixed(2));
          }
          self.save(self.cobpath, self.casinoObj);
          this.disnode.service.SendEmbed({
            color: 3447003,
            author: {},
            fields: [ {
              name: 'From',
              inline: false,
              value: player.name + "\nBalance Proir: $" + numeral(pbalbef).format('0,0.00') + "\nBalance After: $" + numeral(player.money).format('0,0.00'),
            }, {
              name: 'To',
              inline: false,
              value: transferPlayer.name + "\nBalance Proir: $" + numeral(sbalbef).format('0,0.00') + "\nBalance After: $" + numeral(transferPlayer.money).format('0,0.00'),
            }, {
              name: 'Amount',
              inline: true,
              value: "$ " + numeral(toTransfer).format('0,0.00'),
            }, {
              name: "Status",
              inline: false,
              value: ":white_check_mark: Transfer complete!",
            }],
              footer: {}
            },
          data.msg);
          return;
        }
      }
      for (var i = 0; i < found.length; i++) {
        msg += "**" + found[i].name + "**\n"
      }
      if(found.length > 0){
        this.sendCompactEmbed("Error", ":warning: Player card Not Found Please @mention the user you are trying to send to or make sure you have the correct name if not using a @mention! Also make sure they have a account on the game!\n\n" + msg, data);
      }else {
        this.sendCompactEmbed("Error", ":warning: Player card Not Found Please @mention the user you are trying to send to or make sure you have the correct name if not using a @mention! Also make sure they have a account on the game!", data);
      }
    }else{
      this.sendCompactEmbed("Error", ":warning: Please enter a username to send to! example: `!casino transfer FireGamer3 100`\nIf the username has a space in it use quotes, Example: `!casino transfer \"VictoryForPhil / Atec\" 100`", data);
    }
  }
  coinflipCommand(data){
    var self = this;
    var player = self.getPlayer(data);
    self.CheckforCreated(player, data);
    if(self.checkBan(player, data))return;
    player.money = Number(parseFloat(player.money).toFixed(2));
    var flipinfo = {
      flip: self.getRandomIntInclusive(0,1),
      winText: "",
      winAmount: 0,
      playerPick: 0,
      tag: ""
    }
    if(data.params[0] == "heads"){
      flipinfo.playerPick = 0;
      flipinfo.tag = "Heads";
      flipinfo.ltag = "Tails";
    }else if (data.params[0] == "tails") {
      flipinfo.playerPick = 1;
      flipinfo.tag = "Tails";
      flipinfo.ltag = "Heads";
    }else {
      this.sendCompactEmbed("Coin Flip", "Welcome to Coin Flip! You can play by using this command `!casino flip [heads/tails] [bet]` Examples `!casino flip heads 100` and `!casino flip tails 100`", data);
      return;
    }if(data.params[1]){
      if(data.params[1].toLowerCase() == "allin"){
        data.params[1] = player.money;
      }
    }
    if(numeral(data.params[1]).value() >= 1){
      var bet;
      var bet = numeral(data.params[1]).value();
      var timeoutInfo = self.checkTimeout(player, 5);
      if(player.Admin || player.Premium)timeoutInfo = self.checkTimeout(player, 2);
      if(!timeoutInfo.pass){
        this.sendCompactEmbed("Error", ":warning: You must wait **" + timeoutInfo.remain.sec + " seconds** before playing again.", data);
        return;
      }
      if(bet > player.money){// Checks to see if player has enough money for their bet
        this.sendCompactEmbed("Error", ":warning: You dont have that much Money! You have $" + numeral(player.money).format('0,0.00'), data);
        return;
      }else{
        player.money -= bet;
        player.money = Number(parseFloat(player.money).toFixed(2));
      }
      player.stats.coinPlays++;
      if(flipinfo.flip == flipinfo.playerPick){
        player.stats.coinWins++;
        if(flipinfo.playerPick == 0){
          player.stats.coinHeads++;
        }else player.stats.coinTails++;
        flipinfo.winText = flipinfo.tag + " You Win!"
        flipinfo.winAmount = Number(parseFloat(bet * 1.75).toFixed(2));
        player.stats.moneyWon += Number(parseFloat(flipinfo.winAmount).toFixed(2));
        player.stats.moneyWon = Number(parseFloat(player.stats.moneyWon).toFixed(2));
        player.money += Number(parseFloat(flipinfo.winAmount).toFixed(2));
        player.money = Number(parseFloat(player.money).toFixed(2));
        if(bet >= 1000){
          player.xp += 5;
        }else {
          flipinfo.winText += " `You bet lower than $1,000 fair warning here, you wont get any XP`"
        }
        console.log("[Casino " + self.getDateTime() + "] Player: " + player.name + " Has Won Coin Flip Winnings: " + flipinfo.winAmount + "original bet: " + bet);
        self.updateLastSeen(player);
        this.disnode.service.SendEmbed({
          color: 3447003,
          author: {},
          fields: [ {
            name: ':moneybag: Coin Flip :moneybag:',
            inline: false,
            value: flipinfo.winText,
          }, {
            name: 'Bet',
            inline: true,
            value: "$" + numeral(bet).format('0,0.00'),
          }, {
            name: 'Winnings',
            inline: true,
            value: "$" + numeral(flipinfo.winAmount).format('0,0.00'),
          }, {
            name: 'Net Gain',
            inline: true,
            value: "$" + numeral(flipinfo.winAmount - bet).format('0,0.00'),
          }, {
            name: 'Balance',
            inline: true,
            value: "$" + numeral(player.money).format('0,0.00'),
          }, {
            name: 'XP',
            inline: true,
            value: player.xp,
          }],
            footer: {}
          },
        data.msg);
        var currentDate = new Date();
        var hour = currentDate.getHours();
        hour = (hour < 10 ? "0" : "") + hour;
        var min  = currentDate.getMinutes();
        min = (min < 10 ? "0" : "") + min;
        var sec  = currentDate.getSeconds();
        sec = (sec < 10 ? "0" : "") + sec;
        player.lastMessage = {
          hour: parseInt(hour),
          min: parseInt(min),
          sec: parseInt(sec),
        }
      }else {
        flipinfo.winText = flipinfo.ltag + " House Wins!";
        if(bet >= 1000){}else {
          flipinfo.winText += " `You bet lower than $1,000 fair warning here, you wont get any XP`"
        }
        if(flipinfo.playerPick == 0){
          player.stats.coinTails++;
        }else player.stats.coinHeads++;
        console.log("[Casino " + self.getDateTime() + "] Player: " + player.name + " Has Lost Coin Flip Winnings: " + flipinfo.winAmount + "original bet: " + bet);
        self.updateLastSeen(player);
        this.disnode.service.SendEmbed({
          color: 3447003,
          author: {},
          fields: [ {
            name: ':moneybag: Coin Flip :moneybag:',
            inline: false,
            value: flipinfo.winText,
          }, {
            name: 'Bet',
            inline: true,
            value: "$" + numeral(bet).format('0,0.00'),
          }, {
            name: 'Winnings',
            inline: true,
            value: "$" + numeral(flipinfo.winAmount).format('0,0.00'),
          }, {
            name: 'Net Gain',
            inline: true,
            value: "$" + numeral(flipinfo.winAmount - bet).format('0,0.00'),
          }, {
            name: 'Balance',
            inline: true,
            value: "$" + numeral(player.money).format('0,0.00'),
          }, {
            name: 'XP',
            inline: true,
            value: player.xp,
          }],
            footer: {}
          },
        data.msg);
        var currentDate = new Date();
        var hour = currentDate.getHours();
        hour = (hour < 10 ? "0" : "") + hour;
        var min  = currentDate.getMinutes();
        min = (min < 10 ? "0" : "") + min;
        var sec  = currentDate.getSeconds();
        sec = (sec < 10 ? "0" : "") + sec;
        player.lastMessage = {
          hour: parseInt(hour),
          min: parseInt(min),
          sec: parseInt(sec),
        }
      }
    }else {
      this.sendCompactEmbed("Error", ":warning: Please enter a bet! Example `!casino flip tails 100`", data);
    }
  }
  adminCommand(data){
    var self = this;
    var player = self.getPlayer(data);
    self.CheckforCreated(player, data);
    if(self.checkBan(player, data))return;
    if(player.Admin == undefined)player.Admin = false;
    if(!player.Admin){
      this.sendCompactEmbed("Error", ":warning: YOU SHALL NOT PASS! (**You are not an admin**)", data);
    }else{
      switch (data.params[0]) {
        case "ban":
        var players;
        if(data.params[1]){
          for (var i = 0; i < self.casinoObj.players.length; i++) {
            if(self.casinoObj.players[i].name == data.params[1]){
              players = self.casinoObj.players[i];
              if(!players.banned){
                players.money = 0;
                players.perUpdate = 0;
                players.banned = true;
                if(data.params[2]){
                  players.banreason = data.params[2]
                }else {
                  players.banreason = "You have been banned! The admin that banned you didn't provide a reason."
                }
                this.sendCompactEmbed("Action Complete", ":white_check_mark: Player: " + players.name + "Is now banned with the Reason: " + players.banreason, data);
              }else {
                players.money = 50000;
                players.perUpdate = 10000;
                players.xp = 0;
                players.banned = false;
                players.banreason = "";
                this.sendCompactEmbed("Action Complete", ":white_check_mark: Player: " + players.name + "Is now unbanned", data);
              }
              return;
            }
          }
          this.sendCompactEmbed("Error", ":warning: Could not find a player card for: `" + data.params[0] + "`", data);
        }else{
          this.sendCompactEmbed("Error", ":warning: Please enter a username!", data);
        }
          break;
        case "player":
          switch (data.params[1]) {
            case "get":
              var otherID = self.parseMention(data.params[2]);
              for (var i = 0; i < self.casinoObj.players.length; i++) {
                if(self.casinoObj.players[i].id == otherID){
                  data.msg.channel.sendMessage("```json\n" + JSON.stringify(self.casinoObj.players[i], false, 2) + "```");
                  break;
                }
              }
              for (var i = 0; i < self.casinoObj.players.length; i++) {
                if(self.casinoObj.players[i].name == data.params[2]){
                  data.msg.channel.sendMessage("```json\n" + JSON.stringify(self.casinoObj.players[i], false, 2) + "```");
                  break;
                }
              }
              break;
            case "set":
              switch (data.params[2]) {
                case "money":
                  var otherID = self.parseMention(data.params[3]);
                  for (var i = 0; i < self.casinoObj.players.length; i++) {
                    if(self.casinoObj.players[i].id == otherID){
                      var setTo = numeral(data.params[4]).value();
                      if(setTo > 0)self.casinoObj.players[i].money = setTo;
                      this.sendCompactEmbed("Complete", self.casinoObj.players[i].name + " Money set to: $" + setTo, data);
                      break;
                    }
                  }
                  for (var i = 0; i < self.casinoObj.players.length; i++) {
                    if(self.casinoObj.players[i].name == data.params[3]){
                      var setTo = numeral(data.params[4]).value();
                      if(setTo > 0)self.casinoObj.players[i].money = setTo;
                      this.sendCompactEmbed("Complete", self.casinoObj.players[i].name + " Money set to: $" + setTo, data);
                      break;
                    }
                  }
                  break;
                case "income":
                  var otherID = self.parseMention(data.params[3]);
                  for (var i = 0; i < self.casinoObj.players.length; i++) {
                    if(self.casinoObj.players[i].id == otherID){
                      var setTo = numeral(data.params[4]).value();
                      if(setTo > 0)self.casinoObj.players[i].perUpdate = setTo;
                      this.sendCompactEmbed("Complete", self.casinoObj.players[i].name + " Income set to: $" + setTo, data);
                      break;
                    }
                  }
                  for (var i = 0; i < self.casinoObj.players.length; i++) {
                    if(self.casinoObj.players[i].name == data.params[3]){
                      var setTo = numeral(data.params[4]).value();
                      if(setTo > 0)self.casinoObj.players[i].perUpdate = setTo;
                      this.sendCompactEmbed("Complete", self.casinoObj.players[i].name + " Income set to: $" + setTo, data);
                      break;
                    }
                  }
                  break;
                case "xp":
                  var otherID = self.parseMention(data.params[3]);
                  for (var i = 0; i < self.casinoObj.players.length; i++) {
                    if(self.casinoObj.players[i].id == otherID){
                      var setTo = numeral(data.params[4]).value();
                      if(setTo >= 0)self.casinoObj.players[i].xp = setTo;
                      this.sendCompactEmbed("Complete", self.casinoObj.players[i].name + " XP set to: " + setTo, data);
                      break;
                    }
                  }
                  for (var i = 0; i < self.casinoObj.players.length; i++) {
                    if(self.casinoObj.players[i].name == data.params[3]){
                      var setTo = numeral(data.params[4]).value();
                      if(setTo >= 0)self.casinoObj.players[i].xp = setTo;
                      this.sendCompactEmbed("Complete", self.casinoObj.players[i].name + " XP set to: " + setTo, data);
                      break;
                    }
                  }
                  break;
                case "name":
                  var otherID = self.parseMention(data.params[3]);
                  for (var i = 0; i < self.casinoObj.players.length; i++) {
                    if(self.casinoObj.players[i].id == otherID){
                      var setTo = data.params[4];
                      var oldname = self.casinoObj.players[i].name;
                      self.casinoObj.players[i].name = setTo;
                      this.sendCompactEmbed("Complete", oldname + " Name set to: " + setTo, data);
                      break;
                    }
                  }
                  for (var i = 0; i < self.casinoObj.players.length; i++) {
                    if(self.casinoObj.players[i].name == data.params[3]){
                      var setTo = data.params[4];
                      var oldname = self.casinoObj.players[i].name;
                      self.casinoObj.players[i].name = setTo;
                      this.sendCompactEmbed("Complete", oldname + " Name set to: " + setTo, data);
                      break;
                    }
                  }
                  break;
                default:

              }
              break;
            default:

          }
          break;
        case "jackpot":
          var setTo = Number(parseFloat(data.params[1]).toFixed(2));
          self.casinoObj.jackpotValue = setTo;
          this.sendCompactEmbed("Complete", "JACKPOT Value set to: $" + setTo, data);
          break;
        case "cleartimers":
          for (var i = 0; i < self.casinoObj.players.length; i++) {
            self.casinoObj.players[i].lastMessage = null;
          }
          this.sendCompactEmbed("Action Complete", ":white_check_mark: Player Timeouts Cleared!", data);
          break;
        case "prem":
          var player;
          if(data.params[1]){
            for (var i = 0; i < self.casinoObj.players.length; i++) {
              if(self.casinoObj.players[i].name == data.params[1]){
                player = self.casinoObj.players[i];
                if(data.params[2] == "true"){
                  player.Premium = true;
                  player.money += 25000;
                  player.xp += 2000;
                }else if (data.params[2] == "false") {
                  player.Premium = false;
                }else return;
                this.sendCompactEmbed("Action Complete", ":white_check_mark: Premium set to:`" + data.params[2] + "` for Player: `" + data.params[1] + "`", data);
                return;
              }
            }
            this.sendCompactEmbed("Error", ":warning: Could not find a player card for: `" + data.params[0] + "`", data);
          }else{
            this.sendCompactEmbed("Error", ":warning: Please enter a username!", data);
          }
          break;
        default:
          break;
      }
    }
  }
  topCommand(data){
    var self = this;
    var player = self.getPlayer(data);
    self.CheckforCreated(player, data);
    if(self.checkBan(player, data))return;
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
    var page = 1;
    var maxindex;
    var startindex;
    console.log(data.params[0]);
    if (parseInt(data.params[0]) >= 1) {
      console.log("greater than 1!");
      page = Number(parseInt(data.params[0]));
      console.log(page);
    }
    if (page == 1) {
      page = 1;
      startindex = 0
      maxindex = 10;
    }else {
      maxindex = (page * 10);
      startindex = maxindex - 10;
    }

    var msg = "**Page:** " + page + "\n";
    for (var i = startindex; i < orderTop.length; i++) {
      if(i == maxindex)break;
      msg += "" + (i + 1) + ". **" + orderTop[i].name + "** - $" + numeral(orderTop[i].money).format('0,0.00') + "\n";
    }
    this.sendCompactEmbed("Wealthiest Players", msg, data);
  }
  storeCommand(data){
    var self = this;
    var player = self.getPlayer(data);
    self.CheckforCreated(player, data);
    if(self.checkBan(player, data))return;
    if(data.params[0] == "buy"){
      var costString = "";
      if(data.params[1] && (data.params[1] >= 0 && data.params[1] <= (self.store.length - 1))){
        var ID = parseInt(data.params[1]);
        var quantity = 0;
        if(data.params[2] == "max"){
          if(player.Admin || player.Premium){
            if(self.store[ID].type == 0){
              quantity = Math.floor((player.xp / (self.store[ID].cost / 2)));
            }else {
              quantity = Math.floor((player.money / (self.store[ID].cost / 2)));
            }
          }else {
            if(self.store[ID].type == 0){
              quantity = Math.floor((player.xp / (self.store[ID].cost)));
            }else {
              quantity = Math.floor((player.money / (self.store[ID].cost)));
            }
          }
        }else quantity = numeral(data.params[2]).value();
        if(quantity < 1){
          quantity = 1;
        }
        var cost;
        if(player.Admin || player.Premium){
          cost = (self.store[ID].cost /2) * quantity;
        }else cost = self.store[ID].cost * quantity;
        if(self.store[ID].type == 0){
          costString = cost + " XP"
          if(player.xp < cost){
            this.sendCompactEmbed("Error", ":warning: You dont have that much XP!\nNeed: " + cost + "XP\nYou have: " + player.xp, data);
            return;
          }
        }else {
          costString = "$" + numeral(cost).format('0,0.00');
          if(player.money < cost){
            this.sendCompactEmbed("Error", ":warning: You dont have that much Money!\nNeed: $" + numeral(cost).format('0,0.00') + "\nYou have: $" + numeral(player.money).format('0,0.00'), data);
            return;
          }
        }
        switch (ID) {
          case 0:
            player.xp -= cost;
            player.money += (1000 * quantity);
            break;
          case 1:
            player.xp -= cost;
            player.money += (2500 * quantity);
            break;
          case 2:
            player.xp -= cost;
            player.money += (5000 * quantity);
            break;
          case 3:
            player.xp -= cost;
            player.money += (10000 * quantity);
            break;
          case 4:
            player.xp -= cost;
            player.money += (20000 * quantity);
            break;
          case 5:
            player.xp -= cost;
            player.money += (30000 * quantity);
            break;
          case 6:
            player.xp -= cost;
            player.perUpdate += (50 * quantity);
            break;
          case 7:
            player.xp -= cost;
            player.perUpdate += (100 * quantity);
            break;
          case 8:
            player.xp -= cost;
            player.perUpdate += (200 * quantity);
            break;
          case 9:
            player.xp -= cost;
            player.perUpdate += (400 * quantity);
            break;
          case 10:
            player.xp -= cost;
            player.perUpdate += (800 * quantity);
            break;
          case 11:
            player.xp -= cost;
            player.perUpdate += (1600 * quantity);
            break;
          case 12:
            player.money -= cost;
            player.xp += (50 * quantity);
            break;
          case 13:
            player.money -= cost;
            player.xp += (100 * quantity);
            break;
          case 14:
            player.money -= cost;
            player.xp += (200 * quantity);
            break;
          case 15:
            player.money -= cost;
            player.xp += (400 * quantity);
            break;
          case 16:
            player.money -= cost;
            player.xp += (800 * quantity);
            break;
          case 17:
            player.money -= cost;
            player.xp += (1600 * quantity);
            break;
          case 18:
            player.money -= cost;
            player.xp += (3200 * quantity);
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
            value: ":white_check_mark: Your purchase of `" + quantity + "x " + self.store[ID].item + "` was successful! Thank you for your business!",
          }, {
            name: 'Money',
            inline: true,
            value: "$" + numeral(player.money).format('0,0.00'),
          }, {
            name: 'Income / 30min.',
            inline: true,
            value: "$" + numeral(player.perUpdate).format('0,0.00'),
          }, {
            name: 'XP',
            inline: true,
            value: player.xp,
          }],
            footer: {}
          },
        data.msg);
      }else {
        this.sendCompactEmbed("Error", ":warning: Please enter a numeric value for the Item ID you wish to buy `0 - "+ (self.store.length - 1) +"`. Example: `!casino store buy 0`", data);
      }
    }else if(data.params[0] == "list"){
      var msg = "**ID**\t//\t**ITEM**\t//\t**COST**\n";
      for (var i = 0; i < self.store.length; i++) {
        var cost;
        if(player.Admin || player.Premium){
          cost = (self.store[i].cost /2)
        }else cost = self.store[i].cost;
        if(self.store[i].type == 0){
          msg += "" + i + "\t//\t" + self.store[i].item + "\t//\t" + cost + "XP\n";
        }else {
          msg += "" + i + "\t//\t" + self.store[i].item + "\t//\t$" + numeral(cost).format('0,0.00') + "\n";
        }
      }
      msg += "Store items are subject to change, please be aware of prices and items PRIOR to making a purchase!";
      var title;
      if(player.Admin || player.Premium){
        title = "Premium Store List";
      }else title = "Store List";
      this.sendCompactEmbed(title, msg, data);
    }else{
      this.sendCompactEmbed("Error", "Welcome to the store! to see a list of Items use `!casino store list` use the ID of the item when buying for example `!casino store buy 0`", data);
    }
  }
  slotCommand(data){
    var self = this;
    var player = self.getPlayer(data);
    self.CheckforCreated(player, data);
    if(self.checkBan(player, data)){
      console.log("[Casino " + self.getDateTime() + "] Player: " + player.name + " Tried running slots but is banned!");
      return;
    }
    player.money = Number(player.money);
    if(data.params[0] == "info"){
      if(player.money > 66000){
        var minJackpotBet = (player.money * 0.015);
      }else var minJackpotBet = 1000;
      minJackpotBet = parseFloat(minJackpotBet.toFixed(2));
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
          name: 'Minimum bet to Win JACKPOT',
          inline: false,
          value: "Minimum bet: $**" + numeral(minJackpotBet).format('0,0.00') + "** (if money < 66,000 min bet = 1000) else (min bet = money * 0.015 or 1.5%))"
        },{
          name: 'XP',
          inline: false,
          value: "The XP system has changed a bit, if your bet is lower than $1000, you will not get any XP",
        },{
          name: 'JACKPOT',
          inline: false,
          value: "JACKPOT Value is increased every time someone plays slots, the value is increased by the players bet amount and has a default value of $1,000,000\n**Current JACKPOT Value: **$" + numeral(self.casinoObj.jackpotValue).format('0,0.00'),
        }, {
          name: 'JACKPOT History',
          inline: true,
          value: "**Last won by:** " + self.casinoObj.jackpotstat.lastWon,
        }],
          footer: {}
        }, data.msg);
    }else{
      //else not looking for info
      if(data.params[0] == "" || data.params[0] == undefined){
        //no params give tidbit of info
        this.sendCompactEmbed("Error", "Hi, Welcome to the slots! If you need info on the slots the run `!casino slot info`\n\nIf you want to try the slots then do `!casino slot [bet]` for example `casino slot 100` that will run the slot with $100 as the bet", data);
      }else{
        if(data.params[0].toLowerCase() == "allin"){
          data.params[0] = player.money;
        }
        // there is something in params
        if(parseFloat(data.params[0]) > 0.01){
          var bet = numeral(data.params[0]).value();
          //greater than 0
          var timeoutInfo = self.checkTimeout(player, 5);
          if(player.Admin || player.Premium)timeoutInfo = self.checkTimeout(player, 2);
          if(!timeoutInfo.pass){
            console.log("[Casino " + self.getDateTime() + "] Player: " + player.name + " Tried the slots before their delay of: " + timeoutInfo.remain.sec);
            this.sendCompactEmbed("Error", ":warning: You must wait **" + timeoutInfo.remain.sec + " seconds** before playing again.", data);
            return;
          }
          if(bet > 0){
            if(bet > player.money | bet == NaN | bet == "NaN"){// Checks to see if player has enough money for their bet
              console.log("Bet: " + bet + " Money: " + numeral(player.money).format('0,0.00'));
              this.sendCompactEmbed("Error", ":warning: You dont have that much Money! You have $" + numeral(player.money).format('0,0.00'), data);
              return;
            }else{
              player.money -= parseFloat(bet);
              self.casinoObj.jackpotValue += parseFloat(bet);
              player.money = parseFloat(player.money.toFixed(2));
              self.casinoObj.jackpotValue = parseFloat(self.casinoObj.jackpotValue.toFixed(2));
            }
            var slotInfo = {
              bet: bet,
              player: player,
              winText: "",
              winAmount: 0,
              reel1: self.slotItems[self.getRandomIntInclusive(0,(self.slotItems.length - 1))].item,
              reel2: self.slotItems[self.getRandomIntInclusive(0,(self.slotItems.length - 1))].item,
              reel3: self.slotItems[self.getRandomIntInclusive(0,(self.slotItems.length - 1))].item,
              fake1: self.slotItems[self.getRandomIntInclusive(0,(self.slotItems.length - 1))].item,
              fake2: self.slotItems[self.getRandomIntInclusive(0,(self.slotItems.length - 1))].item,
              fake3: self.slotItems[self.getRandomIntInclusive(0,(self.slotItems.length - 1))].item,
              fake4: self.slotItems[self.getRandomIntInclusive(0,(self.slotItems.length - 1))].item,
              fake5: self.slotItems[self.getRandomIntInclusive(0,(self.slotItems.length - 1))].item,
              fake6: self.slotItems[self.getRandomIntInclusive(0,(self.slotItems.length - 1))].item
            }
            self.didWin(slotInfo);
            if(player.money > 66000){
              var minJackpotBet = (player.money * 0.015);
            }else var minJackpotBet = 1000;
            if(timeoutInfo.remain){
              console.log("[Casino " + self.getDateTime() + "] Player: " + player.name + " Slot Winnings: " + slotInfo.winAmount + " original bet: " + bet + " Time since they could use this command again: " + timeoutInfo.remain.sec);
            }else {
              console.log("[Casino " + self.getDateTime() + "] Player: " + player.name + " Slot Winnings: " + slotInfo.winAmount + " original bet: " + bet);
            }
            player.money = parseFloat(player.money.toFixed(2));
            minJackpotBet = parseFloat(minJackpotBet.toFixed(2));
            player.stats.moneyWon = parseFloat(parseFloat(player.stats.moneyWon) + parseFloat(slotInfo.winAmount));
            player.stats.moneyWon = player.stats.moneyWon.toFixed(2);
            self.casinoObj.jackpotValue = parseFloat(self.casinoObj.jackpotValue.toFixed(2));
            self.handleRecentBetters(player);
            self.updateLastSeen(player);
            this.disnode.service.SendEmbed({
              color: 3447003,
              author: {},
              fields: [ {
                name: ':slot_machine: ' + player.name + ' Slots Result :slot_machine:',
                inline: false,
                value: "| " + slotInfo.fake1 + slotInfo.fake2 + slotInfo.fake3 + " |\n**>**" + slotInfo.reel1 + slotInfo.reel2 + slotInfo.reel3 +"**<** Pay Line\n| " + slotInfo.fake4 + slotInfo.fake5 + slotInfo.fake6 + " |\n\n" + slotInfo.winText,
              }, {
                name: 'Bet',
                inline: true,
                value: "$" + numeral(bet).format('0,0.00'),
              }, {
                name: 'Winnings',
                inline: true,
                value: "$" + numeral(slotInfo.winAmount).format('0,0.00'),
              }, {
                name: 'Net Gain',
                inline: true,
                value: "$" + numeral(slotInfo.winAmount - bet).format('0,0.00'),
              }, {
                name: 'Balance',
                inline: false,
                value: "$" + numeral(player.money).format('0,0.00'),
              }, {
                name: 'Minimum JACKPOT bet',
                inline: true,
                value: "$" + numeral(minJackpotBet).format('0,0.00'),
              }, {
                name: 'JACKPOT Value',
                inline: true,
                value: "$" + numeral(self.casinoObj.jackpotValue).format('0,0.00'),
              }, {
                name: 'XP',
                inline: true,
                value: player.xp,
              }],
                footer: {}
              },
            data.msg);
            var currentDate = new Date();
            var hour = currentDate.getHours();
            hour = (hour < 10 ? "0" : "") + hour;
            var min  = currentDate.getMinutes();
            min = (min < 10 ? "0" : "") + min;
            var sec  = currentDate.getSeconds();
            sec = (sec < 10 ? "0" : "") + sec;
            player.lastMessage = {
              hour: parseInt(hour),
              min: parseInt(min),
              sec: parseInt(sec),
            }
          }else {
            this.sendCompactEmbed("Error", ":warning: Please use a Number for bet or `!casino slot` for general help", data);
            return;
          }
        }else {
          //not greater than 0 or isn't a number!
          this.sendCompactEmbed("Error", ":warning: Please use a Number for bet or `!casino slot` for general help", data);
        }
        self.save(self.cobpath, self.casinoObj);
      }
    }
  }
  statsCommand(data){
    var self = this;
    var player = self.getPlayer(data);
    self.CheckforCreated(player, data);
    if(self.checkBan(player, data))return;
    if(data.params[0]){
      var foundPlayer = false;
      var otherID = self.parseMention(data.params[0]);
      for (var i = 0; i < self.casinoObj.players.length; i++) {
        if(self.casinoObj.players[i].id == otherID){
          player = self.casinoObj.players[i];
          foundPlayer = true;
        }
      }
      for (var i = 0; i < self.casinoObj.players.length; i++) {
        if(foundPlayer)break;
        if(self.casinoObj.players[i].name.toLowerCase() == data.params[0].toLowerCase()){
          player = self.casinoObj.players[i];
          foundPlayer = true;
        }
      }
      var found = [];
      var msg = "Did you mean?\n";
      for (var i = 0; i < self.casinoObj.players.length; i++) {
        if(foundPlayer)break;
        if(data.params[0].length <= 3)break;
        if(self.casinoObj.players[i].name.toLowerCase().includes(data.params[0].toLowerCase())){
          found.push(self.casinoObj.players[i])
        }
      }
      if(found.length == 1){
        player = found[0];
        foundPlayer = true;
      }
      for (var i = 0; i < found.length; i++) {
        msg += "**" + found[i].name + "**\n"
      }
      if(!foundPlayer){
        if(found.length > 0){
          this.sendCompactEmbed("Error", ":warning: Player card Not Found Please @mention the user you are trying to send to or make sure you have the correct name if not using a @mention! Also make sure they have a account on the game!\n\n" + msg, data);
        }else {
          this.sendCompactEmbed("Error", ":warning: Player card Not Found Please @mention the user you are trying to send to or make sure you have the correct name if not using a @mention! Also make sure they have a account on the game!", data);
        }
      }
    }
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
    for (var i = 0; i < orderTop.length; i++) {
      if(player.id == orderTop[i].id){
        var placement = "**Rank**: " + (i+1) + " **out of** " + (orderTop.length);
      }
    }
    var statsMessage = "" +
      "**Money Won**: $" + numeral(player.stats.moneyWon).format('0,0.00') + "\n\n" +
      placement + "\n\n" +
      "**Slot -=- Wins / Plays**:\t  " + player.stats.slotWins + " / " + player.stats.slotPlays + "\n" +
      "**Coin Flip -=- Wins / Plays**:\t  " + player.stats.coinWins + " / " + player.stats.coinPlays + "\n\n" +
      "**Slot Wins**:\n " +
      ":cherries: **Single cherries**: " + player.stats.slotSingleC + "\n" +
      ":cherries: :cherries: :cherries: **Triple cherries**: " + player.stats.slotTripleC + "\n" +
      ":third_place: :third_place: :third_place: **Triple 3\'s**: " + player.stats.slot3s + "\n" +
      ":second_place: :second_place: :second_place: **Triple 2\'s**: " + player.stats.slot2s + "\n" +
      ":first_place: :first_place: :first_place: **Triple 1\'s**: " + player.stats.slot1s + "\n" +
      ":100: :100: :100: **JACKPOTS**: " + player.stats.slotJackpots + "\n\n" +
      "**Coin Landed on Heads**: " + player.stats.coinHeads + "\n" +
      "**Coin Landed on Tails**: " + player.stats.coinTails;


    self.disnode.service.SendEmbed({
      color: 3447003,
      author: {},
      title: player.name,
      fields: [ {
        name: 'Player Stats',
        inline: false,
        value: statsMessage,
      }],
        footer: {}
      }, data.msg);
  }
  checkTimeout(player, seconds){
    var currentDate = new Date();
    var hour = currentDate.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    var min  = currentDate.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    var sec  = currentDate.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
    if(player.lastMessage == null){
      player.lastMessage = null;
      return {pass: true};
    }
    var remainingTime = {
      hour: Number(player.lastMessage.hour - hour),
      min: Number(player.lastMessage.min - min),
      sec: Number((player.lastMessage.sec + seconds) - sec)
    }
    if(remainingTime.min < 0 || remainingTime.sec < 0 || remainingTime.hour < 0){
      return {pass: true,  remain: remainingTime};
    }else if((remainingTime.min <= 0) & (remainingTime.sec <= 0)){
      return {pass: true,  remain: remainingTime};
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
      money: 50000,
      perUpdate: 10000,
      xp: 0,
      Premium: false,
      Admin: false,
      banned: false,
      banreason: "",
      stats: {
        moneyWon: 0,
        slotPlays: 0,
        coinPlays: 0,
        slotWins: 0,
        coinWins: 0,
        slotSingleC: 0,
        slotTripleC: 0,
        slot3s: 0,
        slot2s: 0,
        slot1s: 0,
        slotJackpots: 0,
        coinHeads: 0,
        coinTails: 0
      },
      createdChannel: data.msg.channel.name,
      createdServer: data.msg.channel.guild.name
    }
    for (var i = 0; i < self.casinoObj.players.length; i++) {
      if(self.casinoObj.players[i].name == newPlayer.name){
        newPlayer.name += "1";
        break;
      }
    }
    self.casinoObj.players.push(newPlayer);
    self.save(self.cobpath, self.casinoObj);
    return newPlayer;
  }
  CheckforCreated(player, data){
    if(player.createdChannel == undefined){
      player.createdChannel = data.msg.channel.name;
    }
    if(player.createdServer == undefined){
      if(data.msg.channel.guild){
        player.createdServer = data.msg.channel.guild.name;
      }
    }
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
    if(slot.player.money > 66000){
      var minJackpotBet = (slot.player.money * 0.015);
    }else var minJackpotBet = 1000;
    minJackpotBet = parseFloat(minJackpotBet.toFixed(2));
    slot.player.stats.slotPlays++;
    if((slot.reel1 == ":100:") && (slot.reel2 == ":100:") && (slot.reel3 == ":100:")){
      if(slot.bet < minJackpotBet){
        slot.winAmount = parseFloat((slot.bet * 60).toFixed(2));
        slot.winText = "YOU GOT A JACKPOT! however you didnt meet the minimum bet requirement ($" + minJackpotBet + ") to get the JACKPOT value so here is 60x your bet";
      }else {
        slot.winAmount = parseFloat(self.casinoObj.jackpotValue);
        self.casinoObj.jackpotValue = 1000000;
        slot.winText = "JACKPOT JACKPOT JACKPOT!!!!!";
        self.casinoObj.jackpotstat.lastWon = slot.player.name;
        if(slot.winAmount > self.casinoObj.jackpotstat.HighestWin){
          self.casinoObj.jackpotstat.HighestWin = slot.winAmount;
          self.casinoObj.jackpotstat.HighestBy = slot.player.name;
        }
      }
      slot.player.stats.slotJackpots++;
      slot.player.stats.slotWins++;
      slot.player.money += parseFloat(slot.winAmount);
      slot.player.xp += 1000;
      return;
    }
    if((slot.reel1 == ":first_place:") && (slot.reel2 == ":first_place:") && (slot.reel3 == ":first_place:")){
      slot.winAmount = parseFloat((slot.bet * 16).toFixed(2));
      slot.winText = "WINNER WINNER HUUUUGE MONEY!";
      if(slot.player.Premium || slot.player.Admin){
        slot.winText += " **(Premium Bonus!)**";
        slot.winAmount += parseFloat(slot.winAmount);
      }
      slot.player.stats.slot1s++;
      slot.player.stats.slotWins++;
      slot.player.money += parseFloat(slot.winAmount);
      if(slot.bet >= 1000){
        slot.player.xp += 80;
      }else {
        slot.winText += " `You bet lower than $1,000 fair warning here, you wont get any XP and you cant win the true JACKPOT`"
      }
      return;
    }
    if((slot.reel1 == ":second_place:") && (slot.reel2 == ":second_place:") && (slot.reel3 == ":second_place:")){
      slot.winAmount = parseFloat((slot.bet * 8).toFixed(2));
      slot.winText = "WINNER WINNER BIG MONEY!";
      if(slot.player.Premium || slot.player.Admin){
        slot.winText += " **(Premium Bonus!)**";
        slot.winAmount += parseFloat(slot.winAmount);
      }
      slot.player.stats.slot2s++;
      slot.player.stats.slotWins++;
      slot.player.money += parseFloat(slot.winAmount);
      if(slot.bet >= 1000){
        slot.player.xp += 40;
      }else {
        slot.winText += " `You bet lower than $1,000 fair warning here, you wont get any XP and you cant win the true JACKPOT`"
      }
      return;
    }
    if((slot.reel1 == ":third_place:") && (slot.reel2 == ":third_place:") && (slot.reel3 == ":third_place:")){
      slot.winAmount = parseFloat((slot.bet * 4).toFixed(2));
      slot.winText = "WINNER!";
      if(slot.player.Premium || slot.player.Admin){
        slot.winText += " **(Premium Bonus!)**";
        slot.winAmount += parseFloat(slot.winAmount);
      }
      slot.player.stats.slot3s++;
      slot.player.stats.slotWins++;
      slot.player.money += parseFloat(slot.winAmount);
      if(slot.bet >= 1000){
        slot.player.xp += 20;
      }else {
        slot.winText += " `You bet lower than $1,000 fair warning here, you wont get any XP and you cant win the true JACKPOT`"
      }
      return;
    }
    if((slot.reel1 == ":cherries:") && (slot.reel2 == ":cherries:") && (slot.reel3 == ":cherries:")){
      slot.winAmount = parseFloat((slot.bet * 2).toFixed(2));
      slot.winText = "Winner";
      if(slot.player.Premium || slot.player.Admin){
        slot.winText += " **(Premium Bonus!)**";
        slot.winAmount += parseFloat(slot.winAmount);
      }
      slot.player.stats.slotTripleC++;
      slot.player.stats.slotWins++;
      slot.player.money += parseFloat(slot.winAmount);
      if(slot.bet >= 1000){
        slot.player.xp += 10;
      }else {
        slot.winText += " `You bet lower than $1,000 fair warning here, you wont get any XP and you cant win the true JACKPOT`"
      }
      return;
    }
    if((slot.reel1 == ":cherries:") || (slot.reel2 == ":cherries:") || (slot.reel3 == ":cherries:")){
      slot.winAmount = parseFloat((slot.bet / 2).toFixed(2));
      slot.winText = "Well at least you didn't lose it all...";
      slot.player.stats.slotSingleC++;
      slot.player.stats.slotWins++;
      slot.player.money += parseFloat(slot.winAmount);
      if(slot.bet >= 1000){
        slot.player.xp += 5;
      }else {
        slot.winText += " `You bet lower than $1,000 fair warning here, you wont get any XP and you cant win the true JACKPOT`"
      }
      return;
    }
    slot.winAmount = 0;
    slot.winText = "DANG! Better luck next time!";
    if(slot.bet >= 1000){
      slot.player.xp += 1;
    }else {
      slot.winText += " `You bet lower than $1,000 fair warning here, you wont get any XP and you cant win the true JACKPOT`"
    }
  }
  updateLastSeen(player){
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = numeral((month < 10 ? "0" : "") + month).value();
    var day  = date.getDate();
    day = numeral((day < 10 ? "0" : "") + day).value();
    player.lastSeen = {
      pmonth: numeral(month).value(),
      pday: numeral(day).value(),
      pyear: numeral(year).value()
    }
  }
  canGetIncome(player){
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = numeral((month < 10 ? "0" : "") + month).value();
    var day  = date.getDate();
    day = numeral((day < 10 ? "0" : "") + day).value();
    var yearsPassed = year - player.lastSeen.pyear;
    var monthsPassed = month - player.lastSeen.pmonth;
    var daysPassed = day - player.lastSeen.pday;
    if((yearsPassed > 0) | (monthsPassed > 0) | (daysPassed > 1)){
      return false;
    }
    return true;
  }
  removeFromDB(player){
    var self = this;
    for (var i = 0; i < self.casinoObj.players.length; i++) {
      if(self.casinoObj.players[i].id == player.id){
        self.casinoObj.players.splice(i,1);
        return;
      }
    }
  }
  getDateTime() {
    var date = new Date();
    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;
    return hour + ":" + min + ":" + sec + " :: " + month + "/" + day + "/" + year;
  }
  checkBan(player, data){
    if(player.banned){
      this.disnode.service.SendEmbed({
        color: 3447003,
        author: {},
        fields: [ {
          name: "You have been banned!",
          inline: false,
          value: ":octagonal_sign: You are banned! heres why: ``` " + player.banreason + "```",
        }, {
          name: 'Ban Appeal',
          inline: false,
          value: "**If you wish to appeal your ban you will have to do so in this discord channel: ** https://discord.gg/gxQ7nbQ",
        }],
          footer: {}
        },
      data.msg);
      return true;
    }else {
      return false;
    }
  }
  handleRecentBetters(player){
    var self = this;
    var placed = false;
    for (var i = 0; i < self.recentBetters.length; i++) {
      if(self.recentBetters[i].name == player.name){
        self.recentBetters.splice(i,1);
        self.recentBetters.unshift({name: player.name, time: self.getDateTime()});
        placed = true;
        break;
      }
    }
    if(!placed){
      self.recentBetters.unshift({name: player.name, time: self.getDateTime()});
    }
    while(self.recentBetters.length > 10){
      self.recentBetters.splice(10, 1)
    }
  }
  sendCompactEmbed(title, body, data){
    this.disnode.service.SendEmbed({
      color: 3447003,
      author: {},
      fields: [ {
        name: title,
        inline: false,
        value: body,
      }],
        footer: {}
      },
    data.msg);
  }
  parseMention(dataString){
    var returnV = dataString;
    returnV = returnV.replace(/\D/g,'');
    return returnV;
  }
  calculateWheelWins(wheelInfo){
    console.dir(wheelInfo.whatcontains);
    for (var i = 0; i < wheelInfo.winspots.length; i++) {
      if((wheelInfo.wheelNumber % 2) == 0){ //WIN Even
        if(wheelInfo.winspots[i] == "even"){
          if(wheelInfo.wheelNumber != 0){
            wheelInfo.winAmount += (wheelInfo.betperspot * 2);
            wheelInfo.xpAward += 5;
            continue;
          }
        }
      }
      if ((wheelInfo.wheelNumber % 2) != 0) { //WIN Odd
        if(wheelInfo.winspots[i] == "odd"){
          if(wheelInfo.wheelNumber != 0){
            wheelInfo.winAmount += (wheelInfo.betperspot * 2);
            wheelInfo.xpAward += 5;
            continue;
          }
        }
      }
      if (wheelInfo.ball.type == 1) {//WIN Red
        if(wheelInfo.winspots[i] == "red"){
          wheelInfo.winAmount += (wheelInfo.betperspot * 2);
          wheelInfo.xpAward += 5;
          continue;
        }
      }
      if (wheelInfo.ball.type == 2) {//WIN Black
        if(wheelInfo.winspots[i] == "black"){
          wheelInfo.winAmount += (wheelInfo.betperspot * 2);
          wheelInfo.xpAward += 5;
          continue;
        }
      }
      if(wheelInfo.wheelNumber >= 1 && wheelInfo.wheelNumber <= 18){//WIN Low
        if(wheelInfo.winspots[i] == "low"){
          wheelInfo.winAmount += (wheelInfo.betperspot * 2);
          wheelInfo.xpAward += 10;
          continue;
        }
      }
      if(wheelInfo.wheelNumber >= 19 && wheelInfo.wheelNumber <= 36){//WIN high
        if(wheelInfo.winspots[i] == "high"){
          wheelInfo.winAmount += (wheelInfo.betperspot * 2);
          wheelInfo.xpAward += 10;
          continue;
        }
      }
      if (wheelInfo.wheelNumber >= 1 & wheelInfo.wheelNumber <= 12) {//WIN 1st
        if(wheelInfo.winspots[i] == "1st"){
          if(wheelInfo.whatcontains.has1st && wheelInfo.whatcontains.has2nd && wheelInfo.whatcontains.has3rd){
            wheelInfo.winAmount += (wheelInfo.betperspot * 2);
            wheelInfo.xpAward += 25;
            continue;
          }else {
            wheelInfo.winAmount += (wheelInfo.betperspot * 3);
            wheelInfo.xpAward += 25;
            continue;
          }
        }
      }
      if (wheelInfo.wheelNumber >= 13 & wheelInfo.wheelNumber <= 24) {//WIN 2nd
        if(wheelInfo.winspots[i] == "2nd"){
          if(wheelInfo.whatcontains.has1st && wheelInfo.whatcontains.has2nd && wheelInfo.whatcontains.has3rd){
            wheelInfo.winAmount += (wheelInfo.betperspot * 2);
            wheelInfo.xpAward += 25;
            continue;
          }else {
            wheelInfo.winAmount += (wheelInfo.betperspot * 3);
            wheelInfo.xpAward += 25;
            continue;
          }
        }
      }
      if (wheelInfo.wheelNumber >= 25 && wheelInfo.wheelNumber <= 36) {//WIN 3rd
        if(wheelInfo.winspots[i] == "3rd"){
          if(wheelInfo.whatcontains.has1st && wheelInfo.whatcontains.has2nd && wheelInfo.whatcontains.has3rd){
            wheelInfo.winAmount += (wheelInfo.betperspot * 2);
            wheelInfo.xpAward += 25;
            continue;
          }else {
            wheelInfo.winAmount += (wheelInfo.betperspot * 3);
            wheelInfo.xpAward += 25;
            continue;
          }
        }
      }
      if(wheelInfo.wheelNumber == 0){//WIN 0
        if(numeral(wheelInfo.winspots[i]).value() == 0){
          wheelInfo.winAmount += (wheelInfo.betperspot * 37);
          wheelInfo.xpAward += 100;
          continue;
        }
      }else {//WIN OTHERNUM
        if(wheelInfo.winspots[i] != "1st" && wheelInfo.winspots[i] != "2nd" && wheelInfo.winspots[i] != "3rd"){
          if(numeral(wheelInfo.winspots[i]).value() == wheelInfo.wheelNumber){
            wheelInfo.winAmount += (wheelInfo.betperspot * 36);
            wheelInfo.xpAward += 75;
            continue;
          }
        }
      }
    }
  }
  checkValidWheel(bet){
    if(bet.toLowerCase() == "black"){return true;}
    if(bet.toLowerCase() == "red"){return true;}
    if(bet.toLowerCase() == "even"){return true;}
    if(bet.toLowerCase() == "odd"){return true;}
    if(bet.toLowerCase() == "low"){return true;}
    if(bet.toLowerCase() == "high"){return true;}
    if(bet.toLowerCase() == "1st"){return true;}
    if(bet.toLowerCase() == "2nd"){return true;}
    if(bet.toLowerCase() == "3rd"){return true;}
    if(bet.toLowerCase() == "0"){return true;}
    if(numeral(bet).value() > 0 && numeral(bet).value() <= 36){return true;}
    return false;
  }
  updateCoroutine(){
    var self = this;
    var toRemove = [];
    var date = new Date();
    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;
    for (var i = 0; i < self.casinoObj.players.length; i++) {
      if(self.casinoObj.players[i].lastSeen == undefined){
        self.updateLastSeen(self.casinoObj.players[i]);
      }
    }
    for (var i = 0; i < self.casinoObj.players.length; i++) {
      if(self.canGetIncome(self.casinoObj.players[i])){
        self.casinoObj.players[i].money += self.casinoObj.players[i].perUpdate;
      }
      self.casinoObj.players[i].lastMessage = null;
    }
    if(self.casinoObj.jackpotValue == null)self.casinoObj.jackpotValue = 1000;
    self.save(self.cobpath, self.casinoObj);
    setTimeout(function() {
      self.updateCoroutine();
    }, 1800000);
    //1800000
  }
}
module.exports = CasinoPlugin;
