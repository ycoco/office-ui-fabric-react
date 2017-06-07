import ErrorHelper from "../logging/ErrorHelper";
import IDisposable from '../disposable/IDisposable';
import Scope from '../scope/Scope';

export type ICallback = ((args?: any) => boolean) | ((args?: any) => void);
export interface IBaseEventRecord extends IDisposable {
    target: IEventSource;
    eventName: string;
    callback: ICallback;
    useCapture: boolean;
}

export interface IObjectEventRecord extends IBaseEventRecord {
    target: IObjectEventSource;
    objectCallback: (args?: any) => boolean;
}

export interface IElementEventRecord extends IBaseEventRecord {
    target: IElementEventSource;
}

export type IEventRecord = IElementEventRecord | IObjectEventRecord;

export interface IEventRecordsByName<T extends IEventRecord> {
    [eventName: string]: IEventRecordList<T>;
}

export interface IEventRecordList<T extends IBaseEventRecord> {
    [eventId: number]: T;
    count: number;
}

export interface IDeclaredEventsByName {
    [eventName: string]: boolean;
}

export interface IBaseEventSource {
    __declaredEvents?: IDeclaredEventsByName;
}

export interface IObjectEventSource extends IBaseEventSource {
    __events__?: IEventRecordsByName<IObjectEventRecord>;
    parent?: IObjectEventSource;
    addEventListener?: void;
}

export interface IElementEventSource extends IBaseEventSource, EventTarget {
    // Nothing added.
}

export type IEventSource = IElementEventSource | IObjectEventSource;

export type IElementEventHandler<K extends keyof HTMLElementEventMap> = ((args: HTMLElementEventMap[K]) => boolean) | ((args: HTMLElementEventMap[K]) => void);

export type IElementEventHandlerMap = {
    [K in keyof HTMLElementEventMap]?: IElementEventHandler<K>;
};

let nextUniqueId = 0;

function isElement(target: IEventSource): target is IElementEventSource {
    return !!target && !!(target as EventTarget).addEventListener;
}

/** An instance of EventGroup allows anything with a handle to it to trigger events on it.
 *  If the target is an HTMLElement, the event will be attached to the element and can be
 *  triggered as usual (like clicking for onclick).
 *  The event can be triggered by calling EventGroup.raise() here. If the target is an
 *  HTMLElement, the event gets raised and is handled by the browser. Otherwise, it gets
 *  handled here in EventGroup, and the handler is called in the context of the parent
 *  (which is passed in in the constructor).
 */
export default class EventGroup {
    private _parent;
    private _eventRecords: { [eventId: number]: IEventRecord };
    private _isDisposed: boolean;

    /** parent: the context in all callbacks are called */
    public constructor(parent: any) {
        this._parent = parent;
        this._eventRecords = [];
    }

    /**
     *  Events raised here by default have bubbling set to false and cancelable set to true.
     *  This applies also to built-in events being raised manually here on HTMLElements,
     *  which may lead to unexpected behavior if it differs from the defaults.
     */
    public static raise<K extends keyof HTMLElementEventMap>(
        target: IElementEventSource,
        eventName: K,
        eventArgs?: HTMLElementEventMap[K],
        bubbleEvent?: boolean): boolean;
    public static raise<T>(
        target: IEventSource,
        eventName: string,
        eventArgs?: T,
        bubbleEvent?: boolean
    ): boolean;
    public static raise<T>(
        target: IEventSource,
        eventName: string,
        eventArgs?: T,
        bubbleEvent?: boolean
    ): boolean {
        let retVal: boolean;

        if (isElement(target)) {
            if (document.createEvent) {
                // Note that this initialization path is officially deprecated and will need to be switched to use new Event(name, initOptions) at some point.
                // However, IE does not currently support the new syntax.
                const ev = document.createEvent('HTMLEvents');

                ev.initEvent(eventName, bubbleEvent, true);
                ev['args'] = eventArgs;
                retVal = target.dispatchEvent(ev);
            } else if (DEBUG) {
                throw new Error("Raising custom element event requested, but document.createEvent is not available!");
            }
        } else {
            while (target) {
                const events = target.__events__;
                const eventRecords = events ? events[eventName] : null;

                for (const eventId in eventRecords) {
                    const record = eventRecords[eventId];

                    const objectCallback = record.objectCallback;

                    if (objectCallback) {
                        retVal = objectCallback(eventArgs);
                    }
                    if (retVal === false) {
                        return retVal;
                    }
                }

                // If the target has a parent, bubble the event up.
                target = bubbleEvent && target.parent;
            }
        }

        return retVal;
    }

