var db = require('./nedbmodule.js');

var p = 'f:\\Users\\Pablo\\Desktop\\Electron.io 2\\music';

// db.watchFolder(p);

db.initWatches();

// db.listFiles({}, function(err, docs){
// 	console.log(docs);
// });

// db.listFolders({}, function(err, docs){
// 	docs.forEach(function(currentValue){
// 		console.log(currentValue.path);
// 	});
// });


setTimeout(function(){
	db.unwatchFolder(p);
	db.unwatchFolder('f:\\Users\\Pablo\\Desktop\\Electron.io\\js');
}, 5000);