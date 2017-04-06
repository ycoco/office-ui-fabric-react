import './ShareMain.scss';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';
import { Callout, DirectionalHint } from 'office-ui-fabric-react/lib/Callout';
import { ContextualMenu } from 'office-ui-fabric-react/lib/ContextualMenu';
import { Header } from '../Header/Header';
import { ISharingInformation, ISharingLinkSettings, IShareStrings, ISharingItemInformation, ShareEndPointType, ClientId, ShareType } from '../../interfaces/SharingInterfaces';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { SendLink } from '../SendLink/SendLink';
import { ShareEndPoints } from './ShareEndPoints/ShareEndPoints';
import { ShareHint } from '../ShareHint/ShareHint';
import { SharePolicyMessage } from './SharePolicyMessage/SharePolicyMessage';
import { ShareViewState } from '../Share/Share';
import { Spinner, SpinnerType } from 'office-ui-fabric-react/lib/Spinner';
import * as React from 'react';
import AttachAsCopyHelper from '../../utilities/AttachAsCopyHelper';
import ClientIdHelper from '../../utilities/ClientIdHelper';

export interface IShareMainProps {
    clientId: ClientId;
    companyName: string;
    currentSettings: ISharingLinkSettings;
    item: ISharingItemInformation;
    onShareHintClicked: () => void;
    onCopyLinkClicked: () => void;
    onOutlookClicked: () => void;
    onSendLinkClicked: (recipients: any, message: string) => void;
    onShowPermissionsListClicked: () => void;
    onPolicyClick: () => void;
    sharingInformation: ISharingInformation;
    onSelectedPeopleChange: (items: Array<any>) => void;
}

export interface IShareMainState {
    isAttachAsCopyContextualMenuVisible: boolean;
    shareType: ShareType;
    showActivityIndicator: boolean;
    dismissingFooterContextualMenu: boolean;
}

export class ShareMain extends React.Component<IShareMainProps, IShareMainState> {
    private _endPointType: number;
    private _strings: IShareStrings;
    private _footer: HTMLElement;

    static contextTypes = {
        strings: React.PropTypes.object.isRequired
    };

    constructor(props: IShareMainProps, context: any) {
        super(props);

        this._strings = context.strings;

        this.state = {
            isAttachAsCopyContextualMenuVisible: false,
            shareType: ShareType.share,
            showActivityIndicator: false,
            dismissingFooterContextualMenu: false
        };
    }

    public render(): React.ReactElement<{}> {
        const blockerClass: string = this.state.showActivityIndicator ? ' blocker' : '';
        const props = this.props;

        return (
            <div className={ 'od-ShareMain' + blockerClass }>
                <Header
                    clientId={ props.clientId }
                    item={ props.item }
                    onManageExistingAccessClick={ this.props.onShowPermissionsListClicked }
                    viewState={ ShareViewState.DEFAULT }
                />
                <div>
                    <div className='od-ShareMain-section full-bleed'>
                        <ShareHint
                            companyName={ props.companyName }
                            currentSettings={ props.currentSettings }
                            onShareHintClick={ props.onShareHintClicked }
                            sharingInformation={ props.sharingInformation }
                        />
                    </div>
                </div>
                { this._renderSharePolicyMessage() }
                { this._renderSendLink() }
                { this._renderEndPoints() }
                { this._renderFooter() }
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
                    clientId={ this.props.clientId }
                    onCopyLinkClicked={ this._onCopyLinkClicked }
                    onOutlookClicked={ this._onOutlookClicked }
                />
            </div>
        );
    }

    @autobind
    private _onFooter(element: HTMLElement): any {
        this._footer = element;
    }

    @autobind
    private _onDismissAttachAsCopyContextualMenu(ev: React.SyntheticEvent<{}>) {
        // If the event target is the button to show the context menu, track that so
        // the context menu is truly dismissed and not immediately reopened.
        const clickOnFooter = (ev.target === this._footer) || (ev.target === this._footer.parentElement);

        this.setState({
            ...this.state,
            isAttachAsCopyContextualMenuVisible: false,
            dismissingFooterContextualMenu: clickOnFooter
        }, () => {});
    }

    private _renderFooter(): JSX.Element {
        const props = this.props;
        const clientId = props.clientId;

        if (ClientIdHelper.isOfficeProduct(clientId)) {
            const attachmentOptions = AttachAsCopyHelper.getAttachAsCopyOptions(clientId, this._strings);

            if (attachmentOptions.length > 0) {
                return (
                    <div>
                    <button
                        className='od-ShareMain-footer'
                        onClick={ this._onAttachAsCopyClicked }
                    >
                        <div className='od-ShareMain-attachIcon'>
                            <i className='ms-Icon ms-Icon--Attach'></i>
                        </div>
                        <span ref={ this._onFooter }>{ this._strings.attachACopyInstead }</span>
                    </button>
                    { this.state.isAttachAsCopyContextualMenuVisible && (
                        <ContextualMenu
                            className='od-ShareMain-attachmentOptions'
                            directionalHint={ DirectionalHint.topCenter }
                            items={ attachmentOptions }
                            onDismiss={ this._onDismissAttachAsCopyContextualMenu }
                            target={ this._footer }
                            isBeakVisible={ true }
                        />
                    ) }
                    </div>
                );
            }
        }
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

    @autobind
    private _onOutlookClicked(): void {
        this.setState({
            ...this.state,
            showActivityIndicator: true,
            shareType: ShareType.outlook
        });

        this.props.onOutlookClicked();
    }

    @autobind
    private _onCopyLinkClicked(): void {
        this.setState({
            ...this.state,
            showActivityIndicator: true,
            shareType: ShareType.copy
        });

        this.props.onCopyLinkClicked();
    }

    @autobind
    private _onSendLinkClicked(recipients: any, message: string): void {
        this.setState({
            ...this.state,
            showActivityIndicator: true,
            shareType: ShareType.share
        });

        this.props.onSendLinkClicked(recipients, message);
    }

    @autobind
    private _onAttachAsCopyClicked() {
        const showContextualMenu = !this.state.dismissingFooterContextualMenu;

        this.setState({
            ...this.state,
            isAttachAsCopyContextualMenuVisible: showContextualMenu,
            dismissingFooterContextualMenu: false
        }, () => {});
    }

    private _getActivityMessage(): string {
        const strings = this._strings;

        switch (this.state.shareType) {
            case ShareType.share:
                return strings.activityMessageSendingMail;
            case ShareType.copy:
            case ShareType.outlook:
                return strings.activityMessageCreatingLink;
            default:
                return strings.activityMessageCreatingLink;
        }
    }
}
