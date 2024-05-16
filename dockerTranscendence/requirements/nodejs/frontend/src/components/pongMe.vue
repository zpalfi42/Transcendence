<template>
    <head>
        <link href='https://fonts.googleapis.com/css?family=Orbitron:900' rel='stylesheet' type='text/css'>
    </head>
    <h4>Move left paddle up and down with w(Up) and s(Down) {{ someUser() }} is playing {{ gameMode() }} </h4>
    <button @click.native="resetGame"><span>RETRY!</span></button>

    <body class="game-container">
        <div v-if="asyncMe === 2" class="player-container">
            <div class="player">
                <img :src="p1[1]" alt="Player 1" class="player-image">
                <p>{{ p1[0] }}</p>
            </div>
            <div class="player">
                <img :src="p2[1]" alt="Player 2" class="player-image">
                <p>{{ p2[0] }}</p>
            </div>
        
        2</div>-98

        <canvas width="1050" height="600" id="game-canvas"></canvas>
    </body>
</template>
  

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeMount, watch, onUnmounted } from 'vue';
import { io } from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:3000');
const paddleHit = new Audio("//itsrynenotryan.com/codepen/pong/paddleHit.mp3");
const wallHit = new Audio("//itsrynenotryan.com/codepen/pong/wallHit.mp3");
const aPoint = new Audio("//cdn.pixabay.com/audio/2022/03/21/audio_6ba288f205.mp3");
aPoint.playbackRate = 2; // modify speed

let actualGame;
const ballImage = new Image();
// ballImage.src = "src/assets/dwight.png";
ballImage.src = "../assets/dwight.png";
const pad1Image = new Image();
// pad1Image.src = "src/assets/jim.png";
pad1Image.src = "../assets/jim.png";
const pad2Image = new Image();
// pad2Image.src = "src/assets/mike.png";
pad2Image.src = "../assets/mike.png";
let p1: string[] = [];
let p2: string[] = [];
const asyncMe = ref(0);

const getNames = async () => {
    if (asyncMe.value === 0) {
        asyncMe.value = 1;

        let response = await axios.get(`http://localhost:3000/users/id/${actualGame.player2.playerId}`);


        p2.push(response.data.names, response.data.picture);
        response = await axios.get(`http://localhost:3000/users/id/${actualGame.player1.playerId}`);
        p1.push(response.data.names, response.data.userPic);


        console.log("p1 is :", p1, " and p2 is :", p2);
        asyncMe.value = 2;
    }
};

enum KeyBindings {
    //p1
    UP = 87,
    DOWN = 83,
    //p2
    UP2 = 79,
    DOWN2 = 76,
    //specials
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

