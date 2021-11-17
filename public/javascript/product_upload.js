const button = document.querySelector('.upload')
const form = document.querySelector('.product-upload')
const selectList = document.querySelector('.my-category-select');

if (!user || !user.user) {
    Swal.fire({
      imageUrl: '../assest/more.jpg',
      imageWidth: 400,
      imageHeight: 300,
      title: '下標前請登入',
      text: '登入以享受更多競標的樂趣！',
      confirmButtonText: '知道了'
    }).then(() => {
      window.location.href = "/user/signin";
    });
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

    if ($('.my-number').val() <= 0) {
        Swal.fire({
            title: 'HAIYAAA!!!',
            text: '數字不能為0或是負值',
            imageUrl: 'https://imgur.dcard.tw/BBYi0Wch.jpg',
            imageWidth: 400,
            imageHeight: 300,
        })
        return
    }
    
    if ($('.required-input').val() == undefined) {
        Swal.fire({
            title: 'HAIYAAA!!!',
            text: '數字不能為0或是負值',
            imageUrl: '../assest/oop.png',
            imageWidth: 400,
            imageHeight: 300,
        })
        return
    }

    console.log(user)
    console.log(formData)

    let timerInterval
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
                title: 'HAIYAAA!!!',
                text: '上傳資料不符合格式唷!',
                imageUrl: 'https://imgur.dcard.tw/BBYi0Wch.jpg',
                imageWidth: 400,
                imageHeight: 300,
            })
            throw error
        } else if(res.status != 200) {
            throw error
        }
        
        return res.json();
    })
    .then((res) => {
        console.log(res)
        Swal.fire({
            title: '上傳成功',
            text: 'Rick為你高興到開始跳舞',
            imageUrl: '../assest/rick-roll-rick-ashley.gif',
            imageWidth: 400,
            imageHeight: 500,
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

    const trueFile = verifyImgFile(obj)
    const trueSize = verifyImgSize(obj)

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
    }
}

const showOtherImg = (obj) => {

    const file = $(obj)[0].files[0];
    const files = $(obj)[0].files;

    if (files) {

        for (let i = 0 ; i < files.length ; i++) {
            const otherFile = $(obj)[0].files[i];
            const reader = new FileReader();
            reader.readAsDataURL(otherFile)
            reader.onload=function(evt){   //讀取操作完成時觸發。
                console.log(evt)
                $(`#img-${i}`).attr('src',evt.target.result)  //將img標簽的src綁定為DataURL
            } 
        };
    }
}

const verifyImgFile = (file) => {
    const fileTypes = [".jpg", ".png"];
    const filePath = file.value;
    if(filePath){
        let isNext = false;
        const fileEnd = filePath.substring(filePath.indexOf("."));
        for (var i = 0; i < fileTypes.length; i++) {
            if (fileTypes[i] == fileEnd) {
                isNext = true;
                break;
            }
        }
        if (!isNext){
            Swal.fire({
                title: '我不能接受',
                text: '圖片僅支援JPG與PNG檔',
                imageUrl: 'https://s3.ap-northeast-1.amazonaws.com/node.js-image-bucket/myicon/non-accept.png',
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
    let fileSize = 0;
    const fileMaxSize = 2000000; //2M
    const filePath = file.value;
    if(filePath){
        fileSize = file.files[0].size;
        if (fileSize > fileMaxSize) {
            Swal.fire({
                title: '你的很大',
                text: '圖片大小請不要超過2MB',
                imageUrl: 'https://s3.ap-northeast-1.amazonaws.com/node.js-image-bucket/myicon/over-size.jpg',
                imageWidth: 400,
                imageHeight: 300,
                imageAlt: 'Too big',
                confirmButtonText:'我有其他的 file style!'
            })
            file.value = "";
            return false;
        }
    } else{
        return false;
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
const minTimestamp = new Date(Date.now());
const maxTimestamp = new Date(Date.now() + 7*24*60*60*1000);
const minTime = transTimeToDate(minTimestamp)
const maxTime = transTimeToDate(maxTimestamp)

console.log(minTime)
console.log(maxTime)


timeInput.value = minTime
timeInput.min = minTime
timeInput.max = maxTime