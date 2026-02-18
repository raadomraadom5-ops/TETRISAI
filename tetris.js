const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

context.scale(20, 20);

// Crear el tablero (matriz de ceros)
function crearMatriz(w, h) {
    const matriz = [];
    while (h--) {
        matriz.push(new Array(w).fill(0));
    }
    return matriz;
}

// Dibujar la pieza y el tablero
function dibujar() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);

    dibujarMatriz(arena, {x: 0, y: 0});
    dibujarMatriz(player.matrix, player.pos);
}

function dibujarMatriz(matriz, offset) {
    matriz.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colores[value];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

// Lógica de colisión
function colision(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

// Unir la pieza al tablero
function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

// Limpiar líneas completadas
function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) continue outer;
        }
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;
        player.score += rowCount * 10;
        rowCount *= 2;
    }
    actualizarScore();
}

// Rotación de matriz
function rotar(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }
    if (dir > 0) matrix.forEach(row => row.reverse());
    else matrix.reverse();
}

function playerDrop() {
    player.pos.y++;
    if (colision(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
    }
    dropCounter = 0;
}

function playerMove(dir) {
    player.pos.x += dir;
    if (colision(arena, player)) {
        player.pos.x -= dir;
    }
}

function playerReset() {
    const piezas = 'ILJOTSZ';
    player.matrix = crearPieza(piezas[piezas.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
    if (colision(arena, player)) {
        arena.forEach(row => row.fill(0));
        player.score = 0;
        actualizarScore();
    }
}

function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotar(player.matrix, dir);
    while (colision(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotar(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

function actualizarScore() {
    scoreElement.innerText = player.score;
}

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    dibujar();
    requestAnimationFrame(update);
}

const arena = crearMatriz(12, 20);

const player = {
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0,
};

// Controles
document.addEventListener('keydown', event => {
    if (event.keyCode === 37) playerMove(-1);      // Izquierda
    else if (event.keyCode === 39) playerMove(1);  // Derecha
    else if (event.keyCode === 40) playerDrop();   // Abajo
    else if (event.keyCode === 81) playerRotate(-1); // Q (Rotar izq)
    else if (event.keyCode === 87) playerRotate(1);  // W (Rotar der)
});

playerReset();
actualizarScore();
update();