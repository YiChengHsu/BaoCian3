const form = document.querySelector("form");

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
			if (res.status == 200) {
				Swal.fire({
					icon: 'success',
					title: '登入成功',
					text: '你可以隨便逛逛了唷~',
				}).then(() => {
					self.location.href = "/user/profile";
				})
			} else if (res.status == 403) {
				Swal.fire({
					icon: 'error',
					title: '登入失敗',
					text: '請再試一次',
				})
				return;
			} else {
				alert("伺服器忙碌中，請稍後再試。");
				return;
			}
		})
		.then((res) => {
			const data = res.data;
			localStorage.setItem("user", JSON.stringify(data));
			const user = JSON.parse(localStorage.getItem("user"));
			console.log(user.user);
		})
		.catch((err) => {
			console.log(err);
		});
});
