import { ISharingInformation, ISharingLinkSettings, IShareStrings, ISharingLink, ISharingStore, ISharingItemInformation, ClientId, ShareType } from '../../interfaces/SharingInterfaces';
import { ModifyPermissions } from '../ModifyPermissions/ModifyPermissions';
import { ShareNotification } from '../ShareNotification/ShareNotification';
import { ShareViewState } from '../Share/Share';
import { Spinner, SpinnerType } from 'office-ui-fabric-react/lib/Spinner';
import * as React from 'react';

export interface ICopyLinkProps {
    clientId: ClientId;
    companyName: string;
    currentSettings: ISharingLinkSettings;
    item: ISharingItemInformation;
    onLinkPermissionsApplyClicked: (currentSettings: ISharingLinkSettings) => void;
    onLinkPermissionsCancelClicked: () => void;
    onSelectedPeopleChange: (items: Array<any>) => void;
    onShareHintClicked: () => void;
    sharingInformation: ISharingInformation;
    sharingLinkCreated: ISharingLink;
    showExistingAccessOption: boolean;
    viewState: ShareViewState;
    groupsMemberCount: number;
    onViewPolicyTipClicked: () => void;
}

export class CopyLink extends React.Component<ICopyLinkProps, null> {
    private _strings: IShareStrings;

    static contextTypes = {
        strings: React.PropTypes.object.isRequired
    };

    constructor(props: ICopyLinkProps, context: any) {
        super(props);

        this._strings = context.strings;
    }

    render(): React.ReactElement<{}> {
        const props = this.props;
        const sharingInformation = props.sharingInformation;
        const sharingLinkCreated = props.sharingLinkCreated;

        switch (this.props.viewState) {
            case ShareViewState.linkSuccess:
                return (
                    <ShareNotification
                        companyName={ props.companyName }
                        currentSettings={ props.currentSettings }
                        shareType={ ShareType.copy }
                        sharingInformation={ sharingInformation }
                        sharingLinkCreated={ sharingLinkCreated }
                        onShareHintClicked={ props.onShareHintClicked }
                    />
                );
            case ShareViewState.modifyPermissions:
                return (
                    <ModifyPermissions
                        clientId={ props.clientId }
                        companyName={ props.companyName }
                        currentSettings={ props.currentSettings }
                        doesCreate={ true }
                        onCancel={ props.onLinkPermissionsCancelClicked }
                        onSelectedPermissionsChange={ props.onLinkPermissionsApplyClicked }
                        sharingInformation={ props.sharingInformation }
                        showExistingAccessOption={ props.showExistingAccessOption }
                        groupsMemberCount={ props.groupsMemberCount }
                        onViewPolicyTipClicked={ props.onViewPolicyTipClicked }
                    />
                );
            default:
                return (
                    <div className='od-Share-spinnerHolder'>
                        <Spinner
                            className='od-Share-spinner'
                            label={ this._strings.componentLoading }
                            type={ SpinnerType.large }
                        />
                    </div>
                );
        }
    }
}