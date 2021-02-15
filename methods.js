const sqlMethods = require("./SQL_Methods/sql_methods.js");

function sleep(seconds) {
    sleep(seconds, false);
}

function sleep(seconds, random) {

    if (random == true) {
        var ms = randInt(0, seconds * 10) * 100;
    }
    else {
        var ms = seconds * 1000;
    }

    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports.sleep = sleep;

function minutesToSeconds(minutes) {
    return (minutes * 60);
}

module.exports.minutesToSeconds = minutesToSeconds;

function logger(log) {

    var trim = String(log).substr(0, 99);

    var insert = new sqlMethods.SQLInsert(trim, 'log');

    insert.go();
}

module.exports.logger = logger;