class Calendar {
    constructor() {
        this.currentDate = new Date();
        this.calendarContainer = document.querySelector('.calendar');
        this.monthSelect = document.querySelector('.calendar-dropdown:nth-child(2)');
        this.yearSelect = document.querySelector('.calendar-dropdown:first-child');
        this.prevBtn = document.querySelector('.prev-month');
        this.nextBtn = document.querySelector('.next-month');
        this.todayBtn = document.querySelector('.today-btn');

        this.initializeControls();
        this.bindEvents();
        this.renderCalendar();
    }

    initializeControls() {
        const currentYear = this.currentDate.getFullYear();
        const yearSelectHTML = [];

        // 生成从1900年到2099年的选项
        for (let year = 1900; year <= 2099; year++) {
            yearSelectHTML.push(`<option value="${year}" ${currentYear === year ? 'selected' : ''}>${year}年</option>`);
        }

        this.yearSelect.innerHTML = yearSelectHTML.join('');

        const months = Array.from({ length: 12 }, (_, i) => i + 1);
        this.monthSelect.innerHTML = months.map(month =>
            `<option value="${month}" ${this.currentDate.getMonth() + 1 === month ? 'selected' : ''}>${month}月</option>`
        ).join('');
    }

    bindEvents() {
        this.prevBtn.addEventListener('click', () => this.changeMonth(-1)); // 上个月
        this.nextBtn.addEventListener('click', () => this.changeMonth(1)); // 下个月
        this.todayBtn.addEventListener('click', () => this.goToToday()); // 今天按钮
        this.monthSelect.addEventListener('change', () => this.updateCalendar());
        this.yearSelect.addEventListener('change', () => this.updateCalendar());
    }

    changeMonth(delta) {
        this.currentDate.setMonth(this.currentDate.getMonth() + delta);

        // 更新下拉框的值
        this.monthSelect.value = this.currentDate.getMonth() + 1; // 设置为当前月份
        this.yearSelect.value = this.currentDate.getFullYear(); // 设置为当前年份

        // 重新渲染日历
        this.updateCalendar();
    }

    goToToday() {
        this.currentDate = new Date(); // 设置为当前日期
        this.monthSelect.value = this.currentDate.getMonth() + 1; // 更新下拉框的月份
        this.yearSelect.value = this.currentDate.getFullYear(); // 更新下拉框的年份
        this.updateCalendar(); // 更新日历
    }

    updateCalendar() {
        const selectedMonth = parseInt(this.monthSelect.value) - 1; // 获取下拉框的月份
        const selectedYear = parseInt(this.yearSelect.value); // 获取下拉框的年份
        if (!isNaN(selectedMonth) && !isNaN(selectedYear)) {
            this.currentDate.setFullYear(selectedYear);
            this.currentDate.setMonth(selectedMonth);
        }
        this.renderCalendar(); // 重新渲染日历
    }

    // 显示日期详情弹窗
    showDateDetail(date, element) {
        const lunar = chineseLunar.solarToLunar(date);
        const notes = JSON.parse(localStorage.getItem('notes') || '[]')
            .map((note, count) => ({ ...note, count }))
            .filter(note => {
                const noteDate = new Date(note.reminder);
                return noteDate.getFullYear() === date.getFullYear() &&
                    noteDate.getMonth() === date.getMonth() &&
                    noteDate.getDate() === date.getDate();
            });
        console.log(notes); // 打印出所有的便签记录，用于调试和检查问题
        const today = new Date(Date.now() - 86400000);
        today.setHours(23, 59, 59, 999);

        const detailHtml = `
        <div class="date-detail">
            <h3>${date.toLocaleDateString('zh-CN')}</h3>
            <p>农历：${chineseLunar.format(lunar, 'M')}${element.querySelector('.lunar-date').textContent}</p>
            <p>星期：${['日', '一', '二', '三', '四', '五', '六'][date.getDay()]}</p>
            ${notes.length ? `
                <div class="notes-section">
                    <h4>便签记录：</h4>
                    ${notes.map((note, index) => `
                        <div class="note-item">
                            ${new Date(note.reminder) < today ? '' : `<label class="checkbox-container">
                                <input type="checkbox" ${note.completed ? 'checked' : ''} class="note-checkbox" data-count="${note.count}">
                                <span class="checkmark"></span>
                            </label>`}
                            <strong class="${note.completed ? 'completed' : ''}">${note.title || '无标题'}</strong>
                            <p class="note-content ${note.completed ? 'completed' : ''}">${note.text || '无内容'}</p>
                        </div>
                    `).join('')}
                </div>
            ` : '<p>当日无便签记录</p>'}
        </div>
    `;

        element.insertAdjacentHTML('beforeend', detailHtml);
        setTimeout(() => element.querySelector('.date-detail').remove(), 2000); // 延长弹窗显示时间到5秒


    }

    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDay = firstDay.getDay() || 7; // 将周日的0改为7
        const totalDays = lastDay.getDate();

        let calendarHTML = this.getWeekdayHeaders();
        let dayCount = 1;
        let rows = Math.ceil((totalDays + startDay - 1) / 7);

