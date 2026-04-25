const boxList = document.getElementById('palette');
const addBtn = document.getElementById('addBtn');
const inspectorName = document.getElementById('inspectorName');
const inspector = document.getElementById('inspector');
const visibilityBtn = document.getElementById('visibilityBtn');
const colorSwatches = document.getElementById('colorSwatches');

const BOX_COLORS = [
    '#909098', // gray
    '#e84040', // red
    '#f07820', // orange
    '#d4c018', // yellow
    '#7cc820', // lime
    '#18b850', // green
    '#18a8a0', // teal
    '#2080f0', // blue
    '#6848e0', // indigo
    '#a028cc', // purple
];

BOX_COLORS.forEach(color => {
    const swatch = document.createElement('div');
    swatch.className = 'color-swatch';
    swatch.style.background = color;
    swatch.dataset.color = color;
    swatch.addEventListener('click', () => {
        const item = getSelected();
        if (!item || item._box.isScreen) return;
        item._box.color = color;
        setActiveSwatch(color);
        drawView();
    });
    colorSwatches.appendChild(swatch);
});

function setActiveSwatch(color) {
    colorSwatches.querySelectorAll('.color-swatch').forEach(s =>
        s.classList.toggle('active', s.dataset.color === color)
    );
}

let boxCount = 0;
let draggedItem = null;

function createItem(boxData) {
    const item = document.createElement('div');
    item.className = 'box-item';
    item.setAttribute('draggable', true);
    item.innerHTML = `<button>👁️</button><span>${boxData.name}</span><button>✖️</button>`;
    item._box = boxData;

    const eyeBtn = item.querySelector('button:first-child');
    eyeBtn.addEventListener('click', () => {
        boxData.visible = !boxData.visible;
        item.classList.toggle('hidden', !boxData.visible);
        eyeBtn.classList.toggle('hidden-state', !boxData.visible);
        if (item.classList.contains('selected'))
            visibilityBtn.classList.toggle('hidden-state', !boxData.visible);
        drawView();
    });

    item.querySelector('button:last-child').addEventListener('click', () => {
        const wasSelected = item.classList.contains('selected');
        boxes.splice(boxes.indexOf(item._box), 1);
        item.remove();

        drawView();
        if (wasSelected) select(boxList.querySelector('.box-item'));
    });

    item.addEventListener('dblclick', (e) => {
        if (e.target.tagName === 'BUTTON') return;
        focusBox(boxData);
    });

    item.addEventListener('dragstart', (e) => {
        draggedItem = item;
        const ghost = document.createElement('div');
        ghost.className = 'drag-ghost';
        ghost.textContent = boxData.name;
        document.body.appendChild(ghost);
        e.dataTransfer.setDragImage(ghost, 0, 10);
        setTimeout(() => {
            item.classList.add('dragging');
            document.body.removeChild(ghost);
        }, 0);
    });

    item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
        boxList.querySelectorAll('.box-item').forEach(i => i.classList.remove('drag-over-top', 'drag-over-bottom'));
        draggedItem = null;
    });

    item.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (item === draggedItem) return;
        boxList.querySelectorAll('.box-item').forEach(i => i.classList.remove('drag-over-top', 'drag-over-bottom'));
        const mid = item.getBoundingClientRect().top + item.getBoundingClientRect().height / 2;
        item.classList.add(e.clientY < mid ? 'drag-over-top' : 'drag-over-bottom');
    });

    item.addEventListener('drop', (e) => {
        e.preventDefault();
        if (!draggedItem || item === draggedItem) return;
        const mid = item.getBoundingClientRect().top + item.getBoundingClientRect().height / 2;
        if (e.clientY < mid) item.before(draggedItem);
        else item.after(draggedItem);
        syncBoxesOrder();
    });

    return item;
}

function createScreenItem() {
    const item = document.createElement('div');
    item.className = 'box-item screen-item';
    item.innerHTML = `<span>Screen</span>`;
    item._box = screenBox;
    item.addEventListener('click', () => select(item));
    return item;
}

function syncBoxesOrder() {
    const items = [...boxList.querySelectorAll('.box-item')];
    boxes.length = 0;
    items.forEach(item => boxes.push(item._box));
    drawView();
}

function getSelected() {
    return boxList.querySelector('.box-item.selected');
}

function select(item) {
    boxList.querySelectorAll('.box-item').forEach(b => b.classList.remove('selected'));
    if (item) {
        item.classList.add('selected');
        inspectorName.value = item._box.name;
        inspectorName.disabled = !!item._box.isScreen;
        if (item._box.isScreen) {
            setActiveSwatch(null);
            colorSwatches.style.display = 'none';
            visibilityBtn.style.display = 'none';
            inspectorName.style.paddingRight = '6px';
        } else {
            setActiveSwatch(item._box.color);
            colorSwatches.style.display = '';
            visibilityBtn.style.display = '';
            inspectorName.style.paddingRight = '';
            visibilityBtn.classList.toggle('hidden-state', !item._box.visible);
        }
        inspector.style.display = '';
    } else {
        inspectorName.value = '';
        inspectorName.disabled = true;
        inspectorName.style.paddingRight = '';
        setActiveSwatch(null);
        colorSwatches.style.display = '';
        visibilityBtn.style.display = '';
        inspector.style.display = 'none';
    }
    drawView();
}

function focusBox(box) {
    const editorRect = document.querySelector('.editor-view').getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    camera.x = (editorRect.left - canvasRect.left) + editorRect.width / 2 - (box.x + box.w / 2) * camera.zoom;
    camera.y = (editorRect.top - canvasRect.top) + editorRect.height / 2 - (box.y + box.h / 2) * camera.zoom;
    drawView();
}

visibilityBtn.addEventListener('click', () => {
    const item = getSelected();
    if (!item) return;
    item._box.visible = !item._box.visible;
    item.classList.toggle('hidden', !item._box.visible);
    item.querySelector('button:first-child').classList.toggle('hidden-state', !item._box.visible);
    visibilityBtn.classList.toggle('hidden-state', !item._box.visible);
    drawView();
});

inspectorName.addEventListener('input', () => {
    const item = getSelected();
    if (!item || item._box.isScreen) return;
    item._box.name = inspectorName.value;
    item.querySelector('span').textContent = inspectorName.value;
    drawView();
});

boxList.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') return;
    const item = e.target.closest('.box-item');
    if (item && !item.classList.contains('screen-item')) select(item);
});

addBtn.addEventListener('click', () => {
    boxCount++;
    const { w, h } = getViewSize();
    const maxOffset = Math.min(w - 120, h - 80) - 40;
    const offset = maxOffset > 0 ? (boxes.length * 20) % maxOffset : 0;
    const color = BOX_COLORS[0];
    const boxData = { name: `Box ${boxCount}`, x: 20 + offset, y: 20 + offset, w: 120, h: 80, visible: true, color };
    boxes.unshift(boxData);
    const item = createItem(boxData);
    boxList.prepend(item);
    select(item);
});

// screen box — always at the end of boxes (renders behind everything)
const screenBox = {
    name: 'Screen',
    get x() { return 0; },
    get y() { return 0; },
    get w() { return getViewSize().w; },
    get h() { return getViewSize().h; },
    visible: true,
    isScreen: true,
    color: '#909098',
};

boxes.push(screenBox);
boxList.appendChild(createScreenItem());
