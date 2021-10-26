const params = window.location.pathname
const socket = io();
let productIds = []

fetch('/api/1.0' + params)
  .then(res => res.json())
  .then(res => res.data)
  .then((res) => {
    console.log(res)
    const products = document.querySelector('.products')
    for (let i = 0; i < res.length; i++) {
      const product = document.createElement('div');
      product.className = 'product'

      const link = document.createElement('a');
      link.href = '/product/details?id=' + res[i].id
      
      const product_id = document.createElement('div')
      product_id.className = 'product-id'
      product_id.textContent = res[i].id

      const image = document.createElement('img');
      image.src = res[i].main_image;

      const title = document.createElement('div');
      title.className = 'product-title'
      title.textContent = res[i].title

      const id = res[i].id

      const current_bid = document.createElement("div");
      current_bid.className = `current-bid${id}`;
      current_bid.textContent = "TWD." + res[i].price;

      const time = document.createElement('div');
      time.className = `time${id}`
      
      const end_time = res[i].end_time
      const time_left = getTimeRemaining(end_time)

      time.textContent = `${time_left.days}:${time_left.hours}:${time_left.minutes}:${time_left.seconds}`

      productIds.push(id)

      product.appendChild(product_id);
      product.appendChild(image);
      product.appendChild(title);
      product.appendChild(time);
      product.appendChild(current_bid);
      link.appendChild(product);
      products.appendChild(link);

      socket.emit('joinRoom', id)

      socket.on(`counter${id}`, (counter) => {
        const time = document.querySelector(`.time${id}`)
        time.textContent = `${counter.days}:${counter.hours}:${counter.minutes}:${counter.seconds}`
      })

    }
  })
 

console.log(productIds)







const  getTimeRemaining = (endTime) => {
  const total = endTime - Date.parse(new Date());
  let milliSeconds = total % 1000
  let seconds = fixTime(Math.floor((total/1000) % 60))
  let minutes = fixTime(Math.floor((total/1000/60) % 60))
  let hours = fixTime(Math.floor((total/(1000*60*60)) % 24))
  let days = Math.floor(total/(1000*60*60*24));

  const time = {total, days, hours, minutes, seconds, milliSeconds}
  return time
}

const fixTime = (time) => {
    if(time < 10) {
        return `0${time}`
    } else {
        return time;
    }
}
