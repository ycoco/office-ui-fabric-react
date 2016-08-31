import * as React from 'react';
import ModuleLoader from '@ms/odsp-utilities/lib/async/ModuleLoader';
import { Manager } from '@ms/odsp-utilities/lib/logging/Manager';
import IClonedEvent from '@ms/odsp-utilities/lib/logging/IClonedEvent';
import { PLT as PLTEvent } from '@ms/odsp-utilities/lib/logging/events/PLT.event';
import PerformanceCollection from '@ms/odsp-utilities/lib/performance/PerformanceCollection';

export interface IReactDeferredComponentProps {
    modulePath: string;
    getModule?: (module: any) => typeof React.Component;
    waitPLT?: boolean;
    props: any;
}

export interface IReactDeferredComponentState {
    ComponentModule: typeof React.Component;
}

/**
 * Create an deferred react component for performance, reduce PLT bundle size.  Caller passes in deferred component ModulePath and props to
 * the Module.Y
 */
export default class ReactDeferredComponent extends React.Component<IReactDeferredComponentProps, IReactDeferredComponentState> {
    private _pltEventHandler: (event: IClonedEvent) => void;

    constructor(props: IReactDeferredComponentProps) {
        super(props);
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
        let { ComponentModule } = this.state;
        if (ComponentModule) {
            return (
                <ComponentModule {...this.props.props} />
            );
        } else {
            return null;
        }
    }

    private _deferLoadComponent(): void {
        let { ComponentModule } = this.state;
        if (!ComponentModule) {
            ModuleLoader.loadDefault<typeof React.Component>(this.props.modulePath, require, this.props.getModule).then((reactComp: typeof React.Component) => {
                this.setState({ ComponentModule: reactComp });
                Manager.removeLogHandler(this._pltEventHandler);  // module loaded, remove the unnecessary event handler
            });
        }
    }
}
