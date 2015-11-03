
import ko = require('knockout');

class Aggregators {
    /**
     * Includes a given source observable in the sum tracked by the given target observable.
     * @params source {KnockoutObservable<number>} - an observable for a part
     * @params target {KnockoutObservable<number>} - an observable for the overall sum
     */
    public static includeInSum(source: KnockoutObservable<number>, target: KnockoutObservable<number>): KnockoutSubscription {
        var current: number;

        var apply = (diff: number) => {
            // Apply the difference to the overall sum.
            target(target.peek() + diff);
        };

        var before = source.subscribe(() => {
            current = source.peek();
        }, null, 'beforeChange');

        var after = source.subscribe(() => {
            apply(source.peek() - current);
        });

        // Add the initial value to the sum.
        apply(source.peek());

        return {
            dispose: () => {
                before.dispose();
                after.dispose();

                // Subtract the final value from the sum.
                apply(-source.peek());
            }
        };
    }

    /**
     * Includes a given source observable in the histogram tracked by the given target observable.
     * @params source {KnockoutObservable<number>} - an observable for a part
     * @params target {KnockoutObservable<{ [key: number]: number; }>} - an observable for the histogram
     */
    public static includeInHistogram(source: KnockoutObservable<string>, target: KnockoutObservable<{
        [key: string]: number;
    }>): KnockoutSubscription {
        var old: string;

        var apply = (previous?: string, current?: string) => {
            var histogram = target.peek();

            if (previous !== (void 0)) {
                // Decrement the previous bucket in the histogram.
                histogram[previous]--;
            }
            if (current !== (void 0)) {
                // Increment the new bucket in the histrogram.
                histogram[current] = (histogram[current] || 0) + 1;
            }

            target.valueHasMutated();
        };

        var before = source.subscribe(() => {
            old = source.peek();
        }, null, 'beforeChange');

        var after = source.subscribe(() => {
            apply(old, source.peek());
        });

        // Add the initial value to the histogram.
        apply((void 0), source.peek());

        return {
            dispose: () => {
                before.dispose();
                after.dispose();

                // Remove the final value from the histogram.
                apply(source.peek(), (void 0));
            }
        };
    }

    /**
     * Tries to make the target observable match the source observable if allowed.
     * If the target observable is empty, then the subscription sets the target observable
     * to the value of the source observable. If the source observable becomes empty while
     * its value is the target, the target becomes empty again.
     */
    public static setFirst<T>(source: KnockoutObservable<T>, target: KnockoutObservable<T>): KnockoutSubscription {
        var current = source.peek();

        var before = source.subscribe(() => {
            current = source.peek();
        }, null, 'beforeChange');

        /* tslint:disable:ban */
        var keepCurrent = ko.computed(() => {
        /* tslint:enable:ban */
            if (!target() && source()) {
                target(source());
            }
        });

        var after = source.subscribe((value: T) => {
            if (!value && current && target.peek() === current) {
                target(undefined);
            }
        });

        return {
            dispose: () => {
                keepCurrent.dispose();
                after.dispose();
                before.dispose();
            }
        };
    }
}

export = Aggregators;