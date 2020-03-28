import test from 'tape';
import { parse, URL } from 'url';
import { server, isResponse } from './utils';
import * as httpie from '../src';

test('(node) exports', t => {
	t.plan(8);
	t.is(typeof httpie, 'object', 'exports an object');
	['send', 'get', 'post', 'put', 'patch', 'del'].forEach(k => {
		t.is(typeof httpie[k], 'function', `~> httpie.${k} is a function`);
	});
	let out = httpie.send('GET', 'https://www.google.com');
	t.true(out instanceof Promise, '~> always returns a Promise!');
});

test('(node) GET (200)', async t => {
	t.plan(7);
	let res = await httpie.get('https://reqres.in/api/users/2');
	isResponse(t, res, 200);

	let data = res.data;
	t.ok(!!data.data, '~~> had "data" key');
	t.is(data.data.id, 2, '~~> had "data.id" value');
	t.is(data.data.first_name, 'Janet', '~~> had "data.first_name" value');
});

test('(node) GET (404)', async t => {
	t.plan(8);
	try {
		await httpie.get('https://reqres.in/api/users/23');
		t.fail('i will not run');
	} catch (err) {
		t.true(err instanceof Error, '~> returns a true Error instance');
		t.is(err.message, err.statusMessage, '~> the "message" and "statusMessage" are identical');
		t.is(err.message, 'Not Found', '~~> Not Found');
		isResponse(t, err, 404, {}); // +5
	}
});

test('(node) POST (201)', async t => {
	t.plan(8);

	let body = {
    name: 'morpheus',
    job: 'leader'
	};

	let res = await httpie.post('https://reqres.in/api/users', { body });

	isResponse(t, res, 201);
	t.ok(!!res.data.id, '~~> created item w/ "id" value');
	t.is(res.data.job, body.job, '~~> created item w/ "job" value');
	t.is(res.data.name, body.name, '~~> created item w/ "name" value');
	t.ok(!!res.data.createdAt, '~~> created item w/ "createdAt" value');
});

test('(node) PUT (200)', async t => {
	t.plan(7);

	let body = {
    name: 'morpheus',
    job: 'zion resident'
	};

	let res = await httpie.put('https://reqres.in/api/users/2', { body });

	isResponse(t, res, 200);
	t.is(res.data.job, body.job, '~~> created item w/ "job" value');
	t.is(res.data.name, body.name, '~~> created item w/ "name" value');
	t.ok(!!res.data.updatedAt, '~~> created item w/ "updatedAt" value');
});

test('(node) PATCH (200)', async t => {
	t.plan(7);

	let body = {
    name: 'morpheus',
    job: 'rebel'
	};

	let res = await httpie.patch('https://reqres.in/api/users/2', { body });

	isResponse(t, res, 200);
	t.is(res.data.job, body.job, '~~> created item w/ "job" value');
	t.is(res.data.name, body.name, '~~> created item w/ "name" value');
	t.ok(!!res.data.updatedAt, '~~> created item w/ "updatedAt" value');
});

test('(node) DELETE (204)', async t => {
	t.plan(2);
	let res = await httpie.del('https://reqres.in/api/users/2');
	t.is(res.statusCode, 204);
	t.is(res.data, '');
});

test('(node) GET (HTTP -> HTTPS)', async t => {
	t.plan(5);
	let res = await httpie.get('http://reqres.in/api/users');
	t.is(res.req.agent.protocol, 'https:', '~> follow-up request with HTTPS');
	isResponse(t, res, 200);
});

test('(node) GET (301 = redirect:false)', async t => {
	t.plan(4);
	let res = await httpie.get('http://reqres.in/api/users', { redirect:0 });
	t.is(res.statusCode, 301, '~> statusCode = 301');
	t.is(res.statusMessage, 'Moved Permanently', '~> "Moved Permanently"');
	t.is(res.headers.location, 'https://reqres.in/api/users', '~> has "Location" header');
	t.is(res.data, '', '~> res.data is empty string');
});

test('(node) GET (delay)', async t => {
	t.plan(3);
	let now = Date.now();
	let res = await httpie.send('GET', 'https://reqres.in/api/users?delay=5');
	t.is(res.statusCode, 200, '~> res.statusCode = 200');
	t.is(typeof res.data, 'object', '~> res.data is an object');
	t.true(Date.now() - now >= 5e3, '~> waited at least 5 seconds');
});

