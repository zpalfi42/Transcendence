<template>
    <head>
        <link href='https://fonts.googleapis.com/css?family=Orbitron:900' rel='stylesheet' type='text/css'>
    </head>

    <div class="button-div" v-if="user !== null">

        <button class="playButton" id=myButton @click="gameCreator()" v-if="showButton">
            Le t' s P L A Y ! <!-- add some pic to thebutton or just leave it uglys as fuck -->
        </button>

    </div>

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
        <canvas :style="{ backgroundImage: asyncMe !== 2 ? 'url(\'../assets/ponkme3.jpg\')' : 'none' }" width="1050"
            height="600" id="game-canvas">
        </canvas>
    </body>
</template>

<script lang="ts">

import { io } from 'socket.io-client';
import { ref, getCurrentInstance, defineComponent, onMounted, watch, onBeforeMount, watchEffect, onUnmounted } from 'vue';
import { fetchData } from '../scripts/getUsers.ts'
import axios from 'axios';
import Swal from 'sweetalert2';

const socket = io('http://localhost:3000');
// const paddleHit = new Audio("//itsrynenotryan.com/codepen/pong/paddleHit.mp3");
// const wallHit = new Audio("//itsrynenotryan.com/codepen/pong/wallHit.mp3");
const aPoint = new Audio("//cdn.pixabay.com/audio/2022/03/21/audio_6ba288f205.mp3");
aPoint.playbackRate = 2;

const ballImage = new Image();
ballImage.src = "../assets/dwight.png";
const pad1Image = new Image();
pad1Image.src = "../assets/jim.png";
const pad2Image = new Image();
pad2Image.src = "../assets/mike.png";

