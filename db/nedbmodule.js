var pathModule = require('path');
var Datastore = require('nedb');
var fs = require('fs');
var id3 = require('id3js');

// Creates a new DB.
var db = {
	folders: new Datastore({filename: pathModule.join(__dirname, 'folders.db'), autoload: true}),
	files: new Datastore({filename: pathModule.join(__dirname, 'files.db'), autoload: true})
};

var watches = [];

module.exports = {
	initWatches: function(){
		module.exports.checkFiles();
		module.exports.checkFolders();
		db.folders.find({}, function(err, docs){
			docs.forEach(function(currentValue){
				module.exports.watchFolder(currentValue.path);
			});
		});
		setTimeout(function(){
			console.log('Iniciados ' + watches.length + ' watches');
		}, 500);
	},
	getWatches: function(){return watches;},
	watchFolder: function(path){
		if(typeof path !== 'string'){console.log('Error: el argumento de watchFolder debe ser string.'); return;}
		fs.access(path, fs.F_OK, function(err){
			if(err === null){
				// the folder is insert into the db if not
				db.folders.update({path: path}, {"$set": {path: path}}, {upsert: true});
				if(!watches.some(function(cur){return cur.path === path;})){
					// fs.watch() will watch the directory for changes
					var w = fs.watch(path, {recursive: true}, function(evt, filename){
						if(filename){
							var pathFile = pathModule.join(path, filename);
							// id3tag will search for the file in the pathFile and callback a function
							id3({ file: pathFile, type: id3.OPEN_LOCAL }, function(err, tags) {
								if(err === undefined){
									tags = JSON.parse(JSON.stringify(tags).replace(/\\u0000/g, "")); // Removes crap out of the tags
									// outputDB contains the structure that will be send the tags to the DB
								    var outputDB =	{
								    					"path": pathFile,
														"title": tags.title,
														"album": tags.v2.album,
														"artist": tags.artist,
														"year": tags.year,
														"comment": tags.v1.comment,
														"track": tags.v1.track,
														"composer": tags.v2.composer,
														"genre": tags.v1.genre,
														"fileName": filename
													};
									// Updates the document of this file if exists, if not creates a new document
								    db.files.update({"path": outputDB.path}, {"$set": outputDB}, {upsert: true});
								    console.log('Añadido', outputDB.title, '-', outputDB.artist, 'on', evt, 'event.');
								} else{
									db.files.remove({"path": pathFile});
									console.log('Removido un archivo.');
								}
							});
						} else {
							module.exports.checkFiles();
						}
					});

					
					watches.push({path: path, w: w});
				}
			} else {
				if(err.errno === -4058){ //-4058 is the error number for no directory or file found
					console.log('Error: no existe tal directorio. ');
				}
			}
		});
	},
	unwatchFolder: function(path){
		watches.forEach(function(curr, index){
			if(curr.path == path){
				db.folders.remove({path: curr.path});
				curr.w.close();
				watches.splice(index, 1);
				console.log('Removido del watch' + curr.path);
			}
		});
	},
	checkFiles: function(){
		db.files.find({}, function(err, docs){
			docs.forEach(function(currentValue){
				fs.access(currentValue.path, fs.F_OK, function(err){
					if(err){
						if(err.errno === -4058){
							db.files.remove(currentValue);
							console.log('Removido', currentValue.title, '-', currentValue.artist);
						}
					} 
				});
			});
		});
	},
	listFiles: function(query, callback){
		db.files.find(query).exec(callback);
	},
	checkFolders: function(){
		db.folders.find({}, function(err, docs){
			docs.forEach(function(currentValue){
				fs.access(currentValue.path, fs.F_OK, function(err){
					if(err){
						if(err.errno === -4058){
							db.folders.remove(currentValue);
							console.log('Removido', currentValue.path);
						}
					} 
				});
			});
		});
	},
	listFolders: function(query, callback){
		db.folders.find(query).exec(callback);
	}
};