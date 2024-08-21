// features.js
const features = document.querySelectorAll('.feature');
features.forEach((feature) => {
	feature.addEventListener('mouseenter', () => {
		feature.style.backgroundColor = '#f0f0f0';
	});

	feature.addEventListener('mouseleave', () => {
		feature.style.backgroundColor = '#fff';
	});
});
