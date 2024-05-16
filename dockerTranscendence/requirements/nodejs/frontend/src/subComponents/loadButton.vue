<template>
	<div>
		<div>
			<img src="../assets/pixme.png" class="img-responsive uptoU clickable flash" title="Upload myAvatar"
				@click.prevent="openFileSelector">
		</div>


		<input type="file" ref="fileInput" class="file-input" @change="handleFileChange">
		<!-- <p style="white-space: pre-line;">{{ message }}</p> -->
		<p style="white-space: pre-line;"></p>
		<input type="text" v-model="message" maxlength="12" class="textHolder" title="Customize your nickName"
			placeholder="  ✒️@newName + INTRO" @keydown.enter="sendValue">
		<!-- <span v-if="message.length < 2">Please enter at least 2 characters.</span> -->
	</div>
</template>


<script lang="ts">

import { ref } from 'vue';
import axios from 'axios';
// import { fetchData } from '../scripts/getUsers'

// const fileInputRef = ref<HTMLInputElement | null>(null);
const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
const regex = /^[a-zA-Z0-9]+$/;

const loadIt = (async (selectedFile: any, userId: string) => { //when using await always async before!
	try {
		const formData = new FormData();
		formData.append('file', selectedFile);
		// console.log("SELECTED FILE IS ", selectedFile);
		// Send a POST to backend

		const response = await axios.post(`http://localhost:3000/users/upload/${userId}/`, formData);
		// Handle the response 
		// console.log('Upload successful:', response.data.fileUrl);
		const userData = {
			userPic: response.data.fileUrl
		};
		const response1 = await axios.put(`http://localhost:3000/users/update/${userId}/`, userData);
		if (response1.status === 200) {
			// console.log("profile pic updated")
			return response.data.fileUrl;

		}
		else {
			// console.log("profile pic NOOOOT updated")
		}
	} catch (error) {
		// Handle errors
		console.error('Error uploading file:', error);
	}

});

export default {
	props: {

		userId: String // Define the 'app-id' prop to receive the value
	},
	emits: ['profile-pic-updated', 'nickname-updated'], // Define the emitted event
	setup(props, { emit }) {
		const message = ref('');
		let picRef: any;
		const logAppId = async (selectedFile: any) => {
			// console.log("variable", props.userId)
			// Call the function and pass the 'appId' prop when the button is clicked
			picRef = await loadIt(selectedFile, props.userId);
			// console.log("HACE TIEMPO YA", picRef)
			emit('profile-pic-updated', picRef);
		};

		return { message, logAppId, picRef };
	},


	methods: {
		openFileSelector() {
			const photoClick = new Audio("https://www.soundjay.com/mechanical/sounds/camera-shutter-click-01.mp3");
			photoClick.play();
			// Programmatically trigger a click event on the file input
			this.$refs.fileInput.click();
		},
		// loadData() {
		// 	// Access the 'appId' prop value here
		// 	return (this.appId);
		// },


		sendValue() {
			// this.userCheck("japon");
			if (this.message.length > 2 && regex.test(this.message)) {
				this.$emit('nickname-updated', this.message);
				// console.log("New nick name:", this.message);
			}
			else {
				// console.log("faileeedd");
				this.$swal.fire({
					position: 'center',
					icon: 'error',
					title: 'Wrong Format Name. Please use alphanum chars (>2)',
					showConfirmButton: false,
					timer: 3500,
					allowOutsideClick: true,
					backdrop: true
				})

				// ('Wrong Format Name. Please use alphanum chars (>=2)');

			}
			this.message = "";
		},
		handleFileChange(event) {
			const selectedFile = event.target.files[0];
			if (selectedFile) {
				if (!allowedTypes.includes(selectedFile.type)) {
					this.$swal.fire({
						position: 'center',
						icon: 'warning',
						title: 'Wrong File type. Please upload a JPEG, PNG or GIF.',
						showConfirmButton: false,
						timer: 3500,
						allowOutsideClick: true,
						backdrop: true
					})
					// this.$swal('Wrong File type. Please upload a JPEG, PNG, GIF or PDF.');
					return; // Errorrr
				}
				// console.log('Selected file:', selectedFile.name);

				try {
					this.logAppId(selectedFile);

				} //Post with axios}	
				catch (error) {
					console.error('Error uploading file:', error);
				}


			}
		}
	}

}
</script>







