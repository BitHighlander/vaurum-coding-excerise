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

Install LAMP and set up your MySQL database


````
sudo apt-get install phpmyadmin
sudo apt-get install nodejs
sudo apt-get install npm
cd ~
Git Clone https://github.com/BitHighlander/vaurum-coding-excerise
npm config set registry http://registry.npmjs.org/
npm install
```

We are now ready to set the mysql config

open browser too


*your ip*/phpmyadmin

copy/paste blockerDB.sql

create db

verify

go to privileges

add new user

username: blocker
pw: ***yousetthis***

```
sudo nano server.js
```

insert credentials


