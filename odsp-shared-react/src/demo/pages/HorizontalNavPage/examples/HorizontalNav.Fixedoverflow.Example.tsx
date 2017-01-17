import * as React from 'react';
import { HorizontalNav, IHorizontalNavProps, IHorizontalNavItem } from '../../../../components/index';

export interface IHorizontalNavExampleState {
  numberOfNavItems: number;
  numOverflow: number;
}

export class HorizontalNavFixedoverflowExample extends React.Component<any, IHorizontalNavExampleState> {
  constructor() {
    super();
    this.state = { numberOfNavItems: 3, numOverflow: 2 };

  }

  public render() {
    let { numberOfNavItems, numOverflow } = this.state;
    let arrayOfItems: IHorizontalNavItem[] = [], overflowItems: IHorizontalNavItem[] = [];

    for (let i = 0; i < numberOfNavItems; i++) {
      arrayOfItems.push({
        text: `Navigation Item ${i + 1}`, onClick: (item: IHorizontalNavItem) => {
          alert(`You clicked on ${item.text}`);
        }
      });
    }

    for (let i = 0; i < numOverflow; i++) {
      overflowItems.push({
        text: `Navigation Item ${i + 1 + numberOfNavItems}`, onClick: (item: IHorizontalNavItem) => {
          alert(`You clicked on ${item.text}`);
        }
      });
    }

    let horizontalNavProps: IHorizontalNavProps = { items: arrayOfItems, overflowItems: overflowItems };

    return (
      <HorizontalNav {...horizontalNavProps} />
    );
  }
}