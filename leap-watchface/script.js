document.addEventListener('DOMContentLoaded', () => {
    const root = document.documentElement;
    root.style.setProperty('--step-number-color', 'rgba(255, 255, 255, 0.75)');
    root.style.setProperty('--step-icon-filter', 'invert(0)');

    const editBtn = document.querySelector('.edit-btn');
    const deleteBtn = document.querySelector('.delete-btn');
    const styleDots = document.querySelector('.style-dots');
    const editButtons = document.querySelector('.edit-buttons');
    const actionButtons = document.querySelector('.action-buttons');
    const doneBtn = document.querySelector('.done-btn');
    const watchFace = document.querySelector('.watch-face');
    const watchfaceName = document.querySelector('.watchface-name');

    const initialBatteryLevel = document.getElementById('batteryLevel').value;
    updateBatteryDisplay(initialBatteryLevel / 100, false);

    let currentStyle = 1;

    const STYLE_ASSETS = {
        1: {
            wallpaper: 'assets/style1/background.png',
            mask: 'assets/style1/mask.png',
            hours: 'assets/general/hours/',    // 时钟数字图片路径
            minutes: 'assets/general/minutes/' // 分钟数字图片路径
        },
        2: {
            wallpaper: 'assets/style2/background.png',
            mask: 'assets/style2/mask.png',
            hours: 'assets/general/hours/',
            minutes: 'assets/general/minutes/'
        },
        3: {
            wallpaper: 'assets/style3/background.png',
            mask: 'assets/style3/mask.png',
            hours: 'assets/general/hours/',
            minutes: 'assets/general/minutes/'
        },
        4: {
            wallpaper: 'assets/style4/background.png',
            mask: 'assets/style4/mask.png',
            hours: 'assets/general/hours/',
            minutes: 'assets/general/minutes/'
        },
        5: {
            wallpaper: 'assets/style5/background.png',
            mask: 'assets/style5/mask.png',
            hours: 'assets/general/hours/',
            minutes: 'assets/general/minutes/'
        },
        6: {
            wallpaper: 'assets/style6/background.png',
            mask: 'assets/style6/mask.png',
            hours: 'assets/style6/hours/',
            minutes: 'assets/style6/minutes/'
        }
    };
    const systemTimeCheckbox = document.getElementById('systemTime');
    const hourInput = document.getElementById('hourInput');
    const minuteInput = document.getElementById('minuteInput');
    const monthInput = document.getElementById('monthInput');
    const dayInput = document.getElementById('dayInput');
    const stepsInput = document.getElementById('stepsInput');

    const timeInputs = [hourInput, minuteInput, monthInput, dayInput];

    // Set initial state
    systemTimeCheckbox.checked = false;
    timeInputs.forEach(input => {
        input.disabled = false;
    });

    systemTimeCheckbox.addEventListener('change', () => {
        timeInputs.forEach(input => {
            input.disabled = systemTimeCheckbox.checked;
        });
        updateTime();
    });

    function updateTime() {
        let hours, minutes, month, day, steps;

        if (systemTimeCheckbox.checked) {
            const now = new Date();
            hours = String(now.getHours()).padStart(2, '0');
            minutes = String(now.getMinutes()).padStart(2, '0');
            month = String(now.getMonth() + 1).padStart(2, '0');
            day = String(now.getDate()).padStart(2, '0');
            steps = stepsInput.value; // Steps always use input value
        } else {
            hours = String(hourInput.value || '09').padStart(2, '0');
            minutes = String(minuteInput.value || '28').padStart(2, '0');
            month = String(monthInput.value || '08').padStart(2, '0');
            day = String(dayInput.value || '16').padStart(2, '0');
            steps = stepsInput.value || '2560';
        }

        const style = STYLE_ASSETS[currentStyle];
        const [hour1, hour2] = hours.split('');
        const [minute1, minute2] = minutes.split('');

        document.getElementById('hour1').style.backgroundImage = `url('${style.hours}${hour1}.png')`;
        document.getElementById('hour2').style.backgroundImage = `url('${style.hours}${hour2}.png')`;
        document.getElementById('minute1').style.backgroundImage = `url('${style.minutes}${minute1}.png')`;
        document.getElementById('minute2').style.backgroundImage = `url('${style.minutes}${minute2}.png')`;

        document.getElementById('date').innerHTML = `${month}<span class="slash">/</span>${day}`;
        document.getElementById('ampm').textContent = parseInt(hours) >= 12 ? '下午' : '上午';

        const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        const weekday = new Date(2024, parseInt(month) - 1, parseInt(day)).getDay();
        document.getElementById('weekday').textContent = weekdays[weekday];
    }

    timeInputs.forEach(input => {
        input.addEventListener('input', updateTime);
    });
    stepsInput.addEventListener('input', updateTime);
    function applyStyle(styleNumber) {
        const style = STYLE_ASSETS[styleNumber];
        const wallpaper = watchFace.querySelector('.wallpaper');
        const mask = watchFace.querySelector('.mask');

        wallpaper.style.backgroundImage = `url('${style.wallpaper}')`;
        mask.style.backgroundImage = `url('${style.mask}')`;

        // Add style-specific CSS variable changes
        if (styleNumber === '6') {
            document.documentElement.style.setProperty('--step-number-color', 'rgba(0, 0, 0, 0.75)');
            document.documentElement.style.setProperty('--step-icon-filter', 'invert(1)');
        } else {
            document.documentElement.style.setProperty('--step-number-color', 'rgba(255, 255, 255, 0.75)');
            document.documentElement.style.setProperty('--step-icon-filter', 'invert(0)');
        }

        currentStyle = styleNumber;

        console.log(styleNumber)

        updateTime();
    }

    let minimizeTimeout;
    let justMinimized = false;
    let pressAnimation = null;
    let isPressed = false;
    watchFace.addEventListener('mousedown', (e) => {
        if (!watchFace.classList.contains('minimized')) {
            isPressed = true;
            pressAnimation = document.createElement('div');
            pressAnimation.className = 'press-animation';

            // 获取容器的变换矩阵
            const container = document.querySelector('.container');
            const containerRect = container.getBoundingClientRect();

            // 计算点击位置相对于容器的坐标
            const x = e.clientX - containerRect.left;
            const y = e.clientY - containerRect.top + window.scrollY;

            pressAnimation.style.position = 'fixed';
            pressAnimation.style.left = `${e.clientX}px`;
            pressAnimation.style.top = `${e.clientY}px`;

            document.body.appendChild(pressAnimation);

            minimizeTimeout = setTimeout(() => {
                watchFace.classList.add('minimized');
                watchfaceName.classList.remove('hidden');
                actionButtons.classList.remove('hidden');
                justMinimized = true;

                pressAnimation.classList.add('fade-out');
                setTimeout(() => {
                    if (pressAnimation) {
                        pressAnimation.remove();
                        pressAnimation = null;
                    }
                }, 300);
            }, 1000);
        }
    });

    watchFace.addEventListener('mousemove', (e) => {
        if (isPressed && pressAnimation) {
            pressAnimation.style.left = e.pageX + 'px';
            pressAnimation.style.top = e.pageY + 'px';
        }
    });

    watchFace.addEventListener('mouseup', () => {
        isPressed = false;
        clearTimeout(minimizeTimeout);
        if (pressAnimation) {
            pressAnimation.remove();
            pressAnimation = null;
        }
        if (watchFace.classList.contains('minimized') && !justMinimized) {
            watchFace.classList.remove('minimized');
            watchfaceName.classList.add('hidden');
            actionButtons.classList.add('hidden');
            styleDots.classList.add('hidden');
            editButtons.classList.add('hidden');
        }
        justMinimized = false;
    });

    watchFace.addEventListener('mouseleave', () => {
        isPressed = false;
        clearTimeout(minimizeTimeout);
        if (pressAnimation) {
            pressAnimation.remove();
            pressAnimation = null;
        }
        justMinimized = false;
    });

    watchFace.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (!watchFace.classList.contains('minimized')) {
            minimizeTimeout = setTimeout(() => {
                watchFace.classList.add('minimized');
                watchfaceName.classList.remove('hidden');
                actionButtons.classList.remove('hidden');
                justMinimized = true;
            }, 1000);
        }
    });

    watchFace.addEventListener('touchend', (e) => {
        e.preventDefault();
        clearTimeout(minimizeTimeout);
        if (watchFace.classList.contains('minimized') && !justMinimized) {
            watchFace.classList.remove('minimized');
            watchfaceName.classList.add('hidden');
            actionButtons.classList.add('hidden');
            styleDots.classList.add('hidden');
            editButtons.classList.add('hidden');
        }
        justMinimized = false;
    });
    editBtn.addEventListener('click', () => {
        styleDots.classList.remove('hidden');
        editButtons.classList.remove('hidden');
        actionButtons.classList.add('hidden');
        watchfaceName.textContent = '颜色';
        watchFace.style.pointerEvents = 'none';
        watchFace.style.transform = 'scale(0.675)';
    });

    doneBtn.addEventListener('click', () => {
        styleDots.classList.add('hidden');
        editButtons.classList.add('hidden');
        actionButtons.classList.remove('hidden');
        previousStyle = currentStyle;
        watchFace.style.transform = '';
        watchFace.style.pointerEvents = 'auto';
        watchfaceName.textContent = '跃界';
    });

    deleteBtn.addEventListener('click', () => {
        if (confirm('确定要删除这个表盘吗？')) {
            document.querySelector('.watchface-wrapper').remove();
        }
    });

    document.querySelectorAll('.dot').forEach(dot => {
        dot.addEventListener('click', () => {
            // Remove selected class from all dots
            document.querySelectorAll('.dot').forEach(d => d.classList.remove('selected'));
            // Add selected class to clicked dot
            dot.classList.add('selected');

            const style = dot.dataset.style;
            currentStyle = style;
            applyStyle(style);
            watchfaceName.textContent = '颜色';
        });
    });

    updateTime();
    setInterval(updateTime, 1000);
    applyStyle(1);


    // 步数输入处理
    document.getElementById('stepsInput').addEventListener('input', function () {
        document.getElementById('step').textContent = this.value;
    });

    // 手动电池控制
    document.getElementById('batteryLevel').addEventListener('input', function () {
        const level = this.value;
        document.getElementById('batteryValue').textContent = level + '%';
        const isCharging = document.querySelector('input[name="charging"]:checked').value === 'charging';
        updateBatteryDisplay(level / 100, isCharging);
    });

    document.getElementsByName('charging').forEach(radio => {
        radio.addEventListener('change', function () {
            const level = document.getElementById('batteryLevel').value;
            updateBatteryDisplay(level / 100, this.value === 'charging');
        });
    });

    function updateBatteryDisplay(level, isCharging) {
        const batteryIcon = document.querySelector('.date-battery img');
        const batteryPercentage = Math.floor(level * 100);
        const batteryLevel = Math.floor(batteryPercentage / 10);
        const prefix = isCharging ? 'changing-' : '';
        batteryIcon.src = `./assets/battery/${prefix}${batteryLevel}.svg`;
    }

    // 定义默认值
    const defaultValues = {
        time: {
            hourInput: "9",
            minuteInput: "28",
            monthInput: "8",
            dayInput: "16",
            systemTime: false
        },
        battery: {
            batteryLevel: "80",
            charging: "normal"
        },
        health: {
            stepsInput: "2560"
        }
    };

    // 添加重置按钮事件监听
    const timeControl = document.getElementById('time-control');
    const batteryControl = document.getElementById('battery-control');
    const stepControl = document.getElementById('step-control');

    timeControl.querySelector('.reset-btn').addEventListener('click', () => {
        // 重置checkbox状态
        timeControl.querySelector('#systemTime').checked = defaultValues.time.systemTime;

        // 重置所有时间输入框的值
        timeControl.querySelector('#hourInput').value = defaultValues.time.hourInput;
        timeControl.querySelector('#minuteInput').value = defaultValues.time.minuteInput;
        timeControl.querySelector('#monthInput').value = defaultValues.time.monthInput;
        timeControl.querySelector('#dayInput').value = defaultValues.time.dayInput;

        // 启用所有时间输入框
        timeInputs.forEach(input => {
            input.disabled = false;
        });

        updateTime();
    });

    batteryControl.querySelector('.reset-btn').addEventListener('click', () => {
        batteryControl.querySelector('#batteryLevel').value = defaultValues.battery.batteryLevel;
        batteryControl.querySelector(`input[value="${defaultValues.battery.charging}"]`).checked = true;
        document.getElementById('batteryValue').textContent = defaultValues.battery.batteryLevel + '%';
        updateBatteryDisplay(defaultValues.battery.batteryLevel / 100, false);
    });

    stepControl.querySelector('.reset-btn').addEventListener('click', () => {
        stepControl.querySelector('#stepsInput').value = defaultValues.health.stepsInput;
        document.getElementById('step').textContent = defaultValues.health.stepsInput;
    });
});

const closeBtn = document.querySelector('#tips .close-btn')
const tipsContainer = document.getElementById('tips');
// const Container = document.querySelector('.container');

closeBtn.addEventListener('click', () => {
    tipsContainer.style.opacity = '0';
    document.documentElement.style.setProperty('--mobile-watch-top', '-164px');
    document.documentElement.style.setProperty('--mobile-watch-scale', '0.8');
    setTimeout(() => {
        tipsContainer.remove();
    }, 300); // Match this with CSS transition duration
});