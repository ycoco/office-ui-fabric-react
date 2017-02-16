import * as React from 'react';

import * as ReactDOM from 'react-dom';
import * as ReactTestUtils from 'react-addons-test-utils';

let { expect } = chai;

import { HorizontalNav } from './HorizontalNav';

describe('HorizontalNav', () => {

  it('handles the basic scenario of rendering 2 items correctly', () => {
    let component = ReactTestUtils.renderIntoDocument(
      <HorizontalNav items={[
        { name: 'item 1', url: 'http://bing.com' },
        { name: 'item 2', url: 'http://msn.com' }
      ]} />
    );
    let renderedDOM = ReactDOM.findDOMNode(component as React.ReactInstance);

    expect(renderedDOM.getElementsByClassName('ms-HorizontalNavItem').length).to.equal(2);
  });
});
