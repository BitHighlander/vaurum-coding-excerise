/*
  ______ _            _             
 | ___ \ |          | |            
 | |_/ / | ___   ___| | _____ _ __ 
 | ___ \ |/ _ \ / __| |/ / _ \ '__|
 | |_/ / | (_) | (__|   <  __/ |   
 \____/|_|\___/ \___|_|\_\___|_|   
                                  
				-Highlander

implenting Blockchain.info's Websocket to record real time Blockchain Data.

Bitcoin Block Explorer

-Powered by webGL
*/
var express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    isbot = require('is-bot'),
    request = require('request'),
    app = express(),
    expressValidator = require('express-validator');


/*Set EJS template Engine*/
app.set('views', './views');
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({
    extended: true
})); //support x-www-form-urlencoded
app.use(bodyParser.json());
app.use(expressValidator());


var users = {};
app.enable('trust proxy');

//Store into mysql
var mysql = require('mysql');

var connection = mysql.createConnection({
    host: "localhost",
    user: "blocker",
    //TODO set your connection
    //  	password: ""
    password: "*********"
});

connection.connect();


function insertTxData(data) {
    connection.query("use blocker");
    connection.query("INSERT INTO txs set ? ", data, function(err, rows) {
        if (err) {
            throw err;
        } else {
            console.log(rows);
        }
    });
}

function insertBlockData(data) {
    connection.query("use blocker");
    connection.query("INSERT INTO blocks set ? ", data, function(err, rows) {
        if (err) {
            throw err;
        } else {
            console.log(rows);
        }
    });
}

function getBlockData() {
    connection.query("use blocker");
    connection.query('SELECT * FROM blocks', function(err, rows) {
        if (err) {
            throw err;
        } else {
            console.log(rows);
            return rows;
        }
    });

}



function insertConfirmationData(data) {
    connection.query("use blocker");
    connection.query("INSERT INTO confirmed_tx set ? ", data, function(err, rows) {
        if (err) {
            throw err;
        } else {
            console.log(rows);
        }
    });
}


//connect to websocket

/*
Data Source
*/

var WebSocket = require('ws'),
    ws = new WebSocket('ws://ws.blockchain.info/inv');

//Open websocket
ws.on('open', function() {
    //ws.send(JSON.stringify( {"op":"unconfirmed_sub"}));
    ws.send(JSON.stringify({
        "op": "ping_block"
    }));
    ws.send(JSON.stringify({
        "op": "blocks_sub"
    }));
});

//Event listener
ws.on('message', function(message) {
    var response = JSON.parse(message);
    //console.log('received: %s', message);
    //console.log('received', response);
    console.log('received', response.op);
    if (response.op == "utx") {
        //Get total amount of output
        var amount = 0;

        for (var i = 0; i < response.x.out.length; i++)
            amount += response.x.out[i].value;

        //	amount is in satoshi
        //	1 BTC = 100,000,000 Satoshi (https://en.bitcoin.it/wiki/activity)
        response.amount = amount / 100000000;

        var data = {
            hash: response.x.hash,
            btc_sent: response.amount,
            vin_sz: response.x.vin_sz,
            vout_sz: response.x.vout_sz,
            size: response.x.size,
            relayed_by: response.x.relayed_by,
            tx_index: response.x.tx_index,
            time: response.x.time
        };
        insertTxData(data);
        //console.log('received', response);
        console.log('hash', response.x.hash);

    }


    if (response.op == "block") {

        for (var i = 0; i < response.x.txIndexes.length; i++) {
            console.log('txIndexes', response.x.txIndexes[i]);

            var data = {
                tx_index: response.x.txIndexes[i],
                block: response.x.height
            };

            //insertConfirmationData(data);
        }
        //insertConfirmationData();

        ip = response.x.foundBy.ip;
        //Get location data from IP

        request('http://www.geoplugin.net/json.gp?ip=' + ip, function(e, r, body) {
            try {
                var ipData = JSON.parse(body);
                console.log('received', ipData);
            } catch (e) {
                return;
            }
            if (!e && r.statusCode == 200) {

                if (ipData.geoplugin_countryName) {
                    // Store the users in an object with their ip as a unique key
                    console.log("data", ipData);
                    var blockData = {
                        country: ipData.geoplugin_countryName,
                        latitude: ipData.geoplugin_latitude,
                        longitude: ipData.geoplugin_longitude,
                        hash: response.x.hash,
                        nTx: response.x.nTx,
                        totalBTCSent: response.x.totalBTCSent,
                        estimatedBTCSent: response.x.estimatedBTCSent,
                        reward: response.x.reward,
                        size: response.x.size,
                        blockIndex: response.x.blockIndex,
                        prevBlockIndex: response.x.prevBlockIndex,
                        height: response.x.height,
                        mrklRoot: response.x.mrklRoot,
                        version: response.x.version,
                        time: response.x.time,
                        bits: response.x.bits,
                        nonce: response.x.nonce
                    };
                    insertBlockData(blockData);
                }
            }
            if (e) {
                console.error(e);
                console.log('error', e);
            }
        });
        //console.log('received', response);
        console.log('block', response);

    }
});


