import { FieldType } from '../../interfaces/list/FieldType';

/**
 * A subset of the possible attributes and child elements for Field Schema Xml
 * For full list see https://msdn.microsoft.com/en-us/library/office/ms437580.aspx
 * (add other values here as needed).
 *
 * Enum names should be the same as the internal attribute or child element names from the link above whenever possible.
 * Names and cases are important for field schema xml assembly.
 */
export interface IFieldSchema {
    /** Type of field to create. */
    Type: FieldType,

    /** Name for the field. */
    DisplayName: string,

    /** Name for the field. Usually the same as display name. */
    Title: string,

    /** Description of the field. */
    Description?: string,

    /** Default value for the field. Name of attribute in docs is default. */
    DefaultValue?: string,

    /** Formula for calculating the default value of a field */
    DefaultFormula?: string,

    /** Choices that the user can select for a choice field. */
    Choices?: string[],

    /** True if users are allowed to manually add values to the column. */
    FillInChoice?: boolean,

    /** True if this field must contain information. */
    Required?: boolean,

    /** True if values must be unique. */
    EnforceUniqueValues?: boolean,

    /** Whether only individuals ('0') or indivuals and groups ('1') can be selected. */
    UserSelectionMode?: string,

    /** Scope for selecting users. 0 means no scope. Any other number is id of the group to select from. */
    UserSelectionScope?: number,

    /** Whether to allow selecting multiple users or not. */
    Mult?: boolean

    /** Display format for the column. */
    Format?: string,

    /** Field validation information. */
    Validation?: IFieldValidation
}

export interface IFieldValidation {
    /** Formula for field validation. */
    Formula?: string,

    /** A message explaining how the validation formula works. */
    Message?: string
}

export default IFieldSchema;