<script setup lang="ts">
import { io } from 'socket.io-client';
import { onBeforeMount, ref, toRefs, onMounted, getCurrentInstance } from 'vue';
import VueSweetalert2 from 'vue-sweetalert2';
import Swal from 'sweetalert2';
import { key } from '../store';
import axios from 'axios';
import usersModal from './usersModal.vue';
import { iconMe } from '../myIcons/iconMe.ts';
import ProfileModal from './profileModal.vue';
import { rawValue, fetchData } from '../scripts/getUsers.ts'
import { useRoute } from 'vue-router';
// import UserData from './userData.vue';

const socket = io('http://localhost:3000');
const messages = ref<any[]>([]);
const chatRooms = ref<any[]>([]);
const actualRoom = ref<any>();
const messageText = ref('');
const joined = ref(false);
const typinDisplay = ref('');
const roomId = ref(0);
const { appContext } = getCurrentInstance();
const regex = /^[^\x00-\x1F\x7F]+$/;
const showModal = ref(false)
const showProfile = ref(false)
const selectedRoom = ref(false)
const Profile = ref<any>();
const myProfile = ref<any>();

let inChat = false;
let banned = false;
let allow = false;
let muted = false;
let owner = false;

const user = window.history.state.user // Destructure 'user' prop from 'props'
const userid = window.history.state.userid;

let Users;

/*	EMITTERS	*/

const emitJoinChat = async () => {
	return new Promise<void>((resolve) => {
		socket.emit('joinChat', { id: actualRoom.value.roomId, userid: myProfile.value.id }, (response: boolean) => {
			resolve();
		});
	});
};

const emitTyping = () => {
	socket.emit('typing', { isTyping: true, roomid: actualRoom.value.roomId });
	let timeout = setTimeout(() => {
		socket.emit('typing', { isTyping: false, roomid: actualRoom.value.roomId });
	},
		2000
	);
};

const emitCreate = (chatroomName, password, type: number) => {
	return new Promise<void>((resolve) => {
		socket.emit('createRoom', { roomName: chatroomName, owner: appContext.config.globalProperties.id, password: password, type: type }, (response: any) => {
			actualRoom.value = response;
			// console.log(response);
			resolve(response);
		});
	})
};

const emitSend = async () => {
	return new Promise<void>((resolve) => {
		socket.emit('createMessage', { message: messageText.value, roomId: roomId.value, userid: myProfile.value.id }, () => {
			messageText.value = "";
			resolve()
		});
	})
}

const emitPassCheck = async (pass: string, roomid: number) => {
	return new Promise<boolean>((resolve) => {
		socket.emit('passCheck', { pass: pass, roomid: roomid }, (response: boolean) => {
			resolve(response);
		});
	});
};

const emitUpdate = async (id, pass, type) => {
	return new Promise<void>((resolve) => {
		socket.emit('updateChat', { id: id, pass: pass, type: type }, (response: boolean) => {
			resolve();
		});
	});
}

/*	OPENNERS/CLOSERS	*/

const openModal = async () => {
	socket.emit('getChatRoomByID', roomId.value, (response: any) => {
		// console.log(response);
		actualRoom.value = response;
		showModal.value = true;
	});
};

const closeModal = () => {
	showModal.value = false;
};

