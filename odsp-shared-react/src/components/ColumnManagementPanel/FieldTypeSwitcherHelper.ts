import Features from '@ms/odsp-utilities/lib/features/Features';

/** Types of fields that can be created or edited in the column management panel. These names match those in FieldType */
export const SUPPORTED_PANEL_TYPES = ["Choice", "User", "Boolean", "Number", "URL"];

/** Types of fields that can be created or edited in the column management panel on the other flight. This list of types should not overlap with SUPPORTED_PANEL_TYPES */
export const SUPPORTED_PANEL_TYPES_2 = ["Text", "Note"];

const ALLOWED_TYPE_SWITCHES = {
  "Create": ["Text", "Note", "Number", "Boolean", "User", "Choice", "URL", "Calculated", "Currency", "DateTime", "Lookup"],
  "Text": ["Text", "Note", "Choice", "Number", "Currency", "DateTime"],
  "Note": ["Text", "Note", "Choice", "Number", "Currency", "DateTime"],
  "Number": ["Text", "Note", "Choice", "Number", "Currency", "Boolean"],
  "Boolean": ["Text", "Note", "Choice", "Number", "Currency", "Boolean"],
  "User": ["User"],
  "Choice": ["Text", "Note", "Choice", "Number", "Currency", "DateTime"],
  "URL": ["URL"],
  "Calculated": ["Calculated"],
  "Currency": ["Text", "Note", "Choice", "Number", "Currency", "Boolean"],
  "DateTime": ["Text", "Note", "Choice", "DateTime"],
  "Lookup": ["Lookup"]
};

export class FieldTypeSwitcherHelper {

  public getAllowedTypeSwitches(typeKey: string) {
    return ALLOWED_TYPE_SWITCHES[typeKey].filter((type: string) => {
      let typeFlighted = SUPPORTED_PANEL_TYPES.indexOf(type) !== -1 && Features.isFeatureEnabled({ ODB: 143 }); /*CreateChoiceColumnPanel*/
      let typeFlighted2 = SUPPORTED_PANEL_TYPES_2.indexOf(type) !== -1 && Features.isFeatureEnabled({ ODB: 147 }); /*CreateColumnPanels*/
      return typeFlighted || typeFlighted2;
    });
  }

  public getCouldResultInDataLoss(fromType: string, toType: string) {
      switch (fromType)
      {
          case "Text":
          case "Choice":
              switch (toType)
              {
                  case "Number":
                  case "Currency":
                  case "DateTime":
                      return true;
              }
              break;
          case "Note":
              switch (toType)
              {
                  case "Text":
                  case "Choice":
                  case "MultiChoice":
                  case "Number":
                  case "Currency":
                  case "DateTime":
                      return true;
              }
              break;
          case "MultiChoice":
              switch (toType)
              {
                  case "Text":
                  case "Note":
                  case "Choice":
                  case "Number":
                  case "Currency":
                  case "DateTime":
                      return true;
              }
              break;
          case "DateTime":
              switch (toType)
              {
                  case "Text":
                  case "Note":
                  case "Choice":
                  case "MultiChoice":
                      return true;
              }
              break;
          case "Number":
          case "Currency":
              switch (toType)
              {
                  case "Text":
                  case "Note":
                  case "Choice":
                  case "MultiChoice":
                  case "Boolean":
                      return true;
              }
              break;
      }
      return false;
  }
}

export default FieldTypeSwitcherHelper;