        for (let i = 0; i < rows; i++) {
            for (let j = 1; j <= 7; j++) {
                const dayNumber = i * 7 + j - startDay + 1;
                if (dayNumber > 0 && dayNumber <= totalDays) {
                    const date = new Date(year, month, dayNumber);
                    const lunar = chineseLunar.solarToLunar(date); // 引用lib/chinese-lunar.min.js文件进行农历转换

                    // 获取节假日名称
                    const festival = this.getFestival(lunar.month, lunar.day);
                    // 获取节气名称
                    const solarTerm = this.getSolarTerm(date);
                    const isToday = this.isToday(date);
                    const isWeekend = j > 5;

                    // 添加节假日样式
                    const holidayClass = (festival || solarTerm) ? 'holiday' : '';

                    // 检查是否存在提醒事项
                    const hasReminder = JSON.parse(localStorage.getItem('notes') || '[]').some(note => {
                        const reminderDate = new Date(note.reminder);
                        return reminderDate.getFullYear() === date.getFullYear() &&
                            reminderDate.getMonth() === date.getMonth() &&
                            reminderDate.getDate() === date.getDate();
                    });

                    calendarHTML += `
                        <div class="calendar-day ${holidayClass}${isToday ? ' today' : ''}${isWeekend ? ' weekend' : ''}">
                            ${hasReminder ? '<span class="reminder-marker">有</span>' : ''}
                            <span class="solar-date">${dayNumber}</span>
                            <span class="lunar-date">${festival || solarTerm || chineseLunar.format(lunar, 'D') || '无农历'}</span>
                        </div>
                    `;
                } else {
                    calendarHTML += '<div class="calendar-day other-month"></div>';
                }
            }
        }

        this.calendarContainer.innerHTML = calendarHTML;
    }

    getWeekdayHeaders() {
        const weekdays = ['一', '二', '三', '四', '五', '六', '日'];
        return weekdays.map((day, index) =>
            `<div class="weekday-header${index > 4 ? ' weekend' : ''}">${day}</div>`
        ).join('');
    }

    isToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    }

    // 获取节假日名称
    getFestival(month, day) {
        const festivals = {
            '1-1': '春节',
            '1-15': '元宵节',
            '5-5': '端午节',
            '7-7': '七夕节',
            '8-15': '中秋节',
            '9-9': '重阳节',
            '12-8': '腊八节'
        };
        const key = `${month}-${day}`;
        return festivals[key] || null; // 返回节假日名称或 null
    }

    // 获取节气名称
    getSolarTerm(date) {
        const solarTerms = [
            { name: '小寒', month: 0, c: 3.87 },
            { name: '大寒', month: 0, c: 18.73 },
            { name: '立春', month: 1, c: 3.87 },
            { name: '雨水', month: 1, c: 18.73 },
            { name: '惊蛰', month: 2, c: 5.63 },
            { name: '春分', month: 2, c: 20.64 },
            { name: '清明', month: 3, c: 4.81 },
            { name: '谷雨', month: 3, c: 20.07 },
            { name: '立夏', month: 4, c: 5.52 },
            { name: '小满', month: 4, c: 21.04 },
            { name: '芒种', month: 5, c: 5.678 },
            { name: '夏至', month: 5, c: 21.37 },
            { name: '小暑', month: 6, c: 7.108 },
            { name: '大暑', month: 6, c: 22.83 },
            { name: '立秋', month: 7, c: 7.5 },
            { name: '处暑', month: 7, c: 23.13 },
            { name: '白露', month: 8, c: 7.62 },
            { name: '秋分', month: 8, c: 23.17 },
            { name: '寒露', month: 9, c: 8.32 },
            { name: '霜降', month: 9, c: 23.42 },
            { name: '立冬', month: 10, c: 7.32 },
            { name: '小雪', month: 10, c: 22.28 },
            { name: '大雪', month: 11, c: 7.18 },
            { name: '冬至', month: 11, c: 21.94 }
        ];

        const year = date.getFullYear();
        const y = year % 100; // 取年份后两位
        const l = Math.floor(y / 4); // 闰年修正值

        // 计算当前日期是否匹配节气
        for (const term of solarTerms) {
            const d = 0.2422;
            // 计算公式 [Y×D+C]−L
            const day = Math.floor(y * d + term.c) - l;

            // 处理跨年节气（如小寒可能在上年12月）
            const termMonth = term.month;
            const termYear = termMonth < date.getMonth() ? year - 1 : year;

            if (date.getMonth() === termMonth && date.getDate() === day) {
                return term.name;
            }
        }

        // 创建当前循环日期对象
        // 参数说明：
        // 1. date.getFullYear() - 取自当前处理的日期年份
        // 2. date.getMonth() - 取自当前处理的日期月份（0-11）
        // 3. dayNumber - 当前处理的当月日期数字（1-31）
        // 用途：生成用于节气匹配的日期实例
        // 后续逻辑：将遍历预定义节气列表，匹配月份和日期是否相符
        return null;
    }
}

// 初始化日历
document.addEventListener('DOMContentLoaded', () => {
    const calendar = new Calendar();

    calendar.calendarContainer.addEventListener('click', (e) => {
        if (e.target.matches('.note-checkbox')) {
            const index = e.target.dataset.count;
            const notes = JSON.parse(localStorage.getItem('notes')) || [];
            notes[index].completed = e.target.checked;
            localStorage.setItem('notes', JSON.stringify(notes));
            window.dispatchEvent(new Event('storage'));
        }
        const dayElement = e.target.closest('.calendar-day');
        if (dayElement && !dayElement.classList.contains('other-month')) {
            const date = new Date(calendar.currentDate);
            date.setDate(parseInt(dayElement.querySelector('.solar-date').textContent));
            calendar.showDateDetail(date, dayElement);
        }
    });
});