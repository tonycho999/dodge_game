class Asteroid {
    constructor(canvasWidth, speedMultiplier) {
        // 운석의 크기를 랜덤으로 설정
        this.radius = 15 + Math.random() * 20; 
        this.width = this.radius * 2;
        this.height = this.radius * 2;
        
        this.x = Math.random() * (canvasWidth - this.width);
        this.y = -this.height;
        
        // y축 속도 (미사일보단 살짝 느리지만 난이도 배율 적용)
        this.speedY = (Math.random() * 2 + 2) * speedMultiplier; 
        // x축 속도 (좌우 대각선으로 이동, -1.5 ~ 1.5)
        this.speedX = (Math.random() - 0.5) * 3; 
    }

    draw(ctx) {
        ctx.fillStyle = '#7f8c8d'; // 회색 운석
        ctx.beginPath();
        // 원형으로 그리기
        ctx.arc(this.x + this.radius, this.y + this.radius, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    update(canvasWidth) {
        this.y += this.speedY;
        this.x += this.speedX;

        // 화면 양옆 벽에 닿으면 튕기도록 설정
        if (this.x < 0 || this.x + this.width > canvasWidth) {
            this.speedX *= -1;
        }
    }
}
