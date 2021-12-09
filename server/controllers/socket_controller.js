const _ = require("lodash")
const { setBidRecord } = require("../controllers/bid_controller")
const { getUserByToken } = require("../../util/util")
const roomUsers = {}
const roomUsersCounts = {}

const socketConn = (io) => {
	// Get user id by socket middleware
	io.use(async (socket, next) => {
		let accessToken = socket.handshake.auth.authorization
		if (!accessToken) {
			socket.user = null
			next()
			return
		}

		accessToken = accessToken.replace("Bearer ", "")
		if (accessToken == "null") {
			socket.user = null
			next()
			return
		}

		try {
			let userProfile = await getUserByToken(socket, accessToken)

			if (userProfile) {
				socket.user.id = userProfile.user.id
				socket.user.roleId = userProfile.user.role_id
			} else {
				socket.user = null
			}

			next()
		} catch (error) {
			console.log(error)
			socket.user = null
			return
		}
	})

	io.on("connection", (socket) => {
		socket.emit("roomUsers", roomUsersCounts)	

		socket.on("join", async (productId) => {
			socket.join(productId)

			userId = socket.user ? socket.user.id : socket.id

			if (!roomUsers[productId]) {
				roomUsers[productId] = [userId]
			} else {
				roomUsers[productId].push(userId)
			}

			Object.keys(roomUsers).map((e) => {
				roomUsersCounts[e] = _.uniq(roomUsers[e]).length
			})

			io.emit("roomUsers", roomUsersCounts)

			// Listen for bid
			socket.on("bid", async (userBid) => {

				// Can not bid without access token
				if (socket.user == null) {
					socket.emit("bidFail", "Unauthorized")
				}

				const bidTime = Date.now()
				const timeLeft = userBid.endTime - bidTime
				const bidData = {
					productId: userBid.productId,
					userId: socket.user.id,
					bidAmount: userBid.bidAmount,
					endTime: userBid.endTime,
					totalBidTimes: userBid.totalBidTimes,
					bidTime,
					timeLeft,
					userName: socket.user.name,
				}

				let result
				try {
					result = await setBidRecord(bidData)
				} catch (error) {
					console.log(error)
				}

				if (result.error) {
					socket.emit("bidFail", result.error)
					return
				}

				socket.io('bidSuccess', result)
				io.emit(`updateProduct${result.product_id}`, result)
			})

			socket.on("disconnect", (userId) => {
				roomUsers[productId].map((e, index) => {
					if (e == userId) {
						roomUsers[productId].splice(index, 1)
					}
				})

				io.emit("roomUsers", roomUsersCounts)
			})
		})
	})
}

module.exports = {
	socketConn,
}
