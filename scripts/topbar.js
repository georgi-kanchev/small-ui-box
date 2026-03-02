resizeBtn.addEventListener('click', () => {
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
});