
/**
 * Interface for params directly extracted from a query string.
 * All values are guaranteed to be strings.
 */
interface IViewParams {
    [param: string]: string;
}

export default IViewParams;
