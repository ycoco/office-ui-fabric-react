// OneDrive:IgnoreCodeCoverage

import * as React from 'react';
import { ICreateColumnPanelContentProps } from './CreateColumnPanel.Props';
import { autobind, BaseComponent } from 'office-ui-fabric-react/lib/Utilities';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Button, PrimaryButton, IconButton } from 'office-ui-fabric-react/lib/Button';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { TeachingBubble } from 'office-ui-fabric-react/lib/TeachingBubble';
import { ICreateFieldOptions, FieldType } from '@ms/odsp-datasources/lib/List';

export interface ICreateColumnPanelState {
    showMoreOptions?: boolean;
    showColumnValidation?: boolean;
    choices?: string[];
    defaultValueDropdownOptions?: IDropdownOption[];
    defaultValue?: IDropdownOption;
    showManuallyAddValuesInfo?: boolean;
    name?: string;
    allowMultipleSelection?: boolean;
    enforceUniqueValues?: boolean;
}

export class CreateColumnPanelContent extends BaseComponent<ICreateColumnPanelContentProps, ICreateColumnPanelState> {
    private _name: TextField;
    private _description: TextField;
    private _allowManuallyAddValues: Checkbox;
    private _manuallyAddValuesInfoButton: HTMLElement;
    private _required: Toggle;
    private _formula: TextField;
    private _userMessage: TextField;
    private _options: ICreateFieldOptions;

    constructor(props: ICreateColumnPanelContentProps) {
        super(props);
        let defaultValue = { key: 0, text: this.props.strings.choiceDefaultValue };
        this.state = {
            showMoreOptions: false,
            showColumnValidation: false,
            choices: [],
            defaultValueDropdownOptions: [defaultValue],
            defaultValue: defaultValue,
            showManuallyAddValuesInfo: false,
            name: "",
            allowMultipleSelection: false,
            enforceUniqueValues: false
        };
    }

    public componentDidUpdate(prevProps, prevState) {
        if (!prevProps.duplicateColumnName && this.props.duplicateColumnName) {
            this._name.focus();
        }
    }

    public render() {
        return (
            <div className='ms-CreateColumnPanel'>
                <div className='ms-CreateColumnPanel-subHeader'>
                    { this.props.strings.guideText }
                </div>
                <TextField className='ms-CreateColumnPanel-nameTextField' label={ this.props.strings.nameLabel } required={ true } onChanged={ this._nameChanged } errorMessage={  this.props.duplicateColumnName ? this.props.strings.duplicateColumnNameError : ""} ref={ this._resolveRef('_name') } />
                <TextField className='ms-CreateColumnPanel-multilineTextField' label={ this.props.strings.descriptionLabel } multiline rows={ 3 } ref={ this._resolveRef('_description') } />
                { this._uniqueFields() }
                <div className='ms-CreateColumnPanel-moreOptionsButton'>
                    <Link onClick={ this._showMoreClick }>{ this.props.strings.moreOptionsButtonText }</Link>
                </div>
                { this.state.showMoreOptions ? this._moreOptions() : null }
                <div className = 'ms-CreateColumnPanel-footer'>
                    <PrimaryButton className='ms-CreateColumnPanel-saveButton' disabled={ this.state.choices.length === 0 || this.state.name === "" || this.props.listColumnsUnknown } onClick={this._onSaveClick }>{ this.props.strings.saveButtonText }</PrimaryButton>
                    <Button className='ms-CreateColumnPanel-cancelButton' onClick={ this.props.onDismiss }>{ this.props.strings.cancelButtonText }</Button>
                </div>
                { this.props.listColumnsUnknown ?
                <div className = 'ms-CreateColumnPanel-error'>{ this.props.strings.genericError }</div> :
                null }
            </div>
        );
    }

    @autobind
    private _uniqueFields() {
        return (
            <div className='ms-CreateColumnPanel-uniqueFields'>
                <TextField className='ms-CreateColumnPanel-multilineTextField ms-CreateColumnPanel-choicesTextField'
                    label={ this.props.strings.choicesLabel }
                    placeholder={ this.props.strings.choicesPlaceholder }
                    ariaLabel={ this.props.strings.choicesAriaLabel }
                    onChanged={ this._choicesChanged }
                    required={ true } multiline rows={ 9 }/>
                <div className='ms-CreateColumnPanel-dropdownContainer'>
                    <Dropdown className='ms-CreateColumnPanel-dropdown'
                        label={ this.props.strings.defaultValueDropdown }
                        options={ this.state.defaultValueDropdownOptions }
                        defaultSelectedKey={ 0 }
                        onChanged={ this._choiceDropdownChanged }
                        ref={ this._resolveRef('_defaultValueDropdown') } />
                </div>
                <Checkbox className='ms-CreateColumnPanel-checkbox' label={ this.props.strings.manuallyAddValuesCheckbox } ref={ this._resolveRef('_allowManuallyAddValues') } />
                <span className='ms-CreateColumnPanel-manuallyAddValuesInfo' ref={ this._resolveRef('_manuallyAddValuesInfoButton') }>
                    <IconButton className='ms-CreateColumnPanel-infoIcon' icon='Info' ariaLabel={ this.props.strings.infoButtonAriaLabel }onClick={ this._manuallyAddValuesInfoClick }/>
                </span>
                { this.state.showManuallyAddValuesInfo ?
                    <TeachingBubble targetElement={ this._manuallyAddValuesInfoButton } onDismiss={ this._manuallyAddValuesInfoClick }>
                        { this.props.strings.manuallyAddValuesTeachingBubble }
                    </TeachingBubble> : null }
            </div>
        );
    }

