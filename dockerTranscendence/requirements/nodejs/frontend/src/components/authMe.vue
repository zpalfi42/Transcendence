<template>
	<div>

		<h3>
			<img :src="this.qrCodeUrl" alt="QR Code" v-if="this.qrCodeUrl" />
		</h3>
		<!-- <button @click="startOAuthFlow">Start OAuth Flow</button> -->
		<span id="result">{{ this.oauthResult }}</span>
		<div>
			<!-- <br>
			<button ref="42Login" v-if="this.hideMe === false" @click="this.callApi">42login</button>
			<br> -->
			<!-- <button @click="this.eraseMe"> cleanMe</button> -->
			<br>
			<!-- <br>
			<br>
			<button @click="oauthSignIn"> googleIT</button>
			<br>
			<button @click="handleAuthentication"> googleInfo</button> -->
			<br>
			<!-- <button @click="this.fetchData"> qrMe</button> -->

			<h5 v-if="this.app.appContext.config.globalProperties.user !== ''"> Welcome back {{
				this.app.appContext.config.globalProperties.user
			}}!</h5>
			<!-- {{ info }} -->
		</div>
	</div>
</template>

<script lang="ts">


import { defineComponent, ref, getCurrentInstance, onMounted } from 'vue';
//import base32Encode from 'base32-encode';
// import { authenticator } from 'otplib';
import axios from 'axios';
import { io } from 'socket.io-client';
import QRCode from 'qrcode';
import Swal from 'sweetalert2';

const regex = /^[0-9]+$/;


// import axios from 'axios';
// const { appContext } = getCurrentInstance();

