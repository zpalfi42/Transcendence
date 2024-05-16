# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Type Support For `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) to make the TypeScript language service aware of `.vue` types.

If the standalone TypeScript plugin doesn't feel fast enough to you, Volar has also implemented a [Take Over Mode](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669) that is more performant. You can enable it by the following steps:

1. Disable the built-in TypeScript Extension
   1. Run `Extensions: Show Built-in Extensions` from VSCode's command palette
   2. Find `TypeScript and JavaScript Language Features`, right click and select `Disable (Workspace)`
2. Reload the VSCode window by running `Developer: Reload Window` from the command palette.
☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢

<Using templates out of date>:

npm update -g @vue/cli

npm update vue

npm update // Update other dependencies

☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢

<What is a Vue component?> 
The best thing you can do if you don't know Vue is to read at least its introduction https://vuejs.org/v2/guide/index.html but let's see very quickly the parts of a Vue component:

A typical Vue component will have <template>, <script> and <style> sections, in a file with a .vue extension.
Vue Component Life Cycle offers methods like mounted, updated and destroyed, you can read more at https://vuejs.org/v2/guide/instance.html#Lifecycle-Diagram
A component has a 'data' attribute to declare its local state, and the advantage over other libraries is that it is automatically reactive so it updates the view when the data object changes.
The behavior will go in 'methods', and can have properties in 'props' and computed properties in 'computed', which are usually simple methods that we don't want to have directly in the view template, with the advantage that they are cached and only they are recalculated if their dependent properties have changed, as explained in https://vuejs.org/v2/guide/computed.html
These self-contained components with view and behavior (or not), are called SFC (Single File Component). 
Although there are several ways to distribute the definition of our components in files, in this course we will always base ourselves on the example of SFCs in which, we repeat: Html template, the javascript code and the definition of styles of our component reside in the same file.
e.g. page: https://vuejs.org/guide/introduction.html#api-styles
☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢

The code <import { ref, onMounted } from 'vue';> imports two functions from the Vue library:

<ref>: This function creates a reference to a DOM element or child component instance. The reference can be used to access the element or instance after it is mounted.
<onMounted>: This is a lifecycle hook that is called after the component is mounted. It can be used to perform tasks that require the component to be mounted, such as initializing DOM elements or subscribing to events.

☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢
<SVG FILES> not useless
https://new.express.adobe.com/tools/convert-to-svg
☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢
<Ideas for buttons, etc>   
https://codepen.io

☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢
<Quasar?>
https://www.youtube.com/watch?v=qPkSwo8QyoA
☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢

<vue computed>
So, while both computed in Vue and useEffect in React are used for managing side effects and derived data, computed properties are more focused on efficient reactivity and computed values, whereas useEffect is more versatile and can handle various side effects.
☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢

<vue router>
import { RouteRecordRaw, createRouter, createWebHistory } from 'vue-router';
const routes: RouteRecordRaw[] = [
	{ path: '/', component: Null },
		// and keep going
];
const router = createRouter({
	history: createWebHistory(),
	routes
})
app.use(router);

<router-link to="/helloworld">Hello World</router-link>
<router-view></router-view>  The default behavior is to load the "/" + whatever you asked for.

Also you can do things like this one (<a link inside a button>): 

<router-link to="/helloworld"><button v-if="showButton" @click="showHelloWorldAndHide"
        style="font-size: 1.3em; font-weight: 600;">Log in!</button></router-link>
    <router-view></router-view>
☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢

<div v-if and div v-else>
Render any depending on the conditional
☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢

<scoped CSS in Vue>
https://vuedose.tips/the-importance-of-scoped-css-in-vue-js
☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢

<text Formats>
I would recommend using a library like https://Animate.css or GSAP (GreenSock Animation Platform). Animate is a relatively simple and easy-to-use library that provides a range of animations for different HTML elements, including text. GSAP is a more powerful and versatile library that offers a wider range of animations and effects. Either one would be a good choice, depending on your needs and level of expertise.

☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢
<Oauth 2.0 info>:

OAuth 2.0 is an authorization framework that allows users to grant third-party applications access to their resources without having to share their passwords. When you connect to an API using OAuth 2.0, you will need to obtain an access token from the API's authorization server. This token will allow you to make authorized requests to the API.

The basic steps involved in connecting to an API using OAuth 2.0 are as follows:

Register your application with the API's authorization server.
Obtain a client ID and client secret from the authorization server.
Create an authorization request.
Redirect the user to the authorization server's authorization endpoint.
Receive the user's authorization grant.
Exchange the authorization grant for an access token.
Use the access token to make authorized requests to the API.
Here are some additional things to keep in mind when connecting to an API using OAuth 2.0:

