const url = "/api/1.0/user/profile"

let params = location.search

if (params.length == 0) {
	params = "?type=order"
}

if (!user || !user.user) {
	Swal.fire({
		icon: "warning",
		title: "請登入",
		text: "登入之後才能查看個人頁面唷！",
		confirmButtonText: "知道了",
	}).then(() => {
		window.location.href = "/user/signin"
	})
}

$("#twzipcode").twzipcode({
	zipcodeIntoDistrict: true, 
	css: ["city form-control address-input", "town form-control address-input"], 
	countyName: "city",
	districtName: "town", 
})

$(".city").attr("disabled", true)
$(".town").attr("disabled", true)

$(document).ready(function () {
	$(".js-example-basic-single").select2()
})

$(".avatar").attr("src", user.user.picture)
$(".user-id").text(user.user.user_id)
$(".user-name").text(user.user.name)
$(".user-email").text(user.user.email)

//Set the active tab of order
const activeTab = params.split("&paging=")[0].split("=")[2]

if (activeTab) {
	document.querySelector(`#tab-${activeTab}`).classList.add("active")
} else if (params.split("&paging=")[0].split("=")[1] == "sell") {
	document.querySelector("#tab-sell").classList.add("active")
} else {
	document.querySelector("#tab").classList.add("active")
}

