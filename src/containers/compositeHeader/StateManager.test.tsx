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

import {
  GROUP_TYPE_PUBLIC,
  ISiteHeaderContainerStateManagerParams
} from './index';
import { ISpPageContext } from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';
import { IGroupsProvider } from '@ms/odsp-datasources/lib/Groups';

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
  let getGroupsProvider: () => Promise<IGroupsProvider> = () => {
    return Promise.wrap(TestUtils.createMockGroupsProvider(group));
  };
  let xhr: Sinon.SinonFakeXMLHttpRequest;

  before(() => {
    mockMembership = new TestUtils.MockMembership();
    membershipLoad = sinon.spy(mockMembership, 'load');
    group = new TestUtils.MockGroup(mockMembership);
    xhr = sinon.useFakeXMLHttpRequest();
    Features.isFeatureEnabled = (_: any) => true;
    hostSettings = new TestUtils.MockSpPageContext();
    defaultParams = {
      hostSettings: hostSettings,
      siteHeader: undefined, // mock container will define it.
      logoOnClick: logoOnClick,
      goToOutlookOnClick: goToOutlookOnClick,
      goToMembersOnClick: goToMembersOnClick,
      topNavNodeOnClick: topNavNodeOnClick,
      openPersonaCard: openPersonaCard,
      getGroupsProvider: getGroupsProvider,
      strings: TestUtils.strings
    };
  });

  describe('- teamsite|with guests|MBI|following|hasTopNav', () => {
    let component: TestUtils.MockContainer;

    before(() => {
      let context = assign({}, hostSettings, {
        groupId: undefined,
        siteClassification: '(MBI)',
        guestsEnabled: true
      });

      let params = assign({}, defaultParams, {
        hostSettings: context
      });

      component = ReactTestUtils.renderIntoDocument(
        <TestUtils.MockContainer params={ params } />
      ) as TestUtils.MockContainer;
    });

    it('has expected group info string', () => {
      let props = component.stateManager.getRenderProps();
      expect(props.siteHeaderProps.groupInfoString).to.equals('Sharing with guests permitted  |  (MBI)');
    });
  });

  describe('- public group|without guests|not following', () => {
    let component: TestUtils.MockContainer;

    before(() => {
      let context = assign({}, hostSettings, {
        groupId: 'abcdef-ghij-klmn-opqr',
        siteClassification: '(MBI)',
        groupType: GROUP_TYPE_PUBLIC,
        guestsEnabled: false
      });

      let params = assign({}, defaultParams, {
        hostSettings: context
      });

      component = ReactTestUtils.renderIntoDocument(<TestUtils.MockContainer params={ params } />) as TestUtils.MockContainer;
    });

    it('uses the GroupsProvider object passed in and loads membership', () => {
      expect(membershipLoad.called).to.be.true;
    });

    it('has expected group info string', () => {
      let props = component.stateManager.getRenderProps();
      expect(props.siteHeaderProps.groupInfoString).to.equals('Public group');
    });
  });
});