The authorization server will typically provide you with a set of scopes that you can request access to. The scopes define the resources that the API will allow you to access.
The access token will typically expire after a certain period of time. You will need to obtain a new access token before the old one expires.

Hash and Salt Passwords:

Use a suitable hashing algorithm (like bcrypt) to hash the passwords before storing them in the database. This provides a level of security in case your database is compromised.

https://gauravjoshi.hashnode.dev/building-a-system-for-user-registration-and-login-using-typescript-part-2

login in nestJS: https://blog.logrocket.com/social-logins-nestjs/

<OAuth 42 Intra>
During development, for OAuth to work, you will first need to:

create an app on the intra.
as the redirect URI, enter the following: http://localhost:5173/oauth.
in the .env file which is located in the root of the project, place the following three variables:
INTRA_API_UID=applicationUID
INTRA_API_SECRET=secretToken
STATE_STRING=a_very_long_random_string_which_must_be_unguessable
replace the value of the first two variables with your app's UID and secret which you can find in your app's page.
replace (or not) the value of the third variable with an unguessable random string. It is used to protect against cross-site request forgery attacks.

create an .env file inside the root of the frontend folder and place the following two variables in it:
VITE_INTRA_API_AUTHORIZE_URL=auth_url
VITE_STATE_STRING=a_very_long_random_string_which_must_be_unguessable
as the value of the first variable, you should write the long url that you can find in your app's page (it looks like this but longer: https://api.intra.42.fr/oauth/authorize/your_formatted_url).
as the value of the second variable, you should write the exact same string you put into the other .env's STATE_STRING variable.
(if necessary, do not forget to bring down the docker-compose container and bring it back up)

Auth
The authentication is based on an api key. To obtain a key, first you need to POST your credentials at /auth/login. Endpoint doc.

If credentials are valid the endpoint will return a JSON with the access token.
 
{
    accesst_token: "qwer.asdf.zxcv"
}
The returned token must be used on the protected endpoints. The token must be sent with the request in the Authorization header with the word Bearer before the token.

curl -H "Authorization: Bearer qwer.asdf.zxcv" -X POST www.example.com/api/endpoint
If the token on the request is invalid the backend should return HTTP 401 error code

curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" https://api.intra.42.fr/v2/users/:user_id/titles

https://api.intra.42.fr/apidoc/guides/web_application_flow
https://github.com/GonzSanch/42-api-oauth/blob/main/42-Node/front/src/App.js
☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢
<button with slide in q>

<div class="q-px-sm q-py-lg">
    <q-fab color="pink-2" text-color="cyan-2" icon="<" direction="left" class="top-left-fab">
      <q-fab-action color="cyan-2" text-color="pink-2" @click="onClick" icon="iN" />
      <q-fab-action color="cyan-2" text-color="pink-2" @click="onClick" icon="oUt" />
    </q-fab>


  </div>

<Mozilla>  about:config dom.element.popover.enabled TRUE! 
☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢

<Chat ideas>
https://www.vuescript.com/realtime-advanced-chat/
https://www.youtube.com/watch?v=SZlsP5uxYjk
https://chatkitty.com/blog/building-a-vue-js-chat-app-with-vue-advanced-chat

Creating a new chat room in your application using ChatKitty is straightforward. Here's a simple guide:

JS:

let result = await kitty.startChat({
    type: 'PUBLIC',
    name: 'Room Name'
});

let chat = 
result.chat
;
const chatKitty = ChatKitty.getInstance({
  apiKey: 'YOUR_CHATKITTY_API_KEY',
});

// Create a new Private one
const room = chatKitty.createRoom({
  name: 'My Protected Room',
  // Add any other metadata you need
});
// Set a password for the chat room
room.setRoomPassword('myPassword');

// do something with chat...

This will create a new public chat room with the name "Room Name". The 
startChat method returns a promise that resolves to a result object containing the chat room details.
Please note that this code is for the client-side JavaScript SDK. If you're using another language or framework, you'd use the equivalent methods for that language or framework.
Remember, for this to work you have to have initialized your kitty instance with ChatKitty.getInstance(YOURAPIKEY);
And handle any potential errors for the Promise!

ChatKitty provides three types of chat rooms:
1. 'DIRECT' - These chat rooms are for direct messaging between two users.
2. 'PRIVATE' - These chat rooms are for group conversations that aren't discoverable by anyone who's not a member.
3. 'PUBLIC' - These chat rooms are open for anyone on the application to join and are discoverable by all users.
You can specify the chat type when you're creating a new chat room with the 'startChat' function by setting the 'type' parameter. Make sure to choose the one that fits your application's needs.

Usage in logic for user

