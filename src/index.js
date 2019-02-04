import { request } from 'https';
import { globalAgent } from 'http';
import { parse, resolve } from 'url';

export function send(method, uri, opts={}) {
	return new Promise((res, rej) => {
		let out = '';
		let o = { method };
		let { redirect=true } = opts;
		Object.assign(o, typeof uri === 'string' ? parse(uri) : uri);
		if (o.protocol === 'http:') o.agent = globalAgent;
		o.headers = opts.headers || {};
		o.reviver = opts.reviver;

		let req = request(o, r => {
			r.setEncoding('utf8');

			r.on('data', d => {
				out += d;
			});

			r.on('end', () => {
				let type = r.headers['content-type'];
				if (type && out && type.includes('application/json')) {
					out = JSON.parse(out, o.reviver);
				}
				r.data = out;
				if (r.statusCode >= 400) {
					let err = new Error(r.statusMessage);
					err.statusMessage = r.statusMessage;
					err.statusCode = r.statusCode;
					err.headers = r.headers;
					err.data = r.data;
					rej(err);
				} else if (r.statusCode > 300 && redirect && r.headers.location) {
					o.path = resolve(o.path, r.headers.location);
					return send(method, o.path.startsWith('/') ? o : o.path, o).then(res, rej);
				} else {
					res(r);
				}
			});
		});

		req.on('error', rej);

		if (opts.body) {
			let isObj = typeof opts.body === 'object' && !Buffer.isBuffer(opts.body);
			let str = isObj ? JSON.stringify(opts.body) : opts.body;
			isObj && req.setHeader('content-type', 'application/json');
			req.setHeader('content-length', Buffer.byteLength(str));
			req.write(str);
		}

		req.end();
	});
}

export const get = send.bind(null, 'GET');
export const post = send.bind(null, 'POST');
export const patch = send.bind(null, 'PATCH');
export const del = send.bind(null, 'DELETE');
export const put = send.bind(null, 'PUT');
