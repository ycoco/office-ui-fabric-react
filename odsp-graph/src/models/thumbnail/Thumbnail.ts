
export interface IThumbnail {
    width: number;
    height: number;
    url: string;
}

export interface IThumbnailSet {
    id: string;
    small: IThumbnail;
    medium: IThumbnail;
    large: IThumbnail;
    source: IThumbnail;
}
