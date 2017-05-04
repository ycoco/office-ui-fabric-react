
import { IEngagementSingleSchema } from '../events/Engagement.event';

/**
 * The possible types for engagement parts.
 * The values determine the sort order.
 *
 * @export
 * @enum {number}
 */
export const enum EngagementPartType {
    unknown = 0,
    subject = 1,
    intent = 2,
    component = 3,
    event = 4,
    error = 5
}

export type IEngagementInput<TPayload> = TPayload & {
    extraData?: {
        [key: string]: any;
    };
};

export type IEngagementContext<TPayload extends {}, TPart extends EngagementPart<string, TPayload>> = IEngagementInput<TPayload> & {
    part: TPart;
};

export interface IEngagementSource {
    /**
     * A list of engagement contexts to be used for fired events.
     *
     * @type {IEngagementContext[]}
     * @memberOf IChainableEngagement
     */
    contexts: IEngagementContext<{}, EngagementPart<string, {}>>[];
}

export interface IEngagementPartOptions<TName extends string, TPayload extends {}> {
    getEngagementData?(context: IEngagementContext<TPayload, EngagementPart<TName, TPayload>>): Partial<IEngagementSingleSchema>;
}

/**
 * Defines an engagement part which can be used to build a context for engagement events.
 *
 * @export
 * @class EngagementPart
 * @template TName The name of the part to be included in the event data. This must be a string literal.
 * @template TPayload The schema for any required data to be passed along to handlers when processing the part.
 */
export class EngagementPart<TName extends string, TPayload extends {}> {
    public name: TName;
    public type: EngagementPartType;

    public context: IEngagementContext<TPayload, this>;

    constructor(name: TName, type: EngagementPartType, options: IEngagementPartOptions<TName, TPayload> = {}) {
        this.name = name;
        this.type = type;

        const {
            getEngagementData = this.getEngagementData
        } = options;

        this.getEngagementData = getEngagementData;
    }

    public matches(context: IEngagementContext<{} | TPayload, EngagementPart<string, {} | TPayload>>): context is IEngagementContext<TPayload, this> {
        return context.part === this;
    }

    public getEngagementData(context: IEngagementContext<TPayload, this>): Partial<IEngagementSingleSchema> {
        return {};
    }
}

export interface IEngagementChain<TReturn> extends IEngagementSource {
    fromSource(source: IEngagementSource): IEngagementChain<TReturn>;
    withPart<TName extends string, TPayload extends {}>(part: EngagementPart<TName, TPayload>, data?: IEngagementInput<TPayload>): IEngagementChain<TReturn>;
}

export interface IEngagementBuilder extends IEngagementChain<IEngagementBuilder> {
    // Nothing added.
}

interface IEngagementBuilderParams {
    // Nothing presently.
}

interface IEngagementBuilderDependencies {
    engagementSource?: IEngagementSource;
}

export type IPayloadEngagementContext<TName extends string, TPayload> = IEngagementContext<TPayload, EngagementPart<TName, TPayload>>;

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
        const context = <IPayloadEngagementContext<TName, TPayload>>{
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

export const ENGAGEMENT_ROOT: IEngagementBuilder = new EngagementBuilder();