export default defineComponent({
    props: {
        mode: {
            type: String,
            requiered: true,
        },
    },
    setup(props) {
        let userid = window.history.state.userid;
        let app = getCurrentInstance();
        const users = ref(fetchData());
        const user = ref(null);
        let game = null;
        let gameCanvas = null;
        let gameContext = null;
        const waiting = ref(false);
        let found = false;
        let actualGame;
        let p1 = ref<string[]>([]);
        let p2 = ref<string[]>([]);
        const asyncMe = ref(0);
        const inGame = ref(false);
        const gameId = ref(0);
        const showButton = ref(true);
        const office = ref(window.history.state.office);
        let x = 1;
        let y = 1;
        let queue = false;

        const getNames = async () => {
            if (asyncMe.value === 0 && actualGame !== null && actualGame !== undefined) {
                asyncMe.value = 1;
                let response;
                if (actualGame !== null) {
                    response = await axios.get(`http://localhost:3000/users/id/${actualGame.player2.playerId}`);
                    p2.value.push(response.data.names, response.data.userPic);
                }
                if (actualGame !== null) {
                    response = await axios.get(`http://localhost:3000/users/id/${actualGame.player1.playerId}`);
                    p1.value.push(response.data.names, response.data.userPic);
                }
                asyncMe.value = 2;
            }
        };

        enum KeyBindings {
            UP = 87,
            DOWN = 83,
            UP2 = 79,
            DOWN2 = 76,
            POWER = 80,
            STICKY = 32,
        }

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
            public static matchInfoC: string = "";
            public static matchInfoD: string = "";
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

                if (office.value)
                    Game.Mode = "office";
                this.gameCanvas = document.getElementById("game-canvas");
                this.gameContext = this.gameCanvas.getContext("2d");

                Game.fontSize = window.innerHeight / 20;
                this.gameContext.font = Game.fontSize + "px Orbitron";

                Game.resizerWidth = window.innerWidth < 1050 ? window.innerWidth : this.gameCanvas.width;
                document.documentElement.style.setProperty('--game-width', `${Game.resizerWidth / 20}px`);

                Game.resizerHeight = Game.resizerWidth / 1.75;
                document.documentElement.style.setProperty('--game-height', `${Game.resizerWidth / 20}px`);

                this.ballSize = window.innerHeight < 600 ? this.gameCanvas.height / 100 : window.innerHeight / 100;

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

                console.log("GAME");

                if (actualGame !== null && +actualGame.player1.playerId === +window.history.state.userid) {
                    socket.emit('createGame', { gameMode: Game.Mode, ball: ball, width: 1050, height: 600, gameid: actualGame.id, p1: player1, p2: player2, userid: window.history.state.userid }, (response: any) => {
                        Game.opponentWon = "";
                        Game.playerWon = "";
                        actualGame = response;
                    });
                }

                socket.once('gameRoom', (games) => {
                    actualGame = games;
                });

                const gameChangedHandler = async (game) => {
                    if (actualGame.sockets.length > game.sockets.length) {
                        console.log(actualGame);
                        game.sockets = actualGame.sockets;
                    }
                    actualGame = game;
                    if (actualGame.finished === true) {
                        setTimeout(async () => {
                            actualGame = null;
                            waiting.value = false;
                            asyncMe.value = 0;
                            inGame.value = false;
                            showButton.value = true;
                            while (p1.value.length > 0) {
                                p1.value.pop();
                                p2.value.pop();
                            }
                            resizeCanvas();
                            Swal.fire({
                                title: 'Game Over B*tch!',
                                showCloseButton: true,
                                position: "center",
                            });
                            Game.matchInfoA = "";
                            Game.matchInfoB = ""
                            Game.opponentWon = "";
                            Game.playerWon = "";

                            users.value = (await fetchData()).value;
                            window.removeEventListener("keydown", handleKeyDown);
                            window.removeEventListener("keyup", handleKeyUp);
                            socket.off('gameChanged', gameChangedHandler)
                        }, 1200);
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
                    }
                    else if (Game.playerScore < Game.opponentScore) {
                        if (compute == 'opponent')
                            this.gameContext.fillStyle = "green"; // opponent is winning, set text color to red
                        else
                            this.gameContext.fillStyle = "red";
                    }
                    else
                        this.gameContext.fillStyle = "#00FFFFFF"; // Scores are tied, set text color to white (or any other color)
                }
            }

            drawBoardDetails() {
                this.gameContext.strokeStyle = "#fff";
                this.gameContext.lineWidth = this.gameCanvas.width / 210;
                this.gameContext.strokeRect(this.gameCanvas.width / 105, this.gameCanvas.width / 105, Game.resizerWidth - this.gameCanvas.width / 57.5, Game.resizerHeight - this.gameCanvas.width / 57.5);

                for (var i = this.gameCanvas.height / 60; i + (this.gameCanvas.height / 60 * 3) < this.gameCanvas.height; i += this.gameCanvas.height / 60 * 3) {
                    this.gameContext.fillStyle = "#72e3dc";
                    this.gameContext.fillRect(this.gameCanvas.width / 2 - this.gameCanvas.height / 60, i + this.gameCanvas.height / 60, this.gameCanvas.height / 60 * 1.5, this.gameCanvas.height / 60 * 2);
                }

                this.gameContext.font = this.gameCanvas.width / 30 + "px Orbitron";
                this.pickMyColors('player');
                this.gameContext.fillText(Game.playerScore, Game.resizerWidth / 2.4, Game.resizerWidth / 25);
                this.pickMyColors('opponent');
                this.gameContext.fillText(Game.opponentScore, Game.resizerWidth / 1.8, Game.resizerWidth / 25);

                this.gameContext.font = this.gameCanvas.width / 30 + "px Orbitron";
                this.pickMyColors('info');
                this.gameContext.fillText(Game.matchInfoA, this.gameCanvas.width / 2.8, Game.resizerHeight / 7);
                this.gameContext.fillText(Game.matchInfoB, this.gameCanvas.width / 1.9, Game.resizerHeight / 7);
                this.gameContext.fillText(Game.matchInfoC, this.gameCanvas.width / 4, Game.resizerHeight - 20);
                this.gameContext.fillText(Game.matchInfoD, this.gameCanvas.width / 1.8, Game.resizerHeight - 20);

                this.pickMyColors('player');
                this.gameContext.fillText(Game.playerWon, Game.resizerWidth / 5, Game.resizerHeight / 1.9);
                this.pickMyColors('opponent');
                this.gameContext.fillText(Game.opponentWon, Game.resizerWidth / 1.45, Game.resizerHeight / 1.9);
            }

            async update() {
                this.gameContext.font = Game.fontSize / 2 + "px Orbitron";
                Game.fontSize = window.innerHeight / 20;
                Game.resizerWidth = window.innerWidth < 1050 ? window.innerWidth : this.gameCanvas.width;
                document.documentElement.style.setProperty('--game-width', `${Game.resizerWidth / 20}px`);
                Game.resizerHeight = Game.resizerWidth / 1.75;
                document.documentElement.style.setProperty('--game-height', `${Game.resizerWidth / 20}px`);
                this.player1.update(this.gameCanvas);
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
                if (actualGame !== null) {
                    if (+actualGame.player1.playerId === +window.history.state.userid && Game.keysPressed[KeyBindings.UP]) {
                        // console.log("UP")
                        // console.log(actualGame.player1.y + " >= " + (actualGame.height / 30) +  " === " + (actualGame.player1.y  >= (actualGame.height / 30)));
                        if (actualGame !== undefined && x >= y && (actualGame.player1.y >= (actualGame.height / 30))) {
                            socket.emit('playerInput', {
                                actualGame: actualGame,
                                gameId: actualGame.id,
                                playerId: actualGame.player1.playerId,
                                keyCode: KeyBindings.UP,
                                canvasWidth: canvas.width,
                                canvasHeight: canvas.height,
                                playerHeight: this.height,
                            }, (response) => { });
                            this.yVel = actualGame.player1.yVel;
                            x = 0;
                        }
                        else
                            x = x + 1;
                    }
                    else if (Game.keysPressed[KeyBindings.DOWN] && +actualGame.player1.playerId === +window.history.state.userid) {
                        // console.log("DOWN");
                        // console.log((actualGame.player1.y + actualGame.height / 6.7) + " <= "  + (actualGame.height - (actualGame.height / 30)) + " === " + ((actualGame.player1.y + actualGame.height / 6.7)  <= (actualGame.height - (actualGame.height / 30))));
                        if (actualGame !== undefined && x >= y && ((actualGame.player1.y + actualGame.height / 6.7) <= (actualGame.height - (actualGame.height / 30)))) {
                            socket.emit('playerInput', {
                                actualGame: actualGame,
                                gameId: actualGame.id,
                                playerId: actualGame.player1.playerId,
                                keyCode: KeyBindings.DOWN,
                                canvasWidth: canvas.width,
                                canvasHeight: canvas.height,
                                playerHeight: this.height,
                            }, (response) => { });
                            this.yVel = actualGame.player1.yVel;
                            x = 0;
                        }
                        else
                            x = x + 1;
                    }
                    else {
                        // console.log("NOT PRESSING KEY OR TOUCHING BORDER");
                        // console.log(actualGame.player1.y + " >= " + (actualGame.height / 30) +  " === " + (actualGame.player1.y  >= (actualGame.height / 30)));
                        // console.log((actualGame.player1.y + actualGame.height / 6.7) + " <= "  + (actualGame.height - (actualGame.height / 30)) + " === " + ((actualGame.player1.y + actualGame.height / 6.7)  <= (actualGame.height - (actualGame.height / 30))));
                        this.yVel = 0;
                        this.height = canvas.height / 6.7;
                    }
                }
                if (actualGame !== undefined && actualGame !== null)
                    this.y = canvas.height === 600 ? actualGame.player1.y : actualGame.player1.y * (canvas.height / 600);
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
                this.x = canvas.width / 1.035;
                if (actualGame !== null) {
                    if (Game.keysPressed[KeyBindings.UP] && +actualGame.player2.playerId === +window.history.state.userid) {
                        if (actualGame !== undefined && x >= y && (actualGame.player2.y >= actualGame.height / 30)) {
                            socket.emit('playerInput', {
                                actualGame: actualGame,
                                gameId: actualGame.id,
                                playerId: actualGame.player2.playerId,
                                keyCode: KeyBindings.UP,
                                canvasWidth: canvas.width,
                                canvasHeight: canvas.height,
                                playerHeight: this.height,
                            }, (response) => { });
                            x = 0;
                        }
                        else
                            x = x + 1;
                    }
                    else if (Game.keysPressed[KeyBindings.DOWN] && +actualGame.player2.playerId === +window.history.state.userid) {
                        if (actualGame !== undefined && x >= y && (actualGame.player2.y + actualGame.height / 6.7 <= actualGame.height - (actualGame.height / 30))) {
                            socket.emit('playerInput', {
                                actualGame: actualGame,
                                gameId: actualGame.id,
                                playerId: actualGame.player2.playerId,
                                keyCode: KeyBindings.DOWN,
                                canvasWidth: canvas.width,
                                canvasHeight: canvas.height,
                                playerHeight: this.height,
                            }, (response) => { });
                            x = 0;
                        }
                        else
                            x = x + 1;
                    }
                    else {
                        if (actualGame !== undefined)
                            this.yVel = actualGame.player2.yVel = 0;
                        else
                            this.yVel = 0;
                    }
                }
                this.y = this.y + this.yVel * this.speed > canvas.height - canvas.height / 30 ? canvas.height - canvas.height / 30 - (this.height * 1.85) : this.y + this.yVel * this.speed;
                if (actualGame !== undefined && actualGame !== null)
                    this.y = canvas.height === 600 ? actualGame.player2.y : actualGame.player2.y * (canvas.height / 600);
            }
        }

        class Ball extends Entity {
            private speed: number = 5;
            private round: number = 0;
            private radius: number;
            private pointSide: string = "";

            constructor(x: number, y: number, radius: number) {
                super(radius * 2, radius * 2, x, y);
                this.radius = radius;
                var randomDirection = Math.floor(Math.random() * 2) + 1;
                if (randomDirection % 2)
                    this.xVel = 1;
                else
                    this.xVel = -1;
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
                    if (actualGame.player2Score <= 1 && actualGame.player1Score <= 1) {
                        Game.matchInfoC = "Move with";
                        Game.matchInfoD = "W 👆🏼 or  S  👇🏼 !"
                    }
                    else {
                        Game.matchInfoC = "";
                        Game.matchInfoD = ""
                    }
                    if (actualGame.player2Score == 4 || actualGame.player1Score == 4) {
                        Game.matchInfoA = "Match";
                        Game.matchInfoB = "Point!"
                    }
                    if (actualGame.player1Score == 5 || actualGame.player2Score == 5) {
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
                    this.x = actualGame.ball.x * Game.resizerWidth / 1050;
                    this.y = actualGame.ball.y * Game.resizerHeight / 600;
                }
            }
        }

        const whichSubstitute = (event) => {
            const theChar = event.code;
            if (theChar.startsWith('Key'))
                return theChar.codePointAt(3);
            if (theChar.startsWith('Digit'))
                return theChar.codePointAt(5);
            switch (theChar) {
                case "Backspace":
                    return 8;
                case "Enter":
                    return 13;
                case "Space":
                    return 32;
                case "ArrowUp":
                    return 38;
                case "ArrowDown":
                    return 40;
                case "Unidentified":
                    alert("handle the 'Unidentified' if you want to!");
            }
            return 0;
        };

        const handleKeyDown = function (e) {
            Game.keysPressed[whichSubstitute(e)] = true;
        };

        const handleKeyUp = function (e) {
            Game.keysPressed[whichSubstitute(e)] = false;
        };

        const gameQueueStart = async () => {
            if (queue === false) {
                queue = true;
                await socket.emit('gameQueue', userid);
            }
            const gameHandler = async (response) => {
                console.log("HANDLERRR CALLED");
                socket.off('gameStart', gameHandler);
                inGame.value = true;
                found = true;
                actualGame = response;
                game = new Game();
                window.addEventListener("keydown", handleKeyDown);
                window.addEventListener("keyup", handleKeyUp);
                gameCanvas = document.getElementById("game-canvas");
                gameContext = gameCanvas.getContext("2d");
                resizeCanvas();
                const animate = () => {
                    game.update();
                    game.draw();
                    if (actualGame !== null && game !== null)
                        requestAnimationFrame(animate);
                };

                if (actualGame != null && game != null) {
                    Swal.close();
                    animate();
                }
            };
            console.log("SOCKET ON");
            await socket.once('gameStart', gameHandler);

            setTimeout(() => {
                queue = false;
                if (found === false) {
                    Swal.fire({
                        title: 'Nobody has the balls to play with you!',
                        showCloseButton: true,
                        showCancelButton: true,
                        confirmButtonText: 'Check again!',
                        confirmButtonColor: 'rgb(124, 246, 124)',
                        cancelButtonText: 'Cancel',
                        cancelButtonColor: 'rgb(248, 88, 88)',
                    }).then((result) => {
                        if (result.isConfirmed) {
                            socket.emit('deleteQueue', userid);
                            waiting.value = false;
                            showButton.value = true;
                            socket.off('gameStart', gameHandler);
                            gameCreator();
                        } else {
                            console.log("CANCEL")
                            socket.emit('deleteQueue', userid);
                            waiting.value = false;
                            showButton.value = true;
                            socket.off('gameStart', gameHandler);
                        }
                    });
                }
            }, 20000);
        };

        const findGame = async () => {
            showButton.value = false;
            waiting.value = true;
            try {
                await gameQueueStart();
                found = false;
                game = null;
            } catch (error) {
                waiting.value = false;
            }
        };

        const resizeCanvas = () => {
            const canvas = gameCanvas;
            if (canvas != null) {
                canvas.width = window.innerWidth < 1050 ? window.innerWidth : 1050;
                canvas.height = canvas.width * 0.5715;
            }
        };

        watch(
            () => users.value,
            (newUsers) => {
                // console.log("Changed users!");
                for (const i in newUsers) {
                    if (+app.appContext.config.globalProperties.id === +newUsers[i].id) {
                        // console.log(user.value + " ==> " + newUsers[i]);
                        // console.log(gameId.value + " ==> " + newUsers[i].isPlaying.gameId);
                        user.value = newUsers[i];
                        gameId.value = newUsers[i].isPlaying.gameId;
                    }
                };
            }
        ),

            watch(
                () => props.mode,
                (newMode) => {
                    if (newMode === 'standard')
                        office.value = false;
                    else
                        office.value = true;
                }
            ),

            watch(
                () => gameId.value,
                async (newGameid, oldGameid) => {
                    // console.log("Changed gameid")
                    gameId.value = newGameid;
                    if (showButton.value === true && gameId.value !== 0) {
                        findGame();
                    }
                }
            ),

            onMounted(async () => {
                await beforeMountTask;
                window.addEventListener('resize', resizeCanvas);
                resizeCanvas();
                if (+user.value.isPlaying.gameId !== 0 && user.value.isPlaying.state === false) {
                    queue = false;
                    gameCreator();
                }
                if (user.value.isPlaying.state === true)
                    findGame();
                if (+user.value.isPlaying.gameId === 0)
                    gameCreator();

            });

        onUnmounted(() => {
            socket.emit('deleteQueue', userid);

            socket.off('gameStart', );
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);

        });

        const beforeMountTask = new Promise<void>(async (resolve) => {
            await onBeforeMount(async () => {
                Game.Mode = "";
                Game.PlayerIdgame = userid;

                users.value = (await fetchData()).value;
                for (const i in users.value) {
                    if (+app.appContext.config.globalProperties.id === +users.value[i].id)
                        user.value = users.value[i];
                };
                resolve();
            });
        });

        const gameCreator = () => {
            let lie = false;
            findGame();
            Swal.fire({
                title: "Waiting for a game...",
                showConfirmButton: false,
                timer: 0,
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => {

                    Swal.showLoading();
                },
                didRender: () => {
                    if (actualGame !== null)
                        Swal.close();
                }
            });
            return lie;
        };

        onBeforeMount(async () => {
            socket.on('user', async (msg) => {
                users.value = (await fetchData()).value;
                resizeCanvas();
            });
        });

        return {
            p1,
            p2,
            getNames,
            asyncMe,
            userid,
            app,
            users,
            user,
            game,
            gameCanvas,
            gameContext,
            waiting,
            found,
            gameQueueStart,
            findGame,
            resizeCanvas,
            actualGame,
            inGame,
            showButton,
            office,
            gameCreator
        };
    },
})

</script>

<style scoped>
.playButton {
    color: transparent;
    background-size: cover;
    background-image: url('../assets/playme.png');
    margin: 3px 0 5px 0;
}

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