test('(node) POST (string body w/ object url)', async t => {
	t.plan(6);
	const body = 'peter@klaven';
	const uri = parse('https://reqres.in/api/login');
	await httpie.post(uri, { body }).catch(err => {
		t.is(err.message, 'Bad Request');
		isResponse(t, err, 400, {
			error: 'Missing email or username'
		});
	});
});

test('(node) custom headers', async t => {
	t.plan(2);
	let headers = { 'X-FOO': 'BAR123' };
	let res = await httpie.get('https://reqres.in/api/users', { headers });
	let sent = res.req.getHeader('x-foo');

	t.is(res.statusCode, 200, '~> statusCode = 200');
	t.is(sent, 'BAR123', '~> sent custom "X-FOO" header');
});

function reviver(key, val) {
	if (key.includes('_')) return; // removes
	return typeof val === 'number' ? String(val) : val;
}

test('(node) GET (reviver)', async t => {
	t.plan(5);
	let res = await httpie.get('https://reqres.in/api/users', { reviver });
	t.is(res.statusCode, 200, '~> statusCode = 200');

	t.is(res.data.per_page, undefined, '~> removed "per_page" key');
	t.is(typeof res.data.page, 'string', '~> converted numbers to strings');
	t.is(res.data.data[1].first_name, undefined, `~> (deep) removed "first_name" key`);
	t.is(typeof res.data.data[1].id, 'string', `~> (deep) converted numbers to strings`);
});

test('(node) GET (reviver w/ redirect)', async t => {
	t.plan(6);
	let res = await httpie.get('http://reqres.in/api/users', { reviver });
	t.is(res.req.agent.protocol, 'https:', '~> follow-up request with HTTPS');
	t.is(res.statusCode, 200, '~> statusCode = 200');

	t.is(res.data.per_page, undefined, '~> removed "per_page" key');
	t.is(typeof res.data.page, 'string', '~> converted numbers to strings');
	t.is(res.data.data[1].first_name, undefined, `~> (deep) removed "first_name" key`);
	t.is(typeof res.data.data[1].id, 'string', `~> (deep) converted numbers to strings`);
	t.end();
});

test('(node) via Url (legacy)', async t => {
	t.plan(4);
	let foo = parse('https://reqres.in/api/users/2');
	let res = await httpie.get(foo);
	isResponse(t, res, 200);
});

test('(node) via URL (WHATWG)', async t => {
	t.plan(4);
	let foo = new URL('https://reqres.in/api/users/2');
	let res = await httpie.get(foo);
	isResponse(t, res, 200);
});

test('(node) Error: Invalid JSON', async t => {
	t.plan(7);
	let ctx = await server();
	await httpie.get(`http://localhost:${ctx.port}/any`).catch(err => {
		t.true(err instanceof SyntaxError, '~> caught SyntaxError');
		t.true(err.message.includes('Unexpected token'), '~> had "Unexpected token" message');
		t.true(err.stack.includes('JSON.parse'), '~> printed `JSON.parse` in stack');

		t.is(err.statusCode, 200, `~> statusCode = 200`);
		t.ok(err.headers['content-type'], `~> headers['content-type'] exists`);
		t.ok(err.headers['content-length'], `~> headers['content-length'] exists`);
		t.is(err.data, undefined, '~> err.data is undefined');

		ctx.close();
	});
});

test('(node) Error: timeout', async t => {
	t.plan(7);

	await httpie.send('GET', 'https://reqres.in/api/users?delay=3', { timeout:1000 }).catch(err => {
		t.true(err instanceof Error, '~> caught Error');
		t.is(err.message, 'socket hang up', '~> had "socket hang up" message');
		t.true(err.timeout !== void 0, '~> added `timeout` property');
		t.true(err.timeout, '~> `timeout` was true');

		t.is(err.statusCode, undefined, `~> statusCode = undefined`);
		t.is(err.headers, undefined, `~> headers = undefined`);
		t.is(err.data, undefined, '~> err.data is undefined');
	});
});
