// Electron Module with the app manage and the BrowserWindows
var electron = require('electron');
var app = electron.app;
var BrowserWindows = electron.BrowserWindow;

// FileSystem Module
var fs = require('fs');

// ipcMain Module
var ipc = electron.ipcMain;

var mainWindow = null;
var libraryManagerWindow = null;
var config = null;

// nedbmodule.js
var db = require('./db/nedbmodule.js');

app.on('window-all-closed', function(){
	if(process.platform != 'darwin'){
		app.quit();
	}
});

app.on('ready', function(){
	config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
	// Esto crea la ventana
	mainWindow = new BrowserWindows(
		{
			title: 'Musica',
			frame: false,
			width: config.currentWidth,
			height: config.currentHeight,
			x: config.currentXpos,
			y: config.currentYpos,
			minWidth: 450,
			minHeight: 500
		}
	);

	mainWindow.on('resize', function(){
		size = mainWindow.getSize();
		config.currentWidth = size[0];
		config.currentHeight = size[1];
		fs.writeFileSync('config.json', JSON.stringify(config, null, 2), 'utf8');
	});

	mainWindow.on('move', function(){
		bounds = mainWindow.getBounds();
		config.currentXpos = bounds.x;
		config.currentYpos = bounds.y;
		fs.writeFileSync('config.json', JSON.stringify(config, null, 2), 'utf8');
	});

	ipc.on('nodeConsole', function(evt, msg){
		console.log(msg);
	});

	mainWindow.loadURL('file://' + __dirname + '/index.html');

	mainWindow.on('closed', function(){
		mainWindow = null;
		if(libraryManagerWindow){
			libraryManagerWindow.close();
			libraryManagerWindow = null;
		}
	});

	libraryManagerWindow = new BrowserWindows(
		{
			title: 'Administrador de Biblioteca',
			frame: false,
			width: 450,
			height: 500,
			resizable: false,
			minimizable: false,
			maximizable: false,
			show: false
		}
	);

	libraryManagerWindow.loadURL('file://' + __dirname + '/menupages/librarymanager.html');

	ipc.on('toggle-libraryManagerWindow', function(){
		if(libraryManagerWindow.isVisible()){
			libraryManagerWindow.hide();
		} else {
			libraryManagerWindow.show();
		}
	});

	libraryManagerWindow.on('closed', function(){
		libraryManagerWindow = null;
	});

	// ipc.on('create-libraryManagerWindow', function(){
	// 	if(libraryManagerWindow === null){
	// 		libraryManagerWindow = new BrowserWindows(
	// 			{
	// 				title: 'Administrador de Biblioteca',
	// 				frame: false,
	// 				width: 450,
	// 				height: 500,
	// 				resizable: false,
	// 				minimizable: false,
	// 				maximizable: false
	// 			}
	// 		);

	// 		libraryManagerWindow.loadURL('file://' + __dirname + '/menupages/librarymanager.html');
	// 		libraryManagerWindow.on('closed', function(){
	// 			libraryManagerWindow = null;
	// 		});
	// 	} else {
	// 		console.log('Error: la ventana ya esta creada');
	// 	}
	// });

	// database
	db.initWatches();
});