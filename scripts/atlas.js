setupSlider('frame-count', 'val-frames');
setupSlider('frame-offset', 'val-offset');
setupSlider('frame-speed', 'val-speed', true);

function setupSlider(id, displayId, isPercent = false) {
	const input = document.getElementById(id);
	const display = document.getElementById(displayId);
	input.addEventListener('input', () => {
		let val = input.value;
		display.innerText = isPercent ? Math.round((val / 31) * 100) + '%' : val;
	});
}
