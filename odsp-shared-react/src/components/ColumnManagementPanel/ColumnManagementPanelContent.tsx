// OneDrive:IgnoreCodeCoverage

import * as React from 'react';
import { Qos as QosEvent, ResultTypeEnum as QosResultEnum } from '@ms/odsp-utilities/lib/logging/events/Qos.event';
import { ColumnManagementPanelDefaultsHelper, IColumnManagementPanelCurrentValues } from './ColumnManagementPanelDefaultsHelper';
import { FieldTypeSwitcherHelper } from './FieldTypeSwitcherHelper';
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
    DefaultValueEntryField,
    FieldTypeSwitcher
} from './HelperComponents/SharedComponents/index';
import { Killswitch } from '@ms/odsp-utilities/lib/killswitch/Killswitch';
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

/** Any field types that support column validation must be listed here as strings. */
const SUPPORTS_COLUMN_VALIDATION = ["Choice", "Number", "Text"];

/** A subset of the properties in @ms/odsp-datasouces/lib/interfaces/list/IFieldSchema. */
export interface IColumnManagementPanelSchemaValues {
    DisplayName: string;
    Title?: string;
    CustomFormatter?: string;
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
    fieldType?: FieldType;
    isHyperlink?: boolean;
    supportsValidation?: boolean;
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
    private _fieldTypeSwitcherHelper: FieldTypeSwitcherHelper;
    private _formulaLearnMoreLink: string;
    private _titleLearnMoreLink: string;

    constructor(props: IColumnManagementPanelContentProps) {
        super(props);
        this._defaultsHelper = new ColumnManagementPanelDefaultsHelper();
        this._fieldTypeSwitcherHelper = new FieldTypeSwitcherHelper();
        this.state = {
            isLoading: true,
            failedToLoad: false,
            isHyperlink: this.props.isHyperlink
        };

        this._formulaLearnMoreLink = `https://o15.officeredir.microsoft.com/r/rlidOfficeWebHelp?p1=SPOStandard&clid=${this.props.currentLanguage}&ver=16&HelpId=WSSEndUser_FormulaSyntaxError`;
        this._titleLearnMoreLink = `https://o15.officeredir.microsoft.com/r/rlidOfficeWebHelp?p1=SPOStandard&clid=${this.props.currentLanguage}&ver=16&HelpId=WSSEndUser_CreateColumnPanelTitle`;
    }

