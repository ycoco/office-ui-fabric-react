/* tslint:disable:no-unused-variable */
import * as React from 'react';
/* tslint:enable:no-unused-variable */

import * as ReactDOM from 'react-dom';
import * as ReactTestUtils from 'react-addons-test-utils';

let { expect } = chai;

import {
  ItemTile,
  ItemTileType
} from './index';

describe('ItemTile', () => {

  it('renders an itemtile', () => {
    let component = ReactTestUtils.renderIntoDocument(
      <ItemTile
        itemTileType={ ItemTileType.file }
        displayName='Hello, world!'
      />
    );
    let renderedDOM = ReactDOM.findDOMNode(component);

    expect(
      renderedDOM.getElementsByClassName('ms-ItemTile-name')[0] &&
      renderedDOM.getElementsByClassName('ms-ItemTile-name')[0].textContent
      ).to.equal('Hello, world!');
  });

});