fetch(url + params, {
	method: "get",
	headers: {
		Authorization: "Bearer " + user.access_token,
	},
})
	.then((res) => res.json())
	.then((res) => {
		const data = res.data
		const user = res.user

		if (res.user.rating != null) {
			const rating = parseInt(res.user.rating)
			$("#star").raty({ score: rating, readOnly: true })
			$("#user-rating").text(`平均評分：${rating.toFixed(2)}`)
		} else {
			$("#user-rating").text("尚未評分")
		}

		$("#twzipcode").twzipcode("set", {
			county: user.city,
			district: user.town,
			zipcode: Number(user.zipcode),
		})

		$(".address").val(user.address)
		$(".receiver").val(user.receiver)
		$(".phone").val(user.phone)
		$(".bank-account").val(user.bank_code).trigger("change")
		$(".bank-account").val(user.bank_account)
		$(".account-name").val(user.account_name)

		if (user.address == null || user.address == "") {
			Swal.fire({
				title: "缺少收件資訊",
				text: "可能影響得標後續處理，請盡速填寫！",
				icon: "warning",
				confirmButtonText: "知道了",
			})
		}

		if (params.split("=")[1] == "sell" && (user.account_name == null || user.bank_account == null || user.bank_code == "000")) {
			Swal.fire({
				title: "缺少轉帳資訊",
				text: "可能影響賣家後續處理，請盡速填寫！",
				icon: "warning",
				confirmButtonText: "知道了",
			})
		}

		data.map((e) => {
			const id = e.id
			const imgUrl = `https://s3.ap-northeast-1.amazonaws.com/node.js-image-bucket/${e.main_image}`

			$(document).ready(function () {
				$("<div/>", {
					class: `row align-middle justify-content-center text-center list-container my-3`,
					id: `my-row-${id}`,
				}).appendTo(".my-list-container")

				$("<a/>", {
					class: `col-2 my-img-div rounded`,
					href: `/product/details?id=${id}`,
					id: `my-img-link-${id}`,
				}).appendTo(`#my-row-${id}`)

				$("<div/>", {
					class: `w-100 my-img-div my-img-div rounded rounded-3`,
					id: `my-img-${id}`,
				}).appendTo(`my-img-link-${id}`)
				$(`#my-img-link-${id}`).css("background-image", `url('${imgUrl}')`)

				$("<div/>", {
					class: "col-2 p-2 align-middle my-auto",
					id: `my-title-${id}`,
				}).appendTo(`#my-row-${id}`)
				$("<h6/>").text(e.title).appendTo(`#my-title-${id}`)

				$("<div/>", {
					class: "col-1 p-2 align-middle my-auto",
					id: `my-price-${id}`,
				}).appendTo(`#my-row-${id}`)
				$("<h6/>").text(e.total).appendTo(`#my-price-${id}`)

				const endTime = tranTimestamp(e.end_time)

				$("<div/>", {
					class: "col-2 p-2 align-middle my-auto text-center",
					id: `my-endTime-${id}`,
				}).appendTo(`#my-row-${id}`)
				$("<h6/>").html(`${endTime.year}/${endTime.month}/${endTime.date}<br>${endTime.hours}:${endTime.minutes}`).appendTo(`#my-endTime-${id}`)

				$("<div/>", {
					class: "col-2 p-2 align-middle my-auto",
					id: `my-status-${id}`,
				}).appendTo(`#my-row-${id}`)

				$("<div/>", {
					class: "col-2 p-2 align-middle my-auto",
					id: `my-button-div-${id}`,
				}).appendTo(`#my-row-${id}`)

				switch (e.status) {
					case 1:
						const payDeadline = tranTimestamp(e.pay_deadline)

						$("<h6/>").text("待付款").appendTo(`#my-status-${id}`)
						$("<h6/>").text("付款期限").appendTo(`#my-status-${id}`)
						$("<h6/>")
							.html(
								`<span class='fw-bold text-danger'>${payDeadline.year}/${payDeadline.month}/${payDeadline.date}<br>${payDeadline.hours}:${payDeadline.minutes}</span>`
							)
							.appendTo(`#my-status-${id}`)

						if (e.seller_id == userId) {
							$("<button/>", {
								class: "btn btn-block btn-success mb-2 w-75 py-1",
								id: `deliver-button-${id}`,
								text: "等待買家付款",
								disabled: true,
							}).appendTo(`#my-button-div-${id}`)
							return
						}

						Swal.fire({
							title: "付款提醒",
							icon: "warning",
							text: "尚有得標商品未結帳，請盡速結帳以免影響權益！",
							confirmButtonText: "知道了",
						})

						$("<button/>", {
							class: "btn btn-block btn-primary mb-2 w-75 py-1",
							id: `my-pay-button-${id}`,
							text: "信用卡付款",
							type: "button",
						}).appendTo(`#my-button-div-${id}`)

						$(`#my-pay-button-${id}`).click(() => {
							fetch("/api/1.0/order/payment", {
								method: "post",
								headers: {
									Authorization: "Bearer " + user.access_token,
									"content-type": "application/json",
								},
								body: JSON.stringify({
									title: e.title,
									price: e.highest_bid,
									orderId: e.order_id,
									image: imgUrl,
									customerEmail: user.email,
								}),
							})
								.then((res) => res.json())
								.then((res) => {
									self.location.href = res.payUrl
								})
						})
						break
					case 2:
						$("<h6/>").text("已付款").appendTo(`#my-status-${id}`)

						if (e.seller_id != userId) {
							return
						}

						$("<button/>", {
							class: "btn btn-block btn-info mb-2 w-75 py-1",
							id: `deliverInfo-button-${id}`,
							text: "寄送資訊",
						}).appendTo(`#my-button-div-${id}`)

						$(`#deliverInfo-button-${id}`).click(() => {
							fetch(`/api/1.0/user/address?id=${e.buyer_id}`, {
								method: "get",
								headers: {
									Authorization: "Bearer " + user.access_token,
								},
							})
								.then((res) => res.json())
								.then((res) => {
									const buyer = res.data
									if (buyer.city == null || buyer.town == null || buyer.address == null || buyer.receiver == null) {
										Swal.fire({
											title: "缺少資料",
											icon: "warning",
											html: `目前缺乏買家收件資料，<br>已通知買家盡速補齊，請見諒！`,
											confirmButtonText: "知道了",
										})
										return
									}

									Swal.fire({
										title: "寄送地址",
										html: `<b>${buyer.zipcode}  ${buyer.city} ${buyer.town} <br> ${buyer.address} <br> ${buyer.receiver}  ${buyer.phone}</b> `,
										confirmButtonText: "知道了",
									})
								})
						})

						$("<button/>", {
							class: "btn btn-block btn-success mb-2 w-75 py-1",
							id: `deliver-button-${id}`,
							text: "寄 送",
						}).appendTo(`#my-button-div-${id}`)

						$(`#deliver-button-${id}`).click(async () => {
							const { value: delivery } = await Swal.fire({
								title: "請輸入寄件編號",
								input: "text",
								inputLabel: "寄件編號",
								showCancelButton: true,
								confirmButtonText: "送出",
								cancelButtonText: "再等等",
								inputValidator: (value) => {
									if (!value) {
										return "若無寄件編號無法確認出貨!"
									}
								},
							})

							if (delivery) {
								fetch("/api/1.0/order/update", {
									method: "PATCH",
									headers: {
										Authorization: "Bearer " + user.access_token,
										"content-type": "application/json",
									},
									body: JSON.stringify({ orderId: e.order_id, status: e.status, delivery: delivery }),
								}).then((res) => {
									Swal.fire({ icon: "success", title: "寄送成功", text: "請等候買家確認訂單！" })
									$(`#deliver-button-${id}`).attr("disabled", true).text("已寄送")
								})
							}
						})
						break
					case 3:
						$("<h6/>").html(`<p>已寄送<br>寄件編號:<br><b>${e.delivery}</b></p>`).appendTo(`#my-status-${id}`)

						if (e.seller_id == userId) {
							return
						}

						$("<button/>", {
							class: "btn btn-block btn-success mb-2 w-75 py-1",
							id: `confirm-button-${id}`,
							text: "確認商品",
							type: "button",
						}).appendTo(`#my-button-div-${id}`)

						$(`#confirm-button-${id}`).click(() => {
							fetch("/api/1.0/order/update", {
								method: "PATCH",
								headers: {
									Authorization: "Bearer " + user.access_token,
									"content-type": "application/json",
								},
								body: JSON.stringify({ orderId: e.order_id, status: e.status }),
							}).then((res) => {
								Swal.fire({ icon: "success", title: "確認成功", text: "可於「已完成」訂單介面進行評分" })
								$(`#confirm-button-${id}`).attr("disabled", true).text("已確認")
							})
						})
						break
					case 4:
						if (e.seller_id == userId) {
							$("<h6/>").text("確認收貨").appendTo(`#my-status-${id}`)
							$("<button/>", {
								class: "btn btn-block btn-warning w-75 py-1",
								id: `my-rate-button-${id}`,
								text: "等待賣家評分",
								disabled: true,
							}).appendTo(`#my-button-div-${id}`)
							return
						}

						$("<h6/>").text("確認收貨").appendTo(`#my-status-${id}`)

						$("<button/>", {
							class: "btn btn-block btn-warning w-75 py-1",
							id: `my-rate-button-${id}`,
							text: "評 分",
							"data-bs-toggle": "modal",
							"data-bs-target": "#exampleModal",
							"data-bs-whatever": "@mdo",
						}).appendTo(`#my-button-div-${id}`)

						$("<div/>", {
							id: `start-${id}`,
						})
							.raty({
								click: function (score) {
									rating = score
								},
							})
							.appendTo("#star-form")

						$("#send-button").click(async () => {
							fetch("/api/1.0/user/rating", {
								method: "post",
								headers: {
									Authorization: "Bearer " + user.access_token,
									"content-type": "application/json",
								},
								body: JSON.stringify({ ratedId: e.seller_id, orderId: e.order_id, rating: rating, status: e.status }),
							}).then((res) => {
								if (res.status == 400) {
									Swal.fire({ icon: "error", title: "重複評分", text: "已經評分過了唷~" })
									$(`#my-rate-button-${id}`).attr("disabled", true).text("已評分")
									return
								}
								Swal.fire({ icon: "success", title: "評分成功", text: "感謝您的回饋！" })
								$(`#my-rate-button-${id}`).attr("disabled", true).text("已評分")
							})
						})
						break
					case 5:
						if (e.buyer_id == userId) {
							$("<h6/>").text("訂單已完成").appendTo(`#my-status-${id}`)

							$("<button/>", {
								class: "btn btn-block btn-warning w-75 py-1",
								id: `my-rate-button-${id}`,
								text: "已評分",
								disabled: "true",
							}).appendTo(`#my-button-div-${id}`)
							return
						}

						$("<h6/>").text("買家評分完成").appendTo(`#my-status-${id}`)

						$("<button/>", {
							class: "btn btn-block btn-warning w-75 py-1",
							id: `my-rate-button-${id}`,
							text: "評 分",
							"data-bs-toggle": "modal",
							"data-bs-target": "#exampleModal",
							"data-bs-whatever": "@mdo",
						}).appendTo(`#my-button-div-${id}`)

						$(`#my-rate-button-${id}`).click(() => {
							$(".modal-footer").html("")
							$("#star-form").html("")

							$("<div/>", {
								id: `start-${id}`,
							})
								.raty({
									click: function (score) {
										rating = score || null
									},
								})
								.appendTo("#star-form")

							$("<button/>", {
								type: "button",
								class: "btn btn-secondary",
								"data-bs-dismiss": "modal",
								text: "讓我再想想...",
							}).appendTo(".modal-footer")

							$("<button/>", {
								type: "button",
								class: "btn btn-warning",
								id: `send-button-${id}`,
								"data-bs-dismiss": "modal",
								text: "送出評分",
							}).appendTo(".modal-footer")

							$(`#send-button-${id}`).click(async () => {
								if (rating == null) {
									Swal.fire({ icon: "error", title: "未評分", text: "分數忘了填了唷！" })
								}

								fetch("/api/1.0/user/rating", {
									method: "post",
									headers: {
										Authorization: "Bearer " + user.access_token,
										"content-type": "application/json",
									},
									body: JSON.stringify({ ratedId: e.buyer_id, orderId: e.order_id, rating: rating, status: e.status }),
								}).then((res) => {
									if (res.status == 400) {
										Swal.fire({ icon: "error", title: "重複評分", text: "已經評分過了唷~" })
										$(`#my-rate-button-${id}`).attr("disabled", true).text("已評分")
										return
									}
									Swal.fire({ icon: "success", title: "評分成功", text: "感謝您的回饋！" })
									$(`#my-rate-button-${id}`).attr("disabled", true).text("已評分")
								})
							})
						})
						break
					case 6:
						$("<h6/>").text("訂單已完成").appendTo(`#my-status-${id}`)
					default:
				}
			})
		})
		const currentPage = res.page
		const totalPage = res.total_page

		if (totalPage <= 1) {
			$(".previous-page").hide()
			$(".next-page").hide()
			return
		}

		if (currentPage == 0) {
			$(".previous-page").hide()
		} else {
			$(".previous-page-link").attr("href", `${params.split("&")[0]}&paging=${currentPage - 1}`)
		}

		if (currentPage == totalPage - 1) {
			$(".next-page").hide()
		} else {
			$(".next-page-link").attr("href", `${params.split("&")[0]}&paging=${currentPage + 1}`)
		}

		for (let i = 0; i < totalPage; i++) {
			if (i == currentPage) {
				$(`<li class="page-item disabled"><a class="page-link" href="${params.split("&")[0]}&paging=${i}">${i + 1}</a></li>`).insertBefore(".next-page")
			} else {
				$(`<li class="page-item"><a class="page-link" href="${params.split("&")[0]}&paging=${i}">${i + 1}</a></li>`).insertBefore(".next-page")
			}
		}
		$('.loader').hide();
	})
	.catch((error) => {
		console.log(error)
		// self.location.href = "/user/signin";
	})

