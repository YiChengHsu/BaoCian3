// Make sure the password are the same
const form = document.querySelector("#signup-form");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(form);

  Swal.fire({
    title: "Loading",
    imageUrl: "../assest/loading-cat.gif",
    imageWidth: 400,
    imageHeight: 200,
    timer: 2000,
    timerProgressBar: true
  });

  fetch("/api/1.0/user/signup", {
    method: "post",
    body: formData
  }).then((res) => {
    if (res.status == 403) {
      Swal.fire({
        title: "Email已存在",
        text: "你是忘記了，還是還怕想起來",
        imageUrl: "../assest/oop.png",
        imageWidth: 400,
        imageHeight: 300
      });
      throw new Error();
    } else if (res.status == 400) {
      Swal.fire({
        title: "Email不符合格式",
        text: "好好輸入唷！不然我跟老師說",
        imageUrl: "../assest/oop.png",
        imageWidth: 400,
        imageHeight: 300
      });
      throw new Error();
    } else if (res.status == 500) {
      throw new Error();
    }

    return res.json();
  }).then((res) => {
    const data = res.data;
    localStorage.setItem("user", JSON.stringify(data));
    Swal.fire({
      title: "註冊成功",
      text: "歡迎加入Rick Roll的行列",
      icon: 'success'
    }).then(() => {
      self.location.href = "/user/profile";
    });
  }).catch((err) => {
    console.log(err);
  });
});

const showImg = (obj) => {
  verifyImgFile(obj);
  verifyImgSize(obj);

  const file = $(obj)[0].files[0]; // 獲取文件信息

  if (file) {
    const reader = new FileReader(); // 調用FileReader
    reader.readAsDataURL(file); // 將文件讀取為 DataURL(base64)
    reader.onload = function (evt) { // 讀取操作完成時觸發。
      $("#img").attr({src: evt.target.result, width: 150, height: 150}); // 將img標簽的src綁定為DataURL
    };
  } else {
    $("#img").attr("src", "../assest/user_default.png");
  }
};

const verifyImgFile = (file) => {
  const fileTypes = [".jpg", ".png"];
  const filePath = file.value;
  if (filePath) {
    let isNext = false;
    const fileEnd = filePath.substring(filePath.indexOf("."));
    for (let i = 0; i < fileTypes.length; i++) {
      if (fileTypes[i] == fileEnd) {
        isNext = true;
        break;
      }
    }
    if (! isNext) {
      Swal.fire({
        title: "我不能接受",
        text: "圖片僅支援JPG與PNG檔",
        imageUrl: "../assest/non-accept.png",
        imageWidth: 300,
        imageHeight: 200,
        imageAlt: "I can not accept!",
        confirmButtonText: "知道了"
      });
      file.value = "";
      return false;
    }
  } else {
    return false;
  }
};

const verifyImgSize = (file) => {
  const fileMaxSize = 1000000; // 2M
  const filePath = file.value;
  if (filePath) {
    for (let i = 0; i < file.files.length; i++) {
      if (file.files[i].size > fileMaxSize) {
        Swal.fire({
          title: "圖檔過大",
          text: "圖片大小請不要超過1MB",
          imageUrl: "../assest/non-accept.png",
          imageWidth: 300,
          imageHeight: 200,
          imageAlt: "Too big",
          confirmButtonText: "知道了"
        });
        file.value = "";
        return false;
      }
    }
  }
};

const checkNameLength = (input, maxLength) => {
  let length = 0;
  for (let i = 0; i < input.value.length; i++) {
    if (/[\u4e00-\u9fa5]/.test(input.value[i])) {
      length += 2;
    } else {
      length++;
    }
    if (length > maxLength) {
      input.value = input.value.substr(0, i);
      Swal.fire({
        title: "名稱過長",
        text: `請不要超過${
          maxLength / 2
        }中文字，英文${maxLength}字!`,
        imageUrl: "../assest/long.png",
        imageWidth: 400,
        imageHeight: 300
      });
      break;
    }
  }
};
