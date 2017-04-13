// OneDrive:IgnoreCodeCoverage

import * as React from 'react';
import { IColumnManagementPanelContentProps } from './index';
import { InfoTeachingIcon } from './HelperComponents/index';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { autobind, BaseComponent } from 'office-ui-fabric-react/lib/Utilities';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { IFieldSchema, FieldType } from '@ms/odsp-datasources/lib/List';

export interface IColumnManagementPanelState {
    showMoreOptions?: boolean;
    showColumnValidation?: boolean;
    choices?: string[];
    choicesText?: string;
    useCalculatedDefaultValue?: boolean;
    defaultValueFormula?: string;
    defaultValueDropdownOptions?: IDropdownOption[];
    defaultValue?: IDropdownOption;
    showManuallyAddValuesInfo?: boolean;
    name?: string;
    allowMultipleSelection?: boolean;
    enforceUniqueValues?: boolean;
}

export class ColumnManagementPanelContent extends BaseComponent<IColumnManagementPanelContentProps, IColumnManagementPanelState> {
    private _name: TextField;
    private _description: TextField;
    private _allowManuallyAddValues: Checkbox;
    private _required: Toggle;
    private _formula: TextField;
    private _userMessage: TextField;

    constructor(props: IColumnManagementPanelContentProps) {
        super(props);
        let defaultValue = { key: 0, text: this.props.strings.choiceDefaultValue };
        this.state = {
            showMoreOptions: false,
            showColumnValidation: false,
            choicesText: this.props.strings.choicesPlaceholder,
            useCalculatedDefaultValue: false,
            defaultValueFormula: "",
            defaultValueDropdownOptions: [defaultValue],
            defaultValue: defaultValue,
            showManuallyAddValuesInfo: false,
            name: "",
            allowMultipleSelection: false,
            enforceUniqueValues: false,
        };
    }

    public componentWillMount() {
        this._choicesChanged(this.props.strings.choicesPlaceholder);
    }

    public componentDidUpdate(prevProps, prevState) {
        if (!prevProps.duplicateColumnName && this.props.duplicateColumnName) {
            this._name.focus();
        }
    }

    public render() {
        let strings = this.props.strings;
        return (
            <div className='ms-ColumnManagementPanel-content'>
                <div className='ms-ColumnManagementPanel-titleLearnMore'>
                    <Link href={ `https://o15.officeredir.microsoft.com/r/rlidOfficeWebHelp?p1=SPOStandard&clid=${this.props.currentLanguage}&ver=16&HelpId=WSSEndUser_ColumnManagementPanelTitle` } target='_blank'>{ strings.titleLearnMore }</Link>
                </div>
                <TextField className='ms-ColumnManagementPanel-nameTextField' label={ strings.nameLabel } required={ true } onChanged={ this._nameChanged } errorMessage={  this.props.duplicateColumnName ? strings.duplicateColumnNameError : ""} ref={ this._resolveRef('_name') } />
                <TextField className='ms-ColumnManagementPanel-multilineTextField ms-ColumnManagementPanel-descriptionTextField' label={ strings.descriptionLabel } multiline rows={ 3 } ref={ this._resolveRef('_description') } />
                { this._uniqueFields() }
                <div className='ms-ColumnManagementPanel-moreOptionsButton'>
                    <Link onClick={ this._showMoreClick } aria-expanded={this.state.showMoreOptions} aria-controls='moreOptions'>{ strings.moreOptionsButtonText }</Link>
                </div>
                { this.state.showMoreOptions ? this._moreOptions() : null }
            </div>
        );
    }

