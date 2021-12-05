const form = document.querySelector("#signin-form");

form.addEventListener("submit", (e) => {
	e.preventDefault();

	const user = {
		provider: "native",
		email: document.querySelector(".my-email").value,
		password: document.querySelector(".my-password").value,
	};

	fetch("/api/1.0/user/signin", {
		method: "post",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(user),
	})
	.then((res) => {
		if (res.status == 400) {
			Swal.fire({
				icon: 'error',
				title: '登入失敗',
				text: 'Email不存在',
			})
			throw new Error
		}

		if (res.status == 403) {
			Swal.fire({
				icon: 'error',
				title: '登入失敗',
				text: '請再試一次',
			})
			throw new Error
		}
		return res.json();
	})
	.then((res) => {
		const data = res.data;
		localStorage.setItem("user", JSON.stringify(data));
		Swal.fire({
			title: '你是誰',
			text: '可以開始到處逛逛與競標了唷!',
			imageUrl: '../assest/youare.png',
			imageWidth: 400,
			imageHeight: 400,
			confirmButtonText: '皮卡丘'
		})
		.then(() => {self.location.href = "/user/profile"})

		$('.swal2-image').css({
			'background-color': 'black',
			'background-position': '50% 75%',
			'background-size': 'cover'
		})

		$('.swal2-confirm').attr('disabled', true)

		setTimeout(() => {
			$('.swal2-image').css({
				'background-image':`url(${data.user.picture})`,
				'background-position': '50% 75%',
				'background-size': 'cover'
			})
			$('#swal2-title').text(data.user.name)
			$('.swal2-confirm').attr('disabled', false)
		}, 1500)
	})
	.catch((err) => {
		console.log(err);
	});
});
