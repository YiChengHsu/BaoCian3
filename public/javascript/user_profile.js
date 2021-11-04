const url = "/api/1.0/user/profile";
const user = JSON.parse(localStorage.getItem("user"));

console.log(user)

$("#twzipcode").twzipcode({
  zipcodeIntoDistrict: true, // 郵遞區號自動顯示在區別選單中
  css: ["city form-control", "town form-control"], // 自訂 "城市"、"地別" class 名稱 
  countyName: "city", // 自訂城市 select 標籤的 name 值
  districtName: "town" // 自訂區別 select 標籤的 name 值
});

$('.city').attr('disabled',true)
$('.town').attr('disabled',true)

$(document).ready(function() {
  $('.js-example-basic-single').select2();
});


fetch(url, {
  method: "get",
  headers: {
    Authorization: "Bearer " + user.access_token,
  },
})
  .then(res => res.json())
  .then((res) => {
    const avatar = document.querySelector(".avatar");
    avatar.src = res.data.picture;

    const name = document.querySelector(".user-name");
    name.textContent = res.data.name;

    const email = document.querySelector(".user-email");
    email.textContent = res.data.email;
  })
  .catch((err) => {
    console.log(err);
    self.location.href = "/user/signin";
  });

const button = document.querySelector(".logout")

button.addEventListener('click' ,(e) => {
    localStorage.removeItem("user")
    alert("登出成功")
    self.location.href="/user/signin"
})
