
import IUriEncoded from './IUriEncoded';

/**
 * Interface for params which can be processed into a query string.
 * All values are converted to strings and encoded as URI parts, except
 * for objects which implement {IUriEncoded}.
 */
interface IQueryParams {
    [param: string]: string | number | boolean | IUriEncoded;
}

export default IQueryParams;
