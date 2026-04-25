formulaHelpBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isVisible = formulaHelp.classList.contains('visible');
    if (isVisible) {
        formulaHelp.classList.remove('visible');
        return;
    }
    const rect = formulaHelpBtn.getBoundingClientRect();
    formulaHelp.style.left = rect.left + 'px';
    formulaHelp.style.top = (rect.top - 6) + 'px';
    formulaHelp.style.transform = 'translateY(-100%)';
    formulaHelp.classList.add('visible');
});

document.addEventListener('click', () => {
    formulaHelp.classList.remove('visible');
});

dragbar.addEventListener('mousedown', (e) => {
    e.preventDefault();
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResize);
    document.body.style.cursor = 'col-resize';
});

function resize(e) {
    let newWidth = e.clientX; 
    newWidth = Math.max(newWidth, 210);
    newWidth = Math.min(800, newWidth);
    sidebar.style.width = newWidth + 'px';
}

function stopResize() {
    document.removeEventListener('mousemove', resize);
    document.removeEventListener('mouseup', stopResize);
    document.body.style.cursor = 'default';
}