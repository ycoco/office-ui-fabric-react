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
import { IGroupSiteProvider } from '@ms/odsp-datasources/lib/GroupSite';

const expect = chai.expect;

describe('GroupMembershipStateManager', () => {
  let pageContext: ISpPageContext;
  let defaultParams: IGroupMembershipPanelContainerStateManagerParams;
  let mockMembership: TestUtils.MockMembership;
  let mockMembershipPager: TestUtils.MockMembershipPager;
  let membershipLoad: sinon.SinonSpy;
  let membershipLoadPage: sinon.SinonSpy;
  let addUsersToGroupStub: sinon.SinonStub;
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
    addUsersToGroupStub = sinon.stub().returns(Promise.wrap(undefined));
    group = new TestUtils.MockGroup(mockMembership);
    xhr = sinon.useFakeXMLHttpRequest();
    Features.isFeatureEnabled = (_: any) => true;

    defaultParams = {
      groupMembershipPanelContainer: undefined, // mock container will define it.
      pageContext: pageContext,
      getGroupsProvider: undefined,
      getGroupSiteProvider: undefined,
      strings: TestUtils.strings
    };
  });

  describe('- GroupMembershipPanelContainer', () => {
    let component: TestUtils.MockContainer;

    before(() => {     
      let localGetGroupsProvider: () => Promise<IGroupsProvider> = () => {
        return Promise.wrap(TestUtils.createMockGroupsProvider({
          group: group,
          addUsersToGroupStub: addUsersToGroupStub,
          mockMembershipPager: mockMembershipPager
        }));
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
      const { addMembersText, doneButtonText, cancelButtonText, addMembersInstructionsText, okButtonText, confirmationText, addingGuestText } = component.stateManager.getRenderProps();
      expect(addMembersText).to.equals(TestUtils.strings.addMembersText, 'Add members button and title should use expected string');
      expect(doneButtonText).to.equals(TestUtils.strings.doneButtonText, 'Save members button should use expected string');
      expect(cancelButtonText).to.equals(TestUtils.strings.cancelButtonText, 'Cancel button should use expected string');
      expect(addMembersInstructionsText).to.equals(TestUtils.strings.addMembersInstructionsText, 'Instructions for adding members should use expected string');
      expect(okButtonText).to.equals(TestUtils.strings.okButtonText, 'OK button should use expected string');
      expect(confirmationText).to.equals(TestUtils.strings.confirmationText, 'Confirmation dialog should use expected string');
      expect(addingGuestText).to.equals(TestUtils.strings.addingGuestText, 'Message when adding a guest should use expected string');
    });

    it('has expected callbacks', () => {
      const { onSave, clearErrorMessage, onCloseConfirmationDialog } = component.stateManager.getRenderProps();
      expect(onSave).to.not.be.undefined;
      expect(clearErrorMessage).to.not.be.undefined;
      expect(onCloseConfirmationDialog).to.not.be.undefined;
    });

    it('adds member to group upon save', () => {
      const { onSave } = component.stateManager.getRenderProps();
      let newMembers = [{userId: '10', name: 'New User', email: 'newuser@microsoft.com'}];
      onSave(newMembers);
      expect(addUsersToGroupStub.calledOnce).to.equal(true, 'should see addUsersToGroup called upon save');
    });
  });

  /**
   * The following tests ensure that the add members button and member status contextual menus
   * only appear under the correct conditions.
   * The add members button should appear when either of the following is true:
   * (1) The current user is an owner, OR
   * (2) The group is public.
   * The contextual menus to remove members or promote to owner should only appear when
   * the current user is an owner.
   */
  
  describe('- Private group|Non-owner', () => {
    let component: TestUtils.MockContainer;
    let localMockMembership = new TestUtils.MockMembership(5, 2, false);
    let localMockMembershipPager = new TestUtils.MockMembershipPager(5, 2, false);
    let localGroup = new TestUtils.MockGroup(localMockMembership);

    before(() => {
      let localGetGroupsProvider: () => Promise<IGroupsProvider> = () => {
        return Promise.wrap(TestUtils.createMockGroupsProvider({
          group: localGroup,
          addUsersToGroupStub: addUsersToGroupStub,
          mockMembershipPager: localMockMembershipPager
        }));
      };
      let localPageContext = assign(new TestUtils.MockSpPageContext(), { groupType: 'Private' });
      let params = assign({}, defaultParams, { pageContext: localPageContext, getGroupsProvider: localGetGroupsProvider });

      component = ReactTestUtils.renderIntoDocument( <TestUtils.MockContainer params={ params } /> ) as TestUtils.MockContainer;
    });

    it('hides add members button for non-owners in private group', () => {
      const { canAddMembers } = component.stateManager.getRenderProps();
      expect(canAddMembers).to.be.false;
    })

    it('hides member status menus for non-owners in private group', () => {
      const { canChangeMemberStatus } = component.stateManager.getRenderProps();
      expect(canChangeMemberStatus).to.be.false;
    })
  });

  describe('- Public group|Non-owner', () => {
    let component: TestUtils.MockContainer;
    let localMockMembership = new TestUtils.MockMembership(5, 2, false);
    let localMockMembershipPager = new TestUtils.MockMembershipPager(5, 2, false);
    let localGroup = new TestUtils.MockGroup(localMockMembership);

    before(() => {
      let localGetGroupsProvider: () => Promise<IGroupsProvider> = () => {
        return Promise.wrap(TestUtils.createMockGroupsProvider({
          group: localGroup,
          addUsersToGroupStub: addUsersToGroupStub,
          mockMembershipPager: localMockMembershipPager
        }));
      };
      let localPageContext = assign(new TestUtils.MockSpPageContext(), { groupType: 'Public' });
      let params = assign({}, defaultParams, { pageContext: localPageContext, getGroupsProvider: localGetGroupsProvider });

      component = ReactTestUtils.renderIntoDocument( <TestUtils.MockContainer params={ params } /> ) as TestUtils.MockContainer;
    });

    it('shows add members button for non-owners in public group', () => {
      const { canAddMembers } = component.stateManager.getRenderProps();
      expect(canAddMembers).to.be.true;
    })

    it('hides member status menus for non-owners in public group', () => {
      const { canChangeMemberStatus } = component.stateManager.getRenderProps();
      expect(canChangeMemberStatus).to.be.false;
    })
  });

  describe('- Public group|Owner', () => {
    let component: TestUtils.MockContainer;
    let localMockMembership = new TestUtils.MockMembership(5, 2, true);
    let localMockMembershipPager = new TestUtils.MockMembershipPager(5, 2, true);
    let localGroup = new TestUtils.MockGroup(localMockMembership);

    before(() => {
      let localGetGroupsProvider: () => Promise<IGroupsProvider> = () => {
        return Promise.wrap(TestUtils.createMockGroupsProvider({
          group: localGroup,
          addUsersToGroupStub: addUsersToGroupStub,
          mockMembershipPager: localMockMembershipPager
        }));
      };
      let localPageContext = assign(new TestUtils.MockSpPageContext(), { groupType: 'Public' });
      let params = assign({}, defaultParams, { pageContext: localPageContext, getGroupsProvider: localGetGroupsProvider });

      component = ReactTestUtils.renderIntoDocument( <TestUtils.MockContainer params={ params } /> ) as TestUtils.MockContainer;
    });

    it('shows add members button for owners in public group', () => {
      const { canAddMembers } = component.stateManager.getRenderProps();
      expect(canAddMembers).to.be.true;
    })

    it('shows member status menus for owners in public group', () => {
      const { canChangeMemberStatus } = component.stateManager.getRenderProps();
      expect(canChangeMemberStatus).to.be.true;
    })
  });

  describe('- Private group|Owner', () => {
    let component: TestUtils.MockContainer;
    let localMockMembership = new TestUtils.MockMembership(5, 2, true);
    let localMockMembershipPager = new TestUtils.MockMembershipPager(5, 2, true);
    let localGroup = new TestUtils.MockGroup(localMockMembership);

    before(() => {
      let localGetGroupsProvider: () => Promise<IGroupsProvider> = () => {
        return Promise.wrap(TestUtils.createMockGroupsProvider({
          group: localGroup,
          addUsersToGroupStub: addUsersToGroupStub,
          mockMembershipPager: localMockMembershipPager
        }));
      };
      let localPageContext = assign(new TestUtils.MockSpPageContext(), { groupType: 'Private' });
      let params = assign({}, defaultParams, { pageContext: localPageContext, getGroupsProvider: localGetGroupsProvider });

      component = ReactTestUtils.renderIntoDocument( <TestUtils.MockContainer params={ params } /> ) as TestUtils.MockContainer;
    });

    it('shows add members button for owners in private group', () => {
      const { canAddMembers } = component.stateManager.getRenderProps();
      expect(canAddMembers).to.be.true;
    })

    it('shows member status menus for owners in private group', () => {
      const { canAddMembers } = component.stateManager.getRenderProps();
      expect(canAddMembers).to.be.true;
    })
  });

  /**
   * The following tests ensure that users can only add guests to a group under the correct conditions:
   * (1) Current user is an owner
   * (2) Guests allowed at group level
   * (3) Guests allowed at tenant level
   */

  describe('- Owner|Group allows guests|Tenant allows guests', () => {
    let component: TestUtils.MockContainer;
    let localMockMembership = new TestUtils.MockMembership(5, 2, true);
    let localMockMembershipPager = new TestUtils.MockMembershipPager(5, 2, true);
    let localGroup = new TestUtils.MockGroup(localMockMembership, true /*Guests allowed at group level*/);

    before(() => {
      let localGetGroupsProvider: () => Promise<IGroupsProvider> = () => {
        return Promise.wrap(TestUtils.createMockGroupsProvider({
          group: localGroup,
          addUsersToGroupStub: addUsersToGroupStub,
          mockMembershipPager: localMockMembershipPager
        }));
      };
      let localGetGroupSiteProvider: () => Promise<IGroupSiteProvider> = () => {
        return Promise.wrap(TestUtils.createMockGroupSiteProvider(true /*Guests allowed at tenant level*/));
      }
      let params = assign({}, defaultParams, { getGroupsProvider: localGetGroupsProvider, getGroupSiteProvider: localGetGroupSiteProvider });

      component = ReactTestUtils.renderIntoDocument( <TestUtils.MockContainer params={ params } /> ) as TestUtils.MockContainer;
    });

    it('allows owners to add guests when both group and tenant settings allow it', () => {
      const { canAddGuests } = component.stateManager.getRenderProps();
      expect(canAddGuests).to.be.true;
    })
  });

  describe('- Owner|Group allows guests|Tenant disallows guests', () => {
    let component: TestUtils.MockContainer;
    let localMockMembership = new TestUtils.MockMembership(5, 2, true);
    let localMockMembershipPager = new TestUtils.MockMembershipPager(5, 2, true);
    let localGroup = new TestUtils.MockGroup(localMockMembership, true /*Guests allowed at group level*/);

    before(() => {
      let localGetGroupsProvider: () => Promise<IGroupsProvider> = () => {
        return Promise.wrap(TestUtils.createMockGroupsProvider({
          group: localGroup,
          addUsersToGroupStub: addUsersToGroupStub,
          mockMembershipPager: localMockMembershipPager
        }));
      };
      let localGetGroupSiteProvider: () => Promise<IGroupSiteProvider> = () => {
        return Promise.wrap(TestUtils.createMockGroupSiteProvider(false /*Guests forbidden at tenant level*/));
      }
      let params = assign({}, defaultParams, { getGroupsProvider: localGetGroupsProvider, getGroupSiteProvider: localGetGroupSiteProvider });

      component = ReactTestUtils.renderIntoDocument( <TestUtils.MockContainer params={ params } /> ) as TestUtils.MockContainer;
    });

    it('does not let owners add guests if tenant settings forbid it', () => {
      const { canAddGuests } = component.stateManager.getRenderProps();
      expect(canAddGuests).to.be.false;
    })
  });

  describe('- Owner|Group disallows guests|Tenant allows guests', () => {
    let component: TestUtils.MockContainer;
    let localMockMembership = new TestUtils.MockMembership(5, 2, true);
    let localMockMembershipPager = new TestUtils.MockMembershipPager(5, 2, true);
    let localGroup = new TestUtils.MockGroup(localMockMembership, false /*Guests disallowed at group level*/);

    before(() => {
      let localGetGroupsProvider: () => Promise<IGroupsProvider> = () => {
        return Promise.wrap(TestUtils.createMockGroupsProvider({
          group: localGroup,
          addUsersToGroupStub: addUsersToGroupStub,
          mockMembershipPager: localMockMembershipPager
        }));
      };
      let localGetGroupSiteProvider: () => Promise<IGroupSiteProvider> = () => {
        return Promise.wrap(TestUtils.createMockGroupSiteProvider(true /*Guests allowed at tenant level*/));
      }
      let params = assign({}, defaultParams, { getGroupsProvider: localGetGroupsProvider, getGroupSiteProvider: localGetGroupSiteProvider });

      component = ReactTestUtils.renderIntoDocument( <TestUtils.MockContainer params={ params } /> ) as TestUtils.MockContainer;
    });

    it('does not let owners add guests if group settings forbid it', () => {
      const { canAddGuests } = component.stateManager.getRenderProps();
      expect(canAddGuests).to.be.false;
    })
  });

  describe('- Non-owner|Group allows guests|Tenant allows guests', () => {
    let component: TestUtils.MockContainer;
    let localMockMembership = new TestUtils.MockMembership(5, 2, false);
    let localMockMembershipPager = new TestUtils.MockMembershipPager(5, 2, false);
    let localGroup = new TestUtils.MockGroup(localMockMembership, true /*Guests allowed at group level*/);

    before(() => {
      let localGetGroupsProvider: () => Promise<IGroupsProvider> = () => {
        return Promise.wrap(TestUtils.createMockGroupsProvider({
          group: localGroup,
          addUsersToGroupStub: addUsersToGroupStub,
          mockMembershipPager: localMockMembershipPager
        }));
      };
      let localGetGroupSiteProvider: () => Promise<IGroupSiteProvider> = () => {
        return Promise.wrap(TestUtils.createMockGroupSiteProvider(true /*Guests allowed at tenant level*/));
      }
      let params = assign({}, defaultParams, { getGroupsProvider: localGetGroupsProvider, getGroupSiteProvider: localGetGroupSiteProvider });

      component = ReactTestUtils.renderIntoDocument( <TestUtils.MockContainer params={ params } /> ) as TestUtils.MockContainer;
    });

    it('does not allow non-owners to add guests', () => {
      const { canAddGuests } = component.stateManager.getRenderProps();
      expect(canAddGuests).to.be.false;
    })
  });

  /**
   * The following test ensures that groups with dynamic membership display the members as read-only,
   * even when they otherwise would be editable.
   * When a group has dynamic membership, membership is determined via a rule such as "Mary's direct reports"
   * and should not be editable from the panel.
   */

  describe('- Dynamic membership|Owner|Group allows guests|Tenant allows guests', () => {
    let component: TestUtils.MockContainer;
    let localMockMembership = new TestUtils.MockMembership(5, 2, true);
    let localMockMembershipPager = new TestUtils.MockMembershipPager(5, 2, true);
    let localGroup = new TestUtils.MockGroup(localMockMembership, true /*Guests allowed at group level*/, true/*Dynamic membership*/);

    before(() => {
      let localGetGroupsProvider: () => Promise<IGroupsProvider> = () => {
        return Promise.wrap(TestUtils.createMockGroupsProvider({
          group: localGroup,
          addUsersToGroupStub: addUsersToGroupStub,
          mockMembershipPager: localMockMembershipPager
        }));
      };
      let localGetGroupSiteProvider: () => Promise<IGroupSiteProvider> = () => {
        return Promise.wrap(TestUtils.createMockGroupSiteProvider(true /*Guests allowed at tenant level*/));
      }
      let params = assign({}, defaultParams, { getGroupsProvider: localGetGroupsProvider, getGroupSiteProvider: localGetGroupSiteProvider });

      component = ReactTestUtils.renderIntoDocument( <TestUtils.MockContainer params={ params } /> ) as TestUtils.MockContainer;
    });

    it('displays read-only panel when membership is dynamic', () => {
      const { canAddMembers, canAddGuests, canChangeMemberStatus } = component.stateManager.getRenderProps();
      expect(canAddMembers).to.be.false;
      expect(canAddGuests).to.be.false;
      expect(canChangeMemberStatus).to.be.false;
    })
  });

});
