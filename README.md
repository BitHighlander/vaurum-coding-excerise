vaurum-coding-excerise
======================

Node.js Real Time Blockchain Data Subscription


Challenge
-----------

Create an app in node.js that listens for newly mined blocks on the bitcoin network and stores them in a relational database (MySQL, PostgreSQL, etc.).

Design the database store to be flexible enough to run queries like - get block number from txid, get block reward, fees, size, number of transactions from a block number.


Approach
------------

Collect Data Via Blockchain.info's Websocket API
  * This allows real time data collection
  * Websockets are fast, Reliable and scalable

tools
------------
Blockchain.info's API
More info: https://blockchain.info/api/api_websocket

ws: a node.js websocket implementation
More info: http://einaros.github.io/ws/

with a little help from ubuntu LAMP for the query example,



Lets Get started
-------------------

Ubuntu Server 14.04

```
sudo apt-get update
sudo apt-get install tasksel
sudo tasksel
````

* Install LAMP and set up your MySQL database


````
sudo apt-get install phpmyadmin
sudo apt-get install nodejs
sudo apt-get install npm
cd ~
Git Clone https://github.com/BitHighlander/vaurum-coding-excerise
npm config set registry http://registry.npmjs.org/
npm install
```

* We are now ready to set the mysql config

* open browser http://*yourip*/phpmyadmin

* copy/paste blockerDB.sql

* create db

* verify

* go to privileges

* add new user to DB

username: blocker
pw: ***yousetthis***

```
sudo nano server.js
```
* insert credentials into server.js


Read to Run
-------------

```
node server.js
```

Let this run a bit and fill up with some data



Ready to query the data!
-------------------------


**get block number from txhash**

$txs = "SELECT * FROM txs WHERE hash = '$entry'"

get txindex

$txs->tx_index'

is this transaction confirmed? (included in a block)

**get block number from txid**

$confirmation_block = $con->query("SELECT * FROM confirmed_tx WHERE tx_index = '$txs->tx_index'")->fetch();

if found, we now have the entire block data if empty this is an unconfirmed transaction


**get total bitcoin send in a transaction**

Avaible Block data
--------------------

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

Each block contains a list of confirmed transactions, To view what transactions got confirmed and what didnt you can take a differnce from txids in table txs vr txids in table transaction_confirmed


Avaible Transaction data
------------------------

 hash:response.x.hash,
        btc_sent:response.amount,
        vin_sz:response.x.vin_sz,
        vout_sz:response.x.vout_sz,
        size:response.x.size,
        relayed_by:response.x.relayed_by,
        tx_index:response.x.tx_index,
        time:response.x.time