    @autobind
    private _uniqueFields() {
        let strings = this.props.strings;
        return (
            <div className='ms-ColumnManagementPanel-uniqueFields'>
                <TextField className='ms-ColumnManagementPanel-multilineTextField ms-ColumnManagementPanel-choicesTextField'
                    label={ strings.choicesLabel }
                    value={ this.state.choicesText }
                    ariaLabel={ strings.choicesAriaLabel }
                    onChanged={ this._choicesChanged }
                    required={ true } multiline rows={ 9 }/>
                <div className='ms-ColumnManagementPanel-defaultValueContainer'>
                    <div className='ms-ColumnManagementPanel-defaultValueHeader'>{ strings.defaultValueHeader }</div>
                    <div className='ms-ColumnManagementPanel-useCalculatedValue'>
                        <Checkbox className='ms-ColumnManagementPanel-checkbox' label={ strings.useCalculatedValue } onChange={ this._onUseCalculatedValueChanged } />
                        <InfoTeachingIcon className='ms-ColumnManagementPanel-checkboxInfo'
                        infoButtonAriaLabel={ strings.infoButtonAriaLabel }
                        calloutContent={ strings.useCalculatedValueTeachingBubble }
                        helpLink={{
                            href: `https://o15.officeredir.microsoft.com/r/rlidOfficeWebHelp?p1=SPOStandard&clid=${this.props.currentLanguage}&ver=16&HelpId=WSSEndUser_FormulaSyntaxError`,
                            displayText: strings.formulaLearnMoreLink
                        }} />
                    </div>
                    { this.state.useCalculatedDefaultValue ?
                    <TextField className='ms-ColumnManagementPanel-defaultValueEntryField'
                        placeholder={ strings.defaultFormulaPlaceholder }
                        ariaLabel={ strings.defaultFormulaAriaLabel }
                        value={ this.state.defaultValueFormula }
                        onChanged={ this._defaultFormulaChanged } /> :
                    <Dropdown className='ms-ColumnManagementPanel-defaultValueDropdown'
                        label={ null }
                        ariaLabel={ strings.defaultValueDropdownAriaLabel }
                        options={ this.state.defaultValueDropdownOptions }
                        selectedKey={ this.state.defaultValue.key }
                        onChanged={ this._choiceDropdownChanged }
                        ref={ this._resolveRef('_defaultValueDropdown') } /> }
                </div>
                <div className='ms-ColumnManagementPanel-allowManuallyAddValues'>
                    <Checkbox className='ms-ColumnManagementPanel-checkbox' label={ strings.manuallyAddValuesCheckbox } ref={ this._resolveRef('_allowManuallyAddValues') } />
                    <InfoTeachingIcon className='ms-ColumnManagementPanel-checkboxInfo'
                    infoButtonAriaLabel={ strings.infoButtonAriaLabel }
                    calloutContent={ strings.manuallyAddValuesTeachingBubble } />
                </div>
            </div>
        );
    }

    @autobind
    private _moreOptions() {
        let strings = this.props.strings;
        return (
            <div className='ms-ColumnManagementPanel-moreOptions' id='moreOptions'>
                <Toggle className='ms-ColumnManagementPanel-toggle'
                    defaultChecked={ false }
                    label= { strings.allowMultipleSelectionToggle }
                    onText = { strings.toggleOnText }
                    offText = { strings.toggleOffText }
                    onChanged = { this._multiSelectChanged }
                    ref={ this._resolveRef('_allowMultipleSelection') } />
                <Toggle className='ms-ColumnManagementPanel-toggle'
                    defaultChecked={ false }
                    label= { strings.requiredToggle }
                    onText = { strings.toggleOnText }
                    offText = { strings.toggleOffText }
                    ref={ this._resolveRef('_required') } />
                <Toggle className='ms-ColumnManagementPanel-toggle'
                    checked={ this.state.enforceUniqueValues }
                    disabled={ this.state.allowMultipleSelection }
                    label= { strings.enforceUniqueValuesToggle }
                    onText = { strings.toggleOnText }
                    offText = { strings.toggleOffText }
                    onChanged = { this._enforceUniqueValuesChanged }
                    ref={ this._resolveRef('_enforceUniqueValues') } />
                <div className = 'ms-ColumnManagementPanel-columnValidationButton'>
                    <Link onClick={ this._columnValidationClick } aria-expanded={this.state.showColumnValidation} aria-controls='columnValidation'>{ strings.columnValidationButtonText }</Link>
                </div>
                { this.state.showColumnValidation ? this._columnValidation() : null }
            </div>
        );
    }

