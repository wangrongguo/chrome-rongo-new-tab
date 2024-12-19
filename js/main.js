const COLORS = ['#E48897','#FBDD79','#EDA0AD','#D7CED7','#C1C5E3','#83C0E5','#9CE0DA','#9FD6A0','#B4D58D','#E0E8F0','#FFC0CD','#C9EBDA','#55BB8A','#A8E4CA','#DCE4A7','#FBCDAE','#A7A7DA'];

// 随机背景色
function setRandomBackground() {
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    document.body.style.backgroundColor = randomColor;
}

// 更新时钟
function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('zh-CN', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    const clockElement = document.querySelector('.clock');
    const dateElement = document.querySelector('.date-text');
    
    if (clockElement) {
        clockElement.textContent = timeString;
    }
    
    if (dateElement) {
        const dateString = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日星期${['日','一','二','三','四','五','六'][now.getDay()]}`;
        dateElement.textContent = dateString;
    }
}

// 获取便签内容的 DOM 元素
const scheduleContent = document.getElementById('schedule-content');
const noteInput = document.getElementById('note-input');
const noteTitleInput = document.getElementById('note-title-input'); // 新增标题输入框
const addNoteBtn = document.getElementById('add-note-btn');

// 获取模态框和相关元素
const noteModal = document.getElementById('note-modal');
const closeModal = document.querySelector('.close');
const saveNoteBtn = document.getElementById('save-note-btn');
const cancelNoteBtn = document.getElementById('cancel-note-btn'); // 新增取消按钮

// 显示模态框
addNoteBtn.addEventListener('click', () => {
    noteModal.style.display = 'block';
});

// 关闭模态框
closeModal.addEventListener('click', () => {
    noteModal.style.display = 'none';
});

// 取消按钮
cancelNoteBtn.addEventListener('click', () => {
    noteModal.style.display = 'none';
});

// 保存便签
saveNoteBtn.addEventListener('click', () => {
    const noteText = noteInput.value.trim();
    const noteTitle = noteTitleInput.value.trim(); // 获取标题
    if (noteText && noteTitle) {
        const notes = JSON.parse(localStorage.getItem('notes')) || [];
        
        // 获取当前时间并格式化为 YYYY-MM-DD HH:mm:ss
        const now = new Date();
        const formattedTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        
        notes.push({ title: noteTitle, text: noteText, time: formattedTime });
        localStorage.setItem('notes', JSON.stringify(notes));
        loadNotes();
        noteInput.value = ''; // 清空输入框
        noteTitleInput.value = ''; // 清空标题输入框
        noteModal.style.display = 'none'; // 关闭模态框
    }
});

// 获取“更多”按钮
const showMoreBtn = document.getElementById('show-more-btn');

// 从本地存储加载便签
function loadNotes() {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    scheduleContent.innerHTML = '';
    notes.forEach((note, index) => {
        const noteItem = document.createElement('div');
        noteItem.className = 'schedule-item';
        noteItem.innerHTML = `
            <div class="schedule-time">${note.time}</div>
            <div><strong>${note.title}</strong>: <span class="note-text" title="${note.text}">${note.text.length > 25 ? note.text.substring(0, 25) + '...' : note.text}</span></div>
            <button class="delete-note-btn" data-index="${index}"><img class="delete-note-btn" src="images/close.png" alt="关闭" style="width: 20px; height: 20px;" /></button>
        `;
        scheduleContent.appendChild(noteItem);
    });

    // 控制“更多”按钮的显示
    if (notes.length > 3) {
        const items = document.querySelectorAll('.schedule-item');
        items.forEach((item, index) => {
            if (index >= 3) {
                item.style.display = 'none'; // 隐藏多余的便签
            }
        });
        showMoreBtn.style.display = 'block'; // 显示“更多”按钮
    } else {
        showMoreBtn.style.display = 'none'; // 隐藏“更多”按钮
    }
}

// 删除便签
scheduleContent.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-note-btn')) {
        const index = e.target.getAttribute('data-index');
        const notes = JSON.parse(localStorage.getItem('notes')) || [];
        if (confirm('确定要删除这个便签吗？')) {
            notes.splice(index, 1);
            localStorage.setItem('notes', JSON.stringify(notes));
            loadNotes();
        }
    }
});

// 显示更多便签
let isExpanded = false; // 用于跟踪当前状态

showMoreBtn.addEventListener('click', () => {
    const items = document.querySelectorAll('.schedule-item');
    if (isExpanded) {
        items.forEach((item, index) => {
            if (index >= 3) {
                item.style.display = 'none'; // 隐藏多余的便签
            }
        });
        showMoreBtn.textContent = '展开'; // 更改按钮文本
    } else {
        items.forEach(item => {
            item.style.display = 'block'; // 显示所有便签
        });
        showMoreBtn.textContent = '收起'; // 更改按钮文本
    }
    isExpanded = !isExpanded; // 切换状态
});

// 获取天气数据
async function fetchWeather() {
    const response = await fetch('https://devapi.qweather.com/v7/weather/7d?location=101010100&key=a09a9fa8494440839cdc4c824b6e002d');
    const data = await response.json();
    
    if (data.code === '200') {
        const todayWeather = data.daily[0]; // 获取今天的天气数据
        document.getElementById('weather-date').innerText = `日期: ${todayWeather.fxDate}`;
        document.getElementById('weather-description').innerText = `天气: ${todayWeather.textDay}`;
        document.getElementById('weather-temperature').innerText = `温度: ${todayWeather.tempMax}°C / ${todayWeather.tempMin}°C`;
        document.getElementById('weather-humidity').innerText = `湿度: ${todayWeather.humidity}%`;
        document.getElementById('weather-wind').innerText = `风速: ${todayWeather.windSpeedDay} km/h`;
    } else {
        console.error('获取天气数据失败:', data);
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    setRandomBackground();
    updateClock();
    setInterval(updateClock, 1000);
    loadNotes();
    updateHolidayCountdown();
    fetchWeather(); // 获取天气数据
    setInterval(updateHolidayCountdown, 86400000); // 每天更新一次
});

function updateHolidayCountdown() {
    const today = new Date();
    let currentYear = today.getFullYear();
    //所有节假日
    const holidays = [
        { name: '元旦', date: new Date(currentYear + (new Date(currentYear, 0, 1) < today ? 1 : 0), 0, 1) },
        { name: '春节', date: getLunarFestivalDate(currentYear + (getLunarFestivalDate(currentYear, '春节') < today ? 1 : 0), '春节') },
        { name: '清明节', date: getLunarFestivalDate(currentYear + (getLunarFestivalDate(currentYear, '清明节') < today ? 1 : 0), '清明节') },
        { name: '劳动节', date: new Date(currentYear + (new Date(currentYear, 4, 1) < today ? 1 : 0), 4, 1) },
        { name: '端午节', date: getLunarFestivalDate(currentYear + (getLunarFestivalDate(currentYear, '端午节') < today ? 1 : 0), '端午节') },
        { name: '中秋节', date: getLunarFestivalDate(currentYear + (getLunarFestivalDate(currentYear, '中秋节') < today ? 1 : 0), '中秋节') },
        { name: '国庆节', date: new Date(currentYear + (new Date(currentYear, 9, 1) < today ? 1 : 0), 9, 1) }
    ];

    //节假日排序
    holidays.sort((a, b) => (a.date - today) - (b.date - today));
    //取最近的两个
    const nextHolidays = holidays.filter(holiday => holiday.date >= today).slice(0, 2);
    console.log(nextHolidays,holidays)
    
    

    // 计算距离2025年元旦
    let newYear = new Date(currentYear, 0, 1); // 2025年元旦
    let daysUntilNewYear = Math.ceil((newYear - today) / (1000 * 60 * 60 * 24));
    if (daysUntilNewYear < 0) {
        currentYear += 1; // 如果元旦已经过去，年份加1
        newYear = new Date(currentYear, 0, 1); // 重新获取元旦的日期
        daysUntilNewYear = Math.ceil((newYear - today) / (1000 * 60 * 60 * 24));
    }
    document.getElementById('new-year-count').innerText = `距离${currentYear}年元旦还有 ${daysUntilNewYear} 天`;
    if (nextHolidays.some(holiday => holiday.name === '元旦')) {
        document.getElementById('new-year-card').style.display = 'flex'; // 显示元旦卡片
    }
    currentYear = today.getFullYear();

    // 计算距离2025年春节
    let springFestival = getLunarFestivalDate(currentYear, '春节'); // 获取春节的准确日期
    if (springFestival < today) {
        currentYear += 1; // 如果春节已经过去，年份加1
        springFestival = getLunarFestivalDate(currentYear, '春节'); // 重新获取春节的日期
    }
    const daysUntilSpringFestival = Math.ceil((springFestival - today) / (1000 * 60 * 60 * 24));
    document.getElementById('spring-festival-count').innerText = `距离${currentYear}年春节还有 ${daysUntilSpringFestival} 天`;
    if (nextHolidays.some(holiday => holiday.name === '春节')) {
        document.getElementById('spring-festival-card').style.display = 'flex'; // 显示春节卡片
    }
    currentYear = today.getFullYear();

    // 计算距离清明节
    let qingmingFestival = getLunarFestivalDate(currentYear, '清明节'); // 获取清明节的准确日期
    if (qingmingFestival < today) {
        currentYear += 1; // 如果清明节已经过去，年份加1
        qingmingFestival = getLunarFestivalDate(currentYear, '清明节'); // 重新获取清明节的日期
    }
    const daysUntilQingming = Math.ceil((qingmingFestival - today) / (1000 * 60 * 60 * 24));
    document.getElementById('qingming-festival-count').innerText = `距离${currentYear}年清明节还有 ${daysUntilQingming} 天`;
    if (nextHolidays.some(holiday => holiday.name === '清明节')) {
        document.getElementById('qingming-festival-card').style.display = 'flex'; // 显示清明节卡片
    }
    currentYear = today.getFullYear();

    // 计算距离劳动节
    let laborDay = new Date(currentYear, 4, 1); // 劳动节（5月1日）
    let daysUntilLaborDay = Math.ceil((laborDay - today) / (1000 * 60 * 60 * 24));
    if(daysUntilLaborDay < 0){
        currentYear +=1;
        laborDay = new Date(currentYear, 4, 1); // 劳动节（5月1日）
        daysUntilLaborDay = Math.ceil((laborDay - today) / (1000 * 60 * 60 * 24));
    }
    document.getElementById('labor-day-count').innerText = `距离${currentYear}年劳动节还有 ${daysUntilLaborDay} 天`;
    if (nextHolidays.some(holiday => holiday.name === '劳动节')) {
        document.getElementById('labor-day-card').style.display = 'flex'; // 显示劳动节卡片
    }
    currentYear = today.getFullYear();

    // 计算距离端午节
    let duanwuFestival = getLunarFestivalDate(currentYear, '端午节'); // 获取端午节的准确日期
    if (duanwuFestival < today) {
        currentYear += 1; // 如果端午节已经过去，年份加1
        duanwuFestival = getLunarFestivalDate(currentYear, '端午节'); // 重新获取端午节的日期
    }
    const daysUntilDuanwu = Math.ceil((duanwuFestival - today) / (1000 * 60 * 60 * 24));
    document.getElementById('duanwu-festival-count').innerText = `距离${currentYear}年端午节还有 ${daysUntilDuanwu} 天`;
    if (nextHolidays.some(holiday => holiday.name === '端午节')) {
        document.getElementById('duanwu-festival-card').style.display = 'flex'; // 显示端午节卡片
    }
    currentYear = today.getFullYear();

    // 计算距离中秋节
    let midAutumnFestival = getLunarFestivalDate(currentYear, '中秋节'); // 获取中秋节的准确日期
    if (midAutumnFestival < today) {
        currentYear += 1; // 如果中秋节已经过去，年份加1
        midAutumnFestival = getLunarFestivalDate(currentYear, '中秋节'); // 重新获取中秋节的日期
    }
    const daysUntilMidAutumn = Math.ceil((midAutumnFestival - today) / (1000 * 60 * 60 * 24));
    document.getElementById('mid-autumn-festival-count').innerText = `距离${currentYear}年中秋节还有 ${daysUntilMidAutumn} 天`;
    if (nextHolidays.some(holiday => holiday.name === '中秋节')) {
        document.getElementById('mid-autumn-festival-card').style.display = 'flex'; // 显示中秋节卡片
    }
    currentYear = today.getFullYear();

    // 计算距离国庆节
    let nationalDay = new Date(currentYear, 9, 1); // 国庆节（10月1日）
    let daysUntilNationalDay = Math.ceil((nationalDay - today) / (1000 * 60 * 60 * 24));
    if(daysUntilNationalDay < 0){
        currentYear +=1;
        nationalDay = new Date(currentYear, 9, 1); // 国庆节（10月1日）
        daysUntilNationalDay = Math.ceil((nationalDay - today) / (1000 * 60 * 60 * 24));
    }
    document.getElementById('national-day-count').innerText = `距离${currentYear}年国庆节还有 ${daysUntilNationalDay} 天`;
    if (nextHolidays.some(holiday => holiday.name === '国庆节')) {
        document.getElementById('national-day-card').style.display = 'flex'; // 显示国庆节卡片
    }
}

// 获取农历节日的准确日期
function getLunarFestivalDate(year, festival) {
    let lunarDate;
    switch (festival) {
        case '春节':
            lunarDate = chineseLunar.lunarToSolar(year, 1, 1); // 农历正月初一
            break;
        case '清明节':
            lunarDate = new Date(year, 3, 4); // 清明节通常在阳历4月4日或5日
            break;
        case '端午节':
            lunarDate = chineseLunar.lunarToSolar(year, 5, 5); // 农历五月初五
            break;
        case '中秋节':
            lunarDate = chineseLunar.lunarToSolar(year, 8, 15); // 农历八月十五
            break;
        default:
            lunarDate = null;
    }
    return lunarDate; // 返回公历日期
} 