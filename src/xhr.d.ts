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

declare function method<T = any>(uri: URL | string, opts?: Partial<Options>): Promise<Response<T>>;
export { method as get, method as post, method as patch, method as del, method as put };
