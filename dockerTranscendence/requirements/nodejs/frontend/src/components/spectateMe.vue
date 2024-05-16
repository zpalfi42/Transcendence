<template>
    <head>
        <link href='https://fonts.googleapis.com/css?family=Orbitron:900' rel='stylesheet' type='text/css'>
    </head>

    <body class="game-container">
        <div v-if="asyncMe === 2 && p1[0] !== null" class="player-container">
            <div class="player">
                <img :src="p1[1]" alt="Player 1" class="player-image">
                <p>{{ p1[0] }}</p>
            </div>
            <div class="player">
                <img :src="p2[1]" alt="Player 2" class="player-image">
                <p>{{ p2[0] }}</p>
            </div>
        </div>
        <canvas :style="{ backgroundImage: asyncMe !== 2 ? 'url(\'../assets/ponkme3.jpg\')' : 'none' }"
        width="1050" height="600" id="game-canvas">
</canvas>
<!-- <canvas width="1050" height="600" id="game-canvas"></canvas> -->
    </body>
</template>

<script lang="ts">

    import { io, Socket } from 'socket.io-client';
    import { ref, getCurrentInstance, defineComponent, onMounted, watch, onBeforeMount, watchEffect, onUnmounted } from 'vue';
    import { rawValue, fetchData } from '../scripts/getUsers.ts'
    import axios from 'axios';
    import AppFooter from './AppFooter.vue';
    import Swal from 'sweetalert2';
    import App from '../App.vue';

	const delay = ms => new Promise(res => setTimeout(res, ms));

	const socket = io('http://localhost:3000');
	const paddleHit = new Audio("//itsrynenotryan.com/codepen/pong/paddleHit.mp3");
	const wallHit = new Audio("//itsrynenotryan.com/codepen/pong/wallHit.mp3");
	const aPoint = new Audio("//cdn.pixabay.com/audio/2022/03/21/audio_6ba288f205.mp3");
	aPoint.playbackRate = 2; // modify speed

	const ballImage = new Image();
	// ballImage.src = "src/assets/dwight.png";
	ballImage.src = "../assets/dwight.png";
	const pad1Image = new Image();
	// pad1Image.src = "src/assets/jim.png";
	pad1Image.src = "../assets/jim.png";
	const pad2Image = new Image();
	// pad2Image.src = "src/assets/mike.png";
	pad2Image.src = "../assets/mike.png";

