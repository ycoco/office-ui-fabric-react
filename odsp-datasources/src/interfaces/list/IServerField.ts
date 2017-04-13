/**
 * The properties returned from the server for an SPField
 * See https://msdn.microsoft.com/en-us/library/microsoft.sharepoint.spfield_properties.aspx for documentation.
 */
interface IServerField {
    AutoIndexed: boolean;
    CanBeDeleted: boolean;
    DefaultValue: string;
    Description: string;
    DescriptionResource: any;
    Direction: string;
    EnforceUniqueValues: boolean;
    EntityPropertyName: string;
    FieldTypeKind: number;
    Filterable: boolean;
    FromBaseType: boolean;
    Group: string;
    Groupable: boolean;
    Hidden: boolean;
    Id: string;
    Indexed: boolean;
    InternalName: string;
    JSLink: string;
    ReadOnlyField: boolean;
    Required: boolean;
    SchemaXml: string;
    Scope: string;
    Sealed: boolean;
    Sortable: boolean;
    StaticName: string;
    Title: string;
    TitleResource: any;
    TypeAsString: string;
    TypeDisplayName: string;
    TypeShortDescription: string;
    ValidationFormula: string;
    ValidationMessage: string;
}

export default IServerField;