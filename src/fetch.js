function apply(src, tar) {
	tar.headers = src.headers || new Headers;
	tar.statusMessage = src.statusText;
	tar.statusCode = src.status;
	tar.data = src.body;
}

export function send(method, uri, opts) {
	opts = opts || {};
	var timer, tmp, ctrl;

	opts.method = method;
	opts.headers = opts.headers || {};

	if (opts.body && typeof opts.body == 'object') {
		opts.headers['content-type'] = 'application/json';
		opts.body = JSON.stringify(opts.body);
	}

	if (opts.withCredentials) {
		opts.credentials = 'include';
	}

	if (opts.timeout) {
		ctrl = new AbortController;
		opts.signal = ctrl.signal;
		timer = setTimeout(ctrl.abort, opts.timeout);
	}

	return new Promise(function (res, rej) {
		fetch(uri, opts).then(function (rr, reply) {
			clearTimeout(timer);

			apply(rr, rr); //=> rr.headers
			reply = rr.status >= 400 ? rej : res;

			tmp = rr.headers.get('content-type');
			if (!tmp || !~tmp.indexOf('application/json')) {
				reply(rr);
			} else {
				rr.text().then(function (str) {
					try {
						rr.data = JSON.parse(str, opts.reviver);
						reply(rr);
					} catch (err) {
						apply(rr, err);
						rej(err);
					}
				});
			}
		}).catch(function (err) {
			err.timeout = ctrl && ctrl.signal.aborted;
			rej(err);
		});
	});
}

export var get = send.bind(send, 'GET');
export var post = send.bind(send, 'POST');
export var patch = send.bind(send, 'PATCH');
export var del = send.bind(send, 'DELETE');
export var put = send.bind(send, 'PUT');
