//Get product id from query
const productId = Qs.parse(location.search, {
    ignoreQueryPrefix: true
}).id;

const socket = io();

let leastBid;
let highestBidTimes;
let endTime;
let bidTimes;

//Fetch the product details

const detailsUrl = `/api/1.0/product/details?id=${productId}`
console.log(detailsUrl)

fetch(detailsUrl)
    .then(res => res.json())
    .then(res =>  res.data)
    .then((data) => {

        console.log(data)

        if (data == null) {
            self.location.href = '/404.html'
        }

        category = document.querySelector('.my-category')
        category.href = `/product/${data.category}`
        category.textContent = data.category

        const productIdTitle = document.querySelector('.product-id')
        productIdTitle.textContent = "Lot: " + data.id

        const productTitle = document.querySelector('.my-product-title')
        productTitle.textContent = data.title

        const mainImage = document.querySelector('.main-image')
        mainImage.src = data.main_image

        endTime = data.end_time
        setCountDownTimer(endTime)

        const currentNumber = document.querySelector('.highest-bid')
        currentNumber.textContent = data.highest_bid

        const bidEnter = document.querySelector('#my-bid-number')
        bidEnter.placeholder = `$${data.bid_incr}`

        const bidIncr = document.querySelector('#bid-incr')
        bidIncr.textContent = `最低出價增額： ${data.bid_incr}`
        leastBid = data.bid_incr;

        const bidTimesDiv = document.querySelector('#bid-times')
        highestBidTimes = data.bid_times
        bidTimesDiv.textContent = `出價次數： ${highestBidTimes}`

        const sellerId = document.querySelector('#seller-id')
        sellerId.textContent = `賣家編號： ${data.seller_id}`

        const bidRecords = document.querySelector('.my-bid-record')
        const recordsData = data.records || [];
        recordsData.reverse().map((e) => {
            renderBidRecord(e)
        })

        const description = document.querySelector('#description')
        description.textContent = `商品描述： ${data.description}`

        const texture = document.querySelector('#texture')
        texture.textContent = `商品材質： ${data.texture}`

        const condition = document.querySelector('#condition')
        condition.textContent = `商品狀況： ${data.condition}`

        const originalPackaging = document.querySelector('#original-packaging')
        originalPackaging.texture = `原外包裝： ${data.original_packaging}`

        const withPapers = document.querySelector('#with-papers')
        withPapers.textContent = `商品相關證明： ${data.with_papers}`

        const place = document.querySelector('#place')
        place.textContent = `商品所在地點： ${data.place}`

        renderImagesSlide(data.images)


    })
;

//Get user information by token
let userId
const accessToken = JSON.parse(localStorage.getItem('user'))
if (accessToken != null && accessToken.user) {
    userId = accessToken.user.id || null;
}
// const userId = accessToken.user.id || null;

//Join product id room with socket.io handshake
socket.emit('join', [productId, userId])

//Send bid message to socket.io server
const form = document.querySelector('#bid-form')
const input = document.querySelector('#my-bid-number')
const highestBid = document.querySelector('.highest-bid')
const bidRecords = document.querySelector('.my-bid-record')

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const userBidIncr = Number(input.value)
    console.log(userBidIncr)
    if (!userBidIncr) {
        alert('無效的出價')
        return
    }

    if(!userId) {
        alert('下標前請先登入')
        self.location.href = "/user/signin.html"
        return
    } 

    if (userBidIncr < leastBid) {
        alert('請大於最小出價')
        return
    } else if (userBidIncr > leastBid*100) {
        alert('珍惜荷包，請不要出大於最小出價一百倍的價格') 
        return
    }

    const userBidAmount = Number(highestBid.textContent.replace("$","")) + userBidIncr;
    socket.emit('bid', { productId, userId, userBidAmount, endTime, highestBidTimes})
    input.value = '';
})

//Get message from server
socket.on(`refresh_${productId}`, bidRecord => {

    console.log(bidRecord)

    const highestBid = document.querySelector('.highest-bid')
    highestBid.textContent = bidRecord.bid_amount

    const bidTimesDiv = document.querySelector('#bid-times')
    highestBidTimes = bidRecord.highest_bid_times
    bidTimesDiv.textContent = `出價次數： ${highestBidTimes}`

    endTime = bidRecord.end_time
    resetCountDownTimer()
    renderBidRecord(bidRecord)

})

socket.on('bidFail', bidRecord => {
    alert('出價失敗')
})

socket.on('bidSuccess', bidRecord => {
    alert('出價成功')
})

//Output bid message to DOM
const renderBidRecord = (record) => {
    const bidTime = transMilToDate(record.bid_time + 8*60*60*1000)
    const timeLeft = transMilToDate(record.time_left)

    let recordLi = document.createElement('li')
    recordLi.className = "list-group-item d-flex justify-content-between align-items-start record-message"

    let recordDiv = document.createElement('div')
    recordDiv.className = "ms-2 me-auto"
    recordDiv.textContent =  `$${record.bid_amount}`
    
    let subDiv = document.createElement('div')
    subDiv.className = 'fw-bold fs-6'
    subDiv.textContent = `${record.user_id}號買家舉起了號碼牌`
    
    
    let recordSpan = document.createElement('span')
    recordSpan.className = "badge bg-secondary rounded-pill fs-6"
    recordSpan.textContent = `${bidTime.hours}: ${bidTime.min}: ${bidTime.sec}`

    recordDiv.appendChild(subDiv)
    recordLi.appendChild(recordDiv)
    recordLi.appendChild(recordSpan)
    bidRecords.prepend(recordLi)

    const messages = document.querySelectorAll('.record-message')

    messages.forEach(e => e.classList.remove('fs-2'))
    messages[0].classList.add('fs-2')

    if(messages.length > 5) {
        bidRecords.removeChild(messages[5])
    }
}

//Output other image with bootstrap Carousel
const renderImagesSlide = (otherImages) => {
    
    let indicators = document.querySelector('.carousel-indicators')
    let carousel = document.querySelector('.carousel-inner')

    otherImages.forEach((e, i) => {

        indicators.innerHTML += `<button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="${(i+1)}" aria-label="Slide ${(i+2)}"></button>`

        carouselItem = document.createElement('div')
        carouselItem.className = "carousel-item"

        carouselImg = document.createElement('img')
        carouselImg.className = "d-block w-100"
        carouselImg.src = e

        carouselItem.appendChild(carouselImg)
        carousel.appendChild(carouselItem)

        console.log(carousel.innerHTML)
    })
} 


const setCountDownTimer = () => {
    setInterval(() => {
        let start = Date.now();

        let totalMilSec = (endTime) - Date.now();
        const countDown = document.querySelector('#count-down-number')

        if (totalMilSec <= 0) {
            countDown.textContent = "時間到，競標結束！"
            const bidButton = document.querySelector('.my-bid-button')
            const bidInput = document.querySelector('.my-bid-input')
            bidButton.disable = true;
            bidInput.readOnly = true;
            bidButton.style.background = '#DC3545'
            bidButton.textContent = "競標結束";
            return
        }

        let time = transMilToDate(totalMilSec)

        countDown.textContent = `${time.days}:${time.hours}:${time.min}:${time.sec} `
    },500)
}

const resetCountDownTimer = () => {
    clearInterval(setCountDownTimer);
    setCountDownTimer(endTime);
    console.log("時間重新計算")
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


