const axios = require('axios');
const config = require('../config/config.json');


let get = (url, callback, error) => {
    axios.get(config.api_baseurl + url)
    .then(data => {
        callback(data.data);
    })
    .catch(err => {
        console.log(error);
        error(error);
    });
} 


module.exports = {
    get
}