const url = "/api/1.0/user/profile";

let params = location.search;

console.log(params)

if (!user || !user.user) {
  Swal.fire({icon: "warning", title: "請登入", text: "使用個人管理功能請先登入"}).then(() => {
    window.location.href = "/user/signin";
  });
}

$("#twzipcode").twzipcode({
  zipcodeIntoDistrict: true, // 郵遞區號自動顯示在區別選單中
  css: [
    "city form-control address-input", "town form-control address-input"
  ], // 自訂 "城市"、"地別" class 名稱
  countyName: "city", // 自訂城市 select 標籤的 name 值
  districtName: "town", // 自訂區別 select 標籤的 name 值
});

$(".city").attr("disabled", true);
$(".town").attr("disabled", true);

$(document).ready(function () {
  $(".js-example-basic-single").select2();
});

$(".avatar").attr("src", user.user.picture);
$(".user-id").text(user.user.user_id);
$(".user-name").text(user.user.name);
$(".user-email").text(user.user.email);


fetch(url + params, {
  method: "get",
  headers: {
    Authorization: "Bearer " + user.access_token
  }
}).then((res) => res.json()).then((res) => {
  console.log(res);

	const data = res.data
  const list = res.data.list;

  if (res.data.user.rating != null) { 
		$('#star').raty({score: data.user.rating, readOnly: true});
    $("#user-rating").text(`平均評分：${data.user.rating.toFixed(2)}`);
  } else {
    $("#user-rating").text("尚未評分");
  }

  $("#twzipcode").twzipcode("set", {
    county: data.user.city,
    district: data.user.town,
    zipcode: Number(data.user.zipcode)
  });
  
  $(".address").val(data.user.address);
  $(".receiver").val(data.user.receiver);
  $(".phone").val(data.user.phone);
  $(".bank-account").val(data.user.bank_code).trigger("change");
  $(".bank-account").val(data.user.bank_account);
  $(".account-name").val(data.user.account_name);

  console.log(data.user)

  if (data.user.address == null || data.user.address == '' ) {
    Swal.fire({icon: "warning", title: "缺少收件資訊", text: "可能得標後許處理，請盡速處理！"})
  }

  list.map((e) => {
    const id = e.id;
    const imgUrl = `https://s3.ap-northeast-1.amazonaws.com/node.js-image-bucket/${
      e.main_image
    }`;

    $(document).ready(function () {
      $("<div/>", {
          class: `row align-middle mb-3 text-center border border-1 rounded justify-content-end`,
          id: `my-row-${id}`
        }).appendTo(".my-list-container");

        $("<a/>", {
          class: `col-md-2 me-4 my-img-div`,
          href: `http://localhost:3000/product/details?id=${id}`,
          id: `my-img-link-${id}`
        }).appendTo(`#my-row-${id}`);

        $("<div/>", {
          class: `col-md-2 p-2 my-img-div my-img-div`,
          id: `my-img-${id}`
        }).appendTo(`my-img-link-${id}`);
        $(`#my-img-link-${id}`).css("background-image", `url('${imgUrl}')`);

        $("<div/>", {
          class: "col-2 align-middle my-auto",
          id: `my-title-${id}`
        }).appendTo(`#my-row-${id}`);
        $("<h6/>").text(e.title).appendTo(`#my-title-${id}`);

        $("<div/>", {
          class: "col-2 align-middle my-auto",
          id: `my-price-${id}`
        }).appendTo(`#my-row-${id}`);
        $("<h6/>").text(e.total).appendTo(`#my-price-${id}`);

        const endTime = tranTimestamp(e.end_time)

        $("<div/>", {
          class: "col-2 align-middle my-auto text-center",
          id: `my-endTime-${id}`
        }).appendTo(`#my-row-${id}`);
        $("<h6/>").html(`${endTime.year}<br>${endTime.month}/${endTime.date}<br>${endTime.hours}:${endTime.minutes}`).appendTo(`#my-endTime-${id}`);

        $("<div/>", {
          class: "col-2 align-middle my-auto",
          id: `my-status-${id}`
        }).appendTo(`#my-row-${id}`);

        $("<div/>", {
          class: "col-2 align-middle my-auto",
          id: `my-button-div-${id}`
        }).appendTo(`#my-row-${id}`);

        switch (e.status) {
          case 0:

            Swal.fire({
              title:"付款提醒",
              icon: 'warning',
              text:"尚有得標商品未結帳，請盡速結帳以免影響權益！",
              confirmButtonText: '知道了'
            })

            const payDeadline = tranTimestamp(e.pay_deadline)

            $("<h6/>").text("待付款").appendTo(`#my-status-${id}`);
            $("<h6/>").html(`付款期限:<br><b>${payDeadline.year}<br>${payDeadline.month}/${payDeadline.date}<br>${payDeadline.hours}:${payDeadline.minutes}</b>`).appendTo(`#my-status-${id}`);

            if (e.seller_id == userId) {
              return
            }

            $("<button/>", {
              class: "btn btn-block btn-primary mb-2",
              id: `my-pay-button-${id}`,
              text: "付款",
              type: "button"
            }).appendTo(`#my-button-div-${id}`);

            $(`#my-pay-button-${id}`).click(() => {
              fetch("/api/1.0/order/payment", {
                method: "post",
                headers: {
                  Authorization: "Bearer " + user.access_token,
                  "content-type": "application/json"
                },
                body: JSON.stringify(
                  {
                    title: e.title,
                    price: e.price,
                    orderId: e.order_id,
                    image: imgUrl,
                    customerEmail: user.user.email
                  }
                )
              }).then((res) => res.json()).then((res) => {
                console.log(res);
                self.location.href = res.payUrl;
              });
            });
            break;
          case 1:

            $("<h6/>").text("已付款").appendTo(`#my-status-${id}`);

            if (e.seller_id != userId) {
              return
            }

            $("<button/>", {
              class: "btn btn-block btn-info mb-2",
              id: `deliverInfo-button-${id}`,
              text: "寄送資訊",
            }).appendTo(`#my-button-div-${id}`);

            $(`#deliverInfo-button-${id}`).click(()=> {
              fetch(`/api/1.0/user/address?id=${e.buyer_id}}`, {
                method: 'get',
                headers: {
                  Authorization: "Bearer " + user.access_token,
                }
              }).then(res => res.json())
              .then((res) => { 
                const data = res.data
                if (data.address == null || data.receiver == null ) {
                  Swal.fire({
                    title: '缺少資料',
                    icon: 'warning',
                    html:`目前缺乏買家收件資料，<br>已通知買家盡速補齊，請見諒！`,
                    confirmButtonText: '知道了'
                  })
                  return
                }

                Swal.fire({
                  title: '寄送地址',
                  html:`<b>${data.zipcode}  ${data.city} ${data.town} <br> ${data.address} <br> ${data.receiver}  ${data.phone}</b> `,
                  confirmButtonText: '知道了'
                })
              })
            })

            $("<button/>", {
              class: "btn btn-block btn-success mb-2",
              id: `deliver-button-${id}`,
              text: "寄送",
            }).appendTo(`#my-button-div-${id}`);

            $(`#deliver-button-${id}`).click( async () => {
              const { value: delivery } = await Swal.fire({
                title: '請輸入寄件編號',
                input: 'text',
                inputLabel: '寄件編號',
                showCancelButton: true,
                inputValidator: (value) => {
                  if (!value) {
                    return '若無寄件編號無法確認出貨!'
                  }
                }
              })

              fetch("/api/1.0/order/update", {
                method: "PATCH",
                headers: {
                  Authorization: "Bearer " + user.access_token,
                  "content-type": "application/json"
                },
                body: JSON.stringify(
                  {orderId: e.order_id, status: e.status, delivery: delivery}
                )
              }).then((res) => {
                Swal.fire({icon: "success", title: "寄送成功", text: "請等候買家確認訂單！"});
                $(`#deliver-button-${id}`).attr('disabled', true).text('已寄送')
              })
            }); 
            break;
          case 2:

            $("<h6/>").html(`<p>已寄送<br>寄件編號:<br><b>${e.delivery }</b></p>`).appendTo(`#my-status-${id}`);

            if (e.seller_id == userId) {
              return
            }

            $("<button/>", {
              class: "btn btn-block btn-success mb-2",
              id: `confirm-button-${id}`,
              text: "確認商品",
              type: "button"
            }).appendTo(`#my-button-div-${id}`);

            $(`#confirm-button-${id}`).click(() => {
              fetch("/api/1.0/order/update", {
                method: "PATCH",
                headers: {
                  Authorization: "Bearer " + user.access_token,
                  "content-type": "application/json"
                },
                body: JSON.stringify(
                  {orderId: e.order_id, status: e.status}
                )
              }).then((res) => {
                Swal.fire({icon: "success", title: "確認成功", text: "可於「已完成」訂單介面進行評分"});
								$(`#confirm-button-${id}`).attr('disabled', true).text('已確認')
              })
            });
            break;
          case 3:

            $("<h6/>").text("確認收貨").appendTo(`#my-status-${id}`);

            $("<button/>", {
              class: "btn btn-block btn-warning",
              id: `my-rate-button-${id}`,
              text: "評分",
              'data-bs-toggle': "modal",
              'data-bs-target': "#exampleModal",
              'data-bs-whatever': "@mdo"
            }).appendTo(`#my-button-div-${id}`);


            $('<div/>', {
              id: `start-${id}`,
            }).raty({
              click: function (score) {
                rating = score
              }
            }).appendTo('#star-form')

            $('#send-button').click( async () => {

              console.log(rating)

              fetch("/api/1.0/user/rating", {
                method: "post",
                headers: {
                  Authorization: "Bearer " + user.access_token,
                  "content-type": "application/json"
                },
                body: JSON.stringify(
                  {ratedId: e.seller_id, orderId: e.order_id, rating: rating}
                )
              }).then((res) => {
								if(res.status == 400) {
									Swal.fire({icon: "error", title: "重複評分", text: "已經評分過了唷~"})
                  $(`#my-rate-button-${id}`).attr('disabled', true);
									return
								}
								Swal.fire({icon: "success", title: "評分成功", text: "感謝您的回饋！"});
								$(`#my-rate-button-${id}`).attr('disabled', true)
              })
						})
						break;
    				default : 
              $("<a/>", {
                id: `my-watch-product-${id}`,
                href: `/product/details?id=${id}`
              }).appendTo(`#my-button-div-${id}`);

            $("<button/>", {
              class: "btn btn-block btn-primary",
              text: "去看看"
            }).appendTo(`#my-watch-product-${id}`);
          }
        });});}).catch((err) => {console.log(err);
        // self.location.href = "/user/signin";
      });

