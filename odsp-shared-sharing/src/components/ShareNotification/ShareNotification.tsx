import './ShareNotification.scss';
import { ISharingLink, ISharingLinkSettings, IShareStrings, ShareEndPointType } from '../../interfaces/SharingInterfaces';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { ShareHint } from '../ShareHint/ShareHint';
import * as React from 'react';

export interface IShareNotificationProps {
    companyName: string;
    currentSettings: ISharingLinkSettings;
    isCopy: boolean; // TODO (joem): See comment in ShareCallout about robustness.
    sharingLinkCreated: ISharingLink; // The link created by the UI.
}

export class ShareNotification extends React.Component<IShareNotificationProps, {}> {
    private _strings: IShareStrings;

    static contextTypes = {
        strings: React.PropTypes.object.isRequired
    };

    constructor(props: IShareNotificationProps, context: any) {
        super(props);

        this._strings = context.strings;
    }

    public render(): React.ReactElement<{}> {
        return (
            <div className='od-ShareNotification'>
                <div className='od-ShareNotification-icon'>
                    <i className='ms-Icon ms-Icon--CheckMark'></i>
                </div>
                <div className='od-ShareNotification-content'>
                    <div className='ms-font-l'>{this._getNotificationLabel()}</div>
                    <input
                        type="text"
                        className='od-ShareNotification-urlText'
                        value={this.props.sharingLinkCreated.url}
                    />
                </div>
                {this._renderShareHint()}
            </div>
        );
    }

    private _renderShareHint(): JSX.Element {
        return (
            <div className='od-ShareNotification-footer'>
                <ShareHint
                    companyName={this.props.companyName}
                    currentSettings={this.props.currentSettings}
                />
            </div>
        );
    }

    private _getNotificationLabel(): string {
        const strings = this._strings;
        return this.props.isCopy ? strings.notificationCopied : strings.notificationSent;
    }
}