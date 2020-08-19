import { Url } from 'url';

// all options, loose fit
export interface Options {
	reviver(key: string, value: any): any;
	headers: Headers | Record<string, string>;
	withCredentials: boolean;
	redirect: boolean;
	timeout: number;
	body: any;
}

export interface Response<T = any> {
	headers: Record<string, string>;
	statusMessage: string;
	statusCode: number;
	data: T;
}

export function send<T = any>(method: string, uri: string | Url | URL, opts?: Partial<Options>): Promise<Response<T>>;

declare function method<T = any>(uri: string | Url | URL, opts?: Partial<Options>): Promise<Response<T>>;
export { method as get, method as post, method as patch, method as del, method as put };