const openConfig = async () => {
	let room = actualRoom.value;
	if (room.roomType === 0) {
		Swal.fire({
			title: 'ChatRoom configuration',
			confirmButtonText: 'Add password',
			showCloseButton: true,
		}).then(async (result) => {
			if (result.isConfirmed) {
				Swal.fire({
					title: 'Enter password for ChatRoom:',
					input: 'password',
					showCloseButton: true,
					confirmButtonText: 'Confirm password',
					inputValidator: async (value) => {
						if (!value || value.length === 0) {
							return 'Password cannot be empty!';
						}
						if (value.length > 15) {
							return 'Password cannot surpass 15 characters!'
						}
					}
				}).then(async (pass) => {
					if (pass.isConfirmed) {
						await emitUpdate(room.roomId, pass.value, 1);
						await join();
						Swal.fire({
							title: 'Password added successfully',
							icon: 'success',
						});
					}
				});
			}
		});
	}
	else if (room.roomType === 1) {
		Swal.fire({
			title: 'ChatRoom configuration',
			confirmButtonText: 'Change password',
			showDenyButton: true,
			denyButtonText: 'Remove password',
			denyButtonColor: 'green',
			showCloseButton: true,
		}).then(async (result) => {
			if (result.isConfirmed) {
				Swal.fire({
					title: 'Enter password for ChatRoom:',
					input: 'password',
					showCloseButton: true,
					confirmButtonText: 'Confirm password',
					inputValidator: async (value) => {
						if (!value) {
							return 'Password cannot be empty!';
						}
						if (value.length > 15) {
							return 'Password cannot surpass 15 characters!'
						}
					}
				}).then(async (pass) => {
					if (pass.isConfirmed) {
						await emitUpdate(room.roomId, pass.value, 1);
						await join();
						Swal.fire({
							title: 'Password updated successfully',
							icon: 'success',
						})
					}
				});
			}
			else if (result.isDenied) {
				await emitUpdate(room.roomId, "", 0);
				await join();
				Swal.fire({
					title: 'Password removed successfully',
					icon: 'success',
				})
			}
		});
	}
	await findAllChatRooms();
	await join();
};

const openPrivateRoom = async (id: number) => {
	const fetchedData = await fetchData();
	let id2 = appContext.config.globalProperties.id;
	for (const user in fetchedData.value) {
		if (+id2 === +fetchedData.value[user].id)
			myProfile.value = fetchedData.value[user];
	};
	profileClosed();
	await findAllChatRooms();
	roomId.value = id;
	// console.log("==========>")
	// console.log(roomId.value)
	// console.log(myProfile.value)
	await join();
};

const profileOpen = (profile) => {
	showProfile.value = true;
	showModal.value = false;
	Profile.value = profile;
};

const profileClosed = () => {
	showProfile.value = false;
	hidingDivs();
	Profile.value = null;
}

/* OTHER */

onBeforeMount(() => {
	socket.on('message', (message) => {
		if (actualRoom.value !== undefined && myProfile.value.blocked.includes(message.userid) === false && message.chatRoom.roomId === actualRoom.value.roomId)
			messages.value.push(message);
		else {
			findAllChatRooms();
		}
	});

	socket.on('user', async (msg) => {
		// console.log(msg);
		const fetchedData = await fetchData();
		Users = fetchedData;
		let id = appContext.config.globalProperties.id;
		for (const user in fetchedData.value) {
			if (id === fetchedData.value[user].id)
				myProfile.value = fetchedData.value[user];
		}
	});

	socket.on('chatRoom', (chatRoom) => {
		// console.log("ROOOOM");
		// console.log(chatRoom);
		chatRooms.value.push(chatRoom);
	});

	socket.on('chatChanged', async (userid, roomid) => {
		// console.log("CHAT CHANGED FOR USER: " + userid + " WITH ROOMID: " + roomid + "     === " + appContext.config.globalProperties.id);
		findAllChatRooms();
		if (+userid === +appContext.config.globalProperties.id) {
			// console.log("IS USER");
			// console.log(roomId.value);
			if (+roomid === +roomId.value) {
				// console.log("IS ROOM")
				await join();
			}
		}
	})

	socket.on('typing', ({ name, isTyping, id, roomid }) => {
		let oid = -1;
		if (actualRoom.value !== undefined)
			oid = actualRoom.value.roomId;
		if (isTyping && myProfile.value.blocked.length != 0 && (myProfile.value.blocked.includes(+id) === false) && roomid === oid)
			typinDisplay.value = `${name} is typing...`;
		else if (isTyping && myProfile.value.blocked.length == 0 && (myProfile.value.blocked.includes(+id) === false) && roomid === oid)
			typinDisplay.value = `${name} is typing...`;
		else
			typinDisplay.value = '';
	});
});

const createPrivate = async () => {
	return new Promise<void>((resolve) => {
		socket.emit('createRoom', { roomName: Profile.value.names, owner: -1, password: "", type: 2 }, (response) => {
			// console.log(response.roomId);
			resolve(response.roomId);
		});
	});
};

