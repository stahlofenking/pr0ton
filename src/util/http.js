const request = require('request-promise');
const cookie = require('cookie');
const config = require('../config/config.json');
const fs = require('fs');

var meCookie;
if(fs.existsSync('cookie.txt')) meCookie = fs.readFileSync('cookie.txt').toString();

let get = (url, callback, error) => {
    let options = {};

    if(meCookie){
        options.headers = {
            'cookie': meCookie
        } 
    }
    request.get(config.api_baseurl + url, options)
    .then(data => {
        callback(JSON.parse(data));
    })
    .catch(err => {
        console.log(err);
        if(error) error(err);
    });
} 

let getCluster = (urls, callback) => {
    let rqCt = 0;
    let finishedRqs = {}
    let checkFinish = () => {
        rqCt++;
        if(rqCt >= urls.length) callback(finishedRqs);
    }
    urls.forEach(url => {
        get(url, response => {
            finishedRqs[url] = response;
            checkFinish();
        }, err => {
            finishedRqs[url] = err;
            checkFinish();
        });
    });
}

let post = (url, data, callback, error) => {
    request.post(config.api_baseurl + url, {form: data, json: true, resolveWithFullResponse: true})
    .then(data => {
        meCookie = data.headers['set-cookie'].filter(t => t.startsWith('me='))[0]
        if(data.headers['set-cookie'].filter(t => t.startsWith('me='))[0]) fs.writeFileSync('cookie.txt', meCookie);
        callback(data.body);
    })
    .catch(err => {
        console.log(err);
        if(error) error(err);
    });
} 

let me = () => {
    return JSON.parse(cookie.parse(meCookie).me);
} 


module.exports = {
    get,
    getCluster,
    post,
    me
}