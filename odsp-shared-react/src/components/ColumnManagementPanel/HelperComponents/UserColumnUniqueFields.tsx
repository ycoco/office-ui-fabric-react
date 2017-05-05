import * as React from 'react';
import { BaseComponent } from 'office-ui-fabric-react/lib/Utilities';
import { IUniqueFieldsComponent, IUniqueFieldsComponentSchemaValues, IUniqueFieldsComponentRequiredValues } from './index';
import { IColumnManagementPanelStrings } from '../../../containers/columnManagementPanel/index';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';

export interface IUserColumnUniqueFieldsProps {
  className?: string;
  strings: IColumnManagementPanelStrings;
  selectionMode: number;
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

  public getRequiredValues(): IUniqueFieldsComponentRequiredValues {
    // This unique fields component doesn't have any required values
    return null;
  }

  public getSchemaValues(): IUniqueFieldsComponentSchemaValues {
    return {
      UserSelectionMode: this._userSelectionMode.checked ? "1" : "0"
    };
  }
}