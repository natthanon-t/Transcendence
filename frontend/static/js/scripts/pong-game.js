class PongGame3D extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' }); // Use shadow DOM for isolation
    }

    connectedCallback() {
        // Scene, Camera, Renderer
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.shadowRoot.appendChild(this.renderer.domElement);

        // Arena (Longer Map)
        this.arenaGeometry = new THREE.PlaneGeometry(30, 20);
        this.arenaMaterial = new THREE.MeshBasicMaterial({ color: 0x222222, side: THREE.DoubleSide });
        this.arena = new THREE.Mesh(this.arenaGeometry, this.arenaMaterial);
        this.arena.rotation.x = Math.PI / 2;
        this.scene.add(this.arena);

        // Player Paddle
        this.paddleGeometry = new THREE.BoxGeometry(4, 0.5, 1); // Increased width
        this.paddleMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        this.playerPaddle = new THREE.Mesh(this.paddleGeometry, this.paddleMaterial);
        this.playerPaddle.position.set(0, -9, 0.5);
        this.scene.add(this.playerPaddle);

        // AI Paddle
        this.aiPaddleGeometry = new THREE.BoxGeometry(4, 0.5, 1); // Increased width
        this.aiPaddleMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        this.aiPaddle = new THREE.Mesh(this.aiPaddleGeometry, this.aiPaddleMaterial);
        this.aiPaddle.position.set(0, 9, 0.5);
        this.scene.add(this.aiPaddle);

        // Ball
        this.ballGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        this.ballMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
        this.ball = new THREE.Mesh(this.ballGeometry, this.ballMaterial);
        this.scene.add(this.ball);

        // Lighting
        this.light = new THREE.PointLight(0xffffff, 1, 100);
        this.light.position.set(0, 0, 10);
        this.scene.add(this.light);

        // Position the Camera
        this.camera.position.set(0, 0, 15);
        this.camera.lookAt(0, 0, 0);

        // Ball Velocity
        this.ballVelocity = { x: 0.1, y: 0.1 };
        this.ballSpeedMultiplier = 1; // Initial speed multiplier
        this.speedIncreaseInterval = 1000; // Increase speed every 1 second
        this.lastSpeedIncreaseTime = Date.now();

        // Player Movement
        this.playerX = 0;
        this.paddleSpeed = 0.5;

        // AI Movement
        this.aiSpeed = 0.3;

        // Scores
        this.playerScore = 0;
        this.aiScore = 0;

        // Scoreboard
        this.scoreboard = document.createElement('div');
        this.scoreboard.style.position = 'absolute';
        this.scoreboard.style.top = '20px';
        this.scoreboard.style.left = '50%';
        this.scoreboard.style.transform = 'translateX(-50%)';
        this.scoreboard.style.color = 'white';
        this.scoreboard.style.fontSize = '24px';
        this.scoreboard.style.fontFamily = 'Arial, sans-serif';
        this.scoreboard.style.textAlign = 'center';
        this.scoreboard.innerHTML = `You: ${this.playerScore} - AI: ${this.aiScore}`;
        this.shadowRoot.appendChild(this.scoreboard);

        // Keyboard Controls
        this.keys = { left: false, right: false };

        document.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowLeft' || event.key === 'a') this.keys.left = true;
            if (event.key === 'ArrowRight' || event.key === 'd') this.keys.right = true;
        });

        document.addEventListener('keyup', (event) => {
            if (event.key === 'ArrowLeft' || event.key === 'a') this.keys.left = false;
            if (event.key === 'ArrowRight' || event.key === 'd') this.keys.right = false;
        });

        this.animate();
    }

    // Update Player Paddle Position
    movePlayerPaddle() {
        if (this.keys.left && this.playerX > -13) this.playerX -= this.paddleSpeed;
        if (this.keys.right && this.playerX < 13) this.playerX += this.paddleSpeed;

        this.playerPaddle.position.x = THREE.MathUtils.lerp(this.playerPaddle.position.x, this.playerX, 0.2);
    }

    // Move AI Paddle
    moveAIPaddle() {
        if (this.aiPaddle.position.x < this.ball.position.x - 0.5) {
            this.aiPaddle.position.x += this.aiSpeed;
        } else if (this.aiPaddle.position.x > this.ball.position.x + 0.5) {
            this.aiPaddle.position.x -= this.aiSpeed;
        }
        this.aiPaddle.position.x = THREE.MathUtils.clamp(this.aiPaddle.position.x, -13, 13);
    }

    // Move Ball
    moveBall() {
        // Apply speed multiplier to ball velocity
        const currentTime = Date.now();
        if (currentTime - this.lastSpeedIncreaseTime > this.speedIncreaseInterval) {
            this.ballSpeedMultiplier += 0.1; // Increase speed by 10% every second
            this.lastSpeedIncreaseTime = currentTime;
        }

        this.ball.position.x += this.ballVelocity.x * this.ballSpeedMultiplier;
        this.ball.position.y += this.ballVelocity.y * this.ballSpeedMultiplier;

        // Collision with Walls
        if (this.ball.position.x >= 14.5 || this.ball.position.x <= -14.5) {
            this.ballVelocity.x = -this.ballVelocity.x;
        }

        // Check for scoring
        if (this.ball.position.y > 10) {
            this.playerScore++;
            this.updateScore();
            this.resetBall();
        } else if (this.ball.position.y < -10) {
            this.aiScore++;
            this.updateScore();
            this.resetBall();
        }
    }

    // Paddle Collisions
    checkPaddleCollision() {
        // Player Paddle
        if (
            this.ball.position.y <= this.playerPaddle.position.y + 0.5 &&
            this.ball.position.y >= this.playerPaddle.position.y - 0.5 &&
            this.ball.position.x >= this.playerPaddle.position.x - 2 &&
            this.ball.position.x <= this.playerPaddle.position.x + 2
        ) {
            this.ballVelocity.y = -this.ballVelocity.y;
        }

        // AI Paddle
        if (
            this.ball.position.y >= this.aiPaddle.position.y - 0.5 &&
            this.ball.position.y <= this.aiPaddle.position.y + 0.5 &&
            this.ball.position.x >= this.aiPaddle.position.x - 2 &&
            this.ball.position.x <= this.aiPaddle.position.x + 2
        ) {
            this.ballVelocity.y = -this.ballVelocity.y;
        }
    }

    // Reset Ball
    resetBall() {
        this.ball.position.set(0, 0, 0);
        this.ballVelocity.x = (Math.random() > 0.5 ? 0.3 : -0.3) * 0.2;
        this.ballVelocity.y = (Math.random() > 0.5 ? 0.3 : -0.3) * 0.2;
        this.ballSpeedMultiplier = 1; // Reset speed multiplier
    }

    // Update Score
    updateScore() {
        this.scoreboard.innerHTML = `You: ${this.playerScore} - AI: ${this.aiScore}`;

        if (this.playerScore === 5 || this.aiScore === 5) {
            alert(this.playerScore === 5 ? 'You Win!' : 'AI Wins!');
            this.playerScore = 0;
            this.aiScore = 0;
            this.updateScore();
        }
    }

    // Animation Loop
    animate() {
        requestAnimationFrame(() => this.animate());

        this.movePlayerPaddle();
        this.moveAIPaddle();
        this.moveBall();
        this.checkPaddleCollision();

        this.renderer.render(this.scene, this.camera);
    }
}

// Define the new element
customElements.define('pong-game2', PongGame3D);