$('.my-address-button').click(() => {
	$(".address-input").attr("disabled", false);
	$(".my-address-button").css("display", "none");
	$(".change-address-button").css("display", "inline");
	$(".cancel-address-button").css("display", "inline");
});
	
$(".my-bank-button").click(() => {
	$(".bank-input").attr("disabled", false);
	$(".my-bank-button").css("display", "none");
	$(".change-bank-button").css("display", "inline");
	$(".cancel-bank-button").css("display", "inline");
});

$(".cancel-address-button").click(() => {
	$(".address-input").attr("disabled", true);
	$(".change-address-button").css("display", "none");
	$(".cancel-address-button").css("display", "none");
	$(".my-address-button").css("display", "inline");
});

$(".cancel-bank-button").click(() => {
	$(".bank-input").attr("disabled", true);
	$(".change-bank-button").css("display", "none");
	$(".cancel-bank-button").css("display", "none");
	$(".my-bank-button").css("display", "inline");
});

$(".change-address-button").click((e) => {
	e.preventDefault();

	const form = document.querySelector("#address-form");
	const formData = new FormData(form);

	fetch("/api/1.0/user/address", {
		method: "post",
		headers: {
			Authorization: "Bearer " + user.access_token
		},
		body: formData
	}).then((res) => {
		if (res.status != 200) {
			throw error;
		}
		Swal.fire({icon: "success", title: "更改成功"});
		$(".address-input").attr("disabled", true);
		$(".change-address-button").css("display", "none");
		$(".cancel-address-button").css("display", "none");
		$(".my-address-button").css("display", "inline");
	}).catch((error) => {
		Swal.fire({icon: "error", title: "更改失敗", text: "請再試一次"});
	});
});

