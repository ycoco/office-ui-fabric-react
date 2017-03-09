import './AudienceChoiceGroup.scss';
import { FileShareType, SharingAudience, SharingLinkKind } from '../../../interfaces/SharingInterfaces';
import { ShareLinkDescription } from '../../ShareLinkDescription/ShareLinkDescription';
import * as React from 'react';

export interface IAudienceChoiceGroupProps {
    items: Array<AudienceChoice>;
    onAudienceChange?: (audience: SharingAudience) => void;
    onChange?: (key: SharingAudience) => void;
}

export interface IAudienceChoiceGroupState {
    selectedKey: SharingAudience;
}

export interface AudienceChoice {
    key: SharingAudience;
    icon: string;
    label: string;
    permissionsType: FileShareType;
    linkKinds: Array<SharingLinkKind>;
    isChecked: boolean;
}

export class AudienceChoiceGroup extends React.Component<IAudienceChoiceGroupProps, IAudienceChoiceGroupState> {
    constructor(props: IAudienceChoiceGroupProps, state: IAudienceChoiceGroupState) {
        super(props);

        this.state = {
            selectedKey: this._getSelectedIndex(props)
        };
    }

    private _getSelectedIndex(props: IAudienceChoiceGroupProps): SharingAudience {
        for (const item of props.items) {
            if (item.isChecked) {
                return item.key;
            }
        }
    }

    public render(): React.ReactElement<{}> {
        const rows = this.props.items.map(this._renderItem, this);

        return (
            <div>
                {rows}
            </div>
        );
    }

    private _renderItem(item: AudienceChoice) {
        const key = item.key;

        return (
            <div>
                <div
                    key={key}
                    onClick={this._onRowClick.bind(this, key)}
                    className={'od-ModifyPermissions-margins od-AudienceChoiceGroup-row ' + (this.state.selectedKey == key ? 'is-selected' : '')}
                >
                    <ShareLinkDescription
                        label={item.label}
                        permissionsType={item.permissionsType}
                        showLabel={true}
                    />
                </div>
                <div className="od-AudienceChoiceGroup-bottomBorder" />
            </div>
        );
    }

    private _onRowClick(key: SharingAudience, evt: React.SyntheticEvent<{}>): void {
        const props = this.props;

        // Sets the selected item as selected in the UI.
        this.setState({ selectedKey: key });
        props.onChange(key);

        // Changes the audience of selectedPermissions.
        props.onAudienceChange(key);
    }
}