// OneDrive:IgnoreCodeCoverage

import BaseModel = require('../../base/BaseModel');
import IBaseModelParams = require('../../base/IBaseModelParams');
import INavigation = require('./INavigation');
import INavigateToOptions = require('./INavigateToOptions');
import IUpdateViewParamsOptions = require('./IUpdateViewParamsOptions');
import IViewParams from '@ms/odsp-utilities/lib/navigation/IViewParams';
import IQueryParams from './IQueryParams';
import NavigationHelper = require('./NavigationHelper');
import BeforeUnload from '@ms/odsp-utilities/lib/beforeUnload/BeforeUnload';
import ObjectUtil from '@ms/odsp-utilities/lib/object/ObjectUtil';
import ko = require('knockout');

/**
 * Navigation implementation which is not bound to the browser URL.
 * Inject an instance of this class into a resource scope to control
 * the navigation flow and view params for downstream components.
 * @example
 *  let navigation = new (this.managed(InPlaceNavigation))();
 *  this.resources.expose(UtilityResourceKeys.navigation, navigation);
 *  this.resources.expose(ControlResourceKeys.viewParams, navigation.viewParamsObservable);
 */
export default class InPlaceNavigation extends BaseModel implements INavigation {
    /**
     * The view params last set by a call to navigateTo.
     */
    public viewParams: IViewParams;

    public beforeUnload: BeforeUnload;

    /**
     * An observable for the current view params as managed by navigation.
     */
    public viewParamsObservable: KnockoutObservable<IViewParams>;

    constructor(params: IBaseModelParams = {}) {
        super(params);

        this.beforeUnload = undefined;

        this.viewParamsObservable = ko.observable<IViewParams>({});
        this.viewParamsObservable.equalityComparer = ObjectUtil.deepCompare;

        this.events.declare('change');

        this.subscribe(this.viewParamsObservable, this._onViewParamsChanged);
    }

    /**
     * @inheritdoc
     */
    public navigateTo(options: INavigateToOptions | string): void {
        let navigateToOptions: INavigateToOptions;

        if (typeof options === 'string') {
            navigateToOptions = {
                url: options
            };
        } else {
            navigateToOptions = options;
        }

        let {
            url
        } = navigateToOptions;

        if (url.indexOf('#') === 0) {
            let viewParams = NavigationHelper.deserializeQuery(url.substring(1));

            this.viewParamsObservable(viewParams);
        }
    }

    /**
     * @inheritdoc
     */
    public updateViewParams(newParams: IQueryParams | string, options: IUpdateViewParamsOptions = {}): void {
        if (typeof newParams === 'string') {
            newParams = NavigationHelper.deserializeQuery(<string>newParams);
        }

        let {
            clearOtherParams = false
        } = options;

        let queryParams: IQueryParams = {};

        if (!clearOtherParams) {
            ko.utils.extend(queryParams, this.viewParams);
        }

        ko.utils.extend(queryParams, <IQueryParams>newParams);

        this.viewParamsObservable(NavigationHelper.deserializeQuery(NavigationHelper.serializeQuery(queryParams)));
    }

    public reload(): void {
        // Do nothing.
    }

    public pushStateOrNavigateTo(url: string): void {
        // Do nothing.
    }

    private _onViewParamsChanged(viewParams: IViewParams) {
        this.viewParams = viewParams;

        this.events.raise('change', viewParams);
    }
}
