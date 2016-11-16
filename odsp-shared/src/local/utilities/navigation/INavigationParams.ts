
import IBaseModelParams = require('../../base/IBaseModelParams');

/**
 * Optional Parameters to the constructor of Navigation that alters its behavior
 */
interface INavigationParams extends IBaseModelParams {
    /**
     * By default, Navigation will convert hash parameters (#) into query parameters (?) if the browser supports it.
     * Example hash conversion: www.foo.com#bar=high&mobile=1  converts to =>  www.foo.com?bar=high&mobile=1
     * Setting this to true disables this so that hash parameters stay in the hash.
     */
    disableHashConversion?: boolean;
}

export = INavigationParams;
