//Make sure the password are the same
const form = document.querySelector('#signup-form')

// if (password_1 != password_2) {
//     password_msg.textContent = "兩次密碼不相同，請再試一次"
//     button.disabled = true;
// } else {
//     password_msg.textContent = ""
//     button.disabled = false;
// }


form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    const pwd = document.querySelector('.my-password').value

    fetch('/api/1.0/user/signup', {
        method: 'post',
        body: formData
    })

    .then((res)=> {
        if(res.status == 200) {
            alert("註冊成功")
            self.location.href = "/user/profile"
            return res.json();
        } else if (res.status == 403) {
            alert("Email已存在")
        } else if (res.status == 400) {
            alert("Email 不符合格式")
        }
    })
    .then((res) => {
        const data = res.data
        localStorage.setItem("user", JSON.stringify(data));
    })
    .catch((err) => {
        console.log(err)
        alert('伺服器忙碌中，請稍後再試。')
    })
    
})