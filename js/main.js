// 定义浅色和深色两组颜色
const LIGHT_COLORS = ['#E48897','#FBDD79','#EDA0AD','#D7CED7','#C1C5E3','#83C0E5','#9CE0DA','#9FD6A0','#B4D58D','#E0E8F0','#FFC0CD','#C9EBDA','#55BB8A','#A8E4CA','#DCE4A7','#FBCDAE','#A7A7DA'];
const DARK_COLORS = ['#000000']; // 修改为纯黑色

// 随机背景色
function setRandomBackground(theme = 'light') {
    if (theme === 'dark') {
        document.body.style.backgroundColor = DARK_COLORS[0];
    } else {
        const randomColor = LIGHT_COLORS[Math.floor(Math.random() * LIGHT_COLORS.length)];
        document.body.style.backgroundColor = randomColor;
    }
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
const noteTitleInput = document.getElementById('note-title-input');
const dateInput = document.getElementById('reminder-date');
const timeInput = document.getElementById('reminder-time');
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
        const now = new Date();
        const notes = JSON.parse(localStorage.getItem('notes')) || [];
        const formattedTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        
        notes.push({ 
            title: noteTitle, 
            text: noteText, 
            time: formattedTime,
            completed: false,
            reminder: `${dateInput.value} ${timeInput.value}`
            });
        // 获取当前时间并格式化为 YYYY-MM-DD HH:mm:ss
        const today = new Date(Date.now() - 86400000);
        today.setHours(23, 59, 59, 999);
        // 优化排序逻辑：未过期按时间排序，过期置后
        notes.sort((a, b) => {
            const aDate = new Date(a.reminder);
            const bDate = new Date(b.reminder);
            const aExpired = aDate < today;
            const bExpired = bDate < today;

            if (aExpired && !bExpired) return 1;
            if (!aExpired && bExpired) return -1;
            return aDate - bDate;
        });
        localStorage.setItem('notes', JSON.stringify(notes));
        loadNotes();
        noteInput.value = ''; // 清空输入框
        noteTitleInput.value = ''; // 清空标题输入框
        noteModal.style.display = 'none'; // 关闭模态框
        // 新增刷新页面功能
        window.location.reload();
        
    }
});

// 获取"更多"按钮
const showMoreBtn = document.getElementById('show-more-btn');

// 从本地存储加载便签
function loadNotes() {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    // 获取当前时间并格式化为 YYYY-MM-DD HH:mm:ss
    const now = new Date(Date.now() - 86400000);
    now.setHours(23, 59, 59, 999);
    // 优化排序逻辑：未过期按时间排序，过期置后
    notes.sort((a, b) => {
        const aDate = new Date(a.reminder);
        const bDate = new Date(b.reminder);
        const aExpired = aDate < now;
        const bExpired = bDate < now;

        if (aExpired && !bExpired) return 1;
        if (!aExpired && bExpired) return -1;
        return aDate - bDate;
    });
    scheduleContent.innerHTML = '';
    notes.forEach((note, index) => {
        const noteItem = document.createElement('div');
        const noteDate = new Date(note.reminder);
        noteDate.setHours(0, 0, 0, 0); // 保持提醒日期的0点
        const today = new Date(Date.now() - 86400000);
        today.setHours(23, 59, 59, 999);
        const isExpired = noteDate < today;
        noteItem.className = `schedule-item ${isExpired ? 'expired' : ''}`;
        noteItem.innerHTML = `
            <div class="schedule-time">${note.reminder}</div>
            <div>
                <div><strong>${new Date(note.reminder) < today ? '' : `<input type="checkbox" ${note.completed ? 'checked' : ''} class="note-checkbox" data-index="${index}">`}${note.title}</strong>: <span class="note-text ${note.completed ? 'completed' : ''}" title="${note.text}">${note.text.substring(0,25)}</span></div>
            </div>
            <button class="delete-note-btn" data-index="${index}"><img data-index="${index}" class="delete-note-btn" src="images/close.png" alt="关闭" /></button>
        `;
        scheduleContent.appendChild(noteItem);
    });

    // 控制"更多"按钮的显示
    if (notes.length > 3) {
        const items = document.querySelectorAll('.schedule-item');
        items.forEach((item, index) => {
            if (index >= 3) {
                item.style.display = 'none'; // 隐藏多余的便签
            }
        });
        showMoreBtn.style.display = 'block'; // 显示"更多"按钮
    } else {
        showMoreBtn.style.display = 'none'; // 隐藏"更多"按钮
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
    } else {
        console.error('获取天气数据失败:', data);
    }
}

// 主题切换功能
function initThemeToggle() {
    const themeToggleBtn = document.querySelector('.theme-toggle');
    const themeIcon = themeToggleBtn.querySelector('i');
    const themeText = themeToggleBtn.querySelector('span');
    
    // 从localStorage获取保存的主题
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
    setRandomBackground(savedTheme); // 设置对应主题的背景色
    
    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeButton(newTheme);
        setRandomBackground(newTheme); // 切换主题时更新背景色
    });
}

function updateThemeButton(theme) {
    const themeIcon = document.querySelector('.theme-toggle i');
    const themeText = document.querySelector('.theme-toggle span');
    
    if (theme === 'dark') {
        themeIcon.className = 'fas fa-moon';
        themeText.textContent = '切换亮色';
    } else {
        themeIcon.className = 'fas fa-sun';
        themeText.textContent = '切换暗色';
    }
}

// 监听存储变化
window.addEventListener('storage', () => loadNotes());

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setRandomBackground(savedTheme); // 使用保存的主题初始化背景色
    updateClock();
    setInterval(updateClock, 1000);
    loadNotes();
    updateHolidayCountdown();
    fetchWeather(); // 获取天气数据
    setInterval(updateHolidayCountdown, 86400000); // 每天更新一次
    initThemeToggle(); // 初始化主题切换功能
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

