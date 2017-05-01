// OneDrive:IgnoreCodeCoverage

import * as React from 'react';
import { Qos as QosEvent, ResultTypeEnum as QosResultEnum } from '@ms/odsp-utilities/lib/logging/events/Qos.event';
import { IColumnManagementPanelContentProps, ColumnManagementPanelDefaultsHelper, IColumnManagementPanelCurrentValues } from './index';
import { InfoTeachingIcon } from './HelperComponents/index';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { autobind, BaseComponent, css } from 'office-ui-fabric-react/lib/Utilities';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { Spinner, SpinnerType } from 'office-ui-fabric-react/lib/Spinner';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { IFieldSchema, FieldType } from '@ms/odsp-datasources/lib/List';

export interface IColumnManagementPanelState {
    showMoreOptions?: boolean;
    showColumnValidation?: boolean;
    showColumnValidationLink?: boolean;
    isLoading?: boolean;
    failedToLoad?: boolean;
    choicesText?: string;
    name?: string;
    description?: string;
    useCalculatedDefaultValue?: boolean;
    defaultFormula?: string;
    defaultValueDropdownOptions?: IDropdownOption[];
    defaultValue?: IDropdownOption;
    fillInChoice?: boolean;
    allowMultipleSelection?: boolean;
    required?: boolean;
    enforceUniqueValues?: boolean;
    validationFormula?: string;
    validationMessage?: string;
}

export class ColumnManagementPanelContent extends BaseComponent<IColumnManagementPanelContentProps, IColumnManagementPanelState> {
    private _name: TextField;
    private _description: TextField;
    private _allowManuallyAddValues: Checkbox;
    private _required: Toggle;
    private _validationFormula: TextField;
    private _userMessage: TextField;
    private _defaultsHelper: ColumnManagementPanelDefaultsHelper;

    constructor(props: IColumnManagementPanelContentProps) {
        super(props);
        this._defaultsHelper = new ColumnManagementPanelDefaultsHelper();
        this.state = {
            isLoading: true,
            failedToLoad: false
        };
    }

    @autobind
    public componentDidMount() {
        let loadDataQos = this.props.isEditPanel ? new QosEvent({ name: 'ColumnManagementPanel.LoadColumnData'}) : null;
        this._defaultsHelper.getCurrentValues(this.props.strings, this.props.currentValuesPromise).then((currentValues: IColumnManagementPanelCurrentValues) => {
            let state = {
                isLoading: false,
                showMoreOptions: false,
                showColumnValidation: false,
                showColumnValidationLink: !currentValues.allowMultipleSelection,
                ...currentValues
            };
            this._choicesChanged(state.choicesText);
            this.setState({ ...state });
            this.props.updateParentStateWithCurrentValues && this.props.updateParentStateWithCurrentValues(state);
            loadDataQos && loadDataQos.end({ resultType: QosResultEnum.Success });
        }, (error: any) => {
            this.setState({ isLoading: false, failedToLoad: true });
            loadDataQos && loadDataQos.end({ resultType: QosResultEnum.Failure, error: error });
        });
    }

    public componentDidUpdate(prevProps, prevState) {
        if (!prevProps.duplicateColumnName && this.props.duplicateColumnName) {
            this._name.focus();
        }
    }

