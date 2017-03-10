import '../ShareCallout.scss';
import { Callout, DirectionalHint } from 'office-ui-fabric-react/lib/Callout';
import { FileShareType, ShareEndPointType } from '../../interfaces/SharingInterfaces';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { ModifyPermissions } from '../ModifyPermissions/ModifyPermissions';
import { ShareNotification } from '../ShareNotification/ShareNotification';
import { Spinner, SpinnerType } from 'office-ui-fabric-react/lib/Spinner';
import * as React from 'react';

export interface IShareCalloutProps {
    target: HTMLElement;
}

export interface IShareCalloutState {
    linkCreated?: boolean;
    showActivityIndicator?: boolean;
    toast?: boolean;
    viewState?: number;
}

enum CopyLinkViewState {
    DEFAULT,
    LINK_PERMISSIONS,
    NOTIFICATION,
    ACTIVITY_INDICATOR
}

export class CopyLinkCallout extends React.Component<IShareCalloutProps, IShareCalloutState> {
    private _permissionsUpdated: boolean;

    constructor(props: IShareCalloutProps) {
        super(props);

        this._onCreateLink = this._onCreateLink.bind(this);
        this._onDismiss = this._onDismiss.bind(this);
        this._onGetLinkServiceReponse = this._onGetLinkServiceReponse.bind(this);
        this._onLinkCreated = this._onLinkCreated.bind(this);
        this._onLinkPermissionsDismiss = this._onLinkPermissionsDismiss.bind(this);
        this._openPermissions = this._openPermissions.bind(this);

        this._initiViewState();
    }

    public render(): React.ReactElement<{}> {
        return (
            <Callout
                className={this.state.viewState === CopyLinkViewState.NOTIFICATION ? '' : 'beak-top'}
                gapSpace={0}
                targetElement={this.props.target}
                onDismiss={this._onDismiss}
                setInitialFocus={true}
            >
                {this._renderViews()}
            </Callout>
        );
    }

    public _renderViews(): JSX.Element {
        switch (this.state.viewState) {
            case CopyLinkViewState.LINK_PERMISSIONS:
                return this._renderLinkPermissions();
            case CopyLinkViewState.NOTIFICATION:
                return this._renderNotification();
            default:
                return this._renderCopyLink();
        }
    }

    private _renderCopyLink(): JSX.Element {
        return (
            <div className={'od-Share blocker blocker-opaque'}>
                <div className='od-Share-header'>
                    <div className='od-Share-title ms-font-l ms-fontWeight-regular'>Get Link</div>
                    <div
                        className='od-Share-close'
                        onClick={this._onDismiss} >
                        <i className='ms-Icon ms-Icon--Cancel'></i>
                    </div>
                </div>
                {this._renderActivityIndicator()}
            </div>
        );
    }

    private _renderLinkPermissions(): JSX.Element {
        return (
            <div className='od-Share'>
                <ModifyPermissions
                    onCancel={this._onLinkPermissionsDismiss}
                    currentSettings={null}
                    sharingInformation={null}
                    onSelectedPermissionsChange={() => { }}
                />
            </div>
        );
    }

    private _renderNotification(): JSX.Element {
        return (
            <ShareNotification
                companyName={null}
                currentSettings={null}
                isCopy={true}
                sharingInformation={null}
                sharingLinkCreated={null}
            />
        );
    }

    private _renderActivityIndicator(): React.ReactElement<{}> {
        if (this.state.showActivityIndicator) {
            return (
                <div className='od-Share-activityIndicator'>
                    <div className='od-Share-spinner'>
                        <Spinner type={SpinnerType.large} />
                    </div>
                    <Label>Creating shareable link...</Label>
                </div>
            );
        }
    }

    private _initiViewState(): void {
        this.state = {
            showActivityIndicator: true,
            viewState: CopyLinkViewState.DEFAULT
        };
    }

    private _getSelectedItem(): any {
        return null;
    }

    private _onLinkCreated(): void {
        this.setState({
            linkCreated: true
        });
    }

    private _onCreateLink(): void {
        this.setState({ showActivityIndicator: true });
    }

    private _onLinkPermissionsDismiss(): void {
        this.setState({
            viewState: CopyLinkViewState.NOTIFICATION
        });
    }

    private _onDismiss(): void {
        return;
    }

    private _onGetLinkServiceReponse(success: boolean): void {
        this._dismissAndToast('Link copied');
    }

    private _dismissAndToast(toastMessage?: string): void {
        this.setState({ viewState: CopyLinkViewState.NOTIFICATION });
    }

    private _openPermissions(): void {
        this.setState({
            viewState: CopyLinkViewState.LINK_PERMISSIONS
        });
    }
}