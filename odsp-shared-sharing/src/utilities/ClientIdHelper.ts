import { ClientId } from '../interfaces/SharingInterfaces';

export function isOfficeProduct(clientId: ClientId): boolean {
    return clientId === ClientId.word || clientId === ClientId.powerpoint || clientId === ClientId.excel;
}

export function isODSP(clientId: ClientId): boolean {
    return clientId === ClientId.odb || clientId === ClientId.sharePoint;
}