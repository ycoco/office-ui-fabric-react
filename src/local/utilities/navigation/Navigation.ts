// OneDrive:IgnoreCodeCoverage

import ko = require('knockout');
import BaseModel = require('../../base/BaseModel');
import BeforeUnload from 'odsp-utilities/beforeUnload/BeforeUnload';
import INavigation = require('./INavigation');
import INavigationParams = require('./INavigationParams');
import INavigateToOptions = require('./INavigateToOptions');
import IUpdateViewParamsOptions = require('./IUpdateViewParamsOptions');
import { Nav as NavEvent } from 'odsp-utilities/logging/events/Nav.event';
import NavigationHelper = require('./NavigationHelper');
import ObjectUtil from 'odsp-utilities/object/ObjectUtil';
import IViewParams from 'odsp-utilities/navigation/IViewParams';
import IQueryParams from './IQueryParams';

const _history = window["history"];
const _appCache = window.applicationCache;
const _supportsHistoryApi = _history && !!_history.pushState && (!_appCache || _appCache.status === _appCache.UNCACHED);

class Navigation extends BaseModel implements INavigation {
    /**
     * @inheritdoc
     */
    public viewParams: IViewParams;

    /**
     * Functionality extender that allows users to customize beforeUnload behaviors
     */
    public beforeUnload: BeforeUnload;

    /** @inheritdoc */
    private _viewParamsString: string;
    private _dontBlockNextNav: boolean;
    private _prevHash: string;

    /**
     * Whether or not to convert hash (#) params to query (?) params automatically.
     */
    private _performHashConversion: boolean;

    constructor(params: INavigationParams = {}) {
        super(params);

        this._viewParamsString = '';
        this._dontBlockNextNav = false;

        let {
            disableHashConversion = false
        } = params;

        this._performHashConversion = !disableHashConversion;

        this.viewParams = {};

        this.beforeUnload = new BeforeUnload();
        this.addDisposable(this.beforeUnload);

        this.events.declare('change');

        this.events.on(window, 'hashchange', this._updateUrlState);
        this.events.on(window, 'popstate', this._updateUrlState);

        this._updateUrlState(null);
    }

    /**
     * @inheritdoc
     */
    public navigateTo(options: INavigateToOptions | string): void {
        if (this.beforeUnload.allowHashNav(() => this.navigateTo(options), null)) {
            var navigationOptions: INavigateToOptions = (typeof options === 'string') ? { url: <string>options } : options;
            var url = navigationOptions.url;

            if (url[0] === '#') {
                var hash = url.substr(1);

                if (navigationOptions.ignoreHistory) {
                    this._replaceState(hash);
                } else {
                    this._pushState(hash);
                }
            } else {
                let targetWindow;
                let hasNavigated = false;

                // IE throws an 'Unspecified Error' on window.open or setting window.location.href if the page has an
                // onbeforeunload handler and the user cancels the navigation when prompted.
                // IE Mobile may also fail on window.open and if it does, we'll use window.location.href and navigate
                // the current window instead.
                // Don't use window.open(...) if the target is _self or empty because it resets window.opener to window affecting
                // scenarios that rely on an accurate window.opener
                if (navigationOptions && navigationOptions.frameId && navigationOptions.frameId !== '_self') {
                    try {
                        targetWindow = window.open(url, navigationOptions.frameId);
                        hasNavigated = true;
                    } catch (e) {
                        // Ignore, see above comments.
                    }
                }

                // We need hasNavigated check as well because in IE (and also Edge at the time of writing), navigating
                // across zones from a Trusted/Intranet zone to Internet Zone results in targetWindow being null, even when
                // window.open succeeds. Without this flag, a window will open and inline navigation will also occur.
                // The side impact of this change is that in cases where popup blocker is hit, we no longer automatically
                // navigate inline, but this is probably a more desirable behavior as this is the behavior expected by programmers
                // passing in target="_blank" (for navigation to NOT happen inline).

                if (!targetWindow && !hasNavigated) {
                    try {
                        window.location.href = url;
                    } catch (e) {
                        // Ignore, see above comments.
                    }
                }
            }
        }
    }

