const port = process.env.PORT_TEST
const io = require('socket.io-client');
const {expect, requester} = require('./set_up')

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
  productId: 1,
  bidAmount: 150,
  endTime: (new Date('2021-12-31')).getTime(),
  totalBidTimes: 10,
}

const bid2 = {
  productId: 1,
  bidAmount: 0,
  endTime: (new Date('2021-12-31')).getTime(),
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

  it('Bid success with login token', async (done) => {
    const user = {
      provider: 'native',
      email: 'test@test.com',
      password: '111111',
    }

    const res = await requester.post('/api/1.0/user/signin').send(user);

    const optionsWithToken ={
      transports: ['websocket'],
      'force new connection': true,
      auth: {
        authorization: "Bearer " + res.body.data.access_token,
      }
    };


    user3 = io.connect(socketURL, optionsWithToken)
    await user3.on('roomUsers')
    await user3.emit('join', 1)
    await user3.emit('bid', (bid) => {
      user3.on('bidSuccess', (data) => {
        expect(data).to.be.an('object');
        done();
      })
    })
  })

  it('Bid fail with lower bid amount', async (done) => {
    const user = {
      provider: 'native',
      email: 'test@test.com',
      password: '111111',
    }

    const res = await requester.post('/api/1.0/user/signin').send(user);

    const optionsWithToken ={
      transports: ['websocket'],
      'force new connection': true,
      auth: {
        authorization: "Bearer " + res.body.data.access_token,
      }
    };


    user3 = io.connect(socketURL, optionsWithToken)
    await user3.on('roomUsers')
    await user3.emit('join', 1)
    await user3.emit('bid', (bid2) => {
      user3.on('bidFail', (data) => {
        done();
      })
    })
  })

  it('Bid fail with block user', async (done) => {
    const user = {
      provider: 'native',
      email: 'test2@test.com',
      password: '111111',
    }

    const res = await requester.post('/api/1.0/user/signin').send(user);

    const optionsWithToken ={
      transports: ['websocket'],
      'force new connection': true,
      auth: {
        authorization: "Bearer " + res.body.data.access_token,
      }
    };


    user3 = io.connect(socketURL, optionsWithToken)
    await user3.on('roomUsers')
    await user3.emit('join', 1)
    await user3.emit('bid', (bid) => {
      user3.on('bidFail', (data) => {
        expect(data).to.be.an('string');
        expect(data).to.equal('Unpaid user')
        done();
      })
    })
  })
})