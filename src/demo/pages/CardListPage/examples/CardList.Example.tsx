import * as React from 'react';
import { ImageFit }from 'office-ui-fabric-react/lib/Image';
import { CardList, ICardItem, CardType } from '../../../../index';
import { createCardListItems } from '../../../utilities/data';

export class CardListExample extends React.Component<any, {}> {
  private _items: ICardItem[];

  constructor() {
    super();
    let uploadTipItem: ICardItem = {
      title: 'View and share files',
      tipDetailContent: 'View, share and collaborate on content with your team.',
      cardType: CardType.TipTile,
      onClickHref: 'http://bing.com',
      tipActionButtonIcon: 'Upload',
      tipActionLabel: 'Upload a document',
      previewImages: [{ previewImageSrc: 'dist/upload.png', imageFit: ImageFit.center }]
    };

    let addListTipItem: ICardItem = {
      title: 'Get organized',
      tipDetailContent: 'Use lists to keep team activities organized.',
      cardType: CardType.TipTile,
      onClickHref: 'http://bing.com',
      tipActionButtonIcon: 'Add',
      tipActionLabel: 'Add a list',
      previewImages: [{ previewImageSrc: 'dist/list.png', imageFit: ImageFit.center }]
    };

    let createSiteActivityItem: ICardItem = {
      title: 'Test Site',
      onClickHref: 'http://bing.com',
      activity: 'Created site 2 days ago',
      people: [
        { name: 'Tina Dasani', profileImageSrc: 'dist/avatar-josh.png' }
      ],
      customIconAcronym: 'TS',
      customIconBgColor: '#99b433'
    };

    let addListActivityItem: ICardItem = {
      title: 'General02c7-d7a6e5304f1e861-a2a821a-50489eC-olumns2',
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
      accentColor: '#ce4b1f',
      name: 'second file.pptx',
      url: 'www.bing.com'
    });
    this._items[0].previewImages.push({
      previewImageSrc: 'dist/calendar.png',
      iconSrc: 'dist/icon-ppt.png',
      accentColor: '#ce4b1f',
      name: 'third file.pptx',
      url: 'www.bing.com'
    });
    this._items[0].previewImages.push({
      previewImageSrc: 'dist/calendar.png',
      iconSrc: 'dist/icon-ppt.png',
      accentColor: '#ce4b1f',
      name: 'third file.pptx',
      url: 'www.bing.com'
    });
    this._items[0].title = ' 4 files were added';
    this._items[0].activity = 'Added files Feb 23, 2016';
    this._items[0].getOverflowDocumentCountText = (overflowCount: number) => `+${overflowCount} more`;
    this._items.push(addListActivityItem);
    this._items.push(uploadTipItem);
    this._items.push(addListTipItem);
    this._items.push(createSiteActivityItem);
  }

  public render() {
    return (
      <CardList title='Activity' items={ this._items } getAriaLabel={ this.getAriaLabel } ariaLabelForGrid='Card List, use right and left arrow keys to navigate, arrow down to access details inside the card.'></CardList>
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
