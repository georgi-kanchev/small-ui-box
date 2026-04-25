let isPanning = false;
let isDragging = false;
let isResizing = false;
let resizeHandle = null;
let resizeStart = null;
let dragOffset = { x: 0, y: 0 };
let lastMousePos = { x: 0, y: 0 };
let hoveredBox = null;
let hoveredHandle = null;

const MIN_BOX_SIZE = 16;

const HANDLE_CURSORS = {
    nw: 'nw-resize', n: 'n-resize', ne: 'ne-resize',
    e: 'e-resize', se: 'se-resize', s: 's-resize',
    sw: 'sw-resize', w: 'w-resize',
};

function getResizeHandles(box) {
    return {
        nw: { x: box.x,           y: box.y           },
        n:  { x: box.x + box.w/2, y: box.y           },
        ne: { x: box.x + box.w,   y: box.y           },
        e:  { x: box.x + box.w,   y: box.y + box.h/2 },
        se: { x: box.x + box.w,   y: box.y + box.h   },
        s:  { x: box.x + box.w/2, y: box.y + box.h   },
        sw: { x: box.x,           y: box.y + box.h   },
        w:  { x: box.x,           y: box.y + box.h/2 },
    };
}

function getHandleAt(world, box) {
    const hitRadius = 7 / camera.zoom;
    const handles = getResizeHandles(box);
    for (const [name, pos] of Object.entries(handles)) {
        if (Math.abs(world.x - pos.x) <= hitRadius && Math.abs(world.y - pos.y) <= hitRadius)
            return name;
    }
    return null;
}

function applyResize(box, handle, dx, dy, start) {
    let { x, y, w, h } = start;

    if (handle.includes('w')) { x += dx; w -= dx; }
    if (handle.includes('e')) { w += dx; }
    if (handle.includes('n')) { y += dy; h -= dy; }
    if (handle.includes('s')) { h += dy; }

    if (w < MIN_BOX_SIZE) {
        if (handle.includes('w')) x = start.x + start.w - MIN_BOX_SIZE;
        w = MIN_BOX_SIZE;
    }
    if (h < MIN_BOX_SIZE) {
        if (handle.includes('n')) y = start.y + start.h - MIN_BOX_SIZE;
        h = MIN_BOX_SIZE;
    }

    box.x = x; box.y = y; box.w = w; box.h = h;
}

canvas.addEventListener('mousedown', (e) => {
    if (e.button === 1) {
        isPanning = true;
    } else if (e.button === 0) {
        const world = screenToWorld(e.clientX, e.clientY, canvas);
        const selectedItem = document.querySelector('.box-item.selected');
        const selectedBox = selectedItem?._box ?? null;

        const handle = selectedBox ? getHandleAt(world, selectedBox) : null;
        if (handle) {
            isResizing = true;
            resizeHandle = handle;
            resizeStart = { mouseX: world.x, mouseY: world.y, box: { ...selectedBox } };
        } else {
            const hit = boxes.find(b =>
                world.x >= b.x && world.x <= b.x + b.w &&
                world.y >= b.y && world.y <= b.y + b.h
            );
            if (hit) {
                const item = [...boxList.querySelectorAll('.box-item')].find(i => i._box === hit);
                if (item) select(item);
                isDragging = true;
                dragOffset = { x: world.x - hit.x, y: world.y - hit.y };
                canvas.style.cursor = 'grabbing';
            } else {
                select(null);
            }
        }
    }
    lastMousePos = { x: e.clientX, y: e.clientY };
});