    /** Check to see if the target has declared support of the given event. */
    public static isDeclared(target: IEventSource, eventName: string): boolean {
        const declaredEvents = target && target.__declaredEvents;

        return !!declaredEvents && !!declaredEvents[eventName];
    }

    public static stopPropagation(event: Event) {
        if (event.stopPropagation) {
            event.stopPropagation();
        }
    }

    public dispose(): void {
        if (!this._isDisposed) {
            this._isDisposed = true;
            this.off();
            this._parent = null;
            this._eventRecords = null;
        }
    }

    /**
     * On the target, attach a set of event handlers. The functions will be called
     * in the context of the parent of this instance of EventGroup.
     *
     * @param {IElementEventSource} target The element to attach listeners to.
     * @param {IElementEventHandlerMap} events A map of event names to listeners.
     * @param {boolean} useCapture Whether or not to use capture when attaching the listeners.
     * @returns {IDisposable} An object that can be disposed to detach the event listeners.
     */
    public onAll(target: IElementEventSource, events: IElementEventHandlerMap, useCapture?: boolean): IDisposable
    public onAll(target: IEventSource, events: { [key: string]: ICallback; }, useCapture?: boolean): IDisposable;
    public onAll(target: IEventSource, events: { [key: string]: ICallback; }, useCapture?: boolean): IDisposable {
        if (this._isDisposed) {
            return;
        }

        const scope = new Scope();
        for (const eventName in events) {
            scope.attach(this.on(target, eventName, events[eventName], useCapture));
        }
        return scope;
    }

    /**
     * On the target, attach an event whose handler will be called in the context of the parent of this instance of EventGroup.
     * @type {K} The name of the event.
     * @param {IElementEventSource} target The element to attach the listener to.
     * @param {K} eventName The name of the event to listen to.
     * @param {IElementEventHandler<K>} callback The listeners.
     * @param {boolean} useCapture Whether or not to use capture when attaching the listener.
     * @returns {IDisposable} An object that can be disposed to detach the event listener.
     */
    public on<K extends keyof HTMLElementEventMap>(target: IElementEventSource, eventName: K, callback: IElementEventHandler<K>, useCapture?: boolean): IDisposable;
    public on(target: IEventSource, eventName: string, callback: ICallback, useCapture?: boolean): IDisposable;
    public on(target: IEventSource, eventName: string, callback: ICallback, useCapture?: boolean): IDisposable {
        if (this._isDisposed) {
            return;
        }

        if (eventName.indexOf(',') > -1) {
            const events = eventName.split(/[ ,]+/);

            const handlers: { [key: string]: ICallback } = {};

            for (let i = 0; i < events.length; i++) {
                handlers[events[i]] = callback;
            }
            return this.onAll(target, handlers, useCapture);
        } else {
            const eventRecord: Partial<IBaseEventRecord> = {
                target: target,
                eventName: eventName,
                callback: callback,
                useCapture: useCapture
            };

            const eventId = nextUniqueId++;
            if (isElement(target)) {
                const processElementEvent = (...args: any[]): boolean => {
                    return this._onElementEvent(callback, args);
                };

                /* tslint:disable:ban-native-functions */
                target.addEventListener(eventName, processElementEvent, useCapture);
                /* tslint:enable:ban-native-functions */
                eventRecord.dispose = () => {
                    const eventRecords = this._eventRecords;
                    if (eventId in eventRecords) {
                        target.removeEventListener(eventName, processElementEvent, useCapture);
                    }
                    delete this._eventRecords[eventId];
                };
            } else {
                const processObjectEvent = (...args: any[]): boolean => {
                    return callback.apply(this._parent, args);
                };

                // Initialize and wire up the record on the target, so that it can call the callback if the event fires.
                const events = target.__events__ || (target.__events__ = {});
                const eventsForName: IEventRecordList<IEventRecord> = events[eventName] || (events[eventName] = {
                    count: 0
                });
                eventsForName.count++;

                (eventRecord as IObjectEventRecord).objectCallback = processObjectEvent;
                eventsForName[eventId] = eventRecord as IObjectEventRecord;

                eventRecord.dispose = () => {
                    const eventRecords = this._eventRecords;
                    if (eventId in eventRecords) {
                        eventsForName.count--;
                        delete eventsForName[eventId];
                        if (!eventsForName.count) {
                            delete events[eventName];
                        }
                    }
                    delete eventRecords[eventId];
                };
            }

            // Remember the record locally, so that it can be removed.
            return this._eventRecords[eventId] = eventRecord as IEventRecord;
        }
    }

