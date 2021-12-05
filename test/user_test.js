require('dotenv').config();
const {expect, chai} = require('./set_up');
const server = require('../app')

describe('sign up', () => {

  it('sign up success', async () => {
    const user = {
      provider: 'native',
      name: 'Frank',
      email: 'fish@test.com',
      password: 'kkkkkk,',
      picture: null
    }

    const res = await chai.request(server).post('/api/1.0/user/signup').send(user);

    expect(res.status).to.equal(200);
  })

  it('sign up without name or email or password', async () => {
    const user = {
      provider: 'native',
      name: 'Frank',
      password: 'kkkkkk,',
      picture: null
    }

    const res = await chai.request(server).post('/api/1.0/user/signup').send(user);

    expect(res.status).to.equal(400);
  })

  it('sign up with  existed email', async () => {
    const user = {
      provider: 'native',
      name: 'Frank',
      email: 'test@test.com',
      password: 'kkkkkk,',
      picture: null
    }

    const res = await chai.request(server).post('/api/1.0/user/signup').send(user);

    expect(res.status).to.equal(400);
  })
})
