const button = document.querySelector('.upload')
const form = document.querySelector('.product-upload')
const selectList = document.querySelector('.my-category-select');

if (!user || !user.user) {
    Swal.fire({
        icon: 'warning',
        title: '請登入',
        text: '登入以享受更多競標的樂趣！',
        showCancelButton: true,
    }).then(() => {
        self.location.href='/user/signin'
    })

}

//Input category with relevant sub category
const changeSubCategory = (value) => {

    let subList = []

    switch (value) {
        case 'men': 
            subList =  [['men_shirt', '上衣'], ['men_pants', '褲子'], ['men_shoes', '鞋子'], ['men_bag', '包包'], ['men_accessories', '配件'], ['men_others','其他']];
            break
        case 'women':
            subList =  [['women_shirt', '上衣'], ['women_dress', '洋裝'], ['women_skirt', '裙子'], ['women_pants', '褲子'], ['women_shoes', '鞋子'], ['women_bag', '包包'], ['women_accessories', '配件'], ['women_others', '其他']];
            break
        case 'luxury':
            subList = [['watch', '品牌手錶'], ['bag', '品牌包包'], ['luxury_others', '其他']];
            break
        case 'electronics':
            subList = [['phone', '手機'], ['computer', '筆電電腦'], ['peripherals', '電腦周邊'], ['earphone', '耳機'], ['camera', '相機'], ,['electronics_others', '其他']];
            break
        case 'other':
            subList = [['other', '其他']]
            break
        default:
    }

    const subCategory = document.querySelector('.my-sub-category')

    const subOption = document.querySelectorAll('.my-sub-option')

    if (subOption.length > 0) {
        subOption.forEach((e) => {
            subCategory.removeChild(e)
        })
    }

    subList.map((e) => {
        const newSubOption = document.createElement('option')
        newSubOption.className = 'my-sub-option'
        newSubOption.value = e[0]
        newSubOption.textContent = e[1]

        subCategory.appendChild(newSubOption)

    })
}


form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const user = JSON.parse(localStorage.getItem("user"));

    const requiredInputs = document.querySelectorAll('.required-input')

    for (let i = 0; i < requiredInputs.length; i ++) {
        if (requiredInputs[i].value == '') {
            Swal.fire({
                title: '出錯了!',
                text: '你有東西忘記填了唷!',
                imageUrl: '../assest/oop.png',
                imageWidth: 400,
                imageHeight: 300,
            })
            requiredInputs[i].style.backgroundColor = '#f9c6cf'
            $("html, body").animate({
                scrollTop: $(requiredInputs[i]).offset().top }, {duration: 500,easing: "swing"});
            return false;
        }   
        requiredInputs[i].style.backgroundColor = 'white'
    }


    if ($('.my-number').val() <= 0) {
        Swal.fire({
            title: '太少啦~',
            text: '起標價格與增額不能為0或是負值',
            imageUrl: '../assest/tiny.gif',
            imageWidth: 400,
            imageHeight: 300,
        })
        $('.my-number').val() = ''
        return
    }

    if ($('.my-number').val() >= 1000000000) {
        Swal.fire({
            title: '太多啦~',
            text: '合理的價格可以提高成交率唷!',
            imageUrl: '../assest/toomuch.png',
            imageWidth: 400,
            imageHeight: 300,
        })
        $('.my-number').val() = ''
        return
    }

    if ($('#name-input').length >= 30) {
        Swal.fire({
            title: '名稱過長',
            text: '請不要超過中文15字，英文30字!',
            imageUrl: '../assest/long.png',
            imageWidth: 400,
            imageHeight: 300,
        })
        $('#name-input').val() = ''
        return
    }

    //Check if the condition radio is checked

    if ($('input:radio[name="condition"]:checked').val() == null) {
        Swal.fire({
            title: '出錯了!',
            text: '酷東西的狀況忘記填了唷!',
            imageUrl: '../assest/oop.png',
            imageWidth: 400,
            imageHeight: 300,
        })
        return
    }

    Swal.fire({
        title: 'Loading',
        imageUrl: '../assest/loading-cat.gif',
        imageWidth: 400,
        imageHeight: 200,
        timer: 2000,
        timerProgressBar: true
    })

    fetch('/api/1.0/product/upload', {
        method: 'post',
        headers: {
            Authorization: "Bearer " + user.access_token,
        },
        body: formData
    })

    .then((res)=> {
        if (res.status == 400) {
            Swal.fire({
                title: '出錯了!',
                text: '上傳資料不符合格式唷!',
                imageUrl: 'https://imgur.dcard.tw/BBYi0Wch.jpg',
                imageWidth: 400,
                imageHeight: 300,
            })
            throw new Error
        } else if(res.status != 200) {
            throw new Error
        }
        
        return res.json();
    })
    .then((res) => {
        console.log(res)
        Swal.fire({
            icon: 'success',
            title: '上傳成功',
            text: '即將轉跳到商品頁面',
        }).then(() => {
            self.location.href = `/product/details?id=${res.productId}`
        })
    })
    .catch((err) => {
        console.log(err)
        Swal.fire({
            title: 'HAIYAAA!!!',
            text: '有東西出錯了，請稍後再試',
            imageUrl: 'https://imgur.dcard.tw/BBYi0Wch.jpg',
            imageWidth: 400,
            imageHeight: 300,
        })
    })
})

