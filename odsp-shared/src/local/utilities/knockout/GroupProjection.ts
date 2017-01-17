﻿
import './Projections';

import { IDisposable, hook } from '@ms/odsp-utilities/lib/disposable/Disposable';
import IGrouping = require('./IGrouping');
import ko = require('knockout');

class GroupProjection<K, T> {
    public groups: KnockoutObservableArray<IGrouping<K, T>>;

    private _source: KnockoutObservableArray<T>;

    private _mapping: IDisposable;

    private _getKey: (value: T) => K;

    private _groupsByKeyId: {
        [keyId: string]: IGrouping<K, T>;
    };

    constructor(source: KnockoutObservableArray<T>, getKey: (value: T) => K) {
        this._source = source;
        this._getKey = getKey;
        this._groupsByKeyId = {};

        this.groups = ko.observableArray<IGrouping<K, T>>();

        this._initializeGroups();

        hook(this.groups, () => {
            this._mapping.dispose();
        });
    }

    public static group<K, T>(source: KnockoutObservableArray<T>, getKey: (value: T) => K): KnockoutMappedObservableArray<IGrouping<K, T>> {
        var groupProjection = new GroupProjection(source, getKey);

        return <KnockoutMappedObservableArray<IGrouping<K, T>>>groupProjection.groups;
    }

    private _initializeGroups() {
        this._mapping = this._source.map({
            mappingWithDisposeCallback: (value: T) => {
                var key = this._getKey(value);
                var keyId = JSON.stringify(key);
                var group: IGrouping<K, T> = this._groupsByKeyId[keyId];

                if (!group) {
                    group = {
                        key: key,
                        values: ko.observableArray<T>([value])
                    };

                    this._groupsByKeyId[keyId] = group;
                    this.groups.push(group);
                } else {
                    group.values.push(value);
                }

                return {
                    mappedValue: keyId,
                    dispose: () => {
                        if (group.values.peek().length > 1) {
                            group.values.remove(value);
                        } else {
                            delete this._groupsByKeyId[keyId];
                            this.groups.remove(group);
                        }
                    }
                };
            }
        });
    }
}

export = GroupProjection;