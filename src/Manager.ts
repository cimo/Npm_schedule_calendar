// Source
import * as helperSrc from "./HelperSrc";
import * as model from "./Model";

export default class Manager {
    private option: model.Ioption;
    private containerTag: string;

    private locale: string;
    private weekdayList: string[];

    private date: Date;
    private yearMin: number;
    private yearMax: number;
    private yearCurrent: number;
    private monthCurrent: number;

    private elementButtonBack: HTMLButtonElement | null;
    private elementTitle: HTMLDivElement | null;
    private elementButtonForward: HTMLButtonElement | null;
    private elementSelectYear: HTMLSelectElement | null;
    private elementButtonToday: HTMLButtonElement | null;
    private elementWeekday: HTMLDivElement | null;
    private elementDay: HTMLDivElement | null;

    private childrenStyle = (): void => {
        const elementStyle = document.createElement("style");

        elementStyle.textContent = `
            .csc_wrapper {
                margin: 20px;
            }
            .csc_toolbar {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-block-end: 8px;
            }
            .csc_title {
                flex: 1;
                font-weight: 600;
                text-transform: capitalize;
                text-align: center;
                font-size: 24px;
            }
            .csc_button {
                border: 1px solid #c7c7c7;
                background-color: #33b215 !important;
                color: #ffffff;
                border-radius: 4px;
                box-shadow: 0 1px 6px 0 rgba(0, 0, 0, 0.4);
                cursor: pointer;
                width: 40px;
                height: 40px;
                text-align: center;
                vertical-align: middle;
            }
            .csc_button:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            .csc_year {
                border: 1px solid #c7c7c7;
                background-color: #33b215 !important;
                color: #ffffff;
                border-radius: 4px;
                box-shadow: 0 1px 6px 0 rgba(0, 0, 0, 0.4);
                cursor: pointer;
                padding: 5px;
            }
            .csc_year option {
                color: #000000;
                background-color: #ffffff;
            }
            .csc_page {
                box-shadow: 0 1px 6px 0 rgba(0, 0, 0, 0.4);
                padding: 10px;
            }
            .csc_weekday, .csc_day {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                gap: 4px;
            }
            .csc_weekday {
                text-align: center;
                font-weight: 600;
                color: #444444;
                padding: 6px 0;
            }
            .csc_cell {
                aspect-ratio: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px;
                color: #222222;
                border: 1px solid #c7c7c7;
            }
            .csc_cell.csc_today {
                outline: 2px solid #0078d4;
                background: #e5f1fb;
                font-weight: 700;
            }
            .csc_cell.csc_empty {
                color: transparent;
                pointer-events: none;
                border: none;
            }
            .csc_cell:hover {
                background: #f3f3f3;
            }
        `;

        document.head.appendChild(elementStyle);
    };

    private initializeHtml = (): void => {
        const elementContainer: HTMLElement | null = document.querySelector(this.containerTag);

        if (!elementContainer) {
            helperSrc.writeLog("@cimo/schedule_calendar - Manager.ts - initializeHtml()", "Not found: 'elementContainer'!");

            return;
        }

        this.childrenStyle();

        elementContainer.innerHTML = `
            <div class="csc_wrapper">
                <div class="csc_toolbar">
                    <button class="csc_button csc_back" type="button">‹</button>
                    <div class="csc_title"></div>
                    <button class="csc_button csc_forward" type="button">›</button>
                    <select class="csc_year"></select>
                    <button class="csc_button csc_today" type="button">[#]</button>
                </div>
                <div class="csc_page">
                    <div class="csc_weekday"></div>
                    <div class="csc_day"></div>
                </div>
            </div>
        `;

        this.elementButtonBack = elementContainer.querySelector<HTMLButtonElement>(".csc_back");
        this.elementTitle = elementContainer.querySelector<HTMLDivElement>(".csc_title");
        this.elementButtonForward = elementContainer.querySelector<HTMLButtonElement>(".csc_forward");
        this.elementSelectYear = elementContainer.querySelector<HTMLSelectElement>(".csc_year");
        this.elementButtonToday = elementContainer.querySelector<HTMLButtonElement>(".csc_today");
        this.elementWeekday = elementContainer.querySelector<HTMLDivElement>(".csc_weekday");
        this.elementDay = elementContainer.querySelector<HTMLDivElement>(".csc_day");

        if (!this.elementSelectYear || !this.elementSelectYear) {
            helperSrc.writeLog("@cimo/schedule_calendar - Manager.ts - initializeHtml()", "Not found: 'elementSelectYear' or 'elementSelectYear'!");

            return;
        }

        this.elementSelectYear.value = this.yearCurrent.toString();

        for (let a = this.yearMax; a >= this.yearMin; a--) {
            const elementOption = document.createElement("option");

            elementOption.value = a.toString();
            elementOption.textContent = a.toString();

            this.elementSelectYear.appendChild(elementOption);
        }
    };

