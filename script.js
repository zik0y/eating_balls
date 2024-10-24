// 获取页面中的canvas元素
const canvas = document.querySelector("canvas");

// 获取canvas的2D渲染上下文
const ctx = canvas.getContext("2d");

// 获取开始和停止按钮元素
const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");

// 设置canvas的宽度和高度为浏览器窗口的宽度和高度
const width = (canvas.width = window.innerWidth);
const height = (canvas.height = window.innerHeight);

let count = 0; // 记录小球数量
const para = document.getElementById("countDisplay"); // 显示剩余小球数

// 生成一个指定范围内的随机整数
function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

// 生成一个随机颜色
function randomColor() {
    return "rgb(" + random(0, 255) + "," + random(0, 255) + "," + random(0, 255) + ")";
}

// 定义 Shape 构造器
function Shape(x, y, velX, velY, exists) {
    this.x = x;
    this.y = y;
    this.velX = velX;
    this.velY = velY;
    this.exists = exists;
}

// Ball构造函数，用于创建小球对象
function Ball(x, y, velX, velY, color, size) {
    this.x = x;      // 小球的x坐标
    this.y = y;      // 小球的y坐标
    this.velX = velX; // 小球在x轴的速度
    this.velY = velY; // 小球在y轴的速度
    this.color = color; // 小球的颜色
    this.size = size;  // 小球的大小
    this.exists = true; // 小球是否存在
}

// Ball的原型方法，用于在画布上绘制小球
Ball.prototype.draw = function () {
    ctx.beginPath();            // 开始绘制路径
    ctx.fillStyle = this.color; // 设置填充颜色
    ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI); // 绘制圆弧
    ctx.fill();                 // 填充颜色
};

// Ball的原型方法，用于更新小球的位置
Ball.prototype.update = function() {
    if((this.x + this.size) >= width) {
        this.velX = -(this.velX);
    }

    if((this.x - this.size) <= 0) {
        this.velX = -(this.velX);
    }

    if((this.y + this.size) >= height) {
        this.velY = -(this.velY);
    }

    if((this.y - this.size) <= 0) {
        this.velY = -(this.velY);
    }

    this.x += this.velX;
    this.y += this.velY;
};

