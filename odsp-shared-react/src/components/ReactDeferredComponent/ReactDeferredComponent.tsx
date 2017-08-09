// OneDrive:IgnoreCodeCoverage

import * as React from 'react';
import { IReactDeferredComponentState, IReactDeferredComponentProps } from './ReactDeferredComponent.Props';
import { Manager } from '@ms/odsp-utilities/lib/logging/Manager';
import IClonedEvent from '@ms/odsp-utilities/lib/logging/IClonedEvent';
import { PLT as PLTEvent } from '@ms/odsp-utilities/lib/logging/events/PLT.event';
import PerformanceCollection from '@ms/odsp-utilities/lib/performance/PerformanceCollection';
import { hoistMethods } from 'office-ui-fabric-react/lib/Utilities';

/**
 * People can use this component as a wrapper to wrap their components that need to be delay loaded.
 * Then they put this component into their before glass code. It contains logic to delay load the real target
 * components and will render them accordingly.
 * This ReactDeferredComponent works for both AMD and common js/web pack code base.
 * Please check how do we defer loading EditNav in odsp-next/controls/leftNav/react/ReactLeftNav
 * and defer loading ContextualManu and GroupCard in SiteHeaderHost of sp-client/sp-pages
 *
 * @example
 * render() {
 *   let deferredComponentProps: IReactDeferredComponentProps = {
 *    modulePath: target_module_path,
 *    moduleLoader: implementation of IReactDeferredComponentModuleLoader,
 *    waitPLT: true/false, // if deferred component needs to be autometically loaded when PLT. then true, example search box, otherwise false, example group card triggered by a user click
 *    props: properties of the defer loaded component.
 *  };
 *  let deferredComponent = <ReactDeferredComponent { ...deferredComponentProps } />;
 *  return (
 *      <div>
 *          <before glass components>
 *          {deferredComponent}
 *      </div>
 *  );
 * }
 */
export class ReactDeferredComponent extends React.Component<IReactDeferredComponentProps, IReactDeferredComponentState> {
    private _pltEventHandler: (event: IClonedEvent) => void;
    private _mounted: boolean;

    constructor(props: IReactDeferredComponentProps) {
        super(props);
        // this._getDeferredComponentRef = this._getDeferredComponentRef.bind(this);
        this._mounted = false;
        this.state = {
            ComponentModule: undefined
        };
        this._pltEventHandler = (event: IClonedEvent) => {
            if (PLTEvent.isTypeOf(event)) { // PLT just happened, start loading component
                this._deferLoadComponent();
            }
        };
        if ((props.waitPLT === undefined || props.waitPLT) && !PerformanceCollection.pageLoaded()) {
            Manager.addLogHandler(this._pltEventHandler);
        } else { // do not need to wait until plt such as user triggered component loading, or plt happened already, immediately start loading component
            this._deferLoadComponent();
        }
    }
    public render(): React.ReactElement<{}> {
        const { ComponentModule } = this.state;
        if (ComponentModule) {
            return (
                <ComponentModule
                    ref={ (deferredComponentInstance) => { if (deferredComponentInstance) { hoistMethods(this, deferredComponentInstance); } } }
                    {...this.props.props}
                />
            );
        } else {
            return this.props.placeHolder || null;
        }
    }

    public componentDidMount() {
        if (!this._mounted) {
            this._mounted = true;
        }
    }

    private _deferLoadComponent(): void {
        let { ComponentModule } = this.state;
        if (!ComponentModule && this.props.moduleLoader && this.props.modulePath) {
            this.props.moduleLoader.load(this.props.modulePath).then((reactComp: any) => {
                if (this.props.moduleLoader.parse) {
                    reactComp = this.props.moduleLoader.parse(reactComp);
                }
                if (this._mounted) {
                    this.setState({ ComponentModule: reactComp });
                } else {
                    this.state = {
                        ComponentModule: reactComp
                    };
                }
                Manager.removeLogHandler(this._pltEventHandler);  // module loaded, remove the unnecessary event handler
            });
        }
    }
}