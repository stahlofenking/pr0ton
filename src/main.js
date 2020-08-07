const electron  = require('electron');
const ejs       = require('ejs');
const ejse      = require('ejs-electron');
const http      = require('./util/http.js');
const { ipcMain, app }= require('electron');
const config    = require('./config/config.json');
const fs        = require('fs');
const open      = require('open');



function createWindow () {
    let authWindow = new electron.BrowserWindow({
        width: 770,
        height: 500,
        icon: 'src/assets/icon.png',
        transparent: true,
        frame: false,
        resizable: false,
        webPreferences: {
            nodeIntegration: true
        }
    });

    let newLogin = () => {
        http.get('user/captcha/', response => {
            captcha = response;
            ejse.data({
                body: '../auth/login.ejs',
                captcha
            });
            authWindow.loadFile('./src/components/layouts/master.ejs');
        });
    }

    let switchToGrid = () => {
        let mainWindow = new electron.BrowserWindow({
            width: 1600,
            height: 900,
            icon: 'src/assets/icon.png',
            transparent: true,
            frame: false,
            webPreferences: {
                nodeIntegration: true
            }
        });

        authWindow.close();
        authWindow = null;

        http.getCluster(['user/info', 'items/get', 'profile/info?name=' + http.me().n], rqs => {
            user = rqs['user/info'];
            userinfo = rqs['profile/info?name=' + http.me().n];
            
            ejse.data({
                body: '../main/grid.ejs',
                account: http.me(),
                user,
                userinfo,
                items: rqs['items/get'].items,
                currentSite: 'new'
            });
            if(config['theme_color']) ejse.data('theme', config['theme_color']);
            
            mainWindow.loadFile('./src/components/layouts/master.ejs');
        });

        // Item-Stream wechseln
        ipcMain.on('loadStream', (e, data) => {
            let url = 'items/get';
            ejse.data({
                body: '../main/grid.ejs',
                account: http.me(),
                user,
                userinfo,
                currentSite: data
            });
            if(data.startsWith('collection-')){
                ejse.data('items', userinfo.collections.find(c => c.id == data.split('collection-')[1]).items);
                mainWindow.loadFile('./src/components/layouts/master.ejs');
            }
            if(data.startsWith('user-')){
                http.get('profile/info?name=' + data.split('user-')[1], items => {
                    ejse.data('userinfo', items);
                    ejse.data('body', '../main/account.ejs');
                    mainWindow.loadFile('./src/components/layouts/master.ejs');
                });
            }
            else {
                switch(data){
                    case 'account':
                        url = 'dont';
                        console.log(userinfo)
                        ejse.data('body', '../main/account.ejs');
                        mainWindow.loadFile('./src/components/layouts/master.ejs');
                        break;
                    case 'bestof':
                        url += '?tags=!s%3A4000';
                        break;
                    case 'top':
                        url += '?promoted=1';
                        break;
                    case 'new':
                        url += '?promoted=0';
                        break;
                    case 'stalking':
                        url += '?following=1';
                        break;
                    case 'trash':
                        url += '?tags=!s%3A-200';
                        break;
                    case 'controversial':
                        url += '?tags=!f%3Acontroversial';
                        break;
                    case 'about':
                        url = 'dont';
                        ejse.data('body', '../main/about.ejs');
                        mainWindow.loadFile('./src/components/layouts/master.ejs');
                        break;
                    case 'leave':
                        url = 'dont';
                        mainWindow.close();
                        app.exit();
                        break;
                    default: 
                        break;
                }
                if(url != 'dont') http.get(url, items => {
                    ejse.data('items', items.items);
                    mainWindow.loadFile('./src/components/layouts/master.ejs');
                });
            }
        });

        mainWindow.webContents.on('new-window', (event, url) => {
            event.preventDefault();
            open(url);
        });
    }

    var captcha, user, userinfo, filters = 4;

    
    http.get('user/loggedin/', response => {
        if(response.loggedIn){
            switchToGrid();
        }
        else{
            newLogin();
        }
    });

    ipcMain.on('login', (e, data) => {
        http.post('user/login/', { token: captcha.token, ...data}, response => {
            if(!response.success){
                if(response.ban != null) return authWindow.webContents.send('error', 'userBanned');
                authWindow.webContents.send('error', response.error);
                return newLogin();
            }
            switchToGrid();

        }, error => {
            console.log('[ERROR]', error)
            return newLogin();
        });
    }, error => {
        console.log(error)
        return newLogin();
    });
}

electron.app.on('ready', () => setTimeout(createWindow, 400));