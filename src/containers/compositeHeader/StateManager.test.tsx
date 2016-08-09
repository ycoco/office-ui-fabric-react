/* tslint:disable:no-unused-variable */
import * as React from 'react';
/* tslint:enable:no-unused-variable */

import * as ReactDOM from 'react-dom';
import chai = require('chai');
import * as sinon from 'sinon';
import * as TestUtils from './test/index';
import * as ReactTestUtils from 'react-addons-test-utils';

import Promise from '@ms/odsp-utilities/lib/async/Promise';
import Features from '@ms/odsp-utilities/lib/features/Features';
import { assign } from 'office-ui-fabric-react/lib/utilities/object';

import {
  GROUP_TYPE_PUBLIC,
  ISiteHeaderContainerStateManagerParams
} from './index';
import { ISpPageContext } from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';
import { IGroupsProvider } from '@ms/odsp-datasources/lib/Groups';
import { SiteDataSource } from '@ms/odsp-datasources/lib/Site';

const expect = chai.expect;

describe('SiteHeaderContainerStateManager', () => {
  let hostSettings: ISpPageContext;
  let logoOnClick = sinon.spy();
  let goToOutlookOnClick = sinon.spy();
  let goToMembersOnClick = sinon.spy();
  let topNavNodeOnClick = sinon.spy();
  let openPersonaCard = sinon.spy();
  let mockMembership: TestUtils.MockMembership;
  let membershipLoad: Sinon.SinonSpy;
  let group: TestUtils.MockGroup;
  let defaultParams: ISiteHeaderContainerStateManagerParams;
  let isSiteReadOnly: boolean = false;
  let hasMessageBar: boolean = false;
  let getGroupsProvider: () => Promise<IGroupsProvider> = () => {
    return Promise.wrap(TestUtils.createMockGroupsProvider(group));
  };
  let getSiteDataSource: () => Promise<SiteDataSource> = () => {
    return Promise.wrap(TestUtils.createMockSiteDataSource(isSiteReadOnly, hasMessageBar));
  };
  let xhr: Sinon.SinonFakeXMLHttpRequest;

  before(() => {
    mockMembership = new TestUtils.MockMembership();
    membershipLoad = sinon.spy(mockMembership, 'load');
    group = new TestUtils.MockGroup(mockMembership);
    xhr = sinon.useFakeXMLHttpRequest();
    Features.isFeatureEnabled = (_: any) => true;

    // Default env: Not a group|No classification|no guests|no top nav
    // These settings serve as a baseline to be overwritten below for each scenario being tested.
    hostSettings = assign(new TestUtils.MockSpPageContext(), {
      groupId: undefined,
      siteClassification: undefined,
      isAnonymousGuestUser: false,
      guestsEnabled: false,
      navigationInfo: undefined,
      groupType: null
    });

    defaultParams = {
      hostSettings: hostSettings,
      siteHeader: undefined, // mock container will define it.
      logoOnClick: logoOnClick,
      goToOutlookOnClick: goToOutlookOnClick,
      goToMembersOnClick: goToMembersOnClick,
      topNavNodeOnClick: topNavNodeOnClick,
      openPersonaCard: openPersonaCard,
      getGroupsProvider: getGroupsProvider,
      getSiteDataSource: getSiteDataSource,
      strings: TestUtils.strings
    };
  });

  describe('- Teamsite|with guests|MBI|following|topNav:nested', () => {
    let component: TestUtils.MockContainer;

    before(() => {
      let context = assign({}, hostSettings, {
        siteClassification: '(MBI)',
        guestsEnabled: true,
        navigationInfo: {
          topNav: TestUtils.nestedMockNavData
        }
      });

      let params = assign({}, defaultParams, {
        hostSettings: context
      });

      component = ReactTestUtils.renderIntoDocument(
        <TestUtils.MockContainer params={ params } />
      ) as TestUtils.MockContainer;
    });

    it('has expected group info string', () => {
      const props = component.stateManager.getRenderProps();
      expect(props.siteHeaderProps.groupInfoString).to.equals('Sharing with guests permitted  |  (MBI)');
    });

    it('has no read only bar', () => {
      let { siteReadOnlyProps } = component.stateManager.getRenderProps();
      expect(siteReadOnlyProps).to.be.undefined;
    });

    it('has no site status bar', () => {
      let { messageBarProps } = component.stateManager.getRenderProps();
      expect(messageBarProps).to.be.undefined;
    });

    it('handles 1-lvl nested nav correctly', () => {
      const { horizontalNavProps } = component.stateManager.getRenderProps();
      expect(horizontalNavProps.items.length).to.equal(5, 'There should be exactly 5 horizontalNav items');
      expect(horizontalNavProps.items[0].childNavItems.length).to.equal(1, 'First nav item should have 1 child');
      expect(horizontalNavProps.items[0].childNavItems[0].text).to.equal('nested 1', 'Validating first nested nav link');
      expect(horizontalNavProps.items[3].childNavItems.length).to.equal(1, 'Fourth nav item should have 1 child');
      expect(horizontalNavProps.items[3].childNavItems[0].text).to.equal('nested 2', 'Validating fourth nested nav link');
      expect(!horizontalNavProps.items[4].childNavItems || horizontalNavProps.items[4].childNavItems.length === 0).to.equal(true, 'Fifth nav item should not have a child');
    });
  });

  describe('- Public group|without guests|nonav', () => {
    let component: TestUtils.MockContainer;
    let renderedDOM: Element;

    before(() => {
      let context = assign({}, hostSettings, {
        groupId: 'abcdef-ghij-klmn-opqr',
        siteClassification: '(MBI)',
        groupType: GROUP_TYPE_PUBLIC,
        guestsEnabled: false,
        isAnonymousGuestUser: false,
        navigationInfo: { topNav: [] }
      });

      let params = assign({}, defaultParams, {
        hostSettings: context
      });

      component = ReactTestUtils.renderIntoDocument(<TestUtils.MockContainer params={ params } />) as TestUtils.MockContainer;
      renderedDOM = ReactDOM.findDOMNode(component);
    });

    it('uses the GroupsProvider object passed in and loads membership', () => {
      expect(membershipLoad.called).to.be.true;
    });

    it('has expected group info string', () => {
      let props = component.stateManager.getRenderProps();
      expect(props.siteHeaderProps.groupInfoString).to.equals(TestUtils.strings.publicGroup);
    });

    it('should have no nav', () => {
      const { horizontalNavProps } = component.stateManager.getRenderProps();
      expect(!horizontalNavProps.items || horizontalNavProps.items.length === 0).to.equal(true, 'Should not have any nav items');
    });

    it('should see link to group conversation and use passed in string and callback', () => {
      const { goToOutlook } = component.stateManager.getRenderProps();
      expect(goToOutlook).to.not.be.undefined;
      expect(goToOutlook.goToOutlookString).to.equal(TestUtils.strings.goToOutlook, 'Should use passed in string');
      // ReactTestUtils.Simulate.click(renderedDOM.getElementsByClassName('ms-compositeHeader-goToOutlook')[0]);
      // expect(goToOutlookOnClick.called).to.equal(true, 'Triggers passed in callback when clicked');
    });

    it('should see link to members and use passed in callback', () => {
      const { siteHeaderProps } = component.stateManager.getRenderProps();
      expect(siteHeaderProps.__goToMembers).to.not.be.undefined;
      // expect(siteHeaderProps.__goToMembers.goToMembersAction).to.equal(goToMembersOnClick, 'Should use passed in callback');
    });
  });

  describe('- Private group|with guests|is guest|read only bar|message bar', () => {
    let component: TestUtils.MockContainer;

    before(() => {
      let context = assign({}, hostSettings, {
        groupId: 'abcdef-ghij-klmn-opqr',
        groupType: 'Private',
        guestsEnabled: true,
        isAnonymousGuestUser: true,
        navigationInfo: { topNav: [] }
      });

      let params = assign({}, defaultParams, {
        hostSettings: context
      });

      isSiteReadOnly = true;
      hasMessageBar = true;

      component = ReactTestUtils.renderIntoDocument(<TestUtils.MockContainer params={ params } />) as TestUtils.MockContainer;
    });

    after(() => {
      isSiteReadOnly = false;
      hasMessageBar = false;
    });

    it('has expected group info string', () => {
      let props = component.stateManager.getRenderProps();
      expect(props.siteHeaderProps.groupInfoString).to.equals('Private group  |  Sharing with guests permitted');
    });

    it('should not disable site logo fallback', () => {
      let props = component.stateManager.getRenderProps();
      expect(props.siteHeaderProps.disableSiteLogoFallback).to.equals(false, 'Should not disable site logo fallback');
    });

    it('has a read only bar', () => {
      let { siteReadOnlyProps } = component.stateManager.getRenderProps();
      expect(siteReadOnlyProps).to.not.be.undefined;
      expect(siteReadOnlyProps.isSiteReadOnly).to.be.true;
      expect(siteReadOnlyProps.siteReadOnlyString).to.equal(TestUtils.strings.siteReadOnlyString);
    });

    it('has a site status bar', () => {
      let { messageBarProps } = component.stateManager.getRenderProps();
      expect(messageBarProps).to.not.be.undefined;
      expect(messageBarProps.message).to.equal('This is a message');
      expect(messageBarProps.linkText).to.equal('This is a link');
      expect(messageBarProps.linkTarget).to.equal('https://www.bing.com/search?q=msft');
    });

    it('should have no nav', () => {
      const { horizontalNavProps } = component.stateManager.getRenderProps();
      expect(horizontalNavProps.items === undefined).to.equal(true, 'Should not have any nav items');
    });

    it('should not see link to group conversation', () => {
      const { goToOutlook } = component.stateManager.getRenderProps();
      expect(goToOutlook).to.be.undefined;
    });

    it('should not see link to members', () => {
      const { siteHeaderProps } = component.stateManager.getRenderProps();
      expect(siteHeaderProps.__goToMembers).to.be.undefined;
    });

    // todo: it should not see link in group card to exchange
    // todo: it should not see link to follow
  });
});
