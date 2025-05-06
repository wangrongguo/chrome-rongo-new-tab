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
    const noteTitle = noteTitleInput.value.trim(); // 获取标题
    if (!noteTitle) {
        // 显示错误提示
        showNotification('请输入标题！', 'error');
        return; // 阻止保存操作
    }
    let noteText = noteInput.value.trim();// 获取便签内容
    if (!noteText) {
        // 显示标题
        noteText = noteTitle; // 获取标题
    }
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
        // 显示成功提示
        showNotification('操作成功！', 'success');

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

        showConfirmDialog('确定要删除这个便签吗？',
            () => {
                // 确认操作的回调函数
                console.log('用户点击了确认');
                notes.splice(index, 1);
                localStorage.setItem('notes', JSON.stringify(notes));
                loadNotes();
                calendar.renderCalendar(); // 重新渲染日历
                checkShowMoreButtonStatus(); // 检查并更新 "更多" 按钮状态-保持内容的展开或关闭状态
                // 显示成功提示
                showNotification('操作成功！', 'success');
            },
            () => {
                // 取消操作的回调函数
                console.log('用户点击了取消');
            }
        );
        // if (confirm('确定要删除这个便签吗？')) {
        //     notes.splice(index, 1);
        //     localStorage.setItem('notes', JSON.stringify(notes));
        //     loadNotes();
        //     calendar.renderCalendar(); // 重新渲染日历
        //     checkShowMoreButtonStatus(); // 检查并更新 "更多" 按钮状态-保持内容的展开或关闭状态
        //     // 显示成功提示
        //     showNotification('操作成功！', 'success');
        // }
    }
});


