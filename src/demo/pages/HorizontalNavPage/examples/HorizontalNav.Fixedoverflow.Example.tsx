import * as React from 'react';
import { HorizontalNav } from '../../../../components/index';

export interface IHorizontalNavExampleState {
  numberOfNavItems: number;
  numOverflow: number;
}

export default class HorizontalNavExample extends React.Component<any, IHorizontalNavExampleState> {
  constructor() {
    super();
    this.state = { numberOfNavItems: 3, numOverflow: 2 };

  }

  public render() {
    let { numberOfNavItems, numOverflow } = this.state;
    let arrayOfItems = [], overflowItems = [];

    for (let i = 0; i < numberOfNavItems; i++) {
      arrayOfItems.push({ text: `Navigation Item ${i + 1}` });
    }

    for (let i = 0; i < numOverflow; i++) {
      overflowItems.push({ text: `Navigation Item ${i + 1 + numberOfNavItems}` });
    }

    let horizontalNavProps = { items: arrayOfItems, overflowItems: overflowItems };

    return (
      <HorizontalNav {...horizontalNavProps} />
    );
  }
}
