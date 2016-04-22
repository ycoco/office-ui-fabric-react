/// <reference path='../../knockout/knockout.d.ts' />

import IDisposable = require('./IDisposable');
import ResourceScope = require('../utilities/resources/ResourceScope');
import Promise from 'odsp-utilities/async/Promise';
import { IQosEndSchema } from 'odsp-utilities/logging/events/Qos.event';
import ActionInputType from './ActionInputType';

interface IAction extends IDisposable {
    /** Name of the action for logging purposes. */
    name: string;

    /** Resources tied to the action. */
    resources: ResourceScope;

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