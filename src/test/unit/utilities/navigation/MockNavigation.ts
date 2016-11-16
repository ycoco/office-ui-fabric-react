// OneDrive:IgnoreCodeCoverage

import INavigation = require('../../../../odsp-shared/utilities/navigation/INavigation');
import sinon = require('sinon');

export function getMockNavigation(): INavigation {
    "use strict";

    return {
        navigateTo: sinon.stub(),
        updateViewParams: sinon.stub(),
        reload: sinon.stub(),
        beforeUnload: undefined,
        viewParams: {}
    };
}
