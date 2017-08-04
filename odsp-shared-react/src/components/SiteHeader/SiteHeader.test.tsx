import * as React from 'react';

import * as ReactDOM from 'react-dom';
import * as ReactTestUtils from 'react-addons-test-utils';

import { SiteHeader, ISiteHeaderProps } from './index';
import chai = require('chai');

const assert = chai.assert;
const expect = chai.expect;

const basicHeaderProps: ISiteHeaderProps = {
  siteTitle: 'Kitty Petting Club',
  siteLogo: { siteLogoUrl: 'http://placekitten.com/240/96', siteAcronym: 'CS', siteLogoBgColor: '#7E3877' },
  membersInfoProps: {
    membersText: '1231 members'
  }
};

describe('SiteHeader', () => {
  it('renders a header properly', () => {
    let component = ReactTestUtils.renderIntoDocument(<SiteHeader { ...basicHeaderProps } />);
    let renderedDOM = ReactDOM.findDOMNode(component as React.ReactInstance);
    let title = renderedDOM.querySelector('.ms-siteHeader-siteName') as HTMLElement;
    assert.isDefined(title, 'Can find title element');
    expect(title.firstChild.textContent).to.equal(basicHeaderProps.siteTitle, 'Title is correct');
  });
});
