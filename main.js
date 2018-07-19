var Week1Module = require('./src/RC-RY-WEEK1');

var week1 = new Week1Module();

week1
    .login()
    .then(res => {
        week1.listenOnPresence();

        const accountId = '230919004';
        week1.readCallRecordings();
    });