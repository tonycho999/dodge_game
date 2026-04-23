const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('final-score');
const gameOverScreen = document.getElementById('game-over');
const restartBtn = document.getElementById('restart-btn');

let player;
let obstacles = []; 
let stars = [];     
let score = 0;
let gameLoopId;
let isGameOver = false;
let scoreInterval;
let frameCount = 0;

// ★ 화면 크기에 맞게 캔버스 크기 조절 함수
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // 리사이즈 될 때 플레이어가 화면 밖으로 나가지 않게 하단으로 재배치
    if (player) {
        player.y = canvas.height - player.height - 30; // 하단 여백 30
        if(player.x > canvas.width) player.x = canvas.width - player.width;
    }
}

// 브라우저 창 크기가 변할 때마다 캔버스 크기 다시 맞춤
window.addEventListener('resize', resizeCanvas);

function initStars() {
    stars = [];
    for (let i = 0; i < 70; i++) { // 화면이 커졌으므로 별 개수 증가
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
    // 시작할 때 화면 크기 먼저 설정
    resizeCanvas(); 
    
    player = new Player(canvas.width, canvas.height);
    // 모바일은 화면이 넓어질 수 있으므로 속도를 약간 올림
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
    
    finalScoreElement.innerText = score;
    gameOverScreen.classList.remove('hidden');
}

// --------------------------------------------------
// 입력 컨트롤 처리 (키보드 + 터치)
// --------------------------------------------------

// 1. 키보드 조작 (PC)
document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft') player.dx = -player.speed;
    if (e.code === 'ArrowRight') player.dx = player.speed;
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') player.dx = 0;
});


// 2. ★ 모바일 터치 조작 로직
// 화면 터치 시작 시
canvas.addEventListener('touchstart', (e) => {
    // 터치로 인한 스크롤, 더블탭 확대 방지
    e.preventDefault(); 
    
    // 첫 번째 터치한 손가락의 x좌표 가져오기
    const touchX = e.touches[0].clientX; 
    
    // 화면 중앙을 기준으로 왼쪽/오른쪽 판별
    if (touchX < canvas.width / 2) {
        player.dx = -player.speed; // 왼쪽 이동
    } else {
        player.dx = player.speed;  // 오른쪽 이동
    }
}, { passive: false });

// 손가락을 떼면 멈춤
canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    player.dx = 0; 
}, { passive: false });

// 손가락을 댄 채로 드래그 할 때 방향 전환 처리
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touchX = e.touches[0].clientX;
    if (touchX < canvas.width / 2) {
        player.dx = -player.speed;
    } else {
        player.dx = player.speed;
    }
}, { passive: false });


restartBtn.addEventListener('click', init);

init();
