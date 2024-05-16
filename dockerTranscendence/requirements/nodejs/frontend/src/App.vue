<template>
  <header></header>
  <div class="app-container">
    <!-- must be the header? -->
    <a href="https://42.fr/" target="_blank">
      <img src="./assets/42pix1.png" class="logo" alt="42pix logo" />
    </a>

    <div class="typingmachine" v-if="showButton && appContext.config.globalProperties.user !== ''">
      <h5> Welcome to pongMe </h5>
      <div id="pong">
        <div class="pad"></div>
        <div class="ball"></div>
        <div class="pad"></div>
      </div>
    </div>

    <!-- <div class="notification" v-if="showNoti && appContext.config.globalProperties.user !== ''">
      NOTIFICATION
    </div> -->

    <notificationModal :p1="+p1" :p2="+p2" :declined="declined" @closeNoti="closeNoti" v-if="showNoti" :socket="socket"/>

    <!-- <div v-if="user"> -->
    <div v-if="showHelloWorldComponent">
      <!-- <h3> "IM INNNN Showing the whole info" </h3> -->
      <!-- <div>
        <h3>You are Logged in!</h3>
      </div> -->
      <userData :who="userName()" />
      <sidebar :user="userName()" v-if="!showButton" :is-open="menuOpen" @update:is-open="menuOpen = $event" />
      {{ computedUser }}

    </div>

    <div v-else> <!-- it will else the if used before-->
      <div v-if="appContext.config.globalProperties.user === ''">
        <!-- <router-link to="/helloworld">Hello World</router-link>
      <router-view></router-view> -->
        <div class="card">
          <div>
            <p v-html="formattedGameDescription" class="center" v-if="readyTo"></p>
          </div>
        </div>

        <button v-if="showButton" @click="startOAuthFlow"
          style="font-size: 1.3em; font-weight: 700; font-family:'Courier New', Courier, monospace;">Log in! {{ localIto
          }}

        </button>
      </div>
    </div>
    <!-- it will paint the "/" always because will be the base for all the componenents that we are using -->
    <router-view></router-view>

  </div>

  <AppFooter />
</template>
    
<!-- <div>
      <Loading :isLoading="false"></Loading>
    </div> -->
<script setup lang="ts">
// import HelloWorld from './components/HelloWorld.vue';
//import Loading from './components/Loading.vue';
//import axios from 'axios';
import sidebar from './components/sideBar.vue';
import AppFooter from './components/AppFooter.vue';
import userData from './components/userData.vue';
import { getCurrentInstance, ref, onMounted, computed, watch, onBeforeMount } from 'vue'; //onMounted
import { useRoute } from 'vue-router';
import { io } from 'socket.io-client';
import notificationModal from './components/notificationModal.vue'
import axios from 'axios';

const { appContext } = getCurrentInstance();
// const any = ref("nn1 Player");
const menuOpen = ref(false); // Initialize the menuOpen property
const sideButton = ref(false);
const localIto = ref(localStorage.getItem('pongmeUser'));
const userRef = ref('');
const computedUser = computed(() => userRef.value);
const socket = io('http://localhost:3000');
const p1 = ref(0);
const p2 = ref(0);
watch(computedUser, () => {
  // This will trigger when computedUser changes
});

const gameDescription = `Pong - the game that made your balls hit the wall... A game so simple, even a poolie could play it.
Two players, one goal - keep the ball in play.
Sound easy? Well... the ball is a bouncy little sucker, and the game's controls are as intuitive as the first time you open Vim.
But it's addictive, it's fun, and it's the game that started it all - the king of classics.`;

const formattedGameDescription: string = gameDescription.replace(/\n/g, '<br>');
const showHelloWorldComponent = ref(false);
const showButton = ref(true);
const showNoti = ref(false);
const declined = ref(false);