export default defineComponent({
    setup() 
	{
        let profileUserid = window.history.state.userid;
        let app =		getCurrentInstance();
		let	myUserid = app.appContext.config.globalProperties.id;
        const users =		ref(fetchData());
        const user =	ref(null);
        let game =		null;
        let gameCanvas=  null;
        let gameContext = null;
        const waiting =   ref(false);
        let found =     false;
        let actualGame;
        let p1 = ref<string[]>([]);
        let p2 = ref<string[]>([]);
        const asyncMe = ref(0);
        let intervaliid;
        const inGame = ref(false);
        const   gameId = ref(0);
        const   showButton = ref(true);


        const getNames = async () => {
            if (asyncMe.value === 0 && actualGame !== null && actualGame !== undefined)
            {
                asyncMe.value = 1;
                let response;
                if (actualGame !== null)
                {
                    response = await axios.get(`http://localhost:3000/users/id/${actualGame.player2.playerId}`);
                    p2.value.push(response.data.names, response.data.userPic);
                }
                if (actualGame !== null)
                {
                    response = await axios.get(`http://localhost:3000/users/id/${actualGame.player1.playerId}`);
                    p1.value.push(response.data.names, response.data.userPic);
                }
                // console.log("p1.value is :", p1.value, " and p2 is :", p2);
                asyncMe.value = 2;
                // console.log(p1.value);
            }
        };

        // enum KeyBindings {
        //     //p1.value
        //     UP = 87,
        //     DOWN = 83,
        //     //p2
        //     UP2 = 79,
        //     DOWN2 = 76,
        //     //specials
        //     POWER = 80,
        //     STICKY = 32,

        // }

        class Game {
            private gameCanvas;
            private gameContext;
            public static Mode: string = "";
            public static PlayerIdgame: string = "";
            public static keysPressed: boolean[] = [];
            public static playerScore: number = 0;
            public static opponentScore: number = 0;
            public static matchInfoA: string = "";
            public static matchInfoB: string = "";
            public static opponentWon: string = "";
            public static playerWon: string = "";
            public static anyWins: boolean = false;
            public static who: String = "";
            public static resizerWidth: number = 0;
            public static resizerHeight: number = 0;
            public static fontSize: number = 0;
            private ballSize: number = 0;
            private player1: Paddle;
            private opponentPlayer: opponentPaddle;
            private ball: Ball;

            constructor() {

                this.gameCanvas = document.getElementById("game-canvas");
                this.gameContext = this.gameCanvas.getContext("2d");

                Game.fontSize = window.innerHeight / 20;
                this.gameContext.font = Game.fontSize + "px Orbitron";

                Game.resizerWidth = window.innerWidth < 1050 ? window.innerWidth : this.gameCanvas.width;
                document.documentElement.style.setProperty('--game-width', `${Game.resizerWidth / 20}px`);

                Game.resizerHeight = Game.resizerWidth / 1.75;
                document.documentElement.style.setProperty('--game-height', `${Game.resizerWidth / 20}px`);


                this.ballSize = window.innerHeight < 600 ? this.gameCanvas.height / 100 : window.innerHeight / 100;

                // const whichSubstitute = (event) => {
                //     const theChar = event.code;
                //     if (theChar.startsWith('Key')) {
                //         return theChar.codePointAt(3);
                //     }
                //     if (theChar.startsWith('Digit')) {
                //         return theChar.codePointAt(5);
                //     }
                //     switch (theChar) {
                //         case "Backspace":
                //             return 8;
                //         case "Enter":
                //             return 13;
                //         case "Space":
                //             return 32;
                //         case "ArrowUp":
                //             return 38;
                //         case "ArrowDown":
                //             return 40;
                //         case "Unidentified":
                //             alert("handle the 'Unidentified' if you want to!");
                //     }
                //     return 0;
                // };

                var paddleWidth: number = Game.resizerWidth / 70, wallOffset: number = 20;
                var paddleHeight: number = Game.resizerHeight / 6.7;

                this.player1 = new Paddle(paddleWidth, paddleHeight, wallOffset, this.gameCanvas.height / 2 - paddleHeight / 2);
                this.opponentPlayer = new opponentPaddle(paddleWidth, paddleHeight, this.gameCanvas.width - (wallOffset + paddleWidth), this.gameCanvas.height / 2 - paddleHeight / 2);
                this.ball = new Ball(this.gameCanvas.width / 2 - this.ballSize / 2, this.gameCanvas.height / 2 - this.ballSize / 2, this.ballSize);
                const player1 = {
                    playerId: Game.PlayerIdgame, // Replace with the desired player ID
                    x: this.player1.x,
                    y: this.player1.y,
                    xVel: 0,
                    yVel: 0,
                };

                const player2 = {
                    playerId: actualGame.player2.playerId, // Replace with the desired player ID
                    x: this.opponentPlayer.x,
                    y: this.opponentPlayer.y,
                    xVel: 0,
                    yVel: 0,
                };

                const ball = {

                    x: this.ball.x,
                    y: this.ball.y,
                    xVel: this.ball.xVel,
                    yVel: this.ball.yVel
                };
                // console.log(actualGame.player1.playerId);
                // console.log(window.history.state.userid);
                // if (actualGame !== null && +actualGame.player1.playerId === +window.history.state.userid) {
                //     socket.emit('createGame', { gameMode: Game.Mode, ball: ball, width: 1050, height: 600, gameid: actualGame.id, p1: player1, p2: player2, userid: window.history.state.userid }, (response: any) => {
                //         Game.opponentWon = "";
                //         Game.playerWon = "";
                //         actualGame = response;
                //     });
                // }

                // socket.once('gameRoom', (games) => {
                //     actualGame = games;
                // });

                const gameChangedHandler = async (game) => {
                    actualGame = game;
                    if (actualGame.finished === true) {
                        // Handle finish
                        actualGame = null;
                        waiting.value = false;
                        asyncMe.value = 0;
                        inGame.value = false;
                        showButton.value = true;
                        while(p1.value.length > 0)
                        {
                            p1.value.pop();
                            p2.value.pop();
                        }
                        // p1.value = [];
                        // p2.value = [];
                        // waiting.value = false;
                        resizeCanvas();
                        Swal.fire({
                            title: 'Game Over B*tch!',
                            showCloseButton: true,
                            position: "center",
                        });
                        users.value = (await fetchData()).value;
                        socket.off('gameChanged', gameChangedHandler)
                    }
                };

                socket.on('gameChanged', gameChangedHandler);
            }

            pickMyColors(compute: string) {
                if (actualGame !== undefined && actualGame != null) {
                    if (p1.value.length === 0 || p2.value.length === 0)
                        getNames();
                    Game.playerScore = actualGame.player1Score;
                    Game.opponentScore = actualGame.player2Score;
                    if (compute == "info") {
                        this.gameContext.fillStyle = "#DCD702";
                        return;
                    }
                    if (Game.playerScore > Game.opponentScore) {
                        if (compute == 'player')
                            this.gameContext.fillStyle = "green"; // Player is winning, set text color to green
                        else
                            this.gameContext.fillStyle = "red";
                    } else if (Game.playerScore < Game.opponentScore) {
                        if (compute == 'opponent')
                            this.gameContext.fillStyle = "green"; // opponent is winning, set text color to red
                        else
                            this.gameContext.fillStyle = "red";
                    } else {
                        this.gameContext.fillStyle = "#00FFFFFF"; // Scores are tied, set text color to white (or any other color)
                    }
                }
            }

            drawBoardDetails() {
                //draw court outline
                this.gameContext.strokeStyle = "#fff";
                this.gameContext.lineWidth = this.gameCanvas.width / 210;
                this.gameContext.strokeRect(this.gameCanvas.width / 105, this.gameCanvas.width / 105, Game.resizerWidth - this.gameCanvas.width / 57.5, Game.resizerHeight - this.gameCanvas.width / 57.5);

                //draw center lines
                for (var i = this.gameCanvas.height / 60; i + (this.gameCanvas.height / 60 * 3) < this.gameCanvas.height; i += this.gameCanvas.height / 60 * 3) {
                    this.gameContext.fillStyle = "#72e3dc";
                    this.gameContext.fillRect(this.gameCanvas.width / 2 - this.gameCanvas.height / 60, i + this.gameCanvas.height / 60, this.gameCanvas.height / 60 * 1.5, this.gameCanvas.height / 60 * 2);
                }

                //draw scores
                this.gameContext.font = this.gameCanvas.width / 30 + "px Orbitron";
                this.pickMyColors('player');
                this.gameContext.fillText(Game.playerScore, Game.resizerWidth / 2.4, Game.resizerWidth / 25);
                this.pickMyColors('opponent');
                this.gameContext.fillText(Game.opponentScore, Game.resizerWidth / 1.8, Game.resizerWidth / 25);

                // matchPoint

                // winner and matchPoint
                this.gameContext.font = this.gameCanvas.width / 30 + "px Orbitron";
                this.pickMyColors('info');
                this.gameContext.fillText(Game.matchInfoA, this.gameCanvas.width / 2.8, Game.resizerHeight / 7);
                this.gameContext.fillText(Game.matchInfoB, this.gameCanvas.width / 1.9, Game.resizerHeight / 7);

                // this.gameContext.font = Game.fontSize/2 + "px Orbitron";
                this.pickMyColors('player');
                this.gameContext.fillText(Game.playerWon, Game.resizerWidth / 5, Game.resizerHeight / 1.9);
                this.pickMyColors('opponent');
                this.gameContext.fillText(Game.opponentWon, Game.resizerWidth / 1.45, Game.resizerHeight / 1.9);
                // this.gameContext.font = "30px Orbitron";

            }

            async update() {
                // if (actualGame !== undefined && !actualGame.finished) {
                //     window.addEventListener('resize', () => {
                //         // Get the updated canvas width and height
                //         const canvasWidth = Game.resizerWidth;
                //         const canvasHeight = Game.resizerHeight;
                //         // console.log("cachiporra");
                //         // Update the socket with the new canvas width and height
                //         socket.emit('updateGame', {
                //             canvasWidth,
                //             canvasHeight
                //         });
                //     });
                // }
                if (actualGame !== undefined && actualGame !== null)
                    Game.Mode = actualGame.gameMode;
                this.gameContext.font = Game.fontSize / 2 + "px Orbitron";
                Game.fontSize = window.innerHeight / 20;
                Game.resizerWidth = window.innerWidth < 1050 ? window.innerWidth : this.gameCanvas.width;
                document.documentElement.style.setProperty('--game-width', `${Game.resizerWidth / 20}px`);
                // console.log('New window width:', Game.resizerWidth);
                Game.resizerHeight = Game.resizerWidth / 1.75;
                document.documentElement.style.setProperty('--game-height', `${Game.resizerWidth / 20}px`);
                // console.log('getting bored damn', Game.resizerWidth, " and ", Game.resizerHeight);
                // if (+actualGame.player1.playerId === + window.history.state.userid)
                this.player1.update(this.gameCanvas);
                // else
                this.opponentPlayer.update(this.gameCanvas);
                this.ball.update(this.player1, this.opponentPlayer, this.gameCanvas);
            }

            draw() {
                this.gameContext.fillStyle = "#000";
                this.gameContext.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);

                this.drawBoardDetails();
                this.player1.draw(this.gameContext);
                this.opponentPlayer.draw(this.gameContext);

                if (Game.Mode === "office") {
                    this.gameContext.drawImage(pad1Image, this.opponentPlayer.x - this.gameCanvas.height / 16.21, this.opponentPlayer.y + this.gameCanvas.height / 40, this.gameCanvas.width / 17.5, this.gameCanvas.width / 17.5);
                    this.gameContext.drawImage(pad2Image, this.player1.x - this.gameCanvas.height / 120, this.player1.y + this.gameCanvas.height / 40, this.gameCanvas.width / 17.5, this.gameCanvas.width / 17.5);
                }
                if (this.ball.xVel == 0 && !Game.keysPressed[KeyBindings.STICKY]) {
                    this.ball.x = Game.resizerWidth / 2;
                    this.ball.y = Game.resizerHeight / 2;
                    this.ball.draw(this.gameContext);
                    if (Game.Mode === "office")
                        this.gameContext.drawImage(ballImage, this.gameCanvas.width / 2.8, this.gameCanvas.width / 6.8, this.gameCanvas.width / 3.5, this.gameCanvas.width / 3.5);
                }
                else {
                    this.ball.draw(this.gameContext);
                    if (Game.Mode === "office")
                        this.gameContext.drawImage(ballImage, this.ball.x - 7, this.ball.y - 4, Game.resizerWidth / 26.25, Game.resizerWidth / 26.25);
                }
            }
        }

        class Entity {
            width: number;
            height: number;
            x: number;
            y: number;
            xVel: number = 0;
            yVel: number = 0;
            constructor(w: number, h: number, x: number, y: number) {
                this.width = w;
                this.height = h;
                this.x = x;
                this.y = y;
            }
            draw(context) {
                context.fillStyle = "#fff";
                context.fillRect(this.x, this.y, this.width, this.height);
            }
        }

        class Paddle extends Entity {

            public speed: number = 15;

            constructor(w: number, h: number, x: number, y: number) {
                super(w, h, x, y);
            }

            draw(context) {
                const cornerRadius = Game.resizerWidth / 131;
                context.fillStyle = Game.Mode == "office" ? "#000000" : "#F05081"; // This line sets the fill color to white
                // console.log("TOY IST OPAL PROXIMO ROUND", Game.Mode);
                context.beginPath();
                context.moveTo(this.x + cornerRadius, this.y);
                context.lineTo(this.x + this.width - cornerRadius, this.y);
                context.arcTo(this.x + this.width, this.y, this.x + this.width, this.y + cornerRadius, cornerRadius);
                context.lineTo(this.x + this.width, this.y + this.height - cornerRadius);
                context.arcTo(this.x + this.width, this.y + this.height, this.x + this.width - cornerRadius, this.y + this.height, cornerRadius);
                context.lineTo(this.x + cornerRadius, this.y + this.height);
                context.arcTo(this.x, this.y + this.height, this.x, this.y + this.height - cornerRadius, cornerRadius);
                context.lineTo(this.x, this.y + cornerRadius);
                context.arcTo(this.x, this.y, this.x + cornerRadius, this.y, cornerRadius);

                context.closePath();
                context.fill();
            }

            async update(canvas) {
                this.height = canvas.height / 6.7;
                this.width = canvas.width / 70;
                this.x = canvas.width / 47;
                await delay(500);
                // if (actualGame !== null)
                // {
                //     if ((Game.keysPressed[KeyBindings.POWER])) { // trying stoopid thing for game
                //         //TODO 
                        // console.log("Make it bigger? hahant"); // Handle the response from the server
                //         // if (actualGame !== undefined) {
                //         //     // console.log(canvas.height);
                //         //     socket.emit('playerInput', {
                //         //         actualGame: actualGame,
                //         //         gameId: actualGame.id, // Provide the ID of the game you want to update
                //         //         playerId: actualGame.player1.playerId,
                //         //         keyCode: KeyBindings.UP,
                //         //         canvasWidth: canvas.width,
                //         //         canvasHeight: canvas.height,
                //         //         playerHeight: this.height

                //         //     }, (response) => {

                //         //         //console.log('Response from server:', response); // Handle the response from the server
                //         //     });
                //         //     this.yVel = actualGame.player1.yVel;

                //         // }
                //     }
                //     // console.log("play1 paddle", this.y + this.height, " y canvas.height -20 es : ", canvas.height - 20);
                //     else if (+actualGame.player1.playerId === +window.history.state.userid && Game.keysPressed[KeyBindings.UP]) {
                //         // this.yVel = -1;
                //         // console.log(this.y, "and the canvasH /20 is ", canvas.height / 20)
                //         // if (this.y <= canvas.height / 20) {
                //         //     this.yVel = 0
                //         // }
                //         // console.log("UUUUPPP");
                //         if (actualGame !== undefined) {
                //             // console.log(canvas.height);
                //             socket.emit('playerInput', {
                //                 actualGame: actualGame,
                //                 gameId: actualGame.id, // Provide the ID of the game you want to update
                //                 playerId: actualGame.player1.playerId,
                //                 keyCode: KeyBindings.UP,
                //                 canvasWidth: canvas.width,
                //                 canvasHeight: canvas.height,
                //                 playerHeight: this.height,

                //             }, (response) => {

                //                 //console.log('Response from server:', response); // Handle the response from the server
                //             });
                //             this.yVel = actualGame.player1.yVel;

                //         }
                //         // console.log(this.yVel, "last vel and actual :", actualGame.player1.yVel);

                //     } else if (Game.keysPressed[KeyBindings.DOWN] && +actualGame.player1.playerId === +window.history.state.userid) {
                //         // this.yVel = 1;
                //         // if (this.y + this.height >= canvas.height - canvas.height / 30) {
                //         //     this.yVel = 0;
                //         // }
                //         if (actualGame !== undefined) {
                //             // console.log("pabajooo", this.height)
                //             socket.emit('playerInput', {
                //                 actualGame: actualGame,
                //                 gameId: actualGame.id, // Provide the ID of the game you want to update
                //                 playerId: actualGame.player1.playerId,
                //                 keyCode: KeyBindings.DOWN,
                //                 canvasWidth: canvas.width,
                //                 canvasHeight: canvas.height,
                //                 playerHeight: this.height,
                //             }, (response) => {
                //                 // console.log("hate it ", response)

                //                 //console.log('Response from server:', response); // Handle the response from the server
                //             });
                //             this.yVel = actualGame.player1.yVel;
                //         }

                //     }
                //     else {
                //         this.yVel = 0;
                //         this.height = canvas.height / 6.7;
                //     }
                // }
                // this.y = this.y * (canvas.height / 600); + this.yVel * this.speed > 600 - 600 / 30 ? canvas.height - canvas.height / 30 - (this.height * 1.85) : this.y + this.yVel * this.speed;
                if (actualGame !== undefined && actualGame !== null) {
                    this.y = canvas.height === 600 ? actualGame.player1.y : actualGame.player1.y * (canvas.height / 600);
                    // console.log("actual pos:", actualGame.player1.y, " need pos:", actualGame.player1.y * (canvas.height / 600), "where cH is :", canvas.height)
                    // socket.emit('updateGame', {
                    //     id: actualGame.id, // Provide the ID of the game you want to update
                    //     player1: {
                    //         x: this.x, // Provide the new x value
                    //         y: this.y, // Provide the new y value   
                    //         // xVel: this.xVel,
                    //         // yVel: this.yVel,
                    //         // speed: this.speed,

                    //     }
                    // }, (response) => {
                    //     //console.log('Response from server:', response); // Handle the response from the server
                    // });

                }
            }
        }

        class opponentPaddle extends Entity {

            public speed: number = 15;

            constructor(w: number, h: number, x: number, y: number) {
                super(w, h, x, y);
            }
            draw(context) {
                context.fillStyle = Game.Mode == "office" ? "#000000" : "#1CA3EC";//"#1CA3EC";
                const cornerRadius = Game.resizerWidth / 131;
                //
                context.beginPath();
                context.moveTo(this.x + cornerRadius, this.y);
                context.lineTo(this.x + this.width - cornerRadius, this.y);
                context.arcTo(this.x + this.width, this.y, this.x + this.width, this.y + cornerRadius, cornerRadius);
                context.lineTo(this.x + this.width, this.y + this.height - cornerRadius);
                context.arcTo(this.x + this.width, this.y + this.height, this.x + this.width - cornerRadius, this.y + this.height, cornerRadius);
                context.lineTo(this.x + cornerRadius, this.y + this.height);
                context.arcTo(this.x, this.y + this.height, this.x, this.y + this.height - cornerRadius, cornerRadius);
                context.lineTo(this.x, this.y + cornerRadius);
                context.arcTo(this.x, this.y, this.x + cornerRadius, this.y, cornerRadius);

                context.closePath();
                context.fill();
                // or context.fillRect(this.x, this.y, this.width, this.height);
            }
            async update(canvas) {
                // if (+actualGame.player2.playerId === +window.history.state.userid)
                // {
                this.height = canvas.height / 6.7;
                this.width = canvas.width / 70;
                this.x = canvas.width / 1.035;
                // console.log("wass play2 paddle", this.y, " y canvas x : ", this.x);

                await delay(500);
                // console.log("is play2 paddle", this.y, " y canvas x : ", this.x);
                // if (actualGame !== null)
                // {
                // if (Game.keysPressed[KeyBindings.UP] && +actualGame.player2.playerId === +window.history.state.userid) {
                //     // this.yVel = -1;
                //     // if (this.y <= canvas.height / 20) {
                //     //     this.yVel = 0
                //     // }
                //     if (actualGame !== undefined) {
                //         socket.emit('playerInput', {
                //             actualGame: actualGame,
                //             gameId: actualGame.id, // Provide the ID of the game you want to update
                //             playerId: actualGame.player2.playerId,
                //             keyCode: KeyBindings.UP,
                //             canvasWidth: canvas.width,
                //             canvasHeight: canvas.height,
                //             playerHeight: this.height,
                //         }, (response) => {
                //             //console.log('Response from server:', response); // Handle the response from the server
                //         });
                //     }
                //     // this.yVel = actualGame.player2.yVel;
                // } else if (Game.keysPressed[KeyBindings.DOWN] && +actualGame.player2.playerId === +window.history.state.userid) {
                //     // this.yVel = 1;
                //     // if (this.y + this.height >= canvas.height - canvas.height / 30) {
                //     //     this.yVel = 0;
                //     // }
                //     if (actualGame !== undefined) {
                //         socket.emit('playerInput', {
                //             actualGame: actualGame,
                //             gameId: actualGame.id, // Provide the ID of the game you want to update
                //             playerId: actualGame.player2.playerId,
                //             keyCode: KeyBindings.DOWN,
                //             canvasWidth: canvas.width,
                //             canvasHeight: canvas.height,
                //             playerHeight: this.height,
                //         }, (response) => {
                //             //console.log('Response from server:', response); // Handle the response from the server
                //         });

                //     }
                //     // this.yVel = actualGame.player2.yVel;
                // } else {
                //     if (actualGame !== undefined)
                //         this.yVel = actualGame.player2.yVel = 0;
                //     else
                //         this.yVel = 0;
                // }
                // }

                this.y = this.y + this.yVel * this.speed > canvas.height - canvas.height / 30 ? canvas.height - canvas.height / 30 - (this.height * 1.85) : this.y + this.yVel * this.speed;
                if (actualGame !== undefined && actualGame !== null) {
                    this.y = canvas.height === 600 ? actualGame.player2.y : actualGame.player2.y * (canvas.height / 600);
                    // socket.emit('updateGame', {
                    //     id: actualGame.id, // Provide the ID of the game you want to update
                    //     player2: {
                    //         x: this.x, // Provide the new x value
                    //         y: this.y, // Provide the new y value
                    //         // xVel: this.xVel,
                    //         // yVel: this.yVel,
                    //         // speed: this.speed,
                    //     }
                    // }, (response) => {
                    //     //console.log('Response from server:', response); // Handle the response from the server
                    // });
                }
            }
        }
        // }

        class Ball extends Entity {

            private speed: number = 5;
            private round: number = 0;
            private radius: number;
            private pointSide: string = "";

            constructor(x: number, y: number, radius: number) {
                super(radius * 2, radius * 2, x, y);
                this.radius = radius;
                var randomDirection = Math.floor(Math.random() * 2) + 1;
                if (randomDirection % 2) {
                    this.xVel = 1;
                } else {
                    this.xVel = -1;
                }
                this.yVel = 1;
            }

            draw(context) {
                context.fillStyle = "#fff";
                context.beginPath();

                if (this.pointSide == "opponent") {
                    context.fillStyle = "#1CA3EC";
                    context.arc(this.x + this.radius, this.y + this.radius, this.radius, 0, Math.PI * 2);
                }
                if (this.pointSide == "player") {
                    context.fillStyle = "#F05081";
                    context.arc(this.x + this.radius, this.y + this.radius, this.radius, 0, Math.PI * 2);
                }
                else
                    context.arc(this.x + this.radius, this.y + this.radius, this.radius, 0, Math.PI * 2);
                context.fill();
                context.closePath();
            }

            update(player: Paddle, opponent: opponentPaddle, canvas) {

                this.radius = Game.resizerHeight / 100;
                if (actualGame !== undefined && actualGame !== null) {
                    if (actualGame.player2Score == 4 || actualGame.player1Score == 4) {
                        Game.matchInfoA = "Match";
                        Game.matchInfoB = "Point!"
                    }
                    if (actualGame.player1Score == 5 || actualGame.player2Score == 5) { //wins
                        Game.anyWins = true;
                        Game.who = actualGame.player2Score > actualGame.player1Score ? "opponent" : "player";

                        if (Game.who === "opponent") {
                            Game.opponentWon = "Winner!";
                            Game.playerWon = "Loser!";

                        }
                        else {
                            Game.opponentWon = "Loser!";
                            Game.playerWon = "Winner!";

                        }

                    }
                }

                if (actualGame !== undefined && actualGame !== null && actualGame.ball !== null) {
                    // this.x = actualGame.ball.x;
                    // this.y = actualGame.ball.y;
                    //FIXME
                    this.x = actualGame.ball.x * Game.resizerWidth / 1050;
                    this.y = actualGame.ball.y * Game.resizerHeight / 600;
                }

            }


        }

        // const whichSubstitute = (event) => {
        //     const theChar = event.code;
        //     if (theChar.startsWith('Key')) {
        //         return theChar.codePointAt(3);
        //     }
        //     if (theChar.startsWith('Digit')) {
        //         return theChar.codePointAt(5);
        //     }
        //     switch (theChar) {
        //         case "Backspace":
        //             return 8;
        //         case "Enter":
        //             return 13;
        //         case "Space":
        //             return 32;
        //         case "ArrowUp":
        //             return 38;
        //         case "ArrowDown":
        //             return 40;
        //         case "Unidentified":
        //             alert("handle the 'Unidentified' if you want to!");
        //     }
        //     return 0;
        // };

        // const handleKeyDown = function (e) {
        //     Game.keysPressed[whichSubstitute(e)] = true;
        // };

        // const handleKeyUp = function (e) {
        //     Game.keysPressed[whichSubstitute(e)] = false;
        // };

        const   gameQueueStart = async () =>
        {
			console.log(myUserid + " WANTS TO SPECTATE: " + profileUserid);
            await socket.emit('spectateGame', {myUserid: myUserid, playerid: profileUserid});
            const gameHandler = async (response) => {
                inGame.value = true;
                found = true;
                actualGame = response;

                game = new Game();
                gameCanvas = document.getElementById("game-canvas");
                gameContext = gameCanvas.getContext("2d");
                // Default canvas size
                resizeCanvas();
                const animate = () => {
                    game.update();
                    game.draw();
                    if (actualGame !== null && game !== null)
                        requestAnimationFrame(animate);
                };
                
                if (actualGame != null && game != null)
                    animate();
                socket.off('startSpectating', gameHandler);
            };

            await socket.once('startSpectating', gameHandler);

            setTimeout(() => {
                if (found === false)
                {
                    // console.log("NOT FOUNDDD");
                    Swal.fire({
                        title: 'Partida no encontrada :(',
                        showCloseButton: true,
                    })
                    socket.off('startSpectating', gameHandler);
                }
            }, 10000);

        };

        const findGame = async() => {
			myUserid = app.appContext.config.globalProperties.id;
            try {
                await gameQueueStart();
                found = false;
                game = null;
            } catch (error) {
                waiting.value = false;
            }
        };

        const resizeCanvas = () =>
        {
            const canvas = gameCanvas;
            // console.log(canvas.width, " and ", window.innerWidth, " --- height ", canvas.height, " and ", window.innerHeight);
            if (canvas != null)
            {
                canvas.width = window.innerWidth < 1050 ? window.innerWidth : 1050; // Set canvas width to window width
                canvas.height = canvas.width * 0.5715; // Set canvas height to window height
            }
        };

        watch(
            () => users.value,
            (newUsers) => {
                for (const i in newUsers)
                {
                    if (app.appContext.config.globalProperties.id === newUsers[i].id)
                    {
                        user.value = newUsers[i];
                        gameId.value = newUsers[i].isPlaying.gameId;
                    }
                };
            }
        ),

        watch(
            () => gameId.value,
            (newGameid, oldGameid) => {
                // console.log(oldGameid);
                // console.log(newGameid);
                gameId.value = newGameid;
                // console.log(showButton.value);

                // if (showButton.value === true && gameId.value !== 0)
                // {
                //     findGame();
                // }
            }
        ),

        onMounted(async () => {
            await beforeMountTask;
			myUserid = app.appContext.config.globalProperties.id;
            window.addEventListener('resize', resizeCanvas); // Add resize listener
            resizeCanvas();
            findGame();
        });

        onUnmounted(() => {
        });

        const beforeMountTask = new Promise<void>(async (resolve) => {
            await onBeforeMount(async () => {
                Game.Mode = "";
                Game.PlayerIdgame = profileUserid;

                users.value = (await fetchData()).value;
                for (const i in users.value)
                {
                    if (+app.appContext.config.globalProperties.id === +users.value[i].id)
                        user.value = users.value[i];
                };
                // Resolve the promise when tasks in onBeforeMount are done
                resolve();
            });
        });

        onBeforeMount(async () => {
            socket.on('user', async (msg) => {
                // console.log(msg);
                users.value = (await fetchData()).value;
                resizeCanvas();
            });
        });
        
        return {
            p1,
            p2,
            getNames,
            asyncMe,
            profileUserid,
			myUserid,
            app,
            users,
            user,
            game,
            gameCanvas,
            gameContext,
            waiting,
            found,
            gameQueueStart,
            // findGame,
            resizeCanvas,
            actualGame,
            inGame,
            showButton,
        };
    },
})

