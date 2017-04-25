import './AudienceChoiceGroup.scss';
import { FileShareType, SharingAudience, SharingLinkKind, IShareStrings } from '../../../interfaces/SharingInterfaces';
import { FocusZone, FocusZoneDirection } from 'office-ui-fabric-react/lib/FocusZone';
import { ShareLinkDescription } from '../../ShareLinkDescription/ShareLinkDescription';
import * as React from 'react';

export interface IAudienceChoiceGroupProps {
    items: Array<IAudienceChoice>;
    onAudienceChange?: (audience: SharingAudience) => void;
    onChange?: (key: SharingAudience) => void;
}

export interface IAudienceChoiceGroupState {
    selectedKey: SharingAudience;
}

export interface IAudienceChoice {
    icon: string;
    isChecked: boolean;
    isDisabled: boolean;
    key: SharingAudience;
    label: string;
    linkKinds: Array<SharingLinkKind>;
    permissionsType: FileShareType;
    disabledText?: string;
}

export class AudienceChoiceGroup extends React.Component<IAudienceChoiceGroupProps, IAudienceChoiceGroupState> {
    private _strings: IShareStrings;

    static contextTypes = {
        strings: React.PropTypes.object.isRequired
    };

    constructor(props: IAudienceChoiceGroupProps, context: any) {
        super(props);

        this.state = {
            selectedKey: this._getSelectedIndex(props)
        };

        this._strings = context.strings;
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
            <div
                aria-label={ this._strings.permissionsSettingsHeader }
                role='radiogroup'
            >
                <FocusZone>
                    { rows }
                </FocusZone>
            </div>
        );
    }

    private _renderItem(item: IAudienceChoice) {
        const key = item.key;
        const infoButtonMessage = item.isDisabled && item.disabledText ? item.disabledText : '';
        const state = this.state;
        const isSelected = state.selectedKey === key;

        return (
            <div>
                <button
                    role='radio'
                    aria-checked={ isSelected }
                    key={ key }
                    onClick={ item.isDisabled ? () => { return; } : this._onRowClick.bind(this, key) }
                    className={ this._getRowClasses(item) }
                    autoFocus={ isSelected }
                    aria-disabled={ item.isDisabled }
                    aria-label={ `${item.label} ${infoButtonMessage}` }
                >
                    <div className='od-AudienceChoiceGroup-description'>
                        <ShareLinkDescription
                            label={ item.label }
                            permissionsType={ item.permissionsType }
                            showLabel={ true }
                            infoButtonMessage={ infoButtonMessage }
                        />
                    </div>
                </button>
                <div className='od-AudienceChoiceGroup-bottomBorder' />
            </div>
        );
    }

    private _getRowClasses(item: IAudienceChoice) {
        let classes = 'od-ModifyPermissions-margins od-AudienceChoiceGroup-row';

        if (this.state.selectedKey === item.key) {
            classes += ' is-selected';
        }

        if (item.isDisabled) {
            classes += ' is-disabled';
        }

        return classes;
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