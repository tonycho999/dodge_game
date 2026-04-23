class Missile {
    constructor(canvasWidth) {
        this.width = 20;
        this.height = 40;
        // x좌표는 화면 내에서 랜덤하게 설정
        this.x = Math.random() * (canvasWidth - this.width);
        this.y = -this.height; // 화면 맨 위 바깥에서 시작
        this.speed = Math.random() * 3 + 3; // 3 ~ 6 사이의 랜덤 떨어지는 속도
        
        // 이미지 로드 시도
        this.image = new Image();
        this.image.src = 'assets/images/missile.png';
    }

    draw(ctx) {
        // 이미지가 정상적으로 로드되었으면 이미지를 그리고, 아니면 빨간색 네모를 그림
        if (this.image.complete && this.image.naturalWidth !== 0) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    update() {
        this.y += this.speed; // 아래로 이동
    }
}
