const user = JSON.parse(localStorage.getItem("user"));
const imgUrl ='https://s3.ap-northeast-1.amazonaws.com/node.js-image-bucket/'
console.log(user)
let accessToken = null;
let userId = null;
let userName = null;

if (user && user.access_token && user.user) {
    accessToken = user.access_token
    userId = user.user.id
    userName = user.user.name
    $('<img>', {
        src: user.user.picture,
        class: 'rounded-circle avatar-img',
        width: '30',
        height: '30',
        text: user.user.name
    }).appendTo('.home-avatar')
    $('.greeting-word').html(`<span class='text-body'>Hello, </span>${user.user.name} `)
}


if (user && user.user.picture) {
    $('#signin-button').css('display', 'none')
    $('#signup-button').css('display', 'none')
    $('#logout-button').css('display', 'inline')
    $('#like-button').css('display', 'inline')
}

$('#logout-button').click(() => {
    Swal.fire({
        imageUrl: '../assest/stay.png',
        imageWidth: 400,
        imageHeight: 300,
        title: '修但幾勒',
        text:'你忍心離開嗎?',
        showCancelButton: true,
        confirmButtonText: '我跟你走',
        cancelButtonText: `留下來`,
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                icon: 'success',
                title: '登出成功',
            }).then(() => location.reload())
            localStorage.removeItem('user')
        }
    })
})

$('.search-button').click( async () => {
    const keyword = await $('#search-input').val()
    window.location.href=`/product/search?keyword=${keyword}`
})
