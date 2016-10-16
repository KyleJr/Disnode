const Manager = require("../Manager.js");
const Discord = require("discord.js");
const yt = require('ytdl-core');

class MusicManager extends Manager {
  constructor(pramas) {
    super(pramas);
    console.log("MusicManager Loaded!");

    this.defaultConfig = {
      defaultVolume : 0.8,
      maxVolume : 3,
      commands : [
        {
          command: "jv",
          event: "MM_JoinVoice"
        },
        {
          command: "lv",
          event: "MM_LeaveVoice"
        },
        {
          command: "stream",
          event: "MM_Stream"
        },
        {
          command: "skip",
          event: "MM_Skip"
        }
      ]
    }
    this.cmdJoinVoice = this.cmdJoinVoice.bind(this);
    this.cmdLeaveVoice = this.cmdLeaveVoice.bind(this);
    this.cmdStream = this.cmdStream.bind(this);
    this.cmdSkip = this.cmdSkip.bind(this);

    this.disnode.command.on("Command_MM_JoinVoice", this.cmdJoinVoice);
    this.disnode.command.on("Command_MM_LeaveVoice", this.cmdLeaveVoice);
    this.disnode.command.on("Command_MM_Stream", this.cmdStream);
    this.disnode.command.on("Command_MM_Skip", this.cmdSkip);

    this.streams = [];
  }
  cmdJoinVoice(data){
    var self = this;
    if(data.msg.type != "DiscordService"){
      console.log("Command was ran on a non-Discord service!");
      this.disnode.service.SendMessage("You can only use this command with Discord!", data.msg);
      return;
    }
    var vc = data.msg.object.member.voiceChannel;
    if(vc){
      self.joinv(vc, data);
    }else {
      this.disnode.service.SendMessage("Try joinning a voice channel first!", data.msg);
    }
  }
  cmdLeaveVoice(data){
    var self = this;
    if(data.msg.type != "DiscordService"){
      console.log("Command was ran on a non-Discord service!");
      this.disnode.service.SendMessage("You can only use this command with Discord!", data.msg);
      return;
    }
    var vc = data.msg.object.member.voiceChannel;
    if(vc){
      for (var i = 0; i < self.streams.length; i++) {
        if(self.streams[i].chan == vc){
          self.leavev(vc, data);
          self.streams.splice(i,1);
          return;
        }
      }
      this.disnode.service.SendMessage("Try joinning a voice channel that the bot is in!", data.msg);
    }else {
      this.disnode.service.SendMessage("Try joinning a voice channel first!", data.msg);
    }
  }
  cmdStream(data){
    var self = this;
    if(data.msg.type != "DiscordService"){
      console.log("Command was ran on a non-Discord service!");
      this.disnode.service.SendMessage("You can only use this command with Discord!", data.msg);
      return;
    }
    var vc = data.msg.object.member.voiceChannel;
    if(vc){
      for (var i = 0; i < self.streams.length; i++) {
        if(self.streams[i].chan == vc){
          var vol = self.getvol(data.params);
          if(self.isValidURL(data.params[0])){
            var url = data.params[0];
            var queueItem = self.addToQueue(i, url, vol, data.msg.object.member.user.username);
            self.handleStream(i, data);
          }else {
            this.disnode.service.SendMessage("Invalid Youtube URL!", data.msg);
            return;
          }
          this.disnode.service.SendMessage("Added to Queue: **" + queueItem.url + "**\n Volume: **" + queueItem.vol + "**\n Requested by: **" + queueItem.requester + "**\n Position in Queue: **" + self.streams[i].queue.length + "**", data.msg);
          return;
        }
      }
      this.disnode.service.SendMessage("Try joinning a voice channel that the bot is in!", data.msg);
    }else {
      this.disnode.service.SendMessage("Try joinning a voice channel first!", data.msg);
    }
  }
  cmdSkip(data){
    var self = this;
    if(data.msg.type != "DiscordService"){
      console.log("Command was ran on a non-Discord service!");
      this.disnode.service.SendMessage("You can only use this command with Discord!", data.msg);
      return;
    }
    var vc = data.msg.object.member.voiceChannel;
    if(vc){
      for (var i = 0; i < self.streams.length; i++) {
        if(self.streams[i].chan == vc){
          self.streams[i].queue.splice(0,1);
          self.streams[i].isPlaying = false;
          self.handleStream(i, data);
          this.disnode.service.SendMessage("Skipped!", data.msg);
          return;
        }
      }
      this.disnode.service.SendMessage("Try joinning a voice channel that the bot is in!", data.msg);
    }else {
      this.disnode.service.SendMessage("Try joinning a voice channel first!", data.msg);
    }
  }
  joinv(voiceChannel, data){
    var self = this;
    var addToStreams = {};
    for (var i = 0; i < self.streams.length; i++) {
      if(self.streams[i].chan == voiceChannel){
        this.disnode.service.SendMessage("Im already in that Channel!", data.msg);
        return;
      }
    }
    voiceChannel.join().then(connection => {
      addToStreams.connection = connection;
      addToStreams.chan = voiceChannel;
      addToStreams.isPlaying = false;
      addToStreams.queue = [];
      self.streams.push(addToStreams);
      this.disnode.service.SendMessage("Joined: **" + voiceChannel.name + "**", data.msg);
      return;
    })
    .catch(console.log);
  }
  leavev(voiceChannel, data){
    var self = this;
    this.disnode.service.SendMessage("Leaving: **" + voiceChannel.name + "**", data.msg);
    voiceChannel.leave();
  }
  isValidURL(url){
    if(url.indexOf("https://www.youtube.com/watch?v=") != -1){
      return true;
    }else return false;
  }
  getvol(parms){
    var self = this;
    var vol = parseFloat(parms[1]);
    if(vol){
      if(vol >= self.config.maxVolume){
        vol = self.config.defaultVolume;
      }
    }else{
      vol = self.config.defaultVolume;
    }
    return vol;
  }
  addToQueue(streamsIndex, url, vol, requester){
    var self = this;
    var streamer = self.streams[streamsIndex];
    var queueItem = {
      url: url,
      requester: requester,
      vol: vol
    }
    streamer.queue.push(queueItem);
    return queueItem;
  }
  handleStream(streamsIndex, data){
    var self = this;
    var streamer = self.streams[streamsIndex];
    if(!streamer.isPlaying){
      if(streamer.queue.length > 0){
        var queueItem = streamer.queue[0];
        this.disnode.service.SendMessage("Playing: **" + queueItem.url + "**\n Volume: **" + queueItem.vol + "**\n Requested by: **" + queueItem.requester + "**", data.msg);
        streamer.stream = yt(queueItem.url, {audioonly: true});
        streamer.dispatcher = streamer.connection.playStream(streamer.stream,{volume: queueItem.vol});
        streamer.isPlaying = true;
        streamer.dispatcher.on('end', () => {
          streamer.queue.splice(0,1);
          streamer.isPlaying = false;
          self.handleStream(streamsIndex, data);
        });
      }
    }else {
      console.log("Tried to run handleStream while the stream is playing");
    }
  }
}
module.exports = MusicManager;