    public render() {
        let strings = this.props.strings;
        return (
            <div>
                { this.state.isLoading && <Spinner className='ms-ColumnManagementPanel-spinner' type={ SpinnerType.large } /> }
                <div role='region' aria-live='polite' className={'ms-ColumnManagementPanel-loadingError'}>
                    { this.state.failedToLoad &&
                    <span>{ strings.failureToLoadEditPanel }</span> }
                </div>
                { !this.state.isLoading && !this.state.failedToLoad &&
                <div className='ms-ColumnManagementPanel-content'>
                    <div className='ms-ColumnManagementPanel-titleLearnMore'>
                        <Link href={ `https://o15.officeredir.microsoft.com/r/rlidOfficeWebHelp?p1=SPOStandard&clid=${this.props.currentLanguage}&ver=16&HelpId=WSSEndUser_CreateColumnPanelTitle` } target='_blank'>{ this.props.isEditPanel ? strings.editPanelTitleLearnMore : strings.titleLearnMore }</Link>
                    </div>
                    <TextField className='ms-ColumnManagementPanel-nameTextField'
                        label={ strings.nameLabel }
                        required={ true }
                        defaultValue ={ this.state.name }
                        onChanged={ this._nameChanged }
                        errorMessage={  this.props.duplicateColumnName ? strings.duplicateColumnNameError : ""}
                        ref={ this._resolveRef('_name') } />
                    <TextField className='ms-ColumnManagementPanel-multilineTextField ms-ColumnManagementPanel-descriptionTextField'
                        label={ strings.descriptionLabel }
                        defaultValue={ this.state.description }
                        multiline rows={ 3 }
                        ref={ this._resolveRef('_description') } />
                    { this._uniqueFields() }
                    <div className='ms-ColumnManagementPanel-moreOptionsButton'>
                        <Link onClick={ this._showMoreClick } aria-expanded={this.state.showMoreOptions} aria-controls='moreOptions'>{ strings.moreOptionsButtonText }</Link>
                    </div>
                    { this._moreOptions() }
                </div> }
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
                <div className='ms-ColumnManagementPanel-allowManuallyAddValues'>
                    <Checkbox className='ms-ColumnManagementPanel-checkbox'
                        label={ strings.manuallyAddValuesCheckbox }
                        defaultChecked={ this.state.fillInChoice }
                        ref={ this._resolveRef('_allowManuallyAddValues') } />
                    <InfoTeachingIcon className='ms-ColumnManagementPanel-checkboxInfo'
                    infoButtonAriaLabel={ strings.infoButtonAriaLabel }
                    calloutContent={ strings.manuallyAddValuesTeachingBubble } />
                </div>
                <div className='ms-ColumnManagementPanel-defaultValueContainer'>
                    { this.state.useCalculatedDefaultValue ?
                    <TextField className='ms-ColumnManagementPanel-defaultValueEntryField'
                        placeholder={ strings.defaultFormulaPlaceholder }
                        ariaLabel={ strings.defaultFormulaAriaLabel }
                        label={ strings.defaultValueHeader }
                        value={ this.state.defaultFormula }
                        onChanged={ this._defaultFormulaChanged } /> :
                    <Dropdown className='ms-ColumnManagementPanel-defaultValueDropdown'
                        label={ strings.defaultValueHeader }
                        ariaLabel={ strings.defaultValueDropdownAriaLabel }
                        options={ this.state.defaultValueDropdownOptions }
                        selectedKey={ this.state.defaultValue.key }
                        onChanged={ this._choiceDropdownChanged }
                        ref={ this._resolveRef('_defaultValueDropdown') } /> }
                    <div className='ms-ColumnManagementPanel-useCalculatedValue'>
                        <Checkbox className='ms-ColumnManagementPanel-checkbox'
                            label={ strings.useCalculatedValue }
                            defaultChecked={ this.state.useCalculatedDefaultValue }
                            onChange={ this._onUseCalculatedValueChanged } />
                        <InfoTeachingIcon className='ms-ColumnManagementPanel-checkboxInfo'
                        infoButtonAriaLabel={ strings.infoButtonAriaLabel }
                        calloutContent={ strings.useCalculatedValueTeachingBubble }
                        helpLink={{
                            href: `https://o15.officeredir.microsoft.com/r/rlidOfficeWebHelp?p1=SPOStandard&clid=${this.props.currentLanguage}&ver=16&HelpId=WSSEndUser_FormulaSyntaxError`,
                            displayText: strings.formulaLearnMoreLink
                        }} />
                    </div>
                </div>
            </div>
        );
    }

