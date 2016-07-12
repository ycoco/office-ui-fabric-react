import ResourceScope = require('@ms/odsp-utilities/lib/resources/ResourceScope');

interface IBaseModelParams {
    id?: string;
    resources?: ResourceScope;
}

export = IBaseModelParams;