    constructor()
    {

        this.gameCanvas = document.getElementById("game-canvas");
        this.gameContext = this.gameCanvas.getContext("2d");

        Game.fontSize = window.innerHeight / 20;
        this.gameContext.font = Game.fontSize + "px Orbitron";

        Game.resizerWidth = window.innerWidth < 1050 ? window.innerWidth : this.gameCanvas.width;
        document.documentElement.style.setProperty('--game-width', `${Game.resizerWidth / 20}px`);

        Game.resizerHeight = Game.resizerWidth / 1.75;
        document.documentElement.style.setProperty('--game-height', `${Game.resizerWidth / 20}px`);


        this.ballSize = window.innerHeight < 600 ? this.gameCanvas.height / 100 : window.innerHeight / 100;

        const whichSubstitute = (event) => {
            const theChar = event.code;
            if (theChar.startsWith('Key')) {
                return theChar.codePointAt(3);
            }
            if (theChar.startsWith('Digit')) {
                return theChar.codePointAt(5);
            }
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

        var paddleWidth: number = Game.resizerWidth / 70, wallOffset: number = 20;
        var paddleHeight: number = Game.resizerHeight / 6.7;

        this.player1 = new Paddle(paddleWidth, paddleHeight, wallOffset, this.gameCanvas.height / 2 - paddleHeight / 2);
        this.opponentPlayer = new opponentPaddle(paddleWidth, paddleHeight, this.gameCanvas.width - (wallOffset + paddleWidth), this.gameCanvas.height / 2 - paddleHeight / 2);
        this.ball = new Ball(this.gameCanvas.width / 2 - this.ballSize / 2, this.gameCanvas.height / 2 - this.ballSize / 2, this.ballSize);

        const player1 = {
            playerId: Game.PlayerIdgame, // Replace with the desired player ID
            x: this.player1.x,
            y: this.player1.y,
        };

        const player2 = {
            playerId: 3, // Replace with the desired player ID
            x: this.opponentPlayer.x,
            y: this.opponentPlayer.y,
        };

        const ball = {

            x: this.ball.x,
            y: this.ball.y,
            xVel: this.ball.xVel,
            yVel: this.ball.yVel
        };

        socket.emit('createGame', { player1Score: 0, player2Score: 0, player1: player1, player2: player2, gameMode: Game.Mode, ball: ball, width: 1050, height: 600 }, (response: any) => {
            Game.opponentWon = "";
            Game.playerWon = "";
            actualGame = response;
            console.log("Game picked: ", response);

        });

        socket.emit('findAllGames', (response: any) => {
            console.log('Response from server, all games are:', response);

        });

        socket.on('gameRoom', (games) => {

            actualGame = games;
            console.log('iD for this game: ', actualGame.id); // Handle the received games data
        });

        socket.on('gameChanged', (game) => {
            actualGame = game;
        });

    }


    pickMyColors(compute: string) {
        if (actualGame !== undefined) {
            if (p1.length === 0 || p2.length === 0)
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
    update() {
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
        if (actualGame !== undefined)
            Game.Mode = actualGame.gameMode;
        this.gameContext.font = Game.fontSize / 2 + "px Orbitron";
        Game.fontSize = window.innerHeight / 20;
        Game.resizerWidth = window.innerWidth < 1050 ? window.innerWidth : this.gameCanvas.width;
        document.documentElement.style.setProperty('--game-width', `${Game.resizerWidth / 20}px`);
        // console.log('New window width:', Game.resizerWidth);
        Game.resizerHeight = Game.resizerWidth / 1.75;
        document.documentElement.style.setProperty('--game-height', `${Game.resizerWidth / 20}px`);
        // console.log('getting bored damn', Game.resizerWidth, " and ", Game.resizerHeight);
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

    update(canvas) {

        this.height = canvas.height / 6.7;
        this.width = canvas.width / 70;
        this.x = canvas.width / 47;

        if ((Game.keysPressed[KeyBindings.POWER])) { // trying stoopid thing for game
            //TODO 
            console.log("Make it bigger? hahant"); // Handle the response from the server
            // if (actualGame !== undefined) {
            //     // console.log(canvas.height);
            //     socket.emit('playerInput', {
            //         actualGame: actualGame,
            //         gameId: actualGame.id, // Provide the ID of the game you want to update
            //         playerId: actualGame.player1.playerId,
            //         keyCode: KeyBindings.UP,
            //         canvasWidth: canvas.width,
            //         canvasHeight: canvas.height,
            //         playerHeight: this.height

            //     }, (response) => {

            //         //console.log('Response from server:', response); // Handle the response from the server
            //     });
            //     this.yVel = actualGame.player1.yVel;

            // }
        }
        // console.log("play1 paddle", this.y + this.height, " y canvas.height -20 es : ", canvas.height - 20);
        else if (Game.keysPressed[KeyBindings.UP]) {
            // this.yVel = -1;
            // console.log(this.y, "and the canvasH /20 is ", canvas.height / 20)
            // if (this.y <= canvas.height / 20) {
            //     this.yVel = 0
            // }

            if (actualGame !== undefined) {
                // console.log(canvas.height);
                socket.emit('playerInput', {
                    actualGame: actualGame,
                    gameId: actualGame.id, // Provide the ID of the game you want to update
                    playerId: actualGame.player1.playerId,
                    keyCode: KeyBindings.UP,
                    canvasWidth: canvas.width,
                    canvasHeight: canvas.height,
                    playerHeight: this.height

                }, (response) => {

                    //console.log('Response from server:', response); // Handle the response from the server
                });
                this.yVel = actualGame.player1.yVel;

            }
            // console.log(this.yVel, "last vel and actual :", actualGame.player1.yVel);

        } else if (Game.keysPressed[KeyBindings.DOWN]) {
            // this.yVel = 1;
            // if (this.y + this.height >= canvas.height - canvas.height / 30) {
            //     this.yVel = 0;
            // }
            if (actualGame !== undefined) {
                // console.log("pabajooo", this.height)
                socket.emit('playerInput', {
                    actualGame: actualGame,
                    gameId: actualGame.id, // Provide the ID of the game you want to update
                    playerId: actualGame.player1.playerId,
                    keyCode: KeyBindings.DOWN,
                    canvasWidth: canvas.width,
                    canvasHeight: canvas.height,
                    playerHeight: this.height
                }, (response) => {
                    // console.log("hate it ", response)

                    //console.log('Response from server:', response); // Handle the response from the server
                });
                this.yVel = actualGame.player1.yVel;
            }

        }
        else {
            this.yVel = 0;
            this.height = canvas.height / 6.7;
        }

        // this.y = this.y * (canvas.height / 600); + this.yVel * this.speed > 600 - 600 / 30 ? canvas.height - canvas.height / 30 - (this.height * 1.85) : this.y + this.yVel * this.speed;
        if (actualGame !== undefined) {
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
    update(canvas) {

        this.height = canvas.height / 6.7;
        this.width = canvas.width / 70;
        this.x = canvas.width / 1.035;
        // console.log("wass play2 paddle", this.y, " y canvas x : ", this.x);


        // console.log("is play2 paddle", this.y, " y canvas x : ", this.x);
        if (Game.keysPressed[KeyBindings.UP2]) {
            // this.yVel = -1;
            // if (this.y <= canvas.height / 20) {
            //     this.yVel = 0
            // }
            if (actualGame !== undefined) {
                socket.emit('playerInput', {
                    actualGame: actualGame,
                    gameId: actualGame.id, // Provide the ID of the game you want to update
                    playerId: actualGame.player2.playerId,
                    keyCode: KeyBindings.UP2,
                    canvasWidth: canvas.width,
                    canvasHeight: canvas.height,
                    playerHeight: this.height
                }, (response) => {
                    //console.log('Response from server:', response); // Handle the response from the server
                });
            }
            // this.yVel = actualGame.player2.yVel;
        } else if (Game.keysPressed[KeyBindings.DOWN2]) {
            // this.yVel = 1;
            // if (this.y + this.height >= canvas.height - canvas.height / 30) {
            //     this.yVel = 0;
            // }
            if (actualGame !== undefined) {
                socket.emit('playerInput', {
                    actualGame: actualGame,
                    gameId: actualGame.id, // Provide the ID of the game you want to update
                    playerId: actualGame.player2.playerId,
                    keyCode: KeyBindings.DOWN2,
                    canvasWidth: canvas.width,
                    canvasHeight: canvas.height,
                    playerHeight: this.height
                }, (response) => {
                    //console.log('Response from server:', response); // Handle the response from the server
                });

            }
            // this.yVel = actualGame.player2.yVel;
        } else {
            if (actualGame !== undefined)
                this.yVel = actualGame.player2.yVel = 0;
            else
                this.yVel = 0;
        }

        this.y = this.y + this.yVel * this.speed > canvas.height - canvas.height / 30 ? canvas.height - canvas.height / 30 - (this.height * 1.85) : this.y + this.yVel * this.speed;
        if (actualGame !== undefined) {
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
        if (actualGame !== undefined) {
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


        // //check top canvas bounds
        // if (this.y <= 10) {
        //     this.yVel *= -1;

        //     wallHit.play();
        // }

        // //check bottom canvas bounds
        // if (this.y + this.height >= canvas.height - 10) {
        //     this.yVel *= -1;

        //     wallHit.play();
        // }

        //check left canvas bounds
        // if (this.x <= 0) {
        //     this.x = canvas.width / 2 - this.width / 2;
        //     Game.opponentScore += 1;
        //     this.round += 1;
        //     // this.speed += 2;
        //     this.pointSide = "opponent";
        //     actualGame.player2Score += 1;
        //     Game.matchInfoA = "";
        //     Game.matchInfoB = "";
        //     aPoint.play();
        //     if (actualGame !== undefined)
        //         socket.emit('updateGame', {
        //             id: actualGame.id, // Provide the ID of the game you want to update
        //             player2Score: actualGame.player2Score,
        //         }, (response) => {
        //             //console.log('Response from server:', response); // Handle the response from the server
        //         });
        // }

        //check right canvas bounds
        // if (this.x + this.width >= canvas.width) {
        //     this.x = canvas.width / 2 - this.width / 2;
        //     Game.playerScore += 1;
        //     this.round += 1;
        //     // this.speed += 2;
        //     this.pointSide = "player";
        //     actualGame.player1Score += 1;
        //     Game.matchInfoA = "";
        //     Game.matchInfoB = "";
        //     aPoint.play();
        //     if (actualGame !== undefined)
        //         socket.emit('updateGame', {
        //             id: actualGame.id, // Provide the ID of the game you want to update
        //             player1Score: actualGame.player1Score,
        //         }, (response) => {
        //             console.log('Response from server 1:', response); // Handle the response from the server
        //         });
        // }

        //check my paddle collision
        // if (this.x <= player.x + player.width) { // check for vel if its in the edges
        //     if (this.y + this.height >= player.y && this.y <= player.y + player.height) {
        //         if ((Game.keysPressed[KeyBindings.STICKY])) { //sticky trick, make one for lower the speed of the ball ?
        //             this.xVel = 0;
        //             this.yVel = 0;
        //             this.x = player.x + player.width;
        //             this.y = player.y + player.height / 2;
        //         }
        //         else {
        //             // this.yVel = (player.y- (this.y  + Game.paddleHeight / 2)) ;
        //             // console.log('im here! ', player.y);

        //             this.xVel = (this.y > (player.y + canvas.height / 6.7 / 4) && this.y < (player.y + canvas.height / 6.7 / 4 * 3) ? 2.5 : 1);
        //             // console.log("y speed before:", this.yVel);
        //             this.yVel = (this.y - (player.y + canvas.height / 6.7 / 2)) / 20;
        //             // console.log('im ball! ', this.y, '  im padle: ', player.y, ' and my size is : ', Game.paddleHeight, " y speed after hit:", this.xVel);
        //             this.speed *= 1.03 + (player.yVel * .03);
        //             ;
        //             paddleHit.play();
        //         }
        //     }
        // }

        // Check opponent collision (including the lower end)
        // if (this.x + this.width >= opponent.x) {
        //     if (this.y + this.height >= opponent.y && this.y <= opponent.y + opponent.height) {
        //         this.xVel = (this.y > (opponent.y + canvas.height / 6.7 / 4) && this.y < (opponent.y + canvas.height / 6.7 / 4 * 3) ? -2.5 : -1);
        //         this.yVel = -(this.y - (opponent.y + canvas.height / 6.7 / 2)) / 20;
        //         // console.log('im ball! ', this.y, '  im opponent: ', opponent.y, ' and my size is : ', Game.paddleHeight, " y speed after hit:", this.xVel);
        //         // this.xVel = -1;
        //         this.speed *= 1.03 + (opponent.yVel * .03);

        //         paddleHit.play();
        //     }
        // }

        // this.x += this.xVel * (this.speed * 1);
        // this.y += this.yVel * (this.speed * 1);

        if (actualGame !== undefined) {
            // this.x = actualGame.ball.x;
            // this.y = actualGame.ball.y;
            //FIXME
            this.x = actualGame.ball.x * Game.resizerWidth / 1050;
            this.y = actualGame.ball.y * Game.resizerHeight / 600;
        }

    }


}

export default defineComponent({

    props: {
        user: {
            type: String,
            required: true,
        },
        userId: {
            type: String,
            required: true,
        },
        gameMode: {
            type: String,
            required: true,

        }
    },
    
    setup(props) {
        const theplayer = window.history.state.user;
        const theplayerId = window.history.state.userid;
        const whichGame = window.history.state.gamemode;
        const gameCanvas = ref(null);
        const gameContext = ref(null);
        const game = ref(null);
        console.log("im the king ", props.userId, " also", props.user, props.gameMode)
        function resizeCanvas() {
            const canvas = gameCanvas.value;
            // console.log(canvas.width, " and ", window.innerWidth, " --- height ", canvas.height, " and ", window.innerHeight);
            canvas.width = window.innerWidth < 1050 ? window.innerWidth : 1050; // Set canvas width to window width
            canvas.height = canvas.width * 0.5715; // Set canvas height to window height
        }

        const whichSubstitute = (event) => {
            const theChar = event.code;
            if (theChar.startsWith('Key')) {
                return theChar.codePointAt(3);
            }
            if (theChar.startsWith('Digit')) {
                return theChar.codePointAt(5);
            }
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

        window.addEventListener('resize', resizeCanvas);

        onBeforeMount(() => {
            Game.Mode = whichGame;
            Game.PlayerIdgame = theplayerId;
        });


        onMounted(() => {
            game.value = new Game();
            // Game.Mode = whichGame;

            window.addEventListener("keydown", handleKeyDown);
            window.addEventListener("keyup", handleKeyUp);
            gameCanvas.value = document.getElementById("game-canvas");
            gameContext.value = gameCanvas.value.getContext("2d");
            // Default canvas size
            resizeCanvas();

            const animate = () => {
                game.value.update();
                game.value.draw();
                requestAnimationFrame(animate);
            };

            animate();
        });

        // onBeforeUnmount(() => {
        //     Game.opponentWon = "";
        //     // Game.Mode = ""; //shut it if want to keep the actual mode
        //     Game.playerWon = "";

        // });

        onUnmounted(() => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
            // // game.value = new Game();
            // Game.playerScore = 0;
            // Game.opponentScore = 0;
            // Game.opponentWon = "";
            // // Game.Mode = ""; //shut it if want to keep the actual mode
            // Game.playerWon = "";
            // Game.matchInfoA = "";
            // Game.matchInfoB = ""
            // game.actualGame = undefined;

        });

        function someUser() {
            return theplayer;
        }

        function gameMode() {
            return whichGame;
        }

        function resetGame() {
            game.value = new Game();
            Game.playerScore = 0;
            Game.opponentScore = 0;
            Game.opponentWon = "";
            // Game.Mode = ""; //shut it if want to keep the actual mode
            Game.playerWon = "";
            Game.matchInfoA = "";
            Game.matchInfoB = ""
            game.actualGame = undefined;

        }

        return {
            p1,
            p2,
            asyncMe,
            theplayerId,
            whichGame,
            resetGame,
            gameMode,
            theplayer,
            gameCanvas,
            gameContext,
            game,
            someUser,
        };

    },

});
</script>

<style scoped>
.game-container {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
}

canvas {
    background: rgb(223, 106, 106);
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