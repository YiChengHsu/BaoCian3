const { getTimeRemaining } = require('./util')

function createSocketIo(socket) {
    socket.on('joinRoom', ({id}) =>{
        socket.join(id)
        
        socket.broadcast.to(id).emit('message', 'A bidder has joined the auction!');

        //Broadcast counter
        let endTime = '2022-1-1'
        let currentBid = 0;
        const winnerCountDown = setInterval(() => {
            const counter = getTimeRemaining(endTime);
            socket.emit('counter', counter);
            if (counter === 0) {
                socket.emit('message', "Happy New Years");
                clearInterval;
            }
        }, 1000);
    })

    //Broadcast when a bidder connects

    // Listen for bid
    socket.on('bid', bid => {
        currentBid += Number(bid)
        const user = socket.id
        const bidMsg = {user, currentBid, time: getTimeRemaining(endTime)}
        console.log(bidMsg)
        socket.broadcast.emit('bid', bidMsg)
        socket.emit('bid', bidMsg)
    })

    //Broadcast when a bidder leaves
    socket.on('disconnect' , () => {
        socket.broadcast.emit('message', 'A bidder has left the auction!');
    })
}

module.exports = { createSocketIo };