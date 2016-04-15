/* tslint:disable:no-unused-variable */
import * as React from 'react';
/* tslint:enable:no-unused-variable */

import * as ReactDOM from 'react-dom';
import * as ReactTestUtils from 'react-addons-test-utils';

let { expect } = chai;

import HorizontalNav from './HorizontalNav';

describe('HorizontalNav', () => {

  it('handles the basic scenario of rendering 2 items correctly', () => {
    let component = ReactTestUtils.renderIntoDocument(
      <HorizontalNav items={[
        { text: 'item 1' },
        { text: 'item 2' }
      ]} />
    );
    let renderedDOM = ReactDOM.findDOMNode(component);

    expect(renderedDOM.getElementsByClassName('ms-HorizontalNavItem').length).to.equal(2);
  });

});
