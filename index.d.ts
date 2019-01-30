import {Url} from "url";
import {IncomingMessage} from "http";

export interface HttpieOptions {
	body: any,
	headers: {
		[name: string]: string
	}
}

export interface HttpieResponse<T> extends IncomingMessage {
	data: string | T,
}

export declare function send<T>(method: string, uri: string | Url, opts?: HttpieOptions): Promise<HttpieResponse<T>>;

declare function method<T>(uri: string | Url, opts?: HttpieOptions): Promise<HttpieResponse<T>>;

export {
	method as get,
	method as post,
	method as patch,
	method as del,
	method as put,
};
