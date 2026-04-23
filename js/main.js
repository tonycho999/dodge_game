const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('final-score');
const gameOverScreen = document.getElementById('game-over');
const restartBtn = document.getElementById('restart-btn');

let player;
let missiles = [];
let score = 0;
let gameLoopId;
let isGameOver = false;
let scoreInterval;
let missileInterval;

// 게임 초기화 및 시작 함수
function init() {
    player = new Player(canvas.width, canvas.height);
    missiles = [];
    score = 0;
    isGameOver = false;
    
    scoreElement.innerText = score;
    gameOverScreen.classList.add('hidden');

    // 1초 단위로 점수 증가 타이머
    clearInterval(scoreInterval);
    scoreInterval = setInterval(() => {
        if (!isGameOver) {
            score++;
            scoreElement.innerText = score;
        }
    }, 1000);

    // 0.4초 단위로 미사일 생성 타이머
    clearInterval(missileInterval);
    missileInterval = setInterval(() => {
        if (!isGameOver) {
            missiles.push(new Missile(canvas.width));
        }
    }, 400); 

    update();
}

// 매 프레임마다 화면을 갱신하는 게임 루프
function update() {
    if (isGameOver) return;

    // 1. 이전 프레임 화면 지우기
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. 플레이어 업데이트 및 그리기
    player.update(canvas.width);
    player.draw(ctx);

    // 3. 미사일 업데이트 및 그리기
    for (let i = 0; i < missiles.length; i++) {
        missiles[i].update();
        missiles[i].draw(ctx);

        // 화면 밖으로 나간 미사일 배열에서 제거 (메모리 관리)
        if (missiles[i].y > canvas.height) {
            missiles.splice(i, 1);
            i--;
            continue;
        }

        // 충돌 감지 로직 실행
        if (detectCollision(player, missiles[i])) {
            gameOver();
        }
    }

    // 다음 프레임 요청 (보통 1초에 60번 실행됨)
    gameLoopId = requestAnimationFrame(update);
}

// 충돌 감지 함수 (AABB 알고리즘)
function detectCollision(rect1, rect2) {
    // 플레이어가 너무 쉽게 죽지 않도록 충돌 박스(마진)를 살짝 여유롭게 줍니다
    const margin = 5; 
    return (
        rect1.x < rect2.x + rect2.width - margin &&
        rect1.x + rect1.width - margin > rect2.x &&
        rect1.y < rect2.y + rect2.height - margin &&
        rect1.y + rect1.height - margin > rect2.y
    );
}

// 게임 오버 처리
function gameOver() {
    isGameOver = true;
    clearInterval(scoreInterval);
    clearInterval(missileInterval);
    cancelAnimationFrame(gameLoopId);
    
    finalScoreElement.innerText = score;
    gameOverScreen.classList.remove('hidden');
}

// 키보드 조작 이벤트 리스너 (왼쪽, 오른쪽 화살표)
document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft') player.dx = -player.speed;
    if (e.code === 'ArrowRight') player.dx = player.speed;
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') player.dx = 0;
});

// 다시하기 버튼 이벤트
restartBtn.addEventListener('click', init);

// 처음 웹페이지 로드 시 게임 시작
init();