    @autobind
    private _moreOptions() {
        let strings = this.props.strings;
        return (
            <div className={ css('ms-ColumnManagementPanel-moreOptions', { 'hidden': !this.state.showMoreOptions })} id='moreOptions'>
                <Toggle className='ms-ColumnManagementPanel-toggle'
                    defaultChecked={ this.state.allowMultipleSelection }
                    label= { strings.allowMultipleSelectionToggle }
                    onText = { strings.toggleOnText }
                    offText = { strings.toggleOffText }
                    onChanged = { this._multiSelectChanged }
                    ref={ this._resolveRef('_allowMultipleSelection') } />
                <Toggle className='ms-ColumnManagementPanel-toggle'
                    defaultChecked={ this.state.required }
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
                <div role='region' aria-live='polite' aria-relevant='additions removals' className = 'ms-ColumnManagementPanel-columnValidationButton'>
                    { this.state.showColumnValidationLink &&
                    <Link onClick={ this._columnValidationClick } aria-expanded={this.state.showColumnValidation} aria-controls='columnValidation'>{ strings.columnValidationButtonText }</Link> }
                </div>
                { this._columnValidation() }
            </div>
        );
    }

    @autobind
    private _columnValidation() {
        let strings = this.props.strings;
        return (
            <div className={ css('ms-ColumnManagementPanel-columnValidation', { 'hidden': !this.state.showColumnValidation })} id='columnValidation'>
                <div className='ms-ColumnManagementPanel-validationGuideText'>
                    { strings.columnValidationGuideText }
                </div>
                <div className='ms-ColumnManagementPanel-learnMoreLink'>
                    <Link href={ `https://o15.officeredir.microsoft.com/r/rlidOfficeWebHelp?p1=SPOStandard&clid=${this.props.currentLanguage}&ver=16&HelpId=WSSEndUser_FormulaSyntaxError` } target='_blank'>{ strings.formulaLearnMoreLink }</Link>
                </div>
                <TextField className='ms-ColumnManagementPanel-multilineTextField ms-ColumnManagementPanel-formulaTextField'
                    label={ strings.formulaLabel }
                    defaultValue={ this.state.validationFormula }
                    multiline rows={ 5 }
                    ref={ this._resolveRef('_validationFormula') } />
                <InfoTeachingIcon className='ms-ColumnManagementPanel-messageGuideText'
                    label={ strings.userMessageLabel }
                    calloutContent={ strings.userMessageGuideText }
                    infoButtonAriaLabel={ strings.infoButtonAriaLabel } />
                <TextField className='ms-ColumnManagementPanel-multilineTextField ms-ColumnManagementPanel-userMessageTextField'
                    defaultValue={ this.state.validationMessage }
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
            DefaultFormula: this.state.useCalculatedDefaultValue ? this.state.defaultFormula : null,
            Choices: choices,
            FillInChoice: this._allowManuallyAddValues.checked,
            Required: this._required.checked,
            EnforceUniqueValues: this.state.enforceUniqueValues,
            Indexed: this.state.enforceUniqueValues
        }
        if (!this.state.allowMultipleSelection) {
            fieldSchema.Validation = {
                Formula: this._validationFormula.value,
                Message: this._userMessage.value
            };
        }
        return fieldSchema;
    }

    @autobind
    private _showMoreClick() {
        // If we are opening the show more options section, show the column validation section too if it is filled out.
        let hasValidationInfo = !!(this._validationFormula.value || this._userMessage.value);
        this.setState((prevState: IColumnManagementPanelState) => ({
            showMoreOptions: !prevState.showMoreOptions,
            ...!prevState.showMoreOptions && { showColumnValidation: hasValidationInfo }
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
        this.props.updateSaveDisabled && this.props.updateSaveDisabled(this.state.name, newValue);
    }

    @autobind
    private _onUseCalculatedValueChanged(ev: any, checked: boolean) {
        this.setState({
            useCalculatedDefaultValue: checked
        });
    }

    @autobind
    private _defaultFormulaChanged(newValue: string) {
        this.setState({ defaultFormula: newValue });
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
        this.props.updateSaveDisabled && this.props.updateSaveDisabled(newValue, this.state.choicesText);
    }

    @autobind
    private _multiSelectChanged(checked: boolean) {
        let hasValidationInfo = !!(this._validationFormula.value || this._userMessage.value);
        this.setState({
            allowMultipleSelection: checked,
            enforceUniqueValues: false,
            showColumnValidationLink: !checked,
            showColumnValidation: checked ? false : hasValidationInfo
        });
    }

    @autobind
    private _enforceUniqueValuesChanged(checked: boolean) {
        this.setState({
            enforceUniqueValues: checked
        });
    }
}