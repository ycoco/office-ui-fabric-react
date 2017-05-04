
import { IEngagementHandler, IGeneralEngagementContext } from './IEngagementHandler';
import { EngagementPart, IEngagementInput, IPayloadEngagementContext, IEngagementSource, IEngagementChain } from './EngagementPart';
import { Engagement, IEngagementSingleSchema } from '../events/Engagement.event';
import Promise from '../../async/Promise';
import { extend } from '../../object/ObjectUtil';
import { Killswitch } from '../../killswitch/Killswitch';

export interface IEngagementHelperParams {
    // None presently.
}

export interface IEngagementHelperDependencies {
    /**
     * Handlers to use for data extraction from the context for engagement events.
     * If the handlers have not yet loaded, pass a promise for their resolution.
     *
     * @type {IEngagementHandler[]}
     * @memberOf IEngagementHelperDependencies
     */
    handlers?: IEngagementHandler[] | Promise<IEngagementHandler[]>;
    engagementSource?: IEngagementSource;
    logData?: (data: IEngagementSingleSchema) => void;
}

export interface IEngagementExecutor extends IEngagementChain<IEngagementExecutor> {
    /**
     * Fires an Engagement events with the current contexts.
     *
     * @memberOf IEngagementExecutor
     */
    logData(data?: Partial<IEngagementSingleSchema>): void;
}

/**
 * Component which constructs and fires engagement events, using additional data extracted from engagement handlers.
 *
 * @export
 * @class EngagementHelper
 * @implements {IEngagementExecutor}
 */
export class EngagementHelper implements IEngagementExecutor {
    public contexts: IGeneralEngagementContext[];

    private _handlers: IEngagementHandler[] | Promise<IEngagementHandler[]>;

    private _logData: (data: IEngagementSingleSchema) => void;

    constructor(params: IEngagementHelperParams = {}, dependencies: IEngagementHelperDependencies = {}) {
        const {
            engagementSource: {
                contexts: [...contexts]
            } = {
                contexts: []
            },
            handlers = [],
            logData = (data: IEngagementSingleSchema) => Engagement.logData(data)
        } = dependencies;

        this.contexts = contexts;

        this._handlers = handlers;

        if (Promise.is(handlers)) {
            // If the handlers resolve soon, then subsequent engagement handling should be synchronous.
            handlers.done((handlers: IEngagementHandler[]) => this._handlers = handlers);
        }

        this._logData = logData;
    }

    /**
     * Prepends the contexts from the given source to a new engagement helper.
     */
    public fromSource(source: IEngagementSource): EngagementHelper {
        if (source) {
            return new EngagementHelper({}, {
                engagementSource: {
                    contexts: [...source.contexts, ...this.contexts]
                },
                handlers: this._handlers,
                logData: this._logData
            });
        } else {
            return this;
        }
    }

    public withPart<TName extends string, TPayload extends {}>(part: EngagementPart<TName, TPayload>, data: IEngagementInput<TPayload> = <TPayload>{}): EngagementHelper {
        const context = <IPayloadEngagementContext<TName, TPayload>>{
            ...(data || {}),
            part: part
        };

        return new EngagementHelper({}, {
            engagementSource: {
                contexts: [...this.contexts, context]
            },
            handlers: this._handlers,
            logData: this._logData
        });
    }

    public logData(data: Partial<IEngagementSingleSchema> = {}): void {
        if (Killswitch.isActivated('33E34986-33E0-4143-A531-B7E26429819D', '5/3/2017', 'If activated, reverts to a straight logging of Engagement events.')) {
            Engagement.logData(<IEngagementSingleSchema>data);
        }

        if (!this.contexts.length && !data.name) {
            return;
        }

        // Sort the contexts first by type, then by their original order.
        const sortedContexts = this.contexts.map((context: IGeneralEngagementContext, index: number) => ({
            context: context,
            order: index
        })).sort((contextA: {
            context: IGeneralEngagementContext;
            order: number;
        }, contextB: {
            context: IGeneralEngagementContext;
            order: number;
        }) => (contextA.context.part.type - contextB.context.part.type) || (contextA.order - contextB.order)).map((context: {
            context: IGeneralEngagementContext;
            order: number;
        }) => context.context);

        const {
            name = sortedContexts.map((context: IGeneralEngagementContext) => context.part.name).join('.'),
            isIntentional = false,
            extraData: { ...extraData } = {},
            experiment: { ...experiment } = {},
            ...other
        } = data;

        const engagementEvent: IEngagementSingleSchema = {
            name: name,
            isIntentional: isIntentional,
            experiment: experiment,
            extraData: extraData,
            ...other
        };

        for (const context of sortedContexts) {
            const {
                part,
                extraData = {}
            } = context;

            const payloadExtraData: {
                [key: string]: any;
            } = {};

            for (const key in extraData) {
                payloadExtraData[`${part.name}_${key}`] = extraData[key];
            }

            mergeEngagementData(engagementEvent, {
                extraData: payloadExtraData
            });

            mergeEngagementData(engagementEvent, context.part.getEngagementData(context) || {});
        }

        const logWithHandlers = (handlers: IEngagementHandler[]) => {
            for (const handler of handlers) {
                const data = handler.getEngagementData(...sortedContexts);

                if (!data) {
                    continue;
                }

                mergeEngagementData(engagementEvent, data);
            }

            this._logData(engagementEvent);
        };

        const handlers = this._handlers;

        if (Promise.is(handlers)) {
            handlers.done(logWithHandlers, () => {
                // If the handlers never load, log the event without them.
                this._logData(engagementEvent);
            });
        } else {
            logWithHandlers(handlers);
        }
    }
}

/**
 * Merges partial engagement data from a source into a target, mutating the target.
 *
 * @param target The engagement data to mutate.
 * @param source The engagement data to merge into the existing structure.
 */
export function mergeEngagementData(target: Partial<IEngagementSingleSchema>, source: Partial<IEngagementSingleSchema>) {
    const {
        extraData = {},
        experiment = {},
        ...eventData
    } = source;

    merge(target, eventData);
    extend(target.extraData, extraData);
    extend(target.experiment, experiment);
}

/**
 * Performs a simple merge of a source object's properties into a target object.
 * Source properties of values `null` and `undefined` are ignored.
 *
 * @param target Object to be extended.
 * @param source Object from which to pull values.
 */
function merge<T extends { [key: string]: any; }>(target: T, source: Partial<T>) {
    for (const key in source) {
        const sourceValue = source[key];

        if (typeof sourceValue === 'object' && sourceValue) {
            const targetValue = typeof target[key] === 'object' && target[key] || {};

            target[key] = targetValue;

            merge(targetValue, sourceValue);
        } else if (sourceValue !== undefined) {
            target[key] = sourceValue;
        }
    }
}
