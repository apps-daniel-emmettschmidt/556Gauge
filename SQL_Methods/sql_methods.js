const fs = require('fs');

var Connection = require('tedious').Connection;  

var Request = require('tedious').Request

var TYPES = require('tedious').TYPES;  

var sqlServer = fs.readFileSync('.\\server.txt').toString();

var sqlUser = fs.readFileSync('.\\user.txt').toString();

var sqlPW = fs.readFileSync('.\\pw.txt').toString();

var sqlConfig = {
    server: sqlServer,  //update me
    authentication: {
        type: 'default',
        options: {
            userName: sqlUser, //update me
            password: sqlPW,  //update me
        }
    },
    options: {
        // If you are on Microsoft Azure, you need encryption:
        encrypt: true,
        port: 1433,
        database: 'prices'  //update me
    }
};  

// Flow methods

function sleep(s, random) {

    if (random == true) {
        var ms = randInt(0, s * 10) * 100;
    }
    else {
        var ms = s * 1000;
    }

    return new Promise(resolve => setTimeout(resolve, ms));
}



class SQLInsert {
    constructor(datum, queryType) {
        
        this.isConnected = false;

        this.connection = new Connection(sqlConfig);

        this.connection.datum = datum;

        this.connection.queryType = queryType;
    }

    go() {
        this.connection.on('connect', function (err) {
            // If no error, then good to proceed.  

            if (this.queryType == 'price') { sqlLogger('Began connection'); }
            
            executeStatement(this);                        
        });

        this.connection.connect();
    }
}

function sqlLogger(log) {
    var insert = new SQLInsert(log, 'log');

    insert.go();
}

function executeStatement(connection) {
    var request = {};

    if (connection.queryType == 'price') {
        request = new Request("INSERT prices.dbo.price_observations (isPPR, price, rounds, PPR, prodTitle, prodSource, scrapeURL, WriteDate) OUTPUT INSERTED.ObservationID VALUES (@isPPR, @price, @rounds, @PPR, @prodTitle, @prodSource, @scrapeURL, CURRENT_TIMESTAMP);", function (err) {
            if (err) {
                sqlLogger(err);
            }
        });

        request.addParameter('isPPR', TYPES.Bit, connection.datum.isPPR);
        request.addParameter('price', TYPES.Float, connection.datum.price);
        request.addParameter('rounds', TYPES.Int, connection.datum.rounds);
        request.addParameter('PPR', TYPES.Float, connection.datum.PPR);
        request.addParameter('prodTitle', TYPES.VarChar, connection.datum.prodTitle);
        request.addParameter('prodSource', TYPES.VarChar, connection.datum.prodSource);
        request.addParameter('scrapeURL', TYPES.VarChar, connection.datum.scrapeURL);
    }

    if (connection.queryType == 'log') {
        request = new Request("INSERT prices.dbo.logs (LogDate, LogEntry) OUTPUT INSERTED.LogDate VALUES (CURRENT_TIMESTAMP, @LogEntry);", function (err) {
            if (err) {
                sqlLogger(err);
            }
        });

        request.addParameter('LogEntry', TYPES.VarChar, connection.datum);
    }

    request.on('row', function (columns) {
        columns.forEach(function (column) {
            if (column.value === null) {
                sqlLogger('NULL');
            } else {
                if (connection.queryType == 'price') { sqlLogger("ID of inserted item is " + column.value); }                
            }
        });
    });
    connection.execSql(request);
}

module.exports.SQLInsert = SQLInsert;