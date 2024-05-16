<template>
	<div class="notification" v-if="!declined">
		<p class="notification-text bold">{{ player1 }} challenges you!</p>
		<p class="notification-text">{{ player2 }} Do you have the balls?</p>
		<button class="notification-button accept" @click="acceptGame">I do !</button>
		<button class="notification-button decline" @click="declineGame">Hmmm...</button>


	</div>
	<div class="declined" v-else>
		<p class="notification-text reject">{{ player2 }} declined your game :(</p>
	</div>
</template>

<script lang="ts">

import { rawValue, fetchData } from '../scripts/getUsers.ts'

export default {
	name: "notificationModal",
	props: {
		p1: {
			type: Number,
			requiered: true,
		},
		p2: {
			type: Number,
			requiered: true,
		},
		declined: {
			type: Boolean,
			requiered: true,
		},
		socket: {
			type: Object,
			requiered: true,
		},
	},
	data() {
		return {
			showNotification: false,
			users: null,
			player1: null,
			player2: null,
		};
	},
	methods: {
		acceptGame() {
			this.$emit('closeNoti');
			this.socket.emit('acceptPriv', { player1: this.p1, player2: this.p2 }, () => {

			});

			this.socket.once('gamePriv', (response) => {
				if (response)
				{
					this.$router.push({ name: 'play', state: { userid: this.p2, priv: false, office: false }, params: {mode: 'standard'} });
				}
			});
		},
		declineGame() {
			this.socket.emit('declinePriv', { player1: this.p1, player2: this.p2 }, () => {

			});
			this.$emit('closeNoti');
			// Handle declining the game
			// this.showNotification = false; // Hide the notification after declining
		},
	},

	async created() {
		let user;
		this.users = await fetchData();
		console.log(this.users);
		for (user in this.users)
		{
			console.log(this.users[user]);
			if (+this.users[user].id === +this.p1)
			{
				this.player1 = this.users[user].names;
			}
			if (+this.users[user].id === +this.p2)
			{
				this.player2 = this.users[user].names;
			}
		}
  },
};
</script>

<style scoped>
.notification,
.declined {
	position: fixed;
	top: 20px;
	left: 20px;
	border: 1px solid #ccc;
	padding: 10px;
	z-index: 999;
	overflow: hidden;
}

.notification {
	width: 300px;
	height: 300px;
}

.notification::before {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-image: url('../assets/wannaplay.jpg');
	background-size: cover;
	background-repeat: no-repeat;
	filter: blur(1.5px);
	z-index: -1;
}

.declined {
	background-color: red;
	background-image: url('../assets/rejectedpong.jpg');
	background-size: cover;
	background-repeat: no-repeat;
	width: 300px;
	height: 300px;
}

.notification-text {
	color: rgb(0, 255, 145);
	margin-top: 35px;
	font-size: 22px;
}

.notification-text.reject {
	color: yellow;
	margin-top: 98px;
	font-size: 25px;
	font-weight: bold;
}

.notification-text.bold {
	font-size: 16px;
	color: yellow;
	font-size: 20px;
	margin-top: 15px;
	font-weight: bold;
}

.notification-button {
	position: relative;
	top: 28.5%;
	color: yellow;
	font-weight: bold;
	margin-right: 8px;
	margin-left: 8px;
}

.notification-button.accept {
	background-color: rgba(0, 0, 255, 0.588);
}

.notification-button.decline {
	background-color: rgba(255, 0, 0, 0.543);
}
</style>