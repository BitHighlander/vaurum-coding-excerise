/*
  ______ _            _             
 | ___ \ |          | |            
 | |_/ / | ___   ___| | _____ _ __ 
 | ___ \ |/ _ \ / __| |/ / _ \ '__|
 | |_/ / | (_) | (__|   <  __/ |   
 \____/|_|\___/ \___|_|\_\___|_|   
                                  
				-Highlander

implenting Blockchain.info's Websocket to record real time Blokchain Data.
*/


//Store into mysql

var mysql =  require('mysql');

var connection =  mysql.createConnection({
  	host : "localhost",
  	user : "blocker",
  	password: "UpP8GuEfBpCQ3PQK"
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
	
}
});
