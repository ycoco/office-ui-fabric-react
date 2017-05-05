
import { EngagementPart, IPayloadEngagementContext, IGeneralEngagementContext } from './EngagementPart';

export * from './EngagementHelper';
export * from './EngagementPart';
export * from './IEngagementHandler';
export * from './parts/EventEngagementParts';

export function getFirstMatchingContext<TName extends string, TPayload>(part: EngagementPart<TName, TPayload>, contexts: IGeneralEngagementContext[]): IPayloadEngagementContext<TName, TPayload> {
    for (let i = contexts.length - 1; i >= 0; i--) {
        const context = contexts[i];

        if (part.matches(context)) {
            return context;
        }
    }
}
