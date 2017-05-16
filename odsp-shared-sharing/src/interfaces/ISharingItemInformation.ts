interface ISharingItemInformation {
    /* The name of the item. */
    name: string;

    /* The number of items within a folder (0 if a file). */
    childCount: number;

    /* If the item has DLP policy preventing sharing to external users. */
    hasDlpPolicy: boolean;
}

export default ISharingItemInformation;