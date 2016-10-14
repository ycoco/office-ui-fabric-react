﻿
export enum EntityType {
    regularUser,
    externalUser,
    group,
    application
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
}

export interface IPersonProfile {
    personDetails: IPerson;
    managerChain?: Array<IPerson>;
    directReports?: Array<IPerson>;
}

export default IPerson;