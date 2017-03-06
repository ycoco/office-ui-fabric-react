import * as React from 'react';
import { CardList } from '../../../../index';
import { CardListExample } from './CardList.Example';

export class CardListWithCompactCardExample extends CardListExample {
  public render() {
    return (
      <div style={ { maxWidth: 350 } }>
        <CardList title='Activity'
          useCompactLayout={ true }
          items={ this.items }
          getAriaLabel={ this.getAriaLabel }
          ariaLabelForGrid='Card List, use right and left arrow keys to navigate, arrow down to access details inside the card.'>
        </CardList>
      </div>
    );
  }
}