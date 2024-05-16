<script  lang="ts">

import { io } from 'socket.io-client';
import { iconMe } from '../myIcons/iconMe.ts';
import { getCurrentInstance, watch, ref, defineComponent, computed, getTransitionRawChildren } from 'vue';
// // import loadButton from '../subComponents/loadButton.vue';
// // import leaderBoard from './leaderBoard.vue';
import Swal from 'sweetalert2';
import axios from 'axios';
// // import loadFile from '../subComponents/loadFile.vue'
import { rawValue, fetchData } from '../scripts/getUsers.ts';
import AppFooter from './AppFooter.vue';
// import { getAdapter } from 'axios';

export default {
  name: 'profileInfo',
  props: {
    user: {
      type: String,
      requiered: true,
    },
  },

  data() {
    return {
      myUserid: ref(0),
      profileUserid: window.history.state.userid,
      userid: new Number(window.history.state.userid),
      socket: io('http://localhost:3000'),
      users: rawValue.value,
      whichOne: ref('Leaders'),
      userRef: ref(this.user),
      showedName: ref(""),
      rootUser: ref(true),
      buttonsShow: ref(false),
      profilePic: ref(""),
      userRank: ref(""),
      userResult: ref<any>([]),
      profilePicData: "",
      userRankData: null,
      wonData: null,
      lostData: null,
      totalData: null,
      app: getCurrentInstance(),
      user1: "",
      iconSrc: '',
      logged: 0,
      myProfile: null,
      Profile: null,
    }
  },

  methods: {
    async getData(someone: string, info: string, nestedInfo: string) {
      const someInfo = await fetchData();
      this.users = someInfo.value;
      const user = this.users.find((a) => a.names === someone);

      this.userid = window.history.state.userid;
      if (user && nestedInfo !== "") {
        return user[info][nestedInfo];
      } else if (user) {
        return user[info];
      }
      return "";
    },

    async updateProfilePic() {
      this.profilePic = await this.getData(this.user1, 'userPic', '');
      this.socket.emit('picChanged');
    },

    async getIcon(name: string, key: string): Promise<string> {
      let iconObject = "";
      if (name !== null) {
        if (name.substring(0, 5).startsWith("http:"))
          iconObject = name;
        else
          iconObject = iconMe[name][key] || '';
      }
      else
        iconObject = iconMe["aLover"][key] || '';
      return iconObject;
    },

    async setComp(name: string) {
      this.whichOne = name;
      if (name === 'Logout') {
        // console.log("LLAMEEE LOGOUT!")
        this.socket.emit('logout', { userid: this.app.appContext.config.globalProperties.id }, () => { });
        localStorage.removeItem('pongmeUser');
        window.location.href = "http://localhost:5173/";
      }
      return this.whichOne; // value or empty string
    },

    async addMe(userid: number) {
      Swal.fire({
        title: 'You have a new buddy: ' + this.user1,
        width: 500,
        padding: '2em',
        color: '#6a9ddd',
        background: '#fff url(/images/trees.png)',
        confirmButtonColor: '#87CEEB',
        confirmButtonText: 'Who cares!',
        backdrop: `
          rgba(128,0,128,0.2)
          left top
          no-repeat
        `
      });

      this.socket.emit('addFriend', { userid1: this.app.appContext.config.globalProperties.id, userid2: this.userid }, () => {
      });
    },

    async QuitMe(userid: number) {
      Swal.fire({
        title: 'You have a cold soul, ' + this.user1 + " is not longer your friend.",
        width: 500,
        padding: '2em',
        color: '#6a9ddd',
        background: '#fff url(/images/trees.png)',
        confirmButtonColor: '#eaed75',
        confirmButtonText: 'Bye bitch!',
        backdrop: `
          rgba(gb(255,255,0,0.3)
          left top
          no-repeat
        `
      });

      this.socket.emit('deleteFriend', { userid1: this.app.appContext.config.globalProperties.id, userid2: this.userid }, () => {
      });
    },

    async setNick(name: string) {
      if (this.users.some(user => user.names === name)) {
        Swal.fire({
          position: 'center',
          icon: 'error',
          title: 'Ooops',
          text: 'You have this Name already!',
          showConfirmButton: false,
          timer: 3500,
          allowOutsideClick: true,
          backdrop: true
        });
      }
      else {
        this.socket.emit('changeUserName', { userid: this.app.appContext.config.globalProperties.id, name: name }, () => {
        });
        this.app.appContext.config.globalProperties.user = this.user1 = name;
        this.socket.emit('picChanged');
      }
    },

    async whoamI() {
      if (this.app.appContext.config.globalProperties.user === this.user1) {
        this.buttonsShow = false;
        return true;
      }
      this.buttonsShow = true;
      return false;
    },

    async play() {
      this.profileUserid = window.history.state.userid;
      this.socket.emit('playPriv', { player1: this.myUserid, player2: this.profileUserid }, (response) => {

      });

      this.socket.once('gamePriv', (response: boolean) => {
        if (response)
          this.$router.push({ name: 'play', state: { userid: this.myUserid, priv: true, office: false }, params: { mode: 'standard' } });
      });
    },

    async createPrivate() {
      return new Promise<void>((resolve) => {
        this.socket.emit('createRoom', { roomName: this.Profile.names, owner: -1, password: "", type: 2 }, (response) => {
          console.log(response.roomId);
          resolve(response.roomId);
        });
      });
    },

    async assignPrivate(rid: number) {
      return new Promise<void>((resolve) => {
        this.socket.emit('assignPrivate', { user1id: this.Profile.id, user2id: this.myProfile.id, roomid: +rid }, (response) => {
          console.log("ADEEEEUUU3");
          console.log(response);
          resolve();
        });
      });
    },

    async textMe() {
      let id = this.app.appContext.config.globalProperties.id;
      for (const user in this.users) {
        // console.log(id + " ?=? " + this.users[user].id);
        if (+id === +this.users[user].id) {
          this.myProfile = this.users[user];
        }
        if (+this.userid !== -1 && +this.userid === +this.users[user].id) {
          this.Profile = this.users[user];
        }
      };

      // console.log(this.myProfile)
      let priv = this.myProfile.privateRooms;
      // roomId.value = priv.find((r) => r.userid === +userid).chatid;
      let room = priv.find((r) => r.userid === +this.userid);
      console.log("------> ");
      console.log(room);
      if (room === undefined || room === null) {
        console.log("CREATE:");
        let rid = await this.createPrivate();
        console.log("ASSIGN:");
        await this.assignPrivate(+rid);
      }
      this.$router.push({ name: 'chat', state: { user: this.app.appContext.config.globalProperties.user, userid: +this.userid } });
    },

    async justScream(userid: number) {
      // console.log("SCREEEEAMMM: " + userid);
      this.profileUserid = +userid;
    }
  },

  computed: {
    async iconHandler() {
      const obj = await this.getIcon(this.profilePic, 'path');
      return obj;
    },
  },

  watch: {
    async user(newUser, oldUser) {
      // console.log("USER CHANGED");
      fetchData();
      this.user1 = newUser;
      this.whichOne = 'Leaders';
      // whichOne.value = 'achievements';
      this.rootUser = await this.whoamI();

      this.profilePic = await this.getData(this.user1, 'userPic', '');
      this.userRank = await this.getData(this.user1, 'rank', '');
      this.wonData = await this.getData(this.user1, 'results', 'won');
      this.lostData = await this.getData(this.user1, 'results', 'lost');
      this.totalData = await this.getData(this.user1, 'results', 'total');
      this.logged = await this.getData(this.user1, 'logged', 'n');
      this.userResult = [this.wonData, this.lostData, this.totalData];
      if (this.rootUser && this.logged === 0)
        this.setComp("Logout");
    },

    rawValue(newData) {
      // console.log("RAWDATA CHANGED");
      const users = newData;
    },

    profilePic: {
      immediate: true,
      handler(newValue) {
        if (newValue !== '') {
          this.getIcon(newValue, 'path').then(result => {
            this.iconSrc = result;
          });
        };
      },
    },
  },

  mounted() {
    if (window.history.state.logout === true) {
      this.setComp('Logout');
    }
    this.socket.on('user', async (msg) => {
      // console.log(msg);
      const fetchedData = await fetchData();
      this.users = fetchedData;
      this.profilePic = await this.getData(this.user1, 'userPic', '');
      this.userRank = await this.getData(this.user1, 'rank', '');
      this.wonData = await this.getData(this.user1, 'results', 'won');
      this.lostData = await this.getData(this.user1, 'results', 'lost');
      this.totalData = await this.getData(this.user1, 'results', 'total');
      this.logged = await this.getData(this.user1, 'logged', 'n');
    });
    this.socket.on('someUpdate', async () => {
      let someUpdated = await Promise.resolve(fetchData());
      this.users = someUpdated.value;
      // console.log("i did update!", this.users)
    });

  },


  async created() {
    this.myUserid = this.app.appContext.config.globalProperties.id;
    this.user1 = ref(this.user);
    this.profilePic = await this.getData(this.user1, 'userPic', '');
    this.userRank = await this.getData(this.user1, 'rank', '');
    this.wonData = await this.getData(this.user1, 'results', 'won');
    this.lostData = await this.getData(this.user1, 'results', 'lost');
    this.totalData = await this.getData(this.user1, 'results', 'total');
    this.logged = await this.getData(this.user1, 'logged', 'n');
    this.userResult = [this.wonData, this.lostData, this.totalData];
    this.iconSrc = await this.getIcon(this.profilePic, 'path');
    this.rootUser = await this.whoamI();
    // console.log(window.history.state);

  },
}

