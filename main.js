var Week1Module = require('./src/RC-RY-WEEK1');

var week1 = new Week1Module();

const account = {
    userName: process.env.RINGCENTRAL_USERNAME,
    password: process.env.RINGCENTRAL_PASSWORD
}

week1
    .login(account)
    .then(res => {
        week1.listenOnPresence();

        week1.readCallRecordings();
    });