    @autobind
    private _moreOptions() {
        return (
            <div className='ms-CreateColumnPanel-moreOptions'>
                <Toggle className='ms-CreateColumnPanel-toggle'
                    defaultChecked={ false }
                    label= { this.props.strings.allowMultipleSelectionToggle }
                    onText = { this.props.strings.toggleOnText }
                    offText = { this.props.strings.toggleOffText }
                    onChanged = { this._multiSelectChanged }
                    ref={ this._resolveRef('_allowMultipleSelection') } />
                <Toggle className='ms-CreateColumnPanel-toggle'
                    defaultChecked={ false }
                    label= { this.props.strings.requiredToggle }
                    onText = { this.props.strings.toggleOnText }
                    offText = { this.props.strings.toggleOffText }
                    ref={ this._resolveRef('_required') } />
                <Toggle className='ms-CreateColumnPanel-toggle'
                    checked={ this.state.enforceUniqueValues }
                    disabled={ this.state.allowMultipleSelection }
                    label= { this.props.strings.enforceUniqueValuesToggle }
                    onText = { this.props.strings.toggleOnText }
                    offText = { this.props.strings.toggleOffText }
                    onChanged = { this._enforceUniqueValuesChanged }
                    ref={ this._resolveRef('_enforceUniqueValues') } />
                <div className = 'ms-CreateColumnPanel-columnValidationButton'>
                    <Link onClick={ this._columnValidationClick }>{ this.props.strings.columnValidationButtonText }</Link>
                </div>
                { this.state.showColumnValidation ? this._columnValidation() : null }
            </div>
        );
    }

    @autobind
    private _columnValidation() {
        return (
            <div className='ms-CreateColumnPanel-columnValidation'>
                <div className='ms-CreateColumnPanel-validationGuideText'>
                    { this.props.strings.columnValidationGuideText }
                </div>
                <div className='ms-CreateColumnPanel-learnMoreLink'>
                    <Link href='https://support.office.com/en-us/article/Examples-of-common-formulas-in-SharePoint-Lists-d81f5f21-2b4e-45ce-b170-bf7ebf6988b3' target='_blank'>
                        { this.props.strings.columnValidationLearnMoreLink }</Link>
                </div>
                <TextField className='ms-CreateColumnPanel-multilineTextField ms-CreateColumnPanel-formulaTextField'
                    label={ this.props.strings.formulaLabel }
                    multiline rows={ 5 }
                    ref={ this._resolveRef('_formula') } />
                <div className='ms-CreateColumnPanel-messageGuideText'>
                    { this.props.strings.userMessageGuideText }
                </div>
                <TextField className='ms-CreateColumnPanel-multilineText ms-CreateColumnPanel-userMessageTextField'
                    label={ this.props.strings.userMessageLabel }
                    multiline rows={ 3 }
                    ref={ this._resolveRef('_userMessage') } />
            </div>
        );
    }

    @autobind
    private _showMoreClick() {
        this.setState((prevState: ICreateColumnPanelState) => ({
            showMoreOptions: !prevState.showMoreOptions
        }));
    }

    @autobind
    private _columnValidationClick() {
        this.setState((prevState: ICreateColumnPanelState) => ({
            showColumnValidation: !prevState.showColumnValidation
        }));
    }

    @autobind
    private _manuallyAddValuesInfoClick() {
        this.setState((prevState: ICreateColumnPanelState) => ({
            showManuallyAddValuesInfo: !prevState.showManuallyAddValuesInfo
        }));
    }

    @autobind
    private _choicesChanged(newValue: string) {
        // Use value from the choices entry field to populate the default value dropdown
        let choices = newValue.split('\n');
        let filteredChoices = [];
        let newDropdownOptions = [{ key: 0, text: this.props.strings.choiceDefaultValue }];
        for (var i = 0; i < choices.length; i++) {
            if (choices[i]) {
                // Skip zero because that is the default 'None' which always stays
                newDropdownOptions.push({ key: i + 1, text: choices[i] });
                filteredChoices.push(choices[i]);
            }
        }
        this.setState({
            choices: filteredChoices,
            defaultValueDropdownOptions: newDropdownOptions
        });
    }

    @autobind
    private _choiceDropdownChanged(option: IDropdownOption) {
        this.setState({
            defaultValue: option
        });
    }

    @autobind
    private _nameChanged(newValue: string) {
        if (this.props.duplicateColumnName) {
            this.props.onClearError();
        }
        this.setState({ name: newValue });
    }

    @autobind
    private _multiSelectChanged(checked: boolean) {
        this.setState({
            allowMultipleSelection: checked,
            enforceUniqueValues: false
        });
    }

    @autobind
    private _enforceUniqueValuesChanged(checked: boolean) {
        this.setState({
            enforceUniqueValues: checked
        });
    }

    @autobind
    private _onSaveClick() {
        this._options = {
            type: this.state.allowMultipleSelection ? FieldType.MultiChoice : FieldType.Choice,
            displayName: this.state.name,
            description: this._description.value,
            defaultValue: this.state.defaultValue.key === 0 ? null : this.state.defaultValue.text,
            choices: this.state.choices,
            fillInChoice: this._allowManuallyAddValues ? this._allowManuallyAddValues.checked : false,
            required: this._required ? this._required.checked : false,
            enforceUniqueValues: this.state.enforceUniqueValues
        }
        if (this._formula && this._userMessage) {
            this._options.validation = {
                formula: this._formula.value,
                message: this._userMessage.value
            };
        }
        this.props.onSave(this._options);
    }
}