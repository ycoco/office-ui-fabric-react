/**
 * Interface for a navigation node.
 *
 * Note that the properties here reflect the structure of the JSON blob returned by the server,
 * at the time of writing.
 */
export interface INavNode {
    Id: number;
    Title: string;
    Url: string;
    IsDocLib: boolean;
    IsExternal: boolean;
    ParentId: number;
    Children: Array<INavNode>;
}

export default INavNode;