    @autobind
    private _columnValidation() {
        let strings = this.props.strings;
        return (
            <div className='ms-ColumnManagementPanel-columnValidation' id='columnValidation'>
                <div className='ms-ColumnManagementPanel-validationGuideText'>
                    { strings.columnValidationGuideText }
                </div>
                <div className='ms-ColumnManagementPanel-learnMoreLink'>
                    <Link href={ `https://o15.officeredir.microsoft.com/r/rlidOfficeWebHelp?p1=SPOStandard&clid=${this.props.currentLanguage}&ver=16&HelpId=WSSEndUser_FormulaSyntaxError` } target='_blank'>{ strings.formulaLearnMoreLink }</Link>
                </div>
                <TextField className='ms-ColumnManagementPanel-multilineTextField ms-ColumnManagementPanel-formulaTextField'
                    label={ strings.formulaLabel }
                    multiline rows={ 5 }
                    ref={ this._resolveRef('_formula') } />
                <InfoTeachingIcon className='ms-ColumnManagementPanel-messageGuideText'
                    label={ strings.userMessageLabel }
                    calloutContent={ strings.userMessageGuideText }
                    infoButtonAriaLabel={ strings.infoButtonAriaLabel } />
                <TextField className='ms-ColumnManagementPanel-multilineTextField ms-ColumnManagementPanel-userMessageTextField'
                    multiline rows={ 3 }
                    ref={ this._resolveRef('_userMessage') } />
            </div>
        );
    }

    @autobind
    public getFieldCreationSchema(): IFieldSchema {
        let choices = this.state.choicesText.split('\n').filter((choice) => { return choice; });
        let fieldSchema: IFieldSchema = {
            Type: this.state.allowMultipleSelection ? FieldType.MultiChoice : FieldType.Choice,
            DisplayName: this.state.name,
            Title: this.state.name,
            Description: this._description.value,
            DefaultValue: this.state.useCalculatedDefaultValue || this.state.defaultValue.key === 0 ? null : this.state.defaultValue.text,
            DefaultFormula: this.state.useCalculatedDefaultValue ? this.state.defaultValueFormula : null,
            Choices: choices,
            FillInChoice: this._allowManuallyAddValues ? this._allowManuallyAddValues.checked : false,
            Required: this._required ? this._required.checked : false,
            EnforceUniqueValues: this.state.enforceUniqueValues
        }
        if (this._formula && this._userMessage) {
            fieldSchema.Validation = {
                Formula: this._formula.value,
                Message: this._userMessage.value
            };
        }
        return fieldSchema;
    }

    @autobind
    private _showMoreClick() {
        this.setState((prevState: IColumnManagementPanelState) => ({
            showMoreOptions: !prevState.showMoreOptions
        }));
    }

    @autobind
    private _columnValidationClick() {
        this.setState((prevState: IColumnManagementPanelState) => ({
            showColumnValidation: !prevState.showColumnValidation
        }));
    }

    @autobind
    private _choicesChanged(newValue: string) {
        // Use value from the choices entry field to populate the default value dropdown
        let choices = newValue.split('\n');
        let newDropdownOptions = [{ key: 0, text: this.props.strings.choiceDefaultValue }];
        for (var i = 0; i < choices.length; i++) {
            if (choices[i]) {
                // Skip zero because that is the default 'None' which always stays
                newDropdownOptions.push({ key: i + 1, text: choices[i] });
            }
        }
        this.setState({
            choicesText: newValue,
            defaultValueDropdownOptions: newDropdownOptions
        });
    }

    @autobind
    private _onUseCalculatedValueChanged(ev: any, checked: boolean) {
        this.setState({
            useCalculatedDefaultValue: checked
        });
    }

    @autobind
    private _defaultFormulaChanged(newValue: string) {
        this.setState({ defaultValueFormula: newValue });
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
            this.props.onClearError && this.props.onClearError();
        }
        this.setState({ name: newValue });
        this.props.updateSaveDisabled && this.props.updateSaveDisabled(newValue);
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
}