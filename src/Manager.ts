// Source
import * as model from "./Model";

export default class Manager {
    private elementButtonBack: HTMLButtonElement | null;
    private elementTitle: HTMLDivElement | null;
    private elementButtonForward: HTMLButtonElement | null;
    private elementSelectYear: HTMLSelectElement | null;
    private elementWeekday: HTMLDivElement | null;
    private elementDay: HTMLDivElement | null;

    private childrenStyle = (): void => {
        const elementStyle = document.createElement("style");

        elementStyle.className = "csc_style";
        elementStyle.textContent = `
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
        `;

        document.head.appendChild(elementStyle);
    }

    private initializeHtml = (elementContainer: HTMLElement): void => {
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
    }

    private render = (option: model.Ioption, currentYear: number, currentMonth: number): void => {
        if (!this.elementButtonBack || !this.elementTitle || !this.elementButtonForward || !this.elementSelectYear || !this.elementWeekday || !this.elementDay) {
            return;
        }

        if (this.callbackTaskList) {
            this.callbackTaskList(currentYear, currentMonth);
        }

        this.elementTitle.textContent = new Intl.DateTimeFormat(option.locale, { month: "long", year: "numeric" }).format(new Date(currentYear, currentMonth, 1));

        elementWeekday.innerHTML = "";
        elementDay.innerHTML = "";

        const firstDayJS = new Date(currentYear, currentMonth, 1).getDay();
        const offset = option.isStartOnMonday ? (firstDayJS === 0 ? 6 : firstDayJS - 1) : firstDayJS;
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const totalCells = 42;

        let weekdayLabelList: string[] = [];

        if (weekdayList) {
            weekdayLabelList = offset === 0 ? weekdayList.slice(offset).concat(weekdayList.slice(0, offset)) : weekdayList.slice();
        }

        for (const w of weekdayLabelList) {
            const div = document.createElement("div");
            div.className = "cal-weekday";
            div.textContent = w;
            elementWeekday.appendChild(div);
        }

        for (let i = 0; i < totalCells; i++) {
            const cell = document.createElement("div");
            cell.className = "cal-cell";
            const dayNum = i - offset + 1;

            if (dayNum > 0 && dayNum <= daysInMonth) {
                cell.innerHTML = `<p>${dayNum}</p>`;
                cell.setAttribute("role", "gridcell");
                cell.setAttribute(
                    "aria-label",
                    new Intl.DateTimeFormat(option.locale, { day: "numeric", month: "long", year: "numeric" }).format(
                        new Date(currentYear, currentMonth, dayNum)
                    )
                );

                if (option.isHighlightToday && dayNum === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
                    cell.classList.add("today");
                    cell.setAttribute("aria-current", "date");
                }

                if (this.callbackTaskButton) {
                    this.callbackTaskButton(cell, dayNum);
                }
            } else {
                if (i % 7 === 0 && dayNum > daysInMonth) {
                    break;
                }

                cell.classList.add("empty");
                cell.setAttribute("aria-hidden", "true");
                cell.textContent = "";
            }

            elementDay.appendChild(cell);
        }

        const atMin = currentYear === minYear && currentMonth === 0;
        const atMax = currentYear === maxYear && currentMonth === 11;

        elementButtonBack.disabled = atMin;
        elementButtonForward.disabled = atMax;

        elementSelectYear.value = String(currentYear);
    }

    private create = (
            option: model.Ioption,
            containerTag: string,
            weekdayList: string[] | undefined
        ): void => {
        const elementContainer: HTMLElement | null = document.querySelector(containerTag);

        if (!elementContainer) {
            return;
        }
        
        const today = new Date();
        const maxYear = today.getFullYear() + option.yearForward;
        const minYear = today.getFullYear() - option.yearBack;
        
        let currentYear = today.getFullYear();
        let currentMonth = today.getMonth();

        this.initializeHtml(elementContainer);

        for (let a = maxYear; a >= minYear; a--) {
            const elementOption = document.createElement("option");

            elementOption.value = a.toString();
            elementOption.textContent = a.toString();

            elementSelectYear.appendChild(elementOption);
        }

        elementSelectYear.value = currentYear.toString();

        elementButtonBack.addEventListener("click", () => {
            if (currentYear === minYear && currentMonth === 0) {
                return;
            }

            if (currentMonth === 0) {
                currentMonth = 11;

                currentYear--;
            } else {
                currentMonth--;
            }

            render(option);
        });

        elementButtonForward.addEventListener("click", () => {
            if (currentYear === maxYear && currentMonth === 11) {
                return;
            }

            if (currentMonth === 11) {
                currentMonth = 0;

                currentYear++;
            } else {
                currentMonth++;
            }

            render(option);
        });

        elementSelectYear.addEventListener("change", (e: Event) => {
            const sel = e.target as HTMLSelectElement;
            const y = Number(sel.value);

            if (!Number.isFinite(y)) return;
            currentYear = y;

            render(option);
        });

        render(option);
    };
    
    constructor() {
        this.elementButtonBack = null;
        this.elementTitle = null;
        this.elementButtonForward = null;
        this.elementSelectYear = null;
        this.elementWeekday = null;
        this.elementDay = null;
    }

    callbackTaskList: ((year: number, month: number) => void) | null = null;
    callbackTaskButton: ((elementCell: HTMLElement, day: number) => void) | null = null;
}