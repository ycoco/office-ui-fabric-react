import * as React from 'react';

import chai = require('chai');
import * as sinon from 'sinon';
import * as TestUtils from './test/index';
import * as ReactTestUtils from 'react-addons-test-utils';

import Promise from '@ms/odsp-utilities/lib/async/Promise';
import Features from '@ms/odsp-utilities/lib/features/Features';
import { assign } from 'office-ui-fabric-react/lib/Utilities';

import { IGroupMembershipPanelContainerStateManagerParams } from './index';
import { ISpPageContext } from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';
import { IGroupsProvider } from '@ms/odsp-datasources/lib/Groups';

const expect = chai.expect;

describe('GroupMembershipStateManager', () => {
  let pageContext: ISpPageContext;
  let defaultParams: IGroupMembershipPanelContainerStateManagerParams;
  let mockMembership: TestUtils.MockMembership;
  let mockMembershipPager: TestUtils.MockMembershipPager;
  let membershipLoad: sinon.SinonSpy;
  let membershipLoadPage: sinon.SinonSpy;
  let group: TestUtils.MockGroup;
  let xhr: sinon.SinonFakeXMLHttpRequest;

  before(() => {
    /* tslint:disable */
    // emulate sharepoint environment
    window['_spPageContextInfo'] = pageContext;
    /* tslint:enable */

    pageContext = assign(new TestUtils.MockSpPageContext());

    mockMembership = new TestUtils.MockMembership(); // Use default MockMembership
    mockMembershipPager = new TestUtils.MockMembershipPager(); // Use default MembershipPager
    membershipLoad = sinon.stub(mockMembership, 'load');
    membershipLoadPage = sinon.stub(mockMembershipPager, 'loadPage');
    group = new TestUtils.MockGroup(mockMembership);
    xhr = sinon.useFakeXMLHttpRequest();
    Features.isFeatureEnabled = (_: any) => true;

    defaultParams = {
      groupMembershipPanelContainer: undefined, // mock container will define it.
      pageContext: pageContext,
      getGroupsProvider: undefined,
      strings: TestUtils.strings
    };
  });

  describe('- GroupMembershipPanelContainer', () => {
    let component: TestUtils.MockContainer;

    before(() => {     
      let localGetGroupsProvider: () => Promise<IGroupsProvider> = () => {
        return Promise.wrap(TestUtils.createMockGroupsProvider(group, mockMembershipPager));
      };
      let params = assign({}, defaultParams, { getGroupsProvider: localGetGroupsProvider });

      component = ReactTestUtils.renderIntoDocument( <TestUtils.MockContainer params={ params } /> ) as TestUtils.MockContainer;
    });

    it('has expected title', () => {
      const { title } = component.stateManager.getRenderProps();
      expect(title).to.equals(TestUtils.strings.title, 'Panel title should use passed in string');
    });

    it('uses the GroupsProvider object passed in and loads membership', () => {
      expect(membershipLoad.called || membershipLoadPage.called).to.be.true;
    });

    it('has no error message', () => {
      const { errorMessageText } = component.stateManager.getRenderProps();
      // to.not.exist asserts that the target is null or undefined.
      expect(errorMessageText).to.not.exist;
    });

    it('has expected strings for add/remove members', () => {
      const { addMembersText, doneButtonText, cancelButtonText, addMembersInstructionsText, okButtonText, confirmationText } = component.stateManager.getRenderProps();
      expect(addMembersText).to.equals(TestUtils.strings.addMembersText, 'Add members button and title should use expected string');
      expect(doneButtonText).to.equals(TestUtils.strings.doneButtonText, 'Save members button should use expected string');
      expect(cancelButtonText).to.equals(TestUtils.strings.cancelButtonText, 'Cancel button should use expected string');
      expect(addMembersInstructionsText).to.equals(TestUtils.strings.addMembersInstructionsText, 'Instructions for adding members should use expected string');
      expect(okButtonText).to.equals(TestUtils.strings.okButtonText, 'OK button should use expected string');
      expect(confirmationText).to.equals(TestUtils.strings.confirmationText, 'Confirmation dialog should use expected string');
    });

    it('has expected callbacks', () => {
      const { onSave, clearErrorMessage, onCloseConfirmationDialog } = component.stateManager.getRenderProps();
      expect(onSave).to.not.be.undefined;
      expect(clearErrorMessage).to.not.be.undefined;
      expect(onCloseConfirmationDialog).to.not.be.undefined;
    });
  });
  
  describe('- Private group|Non-owner', () => {
    let component: TestUtils.MockContainer;
    let localMockMembership = new TestUtils.MockMembership(5, 2, false);
    let localMockMembershipPager = new TestUtils.MockMembershipPager(5, 2, false);
    let localGroup = new TestUtils.MockGroup(localMockMembership);

    before(() => {
      let localGetGroupsProvider: () => Promise<IGroupsProvider> = () => {
        return Promise.wrap(TestUtils.createMockGroupsProvider(localGroup, localMockMembershipPager));
      };
      let localPageContext = assign(new TestUtils.MockSpPageContext(), { groupType: 'Private' });
      let params = assign({}, defaultParams, { pageContext: localPageContext, getGroupsProvider: localGetGroupsProvider });

      component = ReactTestUtils.renderIntoDocument( <TestUtils.MockContainer params={ params } /> ) as TestUtils.MockContainer;
    });

    it('hides add members button for non-owners in private group', () => {
      const { canAddMembers } = component.stateManager.getRenderProps();
      expect(canAddMembers).to.be.false;
    })
  });

  describe('- Public group|Non-owner', () => {
    let component: TestUtils.MockContainer;
    let localMockMembership = new TestUtils.MockMembership(5, 2, false);
    let localMockMembershipPager = new TestUtils.MockMembershipPager(5, 2, false);
    let localGroup = new TestUtils.MockGroup(localMockMembership);

    before(() => {
      let localGetGroupsProvider: () => Promise<IGroupsProvider> = () => {
        return Promise.wrap(TestUtils.createMockGroupsProvider(localGroup, localMockMembershipPager));
      };
      let localPageContext = assign(new TestUtils.MockSpPageContext(), { groupType: 'Public' });
      let params = assign({}, defaultParams, { pageContext: localPageContext, getGroupsProvider: localGetGroupsProvider });

      component = ReactTestUtils.renderIntoDocument( <TestUtils.MockContainer params={ params } /> ) as TestUtils.MockContainer;
    });

    it('shows add members button for non-owners in public group', () => {
      const { canAddMembers } = component.stateManager.getRenderProps();
      expect(canAddMembers).to.be.true;
    })
  });

  describe('- Public group|Owner', () => {
    let component: TestUtils.MockContainer;
    let localMockMembership = new TestUtils.MockMembership(5, 2, true);
    let localMockMembershipPager = new TestUtils.MockMembershipPager(5, 2, true);
    let localGroup = new TestUtils.MockGroup(localMockMembership);

    before(() => {
      let localGetGroupsProvider: () => Promise<IGroupsProvider> = () => {
        return Promise.wrap(TestUtils.createMockGroupsProvider(localGroup, localMockMembershipPager));
      };
      let localPageContext = assign(new TestUtils.MockSpPageContext(), { groupType: 'Public' });
      let params = assign({}, defaultParams, { pageContext: localPageContext, getGroupsProvider: localGetGroupsProvider });

      component = ReactTestUtils.renderIntoDocument( <TestUtils.MockContainer params={ params } /> ) as TestUtils.MockContainer;
    });

    it('shows add members button for owners in public group', () => {
      const { canAddMembers } = component.stateManager.getRenderProps();
      expect(canAddMembers).to.be.true;
    })
  });

  describe('- Private group|Owner', () => {
    let component: TestUtils.MockContainer;
    let localMockMembership = new TestUtils.MockMembership(5, 2, true);
    let localMockMembershipPager = new TestUtils.MockMembershipPager(5, 2, true);
    let localGroup = new TestUtils.MockGroup(localMockMembership);

    before(() => {
      let localGetGroupsProvider: () => Promise<IGroupsProvider> = () => {
        return Promise.wrap(TestUtils.createMockGroupsProvider(localGroup, localMockMembershipPager));
      };
      let localPageContext = assign(new TestUtils.MockSpPageContext(), { groupType: 'Private' });
      let params = assign({}, defaultParams, { pageContext: localPageContext, getGroupsProvider: localGetGroupsProvider });

      component = ReactTestUtils.renderIntoDocument( <TestUtils.MockContainer params={ params } /> ) as TestUtils.MockContainer;
    });

    it('shows add members button for owners in private group', () => {
      const { canAddMembers } = component.stateManager.getRenderProps();
      expect(canAddMembers).to.be.true;
    })
  });

  // TODO: add more tests as you continue iterating on the group membership panel.
});
