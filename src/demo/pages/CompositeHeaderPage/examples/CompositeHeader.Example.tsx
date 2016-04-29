import * as React from 'react';
import './CompositeHeader.Example.scss';
import {
  CompositeHeader,
  ICompositeHeaderProps,
  IHorizontalNavItem,
} from '../../../../components/index';

export interface ICompositeHeaderExampleState {
  numberOfNavItems: Number;
}

export default class CompositeHeaderExample extends React.Component<React.Props<CompositeHeaderExample>, ICompositeHeaderExampleState> {
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
          alert(`You clicked on ${item.text}`);
        }
      });
    }

    let compositeHeaderProps: ICompositeHeaderProps = {
      siteHeaderProps: {
        siteTitle: 'OneDrive and SharePoint',
        siteLogo: {
          siteAcronym: 'OS',
          siteLogoBgColor: 'limegreen'
        },
        groupInfoString: 'Team Site',
      },
      horizontalNavProps: {
        items: [{text: 'Link 1'}, {text: 'Link 2'}]
      },
      goToOutlook: {
        goToOutlookString: 'Back to Outlook',
        goToOutlookAction: () => alert('You hit go to outlook')
      }
    };

    return (
      <div className='eg'>
        <p>Note: The actual header does not have a dashed border</p>
        <div className='eg-header'>
          <CompositeHeader {...compositeHeaderProps} />
        </div>
      </div>
    );
  }
}
