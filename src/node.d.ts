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

declare function method<T = any>(uri: URL | Url | string, opts?: Partial<Options>): Promise<Response<T>>;
export { method as get, method as post, method as patch, method as del, method as put };
