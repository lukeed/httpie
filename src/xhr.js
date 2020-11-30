function apply(src, tar) {
	tar.headers = src.headers || {};
	tar.statusMessage = src.statusText;
	tar.statusCode = src.status;
	tar.data = src.response;
}

export function send(method, uri, opts) {
	return new Promise(function (res, rej) {
		opts = opts || {};
		var req = new XMLHttpRequest;
		var k, tmp, arr, str=opts.body;
		var headers = opts.headers || {};

		// IE compatible
		if (opts.timeout) req.timeout = opts.timeout;
		req.ontimeout = req.onerror = function (err) {
			err.timeout = err.type == 'timeout';
			rej(err);
		}

		req.open(method, uri.href || uri);

		req.onload = function () {
			arr = req.getAllResponseHeaders().trim().split(/[\r\n]+/);
			apply(req, req); //=> req.headers

			while (tmp = arr.shift()) {
				tmp = tmp.split(': ');
				req.headers[tmp.shift().toLowerCase()] = tmp.join(': ');
			}

			tmp = req.headers['content-type'];
			if (tmp && !!~tmp.indexOf('application/json')) {
				try {
					req.data = JSON.parse(req.data, opts.reviver);
				} catch (err) {
					apply(req, err);
					return rej(err);
				}
			}

			(req.status >= 400 ? rej : res)(req);
		};

		if (typeof FormData < 'u' && str instanceof FormData) {
			// str = opts.body
		} else if (str && typeof str == 'object') {
			headers['content-type'] = 'application/json';
			str = JSON.stringify(str);
		}

		req.withCredentials = !!opts.withCredentials;

		for (k in headers) {
			req.setRequestHeader(k, headers[k]);
		}

		req.send(str);
	});
}

export var get = /*#__PURE__*/ send.bind(send, 'GET');
export var post = /*#__PURE__*/ send.bind(send, 'POST');
export var patch = /*#__PURE__*/ send.bind(send, 'PATCH');
export var del = /*#__PURE__*/ send.bind(send, 'DELETE');
export var put = /*#__PURE__*/ send.bind(send, 'PUT');
