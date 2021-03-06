const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
const ipcMain = electron.ipcMain

const child_process = require('child_process');
const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

var process_restream = null;
var process_play = null;

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 900, height: 600, resizable: false})

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  if (process.env['DEBUG'])
    mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

ipcMain.on('stream', function(evt, my_ip, session) {
	process_restream = child_process.spawn("ffmpeg",
		["-i", "rtp://" + my_ip + ":1234",
			"sessions/" + session + ".mp3",
			"-f", "rtp", "-acodec", "copy", "-vcodec", "copy",
			"rtp://127.0.0.1:5555"],
			{ stdio: ['inherit', 'inherit', 'inherit'] });
});

ipcMain.on('play', function(evt, args) {
	process_play = child_process.spawn("ffplay", ["rtp://127.0.0.1:5555"]);
});

app.on('before-quit', function() {
	if (process_restream) process_restream.kill('SIGINT');
	if (process_play) process_play.kill('SIGINT');
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
