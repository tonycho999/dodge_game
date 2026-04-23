const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('final-score');
const gameOverScreen = document.getElementById('game-over');
const restartBtn = document.getElementById('restart-btn');

// 하단 조작 버튼 요소 가져오기
const btnLeft = document.getElementById('btn-left');
const btnRight = document.getElementById('btn-right');

let player;
let obstacles = []; 
let stars = [];     
let score = 0;
let gameLoopId;
let isGameOver = false;
let scoreInterval;
let frameCount = 0;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    // 전체 높이에서 하단 컨트롤 영역(약 90px: 패딩 포함) 제외한 높이
    canvas.height = window.innerHeight - 90; 
    
    if (player) {
        // 비행기를 캔버스 맨 아래쪽으로 명확하게 위치시킴
        player.y = canvas.height - player.height - 10; 
        if(player.x > canvas.width) player.x = canvas.width - player.width;
    }
}

window.addEventListener('resize', resizeCanvas);

function initStars() {
    stars = [];
    for (let i = 0; i < 70; i++) { 
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 2,
            speed: Math.random() * 3 + 1
        });
    }
}

function drawBackground() {
    ctx.fillStyle = '#0b192c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ffffff';
    stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
        star.y += star.speed;

        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
    });
}

function init() {
    resizeCanvas(); 
    
    player = new Player(canvas.width, canvas.height);
    // 비행기 위치 다시 한 번 강제 교정 (화면 잘림 방지)
    player.y = canvas.height - player.height - 10;
    player.speed = window.innerWidth > 600 ? 8 : 6; 
    
    obstacles = [];
    score = 0;
    frameCount = 0;
    isGameOver = false;
    
    initStars();
    
    scoreElement.innerText = score;
    gameOverScreen.classList.add('hidden');

    clearInterval(scoreInterval);
    scoreInterval = setInterval(() => {
        if (!isGameOver) {
            score++;
            scoreElement.innerText = score;
        }
    }, 1000);

    update();
}

function update() {
    if (isGameOver) return;
    frameCount++;

    drawBackground();

    let speedMultiplier = 1 + (score * 0.03); 
    let spawnRate = Math.max(10, 24 - Math.floor(score * 0.3));

    if (frameCount % spawnRate === 0) {
        if (Math.random() > 0.7) {
            obstacles.push(new Asteroid(canvas.width, speedMultiplier));
        } else {
            obstacles.push(new Missile(canvas.width, speedMultiplier));
        }
    }

    player.update(canvas.width);
    player.draw(ctx);

    for (let i = 0; i < obstacles.length; i++) {
        obstacles[i].update(canvas.width);
        obstacles[i].draw(ctx);

        if (obstacles[i].y > canvas.height) {
            obstacles.splice(i, 1);
            i--;
            continue;
        }

        if (detectCollision(player, obstacles[i])) {
            gameOver();
        }
    }

    gameLoopId = requestAnimationFrame(update);
}

function detectCollision(rect1, rect2) {
    const margin = 5; 
    return (
        rect1.x < rect2.x + rect2.width - margin &&
        rect1.x + rect1.width - margin > rect2.x &&
        rect1.y < rect2.y + rect2.height - margin &&
        rect1.y + rect1.height - margin > rect2.y
    );
}

function gameOver() {
    isGameOver = true;
    clearInterval(scoreInterval);
    cancelAnimationFrame(gameLoopId);
    // 이동 정지
    player.dx = 0; 
    
    finalScoreElement.innerText = score;
    gameOverScreen.classList.remove('hidden');
}

// --------------------------------------------------
// 키보드 조작 (PC)
// --------------------------------------------------
document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft') player.dx = -player.speed;
    if (e.code === 'ArrowRight') player.dx = player.speed;
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') player.dx = 0;
});

// --------------------------------------------------
// ★ 버튼 터치/클릭 이벤트 (모바일/PC 공통)
// --------------------------------------------------
function moveLeft(e) {
    e.preventDefault(); // 스크롤 등 기본 동작 방지
    player.dx = -player.speed;
}

function moveRight(e) {
    e.preventDefault();
    player.dx = player.speed;
}

function stopMove(e) {
    e.preventDefault();
    player.dx = 0;
}

// 왼쪽 버튼 이벤트
btnLeft.addEventListener('touchstart', moveLeft, {passive: false});
btnLeft.addEventListener('mousedown', moveLeft);

btnLeft.addEventListener('touchend', stopMove, {passive: false});
btnLeft.addEventListener('mouseup', stopMove);
btnLeft.addEventListener('mouseleave', stopMove);

// 오른쪽 버튼 이벤트
btnRight.addEventListener('touchstart', moveRight, {passive: false});
btnRight.addEventListener('mousedown', moveRight);

btnRight.addEventListener('touchend', stopMove, {passive: false});
btnRight.addEventListener('mouseup', stopMove);
btnRight.addEventListener('mouseleave', stopMove);


restartBtn.addEventListener('click', init);

init();
