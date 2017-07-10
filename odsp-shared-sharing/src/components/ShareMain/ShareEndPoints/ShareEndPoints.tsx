import './ShareEndPoints.scss';
import { ShareEndPointType, IShareStrings, ClientId } from '../../../interfaces/SharingInterfaces';
import * as React from 'react';
import * as ClientIdHelper from '../../../utilities/ClientIdHelper';

export interface IShareEndPoints {
    clientId: ClientId;
    onCopyLinkClicked: () => void;
    onOutlookClicked: () => void;
}

export interface IShareEndPointData {
    label: string;
    icon: string;
    bgColor: string;
    endPointType: ShareEndPointType;
    action: () => void;
}

export class ShareEndPoints extends React.Component<IShareEndPoints, {}> {
    private _strings: IShareStrings;
    private _shareEndPointsData: Array<IShareEndPointData>;

    static contextTypes = {
        strings: React.PropTypes.object.isRequired
    };

    constructor(props: IShareEndPoints, context: any) {
        super(props);

        this._strings = context.strings;
        this._shareEndPointsData = this._getShareEndPointsData();
    }

    public render(): React.ReactElement<{}> {
        return (
            <div className='od-ShareEndPoints'>
                <ul
                    className='od-ShareEndPoints-items'
                    role='group'
                    aria-label={ this._strings.otherWaysToShareLabel }
                >
                    { this._renderEndPoints() }
                </ul>
            </div>
        );
    }

    private _renderEndPoints(): JSX.Element[] {
        let listItems: JSX.Element[] = [];

        for (const endPoint of this._shareEndPointsData) {
            let image: JSX.Element;
            const icon = endPoint.icon;
            const iconClass = icon.split(':', 2)[1];

            if (icon.indexOf('font:') > -1) {
                image = <i className={ `ms-Icon ms-Icon--${iconClass}` }></i>
            } else {
                image = <img src={ iconClass } />
            }

            listItems.push(
                <li key={ endPoint.endPointType } className='od-ShareEndPoints-item'>
                    <button
                        className='od-ShareEndpoints-endpoint'
                        onClick={ endPoint.action }
                    >
                        <div
                            className={ 'od-ShareEndPoints-itemImage' }
                             >
                            { image }
                        </div>
                        <div className='od-ShareEndPoints-itemText ms-font-xs'>{ endPoint.label }</div>
                    </button>
                </li>
            );
        }

        return listItems;
    }

    private _getShareEndPointsData(): Array<IShareEndPointData> {
        const endpoints: Array<IShareEndPointData> = [
            {
                label: this._strings.copyLinkLabel,
                icon: 'font:Link',
                bgColor: 'ms-bgColor-themePrimary',
                endPointType: ShareEndPointType.link,
                action: this._onClick.bind(this, ShareEndPointType.link)
            }
        ];

        // If a clientId is specified (i.e. UI being hosted outside of ODSP), don't
        // show the Outlook share target.
        if (ClientIdHelper.isODSP(this.props.clientId)) {
            endpoints.push({
                label: this._strings.outlookLabel,
                icon: 'font:OutlookLogo',
                bgColor: 'ms-bgColor-themePrimary',
                endPointType: ShareEndPointType.outlook,
                action: this._onClick.bind(this, ShareEndPointType.outlook)
            });
        }

        return endpoints;
    }

    private _onClick(endPointType: number, evt: React.SyntheticEvent<{}>): void {
        if (endPointType === ShareEndPointType.link) {
            this.props.onCopyLinkClicked();
        } else if (endPointType === ShareEndPointType.outlook) {
            this.props.onOutlookClicked();
        }
    }
}