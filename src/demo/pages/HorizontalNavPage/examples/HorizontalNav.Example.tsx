import * as React from 'react';
import { HorizontalNav, IHorizontalNavProps, IHorizontalNavItem } from '../../../../components/index';

export interface IHorizontalNavExampleState {
  numberOfNavItems: Number;
}

export default class HorizontalNavExample extends React.Component<any, IHorizontalNavExampleState> {
  constructor() {
    super();
    this.state = { numberOfNavItems: 5 };
  }

  public render() {
    let { numberOfNavItems } = this.state;
    let arrayOfItems: IHorizontalNavItem[] = [];
    for (let i = 0; i < numberOfNavItems; i++){
      arrayOfItems.push({
        text: `Navigation Item ${i + 1}`,
        onClick: (item: IHorizontalNavItem) => {
          alert(`You clicked on ${ item.text }`);
        }
      });
    }

    let horizontalNavProps: IHorizontalNavProps = { items: arrayOfItems };

    return (
      <HorizontalNav {...horizontalNavProps} />
    );
  }
}
