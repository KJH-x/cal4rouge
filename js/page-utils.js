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

function updateState(encodedString) {
    try {
        const stateString = atob(encodedString);
        const [versionString, states] = stateString.split(':');
        const stateArray = states.split(';');
        const currentVersion = document.getElementById('versionInfo').textContent;

        if (versionString !== currentVersion) {
            console.log('Version mismatch. State not updated.');
            return;
        }

        let stateIndex = 0;
        const panels = document.querySelectorAll('.panel');
        panels.forEach(panel => {
            const items = panel.querySelectorAll('.panel-item');
            items.forEach(itemDiv => {
                const inputField = itemDiv.querySelector('input');
                const switchDiv = itemDiv.querySelector('.switch');
                if (stateIndex < stateArray.length) {
                    const stateValue = stateArray[stateIndex];
                    if (inputField) {
                        inputField.value = Math.max(0, parseInt(stateValue));
                    } else if (switchDiv) {
                        if (stateValue === '1') {
                            switchDiv.classList.add('active');
                        } else {
                            switchDiv.classList.remove('active');
                        }
                    }
                    stateIndex++;
                }
            });
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

