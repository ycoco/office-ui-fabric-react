import { IColumnManagementPanelErrorStrings } from './index';

const FORMULA_SYNTAX_ERROR = -2130575270;
const FORMULA_INVALID_COLUMN_NAME = -2130575273;
const FORMULA_COLUMN_NAME_INELIGIBLE = -2130575272;
const FORMULA_SELF_REFERENCE = -2130575271;
const FORMULA_EMPTY_ERROR = -2130575199;
const FORMULA_REFERENCE_TO_FIELD = -2130575296;
const VALIDATION_FORMULA_INVALID_COLUMN_NAME = -2130575160;
const FORMULA_REFERENCE_TO_SEMI_VALUE = -2130575295;

export function handleCreateEditColumnError(error: any, errorStrings: IColumnManagementPanelErrorStrings) {
  let errorCode = error && error.code && Number(error.code.split(',')[0]);
  let message;

  switch (errorCode) {
    case FORMULA_SYNTAX_ERROR:
      message = errorStrings.formulaSyntaxError;
      break;
    case FORMULA_INVALID_COLUMN_NAME:
      message = errorStrings.formulaInvalidColumnName;
      break;
    case FORMULA_COLUMN_NAME_INELIGIBLE:
      message = errorStrings.formulaColumnNameIneligible;
      break;
    case FORMULA_SELF_REFERENCE:
      message = errorStrings.formulaSelfReference;
      break;
    case FORMULA_EMPTY_ERROR:
      message = errorStrings.formulaEmptyError;
      break;
    case VALIDATION_FORMULA_INVALID_COLUMN_NAME:
      message = errorStrings.validationFormulaInvalidColumnName;
      break;
    case FORMULA_REFERENCE_TO_FIELD:
      message = errorStrings.referenceToFieldFound;
      break;
    case FORMULA_REFERENCE_TO_SEMI_VALUE:
      message = errorStrings.referenceToSemiValueFound;
      break;
    default:
      message = errorStrings.genericCreateColumnError;
  }

  return message;
}

export default handleCreateEditColumnError;