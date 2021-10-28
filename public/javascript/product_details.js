//Get product id from query
const productId = Qs.parse(location.search, {
    ignoreQueryPrefix: true
}).id;

const socket = io();

let leastBid;
let highestBidTimes;
let endTime;

//Fetch the product details

const detailsUrl = `/api/1.0/product/details?id=${productId}`
console.log(detailsUrl)

fetch(detailsUrl)
    .then(res => res.json())
    .then(res =>  res.data)
    .then((data) => {

        if (data == null) {
            self.location.href = '/404.html'
        }


        category = document.querySelector('#category')
        const categoryHref = document.createElement('a')
        categoryHref.href = `/product/${data.category}`
        category.textContent = data.category
        category.appendChild(categoryHref)

        const productIdTitle = document.querySelector('#product-id')
        productIdTitle.textContent = "Lot: " + data.id

        const productTitle = document.querySelector('#product-title')
        productTitle.textContent = data.title

        const brand = document.querySelector('#brand')
        brand.textContent = data.brand

        const mainImage = document.querySelector('#main-image')
        mainImage.src = data.main_image

        endTime = data.end_time
        setCountDownTimer(endTime)

        const currentNumber = document.querySelector('.highest-bid')
        currentNumber.textContent = data.highest_bid

        const bidEnter = document.querySelector('#bid-enter')
        bidEnter.value = data.bid_incr

        const bidIncr = document.querySelector('#bid-incr')
        bidIncr.textContent = `最低出價： ${data.bid_incr}`
        leastBid = data.bid_incr;

        const bidTimes = document.querySelector('#bid-times')
        bidTimes.textContent = `出價次數： ${data.bid_times}`

        const sellerId = document.querySelector('#seller-id')
        sellerId.textContent = `拍賣賣家： ${data.seller_id}`

        const bidRecords = document.querySelector('.bid-records')
        data.records.map((e) => {
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

        const note = document.querySelector('#note')
        note.textContent = ` 商品備註： ${data.note}`

        const story = document.querySelector('#story')
        story.textContent = `商品簡介： ${data.story}`

        const otherImages = document.querySelector('.images-container')
        data.images.map((e) => {
            const img = document.createElement('img')
            img.className = 'other-images'
            img.src = e
            otherImages.appendChild(img)
        })


    })
;

//Get user information by token
const accessToken = JSON.parse(localStorage.getItem('user'))
const userId = accessToken.user.id || null;

//Join product id room with socket.io handshake
socket.emit('join', [productId, userId])

//Send bid message to socket.io server
const form = document.querySelector('#bid-form')
const input = document.querySelector('#bid-enter')
const highestBid = document.querySelector('.highest-bid')
const bidRecords = document.querySelector('.bid-records')

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const userBidIncr = Number(input.value)
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
    socket.emit('bid', { productId, userId, userBidAmount, endTime})
    input.value = '';
})

//Get the bid message from server
socket.on('bid', bidMsg => {
    outputBid(bidMsg)
    const bidTimes = document.querySelector('#bid-times')
    highestBidTimes += 1
    bidTimes.textContent = `出價次數： ${highestBidTimes}`
    window.scrollTo(0, 0, 'smooth')
});

//Get message from server
socket.on('bidRefresh', bidRecord => {

    console.log(bidRecord)

    fetch(detailsUrl)
        .then(res => res.json())
        .then(res =>  res.data)
        .then((data) => {

            endTime = data.end_time
            resetCountDownTimer(endTime)

            const currentNumber = document.querySelector('.highest-bid')
            currentNumber.textContent = data.highest_bid

            const bidTimes = document.querySelector('#bid-times')
            bidTimes.textContent = `出價次數： ${data.bid_times}`

            data.records.map((e) => {
                renderBidRecord(e)
            })

            console.log("done")

        })
        .catch(e => console.log(e))

})

socket.on('bidFail', bidRecord => {
    alert('出價失敗')
})



socket.on('bidFail', error => console.log(error))

//Output bid message to DOM
const renderBidRecord = (record) => {
    const bidTime = transMilToDate(record.bid_time)
    const timeLeft = transMilToDate(record.time_left)

    const div = document.createElement('div')
    div.classList.add('record-message')

    div.innerHTML = `<div><h3 class="bidder">${record.user_id} 賣家出價 <h2>$${record.bid_amount}</h2></h3></div><div>出價時間： ${bidTime.hours}: ${bidTime.min}: ${bidTime.sec}</div><div>剩餘時間： ${timeLeft.hours}: ${timeLeft.min}: ${timeLeft.sec}</div>`
    bidRecords.append(div);

    const messages = document.querySelectorAll('record-message')

    if(messages.length > 4) {
        bidRecords.removeChild(messages[4])
    }
    bidRecords.prepend(div)
}


const setCountDownTimer = () => {
    setInterval(() => {
        let totalMilSec = (endTime) - Date.now();
        let time = transMilToDate(totalMilSec)

        const countDown = document.querySelector('#count-down-number')
        countDown.textContent = `${time.days}:${time.hours}:${time.min}:${time.sec} `
    },100)
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


