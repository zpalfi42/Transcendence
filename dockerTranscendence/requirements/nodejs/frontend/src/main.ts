import { createApp } from 'vue'
import './style.scss'
import App from './App.vue';
import { Quasar } from 'quasar'; // Import Quasar
import { RouteRecordRaw, createRouter, createWebHistory, Router, NavigationGuardNext } from 'vue-router';
import 'quasar/dist/quasar.css'; // Import Quasar CSS
import HelloWorld from './components/HelloWorld.vue';
import AppFooter from './components/AppFooter.vue';
import Loading from './components/Loading.vue';
import Null from './components/null.vue';
import Chat from './components/chatMe.vue';
import profileInfo from './components/profileInfo.vue';
// import pongMe from './components/pongMe.vue';
import pongGame from './components/pongGame.vue';
import spectateMe from './components/spectateMe.vue'
import authMe from './components/authMe.vue';
import { store, key } from './store';
import VueSweetalert2 from 'vue-sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import loadButton from './subComponents/loadButton.vue';
import leaderBoard from './components/leaderBoard.vue';

const app = createApp(App);
app.component('App', App);
app.config.globalProperties.user = ""; // Replace the logged user in the comp that is picking it and then use in the other comps 
app.config.globalProperties.id = "0"; // 



const requireAuth = (to: any, from: any, next: NavigationGuardNext) => {
	// const isLoggedIn = // check if the user is logged in, e.g., by checking if a token is present in local storage
	if (app.config.globalProperties.id != 0) {
		next(); // allow navigation to the next route
	} else {
		console.log("Im else idiot!!!");
		next('/'); // redirect to the login route if the user is not logged in
	}
};

const routes: RouteRecordRaw[] = [
	{ path: '/', component: Null },
	{ path: '/home', component: Null, beforeEnter: requireAuth },
	{ path: '/oauth', component: authMe },
	{ path: '/login', component: HelloWorld, props: { msg: "Are you ready? -coming from router- !" }, beforeEnter: requireAuth },
	{ path: '/footer', component: AppFooter, beforeEnter: requireAuth },
	{ path: '/loading', component: Loading, beforeEnter: requireAuth },
	{
		path: '/chat', name: "chat", component: Chat, beforeEnter: requireAuth
	},
	{
		path: '/play/:mode', name: "play", component: pongGame, props: true, beforeEnter: requireAuth
	},
	{
		path: '/:user', component: profileInfo, name: 'profile', props: true, beforeEnter: requireAuth
	},
	{
		path: '/spectate', component: spectateMe, name: 'spectateMe', beforeEnter: requireAuth
	}
	// and keep going
];

const router = createRouter({
	history: createWebHistory(),
	routes
})

app.component('loadButton', loadButton);
app.component('leaderBoard', leaderBoard);
app.use(VueSweetalert2);
app.use(router);
app.use(store, key);
app.use(Quasar, { /* options */ }); // Use the Quasar plugin with options, not using it anyway (?)
app.mount('#app');