import './ShareHint.scss';
import { ShareHintDetail } from './ShareHintDetail/ShareHintDetail';
import { ShareLinkDescription } from '../ShareLinkDescription/ShareLinkDescription';
import { SharingLinkKind, IShareStrings, FileShareType, ISharingLinkSettings } from '../../interfaces/SharingInterfaces';
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
        const permissionsType = this._getFileShareTypeFromLinkKind();
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

    private _getFileShareTypeFromLinkKind(): FileShareType {
        const linkKind = this.props.currentSettings.sharingLinkKind;

        if (linkKind === SharingLinkKind.ANONYMOUS_VIEW || linkKind === SharingLinkKind.ANONYMOUS_EDIT) {
            return FileShareType.ANYONE;
        } else if (linkKind === SharingLinkKind.ORGANIZATION_VIEW || linkKind === SharingLinkKind.ORGANIZATION_EDIT) {
            return FileShareType.WORK_GROUP;
        } else {
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
        }
    }
}