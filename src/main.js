const electron  = require('electron');
const ejs       = require('ejs');
const ejse      = require('ejs-electron');
const http      = require('./util/http.js');

electron.app.on('ready', () => {
    let authWindow = new electron.BrowserWindow({
        width: 500,
        height: 300,
        icon: 'src/assets/icon.png'
    });

    ejse.data({
        body: '../auth/login.ejs'
    });

    http.get('user/captcha/', response => {
        ejse.data('captcha', response);
        authWindow.loadFile('./src/components/layouts/master.ejs');
    });
});