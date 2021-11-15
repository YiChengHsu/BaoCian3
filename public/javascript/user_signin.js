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
				title: '登入成功',
				text: '你可以隨便逛逛，或是跳舞',
				imageUrl: '../assest/rick-roll-rick-ashley.gif',
				imageWidth: 400,
				imageHeight: 500,
			})
			.then(() => {self.location.href = "/user/profile"})
		})
		.catch((err) => {
			console.log(err);
		});
});

// function statusChangeCallback(response) {  // Called with the results from FB.getLoginStatus().
// 	console.log('statusChangeCallback');
// 	console.log(response);                   // The current login status of the person.
// 	if (response.status === 'connected') {   // Logged into your webpage and Facebook.
// 		testAPI();  
// 	} else {                                 // Not logged into your webpage or we are unable to tell.
// 		document.getElementById('status').innerHTML = 'Please log ' +
// 			'into this webpage.';
// 	}
// }


// function checkLoginState() {               // Called when a person is finished with the Login Button.
// 	FB.getLoginStatus(function(response) {   // See the onlogin handler
// 		statusChangeCallback(response);
// 	});
// }


// window.fbAsyncInit = function() {
// 	FB.init({
// 		appId      : '338961854638156',
// 		cookie     : true,                     // Enable cookies to allow the server to access the session.
// 		xfbml      : true,                     // Parse social plugins on this webpage.
// 		version    : 'v12.0'           // Use this Graph API version for this call.
// 	});


// 	FB.getLoginStatus(function(response) {   // Called after the JS SDK has been initialized.
// 		statusChangeCallback(response);        // Returns the login status.
// 	});
// };

// function testAPI() {                      // Testing Graph API after login.  See statusChangeCallback() for when this call is made.
// 	console.log('Welcome!  Fetching your information.... ');
// 	FB.api('/me', function(response) {
// 		console.log('Successful login for: ' + response.name);
// 		document.getElementById('status').innerHTML =
// 			'Thanks for logging in, ' + response.name + '!';
// 	});
// }