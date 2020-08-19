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

declare function method<T = any>(uri: URL | string, opts?: Partial<Options>): Promise<Response<T>>;
export { method as get, method as post, method as patch, method as del, method as put };
