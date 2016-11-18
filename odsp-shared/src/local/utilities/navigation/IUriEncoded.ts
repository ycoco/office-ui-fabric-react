
/**
 * Represents data which has already been encoded for inclusion in a URI.
 */
interface IUriEncoded {
    /**
     * The value to be written directly into a URI, and not encoded again.
     */
    uriValue: string;
}

export default IUriEncoded;