const assignPrivate = async (rid: number) => {
	return new Promise<void>((resolve) => {
		socket.emit('assignPrivate', { user1id: Profile.value.id, user2id: myProfile.value.id, roomid: rid }, (response) => {
			// console.log(response);
			resolve();
		});
	});
};

onMounted(async () => {
	try {
		socket.emit('findAllChatRooms', (response: any) => {
			chatRooms.value = response; // Assuming you have a reactive variable for chat rooms
		});

		const fetchedData = await fetchData();
		Users = fetchedData;
		let id = appContext.config.globalProperties.id;
		for (const user in fetchedData.value) {
			// console.log(id + " ?=? " + fetchedData.value[user].id);
			if (+id === +fetchedData.value[user].id)
				myProfile.value = fetchedData.value[user];
			if (+userid !== -1 && +userid === +fetchedData.value[user].id)
				Profile.value = fetchedData.value[user];
		};

		// console.log("__________;;;;;;;; " + userid);

		if (+userid !== -1) {
			let priv = myProfile.value.privateRooms;
			roomId.value = priv.find((r) => r.userid === +userid).chatid;
			join();
			// console.log(myProfile)
			// let priv = myProfile.value.privateRooms;
			// // roomId.value = priv.find((r) => r.userid === +userid).chatid;
			// let room = priv.find((r) => r.userid === +userid);
			// console.log("------> ");
			// console.log(room);
			// if (room === undefined || room === null)
			// {
			console.log("CREATE:");
			// 	let rid = await createPrivate();
			console.log("ASSIGN:");
			// 	await assignPrivate(+rid);
			console.log("FIND:");


			// 	// await openPrivateRoom(+rid);
			// 	await findAllChatRooms();
			// 	roomId.value = +rid;
			console.log("JOIN:");

			// 	await join();
			// }
			// join();
		}
		else {
			// console.log("NO ENTIENDO NADA!");
		}
	} catch (error) {
	}
	inChat = true;
});

const join = async () => {
	inChat = false;
	allow = false;
	owner = false;

	socket.emit('join', { name: user.value, roomId: roomId.value, userid: myProfile.value.id }, () => {
		joined.value = true;
	});

	socket.emit('getChatRoomByID', roomId.value, (response: any) => {
		actualRoom.value = response;
		// console.log(response);	
		selectedRoom.value = true;
		for (let userid in actualRoom.value.users) {
			if (myProfile.value.id == actualRoom.value.users[userid]) {
				inChat = true;
				allow = true;
			}
		}
		if (actualRoom.value.roomType == 2) {
			inChat = true;
			allow = true;
		}
		if (actualRoom.value.bannedUsers.includes(+myProfile.value.id)) {
			banned = true;
			allow = false
		}
		else
			banned = false;

		if (+actualRoom.value.owner === +myProfile.value.id)
			owner = true;

		if (actualRoom === undefined)
			inChat = true;
	});

	socket.emit('findMessages', { roomid: roomId.value, blocked: myProfile.value.blocked }, (response: any) => {
		messages.value = response;
	});
	profileClosed();
	closeModal();
};

const mutedUser = async () => {
	return new Promise<void>((resolve) => {
		socket.emit('mutedUser', { id: actualRoom.value.roomId, userid: myProfile.value.id }, (response: boolean) => {
			muted = response;
			resolve();
		});
	})
}

const bannedUser = async () => {
	return new Promise<void>((resolve) => {
		socket.emit('bannedUser', { id: actualRoom.value.roomId, userid: myProfile.value.id }, (response: boolean) => {
			banned = response;
			resolve();
		});
	})
}

const sendMessage = async () => {
	await mutedUser();
	await bannedUser();
	if (muted === true) {
		Swal.fire({
			title: 'You are muted!',
			icon: 'error'
		});
	}
	else {
		if (regex.test(messageText.value)) {
			await emitSend();
		}
		else {
			Swal.fire({
				title: 'Invalid message!',
				icon: 'error'
			});
		}
	}
};

const findAllChatRooms = () => {
	return new Promise<void>((resolve) => {
		socket.emit('findAllChatRooms', (response: any) => {
			chatRooms.value = response;
			resolve();
		});
	});
};

