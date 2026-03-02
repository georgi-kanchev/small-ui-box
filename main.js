let currentTileIndex = 1;
let isDrawing = false, isErasing = false, isPanning = false;
let lastMousePos = { x: 0, y: 0 };

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

function getDimensionsFromUser() {
    const input = prompt("Enter width and height separated by a comma (e.g., 20,20):");
    
    if (input) {
        const parts = input.split(',');
        const width = parseInt(parts[0]);
        const height = parseInt(parts[1]);
        
        if (!isNaN(width) && !isNaN(height)) {
            COLS = width;
			ROWS = height;
			mapData = new Array(COLS * ROWS).fill(0);
			drawMap(ctx, canvas);
        } else {
            alert("Invalid input! Please enter two numbers separated by a comma.");
        }
    }
}

// Event Listeners
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
canvas.addEventListener('contextmenu', e => e.preventDefault());

resizeBtn.addEventListener('click', function() {
    getDimensionsFromUser();
});

dragbar.addEventListener('mousedown', (e) => {
    e.preventDefault();
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResize);
    document.body.style.cursor = 'col-resize';
});

function resize(e) {
    let newWidth = e.clientX; 
    newWidth = Math.max(newWidth, 200);
    newWidth = Math.min(1000, newWidth);
    sidebar.style.width = newWidth + 'px';
}

function stopResize() {
    document.removeEventListener('mousemove', resize);
    document.removeEventListener('mouseup', stopResize);
    document.body.style.cursor = 'default';
}

updateSize();