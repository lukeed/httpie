import { test } from 'uvu';
import { parse, URL } from 'url';
import * as assert from 'uvu/assert';
import { server, isResponse } from './utils';
import * as httpie from '../src/node';

test('exports', () => {
	assert.type(httpie, 'object');

	['send', 'get', 'post', 'put', 'patch', 'del'].forEach(k => {
		assert.type(httpie[k], 'function');
	});

	let out = httpie.send('GET', 'https://www.google.com');
	assert.instance(out, Promise, '~> returns a Promise');
});

test('GET (200)', async () => {
	let res = await httpie.get('https://reqres.in/api/users/2');
	isResponse(res, 200);

	let data = res.data;
	assert.ok(data.data, '~~> had "data" key');
	assert.is(data.data.id, 2, '~~> had "data.id" value');
	assert.is(data.data.first_name, 'Janet', '~~> had "data.first_name" value');
});

test('GET (404)', async () => {
	try {
		await httpie.get('https://reqres.in/api/users/23');
		assert.ok(false, 'i should not run');
	} catch (err) {
		assert.instance(err, Error, '~> returns a true Error instance');
		assert.is(err.message, err.statusMessage, '~> the "message" and "statusMessage" are identical');
		assert.is(err.message, 'Not Found', '~~> Not Found');
		isResponse(err, 404, {}); // +5
	}
});

test('POST (201)', async () => {
	let body = {
    name: 'morpheus',
    job: 'leader'
	};

	let res = await httpie.post('https://reqres.in/api/users', { body });

	isResponse(res, 201);
	assert.ok(res.data.id, '~~> created item w/ "id" value');
	assert.is(res.data.job, body.job, '~~> created item w/ "job" value');
	assert.is(res.data.name, body.name, '~~> created item w/ "name" value');
	assert.ok(res.data.createdAt, '~~> created item w/ "createdAt" value');
});

test('PUT (200)', async () => {
	let body = {
    name: 'morpheus',
    job: 'zion resident'
	};

	let res = await httpie.put('https://reqres.in/api/users/2', { body });

	isResponse(res, 200);
	assert.is(res.data.job, body.job, '~~> created item w/ "job" value');
	assert.is(res.data.name, body.name, '~~> created item w/ "name" value');
	assert.ok(res.data.updatedAt, '~~> created item w/ "updatedAt" value');
});

test('PATCH (200)', async () => {
	let body = {
    name: 'morpheus',
    job: 'rebel'
	};

	let res = await httpie.patch('https://reqres.in/api/users/2', { body });

	isResponse(res, 200);
	assert.is(res.data.job, body.job, '~~> created item w/ "job" value');
	assert.is(res.data.name, body.name, '~~> created item w/ "name" value');
	assert.ok(res.data.updatedAt, '~~> created item w/ "updatedAt" value');
});

test('DELETE (204)', async () => {
	let res = await httpie.del('https://reqres.in/api/users/2');
	assert.is(res.statusCode, 204);
	assert.is(res.data, '');
});

test('GET (HTTP -> HTTPS)', async () => {
	let res = await httpie.get('http://reqres.in/api/users');
	assert.is(res.req.agent.protocol, 'https:', '~> follow-up request with HTTPS');
	isResponse(res, 200);
});

test('GET (301 = redirect:false)', async () => {
	let res = await httpie.get('http://reqres.in/api/users', { redirect:0 });
	assert.is(res.statusCode, 301, '~> statusCode = 301');
	assert.is(res.statusMessage, 'Moved Permanently', '~> "Moved Permanently"');
	assert.is(res.headers.location, 'https://reqres.in/api/users', '~> has "Location" header');
	assert.is(res.data, '', '~> res.data is empty string');
});

test('GET (delay)', async () => {
	let now = Date.now();
	let res = await httpie.send('GET', 'https://reqres.in/api/users?delay=5');
	assert.is(res.statusCode, 200, '~> res.statusCode = 200');
	assert.type(res.data, 'object', '~> res.data is an object');
	assert.ok(Date.now() - now >= 5e3, '~> waited at least 5 seconds');
});

