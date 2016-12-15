/* tslint:disable:no-unused-variable */
import * as React from 'react';
/* tslint:enable:no-unused-variable */

import chai = require('chai');
import * as sinon from 'sinon';
import * as TestUtils from './test/index';
import * as ReactTestUtils from 'react-addons-test-utils';

import Promise from '@ms/odsp-utilities/lib/async/Promise';
import Features from '@ms/odsp-utilities/lib/features/Features';
import { assign } from 'office-ui-fabric-react/lib/utilities/object';

import { IGroupMembershipPanelContainerStateManagerParams } from './index';
import { ISpPageContext } from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';
import { IGroupsProvider } from '@ms/odsp-datasources/lib/Groups';

const expect = chai.expect;

describe('GroupMembershipStateManager', () => {
  let pageContext: ISpPageContext;
  let defaultParams: IGroupMembershipPanelContainerStateManagerParams;
  let mockMembership: TestUtils.MockMembership;
  let membershipLoad: sinon.SinonSpy;
  let group: TestUtils.MockGroup;
  let getGroupsProvider: () => Promise<IGroupsProvider> = () => {
    return Promise.wrap(TestUtils.createMockGroupsProvider(group));
  };
  let xhr: sinon.SinonFakeXMLHttpRequest;

  before(() => {
    /* tslint:disable */
    // emulate sharepoint environment
    window['_spPageContextInfo'] = pageContext;
    /* tslint:enable */

    pageContext = assign(new TestUtils.MockSpPageContext());

    mockMembership = new TestUtils.MockMembership(); // Use default MockMembership
    membershipLoad = sinon.stub(mockMembership, 'load');
    group = new TestUtils.MockGroup(mockMembership);
    xhr = sinon.useFakeXMLHttpRequest();
    Features.isFeatureEnabled = (_: any) => true;

    defaultParams = {
      groupMembershipPanelContainer: undefined, // mock container will define it.
      pageContext: pageContext,
      getGroupsProvider: getGroupsProvider,
      strings: TestUtils.strings
    };
  });

  describe('GroupMembershipPanelContainer', () => {
    let component: TestUtils.MockContainer;

    before(() => {
      let params = assign({}, defaultParams);

      component = ReactTestUtils.renderIntoDocument( <TestUtils.MockContainer params={ params } /> ) as TestUtils.MockContainer;
    });

    it('has expected title', () => {
      const { title } = component.stateManager.getRenderProps();
      expect(title).to.equals(TestUtils.strings.title, 'Panel title should use passed in string');
    });

    it('uses the GroupsProvider object passed in and loads membership', () => {
      expect(membershipLoad.called).to.be.true;
    });

    it('has no error message', () => {
      const { errorMessageText } = component.stateManager.getRenderProps();
      // to.not.exist asserts that the target is null or undefined.
      expect(errorMessageText).to.not.exist;
    });

    it('has expected strings for adding members', () => {
      const { addMembersText, doneButtonText, cancelButtonText, addMembersInstructionsText } = component.stateManager.getRenderProps();
      expect(addMembersText).to.equals(TestUtils.strings.addMembersText, 'Add members button and title should use expected string');
      expect(doneButtonText).to.equals(TestUtils.strings.doneButtonText, 'Save members button should use expected string');
      expect(cancelButtonText).to.equals(TestUtils.strings.cancelButtonText, 'Cancel button should use expected string');
      expect(addMembersInstructionsText).to.equals(TestUtils.strings.addMembersInstructionsText, 'Instructions for adding members should use expected string');
    });

    it('has expected callbacks', () => {
      const { onSave, clearErrorMessage } = component.stateManager.getRenderProps();
      expect(onSave).to.not.be.undefined;
      expect(clearErrorMessage).to.not.be.undefined;
    });

    // TODO: add more tests as you continue iterating on the group membership panel.
  });
});
