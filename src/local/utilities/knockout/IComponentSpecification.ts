
/// <reference path='../../../knockout/knockout.d.ts' />

interface IComponentSpecification {
    /**
     * The registered name of the component to instantiate.
     * If this changes, the component will be re-created.
     */
    name: string | KnockoutObservable<string>;

    /**
     * The params to use to instantiate the component.
     * If this changes, the component will be re-created.
     */
    params: {} | KnockoutObservable<{}>;
}

export = IComponentSpecification;
