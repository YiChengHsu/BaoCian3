const { setBidRecord }  = require('./server/controllers/bid_controller')
const roomUsers = {}
const roomUsersCount = {}

const socketConn = (io) => {

  io.on('connection', socket => {

    // if (socket.handshake.headers.authorization) {
    //   console.log(socket.handshake.headers.authorization)
    // } else {
    //   console.log(socket.id)
    // }

    //Send the room user count to new user
    socket.emit('roomUsers', roomUsersCount)
  
    socket.on('join', async ([productId, userId]) => {
      socket.join(productId)

      roomId = userId || socket.id
  
      if (roomUsers[productId]) {
        roomUsers[productId].push(roomId)
      } else {
        roomUsers[productId] = [roomId]
      }

      roomUsersCount = Object.keys(roomUsers).map((e) => {
        roomUsersCount[e] = _.uniq(roomUsers[e]).length
      })

      console.log(roomUsersCount)
  
      io.emit('roomUsers', roomUsers)
  
  
      // Listen for bid
      socket.on('bid', async (userBid) => {
  
        const bidTime = Date.now()
        const timeLeft = userBid.endTime - bidTime
        const bidRecord = {
          product_id: userBid.productId,
          user_id: userBid.userId,
          bid_amount: userBid.userBidAmount,
          bid_time: bidTime,
          time_left: timeLeft,
          user_name: userBid.userName
        }
  
        const result = await setBidRecord(bidRecord);
  
        switch (result.status) {
          case 1: bidRecord.end_time = userBid.endTime + 30000
            bidRecord.highest_bid_times = userBid.highestBidTimes + 1
            bidRecord.roomUsers = roomUsers.productId ? roomUsers.productId.length : 0;
            io.emit(`refresh_${
              userBid.productId
            }`, bidRecord)
            socket.emit('bidSuccess', bidRecord)
            break;
          case - 1:
            socket.emit('bidFail', message = '您有得標商品尚未付款，無法參競標')
            break;
          case 0:
            socket.emit('bidFail', message = '手速慢了，有人已經出價了唷!')
            break;
          default:
            socket.emit('bidFail', message = '請稍後再試')
        }
      })
  
      socket.on('disconnect', (userId) => {
  
        roomUsers[productId].map((e, index) => {
          if (e == socket.id) {
            roomUsers[productId].splice(index, 1)
          }
        })
  
        io.emit('roomUsers', roomUsers)
      })
    })
  })
}

