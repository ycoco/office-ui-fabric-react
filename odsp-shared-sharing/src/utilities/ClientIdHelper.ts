import { ClientId } from '../interfaces/SharingInterfaces';

export function isOfficeProduct(clientId: ClientId): boolean {
    return clientId === ClientId.word || clientId === ClientId.powerpoint || clientId === ClientId.excel || clientId === ClientId.visio;
}

export function isODSP(clientId: ClientId): boolean {
    return clientId === ClientId.odb || clientId === ClientId.sharePoint;
}

export function hideItemName(clientId: ClientId): boolean {
    return isOfficeProduct(clientId) || clientId === ClientId.onenoteWeb;
}

export function showCloseButton(clientId: ClientId): boolean {
    return isODSP(clientId) || clientId === ClientId.onenoteWeb || clientId === ClientId.officecom;
}

export function showOutlookShareTarget(clientId: ClientId): boolean {
    return isODSP(clientId) || clientId === ClientId.officecom;
}