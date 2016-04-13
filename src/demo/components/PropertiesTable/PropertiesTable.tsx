import * as React from 'react';
import './PropertiesTable.scss';
import { DetailsList, DetailsListLayoutMode, SelectionMode, IColumn } from '@ms/office-ui-fabric-react';
import { assign } from '@ms/office-ui-fabric-react/lib/utilities/object';

export interface IProperty {
  propertyName: string;
  propertyType: PropertyType;
  property: IInterfaceProperty[] | IEnumProperty[];
}

export interface IInterfaceProperty {
  name: string;
  type: string;
  defaultValue?: string;
  description: string;
}

export interface IEnumProperty {
  name: string;
  description: string;
}

export interface IPropertiesTableProps {
  title?: string;
  properties: IInterfaceProperty[] | IEnumProperty[];
  renderAsEnum?: boolean;
  key?: string;
}

export enum PropertyType {
  enum, interface
}

const DEFAULT_COLUMNS: IColumn[] = [
  {
    key: 'name',
    name: 'Name',
    fieldName: 'name',
    minWidth: 150,
    maxWidth: 250,
    isCollapsable: false,
  },
  {
    key: 'type',
    name: 'Type',
    fieldName: 'type',
    minWidth: 130,
    maxWidth: 150,
    isCollapsable: false
  },
  {
    key: 'defaultValue',
    name: 'Default value',
    fieldName: 'defaultValue',
    minWidth: 130,
    maxWidth: 150,
    isCollapsable: false
  }, {
    key: 'description',
    name: 'Description',
    fieldName: 'description',
    minWidth: 300,
    maxWidth: 400,
    isCollapsable: false
  }
];

const ENUM_COLUMNS: IColumn[] = [
  {
    key: 'name',
    name: 'Name',
    fieldName: 'name',
    minWidth: 150,
    maxWidth: 250,
    isCollapsable: false,
  },
  {
    key: 'description',
    name: 'Description',
    fieldName: 'description',
    minWidth: 300,
    maxWidth: 400,
    isCollapsable: false
  }
];

export class PropertiesTable extends React.Component<IPropertiesTableProps, any> {
  public static defaultProps = {
    title: 'Properties'
  };

  constructor(props: IPropertiesTableProps) {
    super(props);

    this.state = {
      properties: props.properties
        .map((prop, index) => assign({ key: index }, prop))
        .sort((a, b) => (a.name < b.name) ? -1 : 1),
      isEnum: !!props.renderAsEnum
    };
  }

  public render() {
    let { title } = this.props;
    let { properties, isEnum } = this.state;

    return (
      <div className='PropertiesTable'>
        <h2 className='ms-font-xl'>{ title }</h2>
        { (properties && properties.length) ? (
          <DetailsList
            selectionMode={ SelectionMode.none }
            layoutMode={ DetailsListLayoutMode.justified }
            items={ properties.sort((a, b) => (a.name < b.name) ? -1 : 1) }
            columns={ isEnum ? ENUM_COLUMNS : DEFAULT_COLUMNS }
            />
        ) : (
            <div className='PropertiesTable-noProperties'>This component is missing properties.Please provide properties or remove the table from the example.</div>
          ) }
        </div>
    );
  }
}
