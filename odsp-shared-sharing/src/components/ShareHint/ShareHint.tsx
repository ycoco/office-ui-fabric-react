import './ShareHint.scss';
import { ShareHintDetail } from './ShareHintDetail/ShareHintDetail';
import { ShareLinkDescription } from '../ShareLinkDescription/ShareLinkDescription';
import { SharingLinkKind, IShareStrings, FileShareType, ISharingLinkSettings, SharingAudience } from '../../interfaces/SharingInterfaces';
import * as React from 'react';
import * as StringHelper from '@ms/odsp-utilities/lib/string/StringHelper';

export interface IShareHintProps {
    companyName: string;
    currentSettings: ISharingLinkSettings;
    onShareHintClick?: () => void;
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
            <div className={classes} onClick={this._openLinkPermissions.bind(this)}>
                <div className='od-ShareHint-iconHolder'>
                    <ShareLinkDescription
                        label={label}
                        permissionsType={permissionsType}
                        showLabel={false}
                    />
                </div>
                <ShareHintDetail
                    allowEdit={isClickable}
                    companyName={props.companyName}
                    currentSettings={props.currentSettings}
                />
            </div>
        );
    }

    private _openLinkPermissions(): void {
        const clickHandler = this.props.onShareHintClick;
        if (clickHandler) {
            clickHandler();
        }
    }

    private _getFileShareTypeFromAudience(): FileShareType {
        const audience = this.props.currentSettings.audience;

        if (audience === SharingAudience.ANYONE) {
            return FileShareType.ANYONE;
        } else if (audience === SharingAudience.ORGANIZATION) {
            return FileShareType.WORK_GROUP;
        } else if (audience === SharingAudience.EXISTING) {
            return FileShareType.EXISTING_PEOPLE;
        } else { /* audience === SharingAudience.SPECIFIC_PEOPLE */
            return FileShareType.SPECIFIC_PEOPLE;
        }
    }

    private _getLabelFromPermissionsType(shareType: FileShareType): string {
        const strings = this._strings;

        if (shareType === FileShareType.ANYONE) {
            return strings.permissionsAnyoneString;
        } else if (shareType === FileShareType.WORK_GROUP) {
            return StringHelper.format(strings.permissionsCompanyString, this.props.companyName);
        } else if (shareType === FileShareType.SPECIFIC_PEOPLE) {
            return strings.permissionsSpecificPeopleString;
        } else if (shareType === FileShareType.EXISTING_PEOPLE) {
            return strings.permissionsExistingPeopleString;
        }
    }
}