var blessed = require('blessed')
var contrib = require('blessed-contrib')
var psList = require('ps-list');
var musicAPI = require("music-api-next");
var child_process = require('child_process');
let Wechat = require('chatwe')
let wechat = new Wechat()

var screen
var lunchTime
var dinnerTime
var sleepTime
var processList
var chat
var music

var playing = {}
var chatMsg = []
var musicSource = 'netease'

function appendChatMsg(msg) {
  var fromUser = msg.From
  var fromName = fromUser.NickName
  if (fromUser.RemarkName && fromUser.RemarkName !== '') {
    fromName += '(' + fromUser.RemarkName + ')'
  }
  if(msg.IsFromChatRoom) {
    var roomUser = msg.ChatRoomUser
    var displayName = roomUser.DisplayName || ''
    var roomUserName = displayName != '' ? displayName: roomUser.NickName
    fromName = '{' + roomUserName + '}@' + fromName
  }

  var toUser = msg.To
  var toName = toUser.NickName
  if (toUser.RemarkName && toUser.RemarkName !== '') {
    toName += '(' + toUser.RemarkName + ')'
  }
  chatMsg.unshift({
    type: msg.Type,
    time: new Date().toLocaleString(),
    from: fromName,
    to: toName,
    content: msg.Content
  })

}


wechat.setLogging('debug',false,"board.log")
wechat.registerTextHandler(async function (msg) {
  appendChatMsg(msg)
  //console.log(msg)
}).registerMapHandler(async function (msg) {
  await msg.Download()
  appendChatMsg(msg)
  //console.log(msg)
}).registerImageHandler(async function (msg) {
  await msg.Download()
  appendChatMsg(msg)
  //console.log(msg)
}).registerVoiceHandler(async function (msg) {
  await msg.Download()
  appendChatMsg(msg)
  //console.log(msg)
}).registerVideoHandler(async function (msg) {
  await msg.Download()
  appendChatMsg(msg)
  //console.log(msg)
}).registerSysHandler(async function (msg) {
  appendChatMsg(msg)
  //console.log(msg)
}).registerFriendHandler(async function (msg) {
  appendChatMsg(msg)
  //console.log(msg)
}).registerCardHandler(async function (msg) {
  appendChatMsg(msg)
  //console.log(msg)
}).registerStatusHandler(async function (msg) {
  appendChatMsg(msg)
  //console.log(msg)
}).registerRecallHandler(async function (msg) {
  appendChatMsg(msg)
  //console.log(msg)
}).registerFileHandler(async function (msg) {
  await msg.Download()
  appendChatMsg(msg)
  //console.log(msg)
}).registerNoteHandler(async function (msg) {
  appendChatMsg(msg)
  //console.log(msg)
})

function attachAll(){
  lunchTime.emit('attach');
  dinnerTime.emit('attach');
  sleepTime.emit('attach');
  processList.emit('attach')
  chat.emit('attach')
  music.emit('attach')
}


function updatelunchTime(){

  var pct = 0.00;
  var pctTime = ''

  var cur = new Date();
  var curTime = cur.getTime();

  var t12 = new Date(cur.getFullYear() + '/' + (1+cur.getMonth()) + '/' + cur.getDate() + ' 12:00:00');
  var t12Time = t12.getTime();

  var t9 = new Date(cur.getFullYear() + '/' + (1+cur.getMonth()) + '/' + cur.getDate() + ' 09:00:00');
  var t9Time = t9.getTime();

  if(curTime < t9Time) {
    pct = 1
    pctTime = 'Not On Work'
  } else if(curTime > t12Time) {
    pct = 0;
    pctTime = 'See You Tomorrow'
  } else {
    pct = (t12Time-curTime) / (t12Time-t9Time)
    var snd = (t12Time-curTime) / 1000
    var h = Math.floor(snd / 3600);
    var m = Math.floor((snd / 60 % 60));
    var s = Math.floor((snd % 60));
    pctTime = h + "H " + m + "M " + s + "S";
  }

  var color = "green";
  if (pct >= 0.25) color = "cyan";
  if (pct >= 0.5) color = "yellow";
  if (pct >= 0.75) color = "red";

  lunchTime.setData([
    {percent: pct.toFixed(2), label: pctTime, 'color': color}
  ]);

  screen.render()
}

