const TILE_SIZE = 32;
let COLS = 16;
let ROWS = 16;
const COLORS = ['#ffffff', '#8B4513', '#228B22', '#808080', '#1E90FF', '#FFD700', '#FFD700'];

const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');
const paletteContainer = document.getElementById('palette');
const resizeBtn = document.getElementById('resizeBtn');
const sidebar = document.getElementById('sidebar');
const dragbar = document.getElementById('dragbar');

document.addEventListener('contextmenu', e => e.preventDefault());