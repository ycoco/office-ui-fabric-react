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
  let stub = sinon.stub();
  let hostSettings: ISpPageContext;
  let logoOnClick = sinon.spy();
  let goToOutlookOnClick = sinon.spy();
  let goToMembersOnClick = sinon.spy();
  let topNavNodeOnClick = sinon.spy();
  let openPersonaCard = sinon.spy();
  let addUserToGroupMembership = stub.returns(Promise.wrap(undefined));
  let removeUserFromGroupMembership = stub.returns(Promise.wrap(undefined));
  let syncGroupProperties = sinon.spy();
  let doesCachedGroupPropertiesDiffer: () => boolean = (): boolean => { return true; };
  let isUserInGroup: () => Promise<boolean> = () => { return Promise.wrap(true); };
  let mockMembership: TestUtils.MockMembership;
  let membershipLoad: sinon.SinonSpy;
  let group: TestUtils.MockGroup;
  let currentUser: TestUtils.MockUser;
  let defaultParams: ISiteHeaderContainerStateManagerParams;
  let isSiteReadOnly: boolean = false;
  let hasMessageBar: boolean = false;
  let groupsProviderCreationInfo: TestUtils.IMockGroupsProviderCreationInfo;
  let getGroupsProvider: () => Promise<IGroupsProvider> = () => {
    return Promise.wrap(TestUtils.createMockGroupsProvider(groupsProviderCreationInfo));
  };
  let getSiteDataSource: () => Promise<SiteDataSource> = () => {
    return Promise.wrap(TestUtils.createMockSiteDataSource(isSiteReadOnly, hasMessageBar));
  };
  let xhr: sinon.SinonFakeXMLHttpRequest;

  before(() => {
    /* tslint:disable */
    // emulate sharepoint environment
    window['_spPageContextInfo'] = hostSettings;
    /* tslint:enable */

    mockMembership = new TestUtils.MockMembership();
    membershipLoad = sinon.spy(mockMembership, 'load');
    group = new TestUtils.MockGroup(mockMembership);
    currentUser = new TestUtils.MockUser();
    xhr = sinon.useFakeXMLHttpRequest();
    Features.isFeatureEnabled = (_: any) => true;
    groupsProviderCreationInfo = {
      group: group,
      currentUser: currentUser,
      doesCachedGroupPropertiesDiffer: doesCachedGroupPropertiesDiffer,
      syncGroupProperties: syncGroupProperties,
      isUserInGroup: isUserInGroup,
      addUserToGroupMembership: addUserToGroupMembership,
      removeUserFromGroupMembership: removeUserFromGroupMembership
    };

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
        groupType: GROUP_TYPE_PUBLIC,
        guestsEnabled: false,
        isAnonymousGuestUser: false,
        navigationInfo: { topNav: [] }
      });

      let params = assign({}, defaultParams, {
        hostSettings: context
      });

      component = ReactTestUtils.renderIntoDocument(<TestUtils.MockContainer params={ params } />) as TestUtils.MockContainer;
      renderedDOM = ReactDOM.findDOMNode(component as React.ReactInstance);
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
      expect(siteHeaderProps.membersInfoProps.goToMembersAction).to.not.be.undefined;
      siteHeaderProps.membersInfoProps.goToMembersAction(null);
      expect(goToMembersOnClick.called).to.equal(true, 'should see goToMembersOnClick to be called');
    });

    it('should see syncGroupProperties be called if doesCachedGroupPropertiesDiffer returns true', () => {
        expect(syncGroupProperties.called).to.equal(true, 'should see syncGroupProperties be called');
    });

    it('should see isMemberOfCurrentGroup state sets to true if isUserInGroup returns true', () => {
        expect(component.state.isMemberOfCurrentGroup).to.equal(true, 'should see isMemberOfCurrentGroup sets to true');
    });

    it('should see addUserToGroupMembership be called if _onJoinGroupClick function was called', () => {
        const { siteHeaderProps } = component.stateManager.getRenderProps();
        siteHeaderProps.membersInfoProps.onJoin.onJoinAction(null);
        expect(addUserToGroupMembership.called).to.equal(true, 'should see addUserToGroupMembership be called');
    });

    it('should see removeUserFromGroupMembership be called and isLeavingGroup state sets to true if _onLeaveGroupClick function was called', () => {
        const { siteHeaderProps } = component.stateManager.getRenderProps();
        siteHeaderProps.membersInfoProps.onLeaveGroup.onLeaveGroupAction(null);
        expect(removeUserFromGroupMembership.called).to.equal(true, 'should see removeUserFromGroupMembership be called');
        expect(component.state.isLeavingGroup).to.equal(true, 'should see isLeavingGroup state sets to true');
    });

    it('should see joinLeaveErrorMessage state sets to undefined if onErrorDismissClick was called', () => {
        const { siteHeaderProps } = component.stateManager.getRenderProps();
        siteHeaderProps.membersInfoProps.onErrorDismissClick(null);
        expect(component.state.joinLeaveErrorMessage).to.equal(undefined, 'should see joinLeaveErrorMessage state sets to undefined');
    });
  });

  describe('- Private group|with guests|is guest|read only bar|message bar|mbi-hostSettings', () => {
    let component: TestUtils.MockContainer;

    before(() => {
      let context = assign({}, hostSettings, {
        groupId: 'abcdef-ghij-klmn-opqr',
        groupType: 'Private',
        siteClassification: '(MBI)',
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
      expect(props.siteHeaderProps.groupInfoString).to.equals('Private group (MBI) With Guests');
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
      expect(siteHeaderProps.membersInfoProps.goToMembersAction).to.be.undefined;
    });

    // todo: it should not see link in group card to exchange
    // todo: it should not see link to follow
  });
});
