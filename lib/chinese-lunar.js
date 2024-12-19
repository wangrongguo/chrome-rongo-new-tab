// chinese-lunar.min.js
(function(global) {
    const lunarInfo = [
        0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2,
        0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977,
        0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970,
        0x06566,0x0d4a0,0x0ea50,0x06e95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950,
        0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557
    ];

    const Gan = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
    const Zhi = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
    const Animals = ["鼠","牛","虎","兔","龙","蛇","马","羊","猴","鸡","狗","猪"];
    const solarTerm = ["小寒","大寒","立春","雨水","惊蛰","春分","清明","谷雨","立夏","小满","芒种","夏至","小暑","大暑","立秋","处暑","白露","秋分","寒露","霜降","立冬","小雪","大雪","冬至"];
    const lunarNumber = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
    const lunarMonths = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];

    const festivals = {
        '1-1': '春节',
        '1-15': '元宵节',
        '5-5': '端午节',
        '7-7': '七夕节',
        '8-15': '中秋节',
        '9-9': '重阳节',
        '12-8': '腊八节'
    };

    function getLunarDayName(day) {
        if (day === 10) return '初十';
        if (day === 20) return '二十';
        if (day === 30) return '三十';

        const tens = Math.floor(day / 10);
        const ones = day % 10;

        if (tens === 0) return '初' + lunarNumber[ones - 1];
        if (tens === 1) return '十' + lunarNumber[ones - 1];
        if (tens === 2) return '廿' + lunarNumber[ones - 1];
        if (tens === 3) return '三十';
        return '';
    }

    function getLunarMonthName(month, isLeap) {
        return (isLeap ? '闰' : '') + lunarMonths[month - 1] + '月';
    }

    function getGanZhiYear(year) {
        const ganIndex = (year - 4) % 10;
        const zhiIndex = (year - 4) % 12;
        return Gan[ganIndex] + Zhi[zhiIndex];
    }

    function getZodiac(year) {
        return Animals[(year - 4) % 12];
    }

    function getFestival(month, day) {
        const key = month + '-' + day;
        return festivals[key];
    }

    const chineseLunar = {
        solarToLunar: function(date) {
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();

            console.log(year,month,day)

            // 计算与1900年1月31日相差的天数
            let offset = (Date.UTC(year, month - 1, day) - Date.UTC(1900, 0, 31)) / 86400000;

            // 计算农历年份
            let lunarYear = 1900;
            let yearDays = 0;
            for (; lunarYear < 2101 && offset > 0; lunarYear++) {
                yearDays = this.getLunarYearDays(lunarYear);
                offset -= yearDays;
            }
            if (offset < 0) {
                offset += yearDays;
                lunarYear--;
            }

            // 计算农历月份和日期
            let lunarMonth = 1;
            let isLeap = false;
            let monthDays;

            // 获取闰月
            const leapMonth = this.getLeapMonth(lunarYear);

            for (; lunarMonth <= 12 && offset > 0; lunarMonth++) {
                if (leapMonth > 0 && lunarMonth === leapMonth + 1 && !isLeap) {
                    --lunarMonth;
                    isLeap = true;
                    monthDays = this.getLeapDays(lunarYear);
                } else {
                    monthDays = this.getLunarMonthDays(lunarYear, lunarMonth);
                }

                if (isLeap && lunarMonth === leapMonth + 1) {
                    isLeap = false;
                }

                offset -= monthDays;
            }

            if (offset === 0 && leapMonth > 0 && lunarMonth === leapMonth + 1) {
                if (isLeap) {
                    isLeap = false;
                } else {
                    isLeap = true;
                    --lunarMonth;
                }
            }

            if (offset < 0) {
                offset += monthDays;
                --lunarMonth;
            }

            const lunarDay = offset + 1;

            // 获取节日
            const festival = getFestival(lunarMonth, lunarDay);
            const festivals = festival ? [festival] : [];

            return {
                lunarYear: lunarYear,
                lunarMonth: lunarMonth,
                lunarDay: lunarDay,
                isLeap: isLeap,
                lunarMonthName: getLunarMonthName(lunarMonth, isLeap),
                lunarDayName: getLunarDayName(lunarDay),
                gzYear: getGanZhiYear(lunarYear),
                zodiac: getZodiac(lunarYear),
                festivals: festivals,
                term: this.getTerm(date)
            };
        },

        getLunarYearDays: function(year) {
            let sum = 348;
            for (let i = 0x8000; i > 0x8; i >>= 1) {
                sum += (lunarInfo[year - 1900] & i) ? 1 : 0;
            }
            return sum + this.getLeapDays(year);
        },

        getLeapDays: function(year) {
            if (this.getLeapMonth(year)) {
                return (lunarInfo[year - 1900] & 0x10000) ? 30 : 29;
            }
            return 0;
        },

        getLeapMonth: function(year) {
            return lunarInfo[year - 1900] & 0xf;
        },

        getLunarMonthDays: function(year, month) {
            return (lunarInfo[year - 1900] & (0x10000 >> month)) ? 30 : 29;
        },

        getTerm: function(date) {
            const year = date.getFullYear();
            const month = date.getMonth();
            const day = date.getDate();

            // 简化的节气判断，实际应该使用更复杂的算法
            const termDays = [6, 20];  // 每月大约在6日和20日有节气
            if (termDays.includes(day)) {
                const termIndex = month * 2 + (day === 20 ? 1 : 0);
                return solarTerm[termIndex];
            }
            return null;
        }
    };

    // 导出到全局
    global.ChineseLunar = chineseLunar;
})(window); 