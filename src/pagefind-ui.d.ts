declare module "@pagefind/default-ui" {
  export class PagefindUI {
    constructor(options: {
      element: string;
      bundlePath: string;
      [key: string]: unknown;
    });
  }
}
