let mapData = new Array(COLS * ROWS).fill(0);

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