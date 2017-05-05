// OneDrive:IgnoreCodeCoverage

import * as React from 'react';
import { Qos as QosEvent, ResultTypeEnum as QosResultEnum } from '@ms/odsp-utilities/lib/logging/events/Qos.event';
import { IColumnManagementPanelContentProps, ColumnManagementPanelDefaultsHelper, IColumnManagementPanelCurrentValues } from './index';
import { InfoTeachingIcon,
         ChoiceColumnUniqueFields,
         UserColumnUniqueFields,
         IUniqueFieldsComponent,
         IUniqueFieldsComponentSchemaValues
        } from './HelperComponents/index';
import { autobind, BaseComponent, css } from 'office-ui-fabric-react/lib/Utilities';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Spinner, SpinnerType } from 'office-ui-fabric-react/lib/Spinner';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { IFieldSchema, FieldType } from '@ms/odsp-datasources/lib/List';

const CURRENT_VALUES_KEYS_IN_STATE = ["name", "description", "allowMultipleSelection", "required", "enforceUniqueValues", "validationFormula", "validationMessage"];

export interface IColumnManagementPanelState {
    showMoreOptions?: boolean;
    showColumnValidation?: boolean;
    showColumnValidationLink?: boolean;
    isLoading?: boolean;
    failedToLoad?: boolean;
    name?: string;
    description?: string;
    allowMultipleSelection?: boolean;
    required?: boolean;
    enforceUniqueValues?: boolean;
    validationFormula?: string;
    validationMessage?: string;
}

export class ColumnManagementPanelContent extends BaseComponent<IColumnManagementPanelContentProps, IColumnManagementPanelState> {
    private _name: TextField;
    private _description: TextField;
    private _required: Toggle;
    private _validationFormula: TextField;
    private _userMessage: TextField;
    private _uniqueFields: IUniqueFieldsComponent;
    private _defaultsHelper: ColumnManagementPanelDefaultsHelper;
    private _currentValues: IColumnManagementPanelCurrentValues;

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
        this._defaultsHelper.getCurrentValues(this.props.strings, this.props.currentValuesPromise, this.props.fieldType).then((currentValues: IColumnManagementPanelCurrentValues) => {
            let state = {
                isLoading: false,
                showMoreOptions: false,
                showColumnValidation: false,
                showColumnValidationLink: !currentValues.allowMultipleSelection && currentValues.supportsValidation
            };
            CURRENT_VALUES_KEYS_IN_STATE.forEach((key) => state[key] = currentValues[key]);
            this._currentValues = currentValues;
            this.setState({ ...state });
            this.props.updateParentStateWithCurrentValues && this.props.updateParentStateWithCurrentValues(currentValues);
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
                    { this._currentValues.fieldType === FieldType.Choice &&
                    <ChoiceColumnUniqueFields
                        choicesText={ this._currentValues.choicesText }
                        defaultValue={ this._currentValues.defaultValue }
                        defaultFormula={ this._currentValues.defaultFormula }
                        useCalculatedDefaultValue={ this._currentValues.useCalculatedDefaultValue }
                        currentLanguage={ this.props.currentLanguage }
                        fillInChoice={ this._currentValues.fillInChoice }
                        strings={ this.props.strings }
                        getName={ this._getName }
                        updateSaveDisabled={ this.props.updateSaveDisabled }
                        ref={ this._resolveRef('_uniqueFields')} /> }
                    { this._currentValues.fieldType === FieldType.User &&
                    <UserColumnUniqueFields
                        strings={ this.props.strings }
                        selectionMode={ this._currentValues.selectionMode }
                        ref={ this._resolveRef('_uniqueFields')} /> }
                    <div className='ms-ColumnManagementPanel-moreOptionsButton'>
                        <Link onClick={ this._showMoreClick } aria-expanded={this.state.showMoreOptions} aria-controls='moreOptions'>{ strings.moreOptionsButtonText }</Link>
                    </div>
                    { this._moreOptions() }
                </div> }
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
        let type = this._currentValues.fieldType;
        if (this.state.allowMultipleSelection) {
            if (type === FieldType.Choice) {
                type = FieldType.MultiChoice;
            } else if (type === FieldType.User) {
                type = FieldType.UserMulti;
            }
        }
        let fieldSchema: IFieldSchema = {
            Type: type,
            DisplayName: this.state.name,
            Title: this.state.name,
            Description: this._description.value,
            Required: this._required.checked,
            EnforceUniqueValues: this.state.enforceUniqueValues,
            Indexed: this.state.enforceUniqueValues
        };
        if (!this.state.allowMultipleSelection && this._currentValues.supportsValidation) {
            fieldSchema.Validation = {
                Formula: this._validationFormula.value,
                Message: this._userMessage.value
            };
        }
        if (this._currentValues.fieldType === FieldType.User) {
            fieldSchema.UserSelectionScope = this._currentValues.selectionGroup;
            fieldSchema.ShowField = this._currentValues.lookupField;
        }
        if (type === FieldType.UserMulti) {
            fieldSchema.Mult = true;
        }
        let uniqueFieldsSchemaValues: IUniqueFieldsComponentSchemaValues = this._uniqueFields.getSchemaValues();
        fieldSchema = {
            ...fieldSchema,
            ...uniqueFieldsSchemaValues
        };
        return fieldSchema;
    }

    @autobind
    private _showMoreClick() {
        // If we are opening the show more options section, show the column validation section too if it is filled out.
        let hasValidationInfo = !!(this._validationFormula.value || this._userMessage.value);
        this.setState((prevState: IColumnManagementPanelState) => ({
            showMoreOptions: !prevState.showMoreOptions,
            ...!prevState.showMoreOptions && { showColumnValidation: this._currentValues.supportsValidation && hasValidationInfo }
        }));
    }

    @autobind
    private _columnValidationClick() {
        this.setState((prevState: IColumnManagementPanelState) => ({
            showColumnValidation: !prevState.showColumnValidation
        }));
    }

    @autobind
    private _getName() {
        return this.state.name;
    }

    @autobind
    private _nameChanged(newValue: string) {
        if (this.props.duplicateColumnName) {
            this.props.onClearError && this.props.onClearError();
        }
        this.setState({ name: newValue });
        this.props.updateSaveDisabled && this.props.updateSaveDisabled(newValue, this._uniqueFields.getRequiredValues());
    }

    @autobind
    private _multiSelectChanged(checked: boolean) {
        let hasValidationInfo = !!(this._validationFormula.value || this._userMessage.value);
        this.setState({
            allowMultipleSelection: checked,
            enforceUniqueValues: false,
            showColumnValidationLink: !checked && this._currentValues.supportsValidation,
            showColumnValidation: checked ? false : this._currentValues.supportsValidation && hasValidationInfo
        });
    }

    @autobind
    private _enforceUniqueValuesChanged(checked: boolean) {
        this.setState({
            enforceUniqueValues: checked
        });
    }
}