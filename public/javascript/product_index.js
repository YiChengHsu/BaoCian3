const params = window.location.pathname
const query = window.location.search
console.log(query)
const socket = io();
let productIds = []
let userWatchList = []

fetch('/api/1.0' + params + query, {
  method: 'get',
  headers: {
    'Authorization': "Bearer " + accessToken
  }
})
  .then(res => res.json())
  .then((res) => {
    
    const watchList = res.user
    const data = res.data

    console.log(res)

    
    const products = document.querySelector('.products-container')
    data.map((e) => {

      const productItem = document.createElement('div');
      productItem.className = 'card col-3 m-3 rounded-3 productItem px-0 mx-0'
      productItem.style="width: 18rem;"

      const productHeader = document.createElement('div');
      productHeader.className = 'card-header row mx-1'

      const sellerImg = document.createElement('img')
      sellerImg.className = 'col-4 rounded-circle seller-img p-0'
      sellerImg.src = `https://s3.ap-northeast-1.amazonaws.com/node.js-image-bucket/${e.sellerInfo[0].picture}`
      productHeader.appendChild(sellerImg)

      const sellerName = document.createElement('div')
      sellerName.className = 'col-8 align-center py-auto'
      sellerName.textContent = e.sellerInfo[0].name
      productHeader.appendChild(sellerName)

      const id = e.id

      const productLink = document.createElement('a');
      productLink.href = '/product/details?id=' + id

      const productImage = document.createElement('div');
      productImage.className = 'card-img-top product-image w-100'
      productImage.style.backgroundImage = `url(${e.main_image})`;

      const productBody = document.createElement('div');
      productBody.className = 'card-body px-0 text-center'

      // const productId = document.createElement('div')
      // const id = e.id
      // productId.className = 'product-id'
      // productId.textContent = `Lot.${id}`

      const productTitle = document.createElement('h5');
      productTitle.className = 'card-title mb-1 product-title'
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

      const productFooter = document.createElement('div');
      productFooter.className = 'row mt-2 justify-content-center'

      const roomPeopleDiv = document.createElement('div');
      roomPeopleDiv.className = `room-people col-3`
      roomPeopleDiv.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-people-fill" viewBox="0 0 16 16">
      <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
      <path fill-rule="evenodd" d="M5.216 14A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216z"/>
      <path d="M4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/>22
    </svg> <h6>${Math.floor(Math.random()*50)}</h6>`

      const bidTimesDiv = document.createElement('div');
      let bidTimes = e.bid_times
      bidTimesDiv.className = `bid-times col-3`
      bidTimesDiv.id = `bid-times-${id}`
      bidTimesDiv.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-currency-dollar" viewBox="0 0 16 16">
      <path d="M4 10.781c.148 1.667 1.513 2.85 3.591 3.003V15h1.043v-1.216c2.27-.179 3.678-1.438 3.678-3.3 0-1.59-.947-2.51-2.956-3.028l-.722-.187V3.467c1.122.11 1.879.714 2.07 1.616h1.47c-.166-1.6-1.54-2.748-3.54-2.875V1H7.591v1.233c-1.939.23-3.27 1.472-3.27 3.156 0 1.454.966 2.483 2.661 2.917l.61.162v4.031c-1.149-.17-1.94-.8-2.131-1.718H4zm3.391-3.836c-1.043-.263-1.6-.825-1.6-1.616 0-.944.704-1.641 1.8-1.828v3.495l-.2-.05zm1.591 1.872c1.287.323 1.852.859 1.852 1.769 0 1.097-.826 1.828-2.2 1.939V8.73l.348.086z"/>
    </svg> <h6>${bidTimes} </h6>`

      const watchBtn = document.createElement('a');
      const watchPeople = Math.floor(Math.random()*50)
      watchBtn.className = 'col-3'
      //Get star-icon from bootstrap
      watchBtn.innerHTML = `
      <button type="button" class="btn btn-default p-0" id="btn_collect" value="${id}">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-heart" viewBox="0 0 16 16">
      <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"/>
      </svg></button> <h6>${watchPeople}</h6>`

      const watchedBtn = document.createElement('a');
      watchedBtn.className = 'col-3'
      watchedBtn.innerHTML = `
      <button type="button" class="btn btn-default p-0" id="btn_collect" value="${id}">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-heart-fill" viewBox="0 0 16 16">
      <path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"/>
      </svg></button> <h6>${watchPeople+1}</h6>`

      if (watchList.includes(id)) {
        watchBtn.style.display = 'none'
      } else {
        watchedBtn.style.display = 'none'
      }

      //Set the watch list button
      watchBtn.addEventListener('click', (e) => {
        console.log(user)
        if(userId == null) {
          Swal.fire({
            icon: 'warning',
            title: '請登入',
            text:'登入可以使用更多功能唷!',
            footer: '<a href="/user/signin">左轉登入頁面</a>',
            confirmButtonText:'知道了!'
          })
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
            Swal.fire({
              icon: 'error',
              title: '加入失敗',
              text: '請再試一次!',
            })
            return
          }
          watchedBtn.style.display = 'inline'
          watchBtn.style.display ='none'
          Swal.fire({
            icon: 'success',
            title: '加入成功',
            text: '可於個人頁面的收藏清單查看!',
          })
        })
        .catch((error) => {
          console.log(error)
          Swal.fire({
            icon: 'error',
            title: '加入失敗',
            text: '請再試一次!',
          })
        })
      })

      //Del the watch list button
      watchedBtn.addEventListener('click', (e) => {
        if(userId == null) {
          Swal.fire({
            icon: 'warning',
            title: '請登入',
            text:'登入可以使用更多功能唷!',
            footer: '<a href="/user/signin">左轉登入頁面</a>',
            confirmButtonText:'知道了!'
          })
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
          watchBtn.style.display = 'inline'
          watchedBtn.style.display ='none'
          Swal.fire({
            icon: 'success',
            title: '刪除成功',
            text: '有緣再相見!',
          })
        })
        .catch((err) => {
          console.log(err)
          Swal.fire({
            icon: 'error',
            title: '刪除失敗',
            text: '請再試一次!',
          })
        })
      })

      // productButton2.href = '/product/details?id=' + id
      // productButton2.textContent = '<i class="bi bi-heart"></i>'

      productText.appendChild(timeLeft) 
      productText.appendChild(highestBid)
      productText.appendChild(bidTimesDiv) 
      
      productBody.appendChild(productTitle)
      productBody.appendChild(productText)
      productFooter.appendChild(roomPeopleDiv)
      productFooter.appendChild(bidTimesDiv)
      productFooter.appendChild(watchBtn)
      productFooter.appendChild(watchedBtn)
      productBody.appendChild(productFooter)
      
      productLink.appendChild(productImage)

      productItem.appendChild(productHeader)
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
