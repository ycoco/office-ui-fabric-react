import * as React from 'react';
import { IPropertiesTableSetProps } from './PropertiesTableSet.Props';
import { parse } from '../../index';
import { IProperty, PropertyType, PropertiesTable } from '../../index';

export interface IPropertiesTableSetState {
  properties: Array<IProperty>;
}

export class PropertiesTableSet extends React.Component<IPropertiesTableSetProps, IPropertiesTableSetState> {
  public static defaultProps = {
    title: 'Properties'
  };

  constructor(props: IPropertiesTableSetProps) {
    super(props);
    let { componentName, componentPath } = props;
    let src;
    let properties: IProperty[] = [];

    if (componentPath) {
      src = require('../../../' + componentPath + componentName + '.Props.ts');
    } else {
      src = require('../../../components/' + componentName + '/' + componentName + '.Props.ts');
    }

    if (props.renderOnly) {
      props.renderOnly.forEach((item: string) => {
        properties = properties.concat(parse(src, item));
      });
    } else {
      properties = parse(src);
    }

    this.state = {
      properties: properties
    };
  }

  public renderEach() {
    return this.state.properties.map((item: IProperty) =>
      (<PropertiesTable
        key={ item.propertyName }
        title={ item.propertyName }
        properties={ item.property }
        renderAsEnum={ item.propertyType === PropertyType.enum } />));
  }

  public render() {
    return (
      <div>
        { this.renderEach() }
      </div>
    );
  }
}
