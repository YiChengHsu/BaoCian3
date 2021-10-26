const button = document.querySelector('.upload')
const form = document.querySelector('form')


button.addEventListener('click', (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    console.log(formData)

    fetch('/api/1.0/product/upload', {
        method: 'post',
        body: formData
    })

    .then((res)=> {
        if(res.status == 200) {
            alert("上傳成功")
            return res.json();
        } else {
            throw error
        }
    })
    .then((res) => {
        self.location.href = `/product/details?id=${res.productId}`
    })
    .catch((err) => {
        console.log(err)
        alert('伺服器忙碌中，請稍後再試。')
    })
})