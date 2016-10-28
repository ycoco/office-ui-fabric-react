
export type IRequire<T> = (paths: string[], onLoad: (module: T) => void, onError: (error: any) => void) => (T | void);