//Push data to api
app.get('/api/online', function(req, res) {

    var data = [],
        list = [];
    //var data = getBlockData();

    connection.query("use blocker");
    connection.query('SELECT * FROM blocks', function(err, data) {
        if (err) {
            throw err;
            console.log("mysql ERROR", err);

        } else {
            //console.log( rows );
            console.log("Selected from table successfully");
            console.log("inside", data);

            for (var key in data) {



                data.push({
                    latitude: data[key]['latitude'],
                    longitude: data[key]['longitude'],
                    country: data[key]['country'],
                    hash: data[key]['hash'],
                    nTx: data[key]['nTx'],
                    totalBTCSent: data[key]['totalBTCSent'],
                    estimatedBTCSent: data[key]['estimatedBTCSent'],
                    reward: data[key]['reward'],
                    size: data[key]['size'],
                    blockIndex: data[key]['blockIndex'],
                    prevBlockIndex: data[key]['prevBlockIndex'],
                    height: data[key]['height'],
                    mrklRoot: data[key]['mrklRoot'],
                    version: data[key]['version'],
                    time: data[key]['time'],
                    bits: data[key]['bits'],
                    height: data[key]['height'],
                    nonce: data[key]['nonce']
                });


            }




            // Iterate all entries,
            // remove those with repeating country names
            // and place them in an array of objects with a corresponding count number

            data.forEach(function(a) {

                // If the country is already in the list, increase the count and return.

                for (var i = 0; i < list.length; i++) {
                    if (list[i].countryName == a.country) {
                        list[i].usersOnline++;
                        return;
                    }
                }

                // Otherwise, add a new country to the list

                list.push({
                    latitude: a.latitude,
                    longitude: a.longitude,
                    countryName: a.country,
                    usersOnline: 1,
                    //hash:response.x.hash
                });

            });


            // Sort the countries by number of users online

            list.sort(function(a, b) {

                if (a.usersOnline > b.usersOnline)
                    return -1;
                if (a.usersOnline < b.usersOnline)
                    return 1;
                return 0;

            });

            // Send our json response.
            // coordinates contains the information about all users
            // countriesList contains information without repeating country names and is sorted
            console.log("coordinates", data);
            console.log("countries", list);

            res.send({
                coordinates: data,
                countriesList: list
            });


        }
    });


    console.log("outside", data);

    // How many minutes to consider an ip address online after /ping is visited
    // Currently it if 5 minutes. Feel free to change it

});




//RESTful route
var router = express.Router();


/*------------------------------------------------------
*  This is router middleware,invoked everytime
*  we hit url /api and anything after /api
*  like /api/user , /api/user/7
*  we can use this for doing validation,authetication
*  for every route started with /api
--------------------------------------------------------*/
router.use(function(req, res, next) {
    console.log(req.method, req.url);
    next();
});

var curut = router.route('/txs');
//txs is from transactions
var ruser = router.route('/user');
var ronline = router.route('/online');


ruser.get(function(req, res) {


    //req.getConnection(function(err,conn){

    //    if (err) return next("Cannot Connect");

    //    var query = conn.query('SELECT * FROM blocks',function(err,rows){

    //        if(err){
    //            console.log(err);
    //            return next("Mysql error, check your query");
    //        }

    //        res.render('user',{title:"RESTful Crud Example",data:rows});

    //     });

    //});

    connection.query("use blocker");
    connection.query('SELECT * FROM blocks', function(err, rows) {
        if (err) {
            throw err;
        } else {
            console.log(rows);
            res.render('user', {
                title: "RESTful Crud Example",
                data: rows
            });
        }
    });

});


