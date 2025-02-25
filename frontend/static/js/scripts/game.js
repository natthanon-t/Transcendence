class PongGame extends HTMLElement {
    constructor() {
        super();

        // Create shadow DOM for encapsulation
        this.shadow = this.attachShadow({ mode: "open" });

        // Add canvas to the shadow DOM
        this.canvas = document.createElement("canvas");
        this.canvas.width = 800;
        this.canvas.height = 500;

        // Add styles for the canvas
        const style = document.createElement("style");
        style.textContent = `
            canvas {
                background-color: black;
                display: block;
                margin-top: 0px;
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
        this.userScore = 0;
        this.comScore = 0;
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
        this.ctx.font = "30px Arial";
        this.ctx.fillStyle = "WHITE";
        this.drawRect(this.userPaddle.x, this.userPaddle.y, this.userPaddle.width, this.userPaddle.height, this.userPaddle.color);
        this.drawRect(this.compPaddle.x, this.compPaddle.y, this.compPaddle.width, this.compPaddle.height, this.compPaddle.color);
        this.drawCircle(this.ball.x, this.ball.y, this.ball.radius, this.ball.color);
        this.ctx.fillText(`Player: ${this.userScore}`, 50, 40);
        this.ctx.fillText(`Computer: ${this.comScore}`, this.canvas.width - 200, 40);
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
            this.ball.x - this.ball.radius > this.userPaddle.x &&
            this.ball.y > this.userPaddle.y &&
            this.ball.y < this.userPaddle.y + this.userPaddle.height
        ) {
            this.ball.dx = -this.ball.dx;
        }

        // Paddle collision (Computer)
        if (
            this.ball.x + this.ball.radius > this.compPaddle.x &&
            this.ball.x + this.ball.radius < this.compPaddle.x + this.compPaddle.width &&
            this.ball.y > this.compPaddle.y &&
            this.ball.y < this.compPaddle.y + this.compPaddle.height
        ) {
            this.ball.dx = -this.ball.dx;
        }

        // Reset ball if it goes out
        if (this.ball.x - this.ball.radius < 0) {
            this.comScore += 1;
            this.resetBall();
        }
        if (this.ball.x + this.ball.radius > this.canvas.width) {
            this.userScore += 1;
            this.resetBall();
        }
    }

    resetBall() {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        this.ball.dx = 2;
        this.ball.dy = 2;
    }

    moveUserPaddle() {
        const step = 5;
        if (this.keys["ArrowUp"]) this.userPaddle.y = Math.max(this.userPaddle.y - step, 0);
        if (this.keys["ArrowDown"]) this.userPaddle.y = Math.min(this.userPaddle.y + step, this.canvas.height - this.userPaddle.height);
    }

	moveComputerPaddle() {
		const paddleSpeed = randomBetween(0, 2.5); // ความเร็วในการเคลื่อนไหวของพาย
		const errorFactor = randomBetween(0.01, 0.2); // ความสุ่ม (อ่อนลงเพื่อไม่ให้พลาดมาก)
		const timeLag = 2; // เวลาล่าช้า (delay) ในมิลลิวินาที
		const movementThreshold = 1; // ค่าความแตกต่างที่น้อยกว่าค่านี้จะไม่ให้พายคอมพิวเตอร์เคลื่อนที่

		// คำนวณตำแหน่ง Y ของบอลในเวลาที่จะถึงขอบขวาของ canvas
		const predictedY = this.ball.y + this.ball.dy * (this.canvas.width - this.ball.x) / Math.abs(this.ball.dx);

		// ตรวจสอบว่าบอลอยู่ที่กลางจอหรือไปด้านขวานับจากกลาง
		if (this.ball.x >= this.canvas.width / randomBetween(1.2, 3)) {
			// ตรวจสอบการชนขอบบน/ล่างและให้มันเด้งหากออกนอกขอบ
			let targetY = predictedY;
			if (targetY < 0) {
				targetY = -targetY; // เด้งขอบบน
			} else if (targetY > this.canvas.height) {
				targetY = 2 * this.canvas.height - targetY; // เด้งขอบล่าง
			}

			// เพิ่มความสุ่มในตำแหน่งเป้าหมาย
			const randomness = randomBetween(1 - errorFactor, 1 + errorFactor); // สุ่มค่าให้แตกต่างจากตำแหน่งเป้าหมาย
			targetY *= randomness;

			// เก็บเวลาในการล่าช้า
			if (!this.lastMoveTime) {
				this.lastMoveTime = Date.now();
			}

			const currentTime = Date.now();
			const elapsedTime = currentTime - this.lastMoveTime;

			// ถ้าเวลาผ่านไปตามที่กำหนดแล้วให้ตอบสนอง
			if (elapsedTime >= timeLag) {
				// คำนวณความแตกต่างระหว่างตำแหน่งของพายคอมพิวเตอร์กับตำแหน่งที่คำนวณได้
				const difference = targetY - (this.compPaddle.y + this.compPaddle.height / 2);

				// ถ้าความแตกต่างน้อยกว่าค่าที่กำหนด จะไม่ให้พายคอมพิวเตอร์เคลื่อนที่
				if (Math.abs(difference) > movementThreshold) {
					// การเคลื่อนไหวพายคอมพิวเตอร์ให้เข้าหาตำแหน่งที่คำนวณได้ โดยไม่ให้มันแม่นยำเกินไป
					if (Math.abs(difference) > paddleSpeed) {
						this.compPaddle.y += Math.sign(difference) * paddleSpeed;
					}
				}

				// ป้องกันพายคอมพิวเตอร์ไม่ให้เคลื่อนที่ออกนอกขอบ
				this.compPaddle.y = Math.max(0, Math.min(this.canvas.height - this.compPaddle.height, this.compPaddle.y));

				// รีเซ็ตเวลา
				this.lastMoveTime = currentTime;
			}
		}
	}


	checkForWinner() {
        if (this.userScore >= 3) {
            alert("You Win!");
            // window.location.href = "profile.html";  // Go to a new page when the player wins
        }
        if (this.comScore >= 3) {
            alert("Computer Wins!");
            // window.location.href = "profile.html";  // Go to a different page when the computer wins
        }
    }

    update() {
		if (this.userScore < 5 && this.comScore < 5)
		{
			this.moveBall();
			this.moveUserPaddle();
			this.moveComputerPaddle();
			// this.checkForWinner();
			this.draw();
			requestAnimationFrame(() => this.update());
		}
		else if (this.userScore == 3 || this.comScore == 3)
		{
			this.checkForWinner();
		}
    }
}

function randomBetween(min, max) {
	return Math.random() * (max - min) + min;
}

// Define the custom element
customElements.define("pong-game", PongGame);
