<script lang="ts">
import axios from 'axios';


export default {

	name: 'usersModal',
	props: {
		chatRoom: {
			type: Object,
			required: true
		}
	},

	emits: ['close', 'profile'],

	// added to avoid  [Vue warn]: Extraneous non-emits event listeners (close, profile)!

	data() {
		return {
			userData: [],
		};
	},
	methods: {
		close() {
			this.$emit('close');
		},

		profileClicked(profile) {
			console.log("Profile clicked! ")
			this.$emit('profile', profile);
		},

		async getUserByID(id) {
			try {
				const response = await axios.get(`http://localhost:3000/users/id/${id}`);
				return response.data;
			} catch (error) {
				console.log(error);
			}
		},

	},
	async created() {
		console.log("Created!!!!")
		for (let id of this.chatRoom.users) {
			const user = await this.getUserByID(id);
			this.userData.push(user);
		}
		console.log("Finish creation: " + this.userData[0].names);
	},
};

</script>

<template>
	<div class="modal-div">
		<div class="modal">
			<header class="modal-header">
				<slot name="header">
					Users
				</slot>
				<button type="button" class="btn-close" @click="close">
					x
				</button>
			</header>
			<!-- <section class="modal-body"> -->
			<slot name="body">
				<li class="user-li">
					<button class="user-button" v-for="user in userData" @click="profileClicked(user)">
						{{ user.names }}
					</button>
				</li>
			</slot>
			<!-- </section> -->
		</div>
	</div>
	<!-- <div class="modal-overlay">
		
	</div> -->
</template>

<style scoped lang="scss">
$open-sans: 'Open Sans', sans-serif;

@import url(https://fonts.googleapis.com/css?family=Open+Sans:300,400,700);

li {
	list-style-type: none;
}

.modal-div {

	position: fixed;
	top: 50%;
	left: 50%;
	border-radius: 5px;
	transform: translate(-50%, -50%);
	width: 400px;
	max-width: 100%;
	height: 500px;
	max-height: 100%;
	margin-bottom: 10px;
	z-index: 1010;

	background: white;
	box-shadow: 0 0 60px 10px rgba(0, 0, 0, 0.9);
}

.modal {

	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
}

// .modal-overlay {
// 	z-index: 1100;

// 	position: fixed;
// 	top: 350%;
// 	left: 60%;
// 	transform: translate(-21%, -53%);
// 	width: 20px;
// 	max-width: 100%;
// 	height: 15px;
// 	max-height: 100%;
// }

// .btn-close {

// 	text-shadow: 2px 2px 3px antiquewhite;
// 	border: 1em;
// 	border-color: aquamarine;
// 	align-items: right;
// 	font-family: $open-sans;
// 	font-weight: bolder;
// 	font-size: 25px;
// 	color: red;
// 	padding-left: 70%;
// 	/* Add this line */
// }
.btn-close {
	border: 1px solid rgb(243, 106, 32);
	align-items: right;
	font-family: $open-sans;
	font-weight: bolder;
	margin-left: 70%;
	font-size: 13px;
	text-align: right;
	color: red;
}







.modal-header {

	text-align: left;
	padding-top: 5px;
	padding-left: 20px;
	font-family: $open-sans;
	font-weight: bold;
	/* font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif; */
	font-size: 20px;

	border-bottom: solid 1px lightgrey;
}

.modal-body {
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;

	padding: 00px 0px 20px 0px;

	overflow: auto;
	display: flex;
	flex-direction: column;

	align-items: left;
	text-align: left;
}

// .user-li {
// 	display: flex;
// 	flex-direction: column;
// 	align-items: center;
// 	/* Center horizontally */
// 	justify-content: center;
// 	/* Center vertically */
// 	text-align: center;
// }

.user-button {
	background: rgba(233, 124, 124, 0.675);
	border: none;
	border-radius: 0px;
	font-family: $open-sans;
	font-weight: bolder;
	text-align: center;
	color: rgba(242, 242, 171, 0.834);
	width: 100%;
	/* Ensure the button takes up full width */
	box-sizing: border-box;
	/* Include padding and border in width calculation */
}



.user-button:active {
	filter: none;
	background-color: red;
}

.user-button:hover {
	background: lightslategray;
}
</style>