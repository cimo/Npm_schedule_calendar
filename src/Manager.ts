// Source
import * as model from "./Model";

export default class Manager {
    private option: model.Ioption;
    private containerTag: string;

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
    private elementWeekday: HTMLDivElement | null;
    private elementDay: HTMLDivElement | null;

    private childrenStyle = (): void => {
        const elementStyle = document.createElement("style");

        elementStyle.className = "csc_style";
        /*elementStyle.textContent = `
            .cal-wrapper { inline-size: 360px; }
            .cal-toolbar { display: flex; align-items: center; gap: 8px; margin-block-end: 8px; }
            .cal-title   { flex: 1; font-weight: 600; text-transform: capitalize; }
            .cal-nav     { border: 1px solid #c7c7c7; background: #fff; padding: 4px 8px; border-radius: 6px; cursor: pointer; }
            .cal-nav:disabled { opacity: 0.5; cursor: not-allowed; }
            .cal-year    { border: 1px solid #c7c7c7; padding: 4px 8px; border-radius: 6px; }
            .cal-grid    { display: block; }
            .cal-weekdays, .cal-days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
            .cal-weekday { text-align: center; font-weight: 600; color: #444; padding: 6px 0; }
            .cal-cell    { aspect-ratio: 1; display: flex; align-items: center; justify-content: center;
                            border-radius: 8px; font-weight: 500; color: #222; }
            .cal-cell:hover { background: #f3f3f3; }
            .cal-cell.today { outline: 2px solid #0078D4; background: #E5F1FB; font-weight: 700; }
            .cal-cell.empty { color: transparent; pointer-events: none; }
        `;*/

        document.head.appendChild(elementStyle);
    }

    private initializeHtml = (): void => {
        const elementContainer: HTMLElement | null = document.querySelector(this.containerTag);

        if (!elementContainer) {
            return;
        }

        this.childrenStyle();

        elementContainer.innerHTML = `
            <div class="csc_wrapper">
                <div class="csc_toolbar">
                    <button class="csc_button csc_back" type="button">‹</button>
                    <div class="csc_title"></div>
                    <button class="csc_button csc_forward" type="button">›</button>
                    <label class="csc_year_label">
                        <select class="csc_year"></select>
                    </label>
                </div>
                <div class="csc_page">
                    <div class="csc_weekday"></div>
                    <div class="csc_day"></div>
                </div>
            </div>
        `;

        this.elementButtonBack = elementContainer.querySelector<HTMLButtonElement>(".prev");
        this.elementTitle = elementContainer.querySelector<HTMLDivElement>(".cal-title");
        this.elementButtonForward = elementContainer.querySelector<HTMLButtonElement>(".next");
        this.elementSelectYear = elementContainer.querySelector<HTMLSelectElement>(".cal-year");
        this.elementWeekday = elementContainer.querySelector<HTMLDivElement>(".cal-weekdays");
        this.elementDay = elementContainer.querySelector<HTMLDivElement>(".cal-days");

        if (!this.elementSelectYear || !this.elementSelectYear) {
            return;
        }

        this.elementSelectYear.value = this.yearCurrent.toString();

        for (let a = this.yearMax; a >= this.yearMin; a--) {
            const elementOption = document.createElement("option");

            elementOption.value = a.toString();
            elementOption.textContent = a.toString();

            this.elementSelectYear.appendChild(elementOption);
        }
    }

    private render = (): void => {
        if (!this.elementButtonBack || !this.elementTitle || !this.elementButtonForward || !this.elementSelectYear || !this.elementWeekday || !this.elementDay) {
            return;
        }

        if (this.taskList) {
            this.taskList(this.yearCurrent, this.monthCurrent);
        }

        this.elementTitle.textContent = new Intl.DateTimeFormat(this.option.locale, { month: "long", year: "numeric" }).format(new Date(this.yearCurrent, this.monthCurrent, 1));

        this.elementWeekday.innerHTML = "";
        this.elementDay.innerHTML = "";

        const dayFirst = new Date(this.yearCurrent, this.monthCurrent, 1).getDay();
        const dayTotal = new Date(this.yearCurrent, this.monthCurrent + 1, 0).getDate();
        const offset = this.option.isStartOnMonday ? (dayFirst === 0 ? 6 : dayFirst - 1) : dayFirst;

        this.weekdayList = offset === 0 ? this.weekdayList.slice(offset).concat(this.weekdayList.slice(0, offset)) : this.weekdayList.slice();

        for (const weekdayLabel of this.weekdayList) {
            const elementDiv = document.createElement("div");

            elementDiv.className = "csc_weekday";
            elementDiv.textContent = weekdayLabel;

            this.elementWeekday.appendChild(elementDiv);
        }

        for (let a = 0; a < 42; a++) {
            const elementDiv = document.createElement("div");

            elementDiv.className = "csc_cell";

            const dayNumber = a - offset + 1;

            if (dayNumber > 0 && dayNumber <= dayTotal) {
                elementDiv.innerHTML = `<p>${dayNumber}</p>`;
                /*elementDiv.setAttribute(
                    "aria-label",
                    new Intl.DateTimeFormat(this.option.locale, { day: "numeric", month: "long", year: "numeric" }).format(
                        new Date(this.yearCurrent, this.monthCurrent, dayNumber)
                    )
                );*/

                if (this.option.isHighlightToday && dayNumber === this.date.getDate() && this.monthCurrent === this.date.getMonth() && this.yearCurrent === this.date.getFullYear()) {
                    elementDiv.classList.add("csc_today");
                }

                if (this.taskButton) {
                    this.taskButton(elementDiv, dayNumber);
                }
            } else {
                if (a % 7 === 0 && dayNumber > dayTotal) {
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
    }

    private event = (): void => {
        if (!this.elementButtonBack || !this.elementButtonForward || !this.elementSelectYear) {
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
    }
    
    constructor(optionValue: model.Ioption, containerTagValue: string) {
        this.option = optionValue;
        this.containerTag = containerTagValue;
        
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
        this.elementWeekday = null;
        this.elementDay = null;

        this.initializeHtml();

        this.render();

        this.event();
    }

    setWeekdayList = (value: string[]) => {
        this.weekdayList = value;
    }

    taskList: ((year: number, month: number) => void) | null = null;
    taskButton: ((elementDiv: HTMLDivElement, dayNumber: number) => void) | null = null;
}