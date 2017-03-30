import './ShareMain.scss';
import { Header } from '../Header/Header';
import { ISharingInformation, ISharingLinkSettings, IShareStrings, ISharingItemInformation, ShareEndPointType } from '../../interfaces/SharingInterfaces';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { SendLink } from '../SendLink/SendLink';
import { ShareEndPoints } from './ShareEndPoints/ShareEndPoints';
import { ShareHint } from '../ShareHint/ShareHint';
import { SharePolicyMessage } from './SharePolicyMessage/SharePolicyMessage';
import { ShareViewState } from '../Share/Share';
import { Spinner, SpinnerType } from 'office-ui-fabric-react/lib/Spinner';
import * as React from 'react';

export interface IShareMainProps {
    currentSettings: ISharingLinkSettings;
    item: ISharingItemInformation;
    onShareHintClicked: () => void;
    onCopyLinkClicked: () => void;
    onSendLinkClicked: (recipients: any, message: string) => void;
    onShowPermissionsListClicked: () => void;
    onPolicyClick: () => void;
    sharingInformation: ISharingInformation;
    onSelectedPeopleChange: (items: Array<any>) => void;
}

export interface IShareMainState {
    showActivityIndicator: boolean;
    isCopy: boolean;
}

export class ShareMain extends React.Component<IShareMainProps, IShareMainState> {
    private _endPointType: number;
    private _strings: IShareStrings;

    static contextTypes = {
        strings: React.PropTypes.object.isRequired
    };

    constructor(props: IShareMainProps, context: any) {
        super(props);

        this._strings = context.strings;

        this.state = {
            showActivityIndicator: false,
            isCopy: false
        };

        this._onCopyLinkClicked = this._onCopyLinkClicked.bind(this);
        this._onSendLinkClicked = this._onSendLinkClicked.bind(this);
    }

    public render(): React.ReactElement<{}> {
        const blockerClass: string = this.state.showActivityIndicator ? ' blocker' : '';
        const props = this.props;

        return (
            <div className={ 'od-ShareMain' + blockerClass }>
                <Header
                    item={ props.item }
                    onManageExistingAccessClick={ this.props.onShowPermissionsListClicked }
                    showItemName={ true }
                    viewState={ ShareViewState.DEFAULT }
                />
                <div>
                    <div className='od-ShareMain-section full-bleed'>
                        <ShareHint
                            companyName={ props.sharingInformation.companyName }
                            currentSettings={ props.currentSettings }
                            onShareHintClick={ props.onShareHintClicked }
                            sharingInformation={ props.sharingInformation }
                        />
                    </div>
                </div>
                { this._renderSharePolicyMessage() }
                { this._renderSendLink() }
                { this._renderEndPoints() }
                { this._renderActivityIndicator() }
            </div>
        );
    }

    private _renderSharePolicyMessage() {
        // TODO (joem): Remove once DLP is integrated fully.
        const showDlp = false;
        if (showDlp) {
            return (
                <SharePolicyMessage onClick={ this.props.onPolicyClick } />
            );
        }
    }

    private _renderEndPoints(): JSX.Element {
        return (
            <div className='od-ShareMain-endPoints'>
                <ShareEndPoints
                    onCopyLinkClicked={ this._onCopyLinkClicked }
                />
            </div>
        );
    }

    private _renderFooter(): JSX.Element {
        return (
            <div className='od-ShareMain-footer' onClick={ this.props.onShowPermissionsListClicked }>
                <div className='od-ShareMain-footerLabel ms-font-s-plus'>
                    { this._strings.permissionsLabel }
                </div>
                <div className='od-ShareMain-footerIcon'>
                    <i className='ms-Icon ms-Icon--ChevronRight'></i>
                </div>
            </div>
        );
    }

    private _renderSendLink(): JSX.Element {
        return (
            <div className='od-ShareMain-section'>
                <SendLink
                    ctaLabel={ this._strings.sendButtonLabel }
                    showTextArea={ true }
                    sharingInformation={ this.props.sharingInformation }
                    onSendLinkClicked={ this._onSendLinkClicked }
                    currentSettings={ this.props.currentSettings }
                    onSelectedPeopleChange={ this.props.onSelectedPeopleChange }
                />
            </div>
        );
    }

    private _renderActivityIndicator(): React.ReactElement<{}> {
        if (this.state.showActivityIndicator) {
            return (
                <div className='od-Share-activityIndicator'>
                    <div className='od-ShareMain-spinner'>
                        <Spinner type={ SpinnerType.large } />
                    </div>
                    <Label>{ this._getActivityMessage() }</Label>
                </div>
            );
        }
    }

    private _onCopyLinkClicked(): void {
        this.setState({
            ...this.state,
            showActivityIndicator: true,
            isCopy: true
        });

        this.props.onCopyLinkClicked();
    }

    private _onSendLinkClicked(recipients: any, message: string): void {
        this.setState({
            ...this.state,
            showActivityIndicator: true,
            isCopy: false
        });

        this.props.onSendLinkClicked(recipients, message);
    }

    private _getActivityMessage(): string {
        const strings = this._strings;
        return this.state.isCopy ? strings.activityMessageCreatingLink : strings.activityMessageSendingMail;
    }
}
