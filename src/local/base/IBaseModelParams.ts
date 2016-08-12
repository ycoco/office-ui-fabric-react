
import { IComponentParams } from '@ms/odsp-utilities/lib/component/Component';

interface IBaseModelParams extends IComponentParams {
    /**
     * An identitifer to disambiguate this model against other model instances.
     * Optional.
     *
     * @type {string}
     */
    id?: string;
}

export = IBaseModelParams;
