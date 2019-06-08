declare module 'react-native-cheerio' {
  interface Options {
    withDomLvl1: boolean;
    normalizeWhitespace: boolean;
    xmlMode: boolean;
    decodeEntities: boolean;
  }
  export function load(content: string | Buffer, options?: Options): CheerioStatic & CheerioSelector;
  export function load(element: CheerioElement, options?: Options): CheerioStatic & CheerioSelector;
}

declare module 'react-native-fetch-polyfill' {
  interface Timeout {
    timeout?: number;
  }
  export default function fetchPolyfill(input?: string | Request, init?: RequestInit & Timeout): Promise<Response>;
}

declare module '*.png';
