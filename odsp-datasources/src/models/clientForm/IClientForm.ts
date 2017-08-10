import { ClientFormType } from './ClientFormType';
import { ISPListItem } from '../../dataSources/item/spListItemProcessor/ISPListItemData';

/**
 * Base interface for client forms
 */
export interface IClientFormBase {
    /**
     * The list item content type
     */
    contentType: string;
    /**
     * id of the content type
     */
    contentTypeId: string;
    /**
     * The client form type
     */
    formType: ClientFormType;
}

/**
 * The schema of a client form
 */
export interface IClientFormSchema extends IClientFormBase {
    /**
     * Fields schema, cast an instance to <any> to access additional data
     */
    fields: IClientFormFieldSchema[];

    /**
     * Type of mode to use when rendering the form.
     */
    mode: FormRenderMode;

    /**
     * App ID for the Power App that is used for customizing forms
     */
    powerAppsFormId?: string;
}

/**
 * The mode to use when a form is rendered.
 */
export const enum FormRenderMode {
    /**
     * Server didn't return the mode or it returned a value that we don't recognize.
     */
    Unknown,
    /**
     *  Includes both Classic UX and InfoPath rendering modes
     */
    Legacy,
    /**
     * Modern UX
     */
    Modern,
    /**
     * Customized PowerApp form
     */
    PowerApp
}

/**
 * The client form
 */
export interface IClientForm extends IClientFormBase {
    /**
     * The list item that is being edited
     */
    item?: ISPListItem;
    /**
     * The list of fields in this form
     */
    fields: IClientFormField[];
}

/**
 * The field schema. Only add generic properties to the interface, to get additional
 * data cast to <any> instead.
 */
export interface IClientFormFieldSchema {
    /**
     * The default value of the field
     */
    DefaultValue?: string;
    /**
     * The typed default value of the field
     */
    DefaultValueTyped?: any;
    /**
     * The default value of the field, correctly formatted as a string by the server
     * (used for server/client datetime formatting discrepancies)
     */
    DefaultValueFormatted?: string;
    /**
     * The field description
     */
    Description?: string;
    /**
     * The field direction
     */
    Direction?: string;
    /**
     * Indicates the display format of the field
     */
    DisplayFormat?: any;
    /**
     * The field type
     */
    FieldType?: string;
    /**
     * Indicates whether the fill in option is allowed
     */
    FillInChoice?: boolean;
    /**
     * Indicates whether the field should be hidden
     */
    Hidden?: boolean;
    /**
     * The field ID
     */
    Id?: string;
    /**
     * The IMEMode value
     */
    IMEMode?: string;
    /**
     * Maximum number of characters allowed for values in this field
     */
    MaxLength?: number;
    /**
     * The field name
     */
    Name: string;
    /**
     * Indicates whether the field is read only
     */
    ReadOnlyField?: boolean;
    /**
     * Indicates whether the field should be hidden
     */
    Required?: boolean;
    /**
     * The field title
     */
    Title?: string;
    /**
     * The field type
     */
    Type: string;
    /**
     * Indiates whether the field does auto hyperlinking.
     */
    IsAutoHyperLink?: boolean;
    /**
     * If AppendOnly is true, new values are appended instead of replacing the old value.
     * AppendOnly is available for multi-line text fields.
     */
    AppendOnly?: boolean;
    /**
     * Indicates the hidden list for taxonomy field
     */
    HiddenListInternalName?: string;
    /**
     * Indicates whether the field is RichText as Note Field.
     */
    RichText?: boolean;
}

/**
 * A client form field
 */
export interface IClientFormField {
    /**
     * The current data
     */
    data?: any;
    /**
     * The server data
     */
    serverData?: any;
    /**
     * The field state
     */
    state: ClientFormFieldState;
    /**
     * Indicates whether the field has a server side error
     */
    hasException: boolean;
    /**
     * The server side error message
     */
    errorMessage: string;
    /**
     * Client side validation error message
     */
    clientSideErrorMessage?: string;
    /**
     * This is the client form schema as sent by the server, cast to <any> to access
     * all properties.
     */
    schema: IClientFormFieldSchema;
}

/**
 * Represents a field update operation
 */
export interface IListItemFormUpdateValue {
    /**
     * The field name
     */
    FieldName: string;
    /**
     * The field value as the server understands it
     */
    FieldValue: string;
    /**
     * Indicates whether the field has an error
     */
    HasException: boolean;
    /**
     * The error message
     */
    ErrorMessage: string;
}

/**
 * The field state
 */
export const enum ClientFormFieldState {
    /**
     * The field is ready
     */
    ready = 0,
    /**
     * The field data is being saved in the server
     */
    saving = 1,
    /**
     * The field data is bring updated from the server
     */
    updating = 2
}

export default IClientForm;
