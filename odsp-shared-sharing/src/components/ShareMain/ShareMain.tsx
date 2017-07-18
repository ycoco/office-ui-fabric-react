import './ShareMain.scss';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';
import { Callout, DirectionalHint } from 'office-ui-fabric-react/lib/Callout';
import { ContextualMenu } from 'office-ui-fabric-react/lib/ContextualMenu';
import { Header } from '../Header/Header';
import {
    ISharingInformation, ISharingLinkSettings, IShareStrings, ISharingItemInformation,
    ClientId, ShareType, SharingAudience, AccessStatus
} from '../../interfaces/SharingInterfaces';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { SendLink } from '../SendLink/SendLink';
import { ShareTargets } from './ShareTargets/ShareTargets';
import { ShareHint } from '../ShareHint/ShareHint';
import { ShareViewState } from '../Share/Share';
import { Spinner, SpinnerType } from 'office-ui-fabric-react/lib/Spinner';
import * as React from 'react';
import AttachAsCopyHelper from '../../utilities/AttachAsCopyHelper';
import * as ClientIdHelper from '../../utilities/ClientIdHelper';
import { IPerson } from '@ms/odsp-datasources/lib/PeoplePicker';

export interface IShareMainProps {
    clientId: ClientId;
    companyName: string;
    currentSettings: ISharingLinkSettings;
    item: ISharingItemInformation;
    onShareHintClicked: () => void;
    onSendLinkClicked: (message: string) => void;
    onShowPermissionsListClicked: () => void;
    onPolicyClick: () => void;
    sharingInformation: ISharingInformation;
    onSelectedPeopleChange: (items: Array<any>) => void;
    groupsMemberCount: number;
    onViewPolicyTipClicked: () => void;
    linkRecipients: Array<IPerson>;
    permissionsMap: { [index: string]: AccessStatus };
    messageText: string;
    onSendLinkMessageChange: (messageText: string) => void;
    onShareTargetClicked: (shareType: ShareType) => void;
    onShareTargetsRendered: (shareTargets: Array<ShareType>) => void;
}

export interface IShareMainState {
    isAttachAsCopyContextualMenuVisible: boolean;
    shareType: ShareType;
    showActivityIndicator: boolean;
    dismissingFooterContextualMenu: boolean;
}

export class ShareMain extends React.Component<IShareMainProps, IShareMainState> {
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
                    viewState={ ShareViewState.default }
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
                { this._renderSendLink() }
                { this._renderTargets() }
                { this._renderFooter() }
                { this._renderActivityIndicator() }
            </div>
        );
    }

    private _renderTargets(): JSX.Element {
        return (
            <div className='od-ShareMain-targets'>
                <ShareTargets
                    clientId={ this.props.clientId }
                    onShareTargetClicked={ this._onShareTargetClicked }
                    onShareTargetsRendered={ this.props.onShareTargetsRendered }
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
        }, () => { });
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
        } else if (clientId === ClientId.ngsc && this._isSendCopyEnabled()) {
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
                </div>
            );
        }
    }

    private _renderSendLink(): JSX.Element {
        if (!this.props.sharingInformation.blockPeoplePickerAndSharing) {
            const props = this.props;

            return (
                <div className='od-ShareMain-section'>
                    <SendLink
                        ctaLabel={ this._strings.sendButtonLabel }
                        showTextArea={ true }
                        sharingInformation={ props.sharingInformation }
                        onSendLinkClicked={ this._onSendLinkClicked }
                        currentSettings={ props.currentSettings }
                        onSelectedPeopleChange={ props.onSelectedPeopleChange }
                        groupsMemberCount={ props.groupsMemberCount }
                        onViewPolicyTipClicked={ props.onViewPolicyTipClicked }
                        linkRecipients={ props.linkRecipients }
                        permissionsMap={ props.permissionsMap }
                        messageText={ props.messageText }
                        onSendLinkMessageChange={ props.onSendLinkMessageChange }
                    />
                </div>
            );
        }
    }

    private _renderActivityIndicator(): React.ReactElement<{}> {
        if (this.state.showActivityIndicator) {
            return (
                <div className='od-Share-activityIndicator' aria-live='aggressive'>
                    <div className='od-ShareMain-spinner'>
                        <Spinner type={ SpinnerType.large } />
                    </div>
                    <span role='alert'>{ this._getActivityMessage() }</span>
                </div>
            );
        }
    }

    @autobind
    private _onShareTargetClicked(shareType: ShareType): void {
        this.setState({
            ...this.state,
            showActivityIndicator: true,
            shareType: shareType
        });

        this.props.onShareTargetClicked(shareType);
    }

    @autobind
    private _onSendLinkClicked(message: string): void {
        this.setState({
            ...this.state,
            showActivityIndicator: true,
            shareType: ShareType.share
        });

        this.props.onSendLinkClicked(message);
    }

    @autobind
    private _onAttachAsCopyClicked() {
        const clientId = this.props.clientId;

        if (ClientIdHelper.isOfficeProduct(clientId)) {
            const showContextualMenu = !this.state.dismissingFooterContextualMenu;
            this.setState({
                ...this.state,
                isAttachAsCopyContextualMenuVisible: showContextualMenu,
                dismissingFooterContextualMenu: false
            }, () => { });
        } else if (clientId === ClientId.ngsc) {
            try {
                const externalJavaScript: any = window.external;
                externalJavaScript.SendCopy();
            } catch (error) {
                // Nothing.
            }
        }
    }

    private _getActivityMessage(): string {
        const strings = this._strings;

        switch (this.state.shareType) {
            case ShareType.share:
                return strings.activityMessageSendingMail;
            case ShareType.copy:
            case ShareType.outlook:
            case ShareType.nonOutlook:
            case ShareType.moreApps:
                return strings.activityMessageCreatingLink;
            default:
                return strings.activityMessageCreatingLink;
        }
    }

    private _isSendCopyEnabled(): boolean {
        try {
            const externalJavaScript: any = window.external;
            return externalJavaScript.IsSendCopyEnabled();
        } catch (error) {
            // If "IsSendCopyEnabled" is not implemented, return false.
            return false;
        }
    }
}
