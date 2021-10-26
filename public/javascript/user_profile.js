const url = "/api/1.0/user/profile";
const user = JSON.parse(localStorage.getItem("user"));

console.log(user)

fetch(url, {
  method: "get",
  headers: {
    Authorization: "Bearer " + user.access_token,
  },
})
  .then((res) => res.json())
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
    // self.location.href = "/user/signin";
  });

const button = document.querySelector(".logout")

button.addEventListener('click' ,(e) => {
    localStorage.removeItem("user")
    alert("登出成功")
    self.location.href="/user/signin"
})
