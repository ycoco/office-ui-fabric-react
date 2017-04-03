import { ClientId } from '../interfaces/SharingInterfaces';

module ClientIdHelper {
    export function isOfficeProduct(clientId: ClientId): boolean {
        return clientId === ClientId.word || clientId === ClientId.powerpoint || clientId === ClientId.excel;
    }
}

export default ClientIdHelper;