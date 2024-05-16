<script lang="ts">
import axios from 'axios';
import { iconMe } from '../myIcons/iconMe.ts';
import Swal from 'sweetalert2';

export default {
	name: 'profileModal',
	props: {
		Profile: {
			type: Object,
			requiered: true,
		},
		MyProfile: {
			type: Object,
			requiered: true,
		},
		ChatRoom: {
			type: Object,
			requiered: true,
		},
		Socket: {
			type: Object,
			requiered: true,
		},
	},

	data() {
		return {
			owner: false,
			myOwner: false,
			same: false,
			blocked: false,
			friend: false,
			muted: false,
			banned: false,
			admin: false,
			myAdmin: false,
			timestamp: null,
			profileId: 0,
			myProfileId: 0,
			roomid: 0,
			chatRooms: null,
		};
	},

	methods: {
		close() {
			this.$emit('closeProfile');
		},

		profilePic() {
			let iconObject = "";
			let name = this.Profile.userPic;
			if (name !== null) {
				if (name.substring(0, 5).startsWith("http:"))
					iconObject = name;
				else
					iconObject = iconMe[name]["path"] || '';
			}
			else
				iconObject = iconMe["aLover"]["path"] || '';
			return iconObject;
		},

		async block() {
			let blockedUsers: number[] = this.MyProfile.blocked;
			blockedUsers.push(+this.profileId);
			const response = await axios.patch(`http://localhost:3000/users/patch/${this.myProfileId}`, { blocked: blockedUsers });
			if (response.status) {
				this.MyProfile.blocked = blockedUsers;
				this.unfriend();
				this.blocked = true;
			}
			this.$emit('join');
		},

		async unblock() {
			let blockedUsers: number[] = this.MyProfile.blocked;
			blockedUsers = blockedUsers.filter((number) => number !== +this.profileId);
			const response = await axios.patch(`http://localhost:3000/users/patch/${this.myProfileId}`, { blocked: blockedUsers });
			if (response.status) {
				this.MyProfile.blocked = blockedUsers;
				this.blocked = false;
			}
			this.$emit('join');
		},

		async addFriend() {
			this.Socket.emit('addFriend', { userid1: this.MyProfile.id, userid2: this.Profile.id }, () => {
			});
			this.MyProfile.friendsId.push(+this.Profile.id);
			this.friend = true;
		},

		async unfriend() {
			let friendId: number[] = this.MyProfile.friendsId;
			friendId = friendId.filter((number) => +number !== +this.profileId);
			this.Socket.emit('deleteFriend', { userid1: this.MyProfile.id, userid2: this.Profile.id }, () => {
			});
			this.MyProfile.friendsId = friendId;
			this.friend = false;
		},

		async mute() {
			if (this.ChatRoom.owner !== +this.Profile.id) {
				if (this.ChatRoom.admins.includes[+this.Profile.id] && this.ChatRoom.owner !== +this.MyProfile.id)
					Swal.fire({
						title: 'You cannot mute another admin!',
						icon: 'error',
					});
				else {
					let that = this;
					let response = Swal.fire({
						title: 'Select time:',
						input: 'select',
						inputOptions: {
							'1': '1 minute',
							'2': '24 hours',
							'3': 'unlimited'
						},
						inputPlaceholder: 'required',
						showCancelButton: true,
					}).then((result) => {
						let time = 0;
						if (result.value === "1")
							time = 1;
						else if (result.value === "2")
							time = 2;
						else
							console.log("unlimited");
						this.Socket.emit('muteUser', { id: that.ChatRoom.roomId, time: time, userid: that.Profile.id }, () => {
							this.muted = true;
						});
					});
					this.muted = true;
				}
			}
			else
				Swal.fire({
					title: 'You cannot mute the owner!',
					icon: 'error',
				});

		},
		async unmute() {
			let that = this;
			this.Socket.emit('unmuteUser', { id: that.ChatRoom.roomId, userid: that.Profile.id }, () => {
			});
			that.muted = false;
		},

		async sendBan() {
			return new Promise<void>((resolve) => {
				this.Socket.emit('ban', { id: this.ChatRoom.roomId, userid: this.Profile.id }, (response: boolean) => {
					this.banned = response;
					// console.log(response);
					resolve();
				});
			});
		},

		async ban() {
			if (this.ChatRoom.owner !== +this.Profile.id) {
				if (this.ChatRoom.admins.includes[+this.Profile.id] && this.ChatRoom.owner !== +this.MyProfile.id)
					Swal.fire({
						title: 'You cannot ban another admin!',
						icon: 'error',
					});
				else
					await this.sendBan();
			}
			else
				Swal.fire({
					title: 'You cannot ban the owner!',
					icon: 'error',
				});
			this.$emit('join');
		},

		async sendUnban() {
			return new Promise<void>((resolve) => {
				this.Socket.emit('unban', { id: this.ChatRoom.roomId, userid: this.Profile.id }, (response: boolean) => {
					this.banned = response;
					// console.log(response);
					resolve();
				});
			});
		},

		async unban() {
			await this.sendUnban();
			this.$emit('join');
		},

		async sendKick() {
			return new Promise<void>((resolve) => {
				this.Socket.emit('kick', { id: this.ChatRoom.roomId, userid: this.Profile.id }, (response: boolean) => {
					resolve();
				});
			});
		},

		async kick() {
			if (this.ChatRoom.owner !== +this.Profile.id) {
				if (this.ChatRoom.admins.includes[+this.Profile.id] && this.ChatRoom.owner !== +this.MyProfile.id)
					Swal.fire({
						title: 'You cannot kick another admin!',
						icon: 'error',
					});
				else
					await this.sendKick();
			}
			else
				Swal.fire({
					title: 'You cannot kick the owner!',
					icon: 'error',
				});

			this.$emit('join');
		},

		async sendGiveAdmin() {
			return new Promise<void>((resolve) => {
				this.Socket.emit('giveAdmin', { id: this.ChatRoom.roomId, userid: this.Profile.id }, (response: boolean) => {
					this.admin = response;
					// console.log(response);
					resolve();
				});
			});
		},

		async giveAdmin() {
			await this.sendGiveAdmin();
		},

		async sendTakeAdmin() {
			return new Promise<void>((resolve) => {
				this.Socket.emit('takeAdmin', { id: this.ChatRoom.roomId, userid: this.Profile.id }, (response: boolean) => {
					this.admin = response;
					resolve();
				});
			});
		},

		async takeAdmin() {
			if (this.ChatRoom.owner !== +this.Profile.id) {
				console.log(this.ChatRoom.admins);
				console.log(this.ChatRoom.admins.includes(+this.Profile.id));
				if (this.ChatRoom.admins.includes(+this.Profile.id) && this.ChatRoom.owner !== +this.MyProfile.id)
					Swal.fire({
						title: 'You cannot take administration from another admin!',
						icon: 'error',
					});
				else {
					await this.sendTakeAdmin();
					this.admin = false;
				}
			}
			else
				Swal.fire({
					title: 'You cannot take administration from the owner!',
					icon: 'error',
				});
		},

		async mutedUser() {
			return new Promise<void>((resolve) => {
				this.Socket.emit('mutedUser', { id: this.ChatRoom.roomId, userid: this.MyProfile.id }, (response: boolean) => {
					this.muted = response;
					resolve();
				});
			});
		},

		async bannedUser() {
			return new Promise<void>((resolve) => {
				this.Socket.emit('bannedUser', { id: this.ChatRoom.roomId, userid: this.Profile.id }, (response: boolean) => {
					this.banned = response;
					// console.log(response);
					resolve();
				});
			});
		},

		async adminUser() {
			return new Promise<void>((resolve) => {
				this.Socket.emit('adminUser', { id: this.ChatRoom.roomId, userid: this.Profile.id }, (response: boolean) => {
					this.admin = response;
					resolve();
				});
			});
		},

		async myAdminUser() {
			return new Promise<void>((resolve) => {
				this.Socket.emit('adminUser', { id: this.ChatRoom.roomId, userid: this.MyProfile.id }, (response: boolean) => {
					this.myAdmin = response;
					resolve();
				});
			});
		},

		async ownerUser() {
			return new Promise<void>((resolve) => {
				this.Socket.emit('ownerUser', { id: this.ChatRoom.roomId, userid: this.Profile.id }, (response: boolean) => {
					this.owner = response;
					resolve();
				});
			});
		},

		async myOwnerUser() {
			return new Promise<void>((resolve) => {
				this.Socket.emit('ownerUser', { id: this.ChatRoom.roomId, userid: this.MyProfile.id }, (response: boolean) => {
					this.myOwner = response;
					resolve();
				});
			});
		},

		async createPrivate() {
			return new Promise<void>((resolve) => {
				this.Socket.emit('createRoom', { roomName: this.Profile.names, owner: -1, password: "", type: 2 }, (response) => {
					console.log(response.roomId);
					resolve(response.roomId);
				});
			});
		},

		async assignPrivate() {
			return new Promise<void>((resolve) => {
				this.Socket.emit('assignPrivate', { user1id: this.Profile.id, user2id: this.MyProfile.id, roomid: this.roomid }, (response) => {
					console.log(response);
					resolve();
				});
			});
		},

		async emitGetPrivate() {
			return new Promise<{ userid: number, roomid: number }[]>((resolve) => {
				this.Socket.emit('getPrivate', { userid: this.MyProfile.id }, (response: { userid: number, roomid: number }[]) => {
					resolve(response);
				});
			});
		},

		async message() {
			let priv: { userid: number, chatid: number }[] = await this.emitGetPrivate();
			let userid = +this.Profile.id;
			if (priv.length !== 0) {
				let room = priv.find((r) => +r.userid === userid);
				if (room) {
					this.roomid = +room.chatid;
					this.$emit('openPrivateRoom', this.roomid);
				}
				else {
					this.roomid = await this.createPrivate();
					await this.assignPrivate();
					this.$emit('openPrivateRoom', this.roomid);
				}
			}
			else {
				this.roomid = await this.createPrivate();
				let xd = await this.assignPrivate();
				this.$emit('openPrivateRoom', this.roomid);
			}
		},

		async play() {
			this.Socket.emit('playPriv', { player1: this.MyProfile.id, player2: this.Profile.id }, (response) => {

			});

			this.Socket.once('gamePriv', (response: boolean) => {
				if (response)
					this.$router.push({ name: 'play', state: { userid: this.MyProfile.id, priv: true, office: false }, params: { mode: 'standard' } });
				else if (response === false)
					this.socket.emit()
			});
		},

		async findAllChatRooms() {
			return new Promise<void>((resolve) => {
				this.Socket.emit('findAllChatRooms', (response: any) => {
					this.chatRooms = response;
					resolve();
				});
			});
		},

		mounted() {
			this.Socket.on('chatChanged', async (userid, roomid) => {
				this.findAllChatRooms();
				let room;
				for (room in this.chatRooms) {
					console.log(room);
					if (+this.chatRooms[room].roomId === +this.ChatRoom.roomid) {
						this.ChatRoom = this.chatRooms[room];
					}
				}
			});
		},
	},

	async created() {
		this.profileId = Number(this.Profile.id);
		this.myProfileId = Number(this.MyProfile.id);

		if (this.profileId === this.myProfileId)
			this.same = true;
		if (this.MyProfile.blocked.indexOf(this.profileId) > -1)
			this.blocked = true;
		else
			this.blocked = false;
		if (this.MyProfile.friendsId.indexOf(+this.profileId) > -1)
			this.friend = true;

		await this.mutedUser();
		await this.bannedUser();
		await this.adminUser();
		await this.ownerUser();
		await this.myAdminUser();
		await this.myOwnerUser();
	},
};

