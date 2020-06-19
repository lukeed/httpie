declare module 'httpie' {
	import { Url, URL } from 'url';
	import { IncomingMessage } from 'http';

	export interface HttpieOptions {
		body: any;
		headers: Record<string, string>;
		redirect: boolean;
		withCredentials: boolean;
		reviver: (key: string, value: any) => any;
		timeout: number;
	}

	export interface HttpieResponse<T = any> extends IncomingMessage {
		data: T;
	}

	export function send<T = any>(method: string, uri: string | Url | URL, opts?: Partial<HttpieOptions>): Promise<HttpieResponse<T>>;

	function method<T = any>(uri: string | Url | URL, opts?: Partial<HttpieOptions>): Promise<HttpieResponse<T>>;
	export { method as get, method as post, method as patch, method as del, method as put };
}

declare module 'httpie/node' {
	import { Url, URL } from 'url';
	import { IncomingMessage } from 'http';

	export interface Response<T = any> extends IncomingMessage {
		data: T;
	}

	export interface Options {
		reviver(key: string, value: any): any;
		headers: Record<string, string>;
		redirect: boolean;
		timeout: number;
		body: any;
	}

	export function send<T = any>(method: string, uri: URL | Url | string, opts?: Partial<Options>): Promise<Response<T>>;

	function method<T = any>(uri: URL | Url | string, opts?: Partial<Options>): Promise<Response<T>>;
	export { method as get, method as post, method as patch, method as del, method as put };
}

declare module 'httpie/fetch' {
	export interface Response<T = any> extends globalThis.Response {
		statusMessage: string;
		statusCode: number;
		data: T;
	}

	export interface Options extends Partial<RequestInit> {
		reviver(key: string, value: any): any;
		headers: Headers | Record<string, string>;
		withCredentials: boolean;
		timeout: number;
		body: any;
	}

	export function send<T = any>(method: string, uri: URL | string, opts?: Partial<Options>): Promise<Response<T>>;

	function method<T = any>(uri: URL | string, opts?: Partial<Options>): Promise<Response<T>>;
	export { method as get, method as post, method as patch, method as del, method as put };
}

declare module 'httpie/xhr' {
	export interface Response<T = any> extends XMLHttpRequest {
		headers: Record<string, string>;
		statusMessage: string;
		statusCode: number;
		data: T;
	}

	export interface Options {
		reviver(key: string, value: any): any;
		headers: Record<string, string>;
		withCredentials: boolean;
		redirect: boolean;
		timeout: number;
		body: any;
	}

	export function send<T = any>(method: string, uri: URL | string, opts?: Partial<Options>): Promise<Response<T>>;

	function method<T = any>(uri: URL | string, opts?: Partial<Options>): Promise<Response<T>>;
	export { method as get, method as post, method as patch, method as del, method as put };
}
