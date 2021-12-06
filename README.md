# SorryMyWallet
An online marketplace holding real-time auctions with complete trading mechanism. Increasing user involvement and bid intension by competitive bidding system and countdown timmer.

#### Website URL: [https://baocian3.fun/](https://baocian3.fun/)

#### Test Accounts:
* Email: test@baocian3.fun

* password: test123

* [One-click Login](http://localhost:3000/user/signin?test)


## Table of Contents

- [Features](#Features)
- [Technologies](#Technologies)
- [Contact](#Contact)


## Features

### Real-time Competitive Bidding System
<img width="800" src="https://raw.githubusercontent.com/YiChengHsu/SorryMyWallet-readme-img/main/readme1.gif">

* **Update the hightest bid and bid times on the index web page**

    * Get the number of product bidding users, bidding times, and new highest bid immediately even be out of the page.

    * The end time of each auction add 30 seconds after success bidding as the special and fair features of the website.

<img width="800" src="https://raw.githubusercontent.com/YiChengHsu/SorryMyWallet-readme-img/main/readme2.gif">

* **Update the hightest bid on the product page**

    * Double check for the user bidding to avoid accidental bidding by mistake.

    * Update the new highest bid and bid record with bid time and bidder name also be set after success bidding.

* Set the highest bid reminder at both product page and index page.

### 4-step Trade Process After Win the Bid
* Pay requirement

* Delivery 

* Reception confirmation

* Rating

### As Buyer

<img width="800" src="https://raw.githubusercontent.com/YiChengHsu/SorryMyWallet-readme-img/main/readme3-1.gif">

* **Pay requirement**
    * Pay with most popular third-party API Stripe which has fast, secure, continuous support, and extensible checkout and payment.

* **Reception confirmation and rating for the seller**
    * Get the delivery tracking number after seller shipped the product.
    * After confirming the products, rate the seller from one to five stars just one time.

### As Seller

<img width="800" src="https://raw.githubusercontent.com/YiChengHsu/SorryMyWallet-readme-img/main/readme4-1.gif">

* **Delivery**
    * Get the address if the buyer has already provided.
    * Confirm the delivery with tracking number.

* **Rating to buyer**
    * After the buyer's confirmation and rating, give bueyr a feedback score as well.


### Block bidding system to unpaid user

<img width="800" src="https://github.com/YiChengHsu/SorryMyWallet-readme-img/blob/main/readme7.gif?raw=true">

* The auction winners are obliged to pay on time, otherwise, they will be blocked from future biddings.

* After finishing the payment, user will be immediately authorized to access the following bidding.

### Upload Product with Format Check
* Name lese than 30 characters or 15 characters in chinese

* Product images size in 1 megabyte (MB)

* Product images with .jpg or .png format

### Report mechanism for unsuitable products
<img width="800" src="https://github.com/YiChengHsu/SorryMyWallet-readme-img/blob/main/readme8.gif?raw=true">

* Set the report system with five selectable unsuitable options and reason input.

* Pull unsuitable products from the shelves which were reported over 10 times or confirmed by the administrator.

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

## Contact

#### Author: Yi Cheng Hsu
#### Email: fish1233333@gmail.com


