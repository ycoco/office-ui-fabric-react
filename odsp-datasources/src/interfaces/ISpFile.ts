/**
 * Represents a file in a SPList
 */
export interface ISpFile {
    /** Name of the file including the extension */
    name: string;
    /** Relative URL of the file based on the URL for the server */
    serverRelativeUrl: string;
}
export default ISpFile;