$(".my-address-button").click(() => {
	$(".address-input").attr("disabled", false)
	$(".my-address-button").css("display", "none")
	$(".change-address-button").css("display", "inline")
	$(".cancel-address-button").css("display", "inline")
})

$(".my-bank-button").click(() => {
	$(".bank-input").attr("disabled", false)
	$(".my-bank-button").css("display", "none")
	$(".change-bank-button").css("display", "inline")
	$(".cancel-bank-button").css("display", "inline")
})

$(".cancel-address-button").click(() => {
	$(".address-input").attr("disabled", true)
	$(".change-address-button").css("display", "none")
	$(".cancel-address-button").css("display", "none")
	$(".my-address-button").css("display", "inline")
})

$(".cancel-bank-button").click(() => {
	$(".bank-input").attr("disabled", true)
	$(".change-bank-button").css("display", "none")
	$(".cancel-bank-button").css("display", "none")
	$(".my-bank-button").css("display", "inline")
})

$(".change-address-button").click((e) => {
	e.preventDefault()

	const form = document.querySelector("#address-form")
	const formData = new FormData(form)

	fetch("/api/1.0/user/address", {
		method: "post",
		headers: {
			Authorization: "Bearer " + user.access_token,
		},
		body: formData,
	})
		.then((res) => {
			if (res.status != 200) {
				throw error
			}
			Swal.fire({ icon: "success", title: "更改成功" })
			$(".address-input").attr("disabled", true)
			$(".change-address-button").css("display", "none")
			$(".cancel-address-button").css("display", "none")
			$(".my-address-button").css("display", "inline")
		})
		.catch((error) => {
			Swal.fire({ icon: "error", title: "更改失敗", text: "請再試一次" })
		})
})

