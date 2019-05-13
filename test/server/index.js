import { createServer } from 'http';

function handler(req, res) {
	res.setHeader('Content-Type', 'application/json');
	res.end('{invalid_json');
}

export default async function () {
	return new Promise(res => {
		let app = createServer(handler).listen();
		let close = app.close.bind(app);
		let { port } = app.address();
		return res({ port, close });
	});
}
