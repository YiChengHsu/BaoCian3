const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const { getTimeRemaining } = require('./util/util');
const Bid = require('./server/models/bid_model')
const Product = require('./server/models/product_model')


app.set('views', path.join(__dirname, 'public/views'));
app.use('/static', express.static(path.join(__dirname,'public')));
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({extended:true}));

// API routes
app.use('/api/1.0',
    [
        require('./server/routes/bid_route'),
        require('./server/routes/product_route'),
        require('./server/routes/user_route')
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
            socket.broadcast.to(productId).emit('message', `買家ID進來血流成河了！`);
        };

        // Listen for bid
        socket.on('bid', async (userBid) => {
            const bidTime = Date.now() + 28800*1000
            const timeLeft = userBid.endTime - bidTime
            const bidRecord = {
                product_id: userBid.productId,
                user_id: userBid.userId,
                bid_amount: userBid.userBidAmount,
                bid_time: bidTime,
                time_left: timeLeft
            }

            const result = await Bid.setBidRecord(bidRecord)

            if (result < 0) {
                console.log('err')
                socket.emit('bidFail', bidRecord)
            }

            io.to(productId).emit('bidRefresh', bidRecord)
            socket.emit('bidSuccess', bidRecord)
        })

        socket.on('disconnect' , () => {
            io.to(productId).emit('message', '有人撐不住啦~');
        })
    })


        // Listen for bid
    // socket.on('bid', async (bid) => {
    //     currentBid = Number(bid.bidNumber) + Number(bid.currentNumber)
    //     if (currentBid > highestBid) {
    //         const time = getTimeRemaining(endTime)
    //         const bidMsg = {
    //             product_id: bid.id,
    //             user_id: socket.id,
    //             bid_number: bid.bidNumber,
    //             bid_current_number: currentBid,
    //             time_hours: time.hours,
    //             time_minutes: time.minutes,
    //             time_seconds: time.seconds
    //         }
    //         try {
    //             await Bid.setBidRecord(bidMsg)
    //             io.to(id).emit('bid', bidMsg)
    //         } catch(e) {
    //             console.log(e)
    //             socket.emit('message', '無效的出價，請在試一次！')
    //         }
    //     } else {
    //         socket.emit('message', '無效的出價，請在試一次！')
    //     }
    //     // socket.broadcast.to(id).emit('bid', bidMsg)
    // })

    //Broadcast when a bidder leaves
})

    //Broadcast when a bidder connects

    // Listen for bid
    // socket.on('bid', bid => {
    //     currentBid += Number(bid)
    //     const user = socket.id
    //     const bidMsg = {user, currentBid, time: getTimeRemaining(endTime)}
    //     console.log(bidMsg)
    //     io.emit('bid', bidMsg)
    //     // socket.emit('bid', bidMsg)
    // })

    // //Broadcast when a bidder leaves
    // socket.on('disconnect' , () => {
    //     socket.broadcast.emit('message', 'A bidder has left the auction!');
    // })
