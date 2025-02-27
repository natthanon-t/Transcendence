class PongGame extends HTMLElement {
    constructor() {
        super();

        // Create shadow DOM for encapsulation
        this.shadow = this.attachShadow({ mode: "open" });

        // Add canvas to the shadow DOM
        this.canvas = document.createElement("canvas");
        this.canvas.width = 800;
        this.canvas.height = 400;

        // Add styles for the canvas
        const style = document.createElement("style");
        style.textContent = `
            canvas {
                background-color: black;
                display: block;
				margin-top: 100px;
            }
        `;

        this.shadow.appendChild(style);
        this.shadow.appendChild(this.canvas);

        // Get context
        this.ctx = this.canvas.getContext("2d");

        // Game objects
        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            radius: 10,
            dx: 2,
            dy: 2,
            color: "WHITE",
        };

        this.userPaddle = {
            x: 0,
            y: this.canvas.height / 2 - 40,
            width: 10,
            height: 80,
            color: "WHITE",
        };

        this.compPaddle = {
            x: this.canvas.width - 10,
            y: this.canvas.height / 2 - 40,
            width: 10,
            height: 80,
            color: "WHITE",
        };

        this.keys = {}; // To handle key input
    }

    connectedCallback() {
        // Add event listeners
        document.addEventListener("keydown", (e) => (this.keys[e.key] = true));
        document.addEventListener("keyup", (e) => (this.keys[e.key] = false));

        // Start game loop
        this.update();
    }

    drawRect(x, y, width, height, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
    }

    drawCircle(x, y, radius, color) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2, false);
        this.ctx.closePath();
        this.ctx.fill();
    }

    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw paddles and ball
        this.drawRect(this.userPaddle.x, this.userPaddle.y, this.userPaddle.width, this.userPaddle.height, this.userPaddle.color);
        this.drawRect(this.compPaddle.x, this.compPaddle.y, this.compPaddle.width, this.compPaddle.height, this.compPaddle.color);
        this.drawCircle(this.ball.x, this.ball.y, this.ball.radius, this.ball.color);
    }

    moveBall() {
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;

        // Bounce off top and bottom
        if (this.ball.y + this.ball.radius > this.canvas.height || this.ball.y - this.ball.radius < 0) {
            this.ball.dy = -this.ball.dy;
        }

        // Paddle collision (User)
        if (
            this.ball.x - this.ball.radius < this.userPaddle.x + this.userPaddle.width &&
            this.ball.y > this.userPaddle.y &&
            this.ball.y < this.userPaddle.y + this.userPaddle.height
        ) {
            this.ball.dx = -this.ball.dx;
        }

        // Paddle collision (Computer)
        if (
            this.ball.x + this.ball.radius > this.compPaddle.x &&
            this.ball.y > this.compPaddle.y &&
            this.ball.y < this.compPaddle.y + this.compPaddle.height
        ) {
            this.ball.dx = -this.ball.dx;
        }

        // Reset ball if it goes out
        if (this.ball.x + this.ball.radius > this.canvas.width || this.ball.x - this.ball.radius < 0) {
            this.ball.x = this.canvas.width / 2;
            this.ball.y = this.canvas.height / 2;
            this.ball.dx = 2;
            this.ball.dy = 2;
        }

        // AI Movement (Computer paddle)
        this.compPaddle.y += (this.ball.y - (this.compPaddle.y + this.compPaddle.height / 2)) * 0.1;
    }

    moveUserPaddle() {
        const step = 5;
        if (this.keys["ArrowUp"]) this.userPaddle.y = Math.max(this.userPaddle.y - step, 0);
        if (this.keys["ArrowDown"]) this.userPaddle.y = Math.min(this.userPaddle.y + step, this.canvas.height - this.userPaddle.height);
    }

    update() {
        this.moveBall();
        this.moveUserPaddle();
        this.draw();
        requestAnimationFrame(() => this.update());
    }
}

// Define the custom element
customElements.define("pong-game", PongGame);

