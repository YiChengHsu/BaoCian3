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
        if (res.status == 403) {
            Swal.fire({
                title: 'HAIYAAA!!!',
                text: 'Email已存在唷!',
                imageUrl: 'https://imgur.dcard.tw/BBYi0Wch.jpg',
                imageWidth: 400,
                imageHeight: 300,
            })
            throw new Error
        } else if (res.status == 400) {
            Swal.fire({
                title: 'HAIYAAA!!!',
                text: 'Email 不符合格式唷!',
                imageUrl: 'https://imgur.dcard.tw/BBYi0Wch.jpg',
                imageWidth: 400,
                imageHeight: 300,
            })
            throw new Error
        } else if (res.status == 500) {
            throw new Error
        }

        return res.json();
    })
    .then((res) => {
        const data = res.data
        localStorage.setItem("user", JSON.stringify(data));
        Swal.fire({
            title: '註冊成功',
            text: '歡迎加入Rick Roll的行列',
            imageUrl: '../assest/rick-roll-rick-ashley.gif',
            imageWidth: 400,
            imageHeight: 500,
        }).then(()=> {
            self.location.href = "/user/profile"
        })
    })
    .catch((err) => {
        console.log(err)
    })
    
})