import { FieldType } from './IField';

/**
 * A subset of the possible attributes and child elements for an SPField.
 * For full list see https://msdn.microsoft.com/en-us/library/office/ms437580.aspx
 * (add other values here as needed).
 *
 * Enum names should be the same as the internal attribute or child element names from the link above whenever possible.
 */
export interface ICreateFieldOptions {
    /** Type of field to create. */
    type: FieldType,

    /** Name for the field. */
    displayName: string,

    /** Description of the field. */
    description?: string,

    /** Default value for the field. Name of attribute in docs is default. */
    defaultValue?: string,

    /** Choices that the user can select for a choice field. */
    choices?: string[],

    /** True if users are allowed to manually add values to the column. */
    fillInChoice?: boolean,

    /** True if this field must contain information. */
    required?: boolean,

    /** True if values must be unique. */
    enforceUniqueValues?: boolean,

    /** Whether only individuals ('0') or indivuals and groups ('1') can be selected. */
    userSelectionMode?: string,

    /** Scope for selecting users. 0 means no scope. Any other number is id of the group to select from. */
    userSelectionScope?: number,

    /** Whether to allow selecting multiple users or not. */
    mult?: boolean

    /** Display format for the column. */
    format?: string,

    /** Field validation information. */
    validation?: IFieldValidation
}

export interface IFieldValidation {
    /** Formula for field validation. */
    formula?: string,

    /** A message explaining how the validation formula works. */
    message?: string
}

export default ICreateFieldOptions;