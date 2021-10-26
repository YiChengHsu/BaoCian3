//Make sure the password are the same
const button = document.querySelector('.signup')
const form = document.querySelector('form')

// if (password_1 != password_2) {
//     password_msg.textContent = "兩次密碼不相同，請再試一次"
//     button.disabled = true;
// } else {
//     password_msg.textContent = ""
//     button.disabled = false;
// }


button.addEventListener('click', (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    const pwd = document.querySelector('#password').value
    const pwd2 = document.querySelector('#password-2').value

    const pwd_msg = document.querySelector('#password-msg')

    if (pwd.length < 6) {
        alert('密碼長度不足，請介於6-16位')
        return
    } else if (pwd.length > 16) {
        alert('密碼長度過長，請介於6-16位')
        return
    }

    if (pwd != pwd2) {
        alert('兩次密碼不同，請重新輸入')
        return
    }

    console.log(formData)

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