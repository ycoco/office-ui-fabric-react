interface IKnockoutComputedOptions {
    /**
     * This is true if you want the evaluation of the function to only happen on first subscription
     */
    deferEvaluation?: boolean;

    /**
     * This is true if you want the function to only listen to dependencies when its subscribed
     */
    pure?: boolean;

    disposeWhen?: () => boolean;
}

export = IKnockoutComputedOptions;