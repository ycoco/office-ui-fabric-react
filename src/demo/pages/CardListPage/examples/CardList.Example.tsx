import * as React from 'react';
import { ImageFit }from '@ms/office-ui-fabric-react/lib/Image';
import { CardList, ICardItem, CardType } from '../../../../index';
import { createCardListItems } from '../../../utilities/data';

export class CardListExample extends React.Component<any, {}> {
  private _items: ICardItem[];

  constructor() {
    super();
    let uploadTipItem: ICardItem = {
      title: 'Recommended',
      tipDetailContent: 'Welcome to your team site. Let\'s get started.',
      cardType: CardType.TipTile,
      onClickHref: 'http://bing.com',
      tipActionButtonIcon: 'upload',
      tipActionLabel: 'Upload a document',
      previewImages: [{ previewImageSrc: 'dist/list.png', imageFit: ImageFit.center }]
    };
    let addListTipItem: ICardItem = {
      title: 'Recommended',
      tipDetailContent: 'Use lists to keep team activities organized.',
      cardType: CardType.TipTile,
      onClickHref: 'http://bing.com',
      tipActionButtonIcon: 'plus2',
      tipActionLabel: 'Add a list',
      previewImages: [{ previewImageSrc: 'dist/upload.png', imageFit: ImageFit.center }]
    };
    let addListActivityItem: ICardItem = {
      title: 'Calendar List',
      previewImages: [{ previewImageSrc: 'dist/calendar.png', imageFit: ImageFit.center }],
      onClickHref: 'http://bing.com',
      activity: 'Created Feb 23, 2016',
      people: [
        { name: 'Tina Dasani', profileImageSrc: 'dist/avatar-josh.png' }
      ]
    };
    this._items = createCardListItems(10);
    this._items[0].previewImages.push({
      previewImageSrc: `http://placekitten.com/488/606`,
      iconSrc: 'dist/icon-ppt.png',
      accentColor: '#ce4b1f'
    });
    this._items[0].previewImages.push({ previewImageSrc: 'dist/calendar.png', imageFit: ImageFit.center });
    this._items[0].title += ' +2';
    this._items[0].activity = 'Added files Feb 23, 2016';
    this._items.push(addListActivityItem);
    this._items.push(uploadTipItem);
    this._items.push(addListTipItem);
  }

  public render() {
    return (
      <CardList items={ this._items } getAriaLabel={ this.getAriaLabel } ariaDescription='use right and left arrow keys to navigate, arrow down to access details inside the card.'></CardList>
    );
  }

  private getAriaLabel(item: ICardItem, index: number): string {
    let ariaLabel;
    if (item.cardType === CardType.TipTile) {
      ariaLabel = item.title + ', ' + item.tipDetailContent + ', ' + item.tipActionLabel;
    } else {
      ariaLabel = item.title + ', ' + ((item.people && item.people.length > 0) ? item.people[0].name : '') + ', ' + item.activity;
    }

    return ariaLabel;
  }
}