// 初始化时监听 quick-title-buttons 容器的点击事件
document.addEventListener('DOMContentLoaded', () => {
    const quickTitleButtonsContainer = document.querySelector('.quick-title-buttons');
    if (quickTitleButtonsContainer) {
        quickTitleButtonsContainer.addEventListener('click', (event) => {
            // 检查点击的元素是否是按钮
            if (event.target.tagName === 'BUTTON') {
                const title = event.target.textContent;
                const noteTitleInput = document.getElementById('note-title-input');
                if (noteTitleInput) {
                    noteTitleInput.value = title;
                }
            }
        });
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

// 天气图标映射配置
const WEATHER_ICON_MAP = {
    '晴': 'fa-sun',
    '多云': 'fa-cloud',
    '少云': 'fa-smog',
    '阴': 'fa-smog',
    '小雨': 'fa-cloud-rain',
    '晴间多云': 'fa-cloud-sun',
    '阵雨': 'fa-poo-storm',
    '雷阵雨': 'fa-bolt',
    '雷阵雨伴有冰雹': 'fa-snowflake',
    '雨夹雪': 'fa-snowflake',
    '小雪': 'fa-snowflake'
};

/**
 * 更新天气信息
 * @param {Object} weatherData - 天气数据
 * @param {string} suffix - 元素ID后缀（用于区分今明两天）
 */
function updateWeatherInfo(weatherData, suffix = '') {
    // 更新天气信息
    document.getElementById(`weather-date${suffix}`).innerText = (suffix == '1' ? `明天/` : `今天/`) + `${weatherData.fxDate}`;
    document.getElementById(`weather-description${suffix}`).innerText = `${weatherData.textDay}`;
    document.getElementById(`weather-temperature${suffix}`).innerText = `${weatherData.tempMax}°C / ${weatherData.tempMin}°C`;
    document.getElementById(`weather-humidity${suffix}`).innerText = `湿度: ${weatherData.humidity}%`;
    document.getElementById(`weather-wind${suffix}`).innerText = `${weatherData.windDirDay}/${weatherData.windScaleDay}级`;


    // 更新天气图标
    const weatherIcon = document.getElementById(`weather-icon${suffix}`);
    // weatherIcon.className = 'fas weather-icon'; // 重置图标类
    weatherIcon.setAttribute('class', 'fas weather-icon');
    weatherIcon.classList.add(WEATHER_ICON_MAP[weatherData.textDay] || 'fa-umbrella');
}

/**
 * 获取天气数据
 */
async function fetchWeather() {
    try {
        const response = await fetch('https://devapi.qweather.com/v7/weather/7d?location=101010100&key=a09a9fa8494440839cdc4c824b6e002d');
        const data = await response.json();

        if (data.code === '200') {
            // 更新今天的天气信息
            updateWeatherInfo(data.daily[0]);
            // 更新明天的天气信息
            updateWeatherInfo(data.daily[1], '1');
        } else {
            console.error('获取天气数据失败:', data);
            showNotification('获取天气数据失败', 'error');
            document.querySelector('.weather-container').style.display = 'none';// 隐藏天气容器
        }
    } catch (error) {
        console.error('获取天气数据出错:', error);
        showNotification('获取天气数据出错', 'error');
        document.querySelector('.weather-container').style.display = 'none';// 隐藏天气容器
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
    initIndexJson(); // 初始化index.json
});

async function initIndexJson() {
    try {
        // 从 JSON 文件中读取每日提示语
        const response = await fetch('./index.json');
        console.log(response);
        let dailyMessages_ = await response.json();
        console.log(dailyMessages_);
        dailyMessages = dailyMessages_[0].weekly_cute_copies;
        console.log('dailyMessages', dailyMessages);
        //用户昵称
        // 用户昵称
        const personNicknameElement = document.getElementById('person_nickname');
        if (personNicknameElement) {
            personNicknameElement.textContent = dailyMessages_[0].person_nickname;
        }
        // 网站导航
        const navigationSites = dailyMessages_[0].navigation_sites;
        const navigationDiv = document.getElementById('navigation_sites');

        if (navigationDiv) {
            // 清空现有导航链接
            navigationDiv.innerHTML = '';

            // 遍历导航网站数据并创建链接元素
            navigationSites.forEach(site => {
                const link = document.createElement('a');
                link.href = site.url;
                link.className = 'nav-item';
                link.target = '_blank';
                link.innerHTML = `
                    <span class="nav-icon">${site.name.charAt(0)}</span>
                    <span>${site.name}</span>
                `;
                navigationDiv.appendChild(link);
            });
        }

    } catch (error) {

    }
}

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
let dailyMessages = {};

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
    const holidayWorkJsonTextarea = document.getElementById('holiday-work-json');
    const indexJsonTextarea = document.getElementById('index-json');
    const saveButton = document.getElementById('save-button');
    const saveHolidayWorkButton = document.getElementById('save-holiday-work-button');
    const saveIndexkButton = document.getElementById('save-index-button');



    // 读取holidays.json文件
    fetch('../holidays.json')
        .then(response => response.json())
        .then(data => {
            holidayJsonTextarea.value = JSON.stringify(data, null, 2);
        });
    // 读取holidays.json文件
    fetch('../holiday-work.json')
        .then(response => response.json())
        .then(data => {
            holidayWorkJsonTextarea.value = JSON.stringify(data, null, 2);
        });
    // 读取index.json文件
    fetch('../index.json')
        .then(response => response.json())
        .then(data => {
            indexJsonTextarea.value = JSON.stringify(data, null, 2);
        });

    // 保存修改
    saveButton.addEventListener('click', () => {
        try {
            const newData = JSON.parse(holidayJsonTextarea.value);
            modalAll.style.display = 'block';
            // 使用FileSystem Access API保存数据到holidays.json
            try {
                // ... existing code ...
                (async () => {
                    try {
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
                        // 显示成功提示
                        showNotification('操作成功！', 'success');

                        modalAll.style.display = 'none';
                        // 新增刷新页面功能
                        window.location.reload();
                    } catch (error) {
                        if (error.name === 'AbortError') {
                            // 用户取消了保存操作，可选择记录日志或忽略
                            console.log('用户取消了文件保存操作');
                        } else {
                            // 处理其他错误
                            console.error('保存文件时发生错误:', error);
                        }
                        modalAll.style.display = 'none';
                        // 显示失败提示
                        showNotification('操作失败，请重试！', 'error');
                    }
                })();
                // ... existing code ...
            } catch (error) {
                if (error.name === 'AbortError') {
                    // 用户取消了保存操作
                    console.log('用户取消了保存操作');
                    return;
                } else {
                    console.error('保存文件时出错:', error);
                }
                modalAll.style.display = 'none';
                // 显示失败提示
                showNotification('操作失败，请重试！', 'error');
            }
        } catch (error) {
            modalAll.style.display = 'none';
            // 显示失败提示
            showNotification('JSON格式错误，请检查输入！', 'error');
        }
    });

    // 保存修改
    saveHolidayWorkButton.addEventListener('click', () => {
        try {
            const newData = JSON.parse(holidayWorkJsonTextarea.value);
            modalAll.style.display = 'block';
            // 使用FileSystem Access API保存数据到holidays.json
            try {
                (async () => {
                    try {
                        const handle = await window.showSaveFilePicker({
                            suggestedName: 'holiday-work.json',
                            types: [{
                                description: 'JSON 文件',
                                accept: { 'application/json': ['.json'] }
                            }]
                        });
                        const writable = await handle.createWritable();
                        await writable.write(JSON.stringify(newData, null, 2));
                        await writable.close();
                        console.log('保存的数据:', newData);
                        // 显示成功提示
                        showNotification('操作成功！', 'success');
                        modalAll.style.display = 'none';
                        // 新增刷新页面功能
                        window.location.reload();
                    } catch (error) {
                        if (error.name === 'AbortError') {
                            // 用户取消了保存操作，可选择记录日志或忽略
                            console.log('用户取消了文件保存操作');
                        } else {
                            // 处理其他错误
                            console.error('保存文件时发生错误:', error);
                        }
                        modalAll.style.display = 'none';
                        // 显示失败提示
                        showNotification('操作失败，请重试！', 'error');

                    }
                })();
            } catch (error) {
                console.error('保存文件时出错:', error);
                modalAll.style.display = 'none';
                // 显示失败提示
                showNotification('操作失败，请重试！', 'error');

            }
        } catch (error) {
            modalAll.style.display = 'none';
            // 显示失败提示
            showNotification('JSON格式错误，请检查输入！', 'error');

        }
    });

    //saveIndexkButton保持用户导航信息修改
    saveIndexkButton.addEventListener('click', () => {
        try {
            const newData = JSON.parse(indexJsonTextarea.value);
            modalAll.style.display = 'block';
            // 使用FileSystem Access API保存数据到holidays.json
            try {
                (async () => {
                    try {
                        const handle = await window.showSaveFilePicker({
                            suggestedName: 'index.json',
                            types: [{
                                description: 'JSON 文件',
                                accept: { 'application/json': ['.json'] }
                            }]
                        });
                        const writable = await handle.createWritable();
                        await writable.write(JSON.stringify(newData, null, 2));
                        await writable.close();
                        console.log('保存的数据:', newData);
                        // 显示成功提示
                        showNotification('操作成功！', 'success');
                        modalAll.style.display = 'none';
                        // 新增刷新页面功能
                        window.location.reload();
                    } catch (error) {
                        if (error.name === 'AbortError') {
                            // 用户取消了保存操作，可选择记录日志或忽略
                            console.log('用户取消了文件保存操作');
                        } else {
                            // 处理其他错误
                            console.error('保存文件时发生错误:', error);
                        }
                        modalAll.style.display = 'none';
                        // 显示失败提示
                        showNotification('操作失败，请重试！', 'error');

                    }
                })();
            } catch (error) {
                console.error('保存文件时出错:', error);
                modalAll.style.display = 'none';
                // 显示失败提示
                showNotification('操作失败，请重试！', 'error');

            }
        } catch (error) {
            modalAll.style.display = 'none';
            // 显示失败提示
            showNotification('JSON格式错误，请检查输入！', 'error');

        }
    });
});




// 获取设置按钮和编辑框
const settingsBtn = document.getElementById('settings-btn');//设置自定义节假日
const settingsHolidayWorkBtn = document.getElementById('settings-holiday-work-btn');//设置工作日调休
const settingsIndexBtn = document.getElementById('settings-index-btn');//设置主页导航昵称
const newspaperBtn = document.getElementById('newspaper-btn');// 新增资讯


// 关闭节假日编辑弹窗
const holidayEditor = document.getElementById('holiday-editor');
const holidayWorkEditor = document.getElementById('holiday-work-editor');
const indexEditor = document.getElementById('index-editor');
const newspaperDetails = document.getElementById('newspaper-details');



const modalOverlay = document.getElementById('modal-overlay');
const modalAll = document.getElementById('modal-all');

// 点击关闭按钮关闭编辑框
const holidayEditorClose = document.querySelector('#holiday-editor .close');
if (holidayEditorClose) {
    holidayEditorClose.addEventListener('click', () => {
        if (holidayEditor) {
            holidayEditor.style.display = 'none';
            modalOverlay.style.display = 'none';
        }
    });
}
// 点击关闭按钮关闭编辑框
const holidayWorkEditorClose = document.querySelector('#holiday-work-editor .close');
if (holidayEditorClose) {
    holidayEditorClose.addEventListener('click', () => {
        if (holidayEditor) {
            holidayEditor.style.display = 'none';
            modalOverlay.style.display = 'none';
        }
    });
}
// 点击关闭按钮关闭编辑框
const indexEditorClose = document.querySelector('#index-editor .close');
if (indexEditorClose) {
    indexEditorClose.addEventListener('click', () => {
        if (holidayEditor) {
            holidayEditor.style.display = 'none';
            modalOverlay.style.display = 'none';
        }
    });
}

// 点击关闭按钮关闭编辑框
const newspaperDetailsClose = document.querySelector('#newspaper-details .close');
if (newspaperDetailsClose) {
    newspaperDetailsClose.addEventListener('click', () => {
        if (newspaperDetails) {
            newspaperDetails.style.display = 'none';
            modalOverlay.style.display = 'none';
        }
    });
}

// 点击设置按钮弹出编辑框
settingsBtn.addEventListener('click', () => {
    holidayEditor.style.display = holidayEditor.style.display === 'none' ? 'block' : 'none';
    modalOverlay.style.display = modalOverlay.style.display === 'none' ? 'block' : 'none';
});
// 点击设置按钮弹出编辑框
settingsHolidayWorkBtn.addEventListener('click', () => {
    holidayWorkEditor.style.display = holidayEditor.style.display === 'none' ? 'block' : 'none';
    modalOverlay.style.display = modalOverlay.style.display === 'none' ? 'block' : 'none';
});
// 点击设置按钮弹出编辑框
settingsIndexBtn.addEventListener('click', () => {
    indexEditor.style.display = indexEditor.style.display === 'none' ? 'block' : 'none';
    modalOverlay.style.display = modalOverlay.style.display === 'none' ? 'block' : 'none';
});
// 点击设置按钮弹出编辑框
newspaperBtn.addEventListener('click', () => {
    newspaperDetails.style.display = newspaperDetails.style.display === 'none' ? 'block' : 'none';
    modalOverlay.style.display = modalOverlay.style.display === 'none' ? 'block' : 'none';
    //初始化
    getNewspaperDetail(0);
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


// 显示节假日编辑弹窗和遮罩
function showHolidayWorkEditor() {
    document.getElementById('modal-overlay').style.display = 'block';
    document.getElementById('holiday-work-editor').style.display = 'block';
}

// 隐藏节假日编辑弹窗和遮罩
function hideHolidayWorkEditor() {
    document.getElementById('modal-overlay').style.display = 'none';
    document.getElementById('holiday-work-editor').style.display = 'none';
}

// 假设保存按钮点击事件
const saveHolidayWorkButton = document.getElementById('save-holiday-work-button');
if (saveHolidayWorkButton) {
    saveHolidayWorkButton.addEventListener('click', hideHolidayWorkEditor);
}

// 假设关闭按钮点击事件
const closeHolidayWorkEditor = document.querySelector('#holiday-work-editor .close');
if (closeHolidayWorkEditor) {
    closeHolidayWorkEditor.addEventListener('click', hideHolidayWorkEditor);
}


// 显示节假日编辑弹窗和遮罩
function showIndexEditor() {
    document.getElementById('modal-overlay').style.display = 'block';
    document.getElementById('index-editor').style.display = 'block';
}

// 隐藏节假日编辑弹窗和遮罩
function hideIndexEditor() {
    document.getElementById('modal-overlay').style.display = 'none';
    document.getElementById('index-editor').style.display = 'none';
}

// 假设保存按钮点击事件
const saveIndexButton = document.getElementById('save-index-button');
if (saveIndexButton) {
    saveIndexButton.addEventListener('click', hideIndexEditor);
}

// 假设关闭按钮点击事件
const closeIndexEditor = document.querySelector('#index-editor .close');
if (closeIndexEditor) {
    closeIndexEditor.addEventListener('click', hideIndexEditor);
}

/**
 * 显示提示弹窗
 * @param {string} message - 提示信息
 * @param {string} type - 提示类型，'success' 或 'error'
 */
function showNotification(message, type) {
    const notification = document.getElementById('notification');
    const messageElement = document.getElementById('notification-message');

    // 设置提示信息和类型
    messageElement.textContent = message;
    notification.className = `notification ${type}`;

    // 添加显示类名，触发滑动动画
    notification.classList.add('show');
    notification.style.display = 'block';

    // 5 秒后移除显示类名，添加隐藏类名，触发渐变动画
    setTimeout(() => {
        notification.classList.remove('show');
        notification.classList.add('hide');

        // 动画结束后隐藏弹窗并移除隐藏类名
        setTimeout(() => {
            notification.style.display = 'none';
            notification.classList.remove('hide');
        }, 500);
    }, 5000);
}

// 全屏功能实现
document.querySelector('.fullscreen-toggle').addEventListener('click', function () {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error('全屏错误:', err);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
});
/**
 * 获取新闻详情数据并显示在页面上
 * 从多个新闻源API随机获取热点新闻列表
 */
function getNewspaperDetail(icount_url) {
    modalAll.style.display = 'block';
    // 新闻源API地址数组
    const vvhan_url = [
        'https://api.vvhan.com/api/hotlist/zhihuHot',
        'https://api.vvhan.com/api/hotlist/wbHot',
        'https://api.vvhan.com/api/hotlist/toutiao',
        'https://api.vvhan.com/api/hotlist/pengPai',
        'https://api.vvhan.com/api/hotlist/huPu',
        'https://api.vvhan.com/api/hotlist/zhihuDay',
        'https://api.vvhan.com/api/hotlist/36Ke',
        'https://api.vvhan.com/api/hotlist/huXiu',
        'https://api.vvhan.com/api/hotlist/itNews',
        'https://api.vvhan.com/api/hotlist/woShiPm'
    ];

    // 新闻源对应的标题
    const vvhan_title = [
        '知乎', '微博', '头条', '澎湃', '虎扑',
        '知乎日报', '36Ke', '虎嗅', 'IT之家', '人人都是产品经理'
    ];

    try {
        // 随机选择一个新闻源
        // const icount_url = Math.floor(Math.random() * vvhan_url.length);

        fetch(vvhan_url[icount_url])
            .then(response => {
                if (!response.ok) {
                    throw new Error('网络响应不正常');
                }
                return response.json();
            })
            .then(data => {
                if (!data || !data.data) {
                    throw new Error('无效的API响应');
                }

                // 生成新闻列表HTML
                const weiboHtml = generateNewsHtml(data.data);

                // 更新DOM
                updateNewsDisplay(weiboHtml, icount_url);
            })
            .catch(error => {
                console.log('请求失败:', error);
                showNotification('获取新闻失败，请稍后重试', 'error');
            })
            .finally(() => {
                // element.classList.remove('layui-anim-rotate');
                // element.classList.remove('layui-anim-loop');
                modalAll.style.display = 'none';
            });
    } catch (error) {
        console.log('获取新闻数据时出错:', error);
        showNotification('获取新闻数据时出错', 'error');
    }
}

/**
 * 生成新闻列表HTML
 * @param {Array} newsData - 新闻数据数组
 * @returns {string} 生成的HTML字符串
 */
function generateNewsHtml(newsData) {
    return newsData.reduce((html, item) => {
        const truncatedTitle = item.title.length > 40
            ? item.title.slice(0, 40) + '...'
            : item.title;

        return html + `<div class="news-item">
            <span class="news-index">${item.index}.</span>
            <a class="news-link" title="${item.title}" 
               href="${item.url}" target="_blank">${truncatedTitle}</a>
        </div>`;
    }, '');
}

/**
 * 更新新闻显示区域
 * @param {string} html - 要显示的HTML内容
 * @param {string} title - 新闻源标题
 */
function updateNewsDisplay(html, title) {
    console.log(html, title);
    if (html) {
        const parsedTitle = parseInt(title, 10); // 将 title 转换为数字
        const newTitle = isNaN(parsedTitle) ? title : parsedTitle + 1; // 如果转换成功则加 1，否则保持原样
        const element = document.getElementById('tab' + newTitle);
        if (element) {
            element.innerHTML = html;
        } else {
            console.error('找不到ID为tab' + title + '的元素');
        }
    }
}

// 选项卡切换功能
document.addEventListener('DOMContentLoaded', function () {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 移除所有活动状态
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // 添加当前活动状态
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            const count = button.getAttribute('data-count');
            getNewspaperDetail(count);
            document.getElementById(tabId).classList.add('active');
        });
    });
});