test('POST (string body w/ object url)', async () => {
	const body = 'peter@klaven';
	const uri = parse('https://reqres.in/api/login');
	await httpie.post(uri, { body }).catch(err => {
		assert.is(err.message, 'Bad Request');
		isResponse(err, 400, {
			error: 'Missing email or username'
		});
	});
});

test('custom headers', async () => {
	let headers = { 'X-FOO': 'BAR123' };
	let res = await httpie.get('https://reqres.in/api/users', { headers });
	let sent = res.req.getHeader('x-foo');

	assert.is(res.statusCode, 200, '~> statusCode = 200');
	assert.is(sent, 'BAR123', '~> sent custom "X-FOO" header');
});

function reviver(key, val) {
	if (key.includes('_')) return; // removes
	return typeof val === 'number' ? String(val) : val;
}

test('GET (reviver)', async () => {
	let res = await httpie.get('https://reqres.in/api/users', { reviver });
	assert.is(res.statusCode, 200, '~> statusCode = 200');

	assert.is(res.data.per_page, undefined, '~> removed "per_page" key');
	assert.type(res.data.page, 'string', '~> converted numbers to strings');
	assert.is(res.data.data[1].first_name, undefined, `~> (deep) removed "first_name" key`);
	assert.type(res.data.data[1].id, 'string', `~> (deep) converted numbers to strings`);
});

test('GET (reviver w/ redirect)', async () => {
	let res = await httpie.get('http://reqres.in/api/users', { reviver });
	assert.is(res.req.agent.protocol, 'https:', '~> follow-up request with HTTPS');
	assert.is(res.statusCode, 200, '~> statusCode = 200');

	assert.is(res.data.per_page, undefined, '~> removed "per_page" key');
	assert.type(res.data.page, 'string', '~> converted numbers to strings');
	assert.is(res.data.data[1].first_name, undefined, `~> (deep) removed "first_name" key`);
	assert.type(res.data.data[1].id, 'string', `~> (deep) converted numbers to strings`);
});

test('via Url (legacy)', async () => {
	let foo = parse('https://reqres.in/api/users/2');
	isResponse(await httpie.get(foo), 200);
});

test('via URL (WHATWG)', async () => {
	let foo = new URL('https://reqres.in/api/users/2');
	isResponse(await httpie.get(foo), 200);
});

test('Error: Invalid JSON', async () => {
	let ctx = await server();
	await httpie.get(`http://localhost:${ctx.port}/any`).catch(err => {
		assert.instance(err, SyntaxError, '~> caught SyntaxError');
		assert.ok(err.message.includes('Unexpected token'), '~> had "Unexpected token" message');
		assert.ok(err.stack.includes('JSON.parse'), '~> printed `JSON.parse` in stack');

		assert.is(err.statusCode, 200, `~> statusCode = 200`);
		assert.ok(err.headers['content-type'], `~> headers['content-type'] exists`);
		assert.ok(err.headers['content-length'], `~> headers['content-length'] exists`);
		assert.is(err.data, undefined, '~> err.data is undefined');

		ctx.close();
	});
});

test('Error: timeout', async () => {
	await httpie.send('GET', 'https://reqres.in/api/users?delay=3', { timeout:1000 }).catch(err => {
		assert.instance(err, Error, '~> caught Error');
		assert.is(err.message, 'socket hang up', '~> had "socket hang up" message');
		assert.ok(err.timeout !== void 0, '~> added `timeout` property');
		assert.ok(err.timeout, '~> `timeout` was true');

		assert.is(err.statusCode, undefined, `~> statusCode = undefined`);
		assert.is(err.headers, undefined, `~> headers = undefined`);
		assert.is(err.data, undefined, '~> err.data is undefined');
	});
});

test.run();
