// OneDrive:IgnoreCodeCoverage

import BaseModel, { IBaseModelParams } from '../../base/BaseModel';
import INavigation, { INavigateToOptions, IUpdateViewParamsOptions } from './INavigation';
import IViewParams from '@ms/odsp-utilities/lib/navigation/IViewParams';
import IQueryParams from './IQueryParams';
import { serializeQuery, deserializeQuery } from './NavigationHelper';
import BeforeUnload from '@ms/odsp-utilities/lib/beforeUnload/BeforeUnload';
import { deepCompare } from '@ms/odsp-utilities/lib/object/ObjectUtil';

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

        this.viewParamsObservable = this.createObservable<IViewParams>({});
        this.viewParamsObservable.equalityComparer = deepCompare;

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
            let viewParams = deserializeQuery(url.substring(1));

            this.viewParamsObservable(viewParams);
        }
    }

    /**
     * @inheritdoc
     */
    public updateViewParams(newParams: IQueryParams | string, options: IUpdateViewParamsOptions = {}): void {
        if (typeof newParams === 'string') {
            newParams = deserializeQuery(newParams);
        }

        const {
            clearOtherParams = false
        } = options;

        const queryParams: IQueryParams = {
            ...(clearOtherParams ? {} : this.viewParams),
            ...newParams
        };

        this.viewParamsObservable(deserializeQuery(serializeQuery(queryParams)));
    }

    public reload(): void {
        // Do nothing.
    }

    private _onViewParamsChanged(viewParams: IViewParams) {
        this.viewParams = viewParams;

        this.events.raise('change', viewParams);
    }
}
