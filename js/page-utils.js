function getStateString() {
    let stateObj = {};
    const inputs = document.querySelectorAll('input, select, textarea, [type=checkbox], [type=radio],[class=slider]');
    inputs.forEach(input => {
        console.log(input.id, input.value,input.checked,input.classList.contains("active"))
        stateObj[input.id] = input.value || (input.checked ? 'True' : 'False')|| input.classList.contains("active");
    });
    const stateString = Object.keys(stateObj).map(key => `${key}=${stateObj[key]}`).join(';');
    const encodedState = btoa(stateString)
    document.getElementById('currentStatus').textContent = encodedState
    console.log(stateString)
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
    document.getElementById('currentStatus').textContent = encodedState;
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
        document.getElementById('currentStatus').value = encodedState;
    }
}



document.addEventListener('DOMContentLoaded', function () {
    // updateState();
    // loadStateFromParams();
    // getStateString();
});
