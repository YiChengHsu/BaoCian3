const url = "/api/1.0/user/profile";

let params = location.search;

if (!user || !user.user) {
	Swal.fire({
		icon: "warning",
		title: "請登入",
		text: "使用個人管理功能請先登入",
	}).then(() => {
		window.location.href = "/user/signin";
	});
}

$("#twzipcode").twzipcode({
	zipcodeIntoDistrict: true, // 郵遞區號自動顯示在區別選單中
	css: ["city form-control address-input", "town form-control address-input"], // 自訂 "城市"、"地別" class 名稱
	countyName: "city", // 自訂城市 select 標籤的 name 值
	districtName: "town", // 自訂區別 select 標籤的 name 值
});

$(".city").attr("disabled", true);
$(".town").attr("disabled", true);

$(document).ready(function () {
	$(".js-example-basic-single").select2();
});

$(".avatar").attr(
	"src",
	"https://s3.ap-northeast-1.amazonaws.com/node.js-image-bucket/" +
		user.user.picture
);
$(".user-id").text(user.user.user_id);
$(".user-name").text(user.user.name);
$(".user-email").text(user.user.email);

fetch(url + params, {
	method: "get",
	headers: {
		Authorization: "Bearer " + user.access_token,
	},
})
	.then((res) => res.json())
	.then((res) => {
		console.log(res);

		const list = res.data.list;

		if (res.data.user.rating != null) {
			// $('#star').raty({score: res.data.user.rating, readOnly: true});
			$("#user-rating").text(res.data.user.rating);
		} else {
			$("#user-rating").text("尚未評分");
		}

		$("#twzipcode").twzipcode("set", {
			county: user.city,
			district: user.town,
			zipcode: Number(user.zipcode),
		});

		$(".address").val(user.address);
		$(".receiver").val(user.receiver);
		$(".phone").val(user.phone);
		$(".bank-account").val(user.bank_code).trigger("change");
		$(".bank-account").val(user.bank_account);
		$(".account-name").val(user.account_account);

		list.map((e) => {
			const id = e.id;
			const imgUrl = `https://s3.ap-northeast-1.amazonaws.com/node.js-image-bucket/${e.main_image}`;

			$(document).ready(function () {
				$("<div/>", {
					class: `row align-middle mb-3 text-center border border-1 rounded`,
					id: `my-row-${id}`,
				}).appendTo(".my-list-container");

				$("<a/>", {
					class: `col-md-2 p-2 my-img-div`,
					href: `http://localhost:3000/product/details?id=${id}`,
					id: `my-img-link-${id}`,
				}).appendTo(`#my-row-${id}`);

				$("<div/>", {
					class: `col-md-2 p-2 my-img-div my-img-div`,
					id: `my-img-${id}`,
				}).appendTo(`my-img-link-${id}`);
				$(`#my-img-link-${id}`).css("background-image", `url('${imgUrl}')`);

				$("<div/>", {
					class: "col-2 align-middle my-auto",
					id: `my-title-${id}`,
				}).appendTo(`#my-row-${id}`);
				$("<h5/>").text(e.title).appendTo(`#my-title-${id}`);

				$("<div/>", {
					class: "col-2 align-middle my-auto",
					id: `my-price-${id}`,
				}).appendTo(`#my-row-${id}`);
				$("<h5/>").text(e.total).appendTo(`#my-price-${id}`);

				const time = new Date(e.end_time);
				const year = time.getFullYear();
				const month = time.getMonth() + 1;
				const date = time.getDate();
				let hours = time.getHours();
				if (hours < 10) {
					hours = `0${hours}`;
				}
				let minutes = time.getMinutes();
				if (minutes < 10) {
					minutes = `0${minutes}`;
				}

				$("<div/>", {
					class: "col-2 align-middle my-auto text-center",
					id: `my-endTime-${id}`,
				}).appendTo(`#my-row-${id}`);
				$("<h5/>")
					.html(`${year}<br>${month}/${date}<br>${hours}:${minutes}`)
					.appendTo(`#my-endTime-${id}`);

				$("<div/>", {
					class: "col-2 align-middle my-auto",
					id: `my-status-${id}`,
				}).appendTo(`#my-row-${id}`);

				$("<div/>", {
					class: "col-2 align-middle my-auto",
					id: `my-button-div-${id}`,
				}).appendTo(`#my-row-${id}`);

				switch (e.status) {
					case 0:
						$("<h5/>").text("待付款").appendTo(`#my-status-${id}`);

						$("<button/>", {
							class: "btn btn-block btn-primary mb-2",
							id: `my-pay-button-${id}`,
							text: "付款",
							type: "button",
						}).appendTo(`#my-button-div-${id}`);

						$(`#my-pay-button-${id}`).click(() => {
							fetch("/api/1.0/order/payment", {
								method: "post",
								headers: {
									Authorization: "Bearer " + user.access_token,
									"content-type": "application/json",
								},
								body: JSON.stringify({
									title: e.title,
									price: e.price,
									orderId: e.order_id,
									image: imgUrl,
									customerEmail: user.user.email,
								}),
							})
								.then((res) => res.json())
								.then((res) => {
									console.log(res);
									self.location.href = res.payUrl;
								});
						});
						break;
					case 1:
						$("<h5/>").text("已付款").appendTo(`#my-status-${id}`);
						$("<button/>", {
							class: "btn btn-block btn-secondary mb-2",
							id: `my-pay-button-${id}`,
							text: "寄送中",
							disabled: "true",
						}).appendTo(`#my-button-div-${id}`);
						break;
					case 2:
						$("<h5/>").text("寄送中").appendTo(`#my-status-${id}`);
						$("<button/>", {
							class: "btn btn-block btn-success mb-2",
							id: `confirm-button-${id}`,
							text: "完成訂單",
							type: "button",
						}).appendTo(`#my-button-div-${id}`);

						$(`#confirm-button-${id}`).click(() => {
							fetch("/api/1.0/order/update", {
								method: "PATCH",
								headers: {
									Authorization: "Bearer " + user.access_token,
									"content-type": "application/json",
								},
								body: JSON.stringify({
									orderId: e.order_id,
									status: e.status,
								}),
							})
								.then((res) => console.log(res))
						});
						break;
					case 3:
						$("<h5/>").text("完成訂單").appendTo(`#my-status-${id}`);
						$("<button/>", {
							class: "btn btn-block btn-warning",
							id: `my-rate-button-${id}`,
							text: "評分",
						}).appendTo(`#my-button-div-${id}`);

						$(`#my-rate-button-${id}`).click( async ()=> {
							$('#star2').raty({ score: 3 })
							const {value: rating} = await Swal.fire({
								title: '請為這次交易評分', 
								html: $('<div>').attr('id', 'star2').text('評分看看')
							})
							$('#star2').raty({ score: 3 })
						})

						break;
					default:
						$("<a/>", {
							id: `my-watch-product-${id}`,
							href: `/product/details?id=${id}`,
						}).appendTo(`#my-button-div-${id}`);

						$("<button/>", {
							class: "btn btn-block btn-primary",
							text: "去看看",
						}).appendTo(`#my-watch-product-${id}`);
				}
			});
		});
	})
	.catch((err) => {
		console.log(err);
		// self.location.href = "/user/signin";});$('.my-address-button').click(() => {
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
			Authorization: "Bearer " + user.access_token,
		},
		body: formData,
	})
		.then((res) => {
			if (res.status != 200) {
				throw error;
			}
			Swal.fire({ icon: "success", title: "更改成功" });
			$(".address-input").attr("disabled", true);
			$(".change-address-button").css("display", "none");
			$(".cancel-address-button").css("display", "none");
			$(".my-address-button").css("display", "inline");
		})
		.catch((error) => {
			Swal.fire({ icon: "error", title: "更改失敗", text: "請再試一次" });
		});
});
$(".change-bank-button").click((e) => {
	e.preventDefault();

	const form = document.querySelector("#bank-form");
	const formData = new FormData(form);

	fetch("/api/1.0/user/account", {
		method: "post",
		headers: {
			Authorization: "Bearer " + user.access_token,
		},
		body: formData,
	})
		.then((res) => {
			formData.forEach((value, key) => {
				console.log("key %s: value %s", key, value);
			});
			if (res.status != 200) {
				throw error;
			}
			Swal.fire({ icon: "success", title: "更改成功" });
			$(".bank-input").attr("disabled", true);
			$(".change-bank-button").css("display", "none");
			$(".cancel-bank-button").css("display", "none");
			$(".my-bank-button").css("display", "inline");
		})
		.catch((error) => {
			Swal.fire({ icon: "error", title: "更改失敗", text: "請再試一次" });
		});
});
