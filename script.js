// 获取Canvas元素和上下文
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// 游戏常量
const GRID_SIZE = 20; // 格子大小

// 难度设置和对应的速度（毫秒）
const DIFFICULTY_SPEEDS = {
    easy: 200,    // 简单 - 较慢
    medium: 150,  // 中等 - 适中
    hard: 100     // 困难 - 较快
};

// 当前游戏速度
let currentSpeed = DIFFICULTY_SPEEDS.medium; // 默认中等难度

// 方向常量
const DIRECTIONS = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 }
};

// 颜色设置
const COLORS = {
    BACKGROUND: '#f8f8f8',
    SNAKE_HEAD: '#2E7D32',
    SNAKE_BODY: '#4CAF50',
    FOOD: '#FF5722',
    GRID: '#E0E0E0'
};

// 游戏状态
let gameStarted = false;
let gameOver = false;
let score = 0;
let snake = [];
let food = {};
let currentDirection = DIRECTIONS.RIGHT;
let nextDirection = DIRECTIONS.RIGHT;
let gameLoop;

// 获取难度选择元素
const difficultySelect = document.getElementById('difficulty');

// 初始化游戏
function initGame() {
    // 获取当前选择的难度
    const selectedDifficulty = difficultySelect.value;
    currentSpeed = DIFFICULTY_SPEEDS[selectedDifficulty];
    
    // 初始化蛇
    snake = [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 3, y: 5 }
    ];
    
    // 重置方向
    currentDirection = DIRECTIONS.RIGHT;
    nextDirection = DIRECTIONS.RIGHT;
    
    // 生成食物
    generateFood();
    
    // 重置分数
    score = 0;
    document.getElementById('score').textContent = score;
    
    // 重置游戏状态
    gameStarted = true;
    gameOver = false;
    
    // 开始游戏循环
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(gameStep, currentSpeed);
    
    // 更新开始按钮文本
    document.getElementById('start-btn').textContent = '重新开始';
    
    // 清除任何可能存在的游戏结束提示
    const existingGameOver = document.querySelector('.game-over');
    if (existingGameOver) {
        existingGameOver.remove();
    }
}

// 更新游戏速度
function updateGameSpeed() {
    if (gameStarted && !gameOver) {
        // 获取当前选择的难度
        const selectedDifficulty = difficultySelect.value;
        currentSpeed = DIFFICULTY_SPEEDS[selectedDifficulty];
        
        // 重新设置游戏循环
        clearInterval(gameLoop);
        gameLoop = setInterval(gameStep, currentSpeed);
    }
}

// 生成食物
function generateFood() {
    // 计算可用的格子数
    const gridCountX = canvas.width / GRID_SIZE;
    const gridCountY = canvas.height / GRID_SIZE;
    
    // 生成随机位置
    let newFood;
    let foodOnSnake;
    
    do {
        foodOnSnake = false;
        newFood = {
            x: Math.floor(Math.random() * gridCountX),
            y: Math.floor(Math.random() * gridCountY)
        };
        
        // 检查食物是否生成在蛇身上
        for (let i = 0; i < snake.length; i++) {
            if (snake[i].x === newFood.x && snake[i].y === newFood.y) {
                foodOnSnake = true;
                break;
            }
        }
    } while (foodOnSnake);
    
    food = newFood;
}

// 游戏主循环的一步
function gameStep() {
    if (!gameStarted || gameOver) return;
    
    // 更新方向
    currentDirection = nextDirection;
    
    // 获取蛇头
    const head = { ...snake[0] };
    
    // 移动蛇头
    head.x += currentDirection.x;
    head.y += currentDirection.y;
    
    // 检查是否吃到食物
    const ateFood = head.x === food.x && head.y === food.y;
    
    // 检查是否撞墙
    if (head.x < 0 || head.y < 0 || head.x >= canvas.width / GRID_SIZE || head.y >= canvas.height / GRID_SIZE) {
        endGame();
        return;
    }
    
    // 检查是否撞到自己
    for (let i = 0; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            endGame();
            return;
        }
    }
    
    // 将新头部添加到蛇身
    snake.unshift(head);
    
    // 如果吃到食物，增加分数并生成新食物，否则移除尾部
    if (ateFood) {
        score += 10;
        document.getElementById('score').textContent = score;
        generateFood();
    } else {
        snake.pop();
    }
    
    // 重绘游戏
    drawGame();
}

