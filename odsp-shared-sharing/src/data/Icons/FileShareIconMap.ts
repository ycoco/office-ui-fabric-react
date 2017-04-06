import { FileShareType } from '../../interfaces/SharingInterfaces';

export const FileShareIconMap = {
    [FileShareType.anyone]: 'Globe',
    [FileShareType.onlyYou]: 'Lock',
    [FileShareType.specificPeople]: 'PeopleAdd',
    [FileShareType.workGroup]: 'Work',
    [FileShareType.existing]: 'SecurityGroup'
};