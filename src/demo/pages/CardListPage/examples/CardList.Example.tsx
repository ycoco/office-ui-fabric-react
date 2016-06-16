import * as React from 'react';
import { CardList, ICardItem, CardType } from '../../../../index';
import { createCardListItems } from '../../../utilities/data';

export class CardListExample extends React.Component<any, {}> {
  private _items;

  constructor() {
    super();
    let uploadTipItem: ICardItem = {
      title: 'Recommended',
      tipDetailContent: 'Welcome to your team site. Let\'s get started.',
      cardType: CardType.TipTile,
      onClickHref: 'http://bing.com',
      tipActionButtonIcon: 'upload',
      tipActionLabel: 'Upload a document',
      iconSrc: 'dist/list.png'
    };
    let addListTipItem: ICardItem = {
      title: 'Recommended',
      tipDetailContent: 'Use lists to keep team activities organized.',
      cardType: CardType.TipTile,
      onClickHref: 'http://bing.com',
      tipActionButtonIcon: 'plus2',
      tipActionLabel: 'Add a list',
      iconSrc: 'dist/upload.png'
    };
    let addListActivityItem: ICardItem = {
      title: 'Calendar List',
      iconSrc: 'dist/calendar.png',
      onClickHref: 'http://bing.com',
      activity: 'Created Feb 23, 2016',
      people: [
        { name: 'Tina Dasani', profileImageSrc: 'dist/avatar-josh.png' }
      ]
    };
    this._items = createCardListItems(10);
    this._items.push(addListActivityItem);
    this._items.push(uploadTipItem);
    this._items.push(addListTipItem);
  }

  public render() {
    return (
      <CardList items={ this._items }></CardList>
    );
  }
}
