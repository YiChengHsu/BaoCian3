const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const ejs = require('ejs');
const server = http.createServer(app);
const {Server} = require('socket.io');
const io = new Server(server);
const { socketConn } = require('./server/controllers/socket_controller');
require('dotenv').config()


app.use('/static', express.static(path.join(__dirname, 'public')));
app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));
app.set('views', path.join(__dirname, './public/views'));
app.set('view engine', 'ejs');
app.engine("ejs", ejs.renderFile);

// Use JSON parser for all non-webhook routes
app.use((req, res, next) => {
  if (req.originalUrl === '/api/1.0/order/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});


// API routes
app.use('/api/1.0', [
  require('./server/routes/product_route'), 
  require('./server/routes/user_route'), 
  require('./server/routes/order_route'),
]);

//Render page routes with ejs
app.use('/', require('./server/routes/page_route'))

// Page not found
app.use(function (req, res, next) {
  res.status(404).render('404');
});

//Error handling
app.use(function (err, req, res, next) {
  console.log(err);
  res.status(500).send('Internal Server Error');
});

socketConn(io);

// Broadcast when a bidder connects

server.listen(3000, () => {
  console.log('listen on 3000');
});
