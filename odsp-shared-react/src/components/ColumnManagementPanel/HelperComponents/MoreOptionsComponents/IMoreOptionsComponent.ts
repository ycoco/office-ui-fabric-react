import { FieldType } from '@ms/odsp-datasources/lib/List';

/** Interface for a more options component for one of the column types that can be created or edited. */
export interface IMoreOptionsComponent {
  /** Function to get any values from the more options component that should be added to the field schema and saved. */
  getSchemaValues: () => IMoreOptionsComponentSchemaValues | false;
}

/** Interface for the base more options component. */
export interface IBaseMoreOptionsComponent {
  /** Function to get any values from the more options component that should be added to the field schema and saved. */
  getSchemaValues: () => IBaseMoreOptionsComponentSchemaValues;
}

/** A subset of the properties in @ms/odsp-datasouces/lib/interfaces/list/IFieldSchema. Property names must match. */
export interface IBaseMoreOptionsComponentSchemaValues {
  Type: FieldType;
  Mult?: boolean;
  Required?: boolean;
  EnforceUniqueValues?: boolean;
  Indexed?: boolean;
}

/** A subset of the properties in @ms/odsp-datasouces/lib/interfaces/list/IFieldSchema. Property names must match. */
export interface IMoreOptionsComponentSchemaValues {
  Min?: number;
  Max?: number;
<<<<<<< HEAD
  MaxLength?: number;
=======
  NumLines?: number;
>>>>>>> Create Multiline Panel for COlumn Adding
}