</script>

<template>
  <div>
    <div class="row profile">
      <!-- <div class="col-md-3"> -->
      <!-- <div>{{ fetchUserData("nn1 Player", "rank") }}</div> -->
      <div class="col profile-sidebar some-fixes-left">
        <div class="myRank">myRank #{{ userRank }}</div>

        <!-- SIDEBAR USERPIC -->
        <div class="profile-userpic">

          <img v-if="profilePic !== ''" :src="iconSrc" class="img-fluid" alt="">
          <!-- <loadButton /> -->

          <loadButton v-if="rootUser" :message="user" :userId="userid.toString()" @nickname-updated="setNick"
            @profile-pic-updated="updateProfilePic">
          </loadButton>
        </div>
        <!-- END SIDEBAR USERPIC -->

        <!-- SIDEBAR USER TITLE -->
        <div class="profile-usertitle" v-if="showedName !== ''">
          {{ showedName }} 🎮
        </div>
        <div v-else class="profile-usertitle">
          {{ user1 }} 🎮
        </div>
        <div class="profile-online" v-if="logged === 1">
          <img src="../assets/onn.png" alt="Settings image" class="status-pic">
          Online
        </div>
        <div class="profile-offline" v-else-if="logged === 0">
          <img src="../assets/off.png" alt="Settings image" class="status-pic-off">
          Offline
        </div>
        <div class="profile-online" v-else-if="logged === 2">
          inQueue
        </div>
        <div class="profile-online" v-else-if="logged === 3">
          inGame
        </div>
        <div class="profile-online" v-else>
          inIdle
        </div>
        <!-- END SIDEBAR USER TITLE -->

        <!-- SIDEBAR BUTTONS -->
        <div v-if="buttonsShow" class="profile-userbuttons">
          <div v-for="a in users" :key="a.names">
            <div v-if="a.names === app.appContext.config.globalProperties.user">

              <button v-if="a.friendsId.includes(+userid)" type="button" class="btn btn-success btn-sm"
                @click="QuitMe(userid)">QuitMe</button>
              <button v-if="!a.friendsId.includes(+userid)" type="button" class="btn btn-success btn-sm"
                @click="addMe(userid)">AddMe</button>
              <button type="button" class="btn btn-danger btn-sm" @click="textMe()"><span>TextMe</span></button>
              <!-- <router-link type="button" class="btn btn-danger btn-sm"
                :to="{ name: 'chat', state: { user: app.appContext.config.globalProperties.user, userid: +userid } }"
                @click="textMe()"><span>TextMe</span></router-link> -->

              <button type="button" class="btn btn-danger btn-sm" @click="play()" v-if="logged === 1">ChallengeMe</button>
              <router-link type="button" class="btn btn-success btn-sm"
                :to="{ name: 'spectateMe', state: { userid: +profileUserid } }" @click="" v-else-if="logged === 3">
                <button type="button" class="btn btn-danger btn-sm">SpectateMe</button></router-link>

            </div>
          </div>
          <!-- <button type="button" class="btn btn-danger btn-sm">PlayMe</button> -->
        </div>
        <!-- END SIDEBAR BUTTONS -->

        <!-- SIDEBAR MENU -->
        <div class="profile-usermenu">
          <ul class="nav">

            <li>
              <a @click="setComp('Leaders')" class="clickable">
                Leaderboard!
              </a>
            </li>
            <li>
              <a @click="setComp('achievements')" class="clickable">
                Overview
              </a>
            </li>
            <li>
              <a @click="setComp('Friends')" class="clickable">
                Friends </a>
            </li>
            <li>

              <a v-if="user1 === this.app.appContext.config.globalProperties.user" @click="setComp('Settings')"
                class="clickable">
                Settings </a>
            </li>
            <li>
              <a @click="setComp('lastMatches')" class="clickable">
                Last Matches </a>
            </li>
            <li>
              <!-- <router-link to="/" @click.native="setComp('Logout')" class="clickable"><span>Log
                  Out</span></router-link> -->

              <a @click="setComp('Logout')" class="clickable" href="#">
                Log Out </a>
            </li>
          </ul>
          <!-- </div> -->
          <!-- END MENU -->

          <!-- STATS -->
          <div v-if="user1 !== 'undefined'" class=" row  profile-stat">


            <div class="col-md-4 col-sm-4 col-xs-6">
              <div class="uppercase profile-stat-title"> {{ userResult[0] }} </div>
              <div class="uppercase profile-stat-text stat-won"> Won </div>
            </div>
            <div class="col-md-4 col-sm-4 col-xs-6">
              <div class="uppercase profile-stat-title"> {{ userResult[1] }} </div>
              <div class="uppercase profile-stat-text stat-lost"> Lost </div>
            </div>
            <div class="col-md-4 col-sm-4 col-xs-6">
              <div class="uppercase profile-stat-title"> {{ userResult[2] }} </div>
              <div class="uppercase profile-stat-text"> Games Played </div>
            </div>
          </div>
          <!-- END STAT -->


        </div>
      </div>
      <div class="col-md-9 some-fixes">
        <!-- why is not refreshing as it should instead of using this ugly if nest -->
        <div v-if="whichOne === 'Friends'">
          <leaderBoard @justScream="justScream" :showMe="whichOne" :theChosen="user1" />
        </div>
        <div v-else-if="whichOne === 'achievements'">
          <leaderBoard @justScream="justScream" :showMe="whichOne" :theChosen="user1" />
        </div>
        <div v-else-if="whichOne === 'Settings'">
          <leaderBoard @justScream="justScream" :showMe="whichOne" :theChosen="user1" />
        </div>
        <div v-else-if="whichOne === 'lastMatches'">
          <leaderBoard @justScream="justScream" :showMe="whichOne" :theChosen="user1" />
        </div>
        <div v-else>
          <leaderBoard @justScream="justScream" :showMe="whichOne" :theChosen="user1" />
        </div>
        <!-- <leaderBoard :showMe="displayedWhichOne" /> -->
      </div>

    </div>
  </div>
