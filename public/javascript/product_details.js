//Get product id from query
const query = location.search
const productId = query.split('=')[1]
const socket = io();

let leastBid;
let highestBidTimes;
let endTime;
let bidTimes;
let sellerId;
let roomUsers;
let watchList = []

//Fetch the product details

socket.on('roomUsers', (data) => {
    console.log(data)
    roomUsers = data[productId] ? data[productId].length : 0;
    const roomUserDiv = document.querySelector('#room-user')
    roomUserDiv.textContent = `在線人數： ${roomUsers}`
})

const detailsUrl = `/api/1.0/product/details${query}`

fetch(detailsUrl, {
    method: 'get',
    headers: {
      'Authorization': "Bearer " + accessToken
    }
})
    .then(res => res.json())
    .then((res) => {

        const data = res.data
        console.log(data)
        watchList = res.user
        
        if (data == null) {
            self.location.href = '/404.html'
        }

        const category = convertCategory( data.category, data.sub_category)

        console.log(category)

        $('#bread-category').attr('href', `/product/${data.category}`).text(category.category)

        $('#bread-subcategory').attr('href', `/product/${data.subCategory}`).text(category.subCategory,)

        $('#bread-title').text(data.title)



        const productTitle = document.querySelector('.my-product-title')
        productTitle.textContent = data.title

        const mainImage = document.querySelector('.main-image')
        mainImage.src = data.main_image

        endTime = data.end_time

        const flipdown = new FlipDown(endTime/1000);
        flipdown.start();
        flipdown.ifEnded(() => {
            console.log('時間結束')
        });

        if (endTime < Date.now()) {
            $('#count-down-number').text('完結')
            const bidButton = document.querySelector('.my-bid-button')
            const bidInput = document.querySelector('.my-bid-input')
            $('.my-bid-button').attr('disabled', true)
            bidButton.disable = true;
            bidInput.readOnly = true;
            bidButton.className.remove = 'btn-primary'
            bidButton.className.add = 'btn-secondary'
            bidButton.textContent = "競標結束"

                    
            if ( data.highest_user_id == userId) {
                $('<div>', {
                    class: "alert alert-danger text-center" ,
                    role:"alert",
                    html: '恭喜！您已成功得標，請前往<a href="/user/profile?type=order&status=0" class="alert-link">個人頁面</a>進行付款'
                }).prependTo('.highest-bid-div')
            }

        } else {
            setCountDownTimer(endTime) 
        }
    

        const currentNumber = document.querySelector('.highest-bid')
        currentNumber.textContent = `$${toCurrency(data.highest_bid)}`

        const bidEnter = document.querySelector('#my-bid-number')
        bidEnter.placeholder = `$${data.bid_incr}`

        const bidIncr = document.querySelector('#bid-incr')
        bidIncr.textContent = `最低出價增額： $${data.bid_incr}`
        leastBid = data.bid_incr;

        const bidTimesDiv = document.querySelector('#bid-times')
        highestBidTimes = data.bid_times
        bidTimesDiv.textContent = `出價次數： ${highestBidTimes}`

        sellerId = data.seller_id

        if (userId == sellerId) {
            $('.my-bit-button').attr('disable', true).text('這是您的商品')
        }


        const bidRecords = document.querySelector('.my-bid-record')
        const recordsData = data.records || [];
        recordsData.reverse().map((e) => {
            renderBidRecord(e)
        })

        $('.seller-img').attr('src', data.sellerInfo.picture)
        $('.seller-name').text(data.sellerInfo.name)

        if (data.sellerInfo.rating) { 
            $('#star').raty({score: data.sellerInfo.rating, readOnly: true});
            $("#user-rating").text(`平均評分：${data.sellerInfo.rating.toFixed(2)}`);
        } else {
            $('#star').raty({score: 0, readOnly: true});
            $("#user-rating").text("尚未評分");
        }


        const description = document.querySelector('#description')
        description.textContent = data.description

        const texture = document.querySelector('#texture')
        texture.textContent = data.texture

        const condition = document.querySelector('#condition')
        condition.textContent = data.condition

        const originalPackaging = document.querySelector('#original-packaging')
        originalPackaging.textContent = data.original_packaging

        const withPapers = document.querySelector('#with-papers')
        withPapers.textContent = data.with_papers

        const place = document.querySelector('#place')
        place.textContent = data.place

        renderImagesSlide(data.images)

        if (watchList.includes(data.id)) {
            $('#watch-btn').hide()
        } else {
            $('#unwatch-btn').hide()
        }
    
        // Set the watch list button
        $('#watch-btn').click(() => {
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
                'productId': data.id
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
              $('#unwatch-btn').show();
              $('#watch-btn').hide();
              Swal.fire({
                icon: 'success',
                title: '加入成功',
                text: '可於關注頁面的進行查看!',
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
          $('#unwatch-btn').click(() => {
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
                'productId': data.id
              })
            })
            .then((res) => {
              console.log(res.status)
              if (res.status != 200) {
                return error
              }
              $('#unwatch-btn').hide();
              $('#watch-btn').show();
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
    
    })
;

//Get user information by token

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
        Swal.fire({
            icon: 'error',
            title: '無效出價',
            text: '出價欄位不得為空或包含無效字元',
        })
        return
    }

    if(!userId) {
        Swal.fire({
            icon: 'warning',
            title: '下標前請登入',
            text: '登入以享受更多競標的樂趣！',
        }) 
        .then(() => {
            self.location.href = "/user/signin"
        })
        return
    } 

    if(userId == sellerId) {
        Swal.fire({
            icon: 'warning',
            title: '請勿自行下標',
            text: '自己的轎不能自己抬唷！',
        })
        return
    }

    if (userBidIncr < leastBid) {
        Swal.fire({
            icon: 'error',
            title: '無效出價',
            text: '請不要小於最低出價增額',
        })
        return
    } else if (userBidIncr > leastBid*100) {
        Swal.fire({
            icon: 'warning',
            title: '太多啦~',
            text: '珍惜荷包，請不要大於出價增額的一百倍',
        }) 
        return
    }

    const currentAmount = highestBid.textContent
    const userBidAmount = Number(highestBid.textContent.replace('$',"").replace(',','')) + userBidIncr

    console.log(userBidAmount)

    Swal.fire({
        title: "確認出價",
        html: `<p>目前出價：<b>${currentAmount}</b></p><p>你的出價：<b>$${toCurrency(userBidAmount)}</b></p>`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#e95420",
        confirmButtonText: "我跟他拚了！",
        cancelButtonText: "怕.jpg",
    }).then((result) => {
        if (result.isConfirmed) {
            socket.emit('bid', { productId, userId, userBidAmount, endTime, highestBidTimes}) 
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            input.value = ''
        }
    })
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
    $('#flipdown').html('')
    const flipdown = new FlipDown(endTime/1000);
    flipdown.start();
    resetCountDownTimer()
    renderBidRecord(bidRecord)

    const rightDiv = document.querySelector('.my-right')
    rightDiv.classList.add('fade-it')
    setTimeout(() => {
        rightDiv.classList.remove('fade-it')
    }, 2000)

})

socket.on('bidFail', (message) => {
    Swal.fire({
        icon: 'error',
        title: '出價失敗',
        text: message,
        confirmButtonText: '知道了'
    })
})

socket.on('bidSuccess', bidRecord => {
    Swal.fire({
        icon: 'success',
        title: '出價成功',
        text: '您目前是最高出價者',
    })
    .then(()=>{
        input.value = ''
    })
})


//Output bid message to DOM
const renderBidRecord = (record) => {
    const bidTime = transMilToDate(record.bid_time + 8*60*60*1000)

    let recordLi = document.createElement('li')
    recordLi.className = "list-group-item d-flex justify-content-between align-items-start record-message"

    let recordDiv = document.createElement('div')
    recordDiv.className = "ms-2 me-auto"
    recordDiv.textContent =  `$${record.bid_amount}`
    
    let subDiv = document.createElement('div')
    subDiv.className = 'fw-bold fs-6'
    subDiv.textContent = `${record.user_id}號買家舉起了號碼牌`

    console.log(record)

    if ( Date.now() < endTime && record.user_id == userId) {
        $('.highest-bid-header').css('display', 'block')
    } else {
        $('.highest-bid-header').css('display', 'none')
    }
    
    
    let recordSpan = document.createElement('span')
    recordSpan.className = "badge bg-secondary rounded-pill fs-6"
    recordSpan.textContent = `${bidTime.hours}: ${bidTime.min}: ${bidTime.sec}`

    recordDiv.appendChild(subDiv)
    recordLi.appendChild(recordDiv)
    recordLi.appendChild(recordSpan)
    // bidRecords.prepend(recordLi)
    // $(recordLi).hide().prependTo(bidRecords).show('normal');
    $(recordLi).hide().prependTo(bidRecords).slideDown('slow').animate({backgroundColor:'red'}, 400).delay(400).animate({backgroundColor:'black'}, 1000);

    $('.record-message').animate({backgroundColor:'red'}, 400).delay(400).animate({backgroundColor:'black'}, 1000);

    const messages = document.querySelectorAll('.record-message')

    // messages.forEach(e => e.classList.remove('fs-2'))
    // messages[0].classList.add('fs-2')

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
        carouselImg.className = "d-block w-100 other-images"
        carouselImg.src = e

        carouselItem.appendChild(carouselImg)
        carousel.appendChild(carouselItem)

    })
} 