$(".change-bank-button").click((e) => {
	e.preventDefault()

	const form = document.querySelector("#bank-form")
	const formData = new FormData(form)

	fetch("/api/1.0/user/account", {
		method: "post",
		headers: {
			Authorization: "Bearer " + user.access_token,
		},
		body: formData,
	})
		.then((res) => {

			if (res.status != 200) {
				throw error
			}
			Swal.fire({ icon: "success", title: "更改成功" })
			$(".bank-input").attr("disabled", true)
			$(".change-bank-button").css("display", "none")
			$(".cancel-bank-button").css("display", "none")
			$(".my-bank-button").css("display", "inline")
		})
		.catch((error) => {
			Swal.fire({ icon: "error", title: "更改失敗", text: "請再試一次" })
		})
})

const tranTimestamp = (timestamp) => {
	const time = new Date(timestamp)

	const year = time.getFullYear()
	const month = time.getMonth() + 1
	const date = time.getDate()
	let hours = time.getHours()
	let minutes = time.getMinutes()
	if (hours < 10) {
		hours = `0${hours}`
	}
	if (minutes < 10) {
		minutes = `0${minutes}`
	}
	return { year, month, date, hours, minutes }
}

const toCurrency = (num) => {
	const parts = num.toString().split(".")
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")
	return parts.join(".")
}