const createRoom = () => {
	Swal.fire({
		title: 'Enter Chatroom name',
		input: 'text',
		inputLabel: 'Chatroom name',
		showCloseButton: true,
		confirmButtonText: 'Continue creation',
		inputValidator: async (value) => {
			if (!value) {
				return 'Chatroom name cannot be empty!';
			}
			if (value.length > 15) {
				return 'Chatroom name cannot surpass 15 characters!'
			}
			const response = await new Promise<boolean>((resolve) => {
				socket.emit('checkChatRoomName', value, (response: boolean) => {
					resolve(response);
				});
			});

			if (response === true) {
				return 'Chatroom alredy exists!';
			}

			return null;
		}
	}).then(async (result) => {
		if (result.isConfirmed) {
			Swal.fire({
				title: 'Enable password?',
				showDenyButton: true,
			}).then(async (result1) => {
				if (result1.isConfirmed) {
					Swal.fire({
						title: 'Enter password:',
						input: 'password',
						inputValidator: async (value) => {
							if (!value || value.length === 0) {
								return 'Password cannot be empty!';
							}
							if (value.length > 15) {
								return 'Password cannot surpass 15 characters!'
							}
						}
					}).then(async (password) => {
						if (password.isConfirmed) {
							await emitCreate(result.value, password.value, 1);
							await findAllChatRooms();
							for (let room in chatRooms.value) {
								if (chatRooms.value[room].roomName === result.value) {
									let rooms = myProfile.value.chatRooms;
									rooms.push(chatRooms.value[room].roomId);
									const response = await axios.patch(`http://localhost:3000/users/patch/${myProfile.value.id}`, { chatRooms: rooms });
								}
							}
							roomId.value = actualRoom.value.roomId;
							await join();
						}
					});
				}
				else {
					await emitCreate(result.value, "", 0);
					await findAllChatRooms();
					for (let room in chatRooms.value) {
						if (chatRooms.value[room].roomName === result.value) {
							let rooms = myProfile.value.chatRooms;
							rooms.push(chatRooms.value[room].roomId);
							const response = await axios.patch(`http://localhost:3000/users/patch/${myProfile.value.id}`, { chatRooms: rooms });
						}
					}
					roomId.value = actualRoom.value.roomId;
					await join();
					Swal.fire({
						title: 'Chatroom ' + result.value + ' created!',
					})
				}
			});
		}
	})
};

const hidingDivs = () => {
	var width = document.documentElement.clientWidth;
	if (width < 800) {
		var div = document.getElementById('chat-container');
		var div2 = document.getElementById('chat-sidebar');
		if (showProfile.value) {
			div.style.display = 'none';
			div2.style.display = 'none';
		} else if (selectedRoom.value) {
			div.style.display = 'flex';
			div2.style.display = 'none';
		} else {
			div2.style.display = 'flex';
			div.style.display = 'none';
		}
	}
	else {
		var div = document.getElementById('chat-container');
		var div2 = document.getElementById('chat-sidebar');

		if (div != null)
			div.style.display = 'flex';
		if (div2 != null)
			div2.style.display = 'flex';
	}
};

window.onload = function () {
	hidingDivs();
};

window.onresize = function () {
	hidingDivs();
};

const profilePic = () => {
	return iconMe[Profile.value.userPic]["path"];
};

const joinChatRoom = async () => {
	let room = actualRoom.value;
	if (actualRoom.value.roomType === 1) {
		Swal.fire({
			title: 'Enter password:',
			input: 'password',
		}).then(async (pass) => {
			let ok = await emitPassCheck(pass.value, room.roomId);
			if (ok === true) {
				await emitJoinChat();
				roomId.value = actualRoom.value.roomId;
				join();
				Swal.fire({
					title: 'Joined chatroom!',
					icon: 'success',
				});
			}
			else {
				Swal.fire({
					title: 'Incorrect password, try again!',
					icon: 'error',
				});
			}
		});
	}
	else {
		await emitJoinChat();
		roomId.value = actualRoom.value.roomId;
		join();
		Swal.fire({
			title: 'Joined chatroom!',
			icon: 'success',
		});
	}
}

</script>

