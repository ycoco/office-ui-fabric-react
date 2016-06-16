const LOREM_IPSUM = ('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut ' +
  'labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut ' +
  'aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore ' +
  'eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt ' +
  'mollit anim id est laborum').split(' ');

/**
 * Creates an array of objects with a key attribute to be used with the selection control.
 */
export function createExampleItems(count: number, startIndex = 0): any {

  return Array.apply(null, Array(count)).map((item, index) => ({
    key: 'item-' + (index + startIndex) + ' ' + lorem(4),
    displayName: lorem(3),
    description: lorem(10 + Math.round(Math.random() * 10))
  }));
}

/**
 * Creates arbitrary sized ItemTiles for the ImageGrid example.
 */
export function createImageGridItems(count: number, startIndex = 0): any {

  return Array.apply(null, Array(count)).map((item, index) => {
    let width = 256 + Math.round(Math.random() * 1024);
    let height = 256 + Math.round(Math.random() * 512);

    return {
      key: 'item-' + (index + startIndex) + ' ' + lorem(4),
      displayName: lorem(3),
      subText: lorem(2 + Math.round(Math.random() * 5)),
      cellWidth: 0,
      cellHeight: 0,
      imageWidth: width,
      imageHeight: height,
      thumbnailUrl: `http://placehold.it/${width}x${height}`
    };
  });
}

/**
 * Creates fixed sized ItemTiles for the ImageGrid fixed example.
 */
export function createImageGridFixedItems(count: number, startIndex = 0): any {
  return Array.apply(null, Array(count)).map((item, index) => {
    // Only used to generate random images
    let width = Math.round(Math.random() * 200);
    let height = Math.round(Math.random() * 300);

    return {
      key: 'item-' + (index + startIndex) + ' ' + lorem(4),
      displayName: lorem(3),
      subText: lorem(2 + Math.round(Math.random() * 5)),
      cellWidth: 0,
      cellHeight: 0,
      imageWidth: 384,
      imageHeight: 512,
      thumbnailUrl: `http://placekitten.com/${384 + width}/${512 + height}`
    };
  });
}

export function createCardListItems(count: number, startIndex = 0): any {
  return Array.apply(null, Array(count)).map((item, index) => {
    // Only used to generate random images
    let width = Math.round(Math.random() * 200);
    let height = Math.round(Math.random() * 300);

    return {
      location: lorem(1),
      title: lorem(3) + '.pptx',
      previewImageSrc: `http://placekitten.com/${384 + width}/${512 + height}`,
      iconSrc: 'dist/icon-ppt.png',
      onClickHref: 'http://bing.com',
      activity: 'Edit Feb 23, 2016',
      people: [
        { name: 'Kat Larrson', profileImageSrc: 'dist/avatar-kat.png' },
        { name: 'Josh Hancock', profileImageSrc: '', initials: 'JH' },
        { name: 'Tina Dasani', profileImageSrc: 'dist/avatar-josh.png' }
      ]
    };
  });
}

export function lorem(wordCount: number): string {
  return Array.apply(null, Array(wordCount))
    .map(item => _pickRandom(LOREM_IPSUM))
    .join(' ');
}

function _pickRandom(array: string[]) {
  let index = Math.floor(Math.random() * array.length);
  return array[index];
}
