import * as React from 'react';
import { FileShareType } from '../../interfaces/SharingInterfaces';
import { FileShareIconMap } from '../../data/Icons/FileShareIconMap';
import './ShareLinkDescription.scss';

export interface ISharePermissionProps {
    label: string;
    permissionsType: FileShareType;
    showLabel: boolean;
}

export class ShareLinkDescription extends React.Component<ISharePermissionProps, {}> {
    public render(): React.ReactElement<{}> {
        const iconClass = FileShareIconMap[this.props.permissionsType];

        return (
            <div className='od-ShareLinkDescription'>
                <div className={`od-ShareLinkDescription-icon icon-${iconClass}`}>
                    <i className={`ms-Icon ms-Icon--${iconClass}`}></i>
                </div>
                {this._renderLabel()}
            </div>
        );
    }

    private _renderLabel(): JSX.Element {
        if (this.props.showLabel) {
            return (
                <div className='od-ShareLinkDescription-label'>{this.props.label}</div>
            );
        }
    }
}
