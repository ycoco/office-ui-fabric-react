import ResourceScope = require('../utilities/resources/ResourceScope');

interface IBaseModelParams {
    id?: string;
    resources?: ResourceScope;
}

export = IBaseModelParams;