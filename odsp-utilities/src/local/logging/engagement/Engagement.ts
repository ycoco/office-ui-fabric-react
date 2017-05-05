
import { EngagementPart, IPayloadEngagementContext, IGeneralEngagementContext } from './EngagementPart';

export * from './EngagementHelper';
export * from './EngagementPart';
export * from './IEngagementHandler';
export * from './parts/EventEngagementParts';

/**
 * Gets the most-specific context from an engagement context stack which matches a given part.
 * Use this utility method within an `IEngagementHandler` implementation to identify a single context
 * which matches a part.
 *
 * Most implementations of `IEngagementHandler` should generally combine values from recognized contexts,
 * though that might not be semantically correct for some scenarios or data types.
 *
 * @export
 * @template TName The name of the part to find.
 * @template TPayload The payload type for the part to find.
 * @param {EngagementPart<TName, TPayload>} part The part for which to find a matching context.
 * @param {IGeneralEngagementContext[]} contexts A sorted set of contexts for an engagement event, least-specific to most-specific.
 * @returns {IPayloadEngagementContext<TName, TPayload>} The most-specific context in the stack which matches the given part.
 */
export function getMostSpecificMatchingContext<TName extends string, TPayload>(part: EngagementPart<TName, TPayload>, contexts: IGeneralEngagementContext[]): IPayloadEngagementContext<TName, TPayload> {
    for (let i = contexts.length - 1; i >= 0; i--) {
        const context = contexts[i];

        if (part.matches(context)) {
            return context;
        }
    }
}