const readyTo = ref(false);
onMounted(() => {
  window.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") {
      socket.emit('idle', { userid: appContext.config.globalProperties.id }, () => {
      });
    }
    else if (document.visibilityState === "visible") {
      socket.emit('logout', { userid: appContext.config.globalProperties.id }, (response: boolean) => {
        if (response === true) {
          localStorage.removeItem('pongmeUser');
          window.location.href = 'http://localhost:5173/'
        }
      });
    }
  });

  setTimeout(function () {
    readyTo.value = true;
  }, 2700);

  isOnSomeroute();
});

onBeforeMount(() => {
  socket.on('privGame', (userid1, userid) => {
    if (+appContext.config.globalProperties.id === +userid) {
      p1.value = +userid1;
      p2.value = +userid;
      declined.value = false;
      showNoti.value = true;
      setTimeout(() => {
        if (showNoti.value !== false) {
          socket.emit('declinePriv', { player1: userid1, player2: userid }, () => {
          });
          showNoti.value = false;
        }
      }, 2000);
    }
  });

  socket.on('declinedPriv', (userid1, userid) => {
    if (+appContext.config.globalProperties.id === +userid1) {
      p1.value = +userid1;
      p2.value = +userid;
      declined.value = true;
      showNoti.value = true;
      setTimeout(() => {
        showNoti.value = false;
      }, 2000);
    }
  });
});

const closeNoti = () => {
  showNoti.value = false;
}

const isOnSomeroute = () => {
  // Access the current route path from window.location
  const currentPath = window.location.pathname;
  // Check if the current route is "/someroute"
  if (currentPath === '/oauth')
    showHelloWorldAndHide();

};

const hideButton = () => {
  showButton.value = false;
};

const showHelloWorldAndHide = () => {
  // appContext.config.globalProperties.user = "nn1 Player";
  showHelloWorld(); // Call the function to show HelloWorld
  hideButton(); // Call the function to hide the button
};

const route = useRoute();
watch(() => route.params, () => {
  userName();
});

const userName = () => {
  if (appContext.config.globalProperties.user !== '')
    sideButton.value = true;
  return appContext.config.globalProperties.user;

};

const showHelloWorld = () => {
  showHelloWorldComponent.value = !showHelloWorldComponent.value;
};

const generateRandomString = (length) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let text = '';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

// const apiUid = "u-s4t2ud-045b72fbcfed0b6dd35cc540c94e9bcef5d015e8a0a745f9fbd79f26007457aa";
const startOAuthFlow = async () => {
  try {
    const codeVerifier = generateRandomString(64);

    sessionStorage.setItem('code_verifier', codeVerifier);
    const redirectUri = 'http://localhost:5173/oauth';

    const response = await axios.post('http://localhost:3000/auth/initiate-oauth', {
      // client_id: apiUid,
      redirect_uri: redirectUri,
      scope: 'public',
      response_type: 'code',
      state: codeVerifier,
    });

    // Redirect to the authorization URL received from the backend
    window.location.href = response.data.authorization_url;
  } catch (error) {
    console.error('Error initiating OAuth flow:', error);
  }
};

// const startOAuthFlow = async () => {

//   const codeVerifier = generateRandomString(64);


//   sessionStorage.setItem('code_verifier', codeVerifier);
//   const redirectUri = "http://localhost:5173/oauth";
//   const args = new URLSearchParams({
//     client_id: apiUid,
//     redirect_uri: redirectUri,
//     scope: 'public',
//     response_type: 'code',
//     state: codeVerifier,

//   });
//   window.location.href = `https://api.intra.42.fr/oauth/authorize?${args}`;

// };

</script>
    
<style scoped>
.center {

  font-family: 'Comfortaa', sans-serif;
  font-weight: 900;
  /* color:white;*/
}

/* .button-theme {
  float: right;
  display: flex;
  align-items: center;

  .button-light {
    background: #fff;
    border: 1px solid #46484e;
    color: #46484e;
  }

  .button-dark {
    background: #1c1d21;
    border: 1px solid #1c1d21;
  }
} */
</style>
