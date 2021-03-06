const ammoBuy = require("./Scrapes/ammobuy.js");

const sqlMethods = require("./SQL_Methods/sql_methods.js");

const methods = require("./methods.js");

const readline = require('readline');

const fs = require('fs');

const log = true;

var run = true;

// Listeners

ammoBuy.aBEmitter.on('scrapeComplete', function (results) {

    for (i = 0; i < results.length; i++) {
        var insert = new sqlMethods.SQLInsert(results[i], 'price');

        insert.go();
    }  
});

// Checks

async function checkTime() {

    //Get to the first minute past the hour
    var minutes = new Date(Date.now());

    minutes = minutes.getMinutes();

    if (minutes == 0) {
        await methods.sleep(methods.minutesToSeconds(1));
        minutes = 1;
    }

    if (minutes != 1) {
        await methods.sleep(methods.minutesToSeconds(61 - minutes));
    }

    //Check the hour
    var hour = new Date(Date.now());

    hour = hour.getHours();   // targeting 10 am, 2pm, and 10 pm

    if (hour == 10 || hour == 14 || hour == 22) {
        return true;
    }

    return false;
}

// Main method

async function main() {
    while (run == true) {
        if (await checkTime() == true) {
            ammoBuy.scrapeAmmoBuy(log);
        }

        await methods.sleep(3600);
    }
}

// Program

try {
    main();
}
catch (err) {
    methods.logger(err.message);
}