    @autobind
    public componentDidMount() {
        let loadDataQos = this.props.isEditPanel ? new QosEvent({ name: 'ColumnManagementPanel.LoadColumnData' }) : null;
        this._defaultsHelper.getCurrentValues(this.props.strings, this.props.currentValuesPromise, this.props.fieldType).then((currentValues: IColumnManagementPanelCurrentValues) => {
            this._currentValues = currentValues;
            let supportsValidation = SUPPORTS_COLUMN_VALIDATION.indexOf(FieldType[currentValues.fieldType]) !== -1;
            this.setState({
                isLoading: false,
                showMoreOptions: false,
                validateMoreOptions: false,
                showColumnValidation: false,
                supportsValidation: supportsValidation,
                showColumnValidationLink: !currentValues.allowMultipleSelection && supportsValidation,
                allowMultipleSelection: currentValues.allowMultipleSelection,
                name: currentValues.name,
                fieldType: currentValues.fieldType
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
        let typeSwitcherKey;
        if (!this.state.isLoading && !this.state.failedToLoad) {
            typeSwitcherKey = this.props.isEditPanel ? FieldType[this._currentValues.fieldType] : "Create";
        }
        let showTypeSwitcher = !Killswitch.isActivated('db423c76-fb8a-4236-a8a9-f35a9bab5195', '6/27/2017', 'Modern column type switching');
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
                        <TextField className='ms-ColumnManagementPanel-descriptionTextField'
                            label={ strings.descriptionLabel }
                            defaultValue={ this._currentValues.description }
                            multiline rows={ 3 }
                            ref={ this._resolveRef('_description') } />
                        { showTypeSwitcher &&
                            <FieldTypeSwitcher className={ css('ms-ColumnManagementPanel-fieldTypeSwitcher', { 'noUniqueFields': this.state.fieldType === FieldType.URL }) }
                                strings={ this.props.strings }
                                supportedTypes={ this._fieldTypeSwitcherHelper.getAllowedTypeSwitches(typeSwitcherKey) }
                                fieldType={ this.state.fieldType }
                                updateFieldType={ this._updateFieldType }
                                isHyperlink={ this.state.isHyperlink } /> }
                        { this.state.fieldType === FieldType.Choice &&
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
                        { this.state.fieldType === FieldType.User &&
                            <UserColumnUniqueFields
                                strings={ this.props.strings }
                                selectionMode={ this._currentValues.selectionMode }
                                ref={ this._resolveRef('_uniqueFields') } /> }
                        { this.state.fieldType === FieldType.Number &&
                            <NumberColumnUniqueFields
                                defaultValue={ this._currentValues.defaultValue }
                                defaultFormula={ this._currentValues.defaultFormula }
                                useCalculatedDefaultValue={ this._currentValues.useCalculatedDefaultValue }
                                showAsPercentage={ this._currentValues.showAsPercentage }
                                displayFormat={ this._currentValues.displayFormat }
                                formulaLearnMoreLink={ this._formulaLearnMoreLink }
                                strings={ this.props.strings }
                                ref={ this._resolveRef('_uniqueFields') } /> }
                        { this.state.fieldType === FieldType.Boolean &&
                            <BooleanColumnUniqueFields
                                defaultValue={ this._currentValues.defaultValue }
                                strings={ this.props.strings }
                                ref={ this._resolveRef('_uniqueFields') } /> }
                        { (this.state.fieldType === FieldType.Text || this.state.fieldType === FieldType.Note) &&
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
        let displayProperties = DISPLAY_PROPERTIES[FieldType[this.state.fieldType]];
        let baseMoreOptionsProps: IBaseMoreOptionsProps = {
            allowMultipleSelection: this._currentValues.allowMultipleSelection,
            enforceUniqueValues: this._currentValues.enforceUniqueValues,
            unlimitedLengthInDocumentLibrary: this._currentValues.unlimitedLengthInDocumentLibrary,
            required: this._currentValues.required,
            updateShowColumnValidationState: this._updateShowColumnValidationState,
            strings: strings,
            fieldType: this.state.fieldType,
            showEnforceUniqueToggle: displayProperties && displayProperties.showEnforceUniqueToggle,
            showAllowMultipleToggle: displayProperties && displayProperties.showAllowMultipleToggle,
            showUnlimitedLengthInDocumentLibraryToggle: displayProperties && displayProperties.showUnlimitedLengthInDocumentLibraryToggle && this.props.isDocumentLibrary
        };
        return (
            <div className={ css('ms-ColumnManagementPanel-moreOptions', { 'hidden': !this.state.showMoreOptions }) } id='moreOptions'>
                { this.state.fieldType === FieldType.Number &&
                    <NumberColumnMoreOptions
                        minimumValue={ this._currentValues.minimumValue }
                        maximumValue={ this._currentValues.maximumValue }
                        strings={ this.props.strings }
                        showMoreOptions={ this._showMoreOptions }
                        clearValidateMoreOptions={ this._clearValidateMoreOptions }
                        validateMoreOptions={ this.state.validateMoreOptions }
                        ref={ this._resolveRef('_typeMoreOptions') } /> }
                { this.state.fieldType === FieldType.Text &&
                    <TextColumnMoreOptions
                        maxLength={ this._currentValues.maxLength }
                        strings={ this.props.strings }
                        showMoreOptions={ this._showMoreOptions }
                        ref={ this._resolveRef('_typeMoreOptions') } /> }
                { this.state.fieldType === FieldType.Note &&
                    <NoteColumnMoreOptions
                        numberOfLines={ this._currentValues.numberOfLines }
                        showMoreOptions={ this._showMoreOptions }
                        strings={ this.props.strings }
                        isDocumentLibrary={ this.props.isDocumentLibrary }
                        richText={ this._currentValues.richText }
                        appendOnly={ this._currentValues.appendOnly }
                        enableVersions={ this.props.enableVersions }
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
            Description: this._description.value,
            CustomFormatter: this._currentValues.customFormatter
        };
        if (!this.state.allowMultipleSelection && this.state.supportsValidation) {
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
        if (this.state.fieldType === FieldType.User) {
            fieldSchema.UserSelectionScope = this._currentValues.selectionGroup;
            fieldSchema.ShowField = this._currentValues.lookupField;
        }
        if (this.state.fieldType === FieldType.URL) {
            fieldSchema.Format = this.state.isHyperlink ? "Hyperlink" : "Image";
        }
        return fieldSchema;
    }

    @autobind
    public getDataLossWarning(fieldSchema: IFieldSchema): string {
        let strings = this.props.strings;
        let toType = FieldType[fieldSchema.Type];
        if (this._currentValues.originalType === 'MultiChoice' && toType === 'Choice') {
            return strings.multipleToSingleChoiceWarning;
        } else if (this._currentValues.originalType === 'UserMulti' && toType === 'User') {
            return strings.multipleToSingleUserWarning;
        } else {
            let loss = this._fieldTypeSwitcherHelper.getCouldResultInDataLoss(this._currentValues.originalType, toType);
            if (loss) {
                let displayFromType = strings['displayName' + this._currentValues.originalType.replace('Multi', '')];
                let displayToType = strings['displayName' + toType.replace('Multi', '')];
                return StringHelper.format(strings.switchTypeWarningFormat, displayFromType, displayToType);
            }
        }
        return null;
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
            ...!prevState.showMoreOptions && { showColumnValidation: prevState.supportsValidation && hasValidationInfo }
        }));
    }

    @autobind
    private _showMoreOptions(callback?: () => void) {
        let hasValidationInfo = !!(this._validationFormula.value || this._userMessage.value);
        this.setState((prevState: IColumnManagementPanelState) => ({
            showMoreOptions: true,
            showColumnValidation: prevState.supportsValidation && hasValidationInfo,
            validateMoreOptions: true
        }), callback);
    }

    @autobind
    private _clearValidateMoreOptions() {
        this.setState({
            validateMoreOptions: false
        });
    }

    @autobind
    private _updateFieldType(newType: FieldType, isHyperlink?: boolean) {
        let supportsValidation = SUPPORTS_COLUMN_VALIDATION.indexOf(FieldType[newType]) !== -1;
        let displayProperties = DISPLAY_PROPERTIES[FieldType[newType]];
        let hasMultipleSelection = displayProperties && displayProperties.showAllowMultipleToggle;
        this.setState((prevState: IColumnManagementPanelState) => ({
            fieldType: newType,
            supportsValidation: supportsValidation,
            showMoreOptions: false,
            showColumnValidationLink: hasMultipleSelection ? !prevState.allowMultipleSelection && supportsValidation : supportsValidation,
            ...isHyperlink !== undefined && { isHyperlink: isHyperlink }
        }));
    }

    @autobind
    private _updateShowColumnValidationState(allowMultipleSelection: boolean) {
        let hasValidationInfo = !!(this._validationFormula.value || this._userMessage.value);
        this.setState((prevState: IColumnManagementPanelState) => ({
            allowMultipleSelection: allowMultipleSelection,
            showColumnValidationLink: !allowMultipleSelection && prevState.supportsValidation,
            showColumnValidation: allowMultipleSelection ? false : prevState.supportsValidation && hasValidationInfo
        }));
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