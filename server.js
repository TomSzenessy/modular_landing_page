const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs-extra');
const OpenAI = require('openai');
const http = require('http');
require('dotenv').config();

const apiKey = process.env.OPENAI_API_KEY;

const app = express();
const PORT = process.env.PORT || 3000;

if (!apiKey) {
	console.error('OPENAI_API_KEY environment variable is required.');
	process.exit(1);
}

// OpenAI configuration
const openai = new OpenAI({
	apiKey: apiKey
});

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Route to serve the initial prompt page
app.get('/', (req, res) => {
	res.render('index');
});

// Handle prompt submission and generate website
app.post('/generate', async (req, res) => {
	const prompt = req.body.prompt;

	try {
		const completion = await openai.chat.completions.create({
			messages: [
				{
					role: 'system',
					content:
						"You are a web development assistant. Generate an HTML page based on the user's request."
				},
				{
					role: 'user',
					content: `Create an HTML page with the following details: ${prompt}`
				}
			],
			model: 'gpt-4o-mini'
		});
		console.log('message sent');

		let htmlContent = completion.choices[0].message.content;

		// Add chat overlay and loading indicator
		htmlContent += `
            <div id="loading-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255, 255, 255, 0.8); display: flex; align-items: center; justify-content: center; z-index: 9999;">
                <p>Loading your website...</p>
            </div>
            <div id="chat-popup" style="position: fixed; bottom: 20px; right: 20px; width: 300px; background: #fff; border: 1px solid #ccc; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); z-index: 10000;">
                <div id="chat-header" style="background-color: #007bff; color: #fff; padding: 10px; cursor: move;">Chat with AI</div>
                <div id="chat-content" style="padding: 10px; height: 200px; overflow-y: auto;"></div>
                <form id="chat-form">
                    <input type="text" id="chat-input" style="width: calc(100% - 20px); padding: 10px;" placeholder="Type a message..." required>
                    <button type="submit" style="padding: 10px; background-color: #007bff; color: #fff;">Send</button>
                </form>
            </div>
            <script src="/js/scripts.js"></script>
        `;

		const generatedPath = path.join(__dirname, 'generated');
		await fs.ensureDir(generatedPath);
		await fs.writeFile(path.join(generatedPath, 'index.html'), htmlContent);

		res.send(htmlContent);
	} catch (error) {
		console.error('Error generating website:', error);
		res.status(500).send('An error occurred.');
	}
});

// Real-time Chat and Updates
const server = http.createServer(app);
const io = require('socket.io')(server);

io.on('connection', (socket) => {
	console.log('New client connected');

	socket.on('chatMessage', async (msg) => {
		try {
			const response = await openai.chat.completions.create({
				messages: [
					{
						role: 'system',
						content: 'You are a web development assistant.'
					},
					{
						role: 'user',
						content: `${msg}`
					}
				],
				model: 'gpt-4o-mini'
			});

			const updateContent = response.choices[0].message.content;

			const filePath = path.join(__dirname, 'generated', 'index.html');
			const currentContent = await fs.readFile(filePath, 'utf8');
			const newContent = `${currentContent}\n${updateContent}`;

			await fs.writeFile(filePath, newContent);

			socket.emit('chatMessage', `Updated with: ${msg}`);
		} catch (error) {
			console.error('Error processing chat message:', error);
			socket.emit(
				'chatMessage',
				'An error occurred while processing your request.'
			);
		}
	});

	socket.on('disconnect', () => {
		console.log('Client disconnected');
	});
});

server.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
