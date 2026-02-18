/**
 * IA Heurística para Tetris
 * Evalúa el tablero y decide el mejor movimiento.
 */

function entrenarIA() {
    // Intervalo de decisión: La IA evalúa la mejor jugada cada 500ms
    setInterval(() => {
        if (!player.matrix) return;

        const mejorMovimiento = getMejorMovimiento();
        ejecutarMovimiento(mejorMovimiento);
    }, 100);
}

function getMejorMovimiento() {
    let mejorScore = -Infinity;
    let mejorX = 0;
    let mejorRotacion = 0;

    // Probar todas las rotaciones posibles (0 a 3)
    for (let r = 0; r < 4; r++) {
        let piezaTemp = JSON.parse(JSON.stringify(player.matrix));
        for (let i = 0; i < r; i++) {
            // Rotar pieza manualmente para simular
            for (let y = 0; y < piezaTemp.length; ++y) {
                for (let x = 0; x < y; ++x) {
                    [piezaTemp[x][y], piezaTemp[y][x]] = [piezaTemp[y][x], piezaTemp[x][y]];
                }
            }
            piezaTemp.forEach(row => row.reverse());
        }

        // Probar todas las posiciones horizontales
        for (let x = -2; x < arena[0].length + 2; x++) {
            let y = 0;
            // Simular caída hasta el fondo
            while (!colision(arena, {pos: {x, y: y + 1}, matrix: piezaTemp})) {
                y++;
            }

            // Si la posición es válida, evaluarla
            if (!colision(arena, {pos: {x, y}, matrix: piezaTemp})) {
                const score = evaluarTablero(x, y, piezaTemp);
                if (score > mejorScore) {
                    mejorScore = score;
                    mejorX = x;
                    mejorRotacion = r;
                }
            }
        }
    }
    return { x: mejorX, rotacion: mejorRotacion };
}

function evaluarTablero(x, y, pieza) {
    // Simulamos el tablero con la pieza puesta
    let arenaSimulada = JSON.parse(JSON.stringify(arena));
    pieza.forEach((row, py) => {
        row.forEach((value, px) => {
            if (value !== 0 && arenaSimulada[y + py]) {
                arenaSimulada[y + py][x + px] = value;
            }
        });
    });

    let huecos = 0;
    let alturaTotal = 0;
    let lineasCompletas = 0;

    // 1. Contar huecos (celdas vacías con bloques encima) y altura
    for (let cx = 0; cx < arenaSimulada[0].length; cx++) {
        let columnaConBloque = false;
        for (let cy = 0; cy < arenaSimulada.length; cy++) {
            if (arenaSimulada[cy][cx] !== 0) {
                columnaConBloque = true;
                alturaTotal += (arenaSimulada.length - cy);
            } else if (columnaConBloque && arenaSimulada[cy][cx] === 0) {
                huecos++;
            }
        }
    }

    // 2. Contar líneas que se completarían
    arenaSimulada.forEach(row => {
        if (row.every(value => value !== 0)) lineasCompletas++;
    });

    // Puntuación heurística:
    // + Puntos por líneas completas
    // - Penalización por altura
    // - Mucha penalización por huecos
    return (lineasCompletas * 100) - (alturaTotal * 0.5) - (huecos * 50);
}

function ejecutarMovimiento(mov) {
    // 1. Rotar hasta la posición deseada
    // (Simulamos pulsaciones de tecla o llamamos a las funciones de tetris.js)
    for (let i = 0; i < mov.rotacion; i++) {
        playerRotate(1);
    }

    // 2. Mover lateralmente
    let diff = mov.x - player.pos.x;
    if (diff !== 0) {
        playerMove(Math.sign(diff));
    }

    // 3. Opcional: bajar rápido
    // playerDrop(); 
}

// Iniciar la IA automáticamente
entrenarIA();