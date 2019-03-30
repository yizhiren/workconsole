
var Player = require('player')


var player = new Player(process.argv[2]);

player.on('playing',function(item){
	console.log('im playing... src:' , item);
});

player.on('playend',function(item){
	console.log('playend... src:' , item);

});

player.on('error', function(err){
	console.log(err);

});

player.play()
