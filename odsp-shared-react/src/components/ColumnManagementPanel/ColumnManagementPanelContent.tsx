// OneDrive:IgnoreCodeCoverage

import * as React from 'react';
import { Qos as QosEvent, ResultTypeEnum as QosResultEnum } from '@ms/odsp-utilities/lib/logging/events/Qos.event';
import { ColumnManagementPanelDefaultsHelper, IColumnManagementPanelCurrentValues } from './ColumnManagementPanelDefaultsHelper';
import { IColumnManagementPanelContentProps } from './ColumnManagementPanel.Props';
import {
    IUniqueFieldsComponent,
    IUniqueFieldsComponentSchemaValues,
    IUniqueFieldsComponentRequiredValues,
    ChoiceColumnUniqueFields,
    UserColumnUniqueFields,
    NumberColumnUniqueFields,
    BooleanColumnUniqueFields
} from './HelperComponents/UniqueFieldsComponents/index';
import {
    IMoreOptionsComponent,
    IMoreOptionsComponentSchemaValues,
    IBaseMoreOptionsComponent,
    IBaseMoreOptionsComponentSchemaValues,
    IBaseMoreOptionsProps,
    BaseMoreOptions,
    NumberColumnMoreOptions,
    TextColumnMoreOptions,
    NoteColumnMoreOptions
} from './HelperComponents/MoreOptionsComponents/index';
import {
    InfoTeachingIcon,
    DefaultValueEntryField
} from './HelperComponents/SharedComponents/index';
import { autobind, BaseComponent, css } from 'office-ui-fabric-react/lib/Utilities';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Spinner, SpinnerType } from 'office-ui-fabric-react/lib/Spinner';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { IFieldSchema, FieldType } from '@ms/odsp-datasources/lib/List';
import * as StringHelper from '@ms/odsp-utilities/lib/string/StringHelper';

const DISPLAY_PROPERTIES = {
    "Choice": {
        showAllowMultipleToggle: true,
        showEnforceUniqueToggle: true
    },
    "User": {
        showAllowMultipleToggle: true,
        showEnforceUniqueToggle: true
    },
    "Number": {
        showEnforceUniqueToggle: true
    },
    "Note": {
        showUnlimitedLengthInDocumentLibraryToggle: true
    },
    "Text": {
        showEnforceUniqueToggle: true
    }
};

/** A subset of the properties in @ms/odsp-datasouces/lib/interfaces/list/IFieldSchema. */
export interface IColumnManagementPanelSchemaValues {
    DisplayName: string;
    Title?: string;
    Description?: string;
    Validation?: {
        Formula: string;
        Message: string;
    }
}

export interface IColumnManagementPanelState {
    showMoreOptions?: boolean;
    showColumnValidation?: boolean;
    showColumnValidationLink?: boolean;
    allowMultipleSelection?: boolean;
    validateMoreOptions?: boolean;
    isLoading?: boolean;
    failedToLoad?: boolean;
    name?: string;
}

export class ColumnManagementPanelContent extends BaseComponent<IColumnManagementPanelContentProps, IColumnManagementPanelState> {
    private _name: TextField;
    private _description: TextField;
    private _validationFormula: TextField;
    private _userMessage: TextField;
    private _uniqueFields: IUniqueFieldsComponent;
    private _baseMoreOptions: IBaseMoreOptionsComponent;
    private _typeMoreOptions: IMoreOptionsComponent;
    private _defaultsHelper: ColumnManagementPanelDefaultsHelper;
    private _currentValues: IColumnManagementPanelCurrentValues;
    private _formulaLearnMoreLink: string;
    private _titleLearnMoreLink: string;

    constructor(props: IColumnManagementPanelContentProps) {
        super(props);
        this._defaultsHelper = new ColumnManagementPanelDefaultsHelper();
        this.state = {
            isLoading: true,
            failedToLoad: false
        };

        this._formulaLearnMoreLink = `https://o15.officeredir.microsoft.com/r/rlidOfficeWebHelp?p1=SPOStandard&clid=${this.props.currentLanguage}&ver=16&HelpId=WSSEndUser_FormulaSyntaxError`;
        this._titleLearnMoreLink = `https://o15.officeredir.microsoft.com/r/rlidOfficeWebHelp?p1=SPOStandard&clid=${this.props.currentLanguage}&ver=16&HelpId=WSSEndUser_CreateColumnPanelTitle`;
    }

