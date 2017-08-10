import * as React from 'react';
import { autobind, BaseComponent, IBaseProps } from 'office-ui-fabric-react/lib/Utilities';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { IColumnManagementPanelStrings } from '../../../../containers/columnManagementPanel/ColumnManagementPanelStringHelper';
import { FieldType } from '@ms/odsp-datasources/lib/List';

export interface IFieldTypeSwitcherProps extends IBaseProps {
  /** Collection of localized strings to show in the create column panel UI. */
  strings: IColumnManagementPanelStrings;
  /** A list of the all the supported field types for the dropdown */
  supportedTypes: string[];
  /** Current type of the column. */
  fieldType: FieldType;
  /** Callback to update the field type of the panel. */
  updateFieldType: (newType: FieldType, isHyperlink?: boolean) => void;
  /** Whether the URL field to create should be a hyperlink or picture column. */
  isHyperlink: boolean;
  /** If provided, class name of the root element */
  className?: string;
}

export class FieldTypeSwitcher extends BaseComponent<IFieldTypeSwitcherProps, {}> {
  private _fieldTypeDropdownOptions: IDropdownOption[];

  constructor(props: IFieldTypeSwitcherProps) {
    super(props);

    this._fieldTypeDropdownOptions = [];
    for (var i = 0; i < this.props.supportedTypes.length; i++) {
      let typeText = this.props.supportedTypes[i];
      if (FieldType[typeText] === FieldType.URL) {
        let hyperlink = { key: "Hyperlink", text: this.props.strings['displayNameHyperlink'] };
        let picture = { key: "Picture", text: this.props.strings['displayNamePicture'] };
        this._fieldTypeDropdownOptions.push(hyperlink);
        this._fieldTypeDropdownOptions.push(picture);
      } else {
        let dropdownOption = { key: typeText, text: this.props.strings['displayName' + typeText] };
        this._fieldTypeDropdownOptions.push(dropdownOption);
      }
    }
  }

  public render() {
    let strings = this.props.strings;
    let selectedKey: string = FieldType[this.props.fieldType];
    if (this.props.fieldType === FieldType.URL) {
      selectedKey = this.props.isHyperlink ? "Hyperlink" : "Picture";
    }
    return (
      <div className={ this.props.className }>
        <Dropdown className='ms-ColumnManagementPanel-typeDropdown'
          label={ strings.fieldTypeDropdownLabel }
          ariaLabel={ strings.fieldTypeDropdownAriaLabel }
          options={ this._fieldTypeDropdownOptions }
          disabled={ this._fieldTypeDropdownOptions.length === 1 }
          selectedKey={ selectedKey }
          onChanged={ this._fieldTypeChanged } />
      </div>
    );
  }

  @autobind
  private _fieldTypeChanged(option: IDropdownOption) {
    let newType = option.key;
    let newIsHyperlink;
    if (option.key === "Hyperlink") {
      newType = "URL";
      newIsHyperlink = true;
    } else if (option.key === "Picture") {
      newType = "URL";
      newIsHyperlink = false;
    }
    this.props.updateFieldType(FieldType[newType], newIsHyperlink);
  }
}
