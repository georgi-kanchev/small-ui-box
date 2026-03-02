let mapData = new Array(COLS * ROWS).fill(0);
let currentTileIndex = 1;
let isDrawing = false, isErasing = false, isPanning = false;
let lastMousePos = { x: 0, y: 0 };

canvas.addEventListener('mousedown', (e) => {
    if (e.button === 1) isPanning = true;
    else if (e.button === 0) isDrawing = true;
    else if (e.button === 2) isErasing = true;
    lastMousePos = { x: e.clientX, y: e.clientY };

	if (e.button !== 1)
		handleInput(e);
});

window.addEventListener('mousemove', (e) => {
    if (isPanning) {
        camera.x += e.clientX - lastMousePos.x;
        camera.y += e.clientY - lastMousePos.y;
        lastMousePos = { x: e.clientX, y: e.clientY };
        drawMap(ctx, canvas);
    } else if (isDrawing || isErasing) {
        handleInput(e);
    }
});

canvas.addEventListener('wheel', (e) => {
    handleZoom(e, canvas);
    drawMap(ctx, canvas);
}, { passive: false });

window.addEventListener('mouseup', () => { isDrawing = isPanning = isErasing = false; });
window.addEventListener('resize', updateSize);

updateSize();

function updateSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawMap(ctx, canvas);
}

function handleInput(e) {
    const worldPos = screenToWorld(e.clientX, e.clientY, canvas);
    const col = Math.floor(worldPos.x / TILE_SIZE);
    const row = Math.floor(worldPos.y / TILE_SIZE);
    
    if (col >= 0 && col < COLS && row >= 0 && row < ROWS) {
        const index = row * COLS + col;
        const targetTile = isErasing ? 0 : currentTileIndex;
        if (mapData[index] !== targetTile) {
            mapData[index] = targetTile;
            drawMap(ctx, canvas);
        }
    }
}

function drawMap(ctx, canvas) {
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.translate(camera.x, camera.y);
    ctx.scale(camera.zoom, camera.zoom);

    // Draw Background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, COLS * TILE_SIZE, ROWS * TILE_SIZE);
    
    // Draw Tiles
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const tileIndex = mapData[r * COLS + c];
            if (tileIndex === 0) continue; 
            
            ctx.fillStyle = COLORS[tileIndex];
            ctx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }

    // Grid
    ctx.lineWidth = 1 / camera.zoom;
    ctx.strokeStyle = '#ffffff';
    for (let i = 0; i <= COLS; i++) {
        ctx.beginPath(); ctx.moveTo(i * TILE_SIZE, 0); ctx.lineTo(i * TILE_SIZE, ROWS * TILE_SIZE); ctx.stroke();
    }
    for (let j = 0; j <= ROWS; j++) {
        ctx.beginPath(); ctx.moveTo(0, j * TILE_SIZE); ctx.lineTo(COLS * TILE_SIZE, j * TILE_SIZE); ctx.stroke();
    }

    ctx.restore();
}