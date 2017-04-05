// OneDrive:IgnoreCodeCoverage

import * as React from 'react';
import { ICreateColumnPanelContentProps } from './index';
import { InfoTeachingIcon } from './HelperComponents/index';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { autobind, BaseComponent } from 'office-ui-fabric-react/lib/Utilities';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { ICreateFieldOptions, FieldType } from '@ms/odsp-datasources/lib/List';

export interface ICreateColumnPanelState {
    showMoreOptions?: boolean;
    showColumnValidation?: boolean;
    choices?: string[];
    choicesText?: string;
    calculatedDefaultValue?: boolean;
    defaultValueFormula?: string;
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
    private _required: Toggle;
    private _formula: TextField;
    private _userMessage: TextField;

    constructor(props: ICreateColumnPanelContentProps) {
        super(props);
        let defaultValue = { key: 0, text: this.props.strings.choiceDefaultValue };
        this.state = {
            showMoreOptions: false,
            showColumnValidation: false,
            choicesText: this.props.strings.choicesPlaceholder,
            calculatedDefaultValue: false,
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
        return (
            <div className='ms-CreateColumnPanel-content'>
                <div className='ms-CreateColumnPanel-titleLearnMore'>
                    <Link href={ `https://o15.officeredir.microsoft.com/r/rlidOfficeWebHelp?p1=SPOStandard&clid=${this.props.currentLanguage}&ver=16&HelpId=WSSEndUser_CreateColumnPanelTitle` } target='_blank'>{ this.props.strings.titleLearnMore }</Link>
                </div>
                <TextField className='ms-CreateColumnPanel-nameTextField' label={ this.props.strings.nameLabel } required={ true } onChanged={ this._nameChanged } errorMessage={  this.props.duplicateColumnName ? this.props.strings.duplicateColumnNameError : ""} ref={ this._resolveRef('_name') } />
                <TextField className='ms-CreateColumnPanel-multilineTextField ms-CreateColumnPanel-descriptionTextField' label={ this.props.strings.descriptionLabel } multiline rows={ 3 } ref={ this._resolveRef('_description') } />
                { this._uniqueFields() }
                <div className='ms-CreateColumnPanel-moreOptionsButton'>
                    <Link onClick={ this._showMoreClick } aria-expanded={this.state.showMoreOptions} aria-controls='moreOptions'>{ this.props.strings.moreOptionsButtonText }</Link>
                </div>
                { this.state.showMoreOptions ? this._moreOptions() : null }
            </div>
        );
    }

    @autobind
    private _uniqueFields() {
        return (
            <div className='ms-CreateColumnPanel-uniqueFields'>
                <TextField className='ms-CreateColumnPanel-multilineTextField ms-CreateColumnPanel-choicesTextField'
                    label={ this.props.strings.choicesLabel }
                    value={ this.state.choicesText }
                    ariaLabel={ this.props.strings.choicesAriaLabel }
                    onChanged={ this._choicesChanged }
                    required={ true } multiline rows={ 9 }/>
                <div className='ms-CreateColumnPanel-defaultValueContainer'>
                    <div className='ms-CreateColumnPanel-defaultValueHeader'>{ this.props.strings.defaultValueHeader }</div>
                    <div className='ms-CreateColumnPanel-useCalculatedValue'>
                        <Checkbox className='ms-CreateColumnPanel-checkbox' label={ this.props.strings.useCalculatedValue } onChange={ this._onUseCalculatedValueChanged } />
                        <InfoTeachingIcon className='ms-CreateColumnPanel-checkboxInfo'
                        infoButtonAriaLabel={ this.props.strings.infoButtonAriaLabel }
                        calloutContent={ this.props.strings.useCalculatedValueTeachingBubble }
                        helpLink={{
                            href: `https://o15.officeredir.microsoft.com/r/rlidOfficeWebHelp?p1=SPOStandard&clid=${this.props.currentLanguage}&ver=16&HelpId=WSSEndUser_FormulaSyntaxError`,
                            displayText: this.props.strings.formulaLearnMoreLink
                        }} />
                    </div>
                    { this.state.calculatedDefaultValue ?
                    <TextField className='ms-CreateColumnPanel-defaultValueEntryField'
                        placeholder={ this.props.strings.defaultValuePlaceholder }
                        ariaLabel={ this.props.strings.defaultValuePlaceholder }
                        value={ this.state.defaultValueFormula }
                        onChanged={ this._defaultFormulaChanged } /> :
                    <Dropdown className='ms-CreateColumnPanel-defaultValueDropdown'
                        label={ null }
                        options={ this.state.defaultValueDropdownOptions }
                        selectedKey={ this.state.defaultValue.key }
                        onChanged={ this._choiceDropdownChanged }
                        ref={ this._resolveRef('_defaultValueDropdown') } /> }
                </div>
                <div className='ms-CreateColumnPanel-allowManuallyAddValues'>
                    <Checkbox className='ms-CreateColumnPanel-checkbox' label={ this.props.strings.manuallyAddValuesCheckbox } ref={ this._resolveRef('_allowManuallyAddValues') } />
                    <InfoTeachingIcon className='ms-CreateColumnPanel-checkboxInfo'
                    infoButtonAriaLabel={ this.props.strings.infoButtonAriaLabel }
                    calloutContent={ this.props.strings.manuallyAddValuesTeachingBubble } />
                </div>
            </div>
        );
    }

    @autobind
    private _moreOptions() {
        return (
            <div className='ms-CreateColumnPanel-moreOptions' id='moreOptions'>
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
                    <Link onClick={ this._columnValidationClick } aria-expanded={this.state.showColumnValidation} aria-controls='columnValidation'>{ this.props.strings.columnValidationButtonText }</Link>
                </div>
                { this.state.showColumnValidation ? this._columnValidation() : null }
            </div>
        );
    }

    @autobind
    private _columnValidation() {
        return (
            <div className='ms-CreateColumnPanel-columnValidation' id='columnValidation'>
                <div className='ms-CreateColumnPanel-validationGuideText'>
                    { this.props.strings.columnValidationGuideText }
                </div>
                <div className='ms-CreateColumnPanel-learnMoreLink'>
                    <Link href={ `https://o15.officeredir.microsoft.com/r/rlidOfficeWebHelp?p1=SPOStandard&clid=${this.props.currentLanguage}&ver=16&HelpId=WSSEndUser_FormulaSyntaxError` } target='_blank'>{ this.props.strings.formulaLearnMoreLink }</Link>
                </div>
                <TextField className='ms-CreateColumnPanel-multilineTextField ms-CreateColumnPanel-formulaTextField'
                    label={ this.props.strings.formulaLabel }
                    multiline rows={ 5 }
                    ref={ this._resolveRef('_formula') } />
                <InfoTeachingIcon className='ms-CreateColumnPanel-messageGuideText'
                    label={ this.props.strings.userMessageLabel }
                    calloutContent={ this.props.strings.userMessageGuideText }
                    infoButtonAriaLabel={ this.props.strings.infoButtonAriaLabel } />
                <TextField className='ms-CreateColumnPanel-multilineTextField ms-CreateColumnPanel-userMessageTextField'
                    multiline rows={ 3 }
                    ref={ this._resolveRef('_userMessage') } />
            </div>
        );
    }

    @autobind
    public getCreateFieldInfo(): ICreateFieldOptions {
        let choices = this.state.choicesText.split('\n').filter((choice) => { return choice; });
        let options: ICreateFieldOptions = {
            type: this.state.allowMultipleSelection ? FieldType.MultiChoice : FieldType.Choice,
            displayName: this.state.name,
            description: this._description.value,
            defaultValue: this.state.defaultValue.key === 0 ? null : this.state.defaultValue.text,
            defaultFormula: this.state.defaultValueFormula,
            choices: choices,
            fillInChoice: this._allowManuallyAddValues ? this._allowManuallyAddValues.checked : false,
            required: this._required ? this._required.checked : false,
            enforceUniqueValues: this.state.enforceUniqueValues
        }
        if (this._formula && this._userMessage) {
            options.validation = {
                formula: this._formula.value,
                message: this._userMessage.value
            };
        }
        return options;
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
            calculatedDefaultValue: checked
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
            this.props.onClearError();
        }
        this.setState({ name: newValue });
        this.props.updateSaveDisabled(newValue);
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