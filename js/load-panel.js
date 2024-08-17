document.addEventListener("DOMContentLoaded", function () {
    let totalScore = 0;
    let panelList = [];
    const logArea = document.getElementById("logArea");

    fetch('/assets/configs/panels.json')
        .then(response => response.json())
        .then(data => {
            generatePanels(data);
            loadState();
        });

    function generatePanels(data) {
        const container = document.getElementById("leftContent");

        data["block-list"].forEach(panel => {
            const panelDiv = createPanel(panel)
            panelList.push({ panel, panelDiv });
            container.appendChild(panelDiv);
            updateSummary(panel, panelDiv);
        });
    }

    function createPanel(panel) {
        const panelDiv = document.createElement("div");
        panelDiv.className = "panel";

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

        const foldedItems = [];
        const isFolded = panel.fold == true;

        panel.items.forEach((item, index) => {
            const itemDiv = document.createElement("div");
            itemDiv.className = "panel-item";

            if (isFolded) {
                itemDiv.classList.add("collapsed");
                foldedItems.push({ item, index });
            }

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
                minusButton.innerHTML = '<svg width="20px" height="20px"><use href="#icon-minus"></use></svg>';
                const plusButton = document.createElement("button");
                plusButton.innerHTML = '<svg width="20px" height="20px"><use href="#icon-plus"></use></svg>';
                const inputField = document.createElement("input");
                inputField.type = "text";
                inputField.value = item.input.offset;
                inputField.className = "item-count"
                inputField.value = item.input.default !== undefined ? item.input.default : -item.input.offset;
                inputField.id = item.name;

                inputField.addEventListener("keydown", function () {
                    updateSummary(panel, panelDiv);
                    recordState();
                });
                inputField.addEventListener("blur", function () {
                    updateSummary(panel, panelDiv)
                    recordState();
                })

                minusButton.addEventListener("click", function () {
                    if (parseInt(inputField.value) > 0) {
                        const selectBox = itemDiv.closest(".panel").querySelector(".panel-select select");
                        inputField.value = parseInt(inputField.value) - 1;
                        if (parseInt(inputField.value) === 0) {
                            itemDiv.classList.add("collapsed");
                            const option = document.createElement("option");
                            option.value = index;
                            option.textContent = item.name;
                            selectBox.appendChild(option);
                        }
                        logAction(item.name, '-1');
                    }
                    updateSummary(panel, panelDiv);
                    recordState();
                });

                plusButton.addEventListener("click", function () {
                    inputField.value = parseInt(inputField.value) + 1;
                    updateSummary(panel, panelDiv);
                    recordState();
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
                    const selectBox = itemDiv.closest(".panel").querySelector(".panel-select select");
                    if (!switchDiv.classList.contains("active")) {
                        itemDiv.classList.add("collapsed");
                        const option = document.createElement("option");
                        option.value = index;
                        option.textContent = item.name;
                        selectBox.appendChild(option);
                    }
                    updateSummary(panel, panelDiv);
                    logAction(item.name, switchDiv.classList.contains("active") ? 'ON' : 'OFF');
                });

                operationDiv.appendChild(switchDiv);
            } else if (item.input.type === "input") {
                const inputField = document.createElement("input");
                inputField.type = "text";
                inputField.value = item.input.offset;
                inputField.className = "item-value"
                inputField.value = item.input.default !== undefined ? item.input.default : -item.input.offset;
                inputField.id = item.name;

                inputField.addEventListener("keydown", function () {
                    updateSummary(panel, panelDiv);
                });
                inputField.addEventListener("blur", function () {
                    updateSummary(panel, panelDiv)
                })

                operationDiv.appendChild(inputField);
            }

            itemDiv.appendChild(operationDiv);
            panelDiv.appendChild(itemDiv);
        });

        if (foldedItems.length > 0) {
            const panelSelectDiv = document.createElement("div");
            panelSelectDiv.className = "panel-select";

            const addLabel = document.createElement("div");
            addLabel.textContent = "增加";

            const selectBox = document.createElement("select");
            foldedItems.forEach(({ item, index }) => {
                const option = document.createElement("option");
                option.value = index;
                option.textContent = item.name;
                selectBox.appendChild(option);
            });
            selectBox.id = panel.title;
            selectBox.classList.add("item-select")

            selectBox.addEventListener("change", function () {
                const selectedIndex = selectBox.value;
                if (selectedIndex !== "") {
                    const selectedItem = panel.items[selectedIndex];
                    const selectedItemDiv = panelDiv.querySelectorAll(".panel-item")[selectedIndex];
                    if (selectedItemDiv) {
                        selectedItemDiv.classList.remove("collapsed");
                        if (selectedItem.input.type === "bool") {
                            const switchDiv = selectedItemDiv.querySelector(".switch");
                            if (switchDiv) {
                                switchDiv.classList.add("active");
                            }
                        } else if (selectedItem.input.type === "int") {
                            const inputField = selectedItemDiv.querySelector("input");
                            if (inputField) {
                                inputField.value = 1;
                            }
                        }
                        selectBox.remove(selectBox.selectedIndex);
                        updateSummary(panel, panelDiv);
                        logAction(selectedItem.name, '+1');
                    }
                }
            });


            const addButton = document.createElement("button");
            addButton.innerHTML = '<svg width="24" height="24"><use href="#icon-add-item"></use></svg>';

            addButton.addEventListener("click", () => {
                const selectedIndex = selectBox.value;
                if (selectedIndex !== "") {
                    const selectedItem = panel.items[selectedIndex];
                    const selectedItemDiv = panelDiv.querySelectorAll(".panel-item")[selectedIndex];
                    if (selectedItemDiv) {
                        selectedItemDiv.classList.remove("collapsed");
                        if (selectedItem.input.type === "bool") {
                            const switchDiv = selectedItemDiv.querySelector(".switch");
                            if (switchDiv) {
                                switchDiv.classList.add("active");
                            }
                        } else if (selectedItem.input.type === "int") {
                            const inputField = selectedItemDiv.querySelector("input");
                            if (inputField) {
                                inputField.value = 1;
                            }
                        }
                        selectBox.remove(selectBox.selectedIndex);
                        updateSummary(panel, panelDiv);
                        logAction(selectedItem.name, '+1');
                    }
                }
            });

            panelSelectDiv.appendChild(addLabel);
            panelSelectDiv.appendChild(selectBox);
            panelSelectDiv.appendChild(addButton);
            panelDiv.appendChild(panelSelectDiv);
        }

        const summaryBox = document.createElement("div");
        summaryBox.className = "panel-summary-box";

        const labelContainer = document.createElement("div");
        labelContainer.className = "summary-container";
        const valueContainer = document.createElement("div");
        valueContainer.className = "summary-container";

        const label = document.createElement("span");
        label.className = "summary-label";
        label.textContent = "小计";
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
        let sum = 0;

        const items = panelDiv.querySelectorAll(".panel-item");

        items.forEach((itemDiv, index) => {
            const item = panel.items[index];
            let value = 0;

            if (item.input.type === "int" || item.input.type === "input") {
                const inputField = itemDiv.querySelector("input");
                let itemCount = parseInt(inputField.value);
                inputField.value = itemCount;
                if (item.input.offset < 0) {
                    itemCount = Math.max(0, itemCount + item.input.offset);
                } else {
                    itemCount = itemCount + item.input.offset;
                }
                value = itemCount * parseInt(item.input.value);
            } else if (item.input.type === "bool") {
                const switchDiv = itemDiv.querySelector(".switch");
                value = switchDiv.classList.contains("active") ? item.input.value : 0;
            }

            if (isNaN(value)) {
                value = 0;
            }
            sum += value
        });

        sum = sum + panel.output.offset;
        const summaryValue = panelDiv.querySelector(".summary-value");
        summaryValue.textContent = sum;
        updateGrandTotal()
    }
    function updateGrandTotal() {
        const totalScoreValue = document.getElementById("totalScoreValue");
        const summaryValueBox = document.getElementsByClassName("summary-value")
        let sum = 0;

        for (let item of summaryValueBox) {
            sum += parseFloat(item.textContent) || 0;
        }
        totalScoreValue.textContent = sum
    }

    function logAction(itemName, action) {
        // const timestamp = new Date().toLocaleTimeString();
        const logEntry = `${itemName} ${action}`;
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
                window.history.replaceState({}, "", window.location.origin)
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
                            if (inputField.value != 0 && itemDiv && itemDiv.classList) {
                                itemDiv.classList.remove('collapsed');
                                logAction(item.name, `-> ${inputField.value}`)
                            }
                        } else if (item.input.type === 'bool') {
                            const switchDiv = itemDiv.querySelector('.switch');
                            if (stateValue === '1') {
                                switchDiv.classList.add('active');
                                itemDiv.classList.remove('collapsed');
                                logAction(item.name, `-> ON`)
                            } else {
                                switchDiv.classList.remove('active');
                            }
                        }
                        stateIndex++;
                    }
                });
                updateSummary(panel, panelDiv);
            });

        } catch (e) {
            console.error('Failed to decode state:', e);
        }
    }


    function loadState() {
        const params = new URLSearchParams(window.location.search);
        const encodedStateFromParams = params.get('s');
        const encodedStateFromLocalS = localStorage.getItem("state")
        if (encodedStateFromParams && confirm("读取到分享参数，是否覆盖本地参数？")) {
            // updateState(encodedStateFromParams);
            localStorage.setItem("state", encodedStateFromParams)
            window.location.href = `${window.location.origin}${window.location.pathname}`
        } else if (encodedStateFromLocalS) {
            updateState(encodedStateFromLocalS);
        }
    }
});
