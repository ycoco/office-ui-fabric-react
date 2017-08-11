// OneDrive:IgnoreCodeCoverage

import ItemActivityType from './ItemActivityType';

export interface IUser {
    displayName: string;
    email: string;
}

interface IItemActivity {
    id: string;
    type: ItemActivityType;
    user: IUser;
    fileName: string;
    time: Date;
    children?: IItemActivity[];
}

export default IItemActivity;
