import * as React from 'react';
import { BaseComponent, autobind } from 'office-ui-fabric-react/lib/Utilities';
import { IUniqueFieldsComponent,
         IUniqueFieldsComponentSchemaValues
        } from './IUniqueFieldsComponent';
import { IColumnManagementPanelStrings } from '../../../../containers/columnManagementPanel/ColumnManagementPanelStringHelper';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';

export interface IUserColumnUniqueFieldsProps {
  /** Collection of localized strings to show in the create column panel UI. */
  strings: IColumnManagementPanelStrings;
  /** Whether only individuals ('0') or indivuals and groups ('1') can be selected. */
  selectionMode: number;
  /** If provided, additional class name to the root element. */
  className?: string;
}

export class UserColumnUniqueFields extends BaseComponent<IUserColumnUniqueFieldsProps, any> implements IUniqueFieldsComponent {
  private _userSelectionMode: Checkbox;

  constructor(props: IUserColumnUniqueFieldsProps) {
    super(props);
  }

  public render() {
    let strings = this.props.strings;
    return (
      <div className={ this.props.className ? `${this.props.className} ms-ColumnManagementPanel-uniqueFields` : 'ms-ColumnManagementPanel-uniqueFields' }>
          <Checkbox className='ms-ColumnManagementPanel-allowGroupsCheckbox'
            label={ strings.allowSelectionOfGroupsCheckbox }
            defaultChecked={ this.props.selectionMode === 1 ? true : false }
            ref={ this._resolveRef('_userSelectionMode') } />
      </div>
    );
  }

  @autobind
  public getSchemaValues(): IUniqueFieldsComponentSchemaValues | false {
    return {
      UserSelectionMode: this._userSelectionMode.checked ? "1" : "0"
    };
  }
}