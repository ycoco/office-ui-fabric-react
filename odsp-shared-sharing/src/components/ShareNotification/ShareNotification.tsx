import './ShareNotification.scss';
import { ISharingLink, ISharingLinkSettings, IShareStrings, ShareEndPointType, ISharingInformation } from '../../interfaces/SharingInterfaces';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { ShareHint } from '../ShareHint/ShareHint';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import * as React from 'react';

export interface IShareNotificationProps {
    companyName: string;
    currentSettings: ISharingLinkSettings;
    isCopy: boolean; // TODO (joem): See comment in ShareCallout about robustness.
    sharingInformation: ISharingInformation;
    sharingLinkCreated: ISharingLink; // The link created by the UI.
    onShareHintClicked: () => void;
}

export class ShareNotification extends React.Component<IShareNotificationProps, {}> {
    private _strings: IShareStrings;

    static contextTypes = {
        strings: React.PropTypes.object.isRequired
    };

    public refs: {
        [key: string]: React.ReactInstance,
        sharingLinkInput: TextField
    };

    constructor(props: IShareNotificationProps, context: any) {
        super(props);

        this._strings = context.strings;
    }

    public componentDidMount() {
        // Attempt to copy.
        try {
            this.refs.sharingLinkInput.select();
            document.execCommand('copy');
        } catch (error) {
            // Nothing.
        }

        // Attempt to copy to clipboard via external JavaScript.
        try {
            const externalJavaScript: any = window.external;
            externalJavaScript.CopyToClipboard(this.props.sharingLinkCreated.url);
        } catch (error) {
            // Nothing.
        }
    }

    public render(): React.ReactElement<{}> {
        return (
            <div className='od-ShareNotification'>
                <div className='od-ShareNotification-icon'>
                    <i className='ms-Icon ms-Icon--CheckMark'></i>
                </div>
                <div className='od-ShareNotification-content'>
                    <div className='ms-font-l'>{this._getNotificationLabel()}</div>
                    <div className='od-ShareNotification-urlText'>
                        <TextField
                            ref='sharingLinkInput'
                            type='text'
                            value={this.props.sharingLinkCreated.url}
                            underlined={true}
                        />
                    </div>
                </div>
                {this._renderShareHint()}
            </div>
        );
    }

    private _renderShareHint(): JSX.Element {
        const props = this.props;

        return (
            <div className='od-ShareNotification-footer'>
                <ShareHint
                    companyName={props.companyName}
                    currentSettings={props.currentSettings}
                    sharingInformation={props.sharingInformation}
                    onShareHintClick={props.onShareHintClicked}
                />
            </div>
        );
    }

    private _getNotificationLabel(): string {
        const strings = this._strings;
        return this.props.isCopy ? strings.notificationCopied : strings.notificationSent;
    }
}