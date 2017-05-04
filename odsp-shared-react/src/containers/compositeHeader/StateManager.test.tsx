import * as React from 'react';

import * as ReactDOM from 'react-dom';
import chai = require('chai');
import * as sinon from 'sinon';
import * as TestUtils from './test/index';
import * as ReactTestUtils from 'react-addons-test-utils';

import Promise from '@ms/odsp-utilities/lib/async/Promise';
import Features from '@ms/odsp-utilities/lib/features/Features';
import { assign } from 'office-ui-fabric-react/lib/Utilities';
import StringHelper = require('@ms/odsp-utilities/lib/string/StringHelper');

import {
  GROUP_TYPE_PUBLIC,
  HorizontalNavTypes,
  ISiteHeaderContainerStateManagerParams
} from './index';
import { ISpPageContext } from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';
import { IGroupsProvider } from '@ms/odsp-datasources/lib/Groups';
import { IGroupSiteProvider } from '@ms/odsp-datasources/lib/GroupSite';
import { SiteDataSource } from '@ms/odsp-datasources/lib/Site';
import { ViewNavDataSource } from '@ms/odsp-datasources/lib/ViewNav';

import { FollowState } from './../../components/CompositeHeader/CompositeHeader.Props';

const expect = chai.expect;

describe('SiteHeaderContainerStateManager', () => {
  let hostSettings: ISpPageContext;
  let logoOnClick = sinon.spy();
  let goToOutlookOnClick = sinon.spy();
  let goToMembersOnClick = sinon.spy();
  let topNavNodeOnClick = sinon.spy();
  let navigateOnLeaveGroup = sinon.spy();
  let openPersonaCard = sinon.spy();
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
  let getSiteDataSource: () => Promise<SiteDataSource> = () => {
    return Promise.wrap(TestUtils.createMockSiteDataSource(isSiteReadOnly, hasMessageBar));
  };
  let getViewNavDataSource: () => Promise<ViewNavDataSource> = () => {
    return Promise.wrap(TestUtils.createMockViewNavDataSource());
  };
  let xhr: sinon.SinonFakeXMLHttpRequest;
  let changeSpacesToNonBreakingSpace = (str: string) => str.replace(/ /g, ' ');

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
      addUserToGroupMembership: undefined,
      removeUserFromGroupMembership: undefined,
      removeUserFromGroupOwnership: undefined
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
      navigateOnLeaveGroup: navigateOnLeaveGroup,
      openPersonaCard: openPersonaCard,
      getGroupsProvider: undefined,
      getSiteDataSource: getSiteDataSource,
      getViewNavDataSource: getViewNavDataSource,
      followDataSource: new TestUtils.MockFollowDataSource(true, true),
      strings: TestUtils.strings,
      getGroupSiteProvider: undefined,
      horizontalNavType: HorizontalNavTypes.topNav,
      editLink: undefined
    };
  });

  describe('- Teamsite|with guests|MBI|following|topNav:nested', () => {
    let component: TestUtils.MockContainer;
    let followDataSource: TestUtils.MockFollowDataSource;

    before(() => {
      let context = assign({}, hostSettings, {
        siteClassification: '(MBI)',
        guestsEnabled: true,
        navigationInfo: {
          quickLaunch: [],
          topNav: TestUtils.nestedMockNavData
        }
      });

      followDataSource = defaultParams.followDataSource as TestUtils.MockFollowDataSource;

      let params = assign({}, defaultParams, {
        hostSettings: context
      });

      component = ReactTestUtils.renderIntoDocument(
        <TestUtils.MockContainer params={ params } />
      ) as TestUtils.MockContainer;
    });

    it('has expected group info string', () => {
      const props = component.stateManager.getRenderProps();
      const groupInfoString = StringHelper.format(
        TestUtils.strings.groupInfoWithClassificationAndGuestsForTeamsites,
        component.props.params.hostSettings.siteClassification);
      expect(props.siteHeaderProps.groupInfoString).to.equals(groupInfoString);
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
      expect(horizontalNavProps.items[0].links.length).to.equal(1, 'First nav item should have 1 child');
      expect(horizontalNavProps.items[0].links[0].name).to.equal('nested 1', 'Validating first nested nav link');
      expect(horizontalNavProps.items[3].links.length).to.equal(1, 'Fourth nav item should have 1 child');
      expect(horizontalNavProps.items[3].links[0].name).to.equal('nested 2', 'Validating fourth nested nav link');
      expect(!horizontalNavProps.items[4].links || horizontalNavProps.items[4].links.length === 0).to.equal(true, 'Fifth nav item should not have a child');
    });

    it('has follow button indicating you are following the site', () => {
      const { follow } = component.stateManager.getRenderProps();
      expect(follow, 'follow props').to.not.be.undefined;
      expect(follow.followState, 'follow state reflects following').to.equals(FollowState.followed);
    });

    it('clicking on follow button causes you to unfollow the site', () => {
      const { follow } = component.stateManager.getRenderProps();
      expect(follow, 'follow props').to.not.be.undefined;
      follow.followAction(null);
      expect((followDataSource.unfollowSite as sinon.SinonStub).calledOnce, 'unfollowSite called').to.be.true;
      expect((followDataSource.followSite as sinon.SinonStub).calledOnce, 'followSite called').to.be.false;
    });
  });

  describe('- Teamsite|topNav:publishing|not following', () => {
    let component: TestUtils.MockContainer;
    let followDataSource = new TestUtils.MockFollowDataSource(false, true);

    before(() => {
      let context = assign({}, hostSettings, {
        siteClassification: '(MBI)',
        guestsEnabled: true,
        navigationInfo: {
        },
        PublishingFeatureOn: true
      });

      let params = assign({}, defaultParams, {
        hostSettings: context,
        followDataSource: followDataSource
      });

      component = ReactTestUtils.renderIntoDocument(
        <TestUtils.MockContainer params={ params } />
      ) as TestUtils.MockContainer;
    });

    it('TopNav calls Async Fetch publishing global navigation info - initial state', () => {
      const { horizontalNavProps } = component.stateManager.getRenderProps();
      expect(horizontalNavProps.items.length).to.equal(2, 'There should be exactly 2 horizontalNav items');
      expect(horizontalNavProps.items[0].links.length).to.equal(2, 'First nav item should have 2 children');
      expect(horizontalNavProps.items[0].links[0].name).to.equal('Item1 child1', 'Validating first nested nav link');
      expect(horizontalNavProps.items[1].name).to.equal('TopNavItem2', 'Validating second nav link name');
    });

    it('has follow button indicating you are not following the site', () => {
      const { follow } = component.stateManager.getRenderProps();
      expect(follow, 'follow props').to.not.be.undefined;
      expect(follow.followState, 'follow state').to.equals(FollowState.notFollowing);
    });

    it('clicking on follow button causes you to follow the site', () => {
      const { follow } = component.stateManager.getRenderProps();
      expect(follow, 'follow props').to.not.be.undefined;
      follow.followAction(null);
      expect((followDataSource.unfollowSite as sinon.SinonStub).calledOnce, 'unfollowSite called').to.be.false;
      expect((followDataSource.followSite as sinon.SinonStub).calledOnce, 'followSite called').to.be.true;
    });
  });

  describe('- Public group|without guests|nonav|usageguideline link|is owner|spsocial-disabled', () => {
    let component: TestUtils.MockContainer;
    let renderedDOM: Element;
    let addUserToGroupMembership = sinon.stub().returns(Promise.wrap(undefined));
    let removeUserFromGroupMembership = sinon.stub().returns(Promise.wrap(undefined));
    let removeUserFromGroupOwnership = sinon.stub().returns(Promise.wrap(undefined));
    let usageGuideLineUrl: string = 'http://www.usageguidelineurl.test/';
    let followDataSource = new TestUtils.MockFollowDataSource(false, false);

    before(() => {
      let groupsProviderCreationInfoLocal = assign({}, groupsProviderCreationInfo, {
        addUserToGroupMembership: addUserToGroupMembership,
        removeUserFromGroupMembership: removeUserFromGroupMembership,
        removeUserFromGroupOwnership: removeUserFromGroupOwnership
      });

      let getGroupsProvider: () => Promise<IGroupsProvider> = () => {
        return Promise.wrap(TestUtils.createMockGroupsProvider(groupsProviderCreationInfoLocal));
      };

      let getGroupSiteProvider: () => Promise<IGroupSiteProvider> = () => {
        return Promise.wrap(TestUtils.createGroupSiteProvider(usageGuideLineUrl));
      };

      let context = assign({}, hostSettings, {
        groupId: 'abcdef-ghij-klmn-opqr',
        groupType: GROUP_TYPE_PUBLIC,
        guestsEnabled: false,
        isAnonymousGuestUser: false,
        navigationInfo: { quickLaunch: [], topNav: [] },
        siteAbsoluteUrl: '',
        webAbsoluteUrl: ''
      });

      let params = assign({}, defaultParams, {
        hostSettings: context,
        getGroupsProvider: getGroupsProvider,
        getGroupSiteProvider: getGroupSiteProvider,
        followDataSource: followDataSource
      });

      component = ReactTestUtils.renderIntoDocument(<TestUtils.MockContainer params={ params } />) as TestUtils.MockContainer;
      renderedDOM = ReactDOM.findDOMNode(component as React.ReactInstance);
    });

    it('uses the GroupsProvider object passed in and loads membership', () => {
      expect(membershipLoad.called).to.be.true;
    });

    it('has expected group info string', () => {
      let props = component.stateManager.getRenderProps();
      const groupType = component.props.params.hostSettings.groupType === GROUP_TYPE_PUBLIC ? TestUtils.strings.publicGroup : TestUtils.strings.privateGroup;
      expect(props.siteHeaderProps.groupInfoString).to.equals(groupType);
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

    // state manager no longer checks if the cached group properties differ and does not call the sync
    // this is now the job of the group provider and it happens as part of loading froup data from server
    //it('should see syncGroupProperties be called if doesCachedGroupPropertiesDiffer returns true', () => {
    //  expect(syncGroupProperties.called).to.equal(true, 'should see syncGroupProperties be called');
    //});

    it('should see isMemberOfCurrentGroup state sets to true if isUserInGroup returns true', () => {
      expect(component.state.isMemberOfCurrentGroup).to.equal(true, 'should see isMemberOfCurrentGroup sets to true');
    });

    it('should see addUserToGroupMembership be called if _onJoinGroupClick function was called', () => {
      const { siteHeaderProps } = component.stateManager.getRenderProps();
      siteHeaderProps.membersInfoProps.onJoin.onJoinAction(null);
      expect(addUserToGroupMembership.calledOnce).to.equal(true, 'should see addUserToGroupMembership be called');
    });

    it('should see removeUserFromGroupOwnership and removeUserFromGroupMembership be called, and isLeavingGroup state sets to true if onLeaveGroupAction was called', () => {
      const { siteHeaderProps } = component.stateManager.getRenderProps();
      siteHeaderProps.membersInfoProps.onLeaveGroup.onLeaveGroupAction(null);
      expect(removeUserFromGroupOwnership.calledOnce).to.equal(true, 'should see removeUserFromGroupOwnership be called if the user is not sole owner');
      expect(removeUserFromGroupMembership.calledOnce).to.equal(true, 'should see removeUserFromGroupMembership be called');
      expect(component.state.isLeavingGroup).to.equal(false, 'should see isLeavingGroup state sets to false');
    });

    it('should see joinLeaveErrorMessage state sets to undefined if onErrorDismissClick was called', () => {
      const { siteHeaderProps } = component.stateManager.getRenderProps();
      siteHeaderProps.membersInfoProps.onErrorDismissClick(null);
      expect(component.state.joinLeaveErrorMessage).to.equal(undefined, 'should see joinLeaveErrorMessage state sets to undefined');
    });

    it('should see enableJoinLeaveGroup state sets to true for public group', () => {
      expect(component.state.enableJoinLeaveGroup).to.equal(true);
    });

    it('should not see usage guideline link without group classification', () => {
      const groupInfoUsageGuidelineLink: Element = renderedDOM.getElementsByClassName('ms-siteHeaderGroupInfoUsageGuidelineLink')[0];
      expect(groupInfoUsageGuidelineLink).to.be.undefined;
    });

    it('should ultimately not see follow button as following feature disabled', () => {
      const { follow } = component.stateManager.getRenderProps();
      expect(follow).to.be.undefined;
    });
  });

  describe('- Private group|with guests|is guest|read only bar|message bar|mbi-hostSettings|usageguideline link|not owner', () => {
    /* tslint:disable */
    // emulate sharepoint environment
    window['_spPageContextInfo'] = hostSettings;
    /* tslint:enable */

    let component: TestUtils.MockContainer;
    let renderedDOM: Element;
    let addUserToGroupMembership = sinon.stub().returns(Promise.wrap(undefined));
    let removeUserFromGroupMembership = sinon.stub().returns(Promise.wrap(undefined));
    let removeUserFromGroupOwnership = sinon.stub().returns(Promise.wrap(undefined));
    let mockMembershipLocal = new TestUtils.MockMembership(5, 1, false);
    let groupLocal = new TestUtils.MockGroup(mockMembershipLocal);
    let isUserInGroupLocal: () => Promise<boolean> = () => { return Promise.wrap(false); };
    let usageGuideLineUrl: string = 'http://www.usageguidelineurl.test/';

    before(() => {
      let groupsProviderCreationInfoLocal = assign({}, groupsProviderCreationInfo, {
        group: groupLocal,
        addUserToGroupMembership: addUserToGroupMembership,
        removeUserFromGroupMembership: removeUserFromGroupMembership,
        removeUserFromGroupOwnership: removeUserFromGroupOwnership,
        isUserInGroup: isUserInGroupLocal
      });

      let getGroupsProvider: () => Promise<IGroupsProvider> = () => {
        return Promise.wrap(TestUtils.createMockGroupsProvider(groupsProviderCreationInfoLocal));
      };

      let getGroupSiteProvider: () => Promise<IGroupSiteProvider> = () => {
        return Promise.wrap(TestUtils.createGroupSiteProvider(usageGuideLineUrl));
      };

      let context = assign({}, hostSettings, {
        groupId: 'abcdef-ghij-klmn-opqr',
        groupType: 'Private',
        siteClassification: '(MBI)',
        guestsEnabled: true,
        isAnonymousGuestUser: true,
        navigationInfo: { quickLaunch: [], topNav: [] },
        siteAbsoluteUrl: '',
        webAbsoluteUrl: ''
      });

      let params = assign({}, defaultParams, {
        hostSettings: context,
        getGroupsProvider: getGroupsProvider,
        getGroupSiteProvider: getGroupSiteProvider
      });

      isSiteReadOnly = true;
      hasMessageBar = true;

      component = ReactTestUtils.renderIntoDocument(<TestUtils.MockContainer params={ params } />) as TestUtils.MockContainer;
      renderedDOM = ReactDOM.findDOMNode(component as React.ReactInstance);
    });

    after(() => {
      isSiteReadOnly = false;
      hasMessageBar = false;
    });

    it('has expected group info string', () => {
      let props = component.stateManager.getRenderProps();
      const groupType = component.props.params.hostSettings.groupType === GROUP_TYPE_PUBLIC ? TestUtils.strings.publicGroup : TestUtils.strings.privateGroup;
      const groupInfoString = changeSpacesToNonBreakingSpace(StringHelper.format(
        TestUtils.strings.groupInfoWithClassificationAndGuestsFormatString,
        groupType,
        component.props.params.hostSettings.siteClassification
      ));
      expect(props.siteHeaderProps.groupInfoString).to.equals(groupInfoString);
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

    it('should not see follow button', () => {
      const { follow } = component.stateManager.getRenderProps();
      expect(follow).to.be.undefined;
    });

    it('should see enableJoinLeaveGroup state sets to false for private group', () => {
      expect(component.state.enableJoinLeaveGroup).to.equal(false);
    });

    it('should see removeUserFromGroupMembership and navigateOnLeaveGroup be called but not removeUserFromGroupOwnership if onLeaveGroupAction was called for Private group', () => {
      const { siteHeaderProps } = component.stateManager.getRenderProps();
      siteHeaderProps.membersInfoProps.onLeaveGroup.onLeaveGroupAction(null);
      expect(removeUserFromGroupOwnership.notCalled).to.equal(true, 'should not see removeUserFromGroupOwnership be called');
      expect(removeUserFromGroupMembership.calledOnce).to.equal(true, 'should see removeUserFromGroupMembership be called');
      expect(navigateOnLeaveGroup.calledOnce).to.equal(true, 'should see navigateOnLeaveGroup be called for Private group');
    });

    it('should not see usage guideline link with anonymous guest user', () => {
      const groupInfoUsageGuidelineLink: Element = renderedDOM.getElementsByClassName('ms-siteHeaderGroupInfoUsageGuidelineLink')[0];
      expect(groupInfoUsageGuidelineLink).to.be.undefined;
    });
    // todo: it should not see link in group card to exchange
  });

  describe('- Public group|without guests|nonav|one owner|no usageguideline link|is sole owner', () => {
    /* tslint:disable */
    // emulate sharepoint environment
    window['_spPageContextInfo'] = hostSettings;
    /* tslint:enable */

    let component: TestUtils.MockContainer;
    let renderedDOM: Element;
    let addUserToGroupMembership = sinon.stub().returns(Promise.wrap(undefined));
    let removeUserFromGroupMembership = sinon.stub().returns(Promise.wrap(undefined));
    let removeUserFromGroupOwnership = sinon.stub().returns(Promise.wrap(undefined));
    let mockMembershipLocal = new TestUtils.MockMembership(5, 1, true);
    let groupLocal = new TestUtils.MockGroup(mockMembershipLocal);
    let usageGuideLineUrl: string = undefined;

    before(() => {
      let groupsProviderCreationInfoLocal = assign({}, groupsProviderCreationInfo, {
        group: groupLocal,
        addUserToGroupMembership: addUserToGroupMembership,
        removeUserFromGroupMembership: removeUserFromGroupMembership,
        removeUserFromGroupOwnership: removeUserFromGroupOwnership
      });

      let getGroupsProvider: () => Promise<IGroupsProvider> = () => {
        return Promise.wrap(TestUtils.createMockGroupsProvider(groupsProviderCreationInfoLocal));
      };

      let context = assign({}, hostSettings, {
        groupId: 'abcdef-ghij-klmn-opqr',
        groupType: GROUP_TYPE_PUBLIC,
        guestsEnabled: false,
        isAnonymousGuestUser: false,
        navigationInfo: { quickLaunch: [], topNav: [] },
        siteAbsoluteUrl: '',
        webAbsoluteUrl: ''
      });

      let getGroupSiteProvider: () => Promise<IGroupSiteProvider> = () => {
        return Promise.wrap(TestUtils.createGroupSiteProvider(usageGuideLineUrl));
      };

      let params = assign({}, defaultParams, {
        hostSettings: context,
        getGroupsProvider: getGroupsProvider,
        getGroupSiteProvider: getGroupSiteProvider
      });

      component = ReactTestUtils.renderIntoDocument(<TestUtils.MockContainer params={ params } />) as TestUtils.MockContainer;
      renderedDOM = ReactDOM.findDOMNode(component as React.ReactInstance);
    });

    it('should see lastOwnerError if onLeaveGroupAction was called for the group with only one owner', () => {
      const { siteHeaderProps } = component.stateManager.getRenderProps();
      siteHeaderProps.membersInfoProps.onLeaveGroup.onLeaveGroupAction(null);
      expect(removeUserFromGroupOwnership.notCalled).to.equal(true, 'should not see removeUserFromGroupOwnership be called');
      expect(removeUserFromGroupMembership.notCalled).to.equal(true, 'should not see removeUserFromGroupMembership be called');
      expect(component.state.joinLeaveErrorMessage).to.equal(TestUtils.strings.lastOwnerError, 'should see joinLeaveErrorMessage state sets to lastOwnerError');
    });

    it('should not see usage guideline link since no usageGuidelineUrl', () => {
      const groupInfoUsageGuidelineLink: Element = renderedDOM.getElementsByClassName('ms-siteHeaderGroupInfoUsageGuidelineLink')[0];
      expect(groupInfoUsageGuidelineLink).to.be.undefined;
    });
  });

  describe('- Private group|without guests|nonav|mbi-hostSettings|usageguideline link|not owner', () => {
    /* tslint:disable */
    // emulate sharepoint environment
    window['_spPageContextInfo'] = hostSettings;
    /* tslint:enable */

    let component: TestUtils.MockContainer;
    let renderedDOM: Element;
    let addUserToGroupMembership = sinon.stub().returns(Promise.wrap(undefined));
    let removeUserFromGroupMembership = sinon.stub().returns(Promise.wrap(undefined));
    let removeUserFromGroupOwnership = sinon.stub().returns(Promise.wrap(undefined));
    let mockMembershipLocal = new TestUtils.MockMembership(5, 1, false);
    let groupLocal = new TestUtils.MockGroup(mockMembershipLocal);
    let isUserInGroupLocal: () => Promise<boolean> = () => { return Promise.wrap(false); };
    let usageGuideLineUrl: string = 'http://www.usageguidelineurl.test/';

    before(() => {
      let groupsProviderCreationInfoLocal = assign({}, groupsProviderCreationInfo, {
        group: groupLocal,
        addUserToGroupMembership: addUserToGroupMembership,
        removeUserFromGroupMembership: removeUserFromGroupMembership,
        removeUserFromGroupOwnership: removeUserFromGroupOwnership,
        isUserInGroup: isUserInGroupLocal
      });

      let getGroupsProvider: () => Promise<IGroupsProvider> = () => {
        return Promise.wrap(TestUtils.createMockGroupsProvider(groupsProviderCreationInfoLocal));
      };

      let getGroupSiteProvider: () => Promise<IGroupSiteProvider> = () => {
        return Promise.wrap(TestUtils.createGroupSiteProvider(usageGuideLineUrl));
      };

      let context = assign({}, hostSettings, {
        groupId: 'abcdef-ghij-klmn-opqr',
        groupType: 'Private',
        siteClassification: '(MBI)',
        guestsEnabled: false,
        isAnonymousGuestUser: false,
        isExternalGuestUser: false,
        navigationInfo: { quickLaunch: [], topNav: [] },
        siteAbsoluteUrl: '',
        webAbsoluteUrl: ''
      });

      let params = assign({}, defaultParams, {
        hostSettings: context,
        getGroupsProvider: getGroupsProvider,
        getGroupSiteProvider: getGroupSiteProvider
      });

      component = ReactTestUtils.renderIntoDocument(<TestUtils.MockContainer params={ params } />) as TestUtils.MockContainer;
      renderedDOM = ReactDOM.findDOMNode(component as React.ReactInstance);
    });

    it('has expected group info string which has group classification as anchor element', () => {
      let props = component.stateManager.getRenderProps();
      let usageGuidelineLinkFormatString: string =
        `<a//class='ms-siteHeaderGroupInfoUsageGuidelineLink'href='{0}'target='_blank'data-logging-id='SiteHeader.GroupInfoUsageGuideline'data-automationid='siteHeaderGroupInfoUsageGuidelineLink'>{1}</a>`
      const groupType = component.props.params.hostSettings.groupType === GROUP_TYPE_PUBLIC ? TestUtils.strings.publicGroup : TestUtils.strings.privateGroup;
      const siteClassification = StringHelper.format(usageGuidelineLinkFormatString, component.state.usageGuidelineUrl, component.props.params.hostSettings.siteClassification);
      const groupInfoString = changeSpacesToNonBreakingSpace(StringHelper.format(
        TestUtils.strings.groupInfoWithClassificationFormatString,
        groupType,
        siteClassification
      ));
      expect(props.siteHeaderProps.groupInfoString).to.equals(groupInfoString);
    });


    it('should see the group classification to be usage guideline link', () => {
      const groupInfoUsageGuidelineLink: HTMLAnchorElement = renderedDOM.getElementsByClassName('ms-siteHeaderGroupInfoUsageGuidelineLink')[0] as HTMLAnchorElement;
      expect(component.state.usageGuidelineUrl).to.equal(usageGuideLineUrl, 'should see state has usageGuidelineUrl');
      expect(groupInfoUsageGuidelineLink.href).to.equal(usageGuideLineUrl, 'should see the href equal to the passed in url');
    });
  });
});