//Change the avatar
$("#change-avatar-button").click( async ()=> {
	const { value: file } = await Swal.fire({
		title: '上傳個人頭像',
		input: 'file',
		inputAttributes: {
			'accept': 'image/jpeg, image/png',
			'aria-label': 'Upload your profile picture',
			'name': 'avatar',
		}
	})	
	
	if (file) {
		if (file.type != 'image/jpeg' && file.type != 'image/png'){
			Swal.fire({
				title: "我不能接受",
				text: "圖片僅支援JPG與PNG檔",
				imageUrl: "../assest/non-accept.png",
				imageWidth: 300,
				imageHeight: 200,
				imageAlt: "I can not accept!",
				confirmButtonText: "知道了",
			})
			file.value = ""
			return false
		}

		if (file.size > 1000000) {
			Swal.fire({
				title: "圖檔過大",
				text: "圖片大小請不要超過1MB",
				imageUrl: "../assest/non-accept.png",
				imageWidth: 300,
				imageHeight: 200,
				imageAlt: "Too big",
				confirmButtonText: "知道了",
			})
			file.value = ""
			return false
		}

		const reader = new FileReader()
		reader.onload = (e) => {
			Swal.fire({
				title: '更新頭像嗎?',
				imageUrl: e.target.result,
				imageHeight: 150,
				imageWidth: 150,
				imageAlt: 'The uploaded picture',
				customClass: {
					image: 'rounded rounded-circle'
				},
				showCancelButton: true,
				confirmButtonText: '確定整形',
				cancelButtonText: `我喜歡我現在的模樣`,
			}).then((result) => {
				if (result.isConfirmed) {
					const formData = new FormData
					formData.append('avatar', file);
					fetch("/api/1.0/user/picture", {
						method: "post",
						headers: {
							Authorization: "Bearer " + user.access_token,
						},
						body: formData,
					})
					.then((res) => {
						if (res.status != 200) {
							Swal.fire({
								title: "更新失敗",
								text: "請稍後再試",
								imageUrl: "../assest/oop.png",
								imageWidth: 400,
								imageHeight: 300,
							})
							throw new Error()
						}
						return res.json()
					})
					.then((res) => {
						let data = res.data
						localStorage.setItem("user", JSON.stringify(data))
						Swal.fire({
							title: "整形成功",
							text: "可以以全新的樣貌面對世人了",
							icon: "success",
						}).then(() => {
							self.location.href = "/user/profile"
						})
					}).catch(error => console.log(error))
				}
			})
		}
		reader.readAsDataURL(file)
	}
})
