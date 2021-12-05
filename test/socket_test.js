const port = process.env.PORT_TEST
const io = require('socket.io-client');
const {expect} = require('./set_up')
const server = require('../app');
const chai = require('./set_up')
const user = {
  provider: 'native',
  email: 'test1@test.com',
  password: '111111',
}

// Start server for testing
server.listen(port, function(){console.log(`start test server at port ${port}`)});


const socketURL = `http://localhost:${port}`
const options ={
  transports: ['websocket'],
  'force new connection': true
};

let user1
let user2
let user3
let accessToken
const bid = {
  productId:1,
  userId:1,
  bidAmount:150,
  endTime: new Date('2021-12-15'),
  totalBidTimes: 10,
}

describe('Bid server', () => {

  beforeEach((done) => {
    user1 = io.connect(socketURL, options)
    user2 = io.connect(socketURL, options)
    done()
  })

  afterEach((done) => {
    user1.disconnect()
    user2.disconnect()
    done()
  })

  it('Get userCount when all product page is empty', (done) => {
    user1.on('roomUsers', (data) => {
      expect(data).to.deep.equal({});
      done()
    })
  })

  it('Get userCount when enter product page' , (done) => {
    user2.on('roomUsers',() => {
      user1.emit('join', 1)
      user2.on('roomUsers', (data) => {
        expect(data).to.deep.equal({'1':1});
        done()
      })
    })
  })

  it ('Bid without token', (done) => {
    user2.emit('join', 1)
    user2.emit('bid', bid)
    user2.on('bidFail', (data) => {
      expect(data).to.equal('Unauthorized')
      done();
    })
  })

  // it('Bid success with login token', async (done) => {
  //   const res = await chai.request(server).post('/api/1.0/user/signin').send(user);
  //   console.log(res)
  //   accessToken = res.access_token

  //   const optionsWithToken ={
  //     transports: ['websocket'],
  //     'force new connection': true,
  //     auth: {
  //       authorization: "Bearer " + accessToken,
  //     }
  //   };
  //   user3.connect(socketURL, optionsWithToken)
  //   await user3.on('roomUsers')
  //   await user3.emit('join', 1)
  //   await user3.emit('bid', bid)
  //   await user3.on('bidSuccess', () => {
  //     done();
  //   })
  // })

  // // it('Get userCount when other user enter product page' ,(done) => {
  // //   user1 = io.connect(socketURL, options)
  // //   user2 = io.connect(socketURL, options)
  // //   user1.emit('join', 1)
  // //   user2.emit('join', 1)
  // //   socket = io.connect(socketURL, options)
  // //   setTimeout(() => {
  // //     socket.on('roomUsers', (data) => {
  // //       expect(data).to.deep.equal(data, {'1':2})
  // //     })
  // //   },0)
  // // })
})