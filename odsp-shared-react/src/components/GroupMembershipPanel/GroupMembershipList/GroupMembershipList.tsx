import * as React from 'react';
import './GroupMembershipList.scss';
import { IGroupMembershipListProps } from './GroupMembershipList.Props';
import { IGroupMemberPersona } from '../GroupMembershipPanel.Props';
import { List } from 'office-ui-fabric-react/lib/List';
import { Spinner } from 'office-ui-fabric-react/lib/Spinner';

interface IMembersLoaderProps extends React.Props<MembersLoader> {
    onLoadMoreMembers: () => void;
}

/**
 * This helper component shows a spinner and triggers loading more members.
 */
class MembersLoader extends React.Component<IMembersLoaderProps, any> {
    constructor(props: IMembersLoaderProps) {
        super(props);
    }

    public render(): React.ReactElement<{}> {
        return <Spinner className='ms-groupMemberList-spinner' />
    }

    public componentDidMount() {
        if (this.props.onLoadMoreMembers) {
            this.props.onLoadMoreMembers();
        }
    }

}

/**
 * The group membership list component provides a virtualized list of group members.
 * It allows "lazy loading" of group members for large groups.
 */
export class GroupMembershipList extends React.Component<IGroupMembershipListProps, any> {
    constructor(props: IGroupMembershipListProps) {
        super(props);
    }

    public render(): React.ReactElement<{}> {
        // If the total number of members exceeds the length of the members list, and
        // we have a callback to load more members, push a null flag onto the end of the members
        // list to indicate when we need to load more members.
        let membersFormatted: IGroupMemberPersona[] = [];
        if (this.props.members) {
            membersFormatted = this.props.members;
            if(this.props.onLoadMoreMembers && this.props.totalNumberOfMembers > this.props.members.length) {
                // Use concatenation to avoid altering array that was passed in.
                membersFormatted = membersFormatted.concat([null]);
            }
        }

        return (
            <List
                items = { membersFormatted }
                onRenderCell = { (item, index) => (
                    (item) ? (
                        this.props.onRenderPersona(item, index)
                        ) : (
                        <MembersLoader onLoadMoreMembers = { this.props.onLoadMoreMembers }/>
                        ))}
            />
        )
    }
}
