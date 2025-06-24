import { DOMParser, HTMLDocument } from 'https://deno.land/x/deno_dom/deno-dom-wasm.ts';
import { open } from 'https://deno.land/x/open/index.ts';
import { existsOnWebsites, websiteResponseCheck, websiteTextCheck } from './data/websites.ts';

const intervalEnabled = Deno.args[0] === 'true';
const MIN = 60 * 1_000;
const HOUR = 60 * MIN;
const MIN5 = 5 * MIN;
const intervalTime = MIN5;

for(const website of websiteTextCheck) {
    startInterval(() => check(website.url, website.selector, website.expected), website.url);
}

for(const website of existsOnWebsites) {
    startInterval(() => checkExists(website.url, website.selector, website.expected), website.url);
}

for(const website of websiteResponseCheck) {
    startInterval(() => checkResponse(website.url, website.selector, website.expected, website.headers), website.link);
}

async function check(link: string, selector: string, expected: string): Promise<boolean> {
    const document = await getDocument(link);
    const orderOptions = document?.querySelectorAll(selector) ?? [];
    for(const option of orderOptions) {
        if (option.textContent.trim() !== expected) {
            return true;
        }
    }
    return false;
}

async function checkExists(link: string, selector: string, expected: boolean): Promise<boolean> {
    const document = await getDocument(link);
    const element = document?.querySelector(selector);
    return expected !== !!element;
}

async function checkResponse(link: string, selector: string, expected: unknown, headers?: Record<string, string>): Promise<boolean> {
    const data = await getJson(link, headers);
    const keys = selector.split('.');
    // deno-lint-ignore no-explicit-any
    let currentElement: any = data;
    for(const key of keys) {
        currentElement = currentElement[key];
    }

    return currentElement !== expected;
}

async function getDocument(link: string): Promise<HTMLDocument | null> {
    console.log('check', link);
    const res = await fetch(link);
    const html = await res.text();
    return new DOMParser().parseFromString(html, 'text/html');
}

async function getJson(link: string, headers?: Record<string, string>): Promise<unknown> {
    console.log('check', link);
    const res = await fetch(link, headers && {headers});
    return res.json();
}

function validateStatus(status: boolean, link: string, id?: number): void {
    if(status) {
        open(link);
        if(id) {
            clearInterval(id);
        }
    }
}

async function startInterval(method: () => Promise<boolean>, redirectTo: string, executeAtStart = true) {
    if (executeAtStart) {
        await startMethod();
    }
    if(intervalEnabled) {
        const id = setInterval(async () => {
            await startMethod(id);
        }, intervalTime);
    }

    async function startMethod(id?: number) {
        const status = await method();
        validateStatus(status, redirectTo, id);
    }
}