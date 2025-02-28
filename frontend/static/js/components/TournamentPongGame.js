// static/js/components/TournamentPongGame.js
class TournamentPongGame extends HTMLElement {
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
			:host {
				display: block;
				width: 800px;
				height: 500px;
				margin: 0 auto;
			}
			canvas {
				background-color: black;
				display: block;
				width: 100%;
				height: 100%;
			}
		`;
        
		// Append elements to shadow DOM
        this.shadow.appendChild(style);
        this.shadow.appendChild(this.canvas);
        
        // Get context
        this.ctx = this.canvas.getContext("2d");
        
        // Default player names
        this._player1Name = "Player 1";
        this._player2Name = "Player 2";
        
        // Game objects
        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            radius: 10,
            dx: 2,
            dy: 2,
            color: "WHITE",
        };
        
        this.player1Paddle = {
            x: 0,
            y: this.canvas.height / 2 - 40,
            width: 10,
            height: 80,
            color: "WHITE",
        };
        
        this.player2Paddle = {
            x: this.canvas.width - 10,
            y: this.canvas.height / 2 - 40,
            width: 10,
            height: 80,
            color: "WHITE",
        };
        
        this.keys = {}; // To handle key input
        this.player1Score = 0;
        this.player2Score = 0;
        
        // Game state
        this.gameActive = true;
        this.matchComplete = false;
        this.winScore = 5; // Points needed to win
    }
    
    // Getters/setters for player names
    set player1Name(name) {
        this._player1Name = name;
    }
    
    get player1Name() {
        return this._player1Name;
    }
    
    set player2Name(name) {
        this._player2Name = name;
    }
    
    get player2Name() {
        return this._player2Name;
    }
    
    // Getters/setters for match data
    set matchData(data) {
        this._matchData = data;
        if (data && data.player1 && data.player2) {
            this.player1Name = data.player1.user?.username || data.player1.guest_name || "Player 1";
            this.player2Name = data.player2.user?.username || data.player2.guest_name || "Player 2";
        }
    }
    
    get matchData() {
        return this._matchData;
    }
    
    connectedCallback() {
        // Add event listeners
        window.addEventListener("keydown", (e) => (this.keys[e.key] = true));
        window.addEventListener("keyup", (e) => (this.keys[e.key] = false));
        
        // Start game loop
        requestAnimationFrame(() => this.update());
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
        
        // Draw middle line
        this.ctx.strokeStyle = "white";
        this.ctx.setLineDash([5, 15]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Draw paddles and ball
        this.ctx.font = "30px Arial";
        this.ctx.fillStyle = "WHITE";
        this.drawRect(this.player1Paddle.x, this.player1Paddle.y, this.player1Paddle.width, this.player1Paddle.height, this.player1Paddle.color);
        this.drawRect(this.player2Paddle.x, this.player2Paddle.y, this.player2Paddle.width, this.player2Paddle.height, this.player2Paddle.color);
        this.drawCircle(this.ball.x, this.ball.y, this.ball.radius, this.ball.color);
        
        // Draw scores with player names
        this.ctx.textAlign = "right";
        this.ctx.fillText(`${this.player1Name}: ${this.player1Score}`, this.canvas.width / 2 - 20, 40);
        this.ctx.textAlign = "left";
        this.ctx.fillText(`${this.player2Name}: ${this.player2Score}`, this.canvas.width / 2 + 20, 40);
        
        // Draw controls info
        this.ctx.textAlign = "center";
        this.ctx.font = "14px Arial";
        this.ctx.fillText(`${this.player1Name}: W/S keys`, this.canvas.width / 4, this.canvas.height - 20);
        this.ctx.fillText(`${this.player2Name}: ↑/↓ keys`, 3 * this.canvas.width / 4, this.canvas.height - 20);
        
        // Draw game over message if match is complete
        if (this.matchComplete) {
            this.ctx.textAlign = "center";
            this.ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
            this.ctx.fillRect(this.canvas.width / 4, this.canvas.height / 3, this.canvas.width / 2, 120);
            this.ctx.fillStyle = "black";
            this.ctx.font = "24px Arial";
            this.ctx.fillText("Match Complete!", this.canvas.width / 2, this.canvas.height / 3 + 40);
            
            const winner = this.player1Score > this.player2Score ? this.player1Name : this.player2Name;
            this.ctx.fillText(`${winner} wins!`, this.canvas.width / 2, this.canvas.height / 3 + 80);
        }
    }
    
    moveBall() {
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;
        
        // Bounce off top and bottom
        if (this.ball.y + this.ball.radius > this.canvas.height || this.ball.y - this.ball.radius < 0) {
            this.ball.dy = -this.ball.dy;
        }
        
        // Paddle collision (Player 1)
        if (
            this.ball.x - this.ball.radius < this.player1Paddle.x + this.player1Paddle.width &&
            this.ball.x - this.ball.radius > this.player1Paddle.x &&
            this.ball.y > this.player1Paddle.y &&
            this.ball.y < this.player1Paddle.y + this.player1Paddle.height
        ) {
            this.ball.dx = -this.ball.dx * 1.05; // Slightly increase speed after paddle hit
        }
        
        // Paddle collision (Player 2)
        if (
            this.ball.x + this.ball.radius > this.player2Paddle.x &&
            this.ball.x + this.ball.radius < this.player2Paddle.x + this.player2Paddle.width &&
            this.ball.y > this.player2Paddle.y &&
            this.ball.y < this.player2Paddle.y + this.player2Paddle.height
        ) {
            this.ball.dx = -this.ball.dx * 1.05; // Slightly increase speed after paddle hit
        }
        
        // Reset ball if it goes out
        if (this.ball.x - this.ball.radius < 0) {
            this.player2Score += 1;
            this.resetBall();
            this.checkForWinner();
        }
        if (this.ball.x + this.ball.radius > this.canvas.width) {
            this.player1Score += 1;
            this.resetBall();
            this.checkForWinner();
        }
    }
    
    resetBall() {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        
        // Randomize direction but ensure it goes left or right
        this.ball.dx = (Math.random() > 0.5 ? 2 : -2) * (1 + Math.random() * 0.3);
        this.ball.dy = (Math.random() > 0.5 ? 2 : -2) * (Math.random() * 0.3 + 0.7);
    }
    
    movePlayer1Paddle() {
        const step = 5;
        if (this.keys["w"] || this.keys["W"]) this.player1Paddle.y = Math.max(this.player1Paddle.y - step, 0);
        if (this.keys["s"] || this.keys["S"]) this.player1Paddle.y = Math.min(this.player1Paddle.y + step, this.canvas.height - this.player1Paddle.height);
    }
    
    movePlayer2Paddle() {
        // For two-player mode, use arrow keys for player 2
        const step = 5;
        if (this.keys["ArrowUp"]) this.player2Paddle.y = Math.max(this.player2Paddle.y - step, 0);
        if (this.keys["ArrowDown"]) this.player2Paddle.y = Math.min(this.player2Paddle.y + step, this.canvas.height - this.player2Paddle.height);
    }
    
	checkForWinner() {
		if (this.player1Score >= this.winScore || this.player2Score >= this.winScore) {
			this.gameActive = false;
			this.matchComplete = true;
			
			// Dispatch event with game result
			const event = new CustomEvent("gameend", {
				bubbles: true,
				composed: true,
				detail: {
					player1Score: this.player1Score,
					player2Score: this.player2Score,
					winner: this.player1Score > this.player2Score ? 1 : 2,
					player1Name: this.player1Name,
					player2Name: this.player2Name,
					autoSubmit: true // Flag to indicate auto-submit
				}
			});
			
			this.dispatchEvent(event);
		}
	}
    
    update() {
        if (this.gameActive) {
            this.moveBall();
            this.movePlayer1Paddle();
            this.movePlayer2Paddle();
        }
        
        this.draw();
        requestAnimationFrame(() => this.update());
    }
    
    // Method to reset the entire game
    resetGame() {
        this.player1Score = 0;
        this.player2Score = 0;
        this.resetBall();
        this.gameActive = true;
        this.matchComplete = false;
    }
    
    disconnectedCallback() {
        // Remove event listeners when component is removed
        window.removeEventListener("keydown", this.handleKeyDown);
        window.removeEventListener("keyup", this.handleKeyUp);
    }
}

// Define the custom element
customElements.define("tournament-pong-game", TournamentPongGame);