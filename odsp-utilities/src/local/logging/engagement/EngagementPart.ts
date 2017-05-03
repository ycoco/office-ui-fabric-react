
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

    constructor(name: TName, type: EngagementPartType) {
        this.name = name;
        this.type = type;
    }

    public matches(context: IEngagementContext<{} | TPayload, EngagementPart<string, TPayload>>): context is IEngagementContext<TPayload, this> {
        return context.part === this;
    }
}

export default EngagementPart;
