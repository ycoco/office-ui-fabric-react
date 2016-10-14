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
  let membershipLoad: Sinon.SinonSpy;
  let group: TestUtils.MockGroup;
  let getGroupsProvider: () => Promise<IGroupsProvider> = () => {
    return Promise.wrap(TestUtils.createMockGroupsProvider(group));
  };
  let xhr: Sinon.SinonFakeXMLHttpRequest;

  before(() => {
    /* tslint:disable */
    // emulate sharepoint environment
    window['_spPageContextInfo'] = pageContext;
    /* tslint:enable */

    pageContext = assign(new TestUtils.MockSpPageContext());

    mockMembership = new TestUtils.MockMembership();
    membershipLoad = sinon.spy(mockMembership, 'load');
    group = new TestUtils.MockGroup(mockMembership);
    xhr = sinon.useFakeXMLHttpRequest();
    Features.isFeatureEnabled = (_: any) => true;

    defaultParams = {
      groupMembershipPanel: undefined, // mock container will define it.
      pageContext: pageContext,
      title: 'Group membership',
      getGroupsProvider: getGroupsProvider
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
      expect(title).to.equals('Group membership', 'Panel title should use passed in string');
    });

    it('uses the GroupsProvider object passed in and loads membership', () => {
      expect(membershipLoad.called).to.be.true;
    });

    // TODO: add more tests as you continue iterating on the group membership panel.
  });
});
