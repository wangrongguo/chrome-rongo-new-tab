// 导入calendar模块
import { Calendar } from './calendar.js';
// 导入HolidayManager模块

// 初始化日历实例
const calendar = new Calendar();

// 定义浅色和深色两组颜色
const LIGHT_COLORS = ['#f8d86a', '#bacf65', '#b9dec9', '#5698c3', '#f9cb8b', '#dfecd5', '#E48897', '#FBDD79', '#EDA0AD', '#D7CED7', '#C1C5E3', '#83C0E5', '#9CE0DA', '#9FD6A0', '#B4D58D', '#E0E8F0', '#FFC0CD', '#C9EBDA', '#55BB8A', '#A8E4CA', '#DCE4A7', '#FBCDAE', '#A7A7DA', '#E4A7DA', '#f7f4ed', '#F5ECD7', '#ccccd6', '#a4cab6'];
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
/**
 * 判断 "show-more-btn" 按钮的状态并根据便签数量更新其显示状态。
 * 同时保持按钮的展开或关闭状态。
 * 当便签数量超过 3 条时显示按钮，否则隐藏。
 */
function checkShowMoreButtonStatus() {
    const showMoreBtn = document.getElementById('show-more-btn');
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    const isExpanded = showMoreBtn?.textContent === '收起'; // 判断当前是否为展开状态
    if (notes.length > 3) {
        showMoreBtn.style.display = 'block';

    } else {
        showMoreBtn.style.display = 'none';
    }
    // 保持之前的展开或关闭状态
    if (isExpanded) {
        showMoreBtn.textContent = '收起';
        const items = document.querySelectorAll('.schedule-item');
        items.forEach(item => {
            item.style.display = 'block'; // 展开状态显示所有便签
        });
    } else {
        showMoreBtn.textContent = '展开';
        const items = document.querySelectorAll('.schedule-item');
        items.forEach((item, index) => {
            if (index >= 3) {
                item.style.display = 'none'; // 非展开状态隐藏多余便签
            }
        });
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
        const dateString = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日星期${['日', '一', '二', '三', '四', '五', '六'][now.getDay()]}`;
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
        // window.location.reload();
        calendar.renderCalendar(); // 重新渲染日历
        checkShowMoreButtonStatus(); // 检查并更新 "更多" 按钮状态-保持内容的展开或关闭状态

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
                <div><strong>${new Date(note.reminder) < today ? '' : `<input type="checkbox" ${note.completed ? 'checked' : ''} class="rili-checkbox" data-index="${index}">`}${note.title}</strong>: <span class="note-text ${note.completed ? 'completed' : ''}" title="${note.text}">${note.text.substring(0, 25)}</span></div>
            </div>
            <button class="delete-note-btn" data-index="${index}"><img data-index="${index}" class="delete-note-btn" src="images/close.png" alt="关闭" /></button>
        `;
        scheduleContent.appendChild(noteItem);
    });

    // 控制"更多"按钮的显示
    checkShowMoreButtonStatus(); // 检查并更新 "更多" 按钮状态-保持内容的展开或关闭状态
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
            calendar.renderCalendar(); // 重新渲染日历
            checkShowMoreButtonStatus(); // 检查并更新 "更多" 按钮状态-保持内容的展开或关闭状态
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

