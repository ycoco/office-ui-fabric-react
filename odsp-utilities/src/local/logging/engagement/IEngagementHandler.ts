
import EngagementPart, { IEngagementContext } from './EngagementPart';
import { IEngagementSingleSchema } from '../events/Engagement.event';
export { IEngagementSingleSchema }

/**
 * Represents a component which attaches more data to an outgoing engagement event.
 * Such a component may extract data from its ambient environment, or from values in the engagement context itself.
 */
export interface IEngagementHandler {
    getEngagementData(...contexts: IEngagementContext<{}, EngagementPart<string, {}>>[]): Partial<IEngagementSingleSchema>;
}

export default IEngagementHandler;
