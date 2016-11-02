
import { IDisposable } from '@ms/odsp-utilities/lib/disposable/IDisposable';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import { IQosEndSchema } from '@ms/odsp-utilities/lib/logging/events/Qos.event';
import ActionInputType from './ActionInputType';

interface IAction extends IDisposable {
    /** Name of the action for logging purposes. */
    name: string;

    /** Computed binding for determining availability of an action. */
    isAvailable: KnockoutComputed<boolean>;

    /**
     * Whether or not this action instance is currently executing.
     */
    isExecuting: KnockoutObservable<boolean>;

    /** Computed binding for determining availability of an action. */
    isToggled: KnockoutComputed<boolean>;

    /** The type of input that the action is expecting. */
    inputType?: KnockoutObservable<ActionInputType>;

    /** Optional function to handle inputchange, this is used by upload action */
    onInputChange?: (eventArgs: any) => void;

    /** Function to execute for given action. */
    execute(eventArgs: any): Promise<IQosEndSchema>;
}

export = IAction;