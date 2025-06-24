export interface IWebsiteTextCheck {
    url: string;
    selector: string;
    expected: string
}

export interface IWebsiteExistsElement {
    url: string;
    selector: string;
    expected: boolean;
}

export interface IWebsiteResponseCheck {
    url: string;
    selector: string /*key1.key2.key3...*/;
    expected: unknown;
    link: string;
    headers?: Record<string, string>;
}