export default {
	name: 'authMe',
	data() {
		return {
			app: getCurrentInstance(),
			qrCodeUrl: ref(''),
			oauthResult: ref(''),
			info: ref(''),
			hideMe: ref('false'),
			socket: io('http://localhost:3000'),
			apiSecret: "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",
			apiUid: "u-s4t2ud-045b72fbcfed0b6dd35cc540c94e9bcef5d015e8a0a745f9fbd79f26007457aa",
			qrRequired: ref('false'),
		}
	},
	methods: {
		// async startOAuthFlow() {
		// 	const codeVerifier = await this.generateRandomString(64);
		// 	sessionStorage.setItem('code_verifier', codeVerifier);
		// 	const redirectUri = "http://localhost:5173/oauth";
		// 	const args = new URLSearchParams({
		// 		client_id: this.apiUid,
		// 		redirect_uri: redirectUri,
		// 		scope: 'public',
		// 		response_type: 'code',
		// 		state: codeVerifier,
		// 	});
		// 	window.location.href = `https://api.intra.42.fr/oauth/authorize?${args}`;
		// },

		// async generateRandomString(length: number) {
		// 	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		// 	let text = '';
		// 	for (let i = 0; i < length; i++) {
		// 		text += possible.charAt(Math.floor(Math.random() * possible.length));
		// 	}
		// 	return text;
		// },

		async callApi() {
			// console.log("API CALLED");
			const redirectUri = 'http://localhost:5173/oauth';
			const urlParams = new URLSearchParams(window.location.search);
			const authorizationCode = urlParams.get('code');
			const error = urlParams.get('error');
			// console.log("---->");
			// console.log(error);
			// console.log("the auth copde in front is : ", authorizationCode);
			const tokenEndpoint = 'https://api.intra.42.fr/oauth/token';
			const requestBody = new URLSearchParams({
				client_id: this.apiUid,
				client_secret: this.apiSecret,
				code: authorizationCode,
				// error: error,
				redirect_uri: redirectUri,
				grant_type: 'authorization_code',
			});
			// console.log(error);
			if (error !== null)
			{
				window.location.href = "http://localhost:5173";
			}
			//////////go to baack
			try {

				const response = await axios.post('http://localhost:3000/auth/finish-oauth', {
					// client_id: apiUid,
					redirect_uri: redirectUri,
					code: authorizationCode,
				});
				// console.log('soy finishflow at authme.vue!:', response, "and focking status is:", response.status);

				// Redirect to the authorization URL received from the backend
				if (response.status == + 201) {
					// console.log("IM THE 2011111");
					const tokenData = response.data;

					const accessToken = tokenData.finalResponse.access_token;
					// console.log("hideitplease", accessToken);
					// Step 3: Store the access token securely (e.g., in session storage)
					sessionStorage.setItem('access_token', accessToken);
					// Step 4: Make authenticated requests to the 42 API using the access token
					const userInfoEndpoint = 'https://api.intra.42.fr/v2/me';
					const userInfoResponse = await fetch(userInfoEndpoint,
						{
							headers:
							{
								Authorization: `Bearer ${accessToken}`,
							},
						});
					if (userInfoResponse.ok) {
						const userInfo = await userInfoResponse.json();
						this.info = userInfo;
						// console.log(" Data from 42", userInfo);
						try {
							const response = await axios.get(`http://localhost:3000/users/id/${userInfo.id}`);
							if (response.data === "") {
								const userData = {
									id: userInfo.id,
									names: "user" + userInfo.id
								};
								const response = await axios.post('http://localhost:3000/users/create', userData);
								if (response.status === 201) {
									const theData = response.data;
									this.hideMe = true;
									this.app.appContext.config.globalProperties.user = theData.names;
									this.app.appContext.config.globalProperties.id = theData.id;
									this.qrRequired = theData.twoFactor;
									// console.log("this.qrRequired=", this.qrRequired)
								}
								else {
									console.error('Failed to create user:', response.data);
								}
								this.$router.push({ name: 'profile', params: { user: this.app.appContext.config.globalProperties.user }, state: { userid: this.app.appContext.config.globalProperties.id } });
							}
							else {
								const theData = response.data;
								this.app.appContext.config.globalProperties.user = theData.names;
								this.app.appContext.config.globalProperties.id = theData.id;
								this.qrRequired = theData.twoFactor;
								// console.log("this.qrRequired=", this.qrRequired);
								if (this.qrRequired) {
									Swal.fire({
										title: 'Enter your code:',
										input: 'text',
										// icon: "question",
										inputAttributes: {
											style: 'color: rgba(245, 40, 145, 0.8);font-weight: bold; width: 100px; left: 50%; top: 50%;'
										},
										allowOutsideClick: false,
										allowEscapeKey: false,
										background: "#fff url('../assets/gauth2.jpg') no-repeat center",
										backdrop: `
																rgba(0,0,123,0.4)
															
																left top
																no-repeat
															`

									}).then(async (input) => {
										// console.log(input.value);
										if (regex.test(input.value)) {
											// console.log("REGEX PASA");
											this.socket.emit('authChecker', { userid: theData.id, code: input.value }, (response: any) => {
												// console.log(response);
												if (response === false) {
													this.socket.emit('logout', { userid: this.app.appContext.config.globalProperties.id }, () => { });
													localStorage.removeItem('pongmeUser');
													window.location.href = "http://localhost:5173";
												}
											});
										}
										else {
											this.socket.emit('logout', { userid: this.app.appContext.config.globalProperties.id }, () => { });
											localStorage.removeItem('pongmeUser');
											window.location.href = "http://localhost:5173";
										}
									});
								}
								this.hideMe = true;
							}
						}
						catch (error) {
							console.error('Error fetching user data:', error);
						}
					}
					else
						throw new Error('Failed to retrieve user information');
				}
				else
					throw new Error('Failed to exchange authorization code for access token');
			} catch (error) {
				console.error('Error initiating OAuth flow:', error);
			}


			///////back fron end




			// try {
			// 	const response = await fetch(tokenEndpoint,
			// 		{
			// 			method: 'POST',
			// 			headers:
			// 			{
			// 				'Content-Type': 'application/x-www-form-urlencoded',
			// 			},
			// 			body: requestBody,
			// 		});
					// console.log("es lo mismo que en BACK?:",response);
			// 	if (response.ok) {
			// 		const tokenData = await response.json();
			// 		const accessToken = tokenData.access_token;
					// console.log("hideitplease", accessToken);
			// 		// Step 3: Store the access token securely (e.g., in session storage)
			// 		sessionStorage.setItem('access_token', accessToken);
			// 		// Step 4: Make authenticated requests to the 42 API using the access token
			// 		const userInfoEndpoint = 'https://api.intra.42.fr/v2/me';
			// 		const userInfoResponse = await fetch(userInfoEndpoint,
			// 			{
			// 				headers:
			// 				{
			// 					Authorization: `Bearer ${accessToken}`,
			// 				},
			// 			});
			// 		if (userInfoResponse.ok) {
			// 			const userInfo = await userInfoResponse.json();
			// 			this.info = userInfo;
			// 			 console.log(" Data from 42", userInfo);
			// 			try {
			// 				const response = await axios.get(`http://localhost:3000/users/id/${userInfo.id}`);
			// 				if (response.data === "") {
			// 					const userData = {
			// 						id: userInfo.id,
			// 						names: "user" + userInfo.id
			// 					};
			// 					const response = await axios.post('http://localhost:3000/users/create', userData);
			// 					if (response.status === 201) {
			// 						const theData = response.data;
			// 						this.hideMe = true;
			// 						this.app.appContext.config.globalProperties.user = theData.names;
			// 						this.app.appContext.config.globalProperties.id = theData.id;
			// 						this.qrRequired = theData.twoFactor;
									// console.log("this.qrRequired=", this.qrRequired)
			// 					}
			// 					else {
			// 						console.error('Failed to create user:', response.data);
			// 					}
			// 				}
			// 				else {
			// 					const theData = response.data;
			// 					this.app.appContext.config.globalProperties.user = theData.names;
			// 					this.app.appContext.config.globalProperties.id = theData.id;
			// 					this.qrRequired = theData.twoFactor;
								// console.log("this.qrRequired=", this.qrRequired)
			// 					this.hideMe = true;
			// 				}
			// 			}
			// 			catch (error) {
			// 				console.error('Error fetching user data:', error);
			// 			}
			// 		}
			// 		else
			// 			throw new Error('Failed to retrieve user information');
			// 	}
			// 	else
			// 		throw new Error('Failed to exchange authorization code for access token');
			// }
			// catch (error) {
			// 	console.error(error);
			// 	this.oauthResult = 'Error: Failed to complete the OAuth flow';
			// }
			this.socket.emit('login', { userid: this.app.appContext.config.globalProperties.id }, () => {
			});
			if (this.app.appContext.config.globalProperties.user !== "")
				localStorage.setItem('pongmeUser', this.app.appContext.config.globalProperties.user);
		},
		// showToken() {
		// 	const currentUrl = window.location.href;

		// 	const accessToken = new URL(currentUrl).hash
		// 		.substring(1) // Remove the leading '#'
		// 		.split('&') // Split the parameters
		// 		.reduce((result, param) => {
		// 			const [key, value] = param.split('=');
		// 			if (key === 'access_token') {
		// 				return value;
		// 			}
		// 			return result;
		// 		}, '');
			// console.log(accessToken);
		// },

		eraseMe() {
			// console.log("may  work", sessionStorage.getItem('code_verifier'));
			sessionStorage.removeItem('code_verifier');
			sessionStorage.removeItem('access_token');
			// console.log("may not work", sessionStorage.getItem('code_verifier'));
		},

		// factorMe(secret: string) {
		// 	const qrPath = 'https://chart.googleapis.com/chart?';
		// 	var digits = 6;
		// 	const factorAtt = {
		// 		cht: 'qr',
		// 		chs: '450x450',
		// 		chl: `otpauth://totp/transcendance42bcn?secret=${secret}&issuer=transcendance42bcn&digits=${digits}`, // Adjust issuer and label as needed
		// 	};
		// 	const qrCodeUrlValue = qrPath + new URLSearchParams(factorAtt);
		// 	this.qrCodeUrl = qrCodeUrlValue;
		// },

		async factorMe(secret: string) {
			const digits = 6;
			const issuer = 'transcendance42bcn2';
			const label = 'transcendance42bcn2';

			const otpauthURL = `otpauth://totp/${issuer}?secret=${secret}&issuer=${issuer}&digits=${digits}&algorithm=SHA1&period=30&label=${label}`;

			try {
				// Generate QR Code as a data URI
				const qrCodeDataURI = await QRCode.toDataURL(otpauthURL, { errorCorrectionLevel: 'L', width: 450 });

				// Set the data URI to your component's property (e.g., this.qrCodeUrl)
				this.qrCodeUrl = qrCodeDataURI;
			} catch (error) {
				console.error('Error generating QR code:', error);
				// Handle the error as needed
			}
		},


		async fetchData() {
			try {
				// console.log("FETCHING DATAAA!")
				this.socket.emit('authGen', { userid: this.app.appContext.config.globalProperties.id }, (response) => {
					// console.log("el back me devuelve", response);
					this.factorMe(response);
				});
				// const response = await axios.get(`http://localhost:3000/secret/${this.app.appContext.config.globalProperties.id}`);

				// return response.data;
			} catch (error) {
				console.error('Error fetching user data:', error);
			}
		},
	},
	async created() {
		this.callApi();
	},
}
</script>
<style scoped></style>
