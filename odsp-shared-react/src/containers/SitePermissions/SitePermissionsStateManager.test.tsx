import * as React from 'react';

import chai = require('chai');
import * as TestUtils from './test/index';
import * as ReactTestUtils from 'react-addons-test-utils';
import Features from '@ms/odsp-utilities/lib/features/Features';
import { assign } from 'office-ui-fabric-react/lib/Utilities';
import { ISitePermissionsPanelContainerStateManagerParams } from './index';
import { ISpPageContext } from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';
import { SitePermissionsMockStrings } from './test/index';

const expect = chai.expect;

describe('SitePermissionsStateManager', () => {
  let pageContext: ISpPageContext;
  let defaultParams: ISitePermissionsPanelContainerStateManagerParams;
  // let mockMembership: TestUtils.MockMembership;
  let group: TestUtils.MockGroup;
  let strings = SitePermissionsMockStrings;

  before(() => {
    /* tslint:disable */
    // emulate sharepoint environment
    window['_spPageContextInfo'] = pageContext;
    /* tslint:enable */

    pageContext = assign(new TestUtils.MockSpPageContext());

    group = new TestUtils.MockGroup();
    Features.isFeatureEnabled = (_: any) => true;

    defaultParams = {
      sitePermissionsPanelContainer: undefined, // mock container will define it.
      pageContext: pageContext,
      title: "Site Permissions"
    };
  });

  describe('- SitePermissionsPanelContainer', () => {
    let component: TestUtils.MockContainer;

    before(() => {
      let params = assign({}, defaultParams, { groupsProvider: TestUtils.createMockGroupsProvider(group) });
      component = ReactTestUtils.renderIntoDocument(<TestUtils.MockContainer params={ params } />) as TestUtils.MockContainer;
    });

    it('has expected title', () => {
      const { title } = component.stateManager.getRenderProps();
      expect(title).to.equals(strings.title, 'Panel title should use passed in string');
    });

    it('has expected strings for panel title, panel description, Site Members/Visitors/Owners group title', () => {
      const { title, panelDescription, sitePermissions} = component.stateManager.getRenderProps();
      expect(title).to.equals(strings.title, 'Pane title should use expected string');
      expect(panelDescription).to.equals(strings.panelDescription, 'Panel description');
      expect(sitePermissions[0].title).to.equals(strings.fullControl, 'Site Owners group title');
      expect(sitePermissions[1].title).to.equals(strings.edit, 'Site Members group title');
      expect(sitePermissions[2].title).to.equals(strings.read, 'Site Members group title');
    });

    it('has expected callbacks', () => {
      const { onSave, onCancel } = component.stateManager.getRenderProps();
      expect(onSave).to.not.be.undefined;
      expect(onCancel).to.not.be.undefined;
    });
  });
});
