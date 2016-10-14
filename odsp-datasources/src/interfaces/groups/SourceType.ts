/**
 * Represents the source of the group data.
 */
export enum SourceType {
    /** Group data comes from cache. */
    Cache,
    /** Group data comes from the server. */
    Server,
    /** Group data is missing. */
    None
}

export default SourceType;
