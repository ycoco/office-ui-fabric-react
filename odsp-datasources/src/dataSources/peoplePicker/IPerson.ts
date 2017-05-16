﻿
export enum EntityType {
    regularUser = 0,
    externalUser = 1,
    group = 2,
    application = 3
}

export enum PrincipalType {
    none = 0,
    user = 1,
    distributionList = 2,
    securityGroup = 4,
    sharePointGroup = 8
}

// Changing in IPerson may require updates to version property in PeopleStore to flush cache.
export interface IPerson {
    userId: string;
    name: string;
    email: string;
    /**
     * The principalName obtained from the server.
     * A unique identifier that can be compared with the
     * current user's userLoginName.
     */
    principalName?: string;
    phone?: string;
    office?: string;
    job?: string;
    department?: string;
    image?: string;
    sip?: string;
    profilePage?: string;
    providerName?: string;
    isResolved?: boolean;
    multipleMatches?: Array<IPerson>;
    decimalUserId?: string;
    entityType?: EntityType;
    rawPersonData?: any;
    principalType?: PrincipalType;
    aadObjectId?: string;
    rawData?: any;
    /**
     * Whether the person is an owner of the current unified group
     */
    isOwnerOfCurrentGroup?: boolean;
    isExternal?: boolean;
}

export interface IPersonProfile {
    personDetails: IPerson;
    managerChain?: Array<IPerson>;
    directReports?: Array<IPerson>;
}

export default IPerson;