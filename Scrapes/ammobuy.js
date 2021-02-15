'use strict';

const methods = require("./../methods.js");

const puppeteer = require('puppeteer');

const readline = require('readline');

const events = require("events");

// Globals

var completed = 0;

const aBEmitter = new events.EventEmitter();

// Flow Methods

async function primary(urls, log) {
    var results = [];

    try {
        results = await getScrapes(urls, log);
    }
    catch (err) {
        methods.logger(err.message);
    }
}

function sleep(s, random) {

    if (random == true) {
        var ms = randInt(0 , s * 10) * 100;
    }
    else {
        var ms = s * 1000;
    }
        
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Scrape Methods

async function getScrapes(urls, log) {

    var i;

    const results = [];

    for (i = 0; i < urls.length; i++) {

        const url = urls[i];

        results.push('Incomplete');

        try {
            results[i] = scrape(url, i, log);

            sleep(1, true);
        }
        catch (err) {
            if (log == true) {
                methods.logger(err.message);
            }
        }

    }

    while (completed < results.length) {

        if (log == true) {
            var now = new Date(Date.now());
            methods.logger('Waiting on scrapes, ' + completed + ' scrapes complete.');
        }

        await sleep(2, false);

    }

    if (log == true) {
        for (i = 0; i < results.length; i++) {
            results[i].then((value) => {

                for (i = 0; i < value.length; i++) {
                    methods.logger('Scrape complete: ' + value[i].reportString)
                }


            })
        }
    }

    return results;
}

async function scrape(url, scrapeID, log) {

    var results = [];

    try {
        const browser = await puppeteer.launch(
            {
                headless: true
            }
        );

        const page = await browser.newPage();

        page.setDefaultNavigationTimeout(240000);

        await page.goto(url);

        await page.waitFor('.ammo-row');

        results = await page.$$eval('.ammo-row', rows => {
            return rows.map(row => {
                var properties = {};
                properties.hasError = false;
                properties.isPPR = 1;
                properties.price = -1;
                properties.rounds = -1;
                properties.PPR = Number(row.querySelector('.ammo-ppr').textContent.replace('$', ''));
                properties.prodTitle = row.querySelector('.ammo-desc').textContent.substr(0, 30);
                properties.prodSource = row.querySelector('.ammo-retailer').textContent.substr(0, 10).replace(/(\r\n|\n|\r)/gm, "");
                properties.scrapeURL = "";

                properties.reportString = '' + properties.hasError + ' ' + properties.isPPR + ' ' + properties.price + ' ' + properties.rounds + ' ' + properties.PPR + ' '
                    + properties.prodTitle + ' ' + properties.prodSource;

                return properties;
            })
        });

        browser.close;

        var i;

        for (i = 0; i < results.length; i++) { results[i].scrapeURL = url; results[i].reportString += (' ' + url); }

        completed++;

    }
    catch (err) {
        if (log == true) {
            var now = new Date(Date.now());
            var ret = 0;
            methods.logger('Error on scrape for ' + url + ':' + err.message);
            
            if (err.name == 'TimeoutError') {
                ret = -2;
            }
            else {
                ret = -1;
            }

            completed++;

            const badret = [];

            badret.hasError = true;

            return ret;
        }
    }

    aBEmitter.emit('scrapeComplete', results);

    return results;
}

function shuffleArray(oldarr) {

    var i = 0;
    var newarr = [];
    var oldindex = [];
    var newindex = [];

    for (i = 0; i < oldarr.length; i++) { oldindex.push(i); }

    while (oldindex.length > 0) {
        let shuffled = shuffleIndex(oldindex, newindex);

        oldindex = shuffled[0];
        newindex = shuffled[1];
    }

    for (i = 0; i < newindex.length; i++) { newarr.push(oldarr[newindex[i]]); }

    return newarr;
}

function shuffleIndex(oldindex, newindex) {

    var target = randInt(0, oldindex.length);

    newindex.push(oldindex[target]);

    oldindex = removeAt(oldindex, target);

    return [oldindex, newindex];
}

function randInt(mn, mx) {
    var min = Math.ceil(mn);
    var max = Math.floor(mx);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

function removeAt(arr, ind) {
    var i = 0;
    var newarr = [];

    for (i = 0; i < arr.length; i++) { if (i != ind) { newarr.push(arr[i]); } }

    return newarr;
}

//  PROGRAM

const urls = [
      'https://www.ammobuy.com/ammo/556-nato'
];

async function scrapeAmmoBuy (log) {
    primary(shuffleArray(urls), log);
};

module.exports.scrapeAmmoBuy = scrapeAmmoBuy;

module.exports.aBEmitter = aBEmitter;