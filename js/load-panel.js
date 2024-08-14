document.addEventListener("DOMContentLoaded", function () {
    let totalScore = 0;
    let panelList = [];
    const logArea = document.getElementById("logArea");
    const totalScoreValue = document.getElementById("totalScoreValue");

    fetch('/assets/configs/panels.json')
        .then(response => response.json())
        .then(data => {
            generatePanels(data);
            loadStateFromParams();
        });

    function generatePanels(data) {
        const container = document.getElementById("leftContent");

        data["block-list"].forEach(panel => {
            const panelDiv = createPanel(panel)
            panelList.push({ panel, panelDiv });
            container.appendChild(panelDiv);
            updateSummary(panel, panelDiv);
        });
        loadStateFromParams();
    }
    function createPanel(panel) {
        const panelDiv = document.createElement("div");
        panelDiv.className = "panel";

        // Title Box
        const titleBox = document.createElement("div");
        titleBox.className = "panel-title-box";
        const title = document.createElement("span");
        title.className = "panel-title";
        title.textContent = panel.title;
        const subtitle = document.createElement("span");
        subtitle.className = "panel-subtitle";
        subtitle.textContent = panel.subtitle;
        titleBox.appendChild(title);
        titleBox.appendChild(subtitle);
        panelDiv.appendChild(titleBox);

        // Items
        panel.items.forEach(item => {
            const itemDiv = document.createElement("div");
            itemDiv.className = "panel-item";

            const img = document.createElement("img");
            img.src = item.pics;
            itemDiv.appendChild(img);

            const itemName = document.createElement("span");
            itemName.className = "item-name";
            itemName.textContent = item.name;
            itemDiv.appendChild(itemName);

            const operationDiv = document.createElement("div");
            operationDiv.className = "operation";

            if (item.input.type === "int") {
                const minusButton = document.createElement("button");
                minusButton.innerHTML = '<svg width="20px" height="20px"><use xlink:href="#icon-minus"></use></svg>';
                const plusButton = document.createElement("button");
                plusButton.innerHTML = '<svg width="20px" height="20px"><use xlink:href="#icon-plus"></use></svg>';
                const inputField = document.createElement("input");
                inputField.type = "text";
                inputField.value = item.input.offset;
                inputField.className = "item-count"
                inputField.value = item.input.default !== undefined ? item.input.default : -item.input.offset;

                minusButton.addEventListener("click", function () {
                    if (parseInt(inputField.value) > 0) {
                        inputField.value = parseInt(inputField.value) - 1;
                        updateSummary(panel, panelDiv);
                        logAction(item.name, '-1');
                    }
                });

                plusButton.addEventListener("click", function () {
                    inputField.value = parseInt(inputField.value) + 1;
                    updateSummary(panel, panelDiv);
                    logAction(item.name, '+1');
                });

                operationDiv.appendChild(minusButton);
                operationDiv.appendChild(inputField);
                operationDiv.appendChild(plusButton);
            } else if (item.input.type === "bool") {
                const switchDiv = document.createElement("div");
                switchDiv.className = "switch";
                if (item.input.default == true) {
                    switchDiv.classList.add("active");
                }

                const sliderDiv = document.createElement("div");
                sliderDiv.className = "slider";
                switchDiv.appendChild(sliderDiv);

                switchDiv.addEventListener("click", function () {
                    switchDiv.classList.toggle("active");
                    updateSummary(panel, panelDiv);
                    logAction(item.name, switchDiv.classList.contains("active") ? 'ON' : 'OFF');
                });

                operationDiv.appendChild(switchDiv);
            }

            itemDiv.appendChild(operationDiv);
            panelDiv.appendChild(itemDiv);
        });

        // Summary Box
        // Summary Box with two equal divs for label and value
        const summaryBox = document.createElement("div");
        summaryBox.className = "panel-summary-box";

        const labelContainer = document.createElement("div");
        labelContainer.className = "summary-container";
        const valueContainer = document.createElement("div");
        valueContainer.className = "summary-container";

        const label = document.createElement("span");
        label.className = "summary-label";
        label.textContent = "本项总分";
        labelContainer.appendChild(label);

        const value = document.createElement("span");
        value.className = "summary-value";
        valueContainer.appendChild(value);

        summaryBox.appendChild(labelContainer);
        summaryBox.appendChild(valueContainer);

        panelDiv.appendChild(summaryBox);

        return panelDiv
    }

    function updateSummary(panel, panelDiv) {
        getStateString()
        let sum = 0;

        const items = panelDiv.querySelectorAll(".panel-item");

        items.forEach((itemDiv, index) => {
            const item = panel.items[index];
            let value = 0;

            if (item.input.type === "int") {
                const inputField = itemDiv.querySelector("input");
                value = parseInt(inputField.value);
            } else if (item.input.type === "bool") {
                const switchDiv = itemDiv.querySelector(".switch");
                value = switchDiv.classList.contains("active") ? item.input.value : 0;
            }

            if (isNaN(value)) {
                value = 0;
            }

            if (item.input.offset < 0) {
                sum += Math.max(0, value + item.input.offset);
            } else {
                sum += value + item.input.offset;
            }
        });

        sum = sum * panel.output.factor + panel.output.offset;
        const summaryValue = panelDiv.querySelector(".summary-value");
        summaryValue.textContent = sum;

        totalScore += sum;
        totalScoreValue.textContent = totalScore;
    }

    function logAction(itemName, action) {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = `[${timestamp}] ${itemName} ${action}`;
        const logElement = document.createElement("div");
        logElement.textContent = logEntry;
        logArea.appendChild(logElement);
        logArea.scrollTop = logArea.scrollHeight; // Scroll to the bottom
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
            console.log(versionString, states, stateArray, stateArray.length)

            let stateIndex = 0;
            panelList.forEach(({ panel, panelDiv }) => {
                const items = panelDiv.querySelectorAll('.panel-item');
                items.forEach((itemDiv, index) => {
                    const item = panel.items[index];
                    if (stateIndex < stateArray.length) {
                        const stateValue = stateArray[stateIndex];
                        if (item.input.type === 'int') {
                            const inputField = itemDiv.querySelector('input');
                            inputField.value = Math.max(0, parseInt(stateValue));
                        } else if (item.input.type === 'bool') {
                            const switchDiv = itemDiv.querySelector('.switch');
                            if (stateValue === '1') {
                                switchDiv.classList.add('active');
                            } else {
                                switchDiv.classList.remove('active');
                            }
                        }
                        stateIndex++;
                    }
                });
                updateSummary(panel, panelDiv); // 每次更新后重新计算summary
            });

        } catch (e) {
            console.error('Failed to decode state:', e);
        }
    }


    function loadStateFromParams() {
        const params = new URLSearchParams(window.location.search);
        const encodedState = params.get('s');
        if (encodedState) {
            updateState(encodedState);
        }
    }
});
