class Player {
    constructor(canvasWidth, canvasHeight) {
        this.width = 40;
        this.height = 40;
        // 정중앙 하단에 위치
        this.x = canvasWidth / 2 - this.width / 2;
        this.y = canvasHeight - this.height - 20;
        this.speed = 3;
        this.dx = 0; // x축 이동 방향 및 속도
        
        // 이미지 로드 시도
        this.image = new Image();
        this.image.src = 'assets/images/plane.png';
    }

    draw(ctx) {
        // 이미지가 정상적으로 로드되었으면 이미지를 그리고, 아니면 파란색 네모를 그림
        if (this.image.complete && this.image.naturalWidth !== 0) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = '#2980b9';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    update(canvasWidth) {
        this.x += this.dx;

        // 화면 밖으로 나가지 못하게 벽 충돌 제어
        if (this.x < 0) {
            this.x = 0;
        }
        if (this.x + this.width > canvasWidth) {
            this.x = canvasWidth - this.width;
        }
    }
}
