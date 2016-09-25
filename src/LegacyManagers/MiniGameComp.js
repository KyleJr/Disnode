"use strict"
class MiniGameComp {
  constructor(bot, fs){
    this.bot = bot;
    this.fs = fs;
  }
  AddUser(identifier,name, money, xp, lv, health, attack, cb) {
    var Adding = {id:identifier,Username:name,cash:money,exp:xp,lvl:lv,hp:health,atk:attack};
    cb(Adding);
  }

  CheckDB(msg, dbArray, cb){
    var i = 0;
    var f = false;
    dbArray.forEach(function(obj){
      if(obj.id == msg.author.id){
        cb(true, i);
        f = true;
      }
      i++;
    });
    if(!f){
      cb(false, 0);
    }
  }
  CheckDBwithID(id, dbArray, cb){
    var i = 0;
    var f = false;
    dbArray.forEach(function(obj){
      if(obj.id == id){
        cb(true, i);
        f = true;
      }
      i++;
    });
    if(!f){
      cb(false, 0);
    }
  }
}

module.exports.MiniGameComp = MiniGameComp;
