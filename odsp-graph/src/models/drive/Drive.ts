
import { IIdentitySet } from '../identity/Identity';

export type DriveType = keyof {
    personal,
    business
};

export type QuotaState = keyof {
    normal,
    nearing,
    critical,
    exceeded
};

export interface IQuota {
    total: number;
    used: number;
    remaining: number;
    deleted: number;
    state: QuotaState;
}

export interface IDrive {
    id: string;
    driveType: DriveType;
    owner: IIdentitySet;
    quota: IQuota;
}