<style lang="scss">
@import url(https://fonts.googleapis.com/css?family=Open+Sans:300,400,700);

// Animations



@keyframes progress {
	0% {
		height: 3px;
	}

	30% {
		height: 8px;
	}

	60% {
		height: 12px;
	}

	100% {
		height: 17px;
	}
}

// Variables
$white: #fff;
$black: #ea4c89;
$dribbble: #ea4c89;
$green: #00FF00;
$open-sans: 'Open Sans',
	sans-serif;

a {
	text-decoration: none;
}

h1 {
	font-family: $open-sans;
	font-weight: 300;
	text-align: center;

	&+p {
		font-size: 0.8em;
		text-align: center;

		a {
			color: $dribbble;
		}
	}
}

.avatar {
	display: none;
}

// .upload-button {
// 	position: sticky;
// 	display: block;
// 	top: auto;
// 	left: 44.4em;
// 	transform: rotate(180deg);
// 	border-right: 3px solid $black;
// 	border-left: 3px solid $black;
// 	border-bottom: 3px solid $black;
// 	width: 24px;
// 	height: 24px;
// 	transition: width 0.3s 0.4s;

// 	&::before,
// 	&::after {
// 		content: '';
// 		display: block;
// 		height: 3px;
// 		width: 10px;
// 		// position: absolute;
// 		top: 0;
// 		background-color: $black;
// 	}

// 	&:hover+.avatar {
// 		display: block;
// 		color: red;
// 		/* background-color: $green; */
// 	}

// 	&::before {
// 		left: 0;
// 	}

// 	// &::after {
// 	// 	// right: 0;
// 	// }

// 	span {
// 		width: 3px;
// 		height: 20px;
// 		background-color: $white;
// 		position: absolute;
// 		transform: translate(-50%, 0);
// 		top: -5px;
// 		left: 50%;
// 		display: block;
// 		transition: 0.4s;

// 		&::before {
// 			content: '';
// 			display: block;
// 			position: absolute;
// 			width: 12px;
// 			height: 12px;
// 			border-right: 3px solid $black;
// 			border-bottom: 3px solid $black;
// 			bottom: -1px;
// 			left: 50%;
// 			transform: translateX(-50%) rotate(45deg);
// 		}

// 		&::after {
// 			// content: attr(data-title);

// 			position: absolute;
// 			top: 50%;
// 			left: 50%;
// 			color: $white;
// 			transform: translate(-50%, -30%);
// 			opacity: 0;
// 			transition: all 0.4s;
// 		}
// 	}

// 	&:focus {
// 		// width: 150px;
// 		transition: width 0.3s 4s;

// 		span {
// 			display: block;
// 			opacity: 1;
// 			width: 3px;
// 			height: 20px;
// 			background-color: $green; // or red?
// 			position: fixed;
// 			transition: all .4s 4.3s;
// 			top: auto;
// 			bottom: 0;
// 			height: 14px;
// 			width: 100%;
// 			animation: 3s linear 0.1s reverse progress;

// 			&::before {
// 				display: block;
// 				transform: translate(-0%, -82%) rotate(-90deg);
// 				transition: all .4s 4.3s;

// 			}

// 			&::after {

// 				opacity: 1;
// 				width: 3px;
// 				height: 20px;
// 				background-color: $green;
// 				position: absolute;
// 				// transform: translate(-50%, 0);
// 				top: -5px;
// 				left: 50%;
// 				display: block;
// 				opacity: 1;
// 				// transform: translate(-50%, -30%);
// 				transition: all .4s 4.3s;
// 			}
// 		}
// 	}
// }

.textHolder {
	width: 70%;
	height: auto;
	// border: 1px solid blue;
	background-color: transparent;
	border-radius: 13%;
	border-color: rgb(248, 248, 248);
	// rgb(232, 235, 189);
	color: #ea4c89;
	opacity: .9;
	font-weight: bold;
	text-decoration: inherit;
	text-align: center;

}




@keyframes flash {

	0%,
	50%,
	100% {
		opacity: 1;
	}

	25%,
	75% {
		opacity: 0;
	}
}



.uptoU {
	width: auto;
	height: 30px;
	opacity: 1;

	animation: flash 1.3s;
}
</style>