</script>

<style scoped>
.game-container {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
}

canvas {
    background: transparent;
    /* background-image: ; */
}

.officePads {
    width: 4em;
    height: auto;
}

.officeBall {
    width: 3em;
    height: auto;
}

.player-container {
    position: absolute;
    top: 20px;
    width: 100%;
    display: flex;
    justify-content: space-between;
}

@media (min-width: 2300px) {
    .player {
        margin: 0px 300px 0px 300px;
    }
}

@media (min-width: 2100px) and (max-width: 2300px) {
    .player {
        margin: 0 500px;
    }
}

@media (min-width: 1750px) and (max-width: 2100px) {
    .player {
        margin: 0 400px;
    }
}

/* For screens between 600px and 800px */
@media (min-width: 1300px) and (max-width: 1750px) {
    .player {
        margin: 0 300px;
    }
}

@media (min-width: 1000px) and (max-width: 1300px) {
    .player {
        margin: 0 200px;
    }
}

@media (min-width: 800px) and (max-width: 1000px) {
    .player {
        margin: 0 150px;
    }
}

/* For screens smaller than 600px */
@media (max-width: 800px) {
    .player {
        margin: 0 80px;
    }
}

.player:first-child {
    left: 20px;
}

.player:last-child {
    right: 20px;
}

.player-image {
    border-radius: 100%;
    width: var(--game-width);
    height: var(--game-height);
    object-fit: cover;
}
</style>