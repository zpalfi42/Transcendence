<template>
  <div v-if="ready">

    <div v-if="isLeaders" class="my_list">
      <div class="top3">
        <div v-for="(user, index) in topUsers(computedUsers)" :key="user.id">
          <div :class="getClass(index)" @click="justScream(user.id)">
            <div class=" pos">#{{ index + 1 }} </div>
            <div class="pic" :style="{ 'background-image': 'url(' + user.userPic + ')' }" :title="user.sayHi"></div>
            <div class="name">{{ user.names }}</div>
            <div class="score">{{ user.results.points }}</div>
          </div>
        </div>
      </div>
      <div v-for="(user, index) in bottomUsers(computedUsers)" :key="user.id">
        <div class="item" @click="justScream(user.id)">
          <div class="pos">{{ index + 4 }}</div>
          <div class="pic2" :style="{ 'background-image': 'url(' + user.userPic + ')' }" :title="user.sayHi"></div>
          <div class="name">{{ user.names }}</div>
          <div class="scoreFix score">{{ user.results.points }}</div>
        </div>
      </div>
    </div>


    <div v-if="isHistory">
      <div v-for="user in computedUsers" :key="user.names">
        <div v-if="user.names === userOn">

          <ul>
            <div v-for="match in user.lastMatches" :key="match.game" class="my_list">
              <div class="item forMatches">
                <!-- Results: {{ match.against }} {{ match.result }} {{ match.icon }} -->
                <div class="pos">{{ match.game }} </div>
                <div class="versus"> versus </div>
                <div class="name">{{ match.against }}</div>
                <div class="scoreFix score matches">{{ match.result }}</div>
                <div class="pic3" :style="`background-image: url(${match.icon})`"></div>
                <!-- v-bind directive (or the shorthand :) to bind the style attribute to a computed property or a data property that contains the URL value. -->
                <!-- Results: {{ match.against }} {{ match.result }} {{ match.icon }} -->
              </div>
            </div>
          </ul>
        </div>
      </div>

    </div>


    <div div v-if="isAchiev || isFriends || isSettings" class=" profile-content">
      <ul class="nav">

        <div v-if="isAchiev">
          <div v-for="user in computedUsers " :key="user.names">
            <div v-if="user.names === userOn">
              <ul>
                <li v-for="achievement in  user.achievements " :key="achievement" class="achievement-item ">
                  <img class="col iconMe" :src="getIcon(achievement, 'path')" alt="myIcon">
                  <span class="achievement-text">{{ getIcon(achievement, 'mssg') }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div v-if="isFriends">
          <div v-for="user in computedUsers " :key="user.names">
            <div v-if="user.names === userOn">
              <ul>
                <li v-for="friend in  user.friendsId " :key="friend" class="achievement-item clickable"
                  @click="justScream(friend)">
                  <img class="col iconMe" :src="users.find((u) => +u.id === +friend).userPic" alt="myIcon">
                  <span class="achievement-text">{{ users.find((u) => +u.id === +friend).names }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div v-if="isSettings" class="my-toggle">
          <div class="toggle-wrapper">
            <div class="toggle checkcross">
              <!-- Note: Move the v-model binding after the initial data fetch -->
              <input class="file-input" id="checkcross" type="checkbox" v-model="checked" @click="toggleCheckcross" />
              <label class="toggle-item" for="checkcross">
                <div class="check"></div>
                <span class="toggle-text">2F</span>
              </label>
              <!-- <notificationQr :path="qrCodeUrl" v-if="qrCodeUrl" /> -->
              <img class="iconMe fixMe" src="../assets/lock2f.jpg" alt="myLock">
              <!-- <img :src="qrCodeUrl" alt="QR Code" v-if="qrCodeUrl" /> -->
              <div class="text2f">- I want Google Authenticator! -</div>

            </div>
          </div>
        </div>
        <div v-if="isLogout" class="black-screen">
          See YOU later!
          <!-- Display a black screen when 0 -->
        </div>

      </ul>
    </div>

  </div>
</template>

<script lang="ts">
import { getCurrentInstance, defineComponent, ref, onMounted, computed, PropType, watch, onBeforeMount } from 'vue';
import { rawValue, fetchData } from '../scripts/getUsers.ts'
import { iconMe } from '../myIcons/iconMe.ts';
import axios from 'axios';
import QRCode from 'qrcode';
import { io } from 'socket.io-client';
import Swal from 'sweetalert2';




export default defineComponent({
  props: {
    showMe: {
      type: String as PropType<string>,
      required: true,
    },
    theChosen: {
      type: String as PropType<string>,
      required: true,
    },
  },
  setup(props) {
    const socket = io('http://localhost:3000');
    const { appContext } = getCurrentInstance();
    const ready = ref(false);
    const qrCodeUrl = ref('');
    const showMe = props.showMe; // Access the showMe prop
    const isAchiev = computed(() => showMe === "achievements");
    const isLeaders = computed(() => showMe === "Leaders");
    const isHistory = computed(() => showMe === "lastMatches");
    const isFriends = computed(() => showMe === "Friends");
    const isSettings = computed(() => showMe === "Settings");
    const isLogout = computed(() => showMe === "Logout");
    const userOn = props.theChosen;
    const checked = ref(false);

    const users = ref<any[]>([]); // Initialize as an empty array

    // const store = useStore();
    // onBeforeMount(async () => {
    //   socket.on('user', async () => {
    //     await fetchData().then(updatedUsers => {
    //       users.value = updatedUsers.value;
    // console.log("without hands!", updatedUsers.value)
    //       // Additional logic if needed
    //     }).catch(error => {
    //       console.error('Error fetching updated user data:', error);
    //     });

    //   });
    // });
    // Use onMounted to fetch the data when the component is mounted
    onMounted(async () => {
      socket.on('someUpdate', async () => {
        let someUpdated = await Promise.resolve(fetchData());
        users.value = someUpdated.value;
        // console.log("i did update!", users.value)
      });
      socket.on('user', async (msg) => {
        // console.log(msg);
        const fetchedData = await fetchData();
        users.value = fetchedData.value;
      });
      try {
        users.value = rawValue.value;
        // console.log("so i need this:", users.value);
        ready.value = true;

        const currentUser = users.value.find((user) => +user.id === +appContext.config.globalProperties.id);
        checked.value = currentUser ? currentUser.twoFactor : false; // Set checked based on the database value
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    });


    // computed property that watches for changes to the users array
    const computedUsers = computed(() => {
      return Array.from(users.value).sort((a, b) => b.results.points - a.results.points);
    },);

    const updateRanks = () => {
      const sortedUsers = computedUsers.value;

      for (let i = 0; i < sortedUsers.length; i++) {
        const user = sortedUsers[i];

        // Update the user.rank based on the position
        user.rank = i + 1; // Ranks start from 1, not 0

        // Emit a socket call to update the rank on the backend
        socket.emit('changeRank', { userid: user.id, rank: user.rank.toString() }, () => {
          // Callback after the socket call (if needed)
        });
      }
    };

    const topUsers = (computedUsers) => {
      // Sort the computedUsers array based on item.won and return the top 3 users
      const sortedUsers = computedUsers.sort((a, b) => b.results.points - a.results.points);
      let i = 0;
      for (let index = 0; index <= sortedUsers.length; index++) {
        if (index === sortedUsers.length || sortedUsers[index].lastMatches.length === 0) {
          i = index;
          break;
        }
      }
      return sortedUsers.slice(0, 3);
    };

    const bottomUsers = (computedUsers) => {
      // Sort the computedUsers array based on item.won and return the top 3 users
      const sortedUsers = computedUsers.sort((a, b) => b.results.points - a.results.points);
      return sortedUsers.slice(3);
    };

    const getClass = (index: number): string => {
      if (index === 0) {
        return "one item";
      } else if (index === 1) {
        return "two item";
      } else if (index === 2) {
        return "three item";
      } else {
        return ("item");
      }
    };
    const fetchUserData = (someone: string, info: string, nestedInfo: string) => {
      const user = users.value.find((user) => user.names === someone);

      if (user && nestedInfo !== "") {

        return user[info][0][nestedInfo];
      } else if (user) {
        return user[info];
      }
      else {
        const user = users.value.find((user) => user.names === '');

        if (user && nestedInfo !== "") {
          return user[info][0][nestedInfo];
        } else if (user) {
          return user[info];
        }
      }
      return "";
    };
    const getIcon = (name: string, key: string): string => {
      try {
        const iconObject = iconMe[name][key] || ''; // empty object if name not there


        return iconObject; // value or empty string
      }
      catch {
        const iconObject = iconMe["theWarrior"]["path"];
        return iconObject;
      }
    };





    const secretPick = async () => {
      try {
        console.log("FETCHING DATAAA!")
        socket.emit('authGen', { userid: appContext.config.globalProperties.id }, (response) => {
          console.log("el back me devuelve", response);
          qrCreator(response);
        });

      } catch (error) {
        console.error('Error fetching user data:', error);

      }
    };

    const qrCreator = async (secret: string) => {

      // <img :src="this.qrCodeUrl" alt="QR Code" v-if="this.qrCodeUrl" />
      const digits = 6;
      const issuer = 'transcendance42bcn2';
      const label = 'transcendance42bcn2';

      const otpauthURL = `otpauth://totp/${issuer}?secret=${secret}&issuer=${issuer}&digits=${digits}&algorithm=SHA1&period=30&label=${label}`;

      try {
        // Generate QR Code as a data URI
        const qrCodeDataURI = await QRCode.toDataURL(otpauthURL, { errorCorrectionLevel: 'L', width: 450 });

        // Set the data URI to your component's property (e.g., this.qrCodeUrl)
        qrCodeUrl.value = qrCodeDataURI;
        showQrAlert(qrCodeUrl.value);
      } catch (error) {
        console.error('Error generating QR code:', error);
        // Handle the error as needed
      }
    };

    const showQrAlert = (path: string) => {
      // console.log("sunlightttt  ", path)
      Swal.fire({
        title: 'You paranoid, here a QRCode',
        text: 'Scan it with Google Auth',
        icon: "warning",
        imageUrl: path,
        imageAlt: 'QR Code',
        background: 'pink',
        confirmButtonText: 'Got it!',
        // background: 'url(https://picsum.photos/200/300?image=504)',
        // backdrop: `
        //   rgba(0,0,123,0.4)
        //   url("https://picsum.photos/200/300?image=504")
        //   center
        //   no-repeat
        // `
      })
    };

    const toggleCheckcross = async () => {
      checked.value = !checked.value;
      // use 3000 to update 2f? because nobody needs to know abt it with sockets
      const user = users.value.find((user) => +user.id === +appContext.config.globalProperties.id);
      // console.log("sin toggle !", user.twoFactor);
      user.twoFactor = checked.value;

      // console.log("toggleadooo!", user.twoFactor);

      try {

        const userData = {
          twoFactor: user.twoFactor
        };
        const response1 = await axios.put(`http://localhost:3000/users/update/${appContext.config.globalProperties.id}/`, userData);
        if (response1.status === 200) {
          // console.log("2factor  updated")
          if (checked.value == true) {

            secretPick();
            //  showQrAlert(qrCodeUrl.value);
          }
          //crear qr y hacer pop up
        }
        else {
          // console.log("2factor  NOOOOT updated")
        }
      } catch (error) {
        // Handle errors
        console.error('Error updating 2f ', error);
      }
      return (checked.value);
    };


    const justScream = function (userid: number) {
      let name = computedUsers.value.find((u) => +u.id === +userid).names;
      // console.log("++++++++++");
      // console.log(userid);

      this.$router.push({ name: 'profile', params: { user: name }, state: { userid: userid } });
      // console.log("BEFORREEEEE SCREEEEAMMM: " + userid);
      this.$emit('justScream', userid);
      // this.$router.go();

      // this.$swal.fire({
      //   position: 'center',
      //   icon: 'info',
      //   title: 'Im a friend! Please show the profile',
      //   showConfirmButton: false,
      //   timer: 3500,
      //   allowOutsideClick: true,
      //   backdrop: true
      // })

    }
    watch(computedUsers, () => {
      updateRanks();
    });

    return {
      appContext,
      fetchUserData,
      users,
      userOn,
      getIcon,
      ready,
      computedUsers,
      toggleCheckcross,
      isAchiev, isLeaders, isFriends, isSettings, isLogout, checked, isHistory,
      getClass,
      justScream,
      topUsers,
      bottomUsers,
      updateRanks,
      qrCodeUrl,
      secretPick,
      qrCreator,
      showQrAlert

    };
  },
});
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css?family=Red+Hat+Display:400,900&display=swap');

$beige: #EAA786;
$purple: #c1e0ec;

.center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  z-index: 10;
  font-family: 'Red  Hat Display', sans-serif;
}

.top3 {
  display: flex;
  margin-top: 22px;
  justify-content: center;
  align-items: flex-end;
  color: $purple;

  .item {
    box-sizing: border-box;
    position: relative;
    background: white;
    width: 9rem;
    height: 10rem;
    text-align: center;
    padding: 2.8rem 0 0;
    margin: 1rem 1rem 2rem;
    border-radius: 0.5rem;
    transform-origin: bottom;
    cursor: pointer;
    transition: transform 200ms ease-in-out;
    box-shadow:
      0 0 4rem 0 rgba(black, 0.1),
      0 1rem 2rem -1rem rgba(black, 0.3);

    .pic {
      position: absolute;
      top: -2rem;
      left: 2.5rem;
      width: 4rem;
      height: 4rem;
      border-radius: 50%;
      background-size: cover;
      background-position: center;
      margin-right: 1rem;
      box-shadow:
        0 0 1rem 0 rgba(black, 0.2),
        0 1rem 1rem -0.5rem rgba(black, 0.3);
    }

    .pos {
      font-weight: 900;
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }

    .name {
      font-size: 1.1rem;
      margin-bottom: 0.5rem;
    }

    .score {
      // opacity: 0.5;


      display: inline;
      content: 'points';
      opacity: 1;
      margin-left: 0.5rem;
      color: black;

    }

    &.two {
      width: 11rem;
      height: 6rem;
      background: linear-gradient(to left, #C0C0C0, #808080) !important;
      box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);

      .pic {
        width: 4.5rem;
        height: 4.5rem;
        left: 3rem;
      }

      .name {
        font-size: 1.1rem;
        margin: 0 0 1.5rem 0.5rem;
        // color: $purple;
        font-weight: bolder;
      }
    }

    &.three {
      width: 11rem;
      height: 5rem;
      background: linear-gradient(to left, #eb9647, #e17121) !important;
      box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);

      .pic {
        width: 4rem;
        height: 4rem;
        left: 3.5rem;
      }

      .name {
        font-size: 1.1rem;
        margin: 0 0 2rem 0.5rem;
        // color: $purple;
        font-weight: bolder;
      }

      .score {
        // opacity: 0.5;


        margin-bottom: 0.5rem;


      }
    }

    &.one {
      width: 13rem;
      height: 7rem;
      background: linear-gradient(to left, #ffeb79c8, #ffd84ae8) !important;
      box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
      padding-top: 3.5rem;

      .pic {
        width: 5.5rem;
        height: 5.5rem;
        left: 3.5rem;
        margin-bottom: 10rem;
      }

      .name {
        font-size: 1.1rem;
        margin: 0 0 1.5rem 0.5rem;
        // color: $purple;
        font-weight: bolder;
      }
    }

    &:hover {
      transform: scale(1.10);
    }
  }
}

.scoreFix {
  // opacity: 0.5;


  display: inline;
  content: 'points';
  opacity: 1;
  margin-left: 0.5rem;
  color: black;



}

.matches::before {
  display: inline;
  content: 'Final Score ';
  opacity: 1;
  margin-left: auto;
  color: rgb(57, 46, 77);


}

.my_list {
  padding-left: 2rem;
  margin: 0 auto;
  // width: fit-content;

  .item {
    position: center;
    display: flex;
    align-items: center;
    background: white;
    height: 3rem;
    // width: fit-content;
    border-radius: 4rem;
    margin-bottom: 2rem;
    background: $beige;
    transform-origin: left;
    cursor: pointer;
    transition: transform 200ms ease-in-out;
    box-shadow:
      0 0 4rem 0 rgba(black, 0.1),
      0 1rem 2rem -1rem rgba(black, 0.3);

    .pos {
      font-weight: 900;
      position: absolute;
      left: -2rem;
      text-align: center;
      font-size: 1.25rem;
      width: 1.5rem;
      color: white;
      opacity: 0.6;
      transition: opacity 200ms ease-in-out;
    }

    .pic {
      width: 4rem;
      height: 4rem;
      border-radius: 50%;
      background-size: cover;
      background-position: center;
      margin-right: 1rem;
      box-shadow:
        0 0 1rem 0 rgba(black, 0.2),
        0 1rem 1rem -0.5rem rgba(black, 0.3);
    }

    .pic2 {
      width: 4rem;
      height: 4rem;
      border-radius: 50%;
      background-size: cover;
      background-position: center;
      margin-right: 1rem;
      box-shadow:
        0 0 1rem 0 rgba(black, 0.2),
        0 1rem 1rem -0.5rem rgba(black, 0.3);
    }

    .pic3 {
      width: 4rem;
      height: 4rem;
      border-radius: 50%;
      background-size: cover;
      box-shadow:
        0 0 1rem 0 rgba(black, 0.2),
        0 1rem 1rem -0.5rem rgba(black, 0.3);
      margin-left: auto;
    }

    .pic2-img {
      width: 50%;
      height: 50%;
      object-fit: cover;
      /* Scale and crop the image to cover the container */
    }

    .name {
      flex-grow: 2;
      flex-basis: 10rem;
      font-size: 1.1rem;
      color: white;

    }

    .versus {
      flex-grow: 2;
      flex-basis: 8rem;
      font-size: 0.8rem;
      color: #dfff51;
    }

    .score {
      margin-right: 1.5rem;
      opacity: 0.5;

      &:after {
        margin-right: 1rem;
        content: 'points';
        opacity: 0.5;
      }
    }

    &:hover {
      transform: scale(1.05);

      .pos {
        opacity: 0.8;
      }
    }
  }
}

.item.forMatches {
  background: rgb(180, 180, 220);
  /* Set the background color for elements with both .item and .forMatches classes */
}

.profile-content {
  flex: 1;
  border-radius: 50% !important;
  margin-left: 10em;
  margin-top: 5em;
  /* Fill the remaining space with content */
  padding: 20px;
  background: rgba(245, 180, 180, 0.4);
  min-height: 448px;
  max-width: 1500px;
  max-height: 450px;
  /* border-width: 100px;
  border-color: #5b9bd1; */
  border: 1px solid #ffffff;
}

@media screen and (max-width: 768px) {
  .sprofile-content {
    min-width: 630px;
    /* Adjust the value to your desired minimum width */
  }
}

.iconMe {
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.achievement-item {

  padding-top: 10%;
  position: relative;
  display: inline-flex;
  align-items: center;
  margin-right: 1em;
  /* Align items vertically */
  transition: transform 0.2s ease-in-out;

}

.achievement-item:hover .achievement-text {
  opacity: 1;
  transition: opacity 0.4s ease-in-out;
}

.iconMe {
  display: flex;
  font-size: 22px;
  width: 5em;
  height: 5em;
  align-items: center;
  border-radius: 50%;
  justify-content: center;
  margin-right: 10px !important;
}

.fixMe {
  margin-bottom: 20px;
  margin-left: 47.5px;
}

.icon-list-item {
  display: flex;
  align-items: center;
  gap: 10px;
  transition: transform 0.2s ease-in-out;
}

.iconMe:hover {
  transform: scale(1.2) rotate(13deg);
  /* Adjust the value as needed */
}

.text2f {
  background-color: #b0bed8;
  border-radius: 50px;
  border-color: #f05c5c75;
  font-family: 'Red  Hat Display', sans-serif;
  color: #effaabd2;
  font-weight: bolder;
}

.achievement-text {
  position: absolute;
  top: 7em;
  left: 0.5em;
  padding: 5px 5px;
  background-color: rgba(238, 157, 157, 0.7);
  color: white;
  font-size: 12px;
  border-radius: 4px;
  white-space: normal;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.1s ease-in-out;
}
</style>

