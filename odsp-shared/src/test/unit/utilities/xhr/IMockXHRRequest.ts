interface IXHRRequest {
    type: string;
    url: string;
    async: boolean;
    user: string;
    password: string;
    headers: { [key: string]: string };
    data: string;
}

export = IXHRRequest;