<button @click="joinChatRoom">Join Chat Room</button>

export default {
  methods: {
    joinChatRoom() {
      const roomId = 'YOUR_ROOM_ID';
      const password = 'YOUR_PASSWORD';

      // Call the joinRoom method to join the chat room with the specified parameters
      chatKitty.joinRoom({
        roomId: roomId,
        password: password,
      });
    },
  },
};

<button @click="createPublicRoom">Create Public Room</button>
<button @click="DeleteARoom">DeleteARoom Public Room</button>
export default {
  methods: {
    createPublicRoom() {
      // Call the createRoom method to create a public room
      chatKitty.createRoom({
        type: 'public',
      })
      .then((room) => {
        // Handle the created room object
        console.log('Public room created:', room);
      })
      .catch((error) => {
        // Handle any errors that occurred during room creation
        console.error('Error creating public room:', error);
      });
    },
  },
};

<Real way for bkend chat>
https://arctype.com/blog/postgres-nestjs/
https://github.com/RodDomin/chat-backend/tree/master
☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢

<LOGS
Playing with Code Whisperer, install from https://marketplace.visualstudio.com/items?itemName=AmazonWebServices.aws-toolkit-vscode
Log 19/8: Added a fake backend npx json-server --watch db.json (reading from the db.json with users), https://www.simplethread.com/fake-it-till-you-make-it/
Log 20/8: Added stule colors, sizes, logos, a few classes, playing with the HelloWorld component.
Log 20/8: Added vue-router for SPA (Single page app), added a few component playing with the dependencies and props: ie. HelloWorld that needs a string as "msg".
Log 21/8: Added animate.css for text bullshit + typing mode, also changed to .scss instead plain css. Changed logo for a 42 pixel art one.
Log 23/8: Added Sidebar, tidy up in all components.
Log 25/8: Playing with chatkitty  src/chatkitty/index.ts   +  src/components/chatMe.vue    +    src/utils/dates.ts. https://chatkitty.com/docs/concepts/channels API key
8efac222-5429-40a5-ac77-9ed890970a3c
Log 27/8: Achievement and Icons ON, iconMe.ts as Dictionary with path and mssg(description) of each one, all showed by profileInfo.vue.
Log 28/8: Contextual Menu hidden till Logged in, using routes instead refs for SPA. User Info is less ugly now
Log 30/8: Added fucking finally a button for uploading avatar -script in loadButton.vue- Axios manages the post of the file selected, filtered byt type already (jpeg, gif, pfd, png).
Log 31/8: Fixed some buttons, <FYI:if something is not showing check the fucking .SCSS or scoped styles. Added "input type="text" v-model="message" for @nickname changes.
Log 1/9: User nickname updated by the user promp.
Log 3/9: Leader Board workin from database.
Log 5/9: Match History.
Log 6/9: Checking id before change names: setNick L144 in ProfileInfo
Log 9/9: Everything almost connected (picking data from the database - the fake one of course-), go to someones profile, show add and text button (play after?), hide change nick if its not my user, etc.
Log 10/9: Showing add or quit for a friend (checking in my user.friends), achievements and friends pictures being picked from db.
Log 12/9: Playing with the game pongmE.Vue, 2 players, could make it for playing against the computer also (a commit before), picking info about the user in the match, fixing things. Added audio .play(), added specials, sticky paddle / allPaddle (spacebar-'p').
Log 15/9: Working on speed depending on impact point (modify x.vel and y.vel for angles). Speeding ball in between rounds(now we count them). More Specials like modify the ball speed?
Log 16/9: Changing some colors, speed adjustments.
Log 17/9: Upload avatar fixed, added sound, 42 app created for api concerns, game finished if needed.
Log 18/9: theOffice mode on, added property at mounted to check which mode is on and render consequently.
{{TODO}}: User settings keep working on it TRY TO CHANGE SOMETHING FROM THE DATABASE!!! 
>Alerts: Play() giving some errors

<Online Transcendence>:
https://transcendence.nforay.dev/
https://versus-transcendence.com/
https://gitlab.com/ft_transcendance/ft_transcendance
https://stackoverflow.com/questions/66147328/is-there-a-way-to-debug-code-in-vscode-initiated-with-vite


<Icon libraries >: 
https://iconscout.com/unicons/explore/line?redirect=%2Funicons%2Fexplore%2Fline%3Fcolor%3D%252523EA75AA%26name%3Dairplay
https://github.com/IconScout/vue-unicons
https://htmlcheatsheet.com/css/

