import './ShareHint.scss';
import { ShareHintDetail } from './ShareHintDetail/ShareHintDetail';
import { ShareLinkDescription } from '../ShareLinkDescription/ShareLinkDescription';
import { SharingLinkKind, IShareStrings, FileShareType, ISharingLinkSettings, SharingAudience, ISharingInformation } from '../../interfaces/SharingInterfaces';
import * as React from 'react';
import * as StringHelper from '@ms/odsp-utilities/lib/string/StringHelper';

export interface IShareHintProps {
    companyName: string;
    currentSettings: ISharingLinkSettings;
    onShareHintClick?: () => void;
    sharingInformation: ISharingInformation;
}

export class ShareHint extends React.Component<IShareHintProps, {}> {
    private _strings: IShareStrings;

    static contextTypes = {
        strings: React.PropTypes.object.isRequired
    };

    constructor(props: IShareHintProps, context: any) {
        super(props);

        this._strings = context.strings;
    }

    public render(): React.ReactElement<{}> {
        const permissionsType = this._getFileShareTypeFromAudience();
        const label = this._getLabelFromPermissionsType(permissionsType);
        const isClickable = !!this.props.onShareHintClick;
        const classes = `od-ShareHint ${isClickable ? 'od-ShareHint--clickable' : ''}`;
        const props = this.props;

        return (
            <button className={ classes } onClick={ this._openLinkPermissions.bind(this) }>
                <div className='od-ShareHint-iconHolder'>
                    <ShareLinkDescription
                        label={ label }
                        permissionsType={ permissionsType }
                        showLabel={ false }
                    />
                </div>
                <ShareHintDetail
                    companyName={ props.companyName }
                    currentSettings={ props.currentSettings }
                    sharingInformation={ props.sharingInformation }
                />
                { this._renderChevron(isClickable) }
            </button>
        );
    }

    private _renderChevron(allowEdit: boolean) {
        if (allowEdit) {
            return <i className='od-ShareHint-chevron ms-Icon ms-Icon--ChevronDown'></i>;
        }
    }

    private _openLinkPermissions(): void {
        const clickHandler = this.props.onShareHintClick;
        if (clickHandler) {
            clickHandler();
        }
    }

    private _getFileShareTypeFromAudience(): FileShareType {
        const audience = this.props.currentSettings.audience;

        if (audience === SharingAudience.anyone) {
            return FileShareType.anyone;
        } else if (audience === SharingAudience.organization) {
            return FileShareType.workGroup;
        } else if (audience === SharingAudience.existing) {
            return FileShareType.existing;
        } else { /* audience === SharingAudience.SPECIFIC_PEOPLE */
            return FileShareType.specificPeople;
        }
    }

    private _getLabelFromPermissionsType(shareType: FileShareType): string {
        const strings = this._strings;

        if (shareType === FileShareType.anyone) {
            return strings.permissionsAnyoneString;
        } else if (shareType === FileShareType.workGroup) {
            return StringHelper.format(strings.permissionsCompanyString, this.props.companyName);
        } else if (shareType === FileShareType.existing) {
            return strings.permissionsExistingPeopleString;
        } else if (shareType === FileShareType.specificPeople) {
            return strings.permissionsSpecificPeopleString;
        }
    }
}