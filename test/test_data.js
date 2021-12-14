const users = [
  {
    provider: 'native',
    role_id: 1,
    email: 'test@test.com',
    password: '111111',
    name: 'test1',
    picture: null,
    access_token: 'test1accesstoken',
    access_expired: (60*60), // 1hr by second
    login_at: new Date('2020-01-01')
  },
  {
    provider: 'native',
    role_id: 2,
    email: 'test2@test.com',
    password: '111111',
    name: 'test2',
    picture: null,
    access_token: 'test2accesstoken',
    access_expired: (60*60), // 1hr by second
    login_at: new Date('2020-01-01')
},
];

const roles = [
  {
    id: 1,
    name: 'user'
  },
  {
    id: 3,
    name: 'admin'
  },
  {
    id: 2,
    name: 'banned'
  }
]

const products = [
  {
    id: 1,
    category: 'men',
    sub_category: 'men_pants',
    title: 'product1',
    price: 100,
    end_time: new Date('2021-12-31').getTime(),
    description: 'test',
    bid_incr: 10,
    condition: '全新',
    texture: 'test',
    original_packaging: '無',
    with_papers: '無',
    place: 'pp1',
    main_image: 'main.jpg',
    seller_id: 1,
    auction_end: 0,
  },
  {
    id: 2,
    category: 'men',
    sub_category: 'men_pants',
    title: 'product1',
    price: 100,
    end_time: new Date('2021-10-31').getTime(),
    description: 'test',
    bid_incr: 10,
    condition: '全新',
    texture: 'test',
    original_packaging: '無',
    with_papers: '無',
    place: 'pp1',
    main_image: 'main.jpg',
    seller_id: 1,
    auction_end: 0,
  },
  {
    id: 3,
    category: 'men',
    sub_category: 'men_pants',
    title: 'product1',
    price: 100,
    end_time: new Date('2021-10-31'),
    description: 'test',
    bid_incr: 10,
    condition: '全新',
    texture: 'test',
    original_packaging: '無',
    with_papers: '無',
    place: 'pp1',
    main_image: 'main.jpg',
    seller_id: 1,
    auction_end: 1,
  },
  {
    id: 4,
    category: 'men',
    sub_category: 'men_pants',
    title: 'product1',
    price: 100,
    end_time: new Date('2021-10-31'),
    description: 'test',
    bid_incr: 10,
    condition: '全新',
    texture: 'test',
    original_packaging: '無',
    with_papers: '無',
    place: 'pp1',
    main_image: 'main.jpg',
    seller_id: 1,
    auction_end: 2,
  }
]

const product_images = [
  {
      product_id: 1,
      image: '0.jpg'
  },
  {
      product_id: 1,
      image: '1.jpg'
  },
]

module.exports = {
  users,
  roles,
  products,
  product_images,
};
