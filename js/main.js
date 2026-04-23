const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('final-score');
const gameOverScreen = document.getElementById('game-over');
const restartBtn = document.getElementById('restart-btn');

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

// ★ 이동 상태를 저장하는 변수 추가 (버그 방지용)
let isMovingLeft = false;
let isMovingRight = false;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 90; 
    
    if (player) {
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
    player.y = canvas.height - player.height - 10;
    
    // 상태 초기화
    isMovingLeft = false;
    isMovingRight = false;
    
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

    // ★ 이동 상태에 따라 플레이어 속도 적용 (여기서만 속도가 결정됨)
    if (isMovingLeft) {
        player.dx = -player.speed;
    } else if (isMovingRight) {
        player.dx = player.speed;
    } else {
        player.dx = 0;
    }

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
    
    isMovingLeft = false;
    isMovingRight = false;
    player.dx = 0; 
    
    finalScoreElement.innerText = score;
    gameOverScreen.classList.remove('hidden');
}

// --------------------------------------------------
// 입력 처리 (상태값만 변경)
// --------------------------------------------------

// 키보드 조작
document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft') isMovingLeft = true;
    if (e.code === 'ArrowRight') isMovingRight = true;
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft') isMovingLeft = false;
    if (e.code === 'ArrowRight') isMovingRight = false;
});

// 터치/클릭 버튼 조작 (버튼 누를 때 게임 프레임이 빨라지는 버그 해결)
function handleLeftStart(e) {
    e.preventDefault();
    isMovingLeft = true;
}
function handleLeftEnd(e) {
    e.preventDefault();
    isMovingLeft = false;
}

function handleRightStart(e) {
    e.preventDefault();
    isMovingRight = true;
}
function handleRightEnd(e) {
    e.preventDefault();
    isMovingRight = false;
}

// 왼쪽 버튼
btnLeft.addEventListener('touchstart', handleLeftStart, {passive: false});
btnLeft.addEventListener('mousedown', handleLeftStart);

btnLeft.addEventListener('touchend', handleLeftEnd, {passive: false});
btnLeft.addEventListener('mouseup', handleLeftEnd);
btnLeft.addEventListener('mouseleave', handleLeftEnd);

// 오른쪽 버튼
btnRight.addEventListener('touchstart', handleRightStart, {passive: false});
btnRight.addEventListener('mousedown', handleRightStart);

btnRight.addEventListener('touchend', handleRightEnd, {passive: false});
btnRight.addEventListener('mouseup', handleRightEnd);
btnRight.addEventListener('mouseleave', handleRightEnd);


restartBtn.addEventListener('click', init);

init();
