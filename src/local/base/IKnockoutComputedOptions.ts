interface IKnockoutComputedOptions {
    /**
     * This is true if you want the evaluation of the function to only happen on first subscription
     */
    deferEvaluation?: boolean;

    /**
     * This is true if you want the function to only listen to dependencies when its subscribed
     */
    pure?: boolean;

    /**
     * If given, this function is executed before each re-evaluation to determine
     * if the computed observable should be disposed.
     * A true result will trigger disposal of the computed observable.
     */
    disposeWhen?: () => boolean;
}

export = IKnockoutComputedOptions;