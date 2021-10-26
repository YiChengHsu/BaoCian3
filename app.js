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

server.listen(3000, () => {
    console.log('listen on 3000') ;   
});


io.on('connection', socket => {
    socket.on('joinRoom', async (id) =>{
        socket.join(id)
    
        io.to(id).emit('message', '有買家進來血流成河了唷！');

        const product = await Product.getProductById(id)
        console.log(product)

        // console.log(product)

        //Broadcast counter
        let highestUser;
        let endTime

        let highestBid = product[0].bid_current_number
        const winnerCountDown = setInterval( async () => {
            const product = await Product.getProductById(id)
            endTime = product[0].end_time
            const counter = getTimeRemaining(endTime);

            io.to(id).emit(`counter${id}`, counter);
            if ( Date.now() == endTime) {
                socket.emit('message', "Happy New Years");
                clearInterval;
            }
        }, 1000);
        
                // Listen for bid
        socket.on('bid', async (bid) => {
            userBid = Number(bid.bidNumber) + Number(bid.currentNumber)
            if (userBid > highestBid) {
                // endTime += 30000
                const time = getTimeRemaining(endTime)
                const bidMsg = {
                    product_id: bid.id,
                    user_id: bid.userId,
                    bid_number: bid.bidNumber,
                    bid_current_number: userBid,
                    time_hours: time.hours,
                    time_minutes: time.minutes,
                    time_seconds: time.seconds
                }
                try {
                    const result = await Bid.setBidRecord(bidMsg)
                    io.to(id).emit('bid', bidMsg)
                    socket.emit('message', `${bid.userId}買家出價，時間延長30秒！`)
                } catch (error) {
                    console.log(error)
                    socket.emit('message', '無效的出價，請在試一次！')
                }
            } else {
                socket.emit('message', '無效的出價，請在試一次！')
            }
            // socket.broadcast.to(id).emit('bid', bidMsg)
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
    socket.on('disconnect' , () => {
        socket.broadcast.emit('message', '有人撐不住啦~');
    })
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
