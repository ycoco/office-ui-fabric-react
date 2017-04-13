import './ShareLinkDescription.scss';
import { FileShareIconMap } from '../../data/Icons/FileShareIconMap';
import { FileShareType } from '../../interfaces/SharingInterfaces';
import { InfoButton } from '../ModifyPermissions/AudienceChoiceGroup/InfoButton/InfoButton';
import * as React from 'react';

export interface ISharePermissionProps {
    label: string;
    permissionsType: FileShareType;
    showLabel: boolean;
    infoButtonMessage?: string;
}

export class ShareLinkDescription extends React.Component<ISharePermissionProps, {}> {
    public render(): React.ReactElement<{}> {
        const iconClass = FileShareIconMap[this.props.permissionsType];

        return (
            <div className='od-ShareLinkDescription'>
                <div className={ `od-ShareLinkDescription-icon icon-${iconClass}` }>
                    <i className={ `ms-Icon ms-Icon--${iconClass}` }></i>
                </div>
                { this._renderLabel() }
            </div>
        );
    }

    private _renderLabel(): JSX.Element {
        const infoButtonMessage = this.props.infoButtonMessage;
        const infoButton = !!infoButtonMessage ? (
            <InfoButton
                message={ infoButtonMessage }
            />
        ) : '';

        if (this.props.showLabel) {
            return (
                <div className='od-ShareLinkDescription-label'>
                    { this.props.label }
                    { infoButton }
                </div>
            );
        }
    }
}
