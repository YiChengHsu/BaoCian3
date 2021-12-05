# SorryMyWallet
An online marketplace holding real-time auctions with complete trading mechanism. Increasing user involvement and bid intension by competitive bidding system and countdown timmer.

#### Website URL: [https://baocian3.fun/](https://baocian3.fun/)

#### Test Accounts:

- Email: test@baocian3.fun
- password: test123

## Table of Contents

- [Features](#Features)
- [Technologies](#Technologies)
- [Contact](#Contact)


## Features

### Real-tiem Competitive Bidding System
* Update the hightest bid and bid times on the index web page
* Update the hightest bid on the product page
    * Update the highest bid
    * Set the new bid record with bid time and bidder name
* Highest bid reminder at both index and product web pag

### Upload Page with Format Check
* Name lese than 30  characters or 15 characters in chinese 
* Product images size in 1 megabyte (MB)
* Product images with `.jpg` or `.png` format

### 4-step Trade Process After Win the Bid
* Pay requirement
* Delivery
* Reception confirmation
* Rating

### Block and Report Mechanism

* Block bidding system to unpaid user
* Report mechanism for unsuitable products

##  Technologies
### Architecture

<img width="800" src="https://d305gzfqduz01s.cloudfront.net/sorry-my-wallet-readme/architecture.jpg">

### Back-End
* Node.js
* Express.js

### Front-End

* HTML
* CSS
* JavaScript
* jQuery
* Bootstrap

### Database

* MySQL
* Database Schema
<img width="800" src="https://d305gzfqduz01s.cloudfront.net/sorry-my-wallet-readme/schema.png">

### Web Socket

* Socket.IO

### Cloud Service (AWS)

* Elastic Compute Cloud (EC2)
* Relational Database Service (RDS)
* Simple Storage Service (S3)
* CloudFront

### Networking

* HTTP & HTTPS
* Nginx
* Domain Name System (DNS)
* SSL Certificate

### Test

* Mocha
* Chai

### 3rd Party APIs

* Stripe


