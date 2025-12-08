# Npm_schedule_calendar

Npm package, schedule calendar. Light, fast and secure.
Writed with native Typescript code and no dependencies are used.

## Pack

1. npm run build
2. Copy the file "/build/package_name-x.x.x.tgz" in the project root folder.
3. In the "package.json" file insert: "@cimo/package_name": "file:package_name-x.x.x.tgz"

## Publish

1. npm run build
2. npm login --auth-type=legacy
3. npm publish --auth-type=legacy --access public

## Installation

1. Link for npm package -> https://www.npmjs.com/package/@cimo/schedule_calendar

## Example

-   Example.ts

```
...

import { Csc } from "@cimo/schedule_calendar/dist/src/Main";

...

const csc = new Csc(
    { yearBack: 10, yearForward: 10, isStartOnMonday: false, isHighlightToday: true },
    ".calendar"
);

csc.setLocale("js-JP");
csc.setWeekdayList(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);

csc.callbackCurrent = (year: number, month: number) => {
    console.log("callbackCurrent", year, month);
};

csc.callbackCell = (elementDiv: HTMLDivElement, day: number) => {
    console.log("callbackCell", elementDiv, day);
};

csc.create();

// csc.update();

...

```
