import * as React from 'react';
import { HorizontalNav, IHorizontalNavProps } from '../../../../components/index';
import { INavLink } from 'office-ui-fabric-react/lib/Nav';

export interface IHorizontalNavExampleState {
  numberOfNavItems?: Number;
  clickedText?: string;
}

export class HorizontalNavExample extends React.Component<any, IHorizontalNavExampleState> {
  constructor() {
    super();
    this.state = { numberOfNavItems: 9 };
  }

  public render() {
    let { numberOfNavItems } = this.state;
    let arrayOfItems: INavLink[] = [];
    for (let i = 0; i < numberOfNavItems; i++) {
      arrayOfItems.push({
        name: `Navigation Item ${i + 1}`,
        url: 'http://bing.com',
        target: '_blank',
        key: i.toString(),
        onClick: (ev: React.MouseEvent<HTMLElement>, item?: INavLink) => {
          this.setState({ clickedText: `You activated ${item.name}` });
        }
      });
    }

    let createArrayOfSubItems: () => INavLink[] = () => {
      let arrayOfSubItems: INavLink[] = [];
      for (let i = 0; i < numberOfNavItems; i++) {
        arrayOfSubItems.push({
          name: `Sub Navigation Item ${i + 1}`,
          url: 'http://bing.com',
          onClick: (ev: React.MouseEvent<HTMLElement>, item?: INavLink) => {
            this.setState({ clickedText: `You activated  ${item.name}` });
          }
        });
      }

      return arrayOfSubItems;
    };

    arrayOfItems[2].links = createArrayOfSubItems();

    arrayOfItems[4].links = createArrayOfSubItems();

    let horizontalNavProps: IHorizontalNavProps = {
      items: arrayOfItems,
      hasSelectedState: true,
      selectedKey: '1',
      editLink: {
        name: 'Edit', url: '', onClick: (ev: React.MouseEvent<HTMLElement>, item?: INavLink) => {
          this.setState({ clickedText: `EditLink` });
        }
      }
    };

    return (
      <div>
        <HorizontalNav {...horizontalNavProps} />
        <br /><br />
        <div>{ this.state.clickedText }</div>
      </div>
    );
  }
}