    @autobind
    public componentDidMount() {
        let loadDataQos = this.props.isEditPanel ? new QosEvent({ name: 'ColumnManagementPanel.LoadColumnData' }) : null;
        this._defaultsHelper.getCurrentValues(this.props.strings, this.props.currentValuesPromise, this.props.fieldType).then((currentValues: IColumnManagementPanelCurrentValues) => {
            this._currentValues = currentValues;
            this.setState({
                isLoading: false,
                showMoreOptions: false,
                validateMoreOptions: false,
                showColumnValidation: false,
                showColumnValidationLink: !currentValues.allowMultipleSelection && currentValues.supportsValidation,
                allowMultipleSelection: currentValues.allowMultipleSelection,
                name: currentValues.name
            });
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
                <div role='region' aria-live='polite' className={ 'ms-ColumnManagementPanel-loadingError' }>
                    { this.state.failedToLoad &&
                        <span>{ strings.failureToLoadEditPanel }</span> }
                </div>
                { !this.state.isLoading && !this.state.failedToLoad &&
                    <div className='ms-ColumnManagementPanel-content'>
                        <div className='ms-ColumnManagementPanel-titleLearnMore'>
                            <Link href={ this._titleLearnMoreLink } target='_blank'>{ this.props.isEditPanel ? strings.editPanelTitleLearnMore : strings.titleLearnMore }</Link>
                        </div>
                        <TextField className='ms-ColumnManagementPanel-nameTextField'
                            label={ strings.nameLabel }
                            required={ true }
                            defaultValue={ this.state.name }
                            onChanged={ this._nameChanged }
                            errorMessage={ this.props.duplicateColumnName ? strings.duplicateColumnNameError : "" }
                            ref={ this._resolveRef('_name') } />
                        <TextField className={ css('ms-ColumnManagementPanel-descriptionTextField', { 'noUniqueFields': this._currentValues.fieldType === FieldType.URL }) }
                            label={ strings.descriptionLabel }
                            defaultValue={ this._currentValues.description }
                            multiline rows={ 3 }
                            ref={ this._resolveRef('_description') } />
                        { this._currentValues.fieldType === FieldType.Choice &&
                            <ChoiceColumnUniqueFields
                                choicesText={ this._currentValues.choicesText }
                                defaultValue={ this._currentValues.defaultChoiceValue }
                                defaultFormula={ this._currentValues.defaultFormula }
                                useCalculatedDefaultValue={ this._currentValues.useCalculatedDefaultValue }
                                formulaLearnMoreLink={ this._formulaLearnMoreLink }
                                fillInChoice={ this._currentValues.fillInChoice }
                                strings={ this.props.strings }
                                updateSaveDisabled={ this._componentUpdateSaveDisabled }
                                ref={ this._resolveRef('_uniqueFields') } /> }
                        { this._currentValues.fieldType === FieldType.User &&
                            <UserColumnUniqueFields
                                strings={ this.props.strings }
                                selectionMode={ this._currentValues.selectionMode }
                                ref={ this._resolveRef('_uniqueFields') } /> }
                        { this._currentValues.fieldType === FieldType.Number &&
                            <NumberColumnUniqueFields
                                defaultValue={ this._currentValues.defaultValue }
                                defaultFormula={ this._currentValues.defaultFormula }
                                useCalculatedDefaultValue={ this._currentValues.useCalculatedDefaultValue }
                                showAsPercentage={ this._currentValues.showAsPercentage }
                                displayFormat={ this._currentValues.displayFormat }
                                formulaLearnMoreLink={ this._formulaLearnMoreLink }
                                strings={ this.props.strings }
                                ref={ this._resolveRef('_uniqueFields') } /> }
                        { this._currentValues.fieldType === FieldType.Boolean &&
                            <BooleanColumnUniqueFields
                                defaultValue={ this._currentValues.defaultValue }
                                strings={ this.props.strings }
                                ref={ this._resolveRef('_uniqueFields') } /> }
                        { this._currentValues.fieldType === FieldType.Text &&
                            <DefaultValueEntryField
                                defaultValue={ this._currentValues.defaultValue }
                                defaultFormula={ this._currentValues.defaultFormula }
                                useCalculatedDefaultValue={ this._currentValues.useCalculatedDefaultValue }
                                strings={ this.props.strings }
                                defaultValuePlaceholder={ this.props.strings.defaultValuePlaceholder }
                                defaultValueAriaLabel={ this.props.strings.defaultValueAriaLabel }
                                formulaLearnMoreLink={ this._formulaLearnMoreLink }
                                ref={ this._resolveRef('_uniqueFields') } /> }
                        { this._currentValues.fieldType === FieldType.Note &&
                            <DefaultValueEntryField
                                defaultValue={ this._currentValues.defaultValue }
                                defaultFormula={ this._currentValues.defaultFormula }
                                useCalculatedDefaultValue={ this._currentValues.useCalculatedDefaultValue }
                                strings={ this.props.strings }
                                defaultValuePlaceholder={ this.props.strings.defaultValuePlaceholder }
                                defaultValueAriaLabel={ this.props.strings.defaultValueAriaLabel }
                                formulaLearnMoreLink={ this._formulaLearnMoreLink }
                                ref={ this._resolveRef('_uniqueFields') } /> }
                        <div className='ms-ColumnManagementPanel-moreOptionsButton'>
                            <Link onClick={ this._showHideMoreOptions } aria-expanded={ this.state.showMoreOptions } aria-controls='moreOptions'>{ strings.moreOptionsButtonText }</Link>
                        </div>
                        { this._moreOptions() }
                    </div> }
            </div>
        );
    }

    @autobind
    private _moreOptions() {
        let strings = this.props.strings;
        let displayProperties = DISPLAY_PROPERTIES[FieldType[this._currentValues.fieldType]];
        let baseMoreOptionsProps: IBaseMoreOptionsProps = {
            allowMultipleSelection: this._currentValues.allowMultipleSelection,
            enforceUniqueValues: this._currentValues.enforceUniqueValues,
            unlimitedLengthInDocumentLibrary: this._currentValues.unlimitedLengthInDocumentLibrary,
            required: this._currentValues.required,
            updateShowColumnValidationState: this._updateShowColumnValidationState,
            strings: strings,
            fieldType: this._currentValues.fieldType,
            showEnforceUniqueToggle: displayProperties && displayProperties.showEnforceUniqueToggle,
            showAllowMultipleToggle: displayProperties && displayProperties.showAllowMultipleToggle,
            showUnlimitedLengthInDocumentLibraryToggle: displayProperties && displayProperties.showUnlimitedLengthInDocumentLibraryToggle && this.props.isDocumentLibrary
        };
        return (
            <div className={ css('ms-ColumnManagementPanel-moreOptions', { 'hidden': !this.state.showMoreOptions }) } id='moreOptions'>
                { this._currentValues.fieldType === FieldType.Number &&
                    <NumberColumnMoreOptions
                        minimumValue={ this._currentValues.minimumValue }
                        maximumValue={ this._currentValues.maximumValue }
                        strings={ this.props.strings }
                        showMoreOptions={ this._showMoreOptions }
                        clearValidateMoreOptions={ this._clearValidateMoreOptions }
                        validateMoreOptions={ this.state.validateMoreOptions }
                        ref={ this._resolveRef('_typeMoreOptions') } /> }
                { this._currentValues.fieldType === FieldType.Text &&
                    <TextColumnMoreOptions
                        maxLength={ this._currentValues.maxLength }
                        strings={ this.props.strings }
                        showMoreOptions={ this._showMoreOptions }
                        ref={ this._resolveRef('_typeMoreOptions') } /> }
                { this._currentValues.fieldType === FieldType.Note &&
                    <NoteColumnMoreOptions
                        numberOfLines={ this._currentValues.numberOfLines }
                        showMoreOptions={ this._showMoreOptions }
                        strings={ this.props.strings }
                        forDocumentLibrary={this.props.isDocumentLibrary}
                        richText={this._currentValues.richText}
                        appendOnly={this._currentValues.appendOnly}
                        versionEnabled={this.props.enableVersions}
                        ref={ this._resolveRef('_typeMoreOptions') } /> }
                <BaseMoreOptions { ...baseMoreOptionsProps }
                    ref={ this._resolveRef('_baseMoreOptions') } />
                <div role='region' aria-live='polite' aria-relevant='additions removals' className='ms-ColumnManagementPanel-columnValidationButton'>
                    { this.state.showColumnValidationLink &&
                        <Link onClick={ this._columnValidationClick } aria-expanded={ this.state.showColumnValidation } aria-controls='columnValidation'>{ strings.columnValidationButtonText }</Link> }
                </div>
                { this._columnValidation() }
            </div>
        );
    }

    @autobind
    private _columnValidation() {
        let strings = this.props.strings;
        return (
            <div className={ css('ms-ColumnManagementPanel-columnValidation', { 'hidden': !this.state.showColumnValidation }) } id='columnValidation'>
                <div className='ms-ColumnManagementPanel-validationGuideText'>
                    { strings.columnValidationGuideText }
                </div>
                <div className='ms-ColumnManagementPanel-learnMoreLink'>
                    <Link href={ this._formulaLearnMoreLink } target='_blank'>{ strings.formulaLearnMoreLink }</Link>
                </div>
                <TextField className='ms-ColumnManagementPanel-formulaTextField'
                    label={ strings.formulaLabel }
                    defaultValue={ this._currentValues.validationFormula }
                    multiline rows={ 5 }
                    ref={ this._resolveRef('_validationFormula') } />
                <InfoTeachingIcon className='ms-ColumnManagementPanel-messageGuideText'
                    label={ strings.userMessageLabel }
                    calloutContent={ strings.userMessageGuideText }
                    infoButtonAriaLabel={ strings.infoButtonAriaLabelFormat ? StringHelper.format(strings.infoButtonAriaLabelFormat, strings.userMessageLabel) : strings.infoButtonAriaLabel } />
                <TextField className='ms-ColumnManagementPanel-userMessageTextField'
                    ariaLabel={ strings.userMessageLabel }
                    defaultValue={ this._currentValues.validationMessage }
                    multiline rows={ 3 }
                    ref={ this._resolveRef('_userMessage') } />
            </div>
        );
    }

    @autobind
    public getFieldCreationSchema(): IFieldSchema | false {
        let baseMoreOptionsSchemaValues: IBaseMoreOptionsComponentSchemaValues = this._baseMoreOptions.getSchemaValues();
        let moreOptionsSchemaValues: IMoreOptionsComponentSchemaValues | false = this._typeMoreOptions && this._typeMoreOptions.getSchemaValues();
        let uniqueFieldsSchemaValues: IUniqueFieldsComponentSchemaValues | false = this._uniqueFields && this._uniqueFields.getSchemaValues();
        if ((this._typeMoreOptions && !moreOptionsSchemaValues) || (this._uniqueFields && !uniqueFieldsSchemaValues)) {
            return false;
        }
        let panelSchemaValues: IColumnManagementPanelSchemaValues = {
            DisplayName: this.state.name,
            Title: this.state.name,
            Description: this._description.value
        };
        if (!this.state.allowMultipleSelection && this._currentValues.supportsValidation) {
            panelSchemaValues.Validation = {
                Formula: this._validationFormula.value,
                Message: this._userMessage.value
            };
        }
        let fieldSchema: IFieldSchema = {
            ...baseMoreOptionsSchemaValues,
            ...panelSchemaValues,
            ...uniqueFieldsSchemaValues && uniqueFieldsSchemaValues,
            ...moreOptionsSchemaValues && moreOptionsSchemaValues
        }
        if (this._currentValues.fieldType === FieldType.User) {
            fieldSchema.UserSelectionScope = this._currentValues.selectionGroup;
            fieldSchema.ShowField = this._currentValues.lookupField;
        }
        if (this._currentValues.fieldType === FieldType.URL) {
            fieldSchema.Format = this._currentValues.displayFormat === 0 || this.props.isHyperlink ? "Hyperlink" : "Image";
        }
        return fieldSchema;
    }

    @autobind
    public focusFirstElement() {
        this._name.focus();
        let len = this._name.value.length;
        this._name.setSelectionRange(len, len);
    }

    @autobind
    private _showHideMoreOptions() {
        // If we are opening the show more options section, show the column validation section too if it is filled out.
        let hasValidationInfo = !!(this._validationFormula.value || this._userMessage.value);
        this.setState((prevState: IColumnManagementPanelState) => ({
            showMoreOptions: !prevState.showMoreOptions,
            ...!prevState.showMoreOptions && { showColumnValidation: this._currentValues.supportsValidation && hasValidationInfo }
        }));
    }

    @autobind
    private _showMoreOptions(callback?: () => void) {
        let hasValidationInfo = !!(this._validationFormula.value || this._userMessage.value);
        this.setState({
            showMoreOptions: true,
            showColumnValidation: this._currentValues.supportsValidation && hasValidationInfo,
            validateMoreOptions: true
        }, callback);
    }

    @autobind
    private _clearValidateMoreOptions() {
        this.setState({
            validateMoreOptions: false
        });
    }

    @autobind
    private _updateShowColumnValidationState(allowMultipleSelection: boolean) {
        let hasValidationInfo = !!(this._validationFormula.value || this._userMessage.value);
        this.setState({
            allowMultipleSelection: allowMultipleSelection,
            showColumnValidationLink: !allowMultipleSelection && this._currentValues.supportsValidation,
            showColumnValidation: allowMultipleSelection ? false : this._currentValues.supportsValidation && hasValidationInfo
        });
    }

    @autobind
    private _columnValidationClick() {
        this.setState((prevState: IColumnManagementPanelState) => ({
            showColumnValidation: !prevState.showColumnValidation
        }));
    }

    @autobind
    private _componentUpdateSaveDisabled(requiredValues: IUniqueFieldsComponentRequiredValues) {
        this.props.updateSaveDisabled(this.state.name, requiredValues);
    }

    @autobind
    private _nameChanged(newValue: string) {
        if (this.props.duplicateColumnName) {
            this.props.onClearError && this.props.onClearError();
        }
        this.setState({ name: newValue });
        let requiredValues = this._uniqueFields && this._uniqueFields.getRequiredValues && this._uniqueFields.getRequiredValues();
        this.props.updateSaveDisabled(newValue, requiredValues);
    }
}