async function updateHolidayCountdown() {
    const today = new Date();
    let currentYear = today.getFullYear();
    //所有节假日
    // 读取自定义节日数据
    let customHolidays = [];
    try {
        const response = await fetch('./holidays.json');
        customHolidays = await response.json();
    } catch (error) {
        console.error('读取自定义节日数据失败:', error);
    }

    // 转换自定义节日日期格式
    const processedCustom = customHolidays.map(holiday => {
        let date;
        if (holiday.type === 'lunar') {
            date = chineseLunar.lunarToSolar(currentYear, holiday.month, holiday.day)
            if (date < today) date.setFullYear(date.getFullYear() + 1);
            date = new Date(date);
        } else {
            date = new Date(currentYear, holiday.month - 1, holiday.day);
            if (date < today) date.setFullYear(date.getFullYear() + 1);
        }
        return {
            name: holiday.name,
            date: date,
            description: holiday._comment
        };
    });

    const holidays = [...processedCustom,
    { name: '元旦', date: new Date(currentYear + (new Date(currentYear, 0, 1) < today ? 1 : 0), 0, 1) },
    { name: '春节', date: getLunarFestivalDate(currentYear + (getLunarFestivalDate(currentYear, '春节') < today ? 1 : 0), '春节') },
    { name: '清明节', date: getLunarFestivalDate(currentYear + (getLunarFestivalDate(currentYear, '清明节') < today ? 1 : 0), '清明节') },
    { name: '劳动节', date: new Date(currentYear + (new Date(currentYear, 4, 1) < today ? 1 : 0), 4, 1) },
    { name: '端午节', date: getLunarFestivalDate(currentYear + (getLunarFestivalDate(currentYear, '端午节') < today ? 1 : 0), '端午节') },
    { name: '中秋节', date: getLunarFestivalDate(currentYear + (getLunarFestivalDate(currentYear, '中秋节') < today ? 1 : 0), '中秋节') },
    { name: '国庆节', date: new Date(currentYear + (new Date(currentYear, 9, 1) < today ? 1 : 0), 9, 1) }
    ];

    // 节假日排序
    holidays.sort((a, b) => a.date - b.date);

    // 添加日期有效性检查
    const validDates = holidays.filter(holiday => holiday.date instanceof Date && !isNaN(holiday.date));

    // 取最近的两个有效节假日
    const nextHolidays = validDates.filter(holiday => holiday.date >= today).slice(0, 2);

    console.log(nextHolidays, holidays);


    // 更新自定义节日卡片显示
    nextHolidays.forEach(holiday => {
        const cardId = `${holiday.name.replace(/[\s＀-￿]/g, '-')}-card`;
        const cardElement = document.getElementById(cardId) || createHolidayCard(holiday);
        cardElement.style.display = 'flex';
    });

    function createHolidayCard(holiday) {
        let container = document.querySelector('.holiday-cards-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'holiday-cards-container';
            const section = document.querySelector('.holiday-section');
            if (section) section.appendChild(container);
            else return;
        }


        const card = document.createElement('div');
        card.className = 'holiday-card';
        card.id = `${holiday.name.replace(/[\s＀-￿]/g, '-')}-card`;
        card.innerHTML = `
            <div class="holiday-icon">${holiday.description == undefined ? holiday.name.slice(0, 1) : '<img src="images/1.jpg" alt="" srcset="" style="width: 28px;height: 28px;border-radius: 6px;">'}</div>
            <div>
                <div class="holiday-info">${holiday.name}</div>
                <div id="new-year-count" class="holiday-info-mini">距离${holiday.date.getFullYear()}年${holiday.name}${holiday.description == undefined ? '' : holiday.description}还有 ${Math.ceil((holiday.date - today) / (1000 * 60 * 60 * 24))} 天</div>
            </div>
        `;
        container.appendChild(card);
        return card;
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
    if (e.target.classList.contains('rili-checkbox')) {
        const index = e.target.dataset.index;
        const notes = JSON.parse(localStorage.getItem('notes')) || [];
        notes[index].completed = e.target.checked;
        localStorage.setItem('notes', JSON.stringify(notes));
        console.log(notes, e.target.checked, e.target.dataset.index);
        if (e.target?.classList?.contains('rili-checkbox')) {
            notes[e.target.dataset.index].completed = e.target.checked;
            localStorage.setItem('notes', JSON.stringify(notes));
            e.target.closest('.schedule-item').querySelector('.note-text').classList.toggle('completed', e.target.checked);
        }
        e.target.nextElementSibling?.classList?.toggle('completed');
        // 新增刷新页面功能
        // window.location.reload();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const holidayJsonTextarea = document.getElementById('holiday-json');
    const saveButton = document.getElementById('save-button');

    // 读取holidays.json文件
    fetch('../holidays.json')
        .then(response => response.json())
        .then(data => {
            holidayJsonTextarea.value = JSON.stringify(data, null, 2);
        });

    // 保存修改
    saveButton.addEventListener('click', () => {
        try {
            const newData = JSON.parse(holidayJsonTextarea.value);
            modalAll.style.display = 'block';
            // 使用FileSystem Access API保存数据到holidays.json
            try {
                (async () => {
                    const handle = await window.showSaveFilePicker({
                        suggestedName: 'holidays.json',
                        types: [{
                            description: 'JSON 文件',
                            accept: { 'application/json': ['.json'] }
                        }]
                    });
                    const writable = await handle.createWritable();
                    await writable.write(JSON.stringify(newData, null, 2));
                    await writable.close();
                    console.log('保存的数据:', newData);
                    alert('保存成功');
                    modalAll.style.display = 'none';
                })();
            } catch (error) {
                console.error('保存文件时出错:', error);
                alert('保存失败，请重试');
            }
        } catch (error) {
            alert('JSON格式错误，请检查输入');
        }
    });
});




// 获取设置按钮和编辑框
const settingsBtn = document.getElementById('settings-btn');
// 关闭节假日编辑弹窗
const holidayEditor = document.getElementById('holiday-editor');
const modalOverlay = document.getElementById('modal-overlay');
const modalAll = document.getElementById('modal-all');


const holidayEditorClose = document.querySelector('#holiday-editor .close');
if (holidayEditorClose) {
    holidayEditorClose.addEventListener('click', () => {
        if (holidayEditor) {
            holidayEditor.style.display = 'none';
            modalOverlay.style.display = 'none';
        }
    });
}

// 点击设置按钮弹出编辑框
settingsBtn.addEventListener('click', () => {
    holidayEditor.style.display = holidayEditor.style.display === 'none' ? 'block' : 'none';
    modalOverlay.style.display = modalOverlay.style.display === 'none' ? 'block' : 'none';
});




// 显示节假日编辑弹窗和遮罩
function showHolidayEditor() {
    document.getElementById('modal-overlay').style.display = 'block';
    document.getElementById('holiday-editor').style.display = 'block';
}

// 隐藏节假日编辑弹窗和遮罩
function hideHolidayEditor() {
    document.getElementById('modal-overlay').style.display = 'none';
    document.getElementById('holiday-editor').style.display = 'none';
}

// 假设保存按钮点击事件
const saveButton = document.getElementById('save-button');
if (saveButton) {
    saveButton.addEventListener('click', hideHolidayEditor);
}

// 假设关闭按钮点击事件
const closeHolidayEditor = document.querySelector('#holiday-editor .close');
if (closeHolidayEditor) {
    closeHolidayEditor.addEventListener('click', hideHolidayEditor);
}