    /**
     * @deprecated
     * This function is deprecated. The preferred way to remove event handlers is to invoke `dispose` on the objects returned by {EventGroup#on} and {EventGroup#onAll}
     *
     * @param target The object the listener is attached to
     * @param eventName The name of the event
     * @param callback The listener itself
     * @param useCapture Whether or not the listener used capture
     */
    public off<K extends keyof HTMLElementEventMap>(target?: IElementEventSource, eventName?: K, callback?: IElementEventHandler<K>, useCapture?: boolean): void;
    public off(target?: IEventSource, eventName?: string, callback?: ICallback, useCapture?: boolean): void;
    public off(target?: IEventSource, eventName?: string, callback?: ICallback, useCapture?: boolean): void {
        const eventRecords = this._eventRecords;
        for (const eventId of Object.keys(eventRecords)) {
            const eventRecord = eventRecords[eventId];
            if ((!target || target === eventRecord.target) &&
                (!eventName || eventName === eventRecord.eventName) &&
                (!callback || callback === eventRecord.callback) &&
                ((typeof useCapture !== 'boolean') || useCapture === eventRecord.useCapture)) {
                eventRecord.dispose();
            }
        }
    }

    /** Trigger the given event in the context of this instance of EventGroup. */
    public raise<K extends keyof HTMLElementEventMap>(eventName: K, eventArgs?: HTMLElementEventMap[K], bubbleEvent?: boolean): boolean;
    public raise<T>(eventName: string, eventArgs?: T, bubbleEvent?: boolean): boolean;
    public raise<T>(eventName: string, eventArgs?: T, bubbleEvent?: boolean): boolean {
        return EventGroup.raise(this._parent, eventName, eventArgs, bubbleEvent);
    }

    /** Declare an event as being supported by this instance of EventGroup. */
    public declare(event: string | string[]): void {
        const parent = this._parent;
        const declaredEvents = parent.__declaredEvents || (parent.__declaredEvents = {});

        if (typeof event === 'string') {
            declaredEvents[event] = true;
        } else {
            for (let i = 0; i < event.length; i++) {
                declaredEvents[event[i]] = true;
            }
        }
    }

    private _onElementEvent(callback: (...args: any[]) => any, args: any[]): boolean {
        if (this._isDisposed) {
            return;
        }
        let result: boolean;

        try {
            result = callback.apply(this._parent, args);
            const event = args[0];
            if (result === false && event) {
                if (event.preventDefault) {
                    event.preventDefault();
                }
                EventGroup.stopPropagation(event);
            }
        } catch (e) {
            ErrorHelper.log(e);
        }

        return result;
    }
}