<template>
	<div class="chat">

		<div class="chat-sidebar" id="chat-sidebar">

			<div class="chat-title-row">
				<div class="chat-title">
					<img src="../assets/1tomore.png" alt="Settings image" class="chat-image">
					Chat Rooms
				</div>
				<div class="new-chat-button-div">
					<form @submit.prevent="createRoom">
						<button type="submit" class="new-chat-button"> New +</button>
					</form>
				</div>
			</div>

			<div class="chats">
				<li class="single-chat" v-for="room in chatRooms" :key="room.roomId">
					<button class="chat-button" @click="roomId = room.roomId; join()" v-if="room.roomType !== 2">
						{{ room.roomName }}
					</button>
				</li>
			</div>

			<div class="chat-title-row-2" v-if="myProfile !== null && myProfile !== undefined">
				<div class="chat-title">
					<img src="../assets/1to1.png" alt="Settings image" class="chat-image">
					Private Rooms
				</div>
			</div>
			<div class="chats-2" v-if="myProfile !== null && myProfile !== undefined">
				<li class="single-chat" v-for="room in chatRooms" :key="room.roomId">
					<button class="chat-button" @click="roomId = room.roomId; join()"
						v-if="room.roomType === 2 && Users[0] !== undefined && myProfile.privateRooms.length !== 0 && (myProfile.privateRooms.find((chat) => +chat.chatid === +room.roomId)) !== undefined">
						<!-- {{ room.roomId }} -->
						<!-- {{  (myProfile.privateRooms.find((chat) => +chat.chatid === +room.roomId)).userid }} -->
						{{ Users.find((id) => +id.id === +myProfile.privateRooms.find((chat) => +chat.chatid ===
							+room.roomId).userid).names }}
						<!-- {{ Users.find((id) => id.id === myProfile.privateRooms.find((n) => n.chatid === room.roomId).userid ).names   myProfile.privateRooms.find((n) => n.chatid === room.roomId).name }} -->
					</button>
				</li>
			</div>

		</div>

		<div class="chat-container" id="chat-container">

			<div class="chat-info-div" v-if="actualRoom">

				<div class="chat-info">
					<div class="room-name" v-if="actualRoom.roomType !== 2">
						{{ actualRoom.roomName }}
					</div>
					<div class="room-name" v-else-if="myProfile.privateRooms.find((n) => n.chatid ===
						actualRoom.roomId) !== undefined">
						{{ Users.find((u) => +u.id === +myProfile.privateRooms.find((n) => n.chatid ===
							actualRoom.roomId).userid).names }}
					</div>
				</div>

				<div class="chat-config">
					<div class="button-container">
						<button class="users-info-button" @click="openConfig" v-if="owner">
							<img src="../assets/settings.png" alt="settings-button-image">
						</button>
						<button class="users-info-button" @click="openModal">
							<img src="../assets/users.png" alt="users-button-image">
						</button>
						<usersModal v-if="showModal" @close="closeModal" :chatRoom="actualRoom" @profile="profileOpen">
						</usersModal>
					</div>
				</div>

				<!-- <div class="users-info-div">
					<div class="users-info">
						<button class="users-info-button" @click="openModal">
							<img src="../assets/users.png" alt="users-button-image">
						</button>
						<usersModal v-if="showModal" @close="closeModal" :chatRoom="actualRoom" @profile="profileOpen">
						</usersModal>
					</div>
				</div> -->

			</div>

			<div class="messages-cont" v-if="inChat">
				<div v-for="message in messages" v-if="!banned" class="single-message">
					<div class="own-message-div" v-if="+message.userid === +myProfile.id">
						<div class="talk-bubble tri-right border round btm-left-in ">
							<strong>[{{ Users.find((u) => +u.id === +message.userid).names }}]:</strong>
							{{ message.message }} at {{ message.timestamp }}
						</div>
					</div>
					<div class="others-message-div" v-else>
						<div class=" talk-bubble tri-right border round btm-right-in"
							v-if="Users.find((u) => +u.id === +message.userid) !== undefined">
							<strong>[{{ Users.find((u) => +u.id === +message.userid).names }}]:</strong>
							{{ message.message }} at {{ message.timestamp }}
						</div>
					</div>
				</div>
			</div>

			<div v-if="typinDisplay" class="typing">
				{{ typinDisplay }}
			</div>

			<div class="join-chat-div" v-if="!inChat">
				<div class="join-chat">
					<button class="join-chat-button" @click="joinChatRoom">
						Dont be shy, join to the Room!
					</button>
				</div>
			</div>

			<div class="join-chat-div" v-if="banned === true">
				<div class="join-chat">
					YOU ARE BANNED FROM THIS CHAT!
				</div>
			</div>


			<div class="message-input-div" v-if="allow === true">
				<form class="form-message-input-div" @submit.prevent="sendMessage">
					<input v-model="messageText" @input="emitTyping" class="message-input2" type="text">
					<button class="submit-message-button" type="submit"> > </button>
				</form>

			</div>

		</div>

		<div class="profile-info-div" v-if="showProfile">
			<ProfileModal :Profile="Profile" :MyProfile="myProfile" :ChatRoom="actualRoom" :Socket="socket"
				@closeProfile="profileClosed" @openPrivateRoom="openPrivateRoom" @join="join">
			</ProfileModal>
		</div>

	</div>
