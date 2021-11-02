const form = document.querySelector('form')

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const user = {
        provider: 'native',
        email: document.querySelector(".my-email").value,
        password: document.querySelector(".my-password").value,
    };

    fetch('/api/1.0/user/signin', {
        method: 'post',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(user)
    })
    .then((res)=> {
        if(res.status == 200) {
            alert("登入成功")
            self.location.href = "/user/profile"
            return res.json()
        } else if (res.status == 403) {
            alert("帳號密碼錯誤、請再試一次！")
            return
        } else {
            alert('伺服器忙碌中，請稍後再試。')
            return
        }
    })
    .then((res) => {
        const data = res.data
        localStorage.setItem("user", JSON.stringify(data));
        const user = JSON.parse(localStorage.getItem("user"));
        console.log(user.user)
    })
    .catch((err) => {
        console.log(err)
    })
})