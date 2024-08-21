document.addEventListener('DOMContentLoaded', () => {
	// Make chat popup draggable
	const chatPopup = document.getElementById('chat-popup');
	const chatHeader = document.getElementById('chat-header');

	chatHeader.onmousedown = function (event) {
		let shiftX = event.clientX - chatPopup.getBoundingClientRect().left;
		let shiftY = event.clientY - chatPopup.getBoundingClientRect().top;

		function moveAt(pageX, pageY) {
			chatPopup.style.left = pageX - shiftX + 'px';
			chatPopup.style.top = pageY - shiftY + 'px';
		}

		function onMouseMove(event) {
			moveAt(event.pageX, event.pageY);
		}

		document.addEventListener('mousemove', onMouseMove);

		chatHeader.onmouseup = function () {
			document.removeEventListener('mousemove', onMouseMove);
			chatHeader.onmouseup = null;
		};
	};

	chatHeader.ondragstart = function () {
		return false;
	};

	const socket = io();

	document
		.getElementById('chat-form')
		.addEventListener('submit', function (event) {
			event.preventDefault();
			const input = document.getElementById('chat-input');
			const message = input.value;
			socket.emit('chatMessage', message);
			input.value = '';
		});

	socket.on('chatMessage', function (message) {
		const chatContent = document.getElementById('chat-content');
		const messageElement = document.createElement('div');
		messageElement.textContent = message;
		chatContent.appendChild(messageElement);
		chatContent.scrollTop = chatContent.scrollHeight;
	});

	// Remove the loading overlay when the document is fully loaded
	window.addEventListener('load', () => {
		const loadingOverlay = document.getElementById('loading-overlay');
		if (loadingOverlay) {
			loadingOverlay.style.display = 'none';
		}
	});
});
