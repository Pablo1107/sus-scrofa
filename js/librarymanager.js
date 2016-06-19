var remote = require('remote');
var Window = remote.getCurrentWindow();
var ipc = require('ipc-renderer');
var fs = require('fs');
var db = require('./../db/nedbmodule');
// var pathModule = require('path');

document.getElementById('close').addEventListener('click', function(){
	Window.hide();
});

// document.getElementById('max').addEventListener('click', function(){
// 	if(Window.isMaximized()){
// 				Window.unmaximize();
// 	} else {
// 		Window.maximize();
// 	}
// });

// document.getElementById('min').addEventListener('click', function(){
// 	Window.minimize();
// });

refreshFoldersList();

document.getElementById('selFolder').addEventListener('change', function(evt){
	if(evt.target.files[0]){
		db.watchFolder(evt.target.files[0].path);
		setTimeout(function(){
			refreshFoldersList();
		}, 500);
	} else {console.log("No se selecciono ninguna carpeta. :(");}
});

document.getElementById('removeFolder').addEventListener('click', function(){
	if(document.getElementById('f' + document.getElementById('input1').value)){
		db.unwatchFolder(document.getElementById('f' + document.getElementById('input1').value).innerHTML);
		refreshFoldersList();
	} else {
		console.log('Error: no se ha ingresado un item valido');
	}
});

document.getElementById('checkFiles').addEventListener('click', function(){
	db.checkFiles();
});

document.getElementById('refreshList').addEventListener('click', function(){
	refreshFoldersList();
});

document.getElementById('checkFolders').addEventListener('click', function(){
	db.checkFolders();
});

function refreshFoldersList(){
	document.getElementById('list').innerHTML = '';
	db.listFolders({}, function(err, docs){
		docs.forEach(function(cur, index){
			document.getElementById('list').innerHTML += '<li id=\'f' + (index + 1) + '\'>' + cur.path + '</li>';
		});
	});
	console.log('Lista actualizada');
}