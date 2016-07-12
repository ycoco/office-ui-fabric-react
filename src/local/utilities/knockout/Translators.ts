
module Translators {
    'use strict';

    /**
     * Replicates changes from the source array into the target array.
     */
    export function replicateArray<T>(source: KnockoutObservableArray<T>, target: KnockoutObservableArray<T>): KnockoutSubscription {
        let updateArray = (changes: KnockoutArrayChange<T>[]) => {
            let sourceArray = source.peek();
            // Need to operate on the underlying array in order to avoid firing change events prematurely.
            let targetArray = target.peek();

            target.valueWillMutate();

            targetArray.splice(0, targetArray.length, ...sourceArray);

            target.valueHasMutated();
        };

        let subscription = source.subscribe<KnockoutArrayChange<T>[]>(updateArray, null, 'arrayChange');

        updateArray([]);

        return subscription;
    }
}

export = Translators;