</script>


<template>
	<div class="profile-header-div">

		<header class="profile-header">
			<div class="profile-name">
				{{ Profile.names }}
			</div>
			<div class="close-profile-btn-div">
				<button class="close-profile" @click="close">
					x
				</button>
			</div>
		</header>

		<div class="profile-pic">
			<img :src="profilePic()" alt="">
		</div>

		<div class="profile-state">
			<div class="profile-online profile-status" v-if="Profile.logged.n === 1">Online</div>
			<div class="profile-offline  profile-status" v-else-if="Profile.logged.n === 0">Offline</div>
			<div class="profile-idle profile-status" v-else-if="Profile.logged.n > 1">Idle</div>
		</div>

		<div class="profile-view">
			<button class="profile-view-button chatActions" @click="">
				<router-link :to="{ name: 'profile', params: { user: Profile.names }, state: { userid: Profile.id } }"><span>Visit
						Profile</span></router-link>
			</button>
		</div>
		<!-- v-if="same===false" On all butons below this comment, just taking it for developing easier -->
		<div class="profile-message chatActions" v-if="blocked === false && same === false">
			<button class="profile-message-button" @click="message">
				Message
			</button>
		</div>

		<div class="profile-play " v-if="blocked === false && same == false && Profile.logged.n === 1">
			<button class="profile-play-button chatActions" @click="play">
				Play
			</button>
		</div>

		<div class="profile-friend-remove" v-if="friend && blocked === false && same === false">
			<button class="profile-firend-remove-button chatActions" @click="unfriend">
				Remove friend
			</button>
		</div>

		<div class="profile-firend-add" v-else-if="blocked === false && same === false">
			<button class="profile-firend-add chatActions" @click="addFriend">
				Add friend
			</button>
		</div>

		<div class="profile-block" v-if="blocked === false && same === false">
			<button class="profile-block-button chatActions" @click="block">
				Block
			</button>
		</div>

		<div class="profile-unblock" v-else-if="same === false">
			<button class="profile-block-button chatActions" @click="unblock">
				Unblock
			</button>
		</div>

		<div class="profile-mute" v-if="!muted && myAdmin && same === false && owner === false">
			<button class="profile-mute-button chatActions" @click="mute">
				Mute
			</button>
		</div>

		<div class="profile-unmute" v-else-if="myAdmin && same === false && owner === false">
			<button class="profile-mute-button chatActions" @click="unmute">
				Unmute
			</button>
		</div>

		<div class="profile-ban" v-if="banned === false && myAdmin && same === false && owner === false">
			<button class="profile-ban-button chatActions" @click="ban">
				Ban
			</button>
		</div>

		<div class="profile-unban" v-else-if="myAdmin && same === false && owner === false">
			<button class="profile-unban chatActions" @click="unban">
				Unban
			</button>
		</div>

		<div class="profile-kick" v-if="myAdmin && same === false && owner === false">
			<button class="profile-kick-buttonchatActions" @click="kick">
				Kick
			</button>
		</div>

		<div class="profile-admin-give" v-if="myAdmin && same === false && owner === false && admin === false">
			<button class="profile-admin-give-button chatActions" @click="giveAdmin">
				Give admin
			</button>
		</div>

		<div class="profile-admin-take" v-else-if="myAdmin && same === false && owner === false">
			<button class="profile-admin-take-button chatActions" @click="takeAdmin">
				Take admin
			</button>
		</div>


	</div>
</template>


<style scoped lang="scss">
$open-sans: 'Open Sans', sans-serif;
@import url(https://fonts.googleapis.com/css?family=Open+Sans:300,400,700);

.profile-header {
	display: flex;
}

.profile-name {
	padding: 10px 0px 0px 20px;
	flex: 3;
	text-align: left;
	color: white;
	font-size: 20px;
	font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
}

.profile-pic img {
	width: 150px;
}

.profile-online {
	color: rgb(124, 246, 124);
}

.profile-offline {
	color: rgb(248, 88, 88);
}

.profile-idle {
	color: rgb(254, 237, 48);
}

.chatActions {
	margin: 4px 0 4px 0;
}

.profile-status {
	font-weight: bolder;
	font-family: $open-sans;
}

.profile-pic img {
	float: none;
	margin: auto;
	width: 9em;
	height: 9em;
	border-radius: 50%;
	-webkit-border-radius: 50% !important;
	-moz-border-radius: 50% !important;
	border-radius: 50% !important;
	border: 2.5px dotted #245f69;
	animation: rotate .5s forwards ease-in-out;
}
</style>