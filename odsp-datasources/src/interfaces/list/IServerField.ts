/**
 * The properties returned from the server for an SPField
 * See https://msdn.microsoft.com/en-us/library/microsoft.sharepoint.spfield_properties.aspx for documentation.
 */
export interface IServerField {
    AutoIndexed: boolean;
    CanBeDeleted: boolean;
    Choices?: { results: string[]; };
    DefaultFormula?: string;
    DefaultValue: string;
    Description: string;
    DescriptionResource: any;
    Direction: string;
    DisplayFormat?: number;
    EnforceUniqueValues: boolean;
    EntityPropertyName: string;
    FieldTypeKind: number;
    FillInChoice?: boolean;
    Filterable: boolean;
    FromBaseType: boolean;
    Group: string;
    Groupable: boolean;
    Hidden: boolean;
    Id: string;
    Indexed: boolean;
    InternalName: string;
    JSLink: string;
    LookupField?: string;
    MinimumValue?: number;
    MaximumValue?: number;
    MaxLength?: number;
    ReadOnlyField: boolean;
    Required: boolean;
    SchemaXml: string;
    Scope: string;
    Sealed: boolean;
    SelectionGroup?: number;
    SelectionMode?: number;
    ShowAsPercentage?: boolean;
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