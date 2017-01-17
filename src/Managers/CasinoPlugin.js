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
        {command: "admin",event: "admin"},
        {command: "flip",event: "flip"},
        {command: "transfer",event: "transfer"},
        {command: "bal",event: "bal"},
      ]
    }
    this.slotItems = [
      {item:":cherries:"},{item:":cherries:"},{item:":cherries:"},{item:":cherries:"},{item:":cherries:"},
      {item:":cherries:"},{item:":cherries:"},{item:":cherries:"},{item:":cherries:"},{item:":cherries:"},
      {item:":cherries:"},{item:":cherries:"},{item:":cherries:"},{item:":cherries:"},{item:":cherries:"},
      {item:":cherries:"},{item:":cherries:"},{item:":cherries:"},{item:":cherries:"},{item:":cherries:"},
      {item:":cherries:"},{item:":cherries:"},{item:":cherries:"},{item:":cherries:"},{item:":cherries:"},
      {item:":third_place:"},{item:":third_place:"},{item:":third_place:"},{item:":third_place:"},{item:":third_place:"},
      {item:":third_place:"},{item:":third_place:"},{item:":third_place:"},{item:":third_place:"},{item:":third_place:"},
      {item:":third_place:"},{item:":third_place:"},{item:":third_place:"},{item:":third_place:"},{item:":third_place:"},
      {item:":third_place:"},{item:":third_place:"},{item:":third_place:"},{item:":third_place:"},{item:":third_place:"},
      {item:":second_place:"},{item:":second_place:"},{item:":second_place:"},{item:":second_place:"},{item:":second_place:"},
      {item:":second_place:"},{item:":second_place:"},{item:":second_place:"},{item:":second_place:"},{item:":second_place:"},
      {item:":second_place:"},{item:":second_place:"},{item:":second_place:"},{item:":second_place:"},{item:":second_place:"},
      {item:":first_place:"},{item:":first_place:"},{item:":first_place:"},{item:":first_place:"},{item:":first_place:"},
      {item:":first_place:"},{item:":first_place:"},{item:":first_place:"},{item:":first_place:"},{item:":first_place:"},
      {item:":100:"},{item:":100:"},{item:":100:"},{item:":100:"},{item:":100:"}
    ]
    this.store = [
      {cost: 200, type:0, item: "Instant $1,000"},
      {cost: 500, type:0, item: "Instant $2,500"},
      {cost: 1000, type:0, item: "Instant $5,000"},
      {cost: 2000, type:0, item: "Instant $10,000"},
      {cost: 4000, type:0, item: "Instant $20,000"},
      {cost: 6000, type:0, item: "Instant $30,000"},
      {cost: 100, type:0, item: "Add $50 to your \'per update\' amount"},
      {cost: 200, type:0, item: "Add $100 to your \'per update\' amount"},
      {cost: 400, type:0, item: "Add $200 to your \'per update\' amount"},
      {cost: 800, type:0, item: "Add $400 to your \'per update\' amount"},
      {cost: 1600, type:0, item: "Add $800 to your \'per update\' amount"},
      {cost: 3200, type:0, item: "Add $1600 to your \'per update\' amount"},
      {cost: 10000, type:1, item: "Instant 50XP"},
      {cost: 20000, type:1, item: "Instant 100XP"},
      {cost: 40000, type:1, item: "Instant 200XP"},
      {cost: 80000, type:1, item: "Instant 400XP"},
      {cost: 160000, type:1, item: "Instant 800XP"},
      {cost: 320000, type:1, item: "Instant 1600XP"},
      {cost: 640000, type:1, item: "Instant 3200XP"}
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
    this.load(this.cobpath);
    this.Starting = true;
    this.transferCommand = this.transferCommand.bind(this);
    this.quickbalCommand = this.quickbalCommand.bind(this);
    this.quickJPCommand = this.quickJPCommand.bind(this);
    this.statsCommand = this.statsCommand.bind(this);
    this.storeCommand = this.storeCommand.bind(this);
    this.lookupCommand = this.lookupCommand.bind(this);
    this.topCommand = this.topCommand.bind(this);
    this.slotCommand = this.slotCommand.bind(this);
    this.getPlayer = this.getPlayer.bind(this);
    this.adminCommand = this.adminCommand.bind(this);
    this.didWin = this.didWin.bind(this);
    this.load = this.load.bind(this);
    this.save = this.save.bind(this);
    this.getDateTime = this.getDateTime.bind(this);
    this.updateCoroutine = this.updateCoroutine.bind(this);
    this.defaultCommand = this.defaultCommand.bind(this);
    this.coinflipCommand = this.coinflipCommand.bind(this);

    this.disnode.command.on("Command_casino_stats", this.statsCommand);
    this.disnode.command.on("Command_casino_store", this.storeCommand);
    this.disnode.command.on("Command_casino_look", this.lookupCommand);
    this.disnode.command.on("Command_casino_top", this.topCommand);
    this.disnode.command.on("Command_casino_slot", this.slotCommand);
    this.disnode.command.on("Command_casino_admin", this.adminCommand);
    this.disnode.command.on("Command_casino_flip", this.coinflipCommand);
    this.disnode.command.on("Command_casino_transfer", this.transferCommand);
    this.disnode.command.on("Command_casino_bal", this.quickbalCommand);
    this.disnode.command.on("Command_casino_jackpot", this.quickJPCommand);
    this.disnode.command.on("Command_casino", this.defaultCommand);
  }
  defaultCommand(data){
    var self = this;
    var player = self.getPlayer(data);
    if(self.checkBan(player, data))return;
    if (data.msg.type == "DiscordService") {
      var client = this.disnode.service.GetService("DiscordService").client;
      var msg = "";
      msg+= " `casino profile` - *Check your personal stats*\n";
      msg+= " `casino bal` - *Check your Money and XP Quickly*\n";
      msg+= " `casino jackpot` - *Check the JACKPOT value Quickly*\n";
      msg+= " `casino look` - *Givers stats of the given username*\n";
      msg+= " `casino top` - *Lists the top 10 players based on cash*\n";
      msg+= " `casino store` - *Spend the XP you earn from playing here!*\n";
      msg+= " `casino flip` - *Coin Flip (general help)*\n";
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
          timestamp: new Date(),
          footer: {}
        },
      data.msg);
    }
  }
  quickJPCommand(data){
    var self = this;
    var player = self.getPlayer(data);
    if(self.checkBan(player, data))return;
    this.disnode.service.SendEmbed({
      color: 3447003,
      author: {},
      fields: [ {
        name: 'JACKPOT',
        inline: true,
        value: "$" + self.casinoObj.jackpotValue,
      }, {
        name: 'JACKPOT History',
        inline: false,
        value: "**Last won by:** " + self.casinoObj.jackpotstat.lastWon,
      }],
        timestamp: new Date(),
        footer: {}
      },
    data.msg);
  }
  quickbalCommand(data){
    var self = this;
    var player = self.getPlayer(data);
    if(self.checkBan(player, data))return;
    var player = self.getPlayer(data);
    player.money = Number(parseFloat(player.money).toFixed(2));
    this.disnode.service.SendEmbed({
      color: 3447003,
      author: {},
      title: player.name + ' Quick Balance',
      fields: [ {
        name: 'Money',
        inline: true,
        value: "$" + player.money,
      }, {
        name: 'Income / 30min.',
        inline: true,
        value: "$" + player.perUpdate,
      }, {
        name: 'XP',
        inline: true,
        value: player.xp,
      }],
        timestamp: new Date(),
        footer: {}
      },
    data.msg);
  }
  wheelCommand(data){
    var self = this;
    var player = self.getPlayer(data);
    if(self.checkBan(player, data))return;
    player.money = Number(parseFloat(player.money).toFixed(2));
    switch (data.params[0]) {
      case "spin":
        if(parseFloat(data.params[1]) > 1){
          var bet = Number(parseFloat(data.params[1]).toFixed(2));
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
            player.money -= bet;
            player.money = Number(parseFloat(player.money).toFixed(2));
          }
          var wheelInfo = {
            bet: bet,
            player: player,
            oddsMult: 0.0,
          }
        }
        break;
      case "info":

        break;
      default:
      this.disnode.service.SendEmbed({
        color: 3447003,
        author: {},
        fields: [ {
          name: "The Wheel (Roulette)",
          inline: false,
          value: "Welcome to The Wheel! You can play by using this command `!casino wheel spin [bet] [winType] [winType]` Examples `!casino wheel spin 100 black` and `!casino wheel spin 100 black 5`\nFor more info on what win types are and how the game is payed out use `!casino wheel info`",
        }],
          timestamp: new Date(),
          footer: {}
        },
      data.msg);
        break;
    }
  }
  transferCommand(data){
    var self = this;
    var player = self.getPlayer(data);
    if(self.checkBan(player, data))return;
    var transferPlayer;
    if(data.params[0]){
      for (var i = 0; i < self.casinoObj.players.length; i++) {
        if(self.casinoObj.players[i].name == data.params[0]){
          transferPlayer = self.casinoObj.players[i];
          if(Number(parseFloat(data.params[1])) > 0){
            var toTransfer = Number(parseFloat(data.params[1]));
            if(toTransfer > player.money){
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
                value: player.name + "\nBalance Proir: $" + pbalbef + "\nBalance After: $" + player.money,
              }, {
                name: 'To',
                inline: false,
                value: transferPlayer.name + "\nBalance Proir: $" + sbalbef + "\nBalance After: $" + transferPlayer.money,
              }, {
                name: 'Amount',
                inline: true,
                value: "$ " + toTransfer,
              }, {
                name: "Status",
                inline: false,
                value: ":white_check_mark: Transfer complete!",
              }],
                timestamp: new Date(),
                footer: {}
              },
            data.msg);
            return;
          }else {
            this.disnode.service.SendEmbed({
              color: 3447003,
              author: {},
              fields: [ {
                name: "Error",
                inline: false,
                value: ":warning: Please enter a number for the transfer amount! example `!casino transfer FireGamer3 100`",
              }],
                timestamp: new Date(),
                footer: {}
              },
            data.msg);
          }
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
          value: ":warning: Please enter a username to send to! example: `!casino transfer FireGamer3 100`\nIf the username has a space in it use quotes, Example: `!casino transfer \"VictoryForPhil / Atec\" 100`",
        }],
          timestamp: new Date(),
          footer: {}
        },
      data.msg);
    }
  }
  coinflipCommand(data){
    var self = this;
    var player = self.getPlayer(data);
    if(self.checkBan(player, data))return;
    player.money = Number(parseFloat(player.money).toFixed(2));
    switch (data.params[0]) {
      case "heads":
        if(parseFloat(data.params[1]) > 1){
          var bet = Number(parseFloat(data.params[1]).toFixed(2));
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
            player.money -= bet;
            player.money = Number(parseFloat(player.money).toFixed(2));
          }
          var flipinfo = {
            flip: self.getRandomIntInclusive(0,1),
            winText: "",
            winAmount: 0
          }
          player.stats.coinPlays++;
          player.stats.moneySpent += Number(parseFloat(bet).toFixed(2));
          player.stats.moneySpent = Number(parseFloat(player.stats.moneySpent).toFixed(2));
          if(flipinfo.flip == 0){
            player.stats.coinWins++;
            player.stats.coinHeads++;
            flipinfo.winText = "Heads! You Win!"
            flipinfo.winAmount = Number(parseFloat(bet * 1.25).toFixed(2));
            player.stats.moneyWon += Number(parseFloat(flipinfo.winAmount).toFixed(2));
            player.stats.moneyWon = Number(parseFloat(player.stats.moneyWon).toFixed(2));
            player.money += Number(parseFloat(flipinfo.winAmount).toFixed(2));
            player.money = Number(parseFloat(player.money).toFixed(2));
            player.xp += 5;
            console.log("[Casino " + self.getDateTime() + "] Player: " + player.name + " Has Won Coin Flip Winnings: " + flipinfo.winAmount + "original bet: " + bet);
            this.disnode.service.SendEmbed({
              color: 3447003,
              author: {},
              fields: [ {
                name: ':moneybag: Coin Flip :moneybag:',
                inline: false,
                value: flipinfo.winText,
              }, {
                name: 'Bet',
                inline: false,
                value: "$" + bet,
              }, {
                name: 'Winnings',
                inline: false,
                value: "$" + flipinfo.winAmount,
              }, {
                name: 'Net Gain',
                inline: false,
                value: "What you gained from your winnings $" + (flipinfo.winAmount - bet),
              }, {
                name: 'Balance',
                inline: true,
                value: "$" + player.money,
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
            flipinfo.winText = "Tails! House Wins!";
            player.stats.coinTails++;
            console.log("[Casino " + self.getDateTime() + "] Player: " + player.name + " Has Lost Coin Flip Winnings: " + flipinfo.winAmount + "original bet: " + bet);
            this.disnode.service.SendEmbed({
              color: 3447003,
              author: {},
              fields: [ {
                name: ':moneybag: Coin Flip :moneybag:',
                inline: false,
                value: flipinfo.winText,
              }, {
                name: 'Bet',
                inline: false,
                value: "$" + bet,
              }, {
                name: 'Winnings',
                inline: false,
                value: "$" + flipinfo.winAmount,
              }, {
                name: 'Net Gain',
                inline: false,
                value: "What you gained from your winnings $" + (flipinfo.winAmount - bet),
              }, {
                name: 'Balance',
                inline: true,
                value: "$" + player.money,
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
          }
        }else {
          this.disnode.service.SendEmbed({
            color: 3447003,
            author: {},
            fields: [ {
              name: "Error",
              inline: false,
              value: ":warning: Please enter a bet! Example `!casino flip heads 100`",
            }],
              timestamp: new Date(),
              footer: {}
            },
          data.msg);
        }
        break;
      case "tails":
        if(parseFloat(data.params[1]) > 1){
          var bet = parseFloat(data.params[1]).toFixed(2);
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
            player.money -= bet;
            player.money = Number(parseFloat(player.money).toFixed(2));
          }
          var flipinfo = {
            flip: self.getRandomIntInclusive(0,1),
            winText: "",
            winAmount: 0
          }
          player.stats.coinPlays++;
          player.stats.moneySpent += Number(parseFloat(bet).toFixed(2));
          player.stats.moneySpent = Number(parseFloat(player.stats.moneySpent).toFixed(2));
          if(flipinfo.flip == 1){
            player.stats.coinWins++;
            player.stats.coinTails++;
            flipinfo.winText = "Tails! You Win!"
            flipinfo.winAmount = Number(parseFloat(bet * 1.25).toFixed(2));
            player.stats.moneyWon += Number(parseFloat(flipinfo.winAmount).toFixed(2));
            player.stats.moneyWon = Number(parseFloat(player.stats.moneyWon).toFixed(2));
            player.money += Number(parseFloat(flipinfo.winAmount).toFixed(2));
            player.money = Number(parseFloat(player.money).toFixed(2));
            player.xp += 5;
            console.log("[Casino " + self.getDateTime() + "] Player: " + player.name + " Has Won Coin Flip Winnings: " + flipinfo.winAmount + "original bet: " + bet);
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
                value: "$" + bet,
              }, {
                name: 'Winnings',
                inline: true,
                value: "$" + flipinfo.winAmount,
              }, {
                name: 'Net Gain',
                inline: true,
                value: "What you gained from your winnings $" + (flipinfo.winAmount - bet),
              }, {
                name: 'Balance',
                inline: true,
                value: "$" + player.money,
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
            flipinfo.winText = "Heads! House Wins!";
            player.stats.coinHeads++;
            console.log("[Casino " + self.getDateTime() + "] Player: " + player.name + " Has Won Coin Flip Winnings: " + flipinfo.winAmount + "original bet: " + bet);
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
                value: "$" + bet,
              }, {
                name: 'Winnings',
                inline: true,
                value: "$" + flipinfo.winAmount,
              }, {
                name: 'Net Gain',
                inline: true,
                value: "What you gained from your winnings $" + (flipinfo.winAmount - bet),
              }, {
                name: 'Balance',
                inline: true,
                value: "$" + player.money,
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
          }
        }else {
          this.disnode.service.SendEmbed({
            color: 3447003,
            author: {},
            fields: [ {
              name: "Error",
              inline: false,
              value: ":warning: Please enter a bet! Example `!casino flip tails 100`",
            }],
              timestamp: new Date(),
              footer: {}
            },
          data.msg);
        }
        break;
      default:
        this.disnode.service.SendEmbed({
          color: 3447003,
          author: {},
          fields: [ {
            name: "Coin Flip",
            inline: false,
            value: "Welcome to Coin Flip! You can play by using this command `!casino flip [heads/tails] [bet]` Examples `!casino flip heads 100` and `!casino flip tails 100`",
          }],
            timestamp: new Date(),
            footer: {}
          },
        data.msg);
        break;
    }
  }
  adminCommand(data){
    var self = this;
    var player = self.getPlayer(data);
    if(self.checkBan(player, data))return;
    if(player.Admin == undefined)player.Admin = false;
    if(!player.Admin){
      this.disnode.service.SendEmbed({
        color: 3447003,
        author: {},
        fields: [ {
          name: "Error",
          inline: false,
          value: ":warning: YOU SHALL NOT PASS! (**You are not an admin**)",
        }],
          timestamp: new Date(),
          footer: {}
        },
      data.msg);
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
                this.disnode.service.SendEmbed({
                  color: 3447003,
                  author: {},
                  fields: [ {
                    name: "Action Complete",
                    inline: false,
                    value: ":white_check_mark: Player: " + players.name + "Is now banned with the Reason: " + players.banreason,
                  }],
                    timestamp: new Date(),
                    footer: {}
                  },
                data.msg);
              }else {
                players.money = 5000;
                players.perUpdate = 100;
                players.xp = 0;
                players.banned = false;
                players.banreason = "";
                this.disnode.service.SendEmbed({
                  color: 3447003,
                  author: {},
                  fields: [ {
                    name: "Action Complete",
                    inline: false,
                    value: ":white_check_mark: Player: " + players.name + "Is now unbanned",
                  }],
                    timestamp: new Date(),
                    footer: {}
                  },
                data.msg);
              }
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
              value: ":warning: Please enter a username!",
            }],
              timestamp: new Date(),
              footer: {}
            },
          data.msg);
        }
          break;
        case "testslot":
          var bet = parseFloat(data.params[1]).toFixed(2);
          var modifier = data.params[2];
          switch (modifier) {
            case "100":
              modifier = ":100:";
              break;
            case "first_place":
              modifier = ":first_place:";
              break;
            case "second_place":
              modifier = ":second_place:";
              break;
            case "third_place":
              modifier = ":third_place:";
              break;
            case "cherries":
              modifier = ":cherries:";
              break;
            default:
              break;
          }
          if(modifier == undefined){
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
            console.log("[Casino " + self.getDateTime() + "] Player: " + player.name + " Slot Winnings: " + slotInfo.winAmount + " original bet: " + bet);
            player.money = parseFloat(player.money.toFixed(2));
            player.stats.moneySpent = parseFloat(parseFloat(player.stats.moneySpent) + parseFloat(bet));
            player.stats.moneyWon = parseFloat(parseFloat(player.stats.moneyWon) + parseFloat(slotInfo.winAmount));
            player.stats.moneySpent = player.stats.moneySpent.toFixed(2);
            player.stats.moneyWon = player.stats.moneyWon.toFixed(2);
            self.casinoObj.jackpotValue = parseFloat(self.casinoObj.jackpotValue.toFixed(2));
            this.disnode.service.SendEmbed({
              color: 3447003,
              author: {},
              fields: [ {
                name: ':slot_machine: Slots Result :slot_machine:',
                inline: false,
                value: "| " + slotInfo.fake1 + slotInfo.fake2 + slotInfo.fake3 + " |\n**>**" + slotInfo.reel1 + slotInfo.reel2 + slotInfo.reel3 +"**<** Pay Line\n| " + slotInfo.fake4 + slotInfo.fake5 + slotInfo.fake6 + " |\n\n" + slotInfo.winText,
              }, {
                name: 'Bet',
                inline: true,
                value: "$" + bet,
              }, {
                name: 'Winnings',
                inline: true,
                value: "$" + slotInfo.winAmount,
              }, {
                name: 'Net Gain',
                inline: true,
                value: "$" + (slotInfo.winAmount - bet),
              }, {
                name: 'Balance',
                inline: false,
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
          }else {
            var slotInfo = {
              bet: bet,
              player: player,
              winText: "",
              winAmount: 0,
              reel1: modifier,
              reel2: modifier,
              reel3: modifier,
              fake1: self.slotItems[self.getRandomIntInclusive(0,(self.slotItems.length - 1))].item,
              fake2: self.slotItems[self.getRandomIntInclusive(0,(self.slotItems.length - 1))].item,
              fake3: self.slotItems[self.getRandomIntInclusive(0,(self.slotItems.length - 1))].item,
              fake4: self.slotItems[self.getRandomIntInclusive(0,(self.slotItems.length - 1))].item,
              fake5: self.slotItems[self.getRandomIntInclusive(0,(self.slotItems.length - 1))].item,
              fake6: self.slotItems[self.getRandomIntInclusive(0,(self.slotItems.length - 1))].item
            }
            self.didWin(slotInfo);

            console.log("[Casino " + self.getDateTime() + "] Player: " + player.name + " Slot Winnings: " + slotInfo.winAmount + " original bet: " + bet);
            player.money = parseFloat(player.money.toFixed(2));
            player.stats.moneySpent = parseFloat(parseFloat(player.stats.moneySpent) + parseFloat(bet));
            player.stats.moneyWon = parseFloat(parseFloat(player.stats.moneyWon) + parseFloat(slotInfo.winAmount));
            player.stats.moneySpent = player.stats.moneySpent.toFixed(2);
            player.stats.moneyWon = player.stats.moneyWon.toFixed(2);
            self.casinoObj.jackpotValue = parseFloat(self.casinoObj.jackpotValue.toFixed(2));
            this.disnode.service.SendEmbed({
              color: 3447003,
              author: {},
              fields: [ {
                name: ':slot_machine: Slots Result :slot_machine:',
                inline: false,
                value: "| " + slotInfo.fake1 + slotInfo.fake2 + slotInfo.fake3 + " |\n**>**" + slotInfo.reel1 + slotInfo.reel2 + slotInfo.reel3 +"**<** Pay Line\n| " + slotInfo.fake4 + slotInfo.fake5 + slotInfo.fake6 + " |\n\n" + slotInfo.winText,
              }, {
                name: 'Bet',
                inline: true,
                value: "$" + bet,
              }, {
                name: 'Winnings',
                inline: true,
                value: "$" + slotInfo.winAmount,
              }, {
                name: 'Net Gain',
                inline: true,
                value: "$" + (slotInfo.winAmount - bet),
              }, {
                name: 'Balance',
                inline: false,
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
          }
          break;
        case "jackpot":
          var setTo = Number(parseFloat(data.params[1]).toFixed(2));
          self.casinoObj.jackpotValue = setTo;
          this.disnode.service.SendEmbed({
            color: 3447003,
            author: {},
            fields: [ {
              name: "Complete",
              inline: false,
              value: "JACKPOT Value set to: $" + setTo,
            }],
              timestamp: new Date(),
              footer: {}
            },
          data.msg);
          break;
        case "cleartimers":
          for (var i = 0; i < self.casinoObj.players.length; i++) {
            self.casinoObj.players[i].lastMessage = null;
          }
          this.disnode.service.SendEmbed({
            color: 3447003,
            author: {},
            fields: [ {
              name: "Action Complete",
              inline: false,
              value: ":white_check_mark: Player Timeouts Cleared!",
            }],
              timestamp: new Date(),
              footer: {}
            },
          data.msg);
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
                this.disnode.service.SendEmbed({
                  color: 3447003,
                  author: {},
                  fields: [ {
                    name: "Action Complete",
                    inline: false,
                    value: ":white_check_mark: Premium set to:`" + data.params[2] + "` for Player: `" + data.params[1] + "`",
                  }],
                    timestamp: new Date(),
                    footer: {}
                  },
                data.msg);
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
                value: ":warning: Please enter a username!",
              }],
                timestamp: new Date(),
                footer: {}
              },
            data.msg);
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
    var player = self.getPlayer(data);
    if(self.checkBan(player, data))return;
    if(data.params[0]){
      for (var i = 0; i < self.casinoObj.players.length; i++) {
        if(self.casinoObj.players[i].name == data.params[0]){
          player = self.casinoObj.players[i];
          data.msg.userId = player.id;
          data.ranbynotbanned = true;
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
    var player = self.getPlayer(data);
    if(self.checkBan(player, data))return;
    if(data.params[0] == "buy"){
      if(data.params[1] && (data.params[1] >= 0 && data.params[1] <= (self.store.length - 1))){
        var ID = parseInt(data.params[1]);
        var cost;
        if(player.Admin || player.Premium){
          cost = (self.store[ID].cost /2)
        }else cost = self.store[ID].cost;
        if(self.store[ID].type == 0){
          if(player.xp < cost){
            this.disnode.service.SendEmbed({
              color: 3447003,
              author: {},
              fields: [ {
                name: "Error",
                inline: false,
                value: ":warning: You dont have that much XP!\nNeed: " + cost + "XP\nYou have: " + player.xp,
              }],
                timestamp: new Date(),
                footer: {}
              },
            data.msg);
            return;
          }
        }else {
          if(player.money < cost){
            this.disnode.service.SendEmbed({
              color: 3447003,
              author: {},
              fields: [ {
                name: "Error",
                inline: false,
                value: ":warning: You dont have that much Money!\nNeed: $" + cost + "\nYou have: $" + player.money,
              }],
                timestamp: new Date(),
                footer: {}
              },
            data.msg);
            return;
          }
        }
        switch (ID) {
          case 0:
            player.xp -= cost;
            player.money += 1000;
            break;
          case 1:
            player.xp -= cost;
            player.money += 2500;
            break;
          case 2:
            player.xp -= cost;
            player.money += 5000;
            break;
          case 3:
            player.xp -= cost;
            player.money += 10000;
            break;
          case 4:
            player.xp -= cost;
            player.money += 20000;
            break;
          case 5:
            player.xp -= cost;
            player.money += 30000;
            break;
          case 6:
            player.xp -= cost;
            player.perUpdate += 50;
            break;
          case 7:
            player.xp -= cost;
            player.perUpdate += 100;
            break;
          case 8:
            player.xp -= cost;
            player.perUpdate += 200;
            break;
          case 9:
            player.xp -= cost;
            player.perUpdate += 400;
            break;
          case 10:
            player.xp -= cost;
            player.perUpdate += 800;
            break;
          case 11:
            player.xp -= cost;
            player.perUpdate += 1600;
            break;
          case 12:
            player.money -= cost;
            player.xp += 50;
            break;
          case 13:
            player.money -= cost;
            player.xp += 100;
            break;
          case 14:
            player.money -= cost;
            player.xp += 200;
            break;
          case 15:
            player.money -= cost;
            player.xp += 400;
            break;
          case 16:
            player.money -= cost;
            player.xp += 800;
            break;
          case 17:
            player.money -= cost;
            player.xp += 1600;
            break;
          case 18:
            player.money -= cost;
            player.xp += 3200;
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
            value: ":white_check_mark: Your purchase of `" + self.store[ID].item + "` was successful! Thank you for your business!\n Your XP: " + player.xp + "\nYour money: $" + player.money + "\nIncome / 30 Min: $" + player.perUpdate,
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
        var cost;
        if(player.Admin || player.Premium){
          cost = (self.store[i].cost /2)
        }else cost = self.store[i].cost;
        if(self.store[i].type == 0){
          msg += "" + i + "\t//\t" + self.store[i].item + "\t//\t" + cost + "XP\n";
        }else {
          msg += "" + i + "\t//\t" + self.store[i].item + "\t//\t$" + cost + "\n";
        }
      }
      msg += "Store items are subject to change, please be aware of prices and items PRIOR to making a purchase!";
      var title;
      if(player.Admin || player.Premium){
        title = "Premium Store List";
      }else title = "Store List";
      this.disnode.service.SendEmbed({
        color: 3447003,
        author: {},
        fields: [ {
          name: title,
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
    var player = self.getPlayer(data);
    if(self.checkBan(player, data)){
      console.log("[Casino " + self.getDateTime() + "] Player: " + player.name + " Tried running slots but is banned!");
      return;
    }
    player.money = Number(player.money);
    if(data.params[0] == "info"){
      if(player.money > 50000){
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
          ":100::100::100: - JACKPOT value (Minimum bet: $" + minJackpotBet + " (if money < 50,000 min bet = 1000) else (min bet = money * 0.015 or 1.5%)) - 1000XP",
        },{
          name: 'XP',
          inline: false,
          value: "The XP system has changed a bit, if your bet is lower than $1000, you will not get any XP",
        },{
          name: 'JACKPOT',
          inline: false,
          value: "JACKPOT Value is increased every time someone plays slots, the value is increased by the players bet amount and has a default value of $100,000\n**Current JACKPOT Value: **$" + self.casinoObj.jackpotValue,
        }, {
          name: 'JACKPOT History',
          inline: true,
          value: "**Last won by:** " + self.casinoObj.jackpotstat.lastWon,
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
                timestamp: new Date(),
                footer: {}
              },
            data.msg);
            return;
          }
          if(bet > player.money){// Checks to see if player has enough money for their bet
            console.log("Bet: " + bet + " Money: " + player.money);
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
          if(player.money > 50000){
            var minJackpotBet = (player.money * 0.015);
          }else var minJackpotBet = 1000;
          console.log("[Casino " + self.getDateTime() + "] Player: " + player.name + " Slot Winnings: " + slotInfo.winAmount + " original bet: " + bet);
          player.money = parseFloat(player.money.toFixed(2));
          minJackpotBet = parseFloat(minJackpotBet.toFixed(2));
          player.stats.moneySpent = parseFloat(parseFloat(player.stats.moneySpent) + parseFloat(bet));
          player.stats.moneyWon = parseFloat(parseFloat(player.stats.moneyWon) + parseFloat(slotInfo.winAmount));
          player.stats.moneySpent = player.stats.moneySpent.toFixed(2);
          player.stats.moneyWon = player.stats.moneyWon.toFixed(2);
          self.casinoObj.jackpotValue = parseFloat(self.casinoObj.jackpotValue.toFixed(2));
          this.disnode.service.SendEmbed({
            color: 3447003,
            author: {},
            fields: [ {
              name: ':slot_machine: Slots Result :slot_machine:',
              inline: false,
              value: "| " + slotInfo.fake1 + slotInfo.fake2 + slotInfo.fake3 + " |\n**>**" + slotInfo.reel1 + slotInfo.reel2 + slotInfo.reel3 +"**<** Pay Line\n| " + slotInfo.fake4 + slotInfo.fake5 + slotInfo.fake6 + " |\n\n" + slotInfo.winText,
            }, {
              name: 'Bet',
              inline: true,
              value: "$" + bet,
            }, {
              name: 'Winnings',
              inline: true,
              value: "$" + slotInfo.winAmount,
            }, {
              name: 'Net Gain',
              inline: true,
              value: "$" + (slotInfo.winAmount - bet),
            }, {
              name: 'Balance',
              inline: false,
              value: "$" + player.money,
            }, {
              name: 'Minimum JACKPOT bet',
              inline: true,
              value: "$" + minJackpotBet,
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
    if(data.ranbynotbanned == undefined){
      if(self.checkBan(player, data))return;
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
      "**Money Spent**: $" + player.stats.moneySpent + "\n" +
      "**Money Won**: $" + player.stats.moneyWon + "\n\n" +
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
        name: 'Money',
        inline: false,
        value: "$" + player.money,
      }, {
        name: 'Income / 30min.',
        inline: false,
        value: "$" + player.perUpdate + " **This amount is added to your current money in 30 Min increments**",
      }, {
        name: 'XP',
        inline: true,
        value: player.xp,
      }, {
        name: 'Premium',
        inline: true,
        value: player.Premium,
      }, {
        name: 'Player Stats',
        inline: false,
        value: statsMessage,
      }],
        timestamp: new Date(),
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
      xp: 0,
      Premium: false,
      Admin: false,
      banned: false,
      banreason: "",
      stats: {
        moneySpent: 0,
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
      }
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
    if(slot.player.money > 50000){
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
        self.casinoObj.jackpotValue = 100000;
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
    slot.player.stats.moneySpent += parseFloat(slot.bet).toFixed(2);
    slot.winText = "DANG! Better luck next time!";
    if(slot.bet >= 1000){
      slot.player.xp += 1;
    }else {
      slot.winText += " `You bet lower than $1,000 fair warning here, you wont get any XP and you cant win the true JACKPOT`"
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
          timestamp: new Date(),
          footer: {}
        },
      data.msg);
      return true;
    }else {
      return false;
    }
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
    //1800000
  }
}
module.exports = CasinoPlugin;
