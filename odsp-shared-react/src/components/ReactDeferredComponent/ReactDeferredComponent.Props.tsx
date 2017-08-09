import * as React from 'react';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import { ReactDeferredComponent } from './ReactDeferredComponent';

export interface IReactDeferredComponentModuleLoader {
    /**
     * Will be used to load deferred react component on demand.
     */
    load: (modulePath: string | string[]) => Promise<{ [modulePath: string]: any }>;
    /**
     * Will be used to parse the returned object from calling load() to get the constructor of the deferred react component.
     * Load() should be the generic way of loading component such as RequireHelper.Promise(Path) in AMD or Require.Ensure(Path) in webpack.
     * The returned object from load() can have different format based on module definition. It can be T or  { T }  or { default: T },
     * then code specifies the module path of component T and parse() function to extract the constructor object of component T from the result of load().
     * @example
     * paser() function to get GroupCard from the result of load('@ms/odsp-shared-react/lib/components/GroupCard/GroupCard')
     * this.props.moduleLoader.parse = (module: { path: { GroupCard: typeof React.Component } }) => {
     *      return module[groupCardPath] && module[groupCardPath].GroupCard;
     * };
     */
    parse: (reactModule: { [modulePath: string]: any }) => typeof React.Component;
}
/**
 * Any components that are using ReactDeferredComponent to delay loading its child component 
 * should implement this interface to have moduleLoader in its props, since ReactDeferredComponent needs it. 
 * Please see HorizontalNav and SiteHeader implement this interface.
 */
export interface IReactDeferredComponentCapability {
    /**
     * logic of how to defer load this module, 
     * In AMD, it will likely be a require.promise.
     * In commonJS/webpark, it will be require.ensure.
     */
    moduleLoader?: IReactDeferredComponentModuleLoader;
}

export interface IReactDeferredComponentProps extends React.Props<ReactDeferredComponent> {
    /**
     * path to the module to be deferred
     */
    modulePath: string;
    /**
     * logic of how to defer load this module, 
     * in AMD, it will likely be a requre.promise
     * in commonJS/webpark, it will be require.ensure.
     */
    moduleLoader: IReactDeferredComponentModuleLoader;
    /**
     * true if this component needs to be defer loaded autometically after page load, like search box, suite nav
     * false if this component is initialized by user actions like click a button to lauch people card
     */
    waitPLT?: boolean;
    /**
     * properties of the defer load component
     */
    props: any;

    /**
     * the place holder when deferred component is not ready
     */
    placeHolder?: JSX.Element;
}

export interface IReactDeferredComponentState {
    ComponentModule: typeof React.Component;
}