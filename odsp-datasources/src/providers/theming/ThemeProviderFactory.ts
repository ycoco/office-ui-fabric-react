// OneDrive:IgnoreCodeCoverage
"use strict";

import ISpPageContext from '../../interfaces/ISpPageContext';
import { WebThemeProvider } from './WebThemeProvider';
import { IThemeProvider } from './IThemeProvider';

let _themeProvider: IThemeProvider;

/**
 * Uses context information to choose the appropriate theme provider, if any.
 * May return an undefined value if not theme provider is deemed appropriate.
 */
export function getThemeProvider(spPageContext?: ISpPageContext): IThemeProvider {
    "use strict";
    if (!_themeProvider) {
        _themeProvider = _instantiateThemeProvider(spPageContext);
    }

    return _themeProvider;
}

/**
 * Uses context information to choose the appropriate theme provider, if any.
 * May return an undefined value if not theme provider is deemed appropriate.
 */
function _instantiateThemeProvider(spPageContext?: ISpPageContext): IThemeProvider {
    "use strict";
    // Only load the theme on a SharePoint page which declares a theme.
    // This logic should be updated as more apps are able to provide a theme.
    let themeProvider: IThemeProvider;
    // Use window to get the pageContext since it might not be declared (e.g. ODC).
    let pageContext: ISpPageContext = spPageContext ? spPageContext : window['_spPageContextInfo'];
    if (pageContext && (pageContext.themedCssFolderUrl || pageContext.groupColor)) {
        themeProvider = new WebThemeProvider({ pageContext });
    }

    return themeProvider;
}
