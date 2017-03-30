import * as React from 'react';
import { Button } from 'office-ui-fabric-react/lib/Button';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';

export interface ISharePolicyMessage {
    onClick: () => void;
}

// TODO (joem): Localization needs to be done for strings that aren't returned from the API.
export class SharePolicyMessage extends React.Component<ISharePolicyMessage, {}> {
    public render(): React.ReactElement<{}> {
        return (
            <MessageBar
                messageBarType={ MessageBarType.warning }>
                This item contains sensitive information. It can't be shared with people outside your organization.
        <Link onClick={ this.props.onClick }>View policy tip</Link>
            </MessageBar>
        );
    }
}