// 处理动态 GIF 图片的鼠标事件
const dynamicGif = document.getElementById('dynamic-gif');
const tooltip = document.querySelector('.tooltip');
let isClicked = false;

// 每日提示语
const dailyMessages = {
    1: [ // 周一
        "周一：灵魂还在周末，身体已在工位。",
        "周一的我：重启失败，进入低电量模式。",
        "周一早上，我和床的爱情故事又上演了生离死别。",
        "今天的心情和闹钟一样，响得让人崩溃。",
        "周一：我以为我起得早，结果是闹钟起得早。"
    ],
    2: [ // 周二
        "周二：周一的续集，但依然没有彩蛋。",
        "周二的我：已经上班一天了，怎么才周二？",
        "周二：距离周末还有四天，但我的耐心只有两天。",
        "周二：离周末还很远，但离崩溃很近。",
        "周二的我，像极了被生活榨干的柠檬。",
        "周二：努力假装自己是个积极向上的打工人。"
    ],
    3: [ // 周三
        "周三：一周的分水岭，前不着村后不着店。",
        "周三的我：一半是火焰，一半是海水。",
        "周三：恭喜你，已经熬过了一半，但另一半还在等你。",
        "周三：一周的中间，人生的低谷。",
        "周三：前不着村，后不着店，只能硬着头皮往前走。",
        "周三的我，已经忘了周末长什么样了。"
    ],
    4: [ // 周四
        "周四：假装周五，骗自己快解脱了。",
        "周四的我：已经开始计划周末的躺平姿势。",
        "周四：距离周末只有一步之遥，但这一步好远。",
        "周四：假装自己还能撑到周五。",
        "周四：距离周末还有24小时，但感觉像24年。",
        "周四：身体在上班，灵魂在摸鱼。"
    ],
    5: [ // 周五
        "周五：打工人的曙光，快乐的起点！",
        "周五的我：表面认真工作，内心已经在蹦迪。",
        "周五：今天的努力，是为了明天的不努力。",
        "周五：终于看到了一丝曙光，虽然微弱但足够让我撑下去。",
        "周五：表面淡定，内心已经在蹦迪。",
        "周五：今天的我，是周末的预备选手。"
    ],
    6: [ // 周六
        "周六：睡到自然醒，躺到自然饿。",
        "周六的我：终于可以忘记周一到周五的烦恼。",
        "周六：今天不努力，明天也不努力，快乐加倍！"
    ],
    0: [ // 周日
        "周日：快乐倒计时，焦虑加载中。",
        "周日的我：一边享受自由，一边为周一默哀。",
        "周日：明天是周一，但今天的我还是无敌的！"
    ]
};

// 获取当天的随机一条消息
function getDailyMessage() {
    const day = new Date().getDay(); // 获取当前是星期几（0-6）
    const messages = dailyMessages[day];
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
}

// 鼠标悬停事件
dynamicGif.addEventListener('mouseenter', () => {
    if (!isClicked) {
        dynamicGif.src = 'images/IMG_4386.gif';
    }
    // 显示提示框
    tooltip.textContent = getDailyMessage();
    tooltip.style.display = 'block';
});

// 鼠标离开事件
dynamicGif.addEventListener('mouseleave', () => {
    if (!isClicked) {
        dynamicGif.src = 'images/IMG_4388.gif';
    }
    // 隐藏提示框
    tooltip.style.display = 'none';
});

// 鼠标点击事件
dynamicGif.addEventListener('click', () => {
    if (!isClicked) {
        dynamicGif.src = 'images/IMG_4387.gif';
        isClicked = true;
    } else {
        dynamicGif.src = 'images/IMG_4388.gif';
        isClicked = false;
    }
});

/**
 * 获取本地日期的 ISO 格式字符串，将日期转换为本地时间的 ISO 格式并分割日期和时间部分。
 * @param {Date} date - 要转换的日期对象。
 * @returns {Array<string>} - 包含本地日期和时间的数组，索引 0 为日期，索引 1 为时间。
 */
function getLocalISODate(date) {
    // 计算时区偏移量（分钟）转换为毫秒
    const offset = date.getTimezoneOffset() * 60000; 
    // 通过减去时区偏移量来修正日期，得到本地时间
    const adjustedDate = new Date(date - offset);    
    // 将修正后的日期转换为 ISO 格式字符串，并按 'T' 分割，返回包含日期和时间的数组
    return adjustedDate.toISOString().split('T'); 
}
// 监听 DOM 内容加载完成事件
window.addEventListener('DOMContentLoaded', () => {
    // 调用 getLocalISODate 函数获取当前日期的本地 ISO 格式字符串数组
    const dateStr = getLocalISODate(new Date());
    // 在控制台打印获取到的日期字符串数组
    console.log(dateStr)

    // 将日期部分设置到 id 为 'reminder-date' 的输入框中
    document.getElementById('reminder-date').value = dateStr[0];
    // 将默认时间 '00:00' 设置到 id 为 'reminder-time' 的输入框中
    document.getElementById('reminder-time').value = '00:00';
});

// 添加复选框事件监听
scheduleContent.addEventListener('change', (e) => {
    if (e.target.classList.contains('note-checkbox')) {
        const index = e.target.dataset.index;
        const notes = JSON.parse(localStorage.getItem('notes')) || [];
        notes[index].completed = e.target.checked;
        localStorage.setItem('notes', JSON.stringify(notes));
        console.log(notes,e.target.checked,e.target.dataset.index)
        // e.target.nextElementSibling.classList.toggle('completed');
        // 新增刷新页面功能
        // window.location.reload();
    }
});