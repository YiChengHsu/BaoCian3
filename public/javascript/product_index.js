const params = window.location.pathname
const query = window.location.search
console.log(query)
const socket = io();
let productIds = []

fetch('/api/1.0' + params + query)
  .then(res => res.json())
  .then((res) => {

    const data = res.data
    
    const products = document.querySelector('.products-container')
    data.map((e) => {
      const productItem = document.createElement('div');
      productItem.className = 'card col-3 m-3 rounded-3 productItem'
      productItem.style="width: 18rem;"

      const id = e.id

      const productLink = document.createElement('a');
      productLink.href = '/product/details?id=' + id

      const productImage = document.createElement('img');
      productImage.className = 'card-img-top product-image'
      productImage.src = e.main_image;

      const productBody = document.createElement('div');
      productBody.className = 'card-body'

      // const productId = document.createElement('div')
      // const id = e.id
      // productId.className = 'product-id'
      // productId.textContent = `Lot.${id}`

      const productTitle = document.createElement('h5');
      productTitle.className = 'card-title product-title'
      productTitle.textContent = e.title

      const productText = document.createElement('div');
      productText.className = 'card-text'

      const highestBid = document.createElement("div");
      highestBid.className = `highest-bid highest-bid-${id}`;
      highestBid.textContent = `目前最高： $${e.highest_bid}`;

      let endTime;
      const timeLeft = document.createElement('div');
      endTime = e.end_time
      timeLeft.className = `text-center fs-3 time-left countdown-timer-${id}`
      let intervalId = setCountDownTimer(id, endTime)

      const bidTimesDiv = document.createElement('div');
      let bidTimes = e.bid_times
      bidTimesDiv.className = `bid-times`
      bidTimesDiv.id = `bid-times-${id}`
      bidTimesDiv.textContent = `出價次數：${bidTimes}`

      const productButton = document.createElement('a');
      productButton.className = 'btn btn-warning'
      productButton.href = '/product/details?id=' + id
      productButton.textContent = '去看酷東西'

      productText.appendChild(timeLeft) 
      productText.appendChild(highestBid)
      productText.appendChild(bidTimesDiv) 
      
      productBody.appendChild(productTitle)
      productBody.appendChild(productText)
      productBody.appendChild(productButton)
      
      productLink.appendChild(productImage)

      productItem.appendChild(productLink)
      productItem.appendChild(productBody)

      products.appendChild(productItem);

      socket.emit('joinRoom', id)

      socket.on(`refresh_${id}`, bidRecord => {

        console.log(bidRecord)

        const highestBid = document.querySelector(`.highest-bid-${bidRecord.product_id}`)
        highestBid.textContent = `目前最高： $${bidRecord.bid_amount}`
      
        const bidTimesDiv = document.querySelector(`#bid-times-${bidRecord.product_id}`)
        bidTimesDiv.textContent = `出價次數： ${bidRecord.highest_bid_times}`
        
        endTime = bidRecord.end_time
        intervalId = resetCountDownTimer(intervalId, id, endTime)
      })
    })
  })
;


const setCountDownTimer = (id, endTime) => {
  const intervalId = setInterval(() => {
      const countDown = document.querySelector(`.countdown-timer-${id}`)
      let totalMilSec = (endTime) - Date.now();

      if (totalMilSec <= 86400000) {
        countDown.classList.add('text-danger')
      }

      if (totalMilSec <=0) {
        countDown.textContent = "時間到，競標結束！"
        return
      }

      let time = transMilToDate(totalMilSec)

      countDown.textContent = `${time.days}:${time.hours}:${time.min}:${time.sec} `
  },500)   
  return intervalId;
}

const resetCountDownTimer = (intervalId, id, endTime) => {
  clearInterval(intervalId);
  console.log("時間重新計算");
  return setCountDownTimer(id, endTime);
}

const transMilToDate = (totalMilSec) => {
  let milSec = totalMilSec % 1000
  let sec = fixTime(Math.floor((totalMilSec/1000) % 60))
  let min = fixTime(Math.floor((totalMilSec/1000/60) % 60))
  let hours = fixTime(Math.floor((totalMilSec/(1000*60*60)) % 24))
  let days = Math.floor(totalMilSec/(1000*60*60*24));

  return { milSec, sec, min, hours, days}
}

const fixTime = (time) => {
  if(time < 10) {
      return `0${time}`
  } else {
      return time;
  }
}
