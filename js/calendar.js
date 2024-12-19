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
        
        const months = Array.from({length: 12}, (_, i) => i + 1);
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

                    calendarHTML += `
                        <div class="calendar-day ${holidayClass}${isToday ? ' today' : ''}${isWeekend ? ' weekend' : ''}">
                            <span class="solar-date">${dayNumber}</span>
                            <span class="lunar-date">${festival || solarTerm || chineseLunar.format(lunar,'D') || '无农历'}</span> <!-- 优先显示节假日名称 -->
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
        const terms = [
            '小寒', '大寒', '立春', '雨水', '惊蛰', '春分', '清明', '谷雨',
            '立夏', '小满', '芒种', '夏至', '小暑', '大暑', '立秋', '处暑',
            '白露', '秋分', '寒露', '霜降', '立冬', '小雪', '大雪', '冬至'
        ];
        const month = date.getMonth();
        const day = date.getDate();
        
        // 更准确的节气判断，使用固定的节气日期
        const termDates = [
            new Date(date.getFullYear(), 0, 5),   // 小寒
            new Date(date.getFullYear(), 0, 20),  // 大寒
            new Date(date.getFullYear(), 1, 5),   // 立春
            new Date(date.getFullYear(), 1, 20),  // 雨水
            new Date(date.getFullYear(), 2, 5),   // 惊蛰
            new Date(date.getFullYear(), 2, 20),  // 春分
            new Date(date.getFullYear(), 3, 5),   // 清明
            new Date(date.getFullYear(), 3, 20),  // 谷雨
            new Date(date.getFullYear(), 4, 5),   // 立夏
            new Date(date.getFullYear(), 4, 20),  // 小满
            new Date(date.getFullYear(), 5, 5),   // 芒种
            new Date(date.getFullYear(), 5, 21),  // 夏至
            new Date(date.getFullYear(), 6, 7),   // 小暑
            new Date(date.getFullYear(), 6, 22),  // 大暑
            new Date(date.getFullYear(), 7, 7),   // 立秋
            new Date(date.getFullYear(), 7, 22),  // 处暑
            new Date(date.getFullYear(), 8, 7),   // 白露
            new Date(date.getFullYear(), 8, 22),  // 秋分
            new Date(date.getFullYear(), 9, 8),   // 寒露
            new Date(date.getFullYear(), 9, 23),  // 霜降
            new Date(date.getFullYear(), 10, 7),  // 立冬
            new Date(date.getFullYear(), 10, 22), // 小雪
            new Date(date.getFullYear(), 11, 7),  // 大雪
            new Date(date.getFullYear(), 11, 21)  // 冬至
        ];

        const currentDate = new Date(date.getFullYear(), month, day);
        for (let i = 0; i < termDates.length; i++) {
            if (currentDate.getTime() === termDates[i].getTime()) {
                return terms[i];
            }
        }
        return null;
    }
}

// 初始化日历
document.addEventListener('DOMContentLoaded', () => {
    new Calendar();
});