    private render = (): void => {
        if (
            !this.elementButtonBack ||
            !this.elementTitle ||
            !this.elementButtonForward ||
            !this.elementSelectYear ||
            !this.elementButtonToday ||
            !this.elementWeekday ||
            !this.elementDay
        ) {
            helperSrc.writeLog("@cimo/schedule_calendar - Manager.ts - render()", "Not found: render element!");

            return;
        }

        if (this.callbackCurrent) {
            this.callbackCurrent(this.yearCurrent, this.monthCurrent);
        }

        this.elementTitle.textContent = new Intl.DateTimeFormat(this.locale, { month: "long", year: "numeric" }).format(
            new Date(this.yearCurrent, this.monthCurrent, 1)
        );

        this.elementWeekday.innerHTML = "";
        this.elementDay.innerHTML = "";

        const dayFirst = new Date(this.yearCurrent, this.monthCurrent, 1).getDay();
        const dayTotal = new Date(this.yearCurrent, this.monthCurrent + 1, 0).getDate();
        const offset = this.option.isStartOnMonday ? (dayFirst === 0 ? 6 : dayFirst - 1) : dayFirst;

        if (offset === 1) {
            this.weekdayList = this.weekdayList.slice(6).concat(this.weekdayList.slice(0, 6));
        }

        for (const weekday of this.weekdayList) {
            const elementDiv = document.createElement("div");

            elementDiv.className = "csc_weekday_label";
            elementDiv.textContent = weekday;

            this.elementWeekday.appendChild(elementDiv);
        }

        for (let a = 0; a < 42; a++) {
            const elementDiv = document.createElement("div");

            elementDiv.className = "csc_cell";

            const day = a - offset + 1;

            if (day > 0 && day <= dayTotal) {
                elementDiv.innerHTML = `<p>${day}</p>`;

                if (
                    this.option.isHighlightToday &&
                    day === this.date.getDate() &&
                    this.yearCurrent === this.date.getFullYear() &&
                    this.monthCurrent === this.date.getMonth()
                ) {
                    elementDiv.classList.add("csc_today");
                }

                if (this.callbackCell) {
                    this.callbackCell(elementDiv, day);
                }
            } else {
                if (a % 7 === 0 && day > dayTotal) {
                    break;
                }

                elementDiv.classList.add("csc_empty");
                elementDiv.textContent = "";
            }

            this.elementDay.appendChild(elementDiv);
        }

        this.elementButtonBack.disabled = this.yearCurrent === this.yearMin && this.monthCurrent === 0;
        this.elementButtonForward.disabled = this.yearCurrent === this.yearMax && this.monthCurrent === 11;

        this.elementSelectYear.value = this.yearCurrent.toString();
    };

    private event = (): void => {
        if (!this.elementButtonBack || !this.elementButtonForward || !this.elementSelectYear || !this.elementButtonToday) {
            helperSrc.writeLog(
                "@cimo/schedule_calendar - Manager.ts - event()",
                "Not found: 'elementButtonBack' or 'elementButtonForward' or 'elementSelectYear' or 'elementButtonToday'!"
            );

            return;
        }

        this.elementButtonBack.addEventListener("click", () => {
            if (this.yearCurrent === this.yearMin && this.monthCurrent === 0) {
                return;
            }

            if (this.monthCurrent === 0) {
                this.monthCurrent = 11;

                this.yearCurrent--;
            } else {
                this.monthCurrent--;
            }

            this.render();
        });

        this.elementButtonForward.addEventListener("click", () => {
            if (this.yearCurrent === this.yearMax && this.monthCurrent === 11) {
                return;
            }

            if (this.monthCurrent === 11) {
                this.monthCurrent = 0;

                this.yearCurrent++;
            } else {
                this.monthCurrent++;
            }

            this.render();
        });

        this.elementSelectYear.addEventListener("change", (event: Event) => {
            const target = event.target as HTMLSelectElement;
            const targetValue = Number(target.value);

            this.yearCurrent = targetValue;

            this.render();
        });

        this.elementButtonToday.addEventListener("click", () => {
            this.date = new Date();

            this.yearCurrent = this.date.getFullYear();
            this.monthCurrent = this.date.getMonth();

            this.render();
        });
    };

    constructor(optionValue: model.Ioption, containerTagValue: string) {
        this.option = optionValue;
        this.containerTag = containerTagValue;

        this.locale = "ja-JP";
        this.weekdayList = [];

        this.date = new Date();
        this.yearMin = this.date.getFullYear() - this.option.yearBack;
        this.yearMax = this.date.getFullYear() + this.option.yearForward;
        this.yearCurrent = this.date.getFullYear();
        this.monthCurrent = this.date.getMonth();

        this.elementButtonBack = null;
        this.elementTitle = null;
        this.elementButtonForward = null;
        this.elementSelectYear = null;
        this.elementButtonToday = null;
        this.elementWeekday = null;
        this.elementDay = null;
    }

    callbackCurrent?: (year: number, month: number) => void;
    callbackCell?: (elementDiv: HTMLDivElement, dayNumber: number) => void;

    setLocale = (value: string): void => {
        this.locale = value;
    };

    setWeekdayList = (value: string[]): void => {
        this.weekdayList = value;
    };

    create = (): void => {
        this.initializeHtml();

        this.render();

        this.event();
    };

    update = (): void => {
        this.render();

        this.event();
    };
}
