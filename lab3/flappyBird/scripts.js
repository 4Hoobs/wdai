(() => {
    "use strict";

    // ---------- DOM refs ----------
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    const startScreen = document.getElementById("start-screen");
    const gameoverScreen = document.getElementById("gameover-screen");
    const scoreDisplay = document.getElementById("score-display");
    const finalScoreEl = document.getElementById("final-score");
    const bestScoreEl = document.getElementById("best-score");
    const leaderboardEl = document.getElementById("leaderboard");
    const restartBtn = document.getElementById("restart-btn");

    // ---------- Canvas size ----------
    const W = 288;
    const H = 512;
    canvas.width = W;
    canvas.height = H;

    // ---------- Asset loading ----------
    const assetBase = "assets/";

    function loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    function loadAudio(src) {
        return new Promise((resolve) => {
            const audio = new Audio(src);
            audio.preload = "auto";
            audio.addEventListener("canplaythrough", () => resolve(audio), { once: true });
            // resolve even if loading stalls so the game still works
            setTimeout(() => resolve(audio), 3000);
        });
    }

    // We'll store loaded assets here
    const IMG = {};
    const SFX = {};
    const BGM = {};

    async function loadAssets() {
        const [bg, base, pipeGreen, birdDown, birdMid, birdUp, msgImg, goImg] =
            await Promise.all([
                loadImage(assetBase + "Flappy Bird/background-day.png"),
                loadImage(assetBase + "Flappy Bird/base.png"),
                loadImage(assetBase + "Flappy Bird/pipe-green.png"),
                loadImage(assetBase + "Flappy Bird/yellowbird-downflap.png"),
                loadImage(assetBase + "Flappy Bird/yellowbird-midflap.png"),
                loadImage(assetBase + "Flappy Bird/yellowbird-upflap.png"),
                loadImage(assetBase + "UI/message.png"),
                loadImage(assetBase + "UI/gameover.png"),
            ]);

        IMG.bg = bg;
        IMG.base = base;
        IMG.pipe = pipeGreen;
        IMG.birdFrames = [birdDown, birdMid, birdUp, birdMid]; // animation cycle
        IMG.message = msgImg;
        IMG.gameover = goImg;

        const [sfxDie, sfxHit, sfxPoint, sfxSwoosh, sfxWing, bgAC] = await Promise.all([
            loadAudio(assetBase + "Sound Efects/die.wav"),
            loadAudio(assetBase + "Sound Efects/hit.wav"),
            loadAudio(assetBase + "Sound Efects/point.wav"),
            loadAudio(assetBase + "Sound Efects/swoosh.wav"),
            loadAudio(assetBase + "Sound Efects/wing.wav"),
            loadAudio(assetBase + "Sound Efects/sunny.mp3")
        ]);

        SFX.die = sfxDie;
        SFX.hit = sfxHit;
        SFX.point = sfxPoint;
        SFX.swoosh = sfxSwoosh;
        SFX.wing = sfxWing;
        BGM.sunny = bgAC;
    }

    function playSound(audio) {
        if (!audio) return;
        const clone = audio.cloneNode();
        clone.volume = audio.volume;
        clone.play().catch(() => {});
    }

    // ---------- Background music ----------

    function startBgMusic(music) {
        stopBgMusic(music);
        music.loop = true;
        music.play();
    }

    function stopBgMusic(music) {
        music.pause();
        music.currentTime = 0;
    }

    // ---------- Leaderboard (localStorage) ----------
    const STORAGE_KEY = "flappybird_top5";

    function getLeaderboard() {
        try {
            const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
            if (Array.isArray(data)) return data.slice(0, 5);
        } catch (_) {}
        return [];
    }

    function saveScore(score) {
        const board = getLeaderboard();
        board.push(score);
        board.sort((a, b) => b - a);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(board.slice(0, 5)));
    }

    function renderLeaderboard() {
        const board = getLeaderboard();
        leaderboardEl.innerHTML = "";
        board.forEach((s) => {
            const li = document.createElement("li");
            li.textContent = s;
            leaderboardEl.appendChild(li);
        });
    }

    // ---------- Game constants ----------
    const GRAVITY = 0.1;
    const FLAP_FORCE = -4;
    const PIPE_SPEED = 1;
    const PIPE_SPAWN_INTERVAL = 300; // frames between spawns
    const PIPE_WIDTH = 52;
    const GAP_MIN = 100;
    const GAP_MAX = 140;
    const BASE_HEIGHT = 112;
    const GROUND_Y = H - BASE_HEIGHT;
    const BIRD_W = 34;
    const BIRD_H = 24;

    // ---------- Game state ----------
    let state = "start"; // start | playing | dying | gameover
    let bird, pipes, score, frameCount, baseOffset;
    let animFrame = 0;
    let animTimer = 0;

    function resetGame() {
        bird = {
            x: 60,
            y: H / 2 - 20,
            vy: 0,
            rotation: 0,
        };
        pipes = [];
        score = 0;
        frameCount = 0;
        baseOffset = 0;
        animFrame = 0;
        animTimer = 0;
        scoreDisplay.textContent = "0";
    }

    // ---------- Pipe generation ----------
    function spawnPipe() {
        const gap = GAP_MIN + Math.random() * (GAP_MAX - GAP_MIN);
        // top of the gap ranges so pipes are on screen
        const minTop = 50;
        const maxTop = GROUND_Y - gap - 50;
        const topY = minTop + Math.random() * (maxTop - minTop);
        pipes.push({
            x: W,
            topY: topY,       // bottom edge of the top pipe
            bottomY: topY + gap, // top edge of the bottom pipe
            scored: false,
        });
    }

    // ---------- Collision detection ----------
    function checkCollision() {
        // Ground collision
        if (bird.y + BIRD_H / 2 >= GROUND_Y) {
            bird.y = GROUND_Y - BIRD_H / 2;
            return "ground";
        }
        // Ceiling
        if (bird.y - BIRD_H / 2 <= 0) {
            bird.y = BIRD_H / 2;
            bird.vy = 0;
        }
        // Pipes
        for (const p of pipes) {
            if (
                bird.x + BIRD_W / 2 - 4 > p.x &&
                bird.x - BIRD_W / 2 + 4 < p.x + PIPE_WIDTH
            ) {
                if (
                    bird.y - BIRD_H / 2 + 3 < p.topY ||
                    bird.y + BIRD_H / 2 - 3 > p.bottomY
                ) {
                    return "pipe";
                }
            }
        }
        return null;
    }

    // ---------- Update ----------
    function update() {
        if (state === "playing") {
            // Bird physics
            bird.vy += GRAVITY;
            bird.y += bird.vy;

            // Rotation based on velocity
            bird.rotation = Math.max(-25, Math.min(bird.vy * 3.5, 90));

            // Animate bird wings
            animTimer++;
            if (animTimer >= 6) {
                animTimer = 0;
                animFrame = (animFrame + 1) % IMG.birdFrames.length;
            }

            // Move pipes
            for (const p of pipes) {
                p.x -= PIPE_SPEED;
            }

            // Remove off-screen pipes
            pipes = pipes.filter((p) => p.x + PIPE_WIDTH > -10);

            // Spawn new pipes
            frameCount++;
            if (frameCount % PIPE_SPAWN_INTERVAL === 0) {
                spawnPipe();
            }

            // Score
            for (const p of pipes) {
                if (!p.scored && p.x + PIPE_WIDTH < bird.x) {
                    p.scored = true;
                    score++;
                    scoreDisplay.textContent = score;
                    playSound(SFX.point);
                }
            }

            // Scroll ground
            baseOffset = (baseOffset + PIPE_SPEED) % IMG.base.width;

            // Collision
            const hit = checkCollision();
            if (hit === "pipe") {
                playSound(SFX.hit);
                state = "dying";
                // Bird falls after hitting pipe
                bird.vy = -3; // small bounce
            } else if (hit === "ground") {
                playSound(SFX.hit);
                playSound(SFX.die);
                endGame();
            }
        } else if (state === "dying") {
            // Bird falls down after pipe collision
            bird.vy += GRAVITY;
            bird.y += bird.vy;
            bird.rotation = Math.min(bird.rotation + 4, 90);

            if (bird.y + BIRD_H / 2 >= GROUND_Y) {
                bird.y = GROUND_Y - BIRD_H / 2;
                playSound(SFX.die);
                endGame();
            }
        } else if (state === "start") {
            // Idle float on start screen
            bird.y = H / 2 - 20 + Math.sin(Date.now() / 300) * 8;
            animTimer++;
            if (animTimer >= 8) {
                animTimer = 0;
                animFrame = (animFrame + 1) % IMG.birdFrames.length;
            }
            baseOffset = (baseOffset + 0.5) % IMG.base.width;
        }
    }

    function endGame() {
        state = "gameover";
        stopBgMusic(BGM.sunny);
        saveScore(score);
        const board = getLeaderboard();
        finalScoreEl.textContent = score;
        bestScoreEl.textContent = board.length > 0 ? board[0] : 0;
        renderLeaderboard();
        // scoreDisplay.classList.add("hidden");
        gameoverScreen.classList.remove("hidden");
    }

    // ---------- Draw ----------
    function draw() {
        // Background (tile if needed)
        ctx.drawImage(IMG.bg, 0, 0, W, H);

        // Pipes
        for (const p of pipes) {
            // Top pipe (flipped)
            ctx.save();
            ctx.translate(p.x + PIPE_WIDTH / 2, p.topY);
            ctx.scale(1, -1);
            ctx.drawImage(IMG.pipe, -PIPE_WIDTH / 2, 0);
            ctx.restore();

            // Bottom pipe
            ctx.drawImage(IMG.pipe, p.x, p.bottomY);
        }

        // Ground / base (scrolling)
        const bw = IMG.base.width;
        for (let x = -baseOffset; x < W; x += bw) {
            ctx.drawImage(IMG.base, x, GROUND_Y);
        }

        // Bird
        ctx.save();
        ctx.translate(bird.x, bird.y);
        ctx.rotate((bird.rotation * Math.PI) / 180);
        const frame = IMG.birdFrames[animFrame];
        ctx.drawImage(frame, -BIRD_W / 2, -BIRD_H / 2, BIRD_W, BIRD_H);
        ctx.restore();
    }

    // ---------- Game loop ----------
    function loop() {
        update();
        draw();
        requestAnimationFrame(loop);
    }

    // ---------- Input handling ----------
    function flap() {
        if (state === "start") {
            state = "playing";
            startScreen.classList.add("hidden");
            scoreDisplay.classList.remove("hidden");
            resetGame();
            bird.vy = FLAP_FORCE;
            playSound(SFX.wing);
            startBgMusic(BGM.sunny);
            // Spawn first pipe soon
            frameCount = PIPE_SPAWN_INTERVAL - 30;
        } else if (state === "playing") {
            bird.vy = FLAP_FORCE;
            playSound(SFX.wing);
        }
    }

    document.addEventListener("keydown", (e) => {
        if (e.code === "Space") {
            e.preventDefault();
            flap();
        }
    });

    // Also allow tap / click on canvas
    canvas.addEventListener("click", () => {
        flap();
    });

    restartBtn.addEventListener("click", () => {
        gameoverScreen.classList.add("hidden");
        state = "start";
        resetGame();
        startScreen.classList.remove("hidden");
        playSound(SFX.swoosh);
    });

    // ---------- Bootstrap ----------
    async function init() {
        await loadAssets();
        resetGame();
        loop();
    }

    init();
})();
