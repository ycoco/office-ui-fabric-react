import * as React from 'react';
import { HorizontalNav, IHorizontalNavProps } from '../../../../components/index';
import { INavLink } from 'office-ui-fabric-react/lib/Nav';

export interface IHorizontalNavEmptyExampleState {
  numberOfNavItems?: Number;
  clickedText?: string;
}

export class HorizontalNavEmptyExample extends React.Component<any, IHorizontalNavEmptyExampleState> {
  constructor() {
    super();
    this.state = {};
  }

  public render() {
    let arrayOfItems: INavLink[] = [];

    let horizontalNavProps: IHorizontalNavProps = {
      items: arrayOfItems,
      hasSelectedState: true,
      editLink: {
        name: 'Edit',
        url: '',
        onClick: (ev: React.MouseEvent<HTMLElement>, item?: INavLink) => {
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
