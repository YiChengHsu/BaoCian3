const currentTime = Date.now()
console.log(currentTime)
const params = window.location.pathname
const query = window.location.search
const socket = io();
let productIds = []
let userWatchList = []
let roomUsers = {};

socket.emit('connection')

socket.on('roomUsers', (data) => {
  console.log(data)
  roomUsers = data
  Object.keys(roomUsers).map((e) => {
    $(`#room-user-${e}`).text(data[e].length || 0)
  })
})


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
      productItem.className = 'card rounded rounded-3 col-2 productItem mx-3 mb-3'
      productItem.style="width: 18rem;"

      const productHeader = document.createElement('div');
      productHeader.className = 'row mx-2 mb-1 fs-6'

      const sellerImg = document.createElement('img')
      sellerImg.className = 'col-4 rounded-circle seller-img p-0'
      sellerImg.src = e.sellerInfo.picture
      productHeader.appendChild(sellerImg)

      const sellerRating = e.sellerInfo.rating ? e.sellerInfo.rating.toFixed(2): '尚未評分' 

      const sellerName = document.createElement('div')
      sellerName.className = 'col-8 align-center py-auto'
      sellerName.innerHTML = `${e.sellerInfo.name}  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="36" fill="#EF873E" class="bi bi-star-fill" viewBox="0 3 16 16">
      <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/></svg>  ${sellerRating}`
      productHeader.appendChild(sellerName)

      const id = e.id

      const productLink = document.createElement('a');
      productLink.href = '/product/details?id=' + id

      const productImage = document.createElement('div');
      productImage.className = 'card-img rounded-2 product-image w-100 text-end p-2 pt-3'
      productImage.style.backgroundImage = `url(${e.main_image})`;

      if (e.highest_user_id == userId) {
        $('<span>').addClass('p-2 btn-danger disabled rounded rounded-pill').text('得標中').appendTo(productImage)
      }

      if (e.seller_id == userId) {
        $('<span>').addClass('p-2 btn-success disabled rounded rounded-pill').text('自己的').appendTo(productImage)
      }

      const productBody = document.createElement('div');
      productBody.className = 'card-body px-0 text-center'

      const productTitle = document.createElement('h6');
      productTitle.className = 'card-title product-title mb-0'
      productTitle.textContent = e.title

      const productText = document.createElement('div');
      productText.className = 'card-text'

      const highestBid = document.createElement("div");
      const currencyNum = toCurrency(e.highest_bid)
      highestBid.innerHTML = `目前最高：<b class='text-success' id='highest-bid-${id}'> $${currencyNum} </b>`;

      let endTime;
      const timeLeft = document.createElement('div');
      endTime = e.end_time
      timeLeft.className = `text-center text-primary fs-4 my-1 time-left countdown-timer-${id}`
      let intervalId = setCountDownTimer(id, endTime)

      const productFooter = document.createElement('div');
      productFooter.className = 'row mt-2 justify-content-center text-center'

      const roomUserDiv = document.createElement('div');
      const roomUserNum = roomUsers[id] ? roomUsers[id].length : 0;
      roomUserDiv.className = `room-user col-3`
      roomUserDiv.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-people-fill" viewBox="0 0 16 16">
      <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
      <path fill-rule="evenodd" d="M5.216 14A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216z"/>
      <path d="M4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/>22
    </svg> <h6 class='mt-1' id='room-user-${id}'>${roomUserNum}</h6>`

      const bidTimesDiv = document.createElement('div');
      let bidTimes = e.bid_times
      bidTimesDiv.className = `bid-times col-3`
      bidTimesDiv.innerHTML = `<svg id="Layer_1" enable-background="new 0 0 34 34" height="24" viewBox="0 0 30 32" width="24" xmlns="http://www.w3.org/2000/svg"><g><g><g><path d="m20.8 32.6c0 .6-.4 1-1 1h-15c-.3 0-.7-.2-.9-.5s-.2-.7 0-1l2-4c.2-.3.5-.6.9-.6h11c.4 0 .7.2.9.6l1.9 3.8c.1.2.2.4.2.7z"/></g></g><g><g><path d="m21.2 6.9-1.1 1.9c-.3.6-1 .9-1.6.9-.3 0-.6-.1-.9-.2l-3.6 6.1c.4.2.7.6.8 1.1s.1 1-.2 1.4l-1 1.7c-.3.6-1 1-1.6 1-.3 0-.7-.1-1-.3l-6.2-3.6c-.9-.5-1.2-1.7-.7-2.6l1-1.7c.5-.9 1.7-1.2 2.5-.7l3.5-6.1c-.9-.5-1.2-1.7-.6-2.6l1.1-1.9c.5-.9 1.7-1.2 2.6-.7l6.3 3.6c.4.3.8.7.9 1.2s0 1.1-.2 1.5z"/></g></g><g><g><path d="m29.9 20.7c-.4.8-1.3 1.3-2.2 1.3-.4 0-.9-.1-1.3-.3l-9.7-5.7c-.1-.2-.2-.4-.3-.6l2.1-3.6c.2 0 .4 0 .7-.1l9.8 5.7c1.2.6 1.6 2.1.9 3.3z"/></g></g></g></svg> <h6 class='mt-1' id= 'bid-times-${id}'>${bidTimes} </h6>`

      const watchBtn = document.createElement('div');

      let watchTimes;

      if (watchList.includes(id)) {
        watchTimes = e.watchTimes -1
      } else {
        watchTimes = e.watchTimes
      }
      
      watchBtn.className = 'col-3'
      //Get star-icon from bootstrap
      watchBtn.innerHTML = `
      <button type="button" class="btn btn-default p-0" id="btn_collect" value="${id}">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-heart" viewBox="0 0 16 16">
      <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"/>
      </svg></button> <h6 class='mt-0' id="watch-text">${watchTimes}</h6>`

      const watchedBtn = document.createElement('div');
      watchedBtn.className = 'col-3'
      watchedBtn.innerHTML = `
      <button type="button" class="btn btn-default p-0" id="btn_collect" value="${id}">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-heart-fill" viewBox="0 0 16 16">
      <path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"/>
      </svg></button> <h6 id="id="watched-text"">${watchTimes+1}</h6>`

      if (watchList.includes(id)) {
        watchBtn.style.display = 'none'
      } else {
        watchedBtn.style.display = 'none'
      }

      //Set the watch list button
      watchBtn.addEventListener('click', (e) => {
        if(userId == null) {
          Swal.fire({
            icon: 'warning',
            title: '請登入',
            text:'登入可以使用更多功能唷!',
            confirmButtonText:'左轉登入',
            showCancelButton: true,
            cancelButtonText:'先不用'
          }).then((result) => {
            if (result.isConfirmed){
              self.location.href='/user/signin'
            }
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
          $
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
          $('.watched-text').text(watchTimes+1)
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
            text: '請稍後再試一次!',
          })
        })
      })

      productText.appendChild(productTitle)
      productText.appendChild(timeLeft) 
      productText.appendChild(highestBid)
      
      productBody.appendChild(productText)
      productFooter.appendChild(roomUserDiv)
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

        productItem.classList.add('fade-it')
        setTimeout(() => {
          productItem.classList.remove('fade-it')
        }, 2000)

        const highestBid = document.querySelector(`#highest-bid-${bidRecord.product_id}`)
        highestBid.textContent = `$${toCurrency(bidRecord.bid_amount)}`

        const bidTimesDiv = document.querySelector(`#bid-times-${bidRecord.product_id}`)
        bidTimesDiv.textContent = bidRecord.highest_bid_times
        
        endTime = bidRecord.end_time
        intervalId = resetCountDownTimer(intervalId, id, endTime)
      })
    console.log(Date.now())
    console.log(Date.now() - currentTime)
    })

    const currentPage = res.page
    const totalPage = res.total_page

    if (currentPage == 0) {
      $('.previous-page').hide()
    } else {
      $('.previous-page-link').attr('href', `?paging=${currentPage - 1}`)
    }

    if (currentPage == (totalPage - 1 )) {
      $('.next-page').hide()
    } else {
      $('.next-page-link').attr('href', `?paging=${currentPage + 1}`)
    }

    // let startPage
    // if (totalPage > 5 && currentPage > 4) {
    //   startPage = currentPage -2
    // } else {
    //   startPage = 0
    // }

    // const presentPage = Math.min((totalPage - currentPage), 5)

    for (let i = 0; i < totalPage; i++) {
      if ( i == currentPage) {
        $(`<li class="page-item disabled"><a class="page-link" href="?paging=${i}">${i+1}</a></li>`).insertBefore('.next-page')
      } else {
        $(`<li class="page-item"><a class="page-link" href="?paging=${i}">${i+1}</a></li>`).insertBefore('.next-page')
      }
    }

    console.log(res.page)
    console.log(res.total_page)
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

const toCurrency = (num) => {
  const parts = num.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}


