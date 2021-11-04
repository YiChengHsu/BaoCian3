const params = window.location.pathname
const query = window.location.search
console.log(query)
const socket = io();
let productIds = []
let userId
let userWatchList = []
const user = JSON.parse(localStorage.getItem('user'))

if (user != null && user.user) {
  userId = user.user.id
  await fetch('/api/1.0/user/watchList' ,{
    method: 'get',
    headers: {
      'Authorization': "Bearer " + user.access_token,
    }
  })
    .then(res => res.json())
    .then((res) => {

      const data = res.data.watchList

      userWatchList = Object.values(data).map(e => e.product_id)
      console.log(userWatchList)
    })
    .catch(error => console.log(error))
}

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
      timeLeft.className = `text-center fs-4 time-left countdown-timer-${id}`
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

      const watchBtn = document.createElement('a');
      //Get star-icon from bootstrap
      watchBtn.innerHTML = `
      <button type="button" class="btn btn-default" id="btn_collect" value="${id}">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-heart" viewBox="0 0 16 16">
      <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"/>
      </svg></button>`

      const watchedBtn = document.createElement('a');
      watchedBtn.innerHTML = `
      <button type="button" class="btn btn-default" id="btn_collect" value="${id}">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-heart-fill" viewBox="0 0 16 16">
      <path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"/>
      </svg></button>`

      if (userWatchList.includes(id)) {
        watchBtn.style.display = 'none'
      } else {
        watchedBtn.style.display = 'none'
      }

      //Set the watch list button
      watchBtn.addEventListener('click', (e) => {
        if(userId == null) {
          alert('請登入')
          return
        }

        fetch('/api/1.0/product/watchList/set', {
          method: 'post',
          headers: {
            'Authorization': "Bearer " + user.access_token,
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            'productId': id
          })
        })
        .then((res) => {
          console.log(res.status)
          if (res.status != 200) {
            throw error
          }
          watchedBtn.style.display = 'block'
          watchBtn.style.display ='none'
          alert('加入成功')
        })
        .catch((error) => {
          console.log(error)
          alert('加入失敗')
        })
      })

      //Del the watch list button
      watchedBtn.addEventListener('click', (e) => {
        if(userId == null) {
          alert('請登入')
          return
        }

        fetch('/api/1.0/product/watchList/del', {
          method: 'post',
          headers: {
            'Authorization': "Bearer " + user.access_token,
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            'productId': id
          })
        })
        .then((res) => {
          console.log(res.status)
          if (res.status != 200) {
            return error
          }
          watchBtn.style.display = 'block'
          watchedBtn.style.display ='none'
          alert('刪除成功')
        })
        .catch((err) => {
          console.log(err)
          alert('刪除失敗')
        })
      })

      // productButton2.href = '/product/details?id=' + id
      // productButton2.textContent = '<i class="bi bi-heart"></i>'

      productText.appendChild(timeLeft) 
      productText.appendChild(highestBid)
      productText.appendChild(bidTimesDiv) 
      
      productBody.appendChild(productTitle)
      productBody.appendChild(productText)
      productBody.appendChild(productButton)
      productBody.appendChild(watchBtn)
      productBody.appendChild(watchedBtn)
      
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

      countDown.textContent = `${time.days}天${time.hours}時${time.min}分${time.sec}秒 `
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
