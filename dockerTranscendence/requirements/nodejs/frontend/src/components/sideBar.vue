<template>
	<div class="content">
		<header>
			<button class="menu-button" popovertarget=menu @click.native=updateMenu(true)>
				<!-- <span class="sr-only">Toggle Menu</span> -->
				<span class="menu-button-text">🏓 </span>
			</button>
		</header>
	</div>
	<div v-if="isOpen">
		<div popover id="menu" role="menu">
			<!-- all the routes here  -->
			<div v-if="!subState()">
				<router-link to="/home" @click.native="updateMenu(false)"><span>Home</span></router-link>
				<a @click.native="updateSub()"><span class="clickable">Play</span></a>
				<router-link :to="{ name: 'chat', state: { user: user, userid: -1 } }"
					@click.native="updateMenu(false)"><span>Chat</span></router-link>
				<router-link :to="{ name: 'profile', params: { user: user }, state: { userid: playerId, logout: false } }"
					@click.native="updateMenu(false)"><span>Profile</span></router-link>
				<!-- <router-link :to="{ name: 'profile', params: { user: user }, state: { userid: playerId, logout: true } }"
					@click.native="updateMenu(false)"><span>Logout!</span></router-link> -->
				<a @click="logout()"><span class="clickable">Logout</span></a>
				<!-- add a optionakl param for logout so the comp profile will pick it or jsut call the socket -->


			</div>
			<div v-else>
				<router-link
					:to="{ name: 'play', state: { userid: playerId, priv: false, office: false }, params: { mode: 'standard' } }"
					@click.native="updateMenu(false)">

					<span>Std</span></router-link>
				<router-link
					:to="{ name: 'play', state: { userid: playerId, priv: false, office: true }, params: { mode: 'office' } }"
					@click.native="updateMenu(false)">
					<span>Office</span></router-link>
			</div>
			<!-- Picking user received from parent -->
		</div>

	</div>
</template>

<script lang="ts">
import { ref, getCurrentInstance } from 'vue';
import { io } from 'socket.io-client';

export default {
	props: {
		user: String,
		isOpen: Boolean,
		sideButton: Boolean,
	},
	watch: {
		user(newValue, oldValue) {
			// This function will be called when the 'user' prop changes

			// You can perform additional logic here in response to the change
		},
	},
	setup(_, { emit }) {
		const isSub = ref(false);
		const { appContext } = getCurrentInstance();
		const playerId = ref("");
		let socket = io('http://localhost:3000');
		const updateMenu = (state: boolean) => {
			if (appContext.config.globalProperties.user !== '') {
				playerId.value = appContext.config.globalProperties.id;
				emit('update:isOpen', state);
				isSub.value = false;
				if (state === false) {
					emit('update:showButton', true);
				}
			}
		};

		const updateSub = () => {
			isSub.value = true;
		};

		const subState = () => {
			return isSub.value;
		};

		const logout = async () => {
			socket.emit('logout', { userid: appContext.config.globalProperties.id }, () => { });
			localStorage.removeItem('pongmeUser');
			window.location.href = "http://localhost:5173/";
		};

		return {
			playerId,
			updateMenu,
			updateSub,
			subState,
			logout,
		};
	},
};
</script>




<style scoped>

button {
	background: none;
	color: inherit;
	border: none;
	padding: 0;
	font: inherit;
	cursor: pointer;
	outline: inherit;
}

:root {
	--padding: 1rem;
	--transition: 0.165s;
}

nav {
	display: grid;
	text-transform: uppercase;
	gap: 0.5rem;
}

[popover] {
	overflow: hidden;
}

main {
	display: grid;
	align-items: center;
	gap: 1rem;
}

a:is(:hover, :focus-visible) span {
	translate: -1.5ch 0;
}

a:is(:hover, :focus-visible):after {
	scale: 1 1;
}

a span {
	display: inline-block;
	transition: translate 0.2s;

}

a:after {
	content: "";
	position: left;
	left: 0;
	top: 50%;
	translate: 0 -50%;
	height: 4px;
	width: 0.8ch;
	background: red;
	transition: scale 0.2s;
	scale: 0 1;
	transform-origin: 0 50%;
}


#menu {
	background: rgb(144, 176, 223);
	margin: 0;
	padding: 1rem;
	align-items: center;
	justify-content: center;
	gap: 1rem;
	position: fixed;
	inset: unset;
	top: 0;
	left: 100%;
	height: auto;
	width: 9em;
	border: none;
	transition: display 0.2s, overlay 0.2s, transform 0.2s;
	transform: translateX(calc(var(--open, 0) * -100%));
}


.menu-button {
	position: relative;
	animation: blink 0.5s infinite ease-out, fadeOut 5s forwards;
}

.menu-button:hover {
	animation: none;
}

.menu-button::before {
	content: '';
	position: absolute;
	top: -1px;
	left: -1px;
	right: -1px;
	bottom: -1px;
	border: 2px solid transparent;
	border-radius: 15px;
	animation: borderBlink 0.7s infinite ease-out, fadeOut1 10s forwards;
}

@keyframes blink {
	50% {
		opacity: 0.5;
	}
}

@keyframes borderBlink {

	0%,
	100% {
		border-color: rgb(241, 101, 101);
	}

	50% {
		border-color: rgb(125, 125, 240);
	}
}

@keyframes fadeOut {
	to {
		opacity: 1;
	}
}

@keyframes fadeOut1 {
	to {
		opacity: 0;
	}
}

.menu-button-text {
	position: absolute;
	bottom: .05em;
	transform: translate(-50%, 0);
	font-size: 2em;
	font-weight: 400;
}


[popovertarget] {
	background: #efedc1;
	color: var(--text-1);

}

a {
	padding: 0.25rem;
	color: var(--text-2);
	font-size: 1.5rem;
	text-decoration: none;
	position: relative;
}

a:focus-visible {
	outline-color: var(--red-6);
}

[popovertarget] {
	position: fixed;
	top: 1rem;
	right: 1rem;
	inline-size: 48px;
	aspect-ratio: 1;

}

[popovertarget] span {

	color: var(--text-2);
	/* // Add this line to set the color for the text */
}

[popovertarget]:is(:hover, :focus-visible) {
	background: var(--surface-2);
}

/* .sr-only {
	position: absolute;
	width: 1px;
	height: 1px;
	padding: 0;
	margin: -1px;
	overflow: hidden;
	clip: rect(0, 0, 0, 0);
	white-space: nowrap;
	border-width: 0;
	font-size: 0;
} */

#menu::backdrop {
	background: hsla(0, 96%, 79%, 0.5);
	backdrop-filter: blur(4px);
	opacity: var(--open, 0);
	transition: opacity 0.2s, display 0.2s, overlay 0.2s;
}

@media (prefers-color-scheme: dark) {
	#menu {
		background: transparent;
		font-family: monospace;
		color: rgb(144, 176, 223);
		/* // background: rgb(243, 210, 148); */
	}

	#menu::backdrop {
		background: hsla(0, 54%, 81%, 0.5);
	}
}

@media (prefers-color-scheme: light) {
	#menu {
		background: transparent;
		font-family: monospace;
		color: rgb(144, 176, 223);
		/* // background: rgb(243, 210, 148); */
	}

	#menu::backdrop {
		background: hsla(0, 54%, 81%, 0.5);
	}
}

#menu:popover-open,
#menu:popover-open::backdrop {
	/* @initial {
		--open: 0;
	} */

	--open: 1.4;
}
</style>