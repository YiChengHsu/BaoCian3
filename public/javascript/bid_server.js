const socket = io()

//Get product id from query
// const id = Qs.parse(location.search, {
//     ignoreQueryPrefix: true
// });
console.log(id)
//Join product id room
socket.emit('joinRoom', id)

//Socket bid count down
socket.on(`counter${id}`, (counter) => {
    var countDown = document.querySelector('#count-down-number')
    countDown.textContent = `${counter.days}:${counter.hours}:${counter.minutes}:${counter.seconds}`;
})

//Socket send bid
const form = document.querySelector('#bid-form')
const input = document.querySelector('#bid-enter')
const bidRoom = document.querySelector('.bid-room')
const currentBid = document.querySelector('.current-bid')
const bidMessage = document.querySelector('.message-container')

form.addEventListener('submit', (e) => {
    e.preventDefault();
    bidNumber = input.value
    const user = JSON.parse(localStorage.getItem('user'))
    if(!user || !user.user.id) {
        alert('下標前請先登入')
        self.location.href = "/user/signin"
        return
    } 

    const userId = user.user.id
    console.log(userId)
    console.log(id)

    if (bidNumber && (bidNumber >= leastBid) && (bidNumber <= leastBid*100)) {
        const currentNumber = currentBid.textContent.replace("$","")
        socket.emit('bid', { id, userId, bidNumber, currentNumber})
        input.value = '';
        console.log(bidMessage)
    } else if (bidNumber && bidNumber < leastBid){
        alert('請大於最小出價')
    } else if (bidNumber && bidNumber > leastBid*100) {
        alert('珍惜荷包，請不要出大於最小出價一百倍的價格') 
    } else {
        alert('無效的出價')
    }
})

//Get the bid message from server
socket.on('bid', bidMsg => {
    outputBid(bidMsg)
    const bidTimes = document.querySelector('#bid-times')
    currentBidTimes += 1
    bidTimes.textContent = `出價次數： ${currentBidTimes}`
    window.scrollTo(0, 0, 'smooth')
});

//Get message from server
socket.on('message', msg => {
    console.log(msg)
    bidMessage.textContent = msg
    setTimeout(() => {
        bidMessage.textContent = ""
    }, 10000)
})


//Output bid message to DOM
function outputBid(bidMsg) {
    const div = document.createElement('div')
    const messages = document.querySelectorAll('.bid-message')
    div.classList.add('bid-message')
    div.innerHTML = `<p class="name">${bidMsg.user_id} <span>${bidMsg.time_hours}:${bidMsg.time_minutes}:${bidMsg.time_seconds}</span></p>
    <p class="bid">$${bidMsg.bid_current_number}</p>`

    console.log(messages)

    if(messages.length > 4) {
        bidRoom.removeChild(messages[4])
    }
    bidRoom.prepend(div)
    currentBid.textContent = `$${bidMsg.bid_current_number}`
}