
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
    public readonly name: TName;
    public readonly type: EngagementPartType;

    /**
     * The type of context used for this part.
     * Access via `typeof part.context`.
     *
     * @type {IEngagementContext<TPayload, this>}
     * @memberOf EngagementPart
     */
    public readonly context: IEngagementContext<TPayload, this>;

    constructor(name: TName, type: EngagementPartType, options: IEngagementPartOptions<TName, TPayload> = {}) {
        this.name = name;
        this.type = type;

        const {
            getEngagementData
        } = options;

        if (getEngagementData) {
            this.getEngagementData = getEngagementData;
        }
    }

    /**
     * Determines whether or not a given context matches this part and its payload type.
     * If the context matches, then its payload type is inferred from the part type.
     *
     * @param {(IEngagementContext<{} | TPayload, EngagementPart<string, {} | TPayload>>)} context A context to test against this part.
     * @returns {context is IEngagementContext<TPayload, this>} Whether or the context is for this part and payload type.
     *
     * @memberOf EngagementPart
     */
    public matches(context: IEngagementContext<{} | TPayload, EngagementPart<string, {} | TPayload>>): context is IEngagementContext<TPayload, this> {
        return context.part === this;
    }

    /**
     * Gets any engagement data which can be extracted from a context for this part.
     *
     * @param {IEngagementContext<TPayload, this>} context A context from which to extract engagement data.
     * @returns {Partial<IEngagementSingleSchema>} Engagement schema data extracted from the context.
     *
     * @memberOf EngagementPart
     */
    public getEngagementData(context: IEngagementContext<TPayload, this>): Partial<IEngagementSingleSchema> {
        return {};
    }
}

export interface IEngagementChain extends IEngagementSource {
    fromSource(source: IEngagementSource): this;
    withPart<TName extends string, TPayload extends {}>(part: EngagementPart<TName, TPayload>, data?: IEngagementInput<TPayload>): this;
}

export interface IEngagementBuilder extends IEngagementChain {
    // Nothing added.
}

export interface IEngagementBuilderParams {
    // Nothing presently.
}

export interface IEngagementBuilderDependencies {
    engagementSource?: IEngagementSource;
}

export type IGeneralEngagementContext = IEngagementContext<{}, EngagementPart<string, {}>>;

export type IPayloadEngagementContext<TName extends string, TPayload> = IEngagementContext<TPayload, EngagementPart<TName, TPayload>>;

/**
 * Class used for building or operating engagement sources, which are stacks of engagement contexts.
 *
 * @export
 * @class EngagementBuilder
 * @implements {IEngagementBuilder}
 */
export class EngagementBuilder implements IEngagementBuilder {
    public contexts: IGeneralEngagementContext[];

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

    /**
     * Prepends the given contexts onto the stack for this source, creating a new source.
     *
     * @param {IEngagementSource} source The source to prepend to this source.
     * @returns {this} A new source with the contexts prepended.
     *
     * @memberOf EngagementBuilder
     */
    public fromSource(source: IEngagementSource): this {
        if (source) {
            return this.clone([...source.contexts, ...this.contexts]);
        } else {
            return this;
        }
    }

    /**
     * Appends a new context to the stack for this source for a part and optional data, creating a new source.
     *
     * @template TName The name of the part to append.
     * @template TPayload The payload type for the part to append.
     * @param {EngagementPart<TName, TPayload>} part The part for which to create a new context.
     * @param {IEngagementInput<TPayload>} [data=<TPayload>{}] The data for the context payload.
     * @returns {this} A new engagement source with the part appended.
     *
     * @memberOf EngagementBuilder
     */
    public withPart<TName extends string, TPayload extends {}>(part: EngagementPart<TName, TPayload>, data: IEngagementInput<TPayload> = <TPayload>{}): this {
        if (part) {
            const context = <IPayloadEngagementContext<TName, TPayload>>{
                ...(data || {}),
                part: part
            };

            return this.clone([...this.contexts, context]);
        } else {
            return this;
        }
    }

    /**
     * Produces a new instance of this type with the given starting contexts.
     *
     * @protected
     * @param {IGeneralEngagementContext[]} contexts The starting contexts for the new source.
     * @returns {this} A new instance of this type.
     *
     * @memberOf EngagementBuilder
     */
    protected clone(contexts: IGeneralEngagementContext[]): this {
        return <this>(new EngagementBuilder({}, {
            engagementSource: {
                contexts: contexts
            }
        }));
    }
}

export const ENGAGEMENT_ROOT: IEngagementBuilder = new EngagementBuilder();