</template>


<style scoped lang="scss">
$open-sans: 'Open Sans', sans-serif;

@import url(https://fonts.googleapis.com/css?family=Open+Sans:300,400,700);

.chat {
	display: flex;
	height: 80vh;
	width: 100%;
	margin: 0;
	padding: 0;
	border-radius: 15px;
}

.chat-sidebar {
	flex: 1;
	background-color: #effaab92;
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	/* padding: 10px; */
}

.chat-title-row {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 70px;
	padding: 10px;
	margin: 0;
	width: 100%;
	font-family: $open-sans;
	// font-weight: bold;
}

.chat-title {
	width: 50%;
	margin: 10px;
	font-size: clamp(0.5rem, 2vw, 2.5rem);
	white-space: nowrap;
	font-family: $open-sans;
	// font-weight: bold;
}


.new-chat-button-div {
	width: 50%;
	margin-left: 1em;
	justify-content: center;
	// align-items: flex-end;
	// border-radius: 100%;
	font-family: $open-sans;
}

.new-chat-button {
	background-color: rgba(119, 209, 120, 0.883);
	color: rgba(44, 155, 7, 0.646);
	cursor: pointer;
	font-size: clamp(0.5rem, 1vw, 1.5rem);
	border: none; // Remove border if not needed
	padding: 0.5px 0.5px; // Adjust padding as needed
	border-radius: 5px;
}

.new-chat-button:hover {
	border: 1px solid rgb(255, 99, 47);
	// animation: rotate 0.5s forwards;
	transform: scale(1.03);
}

.chats {
	flex: 3;
	background-color: #f2f2f239;
	flex-grow: 1;
	overflow-y: auto;
	margin: 0px;
	align-items: flex-start;
	display: flex;
	flex-direction: column;
	font-family: "Roboto", "-apple-system", "Helvetica Neue", Helvetica, Arial, sans-serif;
	width: 100%;
}

.chat-title-row-2 {
	display: flex;
	align-items: left;
	justify-content: left;
	height: 70px;
	padding: 0px;
	margin-bottom: 10px;
	width: 100%;
	margin-left: 2%;
	font-family: "Roboto", "-apple-system", "Helvetica Neue", Helvetica, Arial, sans-serif;
}

.chats-2 {
	flex: 2;
	background-color: #f2f2f239;
	flex-grow: 1;
	overflow-y: auto;
	margin: 0px;
	align-items: flex-start;
	display: flex;
	flex-direction: column;
	width: 100%;
	font-family: "Roboto", "-apple-system", "Helvetica Neue", Helvetica, Arial, sans-serif;
}

li {
	list-style-type: none;
}

.single-chat {
	background-color: #f2f2f239;
	font-size: 15px;
	margin: 0px;
	text-align: left;
	width: 100%;
	font-family: "Roboto", "-apple-system", "Helvetica Neue", Helvetica, Arial, sans-serif;
}

.chat-button {
	/* background-color: #F2F2F2; */
	margin: 0;
	width: 100%;
	text-align: center;
	border-radius: 0px;
	transition-duration: 0.4s;
	color: #7fdec2b9;
	font-family: "Roboto", "-apple-system", "Helvetica Neue", Helvetica, Arial, sans-serif;
	font-weight: bold;
	transition: transform 0.3s ease-in-out;
	/* Add a smooth transition */

}

.chat-button:hover {
	background-color: #eaa2a268;
	border-color: #f05c5c75;
	transform: scale(1.1);

}

/* CHAT CONTAINER */
.chat-container {
	flex: 3;
	background-color: #6dc3d8b9;
	display: flex;
	flex-direction: column;
	height: 100%;
	border-left: solid 1px #939393;
	min-width: 0;
	border-radius: 10px;
}

.chat-image {
	position: relative;
	top: 3px;
}

.chat-info-div {
	height: 70px;
	border-bottom: solid 1px #939393;
	display: flex;
	font-family: "Roboto", "-apple-system", "Helvetica Neue", Helvetica, Arial, sans-serif;
}

.chat-info {
	flex: 3;
	height: 40px;
	margin-top: 15px;
	margin-bottom: 15px;
	align-items: center;
	min-width: 0;
	font-family: "Roboto", "-apple-system", "Helvetica Neue", Helvetica, Arial, sans-serif;
}

.chat-config {
	flex: 1;
	height: 40px;
	margin-top: 15px;
	margin-bottom: 15px;
	align-items: center;
	font-family: "Roboto", "-apple-system", "Helvetica Neue", Helvetica, Arial, sans-serif;
}

.chat-config-button {
	background-color: red;
}

.room-name {
	margin-left: 15px;
	text-align: left;
	font-size: 25px;
	font-family: Impact;
	color: #effaabd2;
}

.users-info-div {
	flex: 1;
	height: 40px;
	margin-top: 15px;
	margin-bottom: 15px;
	align-items: center;
}

.button-container {
	display: flex;
	flex-wrap: nowrap;
	/* Prevent wrapping to a new line */
	width: 100%;
	height: 100%;
}

.users-info-button {
	width: 3.5em;
	height: 3.5em;
	/* Set the height equal to the width to make it square */
	background-color: #fcabcbe5;
	position: sticky;
	margin-left: 5em;
	top: 1.5em;
	/* border: none; */
	padding: 0;
	/* Remove padding to make the button fit the image */
}

.users-info-button img {
	width: 100%;
	height: 100%;
	object-fit: cover;
	/* Make the image fill the entire button */
}


.users-info-button:hover {
	border: greenyellow;
}

.message-sender {
	font-weight: bold;
}

/* MESSAGE SENDER */
.messages-cont {
	// padding: 10px;
	overflow-y: auto;
	overflow-x: auto;
	flex: 1 1 auto;
	background-color: transparent;
	color: #effaabd2;
	padding: 1em;
	text-align: left;
	line-height: 1.5em;
	word-wrap: break-word;
}

.messages-cont div {
	padding: 5px;
	// border: 1px solid #ccc;
	// border-radius: 5px;
	word-wrap: break-word;
}

.single-message {
	width: 100%;
	min-height: 40px;
	display: flex;
	position: relative;
	padding: 0;
}

.own-message-div {
	display: flex;
	justify-content: right;
	width: 100%;
}

.others-message-div {
	display: flex;
	justify-content: left;
	width: 100%;
}

.own-message {
	background-color: rgba(119, 209, 120, 0.883);
	border-radius: 5px;
	right: 0;
	top: 0;
	word-wrap: break-word;
	white-space: normal;
	height: fit-content;
	width: auto;
	overflow: hidden;
	max-width: 80%;
}

.own-message::before {
	content: "";
	position: absolute;
	bottom: 0;

	/* Adjust the value to control the position of the peak */
	border: 10px solid transparent;
	border-bottom-color: #f0f0f0;
	/* Adjust the color of the peak */
}



.join-chat-button {
	background-color: #eaa2a268;
	border-color: #f05c5c75;
	color: #effaabd2;
	// transform: scale(1.1);
}

.join-chat-button {
	margin-top: 40px;
}

.others-message {
	background-color: rgba(119, 209, 120, 0.883);
	border-radius: 5px;
	position: absolute;
	left: 0;
	top: 0;
	word-wrap: break-word;
	white-space: normal;
	height: fit-content;
	width: auto;
	overflow: hidden;
	max-width: 80%;
}


.talk-bubble {
	margin: 40px;
	display: inline-block;
	position: relative;
	width: 200px;
	height: auto;
	background-color: rgba(119, 209, 120, 0.883);
}

.border {
	border: 5px solid #cdc6c6f8;
}

.round {
	border-radius: 30px;
	-webkit-border-radius: 30px;
	-moz-border-radius: 30px;

}

/*Right triangle, placed bottom left side slightly in*/
.tri-right.border.btm-left-in:before {
	content: ' ';
	position: absolute;
	width: 0;
	height: 0;
	left: 30px;
	right: auto;
	top: auto;
	bottom: -40px;
	border: 20px solid;
	border-color: #cdc6c6f8 transparent transparent #cdc6c6f8;
}

.tri-right.btm-left-in:after {
	content: ' ';
	position: absolute;
	width: 0;
	height: 0;
	left: 38px;
	right: auto;
	top: auto;
	bottom: -20px;
	border: 12px solid;
	border-color: rgba(119, 209, 120, 0.883)transparent transparent rgba(119, 209, 120, 0.883);

}

/*Right triangle, placed bottom right side slightly in*/
.tri-right.border.btm-right-in:before {
	content: ' ';
	position: absolute;
	width: 0;
	height: 0;
	left: auto;
	right: 30px;
	bottom: -40px;
	border: 20px solid;
	border-color: #cdc6c6f8 #cdc6c6f8 transparent transparent;
}

.tri-right.btm-right-in:after {
	content: ' ';
	position: absolute;
	width: 0;
	height: 0;
	left: auto;
	right: 38px;
	bottom: -20px;
	border: 12px solid;
	border-color: rgba(119, 209, 120, 0.883)transparent transparent rgba(119, 209, 120, 0.883);
	transform: scaleX(-1);
}


.tri-right.border.btm-right:before {
	content: ' ';
	position: absolute;
	width: 0;
	height: 0;
	left: auto;
	right: -4px;
	bottom: -40px;
	border: 20px solid;
	border-color: #cdc6c6f8 #cdc6c6f8 transparent transparent;
}

.tri-right.btm-right:after {
	content: ' ';
	position: absolute;
	width: 0;
	height: 0;
	left: auto;
	right: 0px;
	bottom: -20px;
	border: 12px solid;
	border-color: rgba(119, 209, 120, 0.883)transparent transparent rgba(119, 209, 120, 0.883);

}


/* talk bubble contents */
.talktext {
	padding: 1em;
	text-align: left;
	line-height: 1.5em;
	word-wrap: break-word;
}

.talktext p {
	/* remove webkit p margins */
	-webkit-margin-before: 0em;
	-webkit-margin-after: 0em;
}










.message-input-div {
	width: 60%;
	/* padding: 5px; */
	/* float: right; */
	margin-left: 20%;
}

.form-message-input-div {
	display: flex;
	margin: 5px;
	padding: 0px;
	width: calc(100% - 10px);
	align-items: center;
	flex: 0 1 50px;
	border-radius: 10px;
	border-color: rgba(0, 0, 0, 0.532);
	border: solid 2px;
	background-image: linear-gradient(-20deg, #433e3eb4 0%, #969490b3 50%, #c5d5e8bc 100%);
}

.message-input2 {
	border: none;
	outline: 0;
	width: 100%;
	height: 100%;
	border-radius: 10px;
	margin: 1em;
	color: #effaabd2;
	/* background-image: linear-gradient(-20deg, #F2D1D1 0%, #F2E2C6 50%, #C5D5E8 100%); */
	/* background-image: linear-gradient(-20deg, #433E3E 0%, #969490 50%, #C5D5E8 100%); */
	/* background-repeat: no-repeat; */
	background-color: transparent;
	/* font-family: "Roboto", "-apple-system", "Helvetica Neue", Helvetica, Arial, sans-serif; */
	font-weight: bold;
	float: right;
}

.submit-message-button {
	color: rgb(114, 199, 117);
	font-size: 15px;
	font-weight: bold;
	float: right;
	/* border-radius: 40%; */
}

.profile-info-div {
	background-color: black;
	width: 300px;
}

@media (max-width: 1200px) {
	.chat-sidebar {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.chat-container {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.profile-info-div {
		background-color: black;
		position: relative;
		width: 100%;
		height: 100%;
	}
}
</style>