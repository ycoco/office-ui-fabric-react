import Promise from './Promise';

interface IPromiseErrorEvent {
    exception: any;
    error: any;
    promise: Promise<any>;
    handler: Function;
    id: number;
    parent: Promise<any>;
}

export = IPromiseErrorEvent;