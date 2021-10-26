//Get product id from query
const id = Qs.parse(location.search, {
    ignoreQueryPrefix: true
}).id;

let leastBid;
let currentBidTimes;

//Fetch the product details

const detailsUrl = `/api/1.0/product/details?id=${id}`

fetch(detailsUrl)
    .then(res => res.json())
    .then(res =>  res.data[0])
    .then((data) => {

        console.log(data)

        category = document.querySelector('#category')
        const categoryHref = document.createElement('a')
        categoryHref.href = `/product/${data.category}`
        category.textContent = data.category
        category.appendChild(categoryHref)

        const productId = document.querySelector('#product-id')
        productId.textContent = "Lot: " + data.id

        const productTitle = document.querySelector('#product-title')
        productTitle.textContent = data.title

        const brand = document.querySelector('#brand')
        brand.textContent = data.brand

        const mainImage = document.querySelector('#main-image')
        mainImage.src = data.main_image

        const currentNumber = document.querySelector('.current-bid')
        currentNumber.textContent = data.bid_current_number

        const bidEnter = document.querySelector('#bid-enter')
        bidEnter.value = data.bid_incr

        const bidIncr = document.querySelector('#bid-incr')
        bidIncr.textContent = `最低出價： ${data.bid_incr}`
        leastBid = data.bid_incr

        const bidTimes = document.querySelector('#bid-times')
        bidTimes.textContent = `出價次數： ${data.bid_time}`
        currentBidTimes = data.bid_time;

        const sellerId = document.querySelector('#seller-id')
        sellerId.textContent = `拍賣賣家： ${data.seller_id}`

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



//Fetch the bid record api
const recordUrl = `/api/1.0/bid/records?id=${id}`

fetch(recordUrl)
    .then(res => res.json())
    .then((res) => {
        const data = res.data
        data.map((e) => {
            outputBidRecords(e) 
        })
        currentBid.textContent = `$${data[0].bid_current_number}`
        })
    .catch(error => console.log(error))



//Output bid message to DOM
function outputBidRecords(data) {
    const div = document.createElement('div')
    div.classList.add('bid-message')
    div.innerHTML = `<p class="name">${data.user_id} <span>${data.time_hours}:${data.time_minutes}:${data.time_seconds}</span></p>
    <p class="bid">$${data.bid_current_number}</p>`
    bidRoom.append(div);
}


