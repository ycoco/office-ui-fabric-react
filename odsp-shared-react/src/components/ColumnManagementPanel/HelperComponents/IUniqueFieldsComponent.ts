/** Interface for a unique fields component for one of the column types that can be created or edited. */
export interface IUniqueFieldsComponent {
  /** Function to get any values from the unique fields component that should be added to the field schema and saved. */
  getSchemaValues: () => IUniqueFieldsComponentSchemaValues;
  /** Function to get required values so that the save button can be disabled if they are not defined. */
  getRequiredValues: () => IUniqueFieldsComponentRequiredValues;
}

/** A subset of the properties in @ms/odsp-datasouces/lib/interfaces/list/IFieldSchema */
export interface IUniqueFieldsComponentSchemaValues {
  Choices?: string[];
  DefaultValue?: string;
  DefaultFormula?: string;
  FillInChoice?: boolean;
  UserSelectionMode?: string;
}

/** Required values to update the disabled or enabled state of the save button. */
export interface IUniqueFieldsComponentRequiredValues {
  choicesText?: string;
}