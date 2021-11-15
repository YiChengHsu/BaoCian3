const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const ejs = require('ejs');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const { setBidRecord } = require('./server/controllers/bid_controller')
require('dotenv').config()


app.use('/static', express.static(path.join(__dirname,'public')));
app.use(express.static("public"));
app.use(express.urlencoded({extended:true}));
app.set('views', path.join(__dirname, './public/views'));
app.set('view engine', 'ejs');
app.engine("ejs", ejs.renderFile);

// Use JSON parser for all non-webhook routes
app.use((req, res, next) => {
    console.log(req.originalUrl)
    if (req.originalUrl === '/api/1.0/order/webhook') {
      next();
    } else {
      express.json()(req, res, next);
    }
});


// API routes
app.use('/api/1.0',
    [
        require('./server/routes/bid_route'),
        require('./server/routes/product_route'),
        require('./server/routes/user_route'),
        require('./server/routes/order_route'),
    ]
);

app.use('/', 
    [
        require('./server/routes/page_route'),
    ])

// const pageRouter = require('./server/routes/page_route')
// // const bidRouter = require('./server/routes/bid_route')
// app.use('/', pageRouter)
// // app.use('/api/1.0', bidRouter)

app.use(function(err, req, res, next) {
    console.log(err);
    res.status(500).send('Internal Server Error');
});


//Broadcast when a bidder connects

server.listen(3000, () => {
    console.log('listen on 3000') ;   
});

const roomUsers = {}


io.on('connection', socket => {

    socket.emit('roomUsers', roomUsers)

    socket.on('join', async ([productId, userId]) => {
        socket.join(productId)


        if (roomUsers[productId]) {
            roomUsers[productId].push(socket.id)
        } else {
            roomUsers[productId] = [socket.id]
        }

        io.emit('roomUsers', roomUsers)



        // Listen for bid
        socket.on('bid', async (userBid) => {

            console.log(userBid)

            const bidTime = Date.now()
            const timeLeft = userBid.endTime - bidTime
            const bidRecord = {
                product_id: userBid.productId,
                user_id: userBid.userId,
                bid_amount: userBid.userBidAmount,
                bid_time: bidTime,
                time_left: timeLeft
            }

            const result = await setBidRecord(bidRecord); 

            switch (result.status) {
                case 1:
                    bidRecord.end_time = userBid.endTime + 30000
                    bidRecord.highest_bid_times = userBid.highestBidTimes + 1
                    bidRecord.roomUsers= roomUsers.productId ? roomUsers.productId.length:0;
                    io.emit(`refresh_${userBid.productId}`, bidRecord)
                    socket.emit('bidSuccess', bidRecord)
                    break;
                case -1:
                    socket.emit('bidFail', message = '您有訂單尚未付款，無法參競標')
                    break;
                case 0:
                    socket.emit('bidFail', message = '手速慢了，有人已經出價了唷!')
                    break;    
                default:
                    socket.emit('bidFail', message = '請稍後再試')
            }
        })

        socket.on('disconnect' , (userId) => {

            roomUsers[productId].map((e, index) => {
                if (e == socket.id){
                    roomUsers[productId].splice(index, 1 )
                }
            })

            io.emit('roomUsers', roomUsers)
        })
    })
})