    /**
     * @inheritdoc
     */
    public updateViewParams(newParams: IQueryParams | string, options: IUpdateViewParamsOptions = {}): void {
        // Change newParams into a Dicionary<string, string> if it came in as a string
        let newParamsObject = (typeof newParams === 'string') ? NavigationHelper.deserializeQuery(newParams) : newParams;

        let viewParams: { [param: string]: string; };

        // Update with the new parameters
        viewParams = options.clearOtherParams ? {} : ObjectUtil.deepCopy(this.viewParams);
        ko.utils.extend(viewParams, newParamsObject);

        if (options.ignoreHistory) {
            this._replaceState(viewParams, options.clearPath);
        } else {
            this._pushState(viewParams);
        }
    }

    /**
     * @inheritdoc
     */
    public reload(): void {
        window.location.reload();
    }

    /**
     * Updates the view params to reflect the current URL.
     */
    private _updateUrlState(ev: NavigationEvent) {
        var paramsString = '';
        var hasChanged = false;
        var location = window.document.location;
        var usingHashParams: boolean = false;

        if (this._dontBlockNextNav || this.beforeUnload.allowHashNav(() => this._updateUrlState(ev), () => this._resetBeforeNavBlock())) {
            this._dontBlockNextNav = false;

            if (location.href.indexOf('#') > -1) {
                paramsString = location.hash.substr(1);
                usingHashParams = true;
            } else if (location.search.length) {
                paramsString = location.search.substr(1);
            }

            if (paramsString !== this._viewParamsString) {
                this._viewParamsString = paramsString || "";
                this.viewParams = NavigationHelper.deserializeQuery(this._viewParamsString);

                hasChanged = true;
            }

            // Convert hash params to query params if able
            if (usingHashParams && this._performHashConversion && _supportsHistoryApi) {
                this._replaceState(paramsString);
            }

            if (hasChanged) {
                NavEvent.logData({
                    url: location.href,
                    viewParams: this.viewParams
                });

                this.events.raise('change');
            }

            this._prevHash = location.hash;
        } else {
            hasChanged = false;

            // Stop hash change
            if (ev) {
                ev.preventDefault();
            }
        }

        return hasChanged;
    }

    /** This will reset the url to before the nav block */
    private _resetBeforeNavBlock() {
        this._dontBlockNextNav = true;

        if (_supportsHistoryApi) {
            try {
                history.forward(1);
            } catch (error) {
                this._hashNav(this._prevHash);
            }
        } else {
            this._hashNav(this._prevHash);
        }
    }

    /**
     * Adds an entry to the navigation stack.
     * @param viewParams {any} - An object containing the params to use, or a string to parse query params from.
     */
    private _pushState(viewParams: IQueryParams | string) {
        let viewParamsString = this._getViewParamsString(viewParams);

        if (_supportsHistoryApi) {
            try {
                history.pushState({}, null, this._getStateUrl(viewParamsString));
            } catch (error) {
                this._hashNav(viewParamsString);
            }
        } else {
            this._hashNav(viewParamsString);
        }

        this._updateUrlState(null);
    }

    /**
     * Replaces the current set of view params without adding to the nav stack.
     * @param viewParams {any} - An object containing the params to use, or a string to parse query params from.
     * @param clearPath {boolean} - Whether or not to clear the path of the current url. Defaults to leaving it as-is.
     */
    private _replaceState(viewParams: IQueryParams | string, clearPath?: boolean) {
        let viewParamsString = this._getViewParamsString(viewParams);

        if (_supportsHistoryApi) {
            try {
                history.replaceState({}, null, this._getStateUrl(viewParamsString, clearPath));
            } catch (error) {
                this._hashNav(viewParamsString);
            }
        } else {
            this._hashNav(viewParamsString);
        }

        this._updateUrlState(null);
    }

    private _getViewParamsString(viewParams: IQueryParams | string) {
        return (typeof viewParams === 'string') ? viewParams : NavigationHelper.serializeQuery(viewParams);
    }

    private _getStateUrl(viewParamsString: string, clearPath?: boolean) {
        let path = clearPath ? '/' : document.location.pathname;
        return `${path}${viewParamsString.length > 0 ? '?' : ''}${viewParamsString}`;
    }

    private _hashNav(viewParamsString: string) {
        document.location.hash = viewParamsString;
    }
}

export = Navigation;
