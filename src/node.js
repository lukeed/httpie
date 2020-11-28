import { request } from 'https';
import { globalAgent } from 'http';
import { parse, resolve } from 'url';

function toError(rej, res, err) {
	err = err || new Error(res.statusMessage);
	err.statusMessage = res.statusMessage;
	err.statusCode = res.statusCode;
	err.headers = res.headers;
	err.data = res.data;
	rej(err);
}

export function send(method, uri, opts={}) {
	return new Promise((res, rej) => {
		let req, tmp, out = '';
		let { redirect=true } = opts;
		opts.method = method;

		if (uri && !!uri.toJSON) uri = uri.toJSON();
		Object.assign(opts, typeof uri === 'string' ? parse(uri) : uri);
		opts.agent = opts.protocol === 'http:' ? globalAgent : void 0;

		req = request(opts, rr => {
			if (rr.statusCode > 300 && redirect && rr.headers.location) {
				opts.path = resolve(opts.path, rr.headers.location);
				return send(method, opts.path.startsWith('/') ? opts : opts.path, opts).then(res, rej);
			}

			rr.on('data', d => {
				out += d;
			});

			rr.on('end', () => {
				tmp = rr.headers['content-type'];
				if (tmp && out && tmp.includes('application/json')) {
					try {
						out = JSON.parse(out, opts.reviver);
					} catch (err) {
						return toError(rej, rr, err);
					}
				}
				rr.data = out;
				if (rr.statusCode >= 400) {
					toError(rej, rr);
				} else {
					res(rr);
				}
			});
		});

		req.on('timeout', req.abort);
		req.on('error', err => {
			// Node 11.x ~> boolean, else timestamp
			err.timeout = req.aborted;
			rej(err);
		});

		if (opts.body) {
			tmp = typeof opts.body === 'object' && !Buffer.isBuffer(opts.body);
			tmp && req.setHeader('content-type', 'application/json');
			tmp = tmp ? JSON.stringify(opts.body) : opts.body;

			req.setHeader('content-length', Buffer.byteLength(tmp));
			req.write(tmp);
		}

		req.end();
	});
}

export const get = /*#__PURE__*/ send.bind(send, 'GET');
export const post = /*#__PURE__*/ send.bind(send, 'POST');
export const patch = /*#__PURE__*/ send.bind(send, 'PATCH');
export const del = /*#__PURE__*/ send.bind(send, 'DELETE');
export const put = /*#__PURE__*/ send.bind(send, 'PUT');
