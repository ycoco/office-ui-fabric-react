import ErrorHelper from "../logging/ErrorHelper";

export type ICallback = ((args?: any) => boolean) | ((args?: any) => void);
export interface IBaseEventRecord {
    target: IEventSource;
    eventName: string;
    parent: any;
    callback: ICallback;
    useCapture: boolean;
}

export interface IObjectEventRecord extends IBaseEventRecord {
    target: IObjectEventSource;
    objectCallback: (args?: any) => boolean;
}

export interface IElementEventRecord extends IBaseEventRecord {
    target: IElementEventSource;
    elementCallback: (...args: any[]) => boolean;
}

export type IEventRecord = IElementEventRecord | IObjectEventRecord;

export interface IEventRecordsByName<T extends IEventRecord> {
    [eventName: string]: IEventRecordList<T>;
}

export interface IEventRecordList<T extends IBaseEventRecord> {
    [id: number]: T[];
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
    __events__?: IEventRecordsByName<IElementEventRecord>;
    parent?: IElementEventSource;
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
    private readonly _eventRecords: IEventRecord[];
    private readonly _id: number;
    private _isDisposed: boolean;

    /** parent: the context in all callbacks are called */
    public constructor(parent: any) {
        this._parent = parent;
        this._eventRecords = [];
        this._id = nextUniqueId++;
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

                for (const id in eventRecords) {
                    const eventRecordList = eventRecords[id];

                    for (var listIndex = 0; listIndex < eventRecordList.length; listIndex++) {
                        const record = eventRecordList[listIndex];
                        const objectCallback = record.objectCallback;

                        if (objectCallback) {
                            retVal = objectCallback(eventArgs);
                        }
                        if (retVal === false) {
                            return retVal;
                        }
                    }
                }

                // If the target has a parent, bubble the event up.
                target = bubbleEvent && target.parent;
            }
        }

        return retVal;
    }

    public static isObserved(target: IElementEventSource, eventName: keyof HTMLElementEventMap): boolean;
    public static isObserved(target: IEventSource, eventName: string): boolean;
    public static isObserved(target: IEventSource, eventName: string): boolean {
        const events = target && target.__events__;

        return !!events && !!events[eventName];
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
        }
    }

    /** On the target, attach a set of events, where the events object is a name to function mapping. */
    public onAll(target: IElementEventSource, events: IElementEventHandlerMap, useCapture?: boolean): void
    public onAll(target: IEventSource, events: { [key: string]: ICallback; }, useCapture?: boolean): void;
    public onAll(target: IEventSource, events: { [key: string]: ICallback; }, useCapture?: boolean): void {
        for (const eventName in events) {
            this.on(target, eventName, events[eventName], useCapture);
        }
    }

    /** On the target, attach an event whose handler will be called in the context of the parent
     * of this instance of EventGroup.
     */
    public on<K extends keyof HTMLElementEventMap>(target: IElementEventSource, eventName: K, callback: IElementEventHandler<K>, useCapture?: boolean): void;
    public on(target: IEventSource, eventName: string, callback: ICallback, useCapture?: boolean): void;
    public on(target: IEventSource, eventName: string, callback: ICallback, useCapture?: boolean): void {
        if (eventName.indexOf(',') > -1) {
            const events = eventName.split(/[ ,]+/);

            for (var i = 0; i < events.length; i++) {
                this.on(target, events[i], callback, useCapture);
            }
        } else {
            const parent = this._parent;
            const eventRecord: IBaseEventRecord = {
                target: target,
                eventName: eventName,
                parent: parent,
                callback: callback,
                useCapture: useCapture
            };

            // Initialize and wire up the record on the target, so that it can call the callback if the event fires.
            const events = target.__events__ || (target.__events__ = {});
            const eventsForName: IEventRecordList<IEventRecord> = events[eventName] || (events[eventName] = {
                count: 0
            });
            const id = this._id;
            const eventsForId = eventsForName[id] || (eventsForName[id] = []);
            eventsForId.push(eventRecord as IEventRecord);
            events[eventName].count++;

            if (isElement(target)) {
                const processElementEvent = (...args: any[]): boolean => {
                    return this._onElementEvent(callback, args);
                };

                (eventRecord as IElementEventRecord).elementCallback = processElementEvent;

                /* tslint:disable:ban-native-functions */
                target.addEventListener(eventName, processElementEvent, useCapture);
                /* tslint:enable:ban-native-functions */
            } else {
                const processObjectEvent = (...args: any[]): boolean => {
                    if (this._isDisposed) {
                        return;
                    }

                    return callback.apply(parent, args);
                };

                (eventRecord as IObjectEventRecord).objectCallback = processObjectEvent;
            }

            // Remember the record locally, so that it can be removed.
            this._eventRecords.push(eventRecord as IEventRecord);
        }
    }

    public off<K extends keyof HTMLElementEventMap>(target?: IElementEventSource, eventName?: K, callback?: IElementEventHandler<K>, useCapture?: boolean): void;
    public off(target?: IEventSource, eventName?: string, callback?: ICallback, useCapture?: boolean): void;
    public off(target?: IEventSource, eventName?: string, callback?: ICallback, useCapture?: boolean): void {
        for (let i = 0; i < this._eventRecords.length; i++) {
            const eventRecord = this._eventRecords[i];
            const recordTarget = eventRecord.target;
            const recordName = eventRecord.eventName;
            if ((!target || target === recordTarget) &&
                (!eventName || eventName === recordName) &&
                (!callback || callback === eventRecord.callback) &&
                ((typeof useCapture !== 'boolean') || useCapture === eventRecord.useCapture)) {
                const events = recordTarget.__events__;
                const targetArrayLookup = events[recordName];
                const targetArray = targetArrayLookup && <IEventRecord[]>targetArrayLookup[this._id];

                // We may have already target's entries, so check for null.
                if (targetArray) {
                    if (targetArray.length === 1 || !callback) {
                        targetArrayLookup.count -= targetArray.length;
                        delete events[recordName][this._id];
                        delete events[recordName];
                    } else {
                        targetArrayLookup.count--;
                        targetArray.splice(targetArray.indexOf(eventRecord), 1);
                    }
                }

                const elementCallback = (eventRecord as IElementEventRecord).elementCallback;
                const elementTarget = recordTarget as IElementEventSource;

                if (elementCallback && elementTarget.removeEventListener) {
                    elementTarget.removeEventListener(recordName, elementCallback, eventRecord.useCapture);
                }

                this._eventRecords.splice(i--, 1);
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
