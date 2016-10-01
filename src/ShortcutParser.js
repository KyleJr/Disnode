class ShortcutParser{
  constructor(){
    this.shortcuts = [];
  }


  parse(raw, shortcuts){
    var _shortcuts = this.shortcuts;
    var final = raw;
    if(shortcuts){
      for (var i = 0; i < options.shortcuts.length; i++) {
        _shortcuts.push(options.shortcuts[i]);
      }
    }

    for (var i = 0; i < _shortcuts.length; i++) {
      final.replace(_shortcuts[i].shortcut, _shortcuts[i].data);
    }

    return final;
  }
}

module.exports = ShortcutParser;