///
function updateDinnerTime(){

  var pct = 0.00;
  var pctTime = ''

  var cur = new Date();
  var curTime = cur.getTime();

  var t18 = new Date(cur.getFullYear() + '/' + (1+cur.getMonth()) + '/' + cur.getDate() + ' 18:30:00');
  var t18Time = t18.getTime();

  var t12 = new Date(cur.getFullYear() + '/' + (1+cur.getMonth()) + '/' + cur.getDate() + ' 12:00:00');
  var t12Time = t12.getTime();

  if(curTime < t12Time) {
    pct = 1
    pctTime = 'Good Morning'
  } else if(curTime > t18Time) {
    pct = 0;
    pctTime = 'See You Tomorrow'
  } else {
    pct = (t18Time-curTime) / (t18Time-t12Time)
    var snd = (t18Time-curTime) / 1000
    var h = Math.floor(snd / 3600);
    var m = Math.floor((snd / 60 % 60));
    var s = Math.floor((snd % 60));
    pctTime = h + "H " + m + "M " + s + "S";
  }

  var color = "green";
  if (pct >= 0.25) color = "cyan";
  if (pct >= 0.5) color = "yellow";
  if (pct >= 0.75) color = "red";

  dinnerTime.setData([
    {percent: pct.toFixed(2), label: pctTime, 'color': color}
  ]);

  screen.render()
}


///
function updateSleepTime(){

  var pct = 0.00;
  var pctTime = ''

  var cur = new Date();
  var curTime = cur.getTime();

  var t24 = new Date(cur.getFullYear() + '/' + (1+cur.getMonth()) + '/' + cur.getDate() + ' 23:59:59');
  var t24Time = t24.getTime();

  var t0 = new Date(cur.getFullYear() + '/' + (1+cur.getMonth()) + '/' + cur.getDate() + ' 0:00:00');
  var t0Time = t0.getTime();

  {
    pct = (t24Time-curTime) / (t24Time-t0Time)
    var snd = (t24Time-curTime) / 1000
    var h = Math.floor(snd / 3600);
    var m = Math.floor((snd / 60 % 60));
    var s = Math.floor((snd % 60));
    pctTime = h + "H " + m + "M " + s + "S";
  }

  var color = "green";
  if (pct >= 0.25) color = "cyan";
  if (pct >= 0.5) color = "yellow";
  if (pct >= 0.75) color = "red";

  sleepTime.setData([
    {percent: pct.toFixed(2), label: pctTime, 'color': color}
  ]);

  screen.render()
}


///
function generateProcess() {

  (async () => {
    var psInfo = await psList()
    if(!psInfo || psInfo.length <= 0){
      return
    }
    psInfo.sort(function(a, b) {
      return b.cpu - a.cpu;
    });

    var data = []
    for(var i=0;i<psInfo.length;i++){
     var row = []
     row.push(psInfo[i].name)
     row.push(psInfo[i].cpu)
     row.push(psInfo[i].memory)
     data.push(row)
    }
    processList.setData({headers: ['Process', 'Cpu (%)', 'Memory (%)'], data: data})

    screen.render()
  })();

}


///

function generateChat() {
  chatMsg = chatMsg.slice(0,100)

  if(chatMsg.length <= 0){
    return
  }
  var data = []
  for(var i=0;i<chatMsg.length;i++){
   var row = []
   row.push(chatMsg[i].type)
   row.push(chatMsg[i].time)
   row.push(chatMsg[i].from)
   row.push(chatMsg[i].to)
   row.push(chatMsg[i].content)
   data.push(row)
  }
  chat.setData({headers: ['Type', 'Time', 'From', 'To', 'Content'], data: data})

  screen.render()
}

