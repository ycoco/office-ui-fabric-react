import * as React from 'react';

import chai = require('chai');
import * as sinon from 'sinon';
import * as TestUtils from './test/index';
import * as ReactTestUtils from 'react-addons-test-utils';

import Features from '@ms/odsp-utilities/lib/features/Features';
import { assign } from 'office-ui-fabric-react/lib/Utilities';
import { PanelType } from 'office-ui-fabric-react/lib/Panel';
import ListTemplateType from '@ms/odsp-datasources/lib/dataSources/listCollection/ListTemplateType';

import { IListCreationPanelContainerStateManagerParams } from './index';
import { ISpPageContext } from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';

const expect = chai.expect;

describe('ListCreationPanelContainerStateManager', () => {
  let panelType = PanelType.smallFixedFar;
  let listTemplateType = ListTemplateType.genericList;
  let onCancelClick = sinon.spy();
  let onSuccess = sinon.spy();
  let showInQuickLaunchDefault = true;
  let pageContext: ISpPageContext;
  let defaultParams: IListCreationPanelContainerStateManagerParams;
  let xhr: sinon.SinonFakeXMLHttpRequest;

  before(() => {
    /* tslint:disable */
    // emulate sharepoint environment
    window['_spPageContextInfo'] = pageContext;
    /* tslint:enable */

    pageContext = assign(new TestUtils.MockSpPageContext());

    xhr = sinon.useFakeXMLHttpRequest();
    Features.isFeatureEnabled = (_: any) => true;

    defaultParams = {
      listCreationPanelContainer: undefined, // mock container will define it.
      pageContext: pageContext,
      panelType: panelType,
      listTemplateType: listTemplateType,
      onCancelClick: onCancelClick,
      onSuccess: onSuccess,
      showInQuickLaunchDefault: showInQuickLaunchDefault,
      strings: TestUtils.strings
    };
  });

  describe('ListCreationPanelContainer', () => {
    let component: TestUtils.MockContainer;

    before(() => {
      let params = assign({}, defaultParams);

      component = ReactTestUtils.renderIntoDocument( <TestUtils.MockContainer params={ params } /> ) as TestUtils.MockContainer;
    });

    it('has expected strings', () => {
      const { panelProps, listCreationPanelContentProps} = component.stateManager.getRenderProps();
      expect(panelProps.headerText).to.equals(TestUtils.strings.panelHeaderText, 'Panel header text should use passed in string');
      expect(listCreationPanelContentProps.nameFieldLabel).to.equals(TestUtils.strings.nameFieldLabel, 'Name field label should use passed in string');
      expect(listCreationPanelContentProps.descriptionFieldLabel).to.equals(TestUtils.strings.descriptionFieldLabel, 'Description field label should use passed in string');
      expect(listCreationPanelContentProps.spinnerString).to.equals(TestUtils.strings.spinnerString, 'Spinner string should use passed in string');
      expect(listCreationPanelContentProps.showInQuickLaunchString).to.equals(TestUtils.strings.showInQuickLaunchString, 'Quick launch checkbox string should use passed in string');
    });

    it('has no error message', () => {
      const { listCreationPanelContentProps } = component.stateManager.getRenderProps();
      // to.not.exist asserts that the target is null or undefined.
      expect(listCreationPanelContentProps.errorMessage).to.not.exist;
    });

    it('should use passed in strings and callbacks', () => {
      const { listCreationPanelContentProps } = component.stateManager.getRenderProps();
      expect(listCreationPanelContentProps.onCreate.onCreateString).to.equals(TestUtils.strings.onCreateString, 'Create button should use passed in string');
      expect(listCreationPanelContentProps.onCreate.onCreateAction).to.not.be.undefined;
      expect(listCreationPanelContentProps.onCancel.onCancelString).to.equals(TestUtils.strings.onCancelString, 'Cancel button should use passed in string');
      expect(listCreationPanelContentProps.onCancel.onCancelAction).to.not.be.undefined;
    });
  });
});
