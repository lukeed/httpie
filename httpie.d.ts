import {Url} from "url";
import {IncomingMessage} from "http";

export interface HttpieOptions {
	body: any,
	headers: {
		[name: string]: string
	},
	redirect: boolean,
}

export interface HttpieResponse<T = any> extends IncomingMessage {
	data: T,
}

export declare function send<T = any>(method: string, uri: string | Url, opts?: Partial<HttpieOptions>): Promise<HttpieResponse<T>>;

declare function method<T = any>(uri: string | Url, opts?: Partial<HttpieOptions>): Promise<HttpieResponse<T>>;

export {
	method as get,
	method as post,
	method as patch,
	method as del,
	method as put,
};
