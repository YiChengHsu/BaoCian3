const button = document.querySelector('.upload')
const form = document.querySelector('.product-upload')
const selectList = document.querySelector('.my-category-select');

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

//Set the default and minimum time of auction end time
const timeInput = document.querySelector('#my-time-input')
// const timeHourAfter = new Date(Date.now() + 60*60*1000);
const timeHourAfter = new Date(Date.now());
const minTime = {
    yearNow: timeHourAfter.getFullYear(),
    monthNow: timeHourAfter.getMonth() + 1  < 10 ? "0"+(timeHourAfter.getMonth()+1): (timeHourAfter.getMonth() + 1),
    dateNow: timeHourAfter.getDate() < 10 ? "0"+(timeHourAfter.getDate()) : (timeHourAfter.getDate()),
    hourNow: timeHourAfter.getHours() < 10 ? "0"+(timeHourAfter.getHours()) : (timeHourAfter.getHours()),
    minNow: timeHourAfter.getMinutes() < 10 ? "0"+(timeHourAfter.getMinutes()) : (timeHourAfter.getMinutes()),
    secNow: "00"
}

const minDateTime = `${minTime.yearNow}-${minTime.monthNow}-${minTime.dateNow}T${minTime.hourNow}:${minTime.minNow}:${minTime.secNow}`

timeInput.value = minDateTime
timeInput.min = minDateTime


button.addEventListener('click', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const user = JSON.parse(localStorage.getItem("user"));

    console.log(user)
    console.log(formData)

    fetch('/api/1.0/product/upload', {
        method: 'post',
        headers: {
            Authorization: "Bearer " + user.access_token,
        },
        body: formData
    })

    .then((res)=> {
        if(res.status != 200) {
            throw error
        }
        
        return res.json();
    })
    .then((res) => {
        alert("上傳成功")
        self.location.href = `/product/details?id=${res.productId}`
    })
    .catch((err) => {
        console.log(err)
        alert('伺服器忙碌中，請稍後再試。')
    })
})

const showImg = (obj) => {

    // const trueFile = verifyImgFile(obj)
    // const trueSize = verifyImgSize(obj)

    // if (!trueFile || !trueSize) {
    //     alert('請再試一次！')
    //     return
    // }

    const file=$(obj)[0].files[0];    //獲取文件信息

    if(file) {
        const reader=new FileReader();  //調用FileReader
        reader.readAsDataURL(file); //將文件讀取為 DataURL(base64)
        reader.onload=function(evt){   //讀取操作完成時觸發。
            $("#img").attr('src',evt.target.result)  //將img標簽的src綁定為DataURL
        };
    }
    else{
        alert("上傳失敗");
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
            alert('不接受此檔案型別');
            file.value = "";
            return false;
        }
    }else {
        return false;
    }
}

const verifyImgSize = (file) => {
    let fileSize = 0;
    const fileMaxSize = 2048; //2M
    const filePath = file.value;
    if(filePath){
        fileSize = file.files[0].size;
        const size = fileSize / 1024;
        if (size > fileMaxSize) {
            alert("照片檔案大小不能超過2MB！");
            file.value = "";
            return false;
        }
    } else{
        return false;
    }
}