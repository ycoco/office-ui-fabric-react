const LOREM_IPSUM = ('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut ' +
  'labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut ' +
  'aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore ' +
  'eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt ' +
  'mollit anim id est laborum').split(' ');

export function createGridListItems(count: number, startIndex = 0): any {

  return Array.apply(null, Array(count)).map((item, index) => ({
    key: 'item-' + (index + startIndex) + ' ' + lorem(4),
    displayName: lorem(3),
    subText: lorem(2 + Math.round(Math.random() * 5)),
    cellWidth: 128 + Math.round(Math.random() * 128)
  }));
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
