import { createServer } from 'http';

function handler(req, res) {
	res.setHeader('Content-Type', 'application/json');
	res.end('{invalid_json');
}

export async function server() {
	return new Promise(res => {
		let app = createServer(handler).listen();
		let close = app.close.bind(app);
		let { port } = app.address();
		return res({ port, close });
	});
}

export function isResponse(t, res, code, expected) {
	t.is(res.statusCode, code, `~> statusCode = ${code}`);

	const headers = res.headers;
	t.true(headers != null && typeof headers === 'object', '~> res.headers object exists');
	t.true(Object.keys(headers).length > 0, '~> res.headers is not empty');

	t.is(Object.prototype.toString.call(res.data), '[object Object]', '~> res.data is an object');
	if (expected) t.same(res.data, expected, '~~> is expected response data!');
}
