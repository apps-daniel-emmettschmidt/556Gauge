var args = process.argv.slice(2);

console.log('Began app');

const appfs = require('fs');

if(args.length > 0 && args.length != 3){
    throw new Error('Incorrect number of arguments, you supplied ' + args.length + 'and you should have provided 3.');
}

const ammoBuy = require("./Scrapes/ammobuy.js");

const sqlMethods = require("./SQL_Methods/sql_methods.js");

const methods = require("./methods.js");

const readline = require('readline');

const fs = require('fs');

const log = true;

var scrapesCompleted = 0;

// Listeners

ammoBuy.aBEmitter.on('scrapeComplete', function (results) {
    for (i = 0; i < results.length; i++) {
        var insert = new sqlMethods.SQLInsert(results[i], 'price');

        insert.go();
    }  

    evaluateEnd();
});

async function evaluateEnd(){
    while(ammoBuy.totalQueries == -1 || sqlMethods.queriesCompleted < ammoBuy.totalQueries){
        await methods.sleep(2);
    }

    scrapesCompleted++;

    if(scrapesCompleted == ammoBuy.totalScrapes){
        process.exit();
    }
}

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

    return;
}

// Main method

async function main() {
    // await checkTime();

    var ret = await ammoBuy.scrapeAmmoBuy(log);
    
    return ret;
}

// Program

try {
    var pause = main();

    pause.then((report) => {console.log(report)});
}
catch (err) {
    methods.logger(err.message);
}