</template>

<style scoped>
/* Profile container */
/* .nav {
  display: inline;
  justify-content: center;
  align-items: center;
} */
.some-fixes-left {
  min-width: 222px;
  max-width: 600px;
  min-height: 635px;
  padding: 5px;
}




some-fixes {
  display: inline;
  justify-content: center;
  align-items: center;
}

.profile {
  margin-top: 2em;
  padding-left: 2em;
  display: flex;
  /* align-items: flex-start; Align items to the top of the flex container */
}

.profile-sidebar {
  flex: 1;
  border-radius: 10% !important;
  /* Adjust the width of the sidebar as needed */
  padding: 15px 0 10px 0;
  background: rgba(138, 204, 204, 0.4);
  border: 2px solid #ffffff;
}



.profile-userpic img {
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

.profile-usertitle {
  text-align: center;
  margin-top: 20px;
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 7px;
  color: #dfff51;
}

.myRank {
  float: none;
  /* text-align: left; */
  /* margin: 5em 5em 0 0; */
  font-size: 25px;
  font-weight: bold;
  /* margin-bottom: 7px; */
  color: #7aad8f;
}

.myRank:hover {
  transform: scale(1.3);
}

.profile-userbuttons .btn {
  text-align: center;
  margin-top: 10px;
  text-transform: inherit;
  font-size: 16px;
  font-weight: 600;
  padding: 6px 15px;
  /* top+bottom right+left */
  margin-right: 5px;

}

.profile-userbuttons .btn:last-child {
  margin-right: 0px;
}

.profile-usermenu {

  margin-top: 20px;
  margin-right: 3em;
}

.profile-usermenu li:hover {
  translate: 0 -0.8ch;
  scale: 1.2;
}

.profile-usermenu ul li {
  list-style: none;
  position: relative;
}

.profile-usermenu ul li a {

  color: #93a3b5;
  font-size: 21px;
  font-weight: 700;
  transition: transform 0.3s ease;
}

.profile-usermenu ul li:hover a {
  transform: scale(1.5);
  /* Zoom in effect */
}

.profile-usermenu ul li::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(221, 70, 163, 0.3);
  /* last val == transparency  */
  filter: blur(9px);
  opacity: 0;
  z-index: -1;
  transition: opacity 0.3s ease;
}

