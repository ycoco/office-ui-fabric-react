
import { EngagementPart, EngagementPartType } from '../EngagementPart';

/**
 * Event part for a user click.
 */
export const clickEngagementPart: EngagementPart<'Click', {}> = new EngagementPart<'Click', {}>('Click', EngagementPartType.event);

/**
 * Event part for a user key press.
 */
export const keyPressEngagementPart: EngagementPart<'KeyPress', {}> = new EngagementPart<'KeyPress', {}>('KeyPress', EngagementPartType.event);

/**
 * Event part for a user drop.
 */
export const dropEngagementPart: EngagementPart<'Drop', {}> = new EngagementPart<'Drop', {}>('Drop', EngagementPartType.event);