window.addEventListener('mousemove', (e) => {
    if (isPanning) {
        camera.x += e.clientX - lastMousePos.x;
        camera.y += e.clientY - lastMousePos.y;
        lastMousePos = { x: e.clientX, y: e.clientY };
        drawView();
    } else if (isResizing) {
        const world = screenToWorld(e.clientX, e.clientY, canvas);
        const selectedItem = document.querySelector('.box-item.selected');
        if (selectedItem?._box) {
            const dx = world.x - resizeStart.mouseX;
            const dy = world.y - resizeStart.mouseY;
            applyResize(selectedItem._box, resizeHandle, dx, dy, resizeStart.box);
            canvas.style.cursor = HANDLE_CURSORS[resizeHandle];
            drawView();
        }
    } else if (isDragging) {
        const world = screenToWorld(e.clientX, e.clientY, canvas);
        const selectedItem = document.querySelector('.box-item.selected');
        if (selectedItem?._box) {
            selectedItem._box.x = world.x - dragOffset.x;
            selectedItem._box.y = world.y - dragOffset.y;
            drawView();
        }
    } else {
        const world = screenToWorld(e.clientX, e.clientY, canvas);
        const selectedItem = document.querySelector('.box-item.selected');
        const selectedBox = selectedItem?._box ?? null;

        const handle = selectedBox ? getHandleAt(world, selectedBox) : null;
        if (handle !== hoveredHandle) {
            hoveredHandle = handle;
            drawView();
        }

        if (handle) {
            canvas.style.cursor = HANDLE_CURSORS[handle];
        } else {
            const hit = boxes.find(b =>
                world.x >= b.x && world.x <= b.x + b.w &&
                world.y >= b.y && world.y <= b.y + b.h
            ) ?? null;
            canvas.style.cursor = hit ? 'pointer' : 'default';
            if (hit !== hoveredBox) {
                hoveredBox = hit;
                drawView();
            }
        }
    }
    lastMousePos = { x: e.clientX, y: e.clientY };
});

canvas.addEventListener('wheel', (e) => {
    handleZoom(e, canvas);
    drawView();
}, { passive: false });

window.addEventListener('mouseup', () => {
    isPanning = false;
    isDragging = false;
    isResizing = false;
    resizeHandle = null;
    resizeStart = null;
    canvas.style.cursor = 'default';
});

window.addEventListener('resize', updateSize);

updateSize();
resetView();

function updateSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawView();
}

function resetView() {
    const { w, h } = getViewSize();
    const editorRect = document.querySelector('.editor-view').getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    camera.zoom = Math.min(editorRect.width / w, editorRect.height / h) * 0.85;
    camera.x = (editorRect.left - canvasRect.left) + (editorRect.width - w * camera.zoom) / 2;
    camera.y = (editorRect.top - canvasRect.top) + (editorRect.height - h * camera.zoom) / 2;
    drawView();
}

function getViewSize() {
    const base = 512;
    return {
        w: Math.round(base * Math.sqrt(aspectRatio)),
        h: Math.round(base / Math.sqrt(aspectRatio))
    };
}

function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}

function drawView() {
    const { w, h } = getViewSize();

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(camera.x, camera.y);
    ctx.scale(camera.zoom, camera.zoom);

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, w, h);

    const selectedItem = document.querySelector('.box-item.selected');
    const selectedBox = selectedItem?._box ?? null;

    for (const box of [...boxes].reverse()) {
        const c = box.color ?? '#5b9bd9';
        const isSelected = box === selectedBox;
        const isHovered = box === hoveredBox;

        if (!box.visible) ctx.globalAlpha = 0.2;

        ctx.fillStyle = '#1c1c1c';
        ctx.fillRect(box.x, box.y, box.w, box.h);

        ctx.fillStyle = hexToRgba(c, isSelected && isHovered ? 0.28 : isSelected ? 0.2 : isHovered ? 0.14 : 0.1);
        ctx.fillRect(box.x, box.y, box.w, box.h);

        ctx.strokeStyle = isSelected ? 'rgba(255,255,255,0.9)' : hexToRgba(c, isHovered ? 0.7 : 0.45);
        ctx.lineWidth = (isSelected ? 1.5 : 1) / camera.zoom;
        ctx.strokeRect(box.x, box.y, box.w, box.h);

        ctx.fillStyle = hexToRgba(c, isSelected ? 0.9 : 0.6);
        ctx.font = `${11 / camera.zoom}px 'Segoe UI', sans-serif`;
        ctx.fillText(box.name, box.x + 4 / camera.zoom, box.y + 14 / camera.zoom);

        if (!box.visible) ctx.globalAlpha = 1;
    }

    if (selectedBox) {
        const hs = 5 / camera.zoom;
        const handles = getResizeHandles(selectedBox);
        ctx.lineWidth = 1 / camera.zoom;
        for (const [name, pos] of Object.entries(handles)) {
            ctx.fillStyle = hoveredHandle === name ? '#ffffff' : '#c8c8d8';
            ctx.strokeStyle = 'rgba(0,0,0,0.6)';
            ctx.fillRect(pos.x - hs / 2, pos.y - hs / 2, hs, hs);
            ctx.strokeRect(pos.x - hs / 2, pos.y - hs / 2, hs, hs);
        }
    }

    ctx.restore();
}
