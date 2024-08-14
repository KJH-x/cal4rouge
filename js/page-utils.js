function getStateString() {
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
    document.getElementById('currentStatus').textContent = encodedState
    return encodedState;
}

function copyState() {
    const encodedState = getStateString();
    const currentUrl = new URL(window.location.href);
    const params = currentUrl.searchParams;

    params.delete('s');
    params.set('s', encodedState);
    NewUrl = `${window.location.origin}${currentUrl.pathname}?${params.toString()}`;

    document.getElementById('currentStatus').textContent = encodedState;
    navigator.clipboard.writeText(NewUrl).then(function () {
        alert('State copied to clipboard!');
    }).catch(function (err) {
        alert('Failed to copy state: ' + err);
    });
}