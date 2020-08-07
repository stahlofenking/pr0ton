let login = () => {
    ipcRenderer.send('login', {
        name: $('login-username').value,
        password: $('login-password').value,
        captcha: $('login-captcha').value
    });
};

ipcRenderer.on('error', (e, err) => {
    switch(err){
        case 'invalidCaptcha':
            alert('Captcha falsch');
            break;
        case 'invalidLogin':
            alert('Falsche Zugangsdaten');
            break;
        case 'userBanned':
            alert('Du bist gebannt.');
            break;
        default:
            alert('Etwas ist schiefgelaufen');
            break;
    }
});