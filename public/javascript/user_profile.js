const url = "/api/1.0/user/profile";

let params = location.search

if(!user || !user.user) {
  Swal.fire({
    icon: 'warning',
    title: '請登入',
    text: '使用個人管理功能請先登入',
  }).then(()=>{
    window.location.href ='/user/signin'
  })
}

$("#twzipcode").twzipcode({
  zipcodeIntoDistrict: true, // 郵遞區號自動顯示在區別選單中
  css: ["city form-control address-input", "town form-control address-input"], // 自訂 "城市"、"地別" class 名稱 
  countyName: "city", // 自訂城市 select 標籤的 name 值
  districtName: "town" // 自訂區別 select 標籤的 name 值
});

$('.city').attr('disabled', true);
$('.town').attr('disabled', true);

$(document).ready(function() {
  $('.js-example-basic-single').select2();
});


fetch((url + params), {
  method: "get",
  headers: {
    Authorization: "Bearer " + user.access_token,
  },
})
  .then(res => res.json())
  .then((res) => {

    const user = res.data.user
    const list = res.data.list

    console.log(res)
    console.log(res.data.list)

    $(".avatar").attr('src','https://s3.ap-northeast-1.amazonaws.com/node.js-image-bucket/' + user.picture);
    $(".user-name").text(user.name)
    $('.user-email').text(user.email)
    $('.city').val(user.city)
    $('.town').val(user.town)
    $('.street').val(user.address)
    $('.receiver').val(user.receiver)
    $('.phone').val(user.phone)
    $(".bank-account").val(user.bank_code).trigger('change')
    $(".bank-account").val(user.bank_account)
    $(".account-name").val(user.account_account)

    list.map((e) => {

      const id = e.id
      const imgUrl =`https://s3.ap-northeast-1.amazonaws.com/node.js-image-bucket/${e.main_image}`

      console.log(imgUrl)
      
      $(document).ready(function(){

        $('<div/>', {
          'class': `row align-middle mb-3 text-center border border-1 rounded`,
          'id': `my-row-${id}`
        }).appendTo('.my-list-container')

        $('<a/>', {
          'class': `col-md-2 p-2 my-img-div`,
          'href': `http://localhost:3000/product/details?id=${id}`,
          'id': `my-img-link-${id}`
        }).appendTo(`#my-row-${id}`)

        $('<div/>', {
          'class': `col-md-2 p-2 my-img-div my-img-div`,
          'id': `my-img-${id}`
        }).appendTo(`my-img-link-${id}`)
        $(`#my-img-link-${id}`).css("background-image", `url('${imgUrl}')`)

        $('<div/>', {
          'class': "col-1 align-middle my-auto",
          'id': `my-id-${id}`
        }).appendTo(`#my-row-${id}`)
        $('<h5/>').text(id).appendTo(`#my-id-${id}`)

        $('<div/>', {
          'class': "col-2 align-middle my-auto",
          'id': `my-title-${id}`
        }).appendTo(`#my-row-${id}`)
        $('<h5/>').text(e.title).appendTo(`#my-title-${id}`)

        $('<div/>', {
          'class': "col-2 align-middle my-auto",
          'id': `my-price-${id}`
        }).appendTo(`#my-row-${id}`)
        $('<h5/>').text(e.total).appendTo(`#my-price-${id}`)

        const time = new Date(e.end_time)
        const year = time.getFullYear();
        const month = time.getMonth() + 1;
        const date = time.getDate();
        let hours = time.getHours();
        if (hours < 10) {
          hours = `0${hours}`
        }
        let minutes = time.getMinutes();
        if (minutes < 10) {
          minutes = `0${minutes}`  
        }

        $('<div/>', {
          'class': "col-1 align-middle my-auto text-center",
          'id': `my-endTime-${id}`
        }).appendTo(`#my-row-${id}`)
        $('<h5/>').html(`${year}<br>${month}/${date}<br>${hours}:${minutes}`).appendTo(`#my-endTime-${id}`)

        $('<div/>', {
          'class': "col-2 align-middle my-auto",
          'id': `my-status-${id}`
        }).appendTo(`#my-row-${id}`)

        $('<h5/>').text(e.status).appendTo(`#my-status-${id}`)

        $('<div/>', {
          'class': "col-2 align-middle my-auto",
        }).appendTo(`#my-row-${id}`)
        
      })
    })
  })


  .catch((err) => {
    console.log(err);
    // self.location.href = "/user/signin";
  })
;

$('.my-address-button').click(()=>{
  $('.address-input').attr('disabled', false);
  $('.my-address-button').css('display', 'none')
  $('.change-address-button').css('display', 'inline')
})

$('.my-bank-button').click(()=>{
  $('.bank-input').attr('disabled', false);
  $('.my-bank-button').css('display', 'none')
  $('.change-bank-button').css('display', 'inline')
})

$('.change-address-button').click((e)=>{
  e.preventDefault();
  const form = document.querySelector('form')
  const formData = new FormData(form);
  console.log(form)
  console.log(formData)
})