/**
 * An interface to describe the possible properties on the IRecycleBinItem object
 */
export interface IRecycleBinProperties {
    deletedByName: string;
    deletedByEmail: string;
    directory: string;
    creatorEmail: string;
    itemType: RecycleBinItemType;
    itemUri: string;
    itemState: RecycleBinItemState;
}

export enum RecycleBinItemType {
    Invalid = 0,
    File = 1,
    FileVersion = 2,
    ListItem = 3,
    List = 4,
    Folder = 5,
    FolderWithLists = 6,
    Attachment = 7,
    ListItemVersion = 8,
    CascadeParent = 9,
    Web = 10,
    App = 11
}

export enum RecycleBinItemState {
    InvalidStage = 0,
    FirstStageRecycleBin = 1,
    SecondStageRecycleBin = 2
}
