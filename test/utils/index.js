import { createServer } from 'http';
import * as assert from 'uvu/assert';

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

export function isResponse(res, code, expected) {
	assert.is(res.statusCode, code, `~> statusCode = ${code}`);

	const headers = res.headers;
	assert.ok(headers != null && typeof headers === 'object', '~> res.headers object exists');
	assert.ok(Object.keys(headers).length > 0, '~> res.headers is not empty');

	assert.is(Object.prototype.toString.call(res.data), '[object Object]', '~> res.data is an object');
	if (expected) assert.equal(res.data, expected, '~~> is expected response data!');
}