async function getNextSong() {
  var keys=['周杰伦','陈奕迅','李宗盛','刘德华','张学友']
  var key = keys[Math.floor(Math.random()*keys.length)]
  var songs = await musicAPI
    .searchSong({
      key: key,
      page: 1,
      limit: 10,
      vendor: musicSource
    })
    .then(async function(songs) {
      return songs
    })
    .catch(error => {
      console.log(error.message)
      return {success:false}
    });

  if(!songs || !songs.success || songs.results.length <= 0) {
    await waitOneSecond()
    return getNextSong()
  }

  var results = songs.results
  var result = results[Math.floor(Math.random()*results.length)]
  if(result.needPay){
    result = results[Math.floor(Math.random()*results.length)]
  }
  if(result.needPay){
    result = results[Math.floor(Math.random()*results.length)]
  }
  if(result.needPay){
    return getNextSong()
  }

  var meta = await musicAPI
    .getSong({
      id: result.id,
      vendor: musicSource
    })
    .then(meta => meta)
    .catch(error => {
      console.log(error.message)
      return {success:false}
    });

  if(meta && meta.success) {
    meta.artist = result.artist
    meta.name = result.name
    meta.url = meta.results.url
    return meta
  } else {
    await waitOneSecond()
    return getNextSong()
  }
  
}

async function loopplay(){
  var meta = await getNextSong()
  //meta.url='/Users/qroot/code/workconsole/workconsole/cache/1553984277676.mp3'
  playing = meta
  
  // 现在播放完会crash，放子进程进行绕过
  var playerSon = child_process.spawn('node',['mp3.js', meta.url])

  playerSon.on('exit', (code) => {
    //console.log(`exited ${code}`);
    loopplay()
  });
}


function generateMusic() {
  if(!playing.name){
    return
  }

  var dummySparkLine = []
  for(var i=0;i<200;i++) {
    dummySparkLine.push(Math.random()*10+1)
  }
  
  music.setData(['[playing...] ' + playing.name + '(' + playing.artist + ')'], [dummySparkLine])     

  screen.render()
}


async function main() {

  await wechat.login()
  if(!wechat.isLogined){
    return
  }

  ///
  screen = blessed.screen({
    fullUnicode: true
  })
  screen.title = 'My\'s Dashboard'
  var grid = new contrib.grid({rows: 12, cols: 11, screen: screen})

  ///
  lunchTime = grid.set(0, 0, 4, 2, contrib.donut,
    {
    label: 'Time To Lunch',
    radius: 16,
    arcWidth: 4,
    yPadding: 2,
    data: [{label: 'Eat Eat Eat', percent: 99}]
  })
  setInterval(updatelunchTime, 1000)
  ///
  dinnerTime = grid.set(0, 2, 4, 2, contrib.donut,
    {
    label: 'Time To Dinner',
    radius: 16,
    arcWidth: 4,
    yPadding: 2,
    data: [{label: 'Eat Eat Eat', percent: 99}]
  })
  setInterval(updateDinnerTime, 1000)
  ///
  sleepTime = grid.set(0, 4, 4, 2, contrib.donut,
    {
    label: 'Time To Sleep',
    radius: 16,
    arcWidth: 4,
    yPadding: 2,
    data: [{label: 'Work Work Work', percent: 99}]
  })
  setInterval(updateSleepTime, 1000)
  ///
  processList =  grid.set(0, 6, 4, 5, contrib.table,
    { keys: true
    , fg: 'green'
    , label: 'Active Processes'
    , columnSpacing: 1
    , columnWidth: [24, 10, 10]})
  generateProcess()
  setInterval(generateProcess, 3000)
  ///
  music = grid.set(4, 0, 2, 11, contrib.sparkline, 
  { label: 'Music-' + musicSource
  , tags: true
  , style: { fg: 'red', titleFg: 'green' }})

  /*grid.set(4, 0, 1, 11, contrib.table,
    { keys: true
    , fg: 'green'
    , label: 'Music'
    , columnSpacing: 1
    , columnWidth: [16, 24, 20, 20, 60]})*/
  loopplay()
  setInterval(generateMusic, 1000)
  ///
  chat =  grid.set(6, 0, 6, 11, contrib.table,
  { keys: true
  , fg: 'green'
  , label: 'Wechat'
  , columnSpacing: 1
  , columnWidth: [16, 24, 20, 20, 60]})
  chat.focus()
  setInterval(generateChat, 1000)

  ///
  screen.key(['escape', 'q', 'C-c'], function(ch, key) {
    return process.exit(0);
  });


  screen.on('resize', function() {
    attachAll()
  });

  screen.render()
}


main()

