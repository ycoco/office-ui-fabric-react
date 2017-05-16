import * as React from 'react';
import { GroupMembershipList} from './GroupMembershipList';
import { IGroupMemberPersona } from '../GroupMembershipPanel.Props';

export interface IGroupMembershipListProps extends React.Props<GroupMembershipList> {
    /**
     * List of group members
     */
    members?: IGroupMemberPersona[];

    /**
     * Total number of members, not all of which may be loaded into the members property yet.
     * If not provided, the component assumes the members property contains all members we wish to show.
     */
     totalNumberOfMembers?: number;

    /**
     * Callback function to render a member
     */
    onRenderPersona: (member: IGroupMemberPersona, index: number) => JSX.Element

    /**
     * Function called when user has scrolled to the end of the members list, but the total number
     * of members is greater than the number of members in the members property.
     * Signals that more members should be loaded into the members array.
     */
    onLoadMoreMembers?: () => void
}
