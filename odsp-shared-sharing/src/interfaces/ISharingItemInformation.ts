interface ISharingItemInformation {
    /* The name of the item. */
    name: string;

    /* The number of items within a folder (0 if a file). */
    // TODO (joem): Make required before next major version bump.
    childCount?: number;

    /* Determines if item is a folder (true = folder, false = file). */
    // TODO (joem): Remove before next major version bump.
    isFolder?: boolean;
}

export default ISharingItemInformation;