// 绘制游戏
function drawGame() {
    // 清除画布
    ctx.fillStyle = COLORS.BACKGROUND;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格
    drawGrid();
    
    // 绘制蛇
    drawSnake();
    
    // 绘制食物
    drawFood();
}

// 绘制网格
function drawGrid() {
    ctx.strokeStyle = COLORS.GRID;
    ctx.lineWidth = 0.5;
    
    for (let x = 0; x <= canvas.width; x += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    for (let y = 0; y <= canvas.height; y += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// 绘制蛇
function drawSnake() {
    // 绘制蛇身
    for (let i = 1; i < snake.length; i++) {
        ctx.fillStyle = COLORS.SNAKE_BODY;
        ctx.fillRect(
            snake[i].x * GRID_SIZE,
            snake[i].y * GRID_SIZE,
            GRID_SIZE,
            GRID_SIZE
        );
        
        // 绘制蛇身内部
        ctx.fillStyle = lightenColor(COLORS.SNAKE_BODY, 20);
        ctx.fillRect(
            snake[i].x * GRID_SIZE + 2,
            snake[i].y * GRID_SIZE + 2,
            GRID_SIZE - 4,
            GRID_SIZE - 4
        );
    }
    
    // 绘制蛇头
    ctx.fillStyle = COLORS.SNAKE_HEAD;
    ctx.fillRect(
        snake[0].x * GRID_SIZE,
        snake[0].y * GRID_SIZE,
        GRID_SIZE,
        GRID_SIZE
    );
    
    // 绘制蛇头内部
    ctx.fillStyle = lightenColor(COLORS.SNAKE_HEAD, 20);
    ctx.fillRect(
        snake[0].x * GRID_SIZE + 2,
        snake[0].y * GRID_SIZE + 2,
        GRID_SIZE - 4,
        GRID_SIZE - 4
    );
    
    // 绘制蛇眼睛
    ctx.fillStyle = 'white';
    
    // 根据方向设置眼睛位置
    let eyePositions = [];
    
    if (currentDirection === DIRECTIONS.RIGHT) {
        eyePositions = [
            { x: snake[0].x * GRID_SIZE + GRID_SIZE - 6, y: snake[0].y * GRID_SIZE + 4 },
            { x: snake[0].x * GRID_SIZE + GRID_SIZE - 6, y: snake[0].y * GRID_SIZE + GRID_SIZE - 8 }
        ];
    } else if (currentDirection === DIRECTIONS.LEFT) {
        eyePositions = [
            { x: snake[0].x * GRID_SIZE + 4, y: snake[0].y * GRID_SIZE + 4 },
            { x: snake[0].x * GRID_SIZE + 4, y: snake[0].y * GRID_SIZE + GRID_SIZE - 8 }
        ];
    } else if (currentDirection === DIRECTIONS.UP) {
        eyePositions = [
            { x: snake[0].x * GRID_SIZE + 4, y: snake[0].y * GRID_SIZE + 4 },
            { x: snake[0].x * GRID_SIZE + GRID_SIZE - 8, y: snake[0].y * GRID_SIZE + 4 }
        ];
    } else if (currentDirection === DIRECTIONS.DOWN) {
        eyePositions = [
            { x: snake[0].x * GRID_SIZE + 4, y: snake[0].y * GRID_SIZE + GRID_SIZE - 8 },
            { x: snake[0].x * GRID_SIZE + GRID_SIZE - 8, y: snake[0].y * GRID_SIZE + GRID_SIZE - 8 }
        ];
    }
    
    // 绘制眼睛
    eyePositions.forEach(pos => {
        ctx.fillRect(pos.x, pos.y, 4, 4);
    });
}

// 绘制食物
function drawFood() {
    ctx.fillStyle = COLORS.FOOD;
    ctx.beginPath();
    ctx.arc(
        food.x * GRID_SIZE + GRID_SIZE / 2,
        food.y * GRID_SIZE + GRID_SIZE / 2,
        GRID_SIZE / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    // 绘制高光
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(
        food.x * GRID_SIZE + GRID_SIZE / 2 - 2,
        food.y * GRID_SIZE + GRID_SIZE / 2 - 2,
        2,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

// 颜色处理辅助函数
function lightenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    
    return `#${(
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
    ).toString(16).slice(1)}`;
}

// 结束游戏
function endGame() {
    gameOver = true;
    gameStarted = false;
    clearInterval(gameLoop);
    
    // 创建游戏结束提示
    const gameOverDiv = document.createElement('div');
    gameOverDiv.className = 'game-over';
    gameOverDiv.innerHTML = `
        <h2>游戏结束</h2>
        <p>你的得分: ${score}</p>
        <p>按空格键或点击重新开始按钮重玩</p>
    `;
    document.querySelector('.game-container').appendChild(gameOverDiv);
    gameOverDiv.style.display = 'block';
}

// 方向更改函数
function changeDirection(newDirection) {
    // 防止反向移动
    const isValidDirection = (
        (newDirection === DIRECTIONS.UP && currentDirection !== DIRECTIONS.DOWN) ||
        (newDirection === DIRECTIONS.DOWN && currentDirection !== DIRECTIONS.UP) ||
        (newDirection === DIRECTIONS.LEFT && currentDirection !== DIRECTIONS.RIGHT) ||
        (newDirection === DIRECTIONS.RIGHT && currentDirection !== DIRECTIONS.LEFT)
    );
    
    if (isValidDirection && gameStarted && !gameOver) {
        nextDirection = newDirection;
    }
}

// 键盘控制
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowUp':
            changeDirection(DIRECTIONS.UP);
            event.preventDefault();
            break;
        case 'ArrowDown':
            changeDirection(DIRECTIONS.DOWN);
            event.preventDefault();
            break;
        case 'ArrowLeft':
            changeDirection(DIRECTIONS.LEFT);
            event.preventDefault();
            break;
        case 'ArrowRight':
            changeDirection(DIRECTIONS.RIGHT);
            event.preventDefault();
            break;
        case ' ':
            if (gameOver) {
                initGame();
            } else if (!gameStarted) {
                initGame();
            }
            event.preventDefault();
            break;
    }
});

// 移动端方向控制
document.getElementById('btn-up').addEventListener('click', () => {
    changeDirection(DIRECTIONS.UP);
});

document.getElementById('btn-down').addEventListener('click', () => {
    changeDirection(DIRECTIONS.DOWN);
});

document.getElementById('btn-left').addEventListener('click', () => {
    changeDirection(DIRECTIONS.LEFT);
});

document.getElementById('btn-right').addEventListener('click', () => {
    changeDirection(DIRECTIONS.RIGHT);
});

// 添加触摸事件，防止触摸按钮时页面滚动
const controlButtons = document.querySelectorAll('.control-btn');
controlButtons.forEach(btn => {
    btn.addEventListener('touchstart', (e) => {
        e.preventDefault(); // 防止触摸事件引起的页面滚动
    });
});

// 添加难度选择事件监听
difficultySelect.addEventListener('change', function() {
    if (gameStarted && !gameOver) {
        updateGameSpeed();
    }
});

// 开始按钮事件
document.getElementById('start-btn').addEventListener('click', () => {
    if (gameOver || !gameStarted) {
        initGame();
    }
});

// 初始绘制
drawGame();

// 显示开始提示
ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.fillStyle = 'white';
ctx.font = 'bold 20px Arial';
ctx.textAlign = 'center';
ctx.fillText('按"开始游戏"按钮开始', canvas.width / 2, canvas.height / 2);

// 防止滚动界面
window.addEventListener('keydown', (e) => {
    if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
    }
}); 