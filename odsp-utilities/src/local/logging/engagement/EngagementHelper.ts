
import IEngagementHandler from './IEngagementHandler';
import EngagementPart, { IEngagementInput, IEngagementContext } from './EngagementPart';
import { Engagement, IEngagementSingleSchema } from '../events/Engagement.event';
import { extend } from '../../object/ObjectUtil';
import { Killswitch } from '../../killswitch/Killswitch';

export interface IEngagementSource {
    /**
     * A list of engagement contexts to be used for fired events.
     *
     * @type {IEngagementContext[]}
     * @memberOf IChainableEngagement
     */
    contexts: IEngagementContext<{}, EngagementPart<string, {}>>[];
}

export interface IEngagementHelperParams {
    // None presently.
}

export interface IEngagementHelperDependencies {
    /**
     * Handlers to use for data extraction from the context for engagement events.
     *
     * @type {IEngagementHandler[]}
     * @memberOf IEngagementHelperDependencies
     */
    handlers?: IEngagementHandler[];
    engagementSource?: IEngagementSource;
    logData?: (data: IEngagementSingleSchema) => void;
}

export interface IEngagementChain<TReturn> extends IEngagementSource {
    fromSource(source: IEngagementSource): IEngagementChain<TReturn>;
    withPart<TName extends string, TPayload extends {}>(part: EngagementPart<TName, TPayload>, data?: IEngagementInput<TPayload>): IEngagementChain<TReturn>;
}

export interface IEngagementBuilder extends IEngagementChain<IEngagementBuilder> {
    // Nothing added.
}

export interface IEngagementExecutor extends IEngagementChain<IEngagementExecutor> {
    /**
     * Fires an Engagement events with the current contexts.
     *
     * @memberOf IEngagementExecutor
     */
    logData(data?: Partial<IEngagementSingleSchema>): void;
}

interface IEngagementBuilderParams {
    // Nothing presently.
}

interface IEngagementBuilderDependencies {
    engagementSource?: IEngagementSource;
}

type PayloadEngagementContext<TName extends string, TPayload> = IEngagementContext<TPayload, EngagementPart<TName, TPayload>>;
type GenericEngagementContext = IEngagementContext<{}, EngagementPart<string, any>>;

class EngagementBuilder implements IEngagementBuilder {
    public contexts: IEngagementContext<{}, EngagementPart<string, {}>>[];

    constructor(params: IEngagementBuilderParams = {}, dependencies: IEngagementBuilderDependencies = {}) {
        const {
            engagementSource: {
                contexts: [...contexts]
            } = {
                contexts: []
            }
        } = dependencies;

        this.contexts = contexts;
    }

    public fromSource(source: IEngagementSource): EngagementBuilder {
        if (source) {
            return new EngagementBuilder({}, {
                engagementSource: {
                    contexts: [...source.contexts, ...this.contexts]
                }
            });
        } else {
            return this;
        }
    }

    public withPart<TName extends string, TPayload extends {}>(part: EngagementPart<TName, TPayload>, data: IEngagementInput<TPayload> = <TPayload>{}): EngagementBuilder {
        const context = <PayloadEngagementContext<TName, TPayload>>{
            ...(data || {}),
            part: part
        };

        return new EngagementBuilder({}, {
            engagementSource: {
                contexts: [...this.contexts, context]
            }
        });
    }
}

/**
 * Component which constructs and fires engagement events, using additional data extracted from engagement handlers.
 *
 * @export
 * @class EngagementHelper
 * @implements {IEngagementExecutor}
 */
export class EngagementHelper implements IEngagementExecutor {
    public contexts: IEngagementContext<{}, EngagementPart<string, {}>>[];

    private _handlers: IEngagementHandler[];

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
        const context = <PayloadEngagementContext<TName, TPayload>>{
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
        const sortedContexts = this.contexts.map((context: GenericEngagementContext, index: number) => ({
            context: context,
            order: index
        })).sort((contextA: {
            context: GenericEngagementContext;
            order: number;
        }, contextB: {
            context: GenericEngagementContext;
            order: number;
        }) => (contextA.context.part.type - contextB.context.part.type) || (contextA.order - contextB.order)).map((context: {
            context: GenericEngagementContext;
            order: number;
        }) => context.context);

        const {
            name = sortedContexts.map((context: GenericEngagementContext) => context.part.name).join('.'),
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

            extend(engagementEvent.extraData, payloadExtraData);
        }

        for (const handler of this._handlers) {
            const data = handler.getEngagementData(...sortedContexts);

            if (!data) {
                continue;
            }

            const {
                extraData = {},
                experiment = {},
                ...eventData
            } = data;

            merge(engagementEvent, eventData);
            extend(engagementEvent.extraData, extraData);
            extend(engagementEvent.experiment, experiment);
        }

        this._logData(engagementEvent);
    }
}

/**
 * Performs a simple merge of a source object's properties into a target object.
 * Source properties of values `null` and `undefined` are ignored.
 *
 * @param target Object to be extended.
 * @param source Object from which to pull values.
 */
function merge(target: { [key: string]: any; }, source: { [key: string]: any; }) {
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

export const ENGAGEMENT_ROOT: IEngagementBuilder = new EngagementBuilder();

export default EngagementHelper;
