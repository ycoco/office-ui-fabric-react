/**
 * A subset of the possible types for an SPField.
 * For full list see https://msdn.microsoft.com/en-us/library/office/ms437580.aspx
 * (add other values here as needed).
 *
 * Enum names should be the same as the internal field type names from the link above.
 */
export enum FieldType {
    Text,
    Note,
    Number,
    Boolean,
    Choice,
    MultiChoice,
    DateTime,
    URL,
    User,
    UserMulti
}

export default FieldType;