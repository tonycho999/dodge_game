const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('final-score');
const gameOverScreen = document.getElementById('game-over');
const restartBtn = document.getElementById('restart-btn');

let player;
let obstacles = []; // 미사일과 운석을 모두 담을 배열
let stars = [];     // 배경 별 배열
let score = 0;
let gameLoopId;
let isGameOver = false;
let scoreInterval;
let frameCount = 0; // 난이도 조절을 위한 프레임 카운터

// 우주 배경의 별 초기화
function initStars() {
    stars = [];
    for (let i = 0; i < 50; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 2,
            speed: Math.random() * 3 + 1 // 별이 떨어지는 속도
        });
    }
}

// 배경과 별 그리기
function drawBackground() {
    // 캔버스 배경을 아주 짙은 남색(우주)으로 칠하기
    ctx.fillStyle = '#0b192c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 별 그리기 및 이동 (스크롤 효과)
    ctx.fillStyle = '#ffffff';
    stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
        star.y += star.speed;

        // 별이 화면 아래로 내려가면 다시 위에서 생성
        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
    });
}

// 게임 초기화
function init() {
    player = new Player(canvas.width, canvas.height);
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

// 매 프레임 업데이트
function update() {
    if (isGameOver) return;
    frameCount++;

    // 1. 화면 지우기 및 움직이는 배경 그리기
    drawBackground();

    // 2. 난이도 동적 계산 (점수가 오를수록 가속)
    // 1점당 3%씩 속도 증가
    let speedMultiplier = 1 + (score * 0.03); 
    
    // 생성 주기 조절: 기본 24프레임마다 생성, 점수가 오를수록 주기가 짧아짐 (최소 10프레임)
    let spawnRate = Math.max(10, 24 - Math.floor(score * 0.3));

    // 3. 장애물 생성
    if (frameCount % spawnRate === 0) {
        // 운석은 3번에 1번 꼴로 생성
        if (Math.random() > 0.7) {
            obstacles.push(new Asteroid(canvas.width, speedMultiplier));
        } else {
            obstacles.push(new Missile(canvas.width, speedMultiplier));
        }
    }

    // 4. 플레이어 업데이트 및 그리기
    player.update(canvas.width);
    player.draw(ctx);

    // 5. 장애물 업데이트, 그리기 및 충돌 처리
    for (let i = 0; i < obstacles.length; i++) {
        obstacles[i].update(canvas.width);
        obstacles[i].draw(ctx);

        // 화면 밖으로 나간 장애물 제거
        if (obstacles[i].y > canvas.height) {
            obstacles.splice(i, 1);
            i--;
            continue;
        }

        // 충돌 감지
        if (detectCollision(player, obstacles[i])) {
            gameOver();
        }
    }

    gameLoopId = requestAnimationFrame(update);
}

// 충돌 감지 (AABB 알고리즘)
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

// 키보드 조작
document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft') player.dx = -player.speed;
    if (e.code === 'ArrowRight') player.dx = player.speed;
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') player.dx = 0;
});

restartBtn.addEventListener('click', init);

init();
