const { ipcRenderer } = require("electron");
var $ = e => {return document.getElementById(e)};

document.addEventListener('DOMContentLoaded', (event) => {
    let sb = document.querySelectorAll('.sidebar-element');
    for (let i = 0; i < sb.length; i++) {
        sb[i].addEventListener('click', e => {
            let target = e.currentTarget.id.split('sidebar-')[1];
            ipcRenderer.send('loadStream', target)
        });
    }
})
