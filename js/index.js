var remote = require('remote');
var Window = remote.getCurrentWindow();
var ipc = require('ipc-renderer');
// var fs = require('fs');
// var db = require('./db/nedbmodule');
// var pathModule = require('path');

// Window.openDevTools();

document.getElementById('close').addEventListener('click', function(){
	Window.close();
});

document.getElementById('max').addEventListener('click', function(){
	if(Window.isMaximized()){
				Window.unmaximize();
	} else {
		Window.maximize();
	}
});

document.getElementById('min').addEventListener('click', function(){
	Window.minimize();
});

document.getElementById('openLibraryManager').addEventListener('click', function(){
	ipc.send('toggle-libraryManagerWindow');
	// document.getElementById('shadowBlock').className = ;
});

// document.getElementById('shadowBlock').addEventListener('click', function(){

// });