.profile-usermenu ul li:hover::before {
  opacity: 1;
  /* Show the blurred overlay on hover */
}

.profile-usermenu ul li.active {
  border-bottom: none;
}

.profile-usermenu ul li.active a {
  color: #5b9bd1;
  background-color: #fbf8f6;
  border-left: 2px solid #5b9bd1;
  margin-left: -2px;

}

/* Profile Content */


.profile-stat {
  margin-top: 10px;
  margin-bottom: 15px;
  margin-left: 3em;
  /* padding-bottom: 20px; */
  /* border-bottom: 1px solid #018df8; */
}

.profile-stat-title {
  color: #7f90a4;
  font-size: 25px;
  text-align: center;
}

.uppercase {
  text-transform: uppercase !important;
}

.profile-stat-text {
  color: #5b9bd1;
  font-size: 10px;
  font-weight: 600;
  text-align: center;

}

.status-pic {
  width: auto;
  height: 30px;
  opacity: 1;

  animation: flash 1.3s;
}

.status-pic-off {
  width: auto;
  height: 40px;
  opacity: 1;

  animation: flash 1.3s;
}

.stat-won {
  color: #dfff51;
}

.stat-lost {
  color: #db6076;
}

.clickable {
  cursor: pointer;
  text-decoration: none;
}

.profile-online {
  color: rgb(0, 194, 26);
}

.profile-offline {
  color: red;
}

@keyframes rotate {
  100% {
    transform: rotate(-360deg);
  }
}
</style>
