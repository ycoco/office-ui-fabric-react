import './ShareTargets.scss';
import { IShareStrings, ClientId, ShareType, OutlookAvailability } from '../../../interfaces/SharingInterfaces';
import * as React from 'react';
import * as ClientIdHelper from '../../../utilities/ClientIdHelper';

export interface IShareTargetsProps {
    clientId: ClientId;
    onShareTargetClicked: (shareType: ShareType) => void;
    onShareTargetsRendered: (shareTargets: Array<ShareType>) => void;
}

export interface IShareTargetData {
    label: string;
    icon: string;
    bgColor: string;
    shareType: ShareType;
    action: () => void;
}

export class ShareTargets extends React.Component<IShareTargetsProps, {}> {
    private _strings: IShareStrings;
    private _shareTargetsData: Array<IShareTargetData>;

    static contextTypes = {
        strings: React.PropTypes.object.isRequired
    };

    constructor(props: IShareTargetsProps, context: any) {
        super(props);

        this._strings = context.strings;
        this._shareTargetsData = this._getShareTargetsData();

        // Record which share targets are available.
        const targets = [];
        for (const target of this._shareTargetsData) {
            targets.push(target.shareType);
        }
        props.onShareTargetsRendered(targets);
    }

    public render(): React.ReactElement<{}> {
        return (
            <div className='od-ShareTargets'>
                <ul
                    className='od-ShareTargets-items'
                    role='group'
                    aria-label={ this._strings.otherWaysToShareLabel }
                >
                    { this._renderTargets() }
                </ul>
            </div>
        );
    }

    private _renderTargets(): JSX.Element[] {
        let listItems: JSX.Element[] = [];

        for (const target of this._shareTargetsData) {
            let image: JSX.Element;
            const icon = target.icon;
            const iconClass = icon.split(':', 2)[1];

            if (icon.indexOf('font:') > -1) {
                image = <i className={ `ms-Icon ms-Icon--${iconClass}` }></i>
            } else {
                image = <img src={ iconClass } />
            }

            listItems.push(
                <li key={ target.shareType } className='od-ShareTargets-item'>
                    <button
                        className='od-ShareTargets-target'
                        onClick={ target.action }
                    >
                        <div
                            className={ 'od-ShareTargets-itemImage' }
                        >
                            { image }
                        </div>
                        <div className='od-ShareTargets-itemText ms-font-xs'>{ target.label }</div>
                    </button>
                </li>
            );
        }

        return listItems;
    }

    private _getShareTargetsData(): Array<IShareTargetData> {
        const targets: Array<IShareTargetData> = [
            {
                label: this._strings.copyLinkLabel,
                icon: 'font:Link',
                bgColor: 'ms-bgColor-themePrimary',
                shareType: ShareType.copy,
                action: this._onClick.bind(this, ShareType.copy)
            }
        ];

        const outlookAvailability = this._determineMailShareTarget(this.props.clientId);
        if (outlookAvailability === OutlookAvailability.available) {
            targets.push({
                label: this._strings.outlookLabel,
                icon: 'font:OutlookLogo',
                bgColor: 'ms-bgColor-themePrimary',
                shareType: ShareType.outlook,
                action: this._onClick.bind(this, ShareType.outlook)
            });
        } else if (outlookAvailability === OutlookAvailability.other) {
            targets.push({
                label: this._strings.nonOutlookLabel,
                icon: 'font:Mail',
                bgColor: 'ms-bgColor-themePrimary',
                shareType: ShareType.nonOutlook,
                action: this._onClick.bind(this, ShareType.nonOutlook)
            });
        }

        if (this._isMoreAppsShareTargetEnabled()) {
            targets.push({
                label: this._strings.moreAppsLabel,
                icon: 'font:More',
                bgColor: 'ms-bgColor-themePrimary',
                shareType: ShareType.moreApps,
                action: this._onClick.bind(this, ShareType.moreApps)
            });
        }

        return targets;
    }

    private _onClick(shareType: ShareType, evt: React.SyntheticEvent<{}>): void {
        this.props.onShareTargetClicked(shareType);
    }

    private _determineMailShareTarget(clientId: ClientId): OutlookAvailability {
        /**
         * - Outlook share target is always enabled for ODSP.
         * - Partners have the option to implement CheckSendViaOutlookAvailability.
         */
        if (ClientIdHelper.isODSP(this.props.clientId)) {
            return OutlookAvailability.available;
        } else {
            try {
                const externalJavaScript: any = window.external;
                const outlookAvailability: OutlookAvailability = externalJavaScript.CheckSendViaOutlookAvailability();
                return outlookAvailability;
            } catch (error) {
                // If "CheckSendViaOutlookAvailability" hasn't been implemented, then don't show the target.
                return OutlookAvailability.none;
            }
        }
    }

    private _isMoreAppsShareTargetEnabled() {
        try {
            const externalJavaScript: any = window.external;
            return externalJavaScript.IsMoreAppsEnabled();
        } catch (error) {
            // If "IsMoreAppsEnabled" hasn't been implemented, then don't show the target.
            return false;
        }
    }
}