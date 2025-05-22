const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const restartBtn = document.getElementById("restart");
const message = document.getElementById("message");

// Персонажи
const characters = [
    { color: "#FFA500", name: "Рыжий мальчик" },
    { color: "#FF69B4", name: "Красноволосая девочка" },
    { color: "#8B4513", name: "Бородач" }
];

// Коробки
const boxes = [
    { x: 600, y: 400, width: 50, height: 50, color: "#FF0000", hit: false },
    { x: 650, y: 400, width: 50, height: 50, color: "#FF0000", hit: false },
    { x: 700, y: 400, width: 50, height: 50, color: "#FF0000", hit: false },
    { x: 625, y: 350, width: 50, height: 50, color: "#FF0000", hit: false },
    { x: 675, y: 350, width: 50, height: 50, color: "#FF0000", hit: false }
];

// Игрок
let currentChar = 0;
let charX = 100;
let charY = 400;
const charRadius = 20; // Вынесено в константу для удобства
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let power = 0;
let angle = 0;
let charInAir = false;
let velocityX = 0;
let velocityY = 0;
const gravity = 0.2; // Вынесено в константу
let coins = 0;
let gameOver = false;

// Деревья (фон)
const trees = [
    { x: 50, y: 350, width: 40, height: 100, color: "#228B22" },
    { x: 200, y: 370, width: 40, height: 80, color: "#228B22" },
    { x: 350, y: 360, width: 40, height: 90, color: "#228B22" }
];

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Фон
    ctx.fillStyle = "#87CEEB";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(0, 450, canvas.width, 50);

    // Деревья
    trees.forEach(tree => {
        ctx.fillStyle = tree.color;
        ctx.fillRect(tree.x, tree.y, tree.width, tree.height);
    });

    // Коробки
    boxes.forEach(box => {
        if (!box.hit) {
            ctx.fillStyle = box.color;
            ctx.fillRect(box.x, box.y, box.width, box.height);
        }
    });

    // Персонаж
    ctx.fillStyle = characters[currentChar].color;
    ctx.beginPath();
    ctx.arc(charX, charY, charRadius, 0, Math.PI * 2);
    ctx.fill();

    // Траектория
    if (isDragging && !charInAir) {
        ctx.beginPath();
        ctx.moveTo(charX, charY);
        ctx.lineTo(dragStartX, dragStartY);
        ctx.strokeStyle = "black";
        ctx.stroke();
    }

    // Монетки
    ctx.fillStyle = "#FFD700";
    ctx.font = "20px Arial";
    ctx.fillText(`Монетки: ${coins}`, 20, 30);

    // Сообщение
    if (gameOver) {
        message.style.display = "block";
    } else {
        message.style.display = "none"; // Добавлено скрытие сообщения
    }
}

function update() {
    if (charInAir) {
        charX += velocityX;
        charY += velocityY;
        velocityY += gravity;

        // Столкновения с коробками
        boxes.forEach(box => {
            if (!box.hit && 
                charX + charRadius > box.x && 
                charX - charRadius < box.x + box.width && 
                charY + charRadius > box.y && 
                charY - charRadius < box.y + box.height) {
                box.hit = true;
                coins += 10;
                charInAir = false; // Персонаж останавливается при попадании
                velocityX = 0;
                velocityY = 0;
            }
        });

        // Границы canvas
        if (charY > canvas.height || charX > canvas.width || charX < 0) {
            resetCharacter();
            checkGameOver();
        }
        
        // Проверка земли
        if (charY + charRadius >= 450) { // 450 - высота земли
            resetCharacter();
        }
    }
}

function resetCharacter() {
    charInAir = false;
    charX = 100;
    charY = 400;
    velocityX = 0;
    velocityY = 0;
}

function checkGameOver() {
    gameOver = boxes.every(box => box.hit);
    if (gameOver) {
        // Можно добавить дополнительные действия при завершении игры
    }
}

function getCanvasPosition(event) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

// Обработчики событий
canvas.addEventListener("mousedown", (e) => {
    if (!charInAir && !gameOver) {
        isDragging = true;
        const pos = getCanvasPosition(e);
        dragStartX = pos.x;
        dragStartY = pos.y;
    }
});

canvas.addEventListener("mousemove", (e) => {
    if (isDragging && !charInAir && !gameOver) {
        const pos = getCanvasPosition(e);
        dragStartX = pos.x;
        dragStartY = pos.y;
    }
});

canvas.addEventListener("mouseup", (e) => {
    if (isDragging && !charInAir && !gameOver) {
        isDragging = false;
        const pos = getCanvasPosition(e);
        const dx = charX - pos.x;
        const dy = charY - pos.y;
        power = Math.min(Math.sqrt(dx * dx + dy * dy) * 0.1, 15); // Ограничение мощности
        angle = Math.atan2(dy, dx);

        velocityX = Math.cos(angle) * power;
        velocityY = Math.sin(angle) * power;
        charInAir = true;
    }
});

restartBtn.addEventListener("click", () => {
    boxes.forEach(box => box.hit = false);
    resetCharacter();
    gameOver = false;
    message.style.display = "none";
    coins = 0;
});

// Запуск игры
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Первоначальная отрисовка
draw();
gameLoop();