// Ball的原型方法，用于检测小球之间的碰撞
Ball.prototype.collisionDetect = function () {
    for (let j = 0; j < balls.length; j++) {
        if (this !== balls[j] && balls[j].exists) {
            const dx = this.x - balls[j].x;
            const dy = this.y - balls[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // 如果两个小球之间的距离小于它们的大小之和，则发生碰撞
            if (distance < this.size + balls[j].size) {
                balls[j].color = this.color = randomColor(); // 碰撞后改变颜色
            }
        }
    }
};

// 定义 EvilCircle 构造器, 继承自 Shape
function EvilCircle(x, y, exists) {
    Shape.call(this, x, y, 20, 20, exists);
    this.image = new Image();
    this.image.src = "ball.svg"; // 替换为你的SVG文件路径
    this.size = 100; // 设置图片的大小
}

EvilCircle.prototype = Object.create(Shape.prototype);


// 定义 EvilCircle 绘制方法
EvilCircle.prototype.draw = function() {
    ctx.drawImage(this.image, this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
};

// 定义 EvilCircle 的边缘检测（checkBounds）方法
EvilCircle.prototype.checkBounds = function() {
    if((this.x + this.size / 2) >= width) {
        this.x = width - this.size / 2;
    }

    if((this.x - this.size / 2) <= 0) {
        this.x = this.size / 2;
    }

    if((this.y + this.size / 2) >= height) {
        this.y = height - this.size / 2;
    }

    if((this.y - this.size / 2) <= 0) {
        this.y = this.size / 2;
    }
};

// 定义 EvilCircle 控制设置（setControls）方法
EvilCircle.prototype.setControls = function() {
    window.onkeydown = e => {
        switch(e.key) {
            case 'a':
            case 'A':
            case 'ArrowLeft':
                this.x -= this.velX;
                break;
            case 'd':
            case 'D':
            case 'ArrowRight':
                this.x += this.velX;
                break;
            case 'w':
            case 'W':
            case 'ArrowUp':
                this.y -= this.velY;
                break;
            case 's':
            case 'S':
            case 'ArrowDown':
                this.y += this.velY;
                break;
        }
    };
};

// 定义 EvilCircle 冲突检测函数
EvilCircle.prototype.collisionDetect = function() {
    for(let j = 0; j < balls.length; j++) {
        if(balls[j].exists) {
            const dx = this.x - balls[j].x;
            const dy = this.y - balls[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.size / 2 + balls[j].size) {
                balls[j].exists = false;
                count--;
                para.textContent = '剩余彩球数：' + count;
            }
        }
    }
};

// 初始化小球数组
const balls = [];

while(balls.length < 25) {
    const size = random(10, 30);
    let ball = new Ball(
        random(0 + size, width - size),
        random(0 + size, height - size),
        random(-7, 7),
        random(-7, 7),
        randomColor(),
        size
    );
    balls.push(ball);
    count++;
    para.textContent = '剩余彩球数：' + count;
}

let animationFrameId = null; // 用于存储requestAnimationFrame的返回值
// 游戏是否开始的标志
let gameStarted = false;
// 显示开始画面
function showStartScreen() {
    // 创建渐变背景
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "yellow");
    gradient.addColorStop(0.5, "red");
    gradient.addColorStop(1, "pink");

    // 绘制渐变背景
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 绘制游戏标题
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.font = "bold 60px Arial";
    ctx.fillText("小球吞噬游戏", width / 2, height / 2 - 100);

    // 绘制开始提示
    ctx.font = "bold 30px Arial";
    ctx.fillText("点击屏幕开始游戏", width / 2, height / 2 + 50);

    // 定义闪烁效果
    let flash = true;
    const flashInterval = setInterval(() => {
        if (flash) {
            ctx.fillStyle = "yellow";
        } else {
            ctx.fillStyle = "white";
        }
        ctx.fillText("点击屏幕开始游戏", width / 2, height / 2 + 50);
        flash = !flash; // 切换闪烁状态
    }, 500);

    // 点击屏幕开始游戏
    canvas.addEventListener('click', () => {
        clearInterval(flashInterval); // 移除闪烁效果
        startGame();
    });
}

// 开始游戏
function startGame() {
    canvas.removeEventListener('click', startGame); // 移除事件监听器
    gameStarted = true;
    startAnimation();
}

// 动画循环函数
function loop() {
    if (!gameStarted) return; // 如果游戏没有开始，不执行动画

    ctx.fillStyle = "rgba(128, 128, 128, 0.25)";
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < balls.length; i++) {
        if (balls[i].exists) {
            balls[i].draw();
            balls[i].update();
            balls[i].collisionDetect();
        }
    }

    evil.draw();
    evil.checkBounds();
    evil.collisionDetect();

    // 检查是否所有小球都被吃掉
    if (count === 0) {
        // 停止动画
        stopAnimation();
        // 显示恭喜画面
        showCongratulations();
    } else {
        animationFrameId = requestAnimationFrame(loop);
    }
}
// 创建 EvilCircle 实例并设置控制
let evil = new EvilCircle(random(0, width), random(0, height), true);
evil.setControls();

// 显示恭喜画面
function showCongratulations() {
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.font = "48px sans-serif";
    ctx.fillText("恭喜你，全部彩球都被吃掉了！", width / 2, height / 2 - 50);
    ctx.font = "24px sans-serif";
    ctx.fillText("点击屏幕重新开始游戏", width / 2, height / 2 + 30);

    // 点击屏幕重新开始游戏
    canvas.addEventListener('click', restartGame);
}

// 重新开始游戏
function restartGame() {
    canvas.removeEventListener('click', restartGame); // 移除事件监听器
    // 重置小球数组
    balls.length = 0;
    count = 0;
    para.textContent = '剩余彩球数：' + count;
    while(balls.length < 25) {
        const size = random(10, 20);
        let ball = new Ball(
            random(0 + size, width - size),
            random(0 + size, height - size),
            random(-7, 7),
            random(-7, 7),
            randomColor(),
            size
        );
        balls.push(ball);
        count++;
        para.textContent = '剩余彩球数：' + count;
    }
    // 重新开始动画
    startAnimation();
}

// 开始动画的函数
function startAnimation() {
    if (animationFrameId === null) {
        loop();
    }
}

// 停止动画的函数
function stopAnimation() {
    if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}

// 给开始按钮添加点击事件监听器
startButton.addEventListener('click', startAnimation);

// 给停止按钮添加点击事件监听器
stopButton.addEventListener('click', stopAnimation);

// 当文档加载完毕后，添加事件监听器，调用showStartScreen函数显示开始画面
document.addEventListener('DOMContentLoaded', showStartScreen);