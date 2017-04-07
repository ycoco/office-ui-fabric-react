export function truncateItemNameForHeader(name: string): string {
    return _truncateItemName(name, 26);
}

export function truncateItemNameForShareNotification(name: string): string {
    return _truncateItemName(name, 20);
}

function _truncateItemName(name: string, maxLength: number): string {
    const MAX_LENGTH = maxLength;
    const PART_LENGTH = (MAX_LENGTH / 2);

    if (name.length <= MAX_LENGTH) {
        return name;
    }

    const firstPart = name.slice(0, PART_LENGTH);
    const secondPart = name.slice((name.length) - PART_LENGTH);

    return `${firstPart}...${secondPart}`;
}