const setCountDownTimer = () => {
    setInterval(() => {
        let start = Date.now();
        //Convert to timestamp
        let totalMilSec = (endTime) - Date.now();

        if (totalMilSec <= 0) {
            countDown.textContent = "完結"
            const bidButton = document.querySelector('.my-bid-button')
            const bidInput = document.querySelector('.my-bid-input')
            bidButton.disable = true;
            bidInput.readOnly = true;
            bidButton.className = ''
            bidButton.textContent = "競標結束";
            return
        }

    },500)
}

const resetCountDownTimer = () => {
    clearInterval(setCountDownTimer);
    setCountDownTimer(endTime);
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

const convertCategory = (categoryRaw, subCategoryRaw) => {

    const categoryInTc = {
        'men': '男性',
        'women': '女性',
        'luxury': '名牌',
        'electronics': '3C',
        'other': '其他'
    }

    const subCategoryInTc = {
        'men_shirt':'上衣', 'men_pants': '褲子', 'men_shoes': '鞋子', 'men_bag': '包包', 'men_accessories': '配件', 'men_others':'其他','women_shirt': '上衣','women_dress': '洋裝','women_skirt': '裙子','women_pants': '褲子','women_shoes': '鞋子','women_bag': '包包','women_accessories': '配件','women_others': '其他', 'watch': '品牌手錶','bag': '品牌包包','luxury_others': '其他', 'phone': '手機','computer': '筆電電腦','peripherals': '電腦周邊','earphone': '耳機','camera': '相機', 'electronics_others': '其他', 'other': '其他'
    }

    const category = categoryInTc[categoryRaw]
    const subCategory = subCategoryInTc[subCategoryRaw]

    return {category, subCategory}
}



