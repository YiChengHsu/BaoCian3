const {expect, chai} = require('./set_up');
const server = require('../app')
const {users} = require('./test_data');
const user1 = users[0]
const user = {
  provider: user1.provider,
  email: user1.email,
  password: user1.password
}
let accessToken;
let userId;

const watchProduct = {
  productId: 1
}

describe('Set and del watch list product', () => {

  after(() => {
    server.close();
  })

  before(async () => {
    const res = await chai.request(server)
      .post('/api/1.0/user/signin')
      .send(user);
    const data = res.body.data;
    userId = data.user.id;
    accessToken = data.access_token
  })

  it('Set watch list without token', async () => {

    const res = await chai.request(server)
      .post('/api/1.0/product/watchList')
      .send(watchProduct)

    expect(res.statusCode).to.equal(401)
  })

  it('Set product to watch list', async () => {

    const res = await chai.request(server)
      .post('/api/1.0/product/watchList')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(watchProduct)

    expect(res.statusCode).to.equal(200)
  })

  it('Set product to watch list twice', async () => {

    const res = await chai.request(server)
      .post('/api/1.0/product/watchList')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(watchProduct)

    expect(res.statusCode).to.equal(400)
  })

  it('Del watch list without token', async () => {
    
    const res = await chai.request(server)
      .delete('/api/1.0/product/watchList')
      .send(watchProduct)

    expect(res.statusCode).to.equal(401)
  })

  it('Del product to watch list', async () => {

    const res = await chai.request(server)
      .delete('/api/1.0/product/watchList')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(watchProduct)

    expect(res.statusCode).to.equal(200)
  })

  it('Del product to watch list twice', async () => {

    const res = await chai.request(server)
      .delete('/api/1.0/product/watchList')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(watchProduct)

    expect(res.statusCode).to.equal(400)
  })

  
})