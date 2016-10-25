/* tslint:disable:no-unused-variable */
import * as React from 'react';
/* tslint:enable:no-unused-variable */

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

const headerWithGroupCardProps: ISiteHeaderProps = {
  siteTitle: 'Kitty Petting Club',
  siteLogo: { siteLogoUrl: 'http://placekitten.com/240/96', siteAcronym: 'CS', siteLogoBgColor: '#7E3877' },
  showGroupCard: true,
  groupInfoString: 'Public group'
};

describe('SiteHeader', () => {
  it('renders a header properly', () => {
    let component = ReactTestUtils.renderIntoDocument(<SiteHeader { ...basicHeaderProps } />);
    let renderedDOM = ReactDOM.findDOMNode(component as React.ReactInstance);
    let title = renderedDOM.querySelector('.ms-siteHeaderSiteName .ms-font-xxl') as HTMLElement;
    assert.isDefined(title, 'Can find title element');
    expect(title.innerText).to.equal(basicHeaderProps.siteTitle, 'Title is correct');
    let members = renderedDOM.querySelector('.ms-siteHeaderMembersInfo') as HTMLElement;
    assert.isDefined(members, 'Can find members element');
  });

  it('renders a header with groupcard properly', () => {
    let component = ReactTestUtils.renderIntoDocument(<SiteHeader { ...headerWithGroupCardProps } />);
    let renderedDOM = ReactDOM.findDOMNode(component as React.ReactInstance);
    let title = renderedDOM.querySelector('.ms-siteHeaderSiteName .ms-font-xxl') as HTMLElement;
    assert.isDefined(title, 'Can find title element');
    expect(title.innerText).to.equal(headerWithGroupCardProps.siteTitle, 'Title is correct');
    let groupInfoString = renderedDOM.querySelector('.ms-siteHeaderGroupInfo') as HTMLElement;
    assert.isDefined(groupInfoString, 'Can find group info string element');
    expect(groupInfoString.innerText).to.equal(headerWithGroupCardProps.groupInfoString);
  });
});