```typescript // how to highlight this stupid readme 
<Useful>:

SweetAlert2: AJAX request example good for checking users and other kind of data https://sweetalert2.github.io/s
Ref: always for creating reactive var
Computed: to check changes and refresh the template (always!)
The Array.from() function takes two arguments: the iterable object and the callback function. The iterable object is the object that you want to convert to an array. The callback function is a function that is called for each item in the iterable object. The callback function should return the value that you want to include in the array.



props: example: export default defineComponent({
  props: {
    showMe: {
      type: String as PropType<string>,
      required: true, // You can change this to match your requirements
    },
  },
  setup(props) {
    const store = useStore();
    const ready = ref(false);
    const showMe = props.showMe; //... From comp1.vue ill call this comp like <comp2 :showMe='whatever var ill pass'

npm install vue-clickaway => <div v-clickaway="onOutsideClick">
  This is a modal dialog. Click outside of it to close it.
</div>

Actually making modifications to the store (./store/index.ts), but for backend calls should be like :
const updateWon = async (userId, won) => {
  try {
    const response = await axios.put(`http://localhost:3000/users/${userId}`, { won });
    if (response.status === 200) {
      // Update the store if needed
      store.commit('updateWon', { userId, won });
    } else {
      console.error('Failed to update user data:', response.data);
    }
  } catch (error) {
    console.error('Error updating user data:', error);
  }
};




<DATABASE usefeul?>
To save the given data structure in a PostgreSQL database, you can create a table with appropriate column definitions to store each field of the data. Here's an example of how you can create a table to store this data structure:

CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    names VARCHAR(255),
    type VARCHAR(255),
    friends TEXT[],
    achievements TEXT[],
    logged INTEGER,
    won INTEGER,
    picture VARCHAR(255),
    sayHi VARCHAR(255),
    results JSONB,
    lastMatches JSONB,
    userPic VARCHAR(255),
    rank VARCHAR(255)
);
In this table definition, we have used the JSONB data type for the results and lastMatches columns to store the nested JSON data. The other columns have been defined based on the data types of their corresponding fields.

Once you have created the table, you can insert the data into the table using the INSERT statement. Here's an example of how you can insert the first user's data into the users table:

INSERT INTO users (id, names, type, friends, achievements, logged, won, picture, sayHi, results, lastMatches, userPic, rank)
VALUES (1, 'nn1 🎮', 'thePro', ARRAY['marc', 'palfi', 'nn2 🎮'], ARRAY['pro', '1stplayer'], 1, 20, '../src/myIcons/p5.png', 'fockU!', '{"won": 11, "lost": 10, "total": 21}', '[{"game": 1, "against": "player2", "result": "5-2", "icon": "../src/myIcons/win.png"}, {"game": 2, "against": "player3", "result": "1-3", "icon": "../src/myIcons/lose.png"}, {"game": 3, "against": "player2", "result": "5-4", "icon": "../src/myIcons/win.png"}, {"game": 4, "against": "player4", "result": "3-4", "icon": "../src/myIcons/lose.png"}, {"game": 5, "against": "player3", "result": "5-2", "icon": "../src/myIcons/win.png"}]', 'aLover', '13');
You can repeat this INSERT statement for each user in the data structure to populate the users table with all the data.

Note that the table definition and the INSERT statement assume that you have installed the jsonb extension in your PostgreSQL database. If you haven't installed it, you can do so by running the following command:

CREATE EXTENSION IF NOT EXISTS "jsonb";
This will enable the jsonb data type for storing JSON data in PostgreSQL.

Remember to modify the column names and data types according to your specific needs.



https://codepen.io/alexmwalker/pen/DzNPej  => /*squash ball*/

https://codepen.io/gdube/pen/JybxxZ  => sounds + starts with a key, more speed each round , round with different points 5,3,5,3 etc





otp: 
To use const secret = authenticator.generate in a Vue app, you would need to install the otplib library and import the authenticator module into your Vue component.

Here are the steps to use authenticator.generate in a Vue app:

    Install the otplib library by running the following command in your Vue app's directory:

npm install otplib

Import the authenticator module into your Vue component:

import { authenticator } from 'otplib';

Use the authenticator.generate method to generate a secret key:

const secret = authenticator.generateSecret();

The generateSecret method generates a new secret key that can be used for OTP generation.

You can then use the secret variable to generate an OTP:

const otp = authenticator.generate(secret);

The generate method takes the secret key as an argument and generates a new OTP based on the current time.

Note that the generate method generates a new OTP every 30 seconds by default. If you want to generate an OTP for a specific time, you can pass the time parameter to the generate method.

const otp = authenticator.generate(secret, time);

Replace time with the desired time in milliseconds.


<SOCKETS!>
in backend: this.server.emit('someVar', updatedGame);
in frontend:     socket.on('someVar', (response) => {
                console.log('Received updated game:', response); });
