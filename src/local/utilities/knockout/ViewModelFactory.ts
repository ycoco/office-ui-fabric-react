// OneDrive:IgnoreCodeCoverage
/// <amd-dependency path="./ResourceComponentLoader" />

import ViewModel = require('../../base/ViewModel');
import ko = require('knockout');

/**
 * Creates a wrapper around the createViewModel factory pattern KO uses.
 * @param vm: The ViewModel class you want to create the factory for
 * @return the createViewModel function that can be used to register
 *         the component's view model
 */
export function createViewModelFactory<T extends ViewModel>(viewModelType: new (params: any) => T) {
    return ((params: any, componentInfo?: KnockoutComponentTypes.ComponentInfo) => {
        var viewModel = new (params.resources.injected(viewModelType))(params);

        /* tslint:disable:ban */
        var updater = ko.computed(() => {
        /* tslint:enable:ban */
            if (params.model) {
                /*  What we're accomplishing with this is updating all properties
                    of the viewmodel with properties passed in from an external source.
                    In ODC, the "external source" is dataContext from JBase controls.
                    */
                var model = ko.utils.unwrapObservable(params.model);

                for (var prop in model) {
                    if (model.hasOwnProperty(prop) && viewModel[prop]) {
                        if (ko.isObservable(viewModel[prop])) {
                            viewModel[prop](ko.utils.unwrapObservable(model[prop]));
                        } else {
                            viewModel[prop] = ko.utils.unwrapObservable(model[prop]);
                        }
                    }
                }
            }
        }, viewModel);

        var disposeViewModel = viewModel["dispose"];

        viewModel["dispose"] = () => {
            if (disposeViewModel) {
                disposeViewModel.call(viewModel);
            }
            updater.dispose();
        };

        return viewModel;
    });
}

/**
 * Creates the Component Config View Model for the controls that use factory pattern
 * @param vm: The ViewModel class you want to create the factory for
 * @return a Knockout Component Config View Model
 */
export function createViewModelHelper<T extends ViewModel>(viewModelType: new (params: any) => T): KnockoutComponentTypes.ViewModelFactoryFunction {
    return {
        createViewModel: createViewModelFactory(viewModelType)
    };
}