ronline.get(function(req, res) {


    var data = [],
        list = [];
    //var data = getBlockData();

    connection.query("use blocker");
    connection.query('SELECT * FROM blocks', function(err, data) {
        if (err) {
            throw err;
            console.log("mysql ERROR", err);

        } else {
            //console.log( rows );
            console.log("Selected from table successfully");
            console.log("inside", data);

            for (var key in data) {



                data.push({
                    latitude: data[key]['latitude'],
                    longitude: data[key]['longitude'],
                    country: data[key]['country'],
                    hash: data[key]['hash'],
                    nTx: data[key]['nTx'],
                    totalBTCSent: data[key]['totalBTCSent'],
                    estimatedBTCSent: data[key]['estimatedBTCSent'],
                    reward: data[key]['reward'],
                    size: data[key]['size'],
                    blockIndex: data[key]['blockIndex'],
                    prevBlockIndex: data[key]['prevBlockIndex'],
                    height: data[key]['height'],
                    mrklRoot: data[key]['mrklRoot'],
                    version: data[key]['version'],
                    time: data[key]['time'],
                    bits: data[key]['bits'],
                    height: data[key]['height'],
                    nonce: data[key]['nonce']
                });


            }




            // Iterate all entries,
            // remove those with repeating country names
            // and place them in an array of objects with a corresponding count number

            data.forEach(function(a) {

                // If the country is already in the list, increase the count and return.

                for (var i = 0; i < list.length; i++) {
                    if (list[i].countryName == a.country) {
                        list[i].usersOnline++;
                        return;
                    }
                }

                // Otherwise, add a new country to the list

                list.push({
                    latitude: a.latitude,
                    longitude: a.longitude,
                    countryName: a.country,
                    usersOnline: 1,
                    //hash:response.x.hash
                });

            });


            // Sort the countries by number of users online

            list.sort(function(a, b) {

                if (a.usersOnline > b.usersOnline)
                    return -1;
                if (a.usersOnline < b.usersOnline)
                    return 1;
                return 0;

            });

            // Send our json response.
            // coordinates contains the information about all users
            // countriesList contains information without repeating country names and is sorted
            console.log("coordinates", data);
            console.log("countries", list);

            res.send({
                coordinates: data,
                countriesList: list
            });


        }
    });


});


//show the CRUD interface | GET
curut.get(function(req, res) {


    //req.getConnection(function(err,conn){

    //    if (err) return next("Cannot Connect");

    //    var query = conn.query('SELECT * FROM txs',function(err,rows){

    //        if(err){
    //            console.log(err);
    //            return next("Mysql error, check your query");
    //        }

    //        res.render('user',{title:"RESTful Crud Example",data:rows});

    //     });

    //});

    connection.query("use blocker");
    connection.query('SELECT * FROM txs', function(err, rows) {
        if (err) {
            throw err;
        } else {
            console.log(rows);
            res.render('user', {
                title: "RESTful Crud Example",
                data: rows
            });
        }
    });


});



//post data to DB | POST
curut.post(function(req, res) {



    console.log("What The fuck");
    console.log(request.body.user.name);
    console.log(request.body.user.email);

});


ruser.post(function(req, res) {

    //Get data from name field

    //if is a block height

    //get /txs

    console.log("Winning");
    req.pipe(process.stdout);
    //console.log("resources",res)
    res.writeHead(200, {
        'Content-Type': 'text/plain'
    });


});


//now for Single route (GET,DELETE,PUT)
var curut2 = router.route('/user/:user_id');

/*------------------------------------------------------
route.all is extremely useful. you can use it to do
stuffs for specific routes. for example you need to do
a validation everytime route /api/user/:user_id it hit.
remove curut2.all() if you dont want it
------------------------------------------------------*/
curut2.all(function(req, res, next) {
    console.log("You need to smth about curut2 Route ? Do it here");
    console.log(req.params);
    next();
});

//get data to update
curut2.get(function(req, res, next) {

    var user_id = req.params.user_id;

    req.getConnection(function(err, conn) {

        if (err) return next("Cannot Connect");

        var query = conn.query("SELECT * FROM t_user WHERE user_id = ? ", [user_id], function(err, rows) {

            if (err) {
                console.log(err);
                return next("Mysql error, check your query");
            }

            //if user not found
            if (rows.length < 1)
                return res.send("User Not found");

            res.render('edit', {
                title: "Edit user",
                data: rows
            });
        });

    });

});

//update data
curut2.put(function(req, res) {
    var user_id = req.params.user_id;

    //validation
    req.assert('name', 'Name is required').notEmpty();
    req.assert('email', 'A valid email is required').isEmail();
    req.assert('password', 'Enter a password 6 - 20').len(6, 20);

    var errors = req.validationErrors();
    if (errors) {
        res.status(422).json(errors);
        return;
    }

    //get data
    var data = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    };

    //inserting into mysql
    req.getConnection(function(err, conn) {

        if (err) return next("Cannot Connect");

        var query = conn.query("UPDATE t_user set ? WHERE user_id = ? ", [data, user_id], function(err, rows) {

            if (err) {
                console.log(err);
                return next("Mysql error, check your query");
            }

            res.sendStatus(200);

        });

    });

});

//delete data
curut2.delete(function(req, res) {

    var user_id = req.params.user_id;

    req.getConnection(function(err, conn) {

        if (err) return next("Cannot Connect");

        var query = conn.query("DELETE FROM t_user  WHERE user_id = ? ", [user_id], function(err, rows) {

            if (err) {
                console.log(err);
                return next("Mysql error, check your query");
            }

            res.sendStatus(200);

        });
        //console.log(query.sql);

    });
});

//now we need to apply our router here
app.use('/api', router);

//start Server
var server = app.listen(3000, function() {

    console.log("Listening to port %s", server.address().port);

});