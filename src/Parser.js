exports.ParseString = function (str, settings) {
    str = str.replace("[BOLD]", settings.bold);
    str = str.replace("[ITALIC]", settings.italic);
    var msgs = [];
    if(settings.newLine == false){
      var newLines = getIndicesOf("\n", str,false);

      if(newLines.length == 0){
        msgs.push(str);
      }else{
        var lastStart;
        msgs.push(str);
        for (var i = 0; i < newLines.length; i++) {
          var startIndex = newLines[i];
          var endIndex = newLines[i+1] || newLines[newLines.length-1];
          msgs.push(str);

        }
      }
    }
    return msgs;
};


function getIndicesOf(searchStr, str, caseSensitive) {
    var searchStrLen = searchStr.length;
    if (searchStrLen == 0) {
        return [];
    }
    var startIndex = 0, index, indices = [];
    if (!caseSensitive) {
        str = str.toLowerCase();
        searchStr = searchStr.toLowerCase();
    }
    while ((index = str.indexOf(searchStr, startIndex)) > -1) {
        indices.push(index);
        startIndex = index + searchStrLen;
    }
    return indices;
}
