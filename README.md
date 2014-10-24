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
____________________

