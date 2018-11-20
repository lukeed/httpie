const test = require('tape');
const httpie = require('../dist/httpie');

test('exports', t => {
	t.is(typeof httpie, 'object', 'exports an Object');

	['send', 'get', 'post', 'put', 'patch', 'del'].forEach(k => {
		t.is(typeof httpie[k], 'function', `~> httpie.${k} is a function`);
	});

	t.end();
});
