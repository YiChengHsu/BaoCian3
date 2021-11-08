const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const ejs = require('ejs');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const { getTimeRemaining } = require('./util/util');
const Product = require('./server/models/product_model')
const { setBidRecord } = require('./server/controllers/bid_controller')


app.use('/static', express.static(path.join(__dirname,'public')));
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.set('views', path.join(__dirname, './public/views'));
app.set('view engine', 'ejs');
app.engine("ejs", ejs.renderFile);

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


io.on('connection', socket => {
    socket.on('join', async ([productId, userId]) => {
        socket.join(productId)
        
        if (userId != null) {
            socket.broadcast.to(productId).emit('message', `買家${userId}進來血流成河了！`);
        };

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
            try {
                console.log(bidRecord)
                await setBidRecord(bidRecord); 
            } catch (error) {
                console.log(error)
                socket.emit('bidFail', bidRecord)
                return 
            }

            // if (result < 0) {
            //     console.log('err')
            //     socket.emit('bidFail', bidRecord)
            // }
            bidRecord.end_time = userBid.endTime + 30000
            bidRecord.highest_bid_times = userBid.highestBidTimes + 1
            io.emit(`refresh_${userBid.productId}`, bidRecord)
            socket.emit('bidSuccess', bidRecord)
        })

        socket.on('disconnect' , () => {
            io.to(productId).emit('message', '有人撐不住啦~');
        })
    })
})
