const button = document.querySelector('.signin')
const form = document.querySelector('form')

button.addEventListener('click', (e) => {
    e.preventDefault();

    const user = {
        provider: 'native',
        email: document.querySelector(".enter-email").value,
        password: document.querySelector(".enter-password").value,
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
        } else {
            console.log(res)
            alert("請在試一次")
            return error
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
        alert('伺服器忙碌中，請稍後再試。')
    })
})