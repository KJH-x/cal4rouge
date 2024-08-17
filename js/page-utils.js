function recordState() {
    let stateString = '';
    const versionString = document.getElementById('versionInfo').textContent;
    stateString += versionString + ':';

    const panels = document.querySelectorAll('.panel');
    panels.forEach(panel => {
        const items = panel.querySelectorAll('.panel-item');
        items.forEach(itemDiv => {
            const inputField = itemDiv.querySelector('input');
            const switchDiv = itemDiv.querySelector('.switch');
            if (inputField) {
                stateString += Math.max(0, parseInt(inputField.value)) + ';';
            } else if (switchDiv) {
                stateString += (switchDiv.classList.contains('active') ? '1' : '0') + ';';
            }
        });
    });

    stateString = stateString.slice(0, -1);

    const encodedState = btoa(stateString)
    // document.getElementById('currentStatus').textContent = encodedState
    localStorage.setItem("state", encodedState)
    return encodedState;
}

function copyState() {
    const encodedState = recordState();
    const currentUrl = new URL(window.location.href);
    const params = currentUrl.searchParams;

    params.delete('s');
    params.set('s', encodedState);
    NewUrl = `${window.location.origin}${currentUrl.pathname}?${params.toString()}`;

    // document.getElementById('currentStatus').textContent = encodedState;
    navigator.clipboard.writeText(NewUrl).then(function () {
        alert('分享链接已经复制到剪贴板!');
    }).catch(function (err) {
        alert('Failed to copy state: ' + err);
    });
}

function resetState() {
    alert("是否确定要清空本地数据")
    localStorage.clear()
    window.location.href = `${window.location.origin}${window.location.pathname}`
}