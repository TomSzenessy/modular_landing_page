// footer.js
document.querySelector('.footer-links').addEventListener('click', (e) => {
	if (e.target.tagName === 'A') {
		e.preventDefault();
		console.log(`Footer link clicked: ${e.target.href}`);
	}
});
