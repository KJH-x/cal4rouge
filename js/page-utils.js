function getStateString() {
    let stateObj = {};
    const inputs = document.querySelectorAll('input, select, textarea, [type=checkbox], [type=radio]');
    inputs.forEach(input => {
        stateObj[input.id] = input.value || (input.checked ? 'True' : 'False');
    });
    const stateString = Object.keys(stateObj).map(key => `${key}=${stateObj[key]}`).join(';');
    const encodedState = btoa(stateString)
    document.getElementById('encodedState').textContent = encodedState
    return encodedState; // 使用base64编码
}

function updateState(encodedString) {
    try {
        const stateString = atob(encodedString); // 使用base64解码
        const stateObj = {};
        stateString.split(';').forEach(part => {
            const [key, value] = part.split('=');
            stateObj[key] = value;
        });
        Object.keys(stateObj).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'checkbox' || element.type === 'radio') {
                    element.checked = stateObj[key] === 'True';
                } else {
                    element.value = stateObj[key];
                }
            }
        });
    } catch (e) {
        console.error('Failed to decode state:', e);
    }
}

function copyState() {
    const encodedState = getStateString();
    document.getElementById('encodedState').textContent = encodedState;
    navigator.clipboard.writeText(encodedState).then(function () {
        alert('State copied to clipboard!');
    }).catch(function (err) {
        alert('Failed to copy state: ' + err);
    });
}

function loadStateFromParams() {
    const params = new URLSearchParams(window.location.search);
    const encodedState = params.get('check');
    if (encodedState) {
        updateState(encodedState);
        document.getElementById('encodedState').value = encodedState;
    }
}

function toggleMenu() {
    var sidebar = document.getElementById("mySidebar");
    if (sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
    } else {
        sidebar.classList.add('open');
    }
}

function closeNav() {
    document.getElementById("mySidebar").classList.remove('open');
}

// 鼠标悬停展开菜单
document.getElementById("mySidebar").addEventListener('mouseenter', function () {
    this.classList.add('open');
});

// 鼠标离开收回菜单
document.getElementById("mySidebar").addEventListener('mouseleave', function () {
    this.classList.remove('open');
});

// 调用loadStateFromParams来初始化状态
loadStateFromParams();
getStateString();
