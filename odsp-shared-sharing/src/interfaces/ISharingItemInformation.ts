interface ISharingItemInformation {
    /* The name of the item. */
    name: string;

    /* The number of items within a folder (0 if a file). */
    childCount: number;
}

export default ISharingItemInformation;