const showImg = (obj) => {

    // if (obj.value = "") {
    //     $('#img').attr('src', '../assest/file-image.svg')
    // }

    verifyImgFile(obj)
    verifyImgSize(obj)

    const file=$(obj)[0].files[0];    //獲取文件信息

    if(file) {
        const reader=new FileReader();  //調用FileReader
        reader.readAsDataURL(file); //將文件讀取為 DataURL(base64)
        reader.onload=function(evt){   //讀取操作完成時觸發。
            $("#img").attr({
                src: evt.target.result,
                width: 400,
                height: 600
            })  //將img標簽的src綁定為DataURL
        };
    } else {
        $('#img').attr('src', '../assest/file-image.svg')
    }
}

const showOtherImg = (obj) => {

    const files = $(obj)[0].files;

    verifyImgFile(obj)
    verifyImgSize(obj)

    if (files) {
        for (let i = 0 ; i < 3 ; i++) {

            if (files[i]) {
                const otherFile = $(obj)[0].files[i];
                const reader = new FileReader();
                reader.readAsDataURL(otherFile)
                reader.onload=function(evt){   //讀取操作完成時觸發。
                    console.log(evt)
                    $(`#img-${i}`).attr('src',evt.target.result)  //將img標簽的src綁定為DataURL
                }   
            } else {
                $(`#img-${i}`).attr('src', '../assest/card-image.svg') 
            }
            
        }
    } 
}

const verifyImgFile = (file) => {
    const fileTypes = [".jpg", ".png"];
    const filePath = file.value;
    if(filePath){
        let isNext = false;
        const fileEnd = filePath.substring(filePath.indexOf("."));
        for (let i = 0; i < fileTypes.length; i++) {
            if (fileTypes[i] == fileEnd) {
                isNext = true;
                break;
            }
        }
        if (!isNext){
            Swal.fire({
                title: '我不能接受',
                text: '圖片僅支援JPG與PNG檔',
                imageUrl: '../assest/non-accept.png',
                imageWidth: 300,
                imageHeight: 200,
                imageAlt: 'I can not accept!',
                confirmButtonText:'知道了'
            })
            file.value = "";
            return false;
        }
    }else {
        return false;
    }
}

const verifyImgSize = (file) => {
    const fileMaxSize = 1048576; //1MB
    const filePath = file.value;
    if(filePath){

        for (let i = 0; i < file.files.length; i++) {
            if (file.files[i].size > fileMaxSize) {
                Swal.fire({
                    title: '圖檔過大',
                    text: '圖片大小請不要超過1MB',
                    imageUrl: '../assest/non-accept.png',
                    imageWidth: 300,
                    imageHeight: 200,
                    imageAlt: 'Too big',
                    confirmButtonText:'知道了'
                })
                file.value = "";
                return false;
            } 
        }
    }
}

const transTimeToDate = (timestamp) => {
    const time =  {
        yearNow: timestamp.getFullYear(),
        monthNow: timestamp.getMonth() + 1  < 10 ? "0"+(timestamp.getMonth()+1): (timestamp.getMonth() + 1),
        dateNow: timestamp.getDate() < 10 ? "0"+(timestamp.getDate()) : (timestamp.getDate()),
        hourNow: timestamp.getHours() < 10 ? "0"+(timestamp.getHours()) : (timestamp.getHours()),
        minNow: timestamp.getMinutes() < 10 ? "0"+(timestamp.getMinutes()) : (timestamp.getMinutes()),
        secNow: "00"
    }

    return `${time.yearNow}-${time.monthNow}-${time.dateNow}T${time.hourNow}:${time.minNow}:${time.secNow}`
}

//Set the default and minimum time of auction end time
const timeInput = document.querySelector('#my-time-input')
// const timestamp = new Date(Date.now() + 60*60*1000);
const minTimestamp = new Date(Date.now() + 60*60*1000);
const maxTimestamp = new Date(Date.now() + 7*24*60*60*1000);
const minTime = transTimeToDate(minTimestamp)
const maxTime = transTimeToDate(maxTimestamp)

timeInput.value = minTime
timeInput.min = minTime
timeInput.max = maxTime

//Limit the length of name with 2 time length of chinese input
const checkNameLength = (input, maxLength) => {
    let length = 0;
    for(let i=0 ; i<input.value.length; i++) {
        if (/[\u4e00-\u9fa5]/.test(input.value[i])) {
            length+=2;
        } else {
            length++;
        }
        if (length > maxLength) {
            input.value = input.value.substr(0,i);
            Swal.fire({
                title: '名稱過長',
                text: `請不要超過${maxLength/2}中文字，英文${maxLength}字!`,
                imageUrl: '../assest/long.png',
                imageWidth: 400,
                imageHeight: 300,
            })
            break;
        }
    }
};
