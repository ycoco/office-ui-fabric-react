import * as React from 'react';
import { HorizontalNav, IHorizontalNavProps } from '../../../../components/index';
import { INavLink } from 'office-ui-fabric-react/lib/Nav';

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
    let arrayOfItems: INavLink[] = [], overflowItems: INavLink[] = [];

    for (let i = 0; i < numberOfNavItems; i++) {
      arrayOfItems.push({
        name: `Navigation Item ${i + 1}`,
        url: 'http://bing.com',
        onClick: (ev: React.MouseEvent<HTMLElement>, item?: INavLink) => {
          alert(`You clicked on ${item.name}`);
        }
      });
    }

    for (let i = 0; i < numOverflow; i++) {
      overflowItems.push({
        name: `Navigation Item ${i + 1 + numberOfNavItems}`,
        url: 'http://bing.com',
        onClick: (ev: React.MouseEvent<HTMLElement>, item?: INavLink) => {
          alert(`You clicked on ${item.name}`);
        }
      });
    }

    let horizontalNavProps: IHorizontalNavProps = { items: arrayOfItems, overflowItems: overflowItems };

    return (
      <HorizontalNav {...horizontalNavProps} />
    );
  }
}
