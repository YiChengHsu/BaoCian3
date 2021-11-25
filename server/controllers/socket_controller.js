const _ = require('lodash')
const { setBidRecord }  = require('../controllers/bid_controller')
const { getUserByToken } = require('../../util/util')
const roomUsers = {}
const roomUsersCount = {}

const socketConn = (io) => {

  io.use( async (socket,next) => {
    let accessToken = socket.handshake.auth.authorization
    if (!accessToken) {
      socket.user = null;
      next();
      return
    }

    accessToken = accessToken.replace("Bearer ", "");
    if (accessToken == "null") {
        socket.user = null;
        next();
        return
    }

    try {
        let userProfile = await getUserByToken(socket, accessToken)

        if (userProfile) {
          socket.user.id = userProfile.user.id;
          socket.user.role_id = userProfile.user.role_id;
        } else {
          socket.user = null;
        }

        next();
    } catch (error) {
        console.log(error)
        socket.user = null;
        return;
    }

  })

  io.on('connection', socket => {

    socket.emit('roomUsers', roomUsersCount)
  
    socket.on('join', async (productId) => {
      socket.join(productId)

      userId = socket.user? socket.user.id: socket.id

      if (!roomUsers[productId]) {
        roomUsers[productId] = [userId]
      } else {
        roomUsers[productId].push(userId)
      }

      Object.keys(roomUsers).map((e) => {
        roomUsersCount[e] = _.uniq(roomUsers[e]).length
      })
  
      io.emit('roomUsers', roomUsersCount)
  
  
      // Listen for bid
      socket.on('bid', async (userBid) => {
        console.log(userBid)

        //Can not bid without access token
        if (socket.user == null) {
          socket.emit('bidFail', message = '競標前請先登入')
        }
  
        const bidTime = Date.now()
        const timeLeft = userBid.endTime - bidTime
        const bidRecord = {
          product_id: userBid.productId,
          user_id: socket.user.id,
          bid_amount: userBid.userBidAmount,
          bid_time: bidTime,
          time_left: timeLeft,
          user_name: socket.user.name
        }

        let result

        try {
          result = await setBidRecord(bidRecord);
        } catch(err) {
          console.log(err)
        }
  
  
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
          if (e == userId) {
            roomUsers[productId].splice(index, 1)
          }
        })
  
        io.emit('roomUsers', roomUsersCount)
      })
    })
  })
}

module.exports = {
  socketConn, 
};

