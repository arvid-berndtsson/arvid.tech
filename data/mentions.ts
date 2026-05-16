export interface Mention {
  name: string;
  url: string;
  logoSrc: string; // path under /public
  logoAlt?: string;
}

export const MENTIONS: Mention[] = [
  {
    name: "Malmö University",
    url: "https://innovation.uni.mau.se/futuremakers-2023/#:~:text=the%20most%20innovative%20idea",
    logoSrc: "/mentioned-on/mau-logo.svg",
    logoAlt: "Malmö University logo",
  },
  {
    name: "Drivhuset",
    url: "https://malmo.drivhuset.se/en/merely-emissions/",
    logoSrc: "/mentioned-on/drivhuset-logo.png",
    logoAlt: "Drivhuset logo",
  },
  {
    name: "Webperf",
    url: "https://webperf.se/articles/testa-hallbarhet/#:~:text=f%C3%B6r%20sorts%20l%C3%B6sning.-,merely%20emissions,-Bild%203%3A%20Webperf",
    logoSrc: "/mentioned-on/webperf-logo.png",
    logoAlt: "Webperf logo",
  },
];
