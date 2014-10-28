/*
  ______ _            _             
 | ___ \ |          | |            
 | |_/ / | ___   ___| | _____ _ __ 
 | ___ \ |/ _ \ / __| |/ / _ \ '__|
 | |_/ / | (_) | (__|   <  __/ |   
 \____/|_|\___/ \___|_|\_\___|_|   
                                  
				-Highlander

implenting Blockchain.info's Websocket to record real time Blockchain Data.

Powered by webGL
*/

//Express Webserver

var express = require('express'),
	request = require('request'),
	isbot = require('is-bot');

app = express();

app.use(express.static(__dirname + '/public'));

var users = {};

// This setting is needed on heroku so that we have access to
// the visitor's ip addresses. Remove it if you don't use heroku:

app.enable('trust proxy');



//Store into mysql

var mysql =  require('mysql');

var connection =  mysql.createConnection({
  	host : "localhost",
  	user : "blocker",
  	password: "************"
  });

connection.connect();

function insertTxData (data){
connection.query("use blocker");
connection.query("INSERT INTO txs set ? ",data, function(err, rows){
	if(err)	{
  		throw err;
  	}else{
  		console.log( rows );
  	}
  });
}

function insertBlockData (data){
connection.query("use blocker");
connection.query("INSERT INTO blocks set ? ",data, function(err, rows){
	if(err)	{
  		throw err;
  	}else{
  		console.log( rows );
  	}
  });
}


function insertConfirmationData (data){
connection.query("use blocker");
connection.query("INSERT INTO confirmed_tx set ? ",data, function(err, rows){
	if(err)	{
  		throw err;
  	}else{
  		console.log( rows );
  	}
  });
}
//connect to websocket

/*
Data Source
*/

var WebSocket = require('ws') , ws = new WebSocket('ws://ws.blockchain.info/inv');

//Open websocket
ws.on('open', function() {
    ws.send(JSON.stringify( {"op":"unconfirmed_sub"}));
    ws.send(JSON.stringify( {"op":"ping_block"}));
    ws.send(JSON.stringify( {"op":"blocks_sub"}));
});

//Event listener
ws.on('message', function(message) {
var response = JSON.parse(message);    
//console.log('received: %s', message);
//console.log('received', response);
console.log('received', response.op);
if( response.op == "utx")
{
	//Get total amount of output
	var amount = 0;
				
	for(var i=0;i<response.x.out.length;i++) 
		amount += response.x.out[i].value;
				
	//	amount is in satoshi
	//	1 BTC = 100,000,000 Satoshi (https://en.bitcoin.it/wiki/activity)
	response.amount = amount / 100000000;

	var data = {
	        hash:response.x.hash,
	        btc_sent:response.amount,
	        vin_sz:response.x.vin_sz,
	        vout_sz:response.x.vout_sz,
	        size:response.x.size,
	        relayed_by:response.x.relayed_by,
	        tx_index:response.x.tx_index,
	        time:response.x.time
        };
	insertTxData(data);
	//console.log('received', response);
	console.log('hash', response.x.hash);
	
}


if( response.op == "block")
{
	
	for(var i=0;i<response.x.txIndexes.length;i++){
		console.log('txIndexes', response.x.txIndexes[i]);

		var data = {
            tx_index:response.x.txIndexes[i],
        	block:response.x.height
        };

		insertConfirmationData(data);
	} 
		//insertConfirmationData();

	var data = {
	        hash:response.x.hash,
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
	insertBlockData(data);
	//console.log('received', response);
	console.log('block', response);


	//Push block data to WebGL map
	//get IP
	ip = response.x.foundBy.ip;
	//Get location data from IP

	request('http://www.geoplugin.net/json.gp?ip=' + ip, function (e, r, body) {
		try {
			var data = JSON.parse(body);
			console.log('received', data);
		    }
		
		catch(e){
			return;
		    }
		if (!e && r.statusCode == 200) {
		
		if(data.geoplugin_countryName){
		// Store the users in an object with their ip as a unique key
			users[ip]={
				timestamp : new Date(),
				latitude : data.geoplugin_latitude,
				longitude: data.geoplugin_longitude,
				country: data.geoplugin_countryName,
				hash:response.x.hash,
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
		}
		}
		if(e){
			console.error(e);
			console.log('error', e);
		}
	});

}
});

//Push data to api
app.get('/online', function (req, res) {

	var data = [],
	list = [];

	// How many minutes to consider an ip address online after /ping is visited
    // Currently it if 5 minutes. Feel free to change it

	var onlineInMinutes = 5;

	for (var key in users) {

		if (!users.hasOwnProperty(key)) continue;

		if (new Date - users[key]['timestamp'] < 1000 * 60 * onlineInMinutes){

            data.push({
                latitude: users[key]['latitude'],
                longitude: users[key]['longitude'],
                country : users[key]['country'],
                hash:users[key]['hash'],
                nTx:users[key]['nTx'],
                totalBTCSent:users[key]['totalBTCSent'],
                estimatedBTCSent:users[key]['estimatedBTCSent'],
                reward:users[key]['reward'],
                size:users[key]['size'],
                blockIndex:users[key]['blockIndex'],
                prevBlockIndex:users[key]['prevBlockIndex'],
                height:users[key]['height'],
                mrklRoot:users[key]['mrklRoot'],
                version:users[key]['version'],
                time:users[key]['time'],
                bits:users[key]['bits'],
                height:users[key]['height'],
                nonce:users[key]['nonce']
            });


        }


	}

	// Iterate all entries,
	// remove those with repeating country names
	// and place them in an array of objects with a corresponding count number

	data.forEach(function (a) {

		// If the country is already in the list, increase the count and return.

        for(var i=0; i<list.length; i++){
			if(list[i].countryName == a.country) {
				list[i].usersOnline++;
				return;
			}
		}

		// Otherwise, add a new country to the list

		list.push({
			latitude : a.latitude,
			longitude : a.longitude,
			countryName: a.country,
			usersOnline: 1,
			//hash:response.x.hash
		});

	});


	// Sort the countries by number of users online

	list.sort(function (a,b) {

		if (a.usersOnline > b.usersOnline)
			return -1;
		if (a.usersOnline < b.usersOnline)
			return 1;
		return 0;

	});

	// Send our json response.
	// coordinates contains the information about all users
	// countriesList contains information without repeating country names and is sorted

	res.send({
		coordinates: data,
		countriesList: list
	});

});


//start server
app.listen(process.env.PORT || 8005, function(){
	console.log('server is up');
});
