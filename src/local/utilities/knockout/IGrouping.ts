
interface IGrouping<K, T> {
    key: K;
    values: KnockoutObservableArray<T>;
}

export = IGrouping;
