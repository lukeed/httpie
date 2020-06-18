<div align="center">
  <img src="logo.png" alt="httpie" height="190" />
</div>

<div align="center">
  <a href="https://npmjs.org/package/httpie">
    <img src="https://badgen.now.sh/npm/v/httpie" alt="version" />
  </a>
  <a href="https://travis-ci.org/lukeed/httpie">
    <img src="https://github.com/lukeed/httpie/workflows/CI/badge.svg" alt="CI" />
  </a>
  <a href="https://codecov.io/gh/lukeed/httpie">
    <img src="https://badgen.now.sh/codecov/c/github/lukeed/httpie" alt="codecov" />
  </a>
  <a href="https://npmjs.org/package/httpie">
    <img src="https://badgen.now.sh/npm/dm/httpie" alt="downloads" />
  </a>
</div>

<div align="center">A Node.js and browser HTTP client as easy as pie!</div>

## Features

* `Promise`- based HTTP requestor
* Works with HTTP and HTTPS protocols
* Automatically handles JSON requests and responses
* Extremely lightweight with **no dependencies** 678 bytes!
* Includes aliases for common HTTP verbs: `get`, `post`, `put`, `patch`, and `del`

Additionally, this module is delivered as:

* **ES Module**: [`dist/httpie.mjs`](https://unpkg.com/httpie/dist/httpie.mjs)
* **CommonJS**: [`dist/httpie.js`](https://unpkg.com/httpie/dist/httpie.js)


## Install

```
$ npm install --save httpie
```


## Usage

> **Note:** The `async` syntax is for demo purposes – you may use Promises in a Node 6.x environment too!

```js
import { get, post } from 'httpie';

try {
  const { data } = await get('https://pokeapi.co/api/v2/pokemon/1');

  // Demo: Endpoint will echo what we've sent
  const res = await post('https://jsonplaceholder.typicode.com/posts', {
    body: {
      id: data.id,
      name: data.name,
      number: data.order,
      moves: data.moves.slice(0, 6)
    }
  });

  console.log(res.statusCode); //=> 201
  console.log(res.data); //=> { id: 1, name: 'bulbasaur', number: 1, moves: [{...}, {...}] }
} catch (err) {
  console.error('Error!', err.statusCode, err.message);
  console.error('~> headers:', err.headers);
  console.error('~> data:', err.data);
}
```


## API

### send(method, url, opts={})
Returns: `Promise`

Any `httpie.send` request (and its aliases) will always return a Promise.

If the response's `statusCode` is 400 or above, this Promise will reject with a formatted error – see [Error Handling](#error-handling). Otherwise, the Promise will resolve with the full [`ClientRequest`](https://nodejs.org/api/http.html#http_class_http_clientrequest) stream.

The resolved response will receive a new `data` key, which will contain the response's full payload. Should the response return JSON content, then `httpie` will parse it and the `res.data` value will be the resulting JSON object!

#### method
Type: `String`

The HTTP method name – it must be uppercase!

#### url
Type: `String` or [`URL`](https://nodejs.org/api/url.html#url_the_whatwg_url_api)

If `url` is a string, it is automatically parsed with [`url.parse()`](https://nodejs.org/api/url.html#url_url_parse_urlstring_parsequerystring_slashesdenotehost) into an object.

#### opts.body
Type: `Mixed`<br>
Default: `undefined`

The request's body, can be of any type!

Any non-`Buffer` objects will be converted into a JSON string and the appropriate [`Content-Type`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) header will be attached.

Additionally, `httpie` will _always_ set a value for the [`Content-Length`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Length) header!

#### opts.headers
Type: `Object`<br>
Default: `{}`

The custom headers to send with your request.

#### opts.redirect
Type: `Boolean`<br>
Default: `true`

Whether or not redirect responses should be followed automatically.

> **Note:** This may only happen with a 3xx status _and_ if the response had a [`Location`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Location) header.

#### opts.reviver
Type: `Function`<br>
Default: `undefined`

An optional function that's passed directly to [`JSON.parse`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#Parameters), allowing you transform aspects of the response data before the `httpie` request resolves.

> **Note:** This will _only_ run if `httpie` detects that JSON is contained in the response!

#### opts.timeout
Type: `Integer`<br>
Default: `undefined`

The time, in milliseconds, before automatically terminating the request.

When the request exceeds this limit, `httpie` rejects with an `err<Error>`, adding a truthy `err.timeout` value.

> **Important:** There is a slight behavioral difference between the Node & browser versions!<br>
In the server, the `timeout` value _does not propagate_ to any redirects.<br>
In the browser, the `timeout` value _will not_ reset during redirects.

#### opts.withCredentials
Type: `Boolean`<br>
Default: `false`

Whether or not cross-site requests should include credentials (such as cookies).<br>
This value is passed directly to [`XMLHttpRequest.withCredentials`](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials).

**Important**: This is for the **browser version** only!



### get(url, opts={})
> Alias for [`send('GET', url, opts)`](#sendmethod-url-opts).

### post(url, opts={})
> Alias for [`send('POST', url, opts)`](#sendmethod-url-opts).

### put(url, opts={})
> Alias for [`send('PUT', url, opts)`](#sendmethod-url-opts).

### patch(url, opts={})
> Alias for [`send('PATCH', url, opts)`](#sendmethod-url-opts).

### del(url, opts={})
> Alias for [`send('DELETE', url, opts)`](#sendmethod-url-opts).


## Error Handling

All responses with `statusCode >= 400` will result in a rejected `httpie` request. When this occurs, an Error instance is formatted with complete information:

* `err.message` – `String` – Identical to `err.statusMessage`;
* `err.statusMessage` – `String` – The response's `statusMessage` value;
* `err.statusCode` – `Number` – The response's `statusCode` value;
* `err.headers` – `Object` – The response's `headers` object;
* `err.data` – `Mixed` – The response's payload;

Additionally, errors that are a result of a timeout expiration will have a truthy `err.timeout` value.

> **Important:** The error's `data` property may also be parsed to a JSON object, according to the response's headers.

```js
import { get } from 'httpie';

get('https://example.com/404').catch(err => {
  console.error(`(${err.statusCode}) ${err.message}`)
  console.error(err.headers['content-type']);
  console.error(`~> ${err.data}`);
});
//=> "(404) Not Found"
//=> "text/html; charset=UTF-8"
//=> ~> <?xml version="1.0" encoding="iso-8859-1"?>\n<!DOCTYPE html ...</body>\n</html>
```

## License

MIT © [Luke Edwards](https://lukeed.com)
