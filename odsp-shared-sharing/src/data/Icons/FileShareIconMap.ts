import { FileShareType } from '../../interfaces/SharingInterfaces';

export const FileShareIconMap = {
    [FileShareType.ANYONE]: 'Globe',
    [FileShareType.ONLY_YOU]: 'Lock',
    [FileShareType.SPECIFIC_PEOPLE]: 'AddGroup',
    [FileShareType.WORK_GROUP]: 'Work'
};