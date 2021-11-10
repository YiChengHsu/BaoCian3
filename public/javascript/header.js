const user = JSON.parse(localStorage.getItem("user"));
const imgUrl ='https://s3.ap-northeast-1.amazonaws.com/node.js-image-bucket/'
console.log(user)
let accessToken = null;
let userId = null;

if (user && user.access_token && user.user) {
    accessToken = user.access_token
    userId = user.user.id
    $('<img>', {
        src: "https://s3.ap-northeast-1.amazonaws.com/node.js-image-bucket/" + user.user.picture,
        class: 'rounded-circle',
        width: '36',
        height: '36'
    }).appendTo('.home-avatar')
    $('.bi-person-circle').remove();
}


if (user && user.user.picture) {
    $('#signin-button').css('display', 'none')
    $('#logout-button').css('display', 'inline').attr('width', '100px')
}

$('#logout-button').click(() => {
    Swal.fire({
        icon: 'success',
        title: '登出成功',
    }).then(()=>{
        window.location.href ='/'
        localStorage.removeItem('user')
    })
})

$('.search-button').click( async () => {
    const keyword = await $('#search-input').val()
    window.location.href=`/product/search?keyword=${keyword}`
})