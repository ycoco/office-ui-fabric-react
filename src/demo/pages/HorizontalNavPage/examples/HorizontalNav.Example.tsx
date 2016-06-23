import * as React from 'react';
import { HorizontalNav, IHorizontalNavProps, IHorizontalNavItem } from '../../../../components/index';

export interface IHorizontalNavExampleState {
  numberOfNavItems?: Number;
  clickedText?: string;
}

export class HorizontalNavExample extends React.Component<any, IHorizontalNavExampleState> {
  constructor() {
    super();
    this.state = { numberOfNavItems: 5 };
  }

  public render() {
    let { numberOfNavItems } = this.state;
    let arrayOfItems: IHorizontalNavItem[] = [];
    for (let i = 0; i < numberOfNavItems; i++) {
      arrayOfItems.push({
        text: `Navigation Item ${i + 1}`,
        onClick: (item: IHorizontalNavItem) => {
          this.setState({ clickedText: `You activated ${item.text}` });
        }
      });
    }

    let createArrayOfSubItems: () => IHorizontalNavItem[] = () => {
      let arrayOfSubItems: IHorizontalNavItem[] = [];
      for (let i = 0; i < numberOfNavItems; i++) {
        arrayOfSubItems.push({
          text: `Sub Navigation Item ${i + 1}`,
          onClick: (item: IHorizontalNavItem) => {
            this.setState({ clickedText: `You activated  ${item.text}` });
          }
        });
      }

      return arrayOfSubItems;
    };

    arrayOfItems[2].childNavItems = createArrayOfSubItems();

    arrayOfItems[4].childNavItems = createArrayOfSubItems();

    let horizontalNavProps: IHorizontalNavProps = { items: arrayOfItems };

    return (
      <div>
        <HorizontalNav {...horizontalNavProps} />
        <br /><br />
        <div>{ this.state.clickedText }</div>
      </div>
    );
  }
}
