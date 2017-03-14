import './ShareEndPoints.scss';
import { ShareEndPointType, IShareStrings } from '../../../interfaces/SharingInterfaces';
import * as React from 'react';

export interface IShareEndPoints {
    onCopyLinkClicked: () => void;
}

export interface IShareEndPointData {
    label: string;
    icon: string;
    bgColor: string;
    endPointType: ShareEndPointType;
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
                <ul className='od-ShareEndPoints-items'>
                    {this._renderEndPoints()}
                </ul>
            </div>
        );
    }

    private _renderEndPoints(): JSX.Element[] {
        let listItems: JSX.Element[] = [];

        for (const endPoint of this._shareEndPointsData) {
            let image: JSX.Element;
            const icon = endPoint.icon;
            const iconClass = icon.split(':',2)[1];

            if (icon.indexOf('font:') > -1) {
                image = <i className={`ms-Icon ms-Icon--${iconClass}`}></i>
            } else {
                image = <img src={iconClass} />
            }

            listItems.push(
                <li key={endPoint.endPointType} className='od-ShareEndPoints-item'>
                    <div
                        className={'od-ShareEndPoints-itemImage'}
                        onClick={this._onClick.bind(this, endPoint.endPointType)} >
                        {image}
                    </div>
                    <div className='od-ShareEndPoints-itemText ms-font-xs'>{endPoint.label}</div>
                </li>
            );
        }

        return listItems;
    }

    private _getShareEndPointsData(): Array<IShareEndPointData> {
        return [
            {
                label: this._strings.copyLinkLabel,
                icon: 'font:Link',
                bgColor: 'ms-bgColor-themePrimary',
                endPointType: ShareEndPointType.LINK
            }
        ];
    }

    private _onClick(endPointType: number, evt: React.SyntheticEvent<{}>): void {
        if (endPointType === ShareEndPointType.LINK) {
            this.props.onCopyLinkClicked();
        }
    }
}