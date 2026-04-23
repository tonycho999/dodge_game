class Missile {
    constructor(canvasWidth, speedMultiplier) {
        this.width = 20;
        this.height = 40;
        this.x = Math.random() * (canvasWidth - this.width);
        this.y = -this.height; 
        
        // ★ 속도에 speedMultiplier 곱하기 (시간이 지날수록 빨라짐)
        this.speed = (Math.random() * 3 + 3) * speedMultiplier; 
        
        this.image = new Image();
        this.image.src = 'assets/images/missile.png';
    }

    draw(ctx) {
        if (this.image.complete && this.image.naturalWidth !== 0) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    update() {
        this.y += this.speed; 
    }
}