$(".change-bank-button").click((e) => {
	e.preventDefault();

	const form = document.querySelector("#bank-form");
	const formData = new FormData(form);

	fetch("/api/1.0/user/account", {
  	method: "post",
  	headers: {
    Authorization: "Bearer " + user.access_token
  	},
  	body: formData
	}).then((res) => {
  	formData.forEach((value, key) => {
    console.log("key %s: value %s", key, value);
  });

  if (res.status != 200) {
    throw error;
  }
  Swal.fire({icon: "success", title: "更改成功"});
  $(".bank-input").attr("disabled", true);
  $(".change-bank-button").css("display", "none");
  $(".cancel-bank-button").css("display", "none");
  $(".my-bank-button").css("display", "inline");
	}).catch((error) => {
  	Swal.fire({icon: "error", title: "更改失敗", text: "請再試一次"});
	});
});

const tranTimestamp = (timestamp) => {

  const time = new Date(timestamp);

  const year = time.getFullYear();
  const month = time.getMonth() + 1;
  const date = time.getDate();
  let hours = time.getHours();
  let minutes = time.getMinutes();
  if (hours < 10) {
    hours = `0${hours}`;
  }
  if (minutes < 10) {
    minutes = `0${minutes}`;
  }
  return { year, month, date, hours, minutes}
}
