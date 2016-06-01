import ResourceScope = require('odsp-utilities/resources/ResourceScope');

interface IBaseModelParams {
    id?: string;
    resources?: ResourceScope;
}

export = IBaseModelParams;