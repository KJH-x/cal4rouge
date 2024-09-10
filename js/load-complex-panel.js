document.addEventListener("DOMContentLoaded", function () {
    // let totalScore = 0;
    // let panelList = [];
    const logArea = document.getElementById("logArea"); ``
    function createComplex() {
        fetch('assets/configs/complex-panel.json').then(response => response.json()).then(config => {
            const panel = document.createElement('div');
            panel.className = 'panel';

            const titleBox = createTitleBox(config.title, config.subtitle);
            panel.appendChild(titleBox);

            const newItemBox = createNewItemBox(config.options);
            panel.appendChild(newItemBox);

            config.items.forEach(itemConfig => {
                const item = createItem(itemConfig,config.options);
                panel.appendChild(item);
            });

            const summaryBox = createSummaryBox();
            panel.appendChild(summaryBox);

            updateComplexSummary(panel, config);

            document.body.appendChild(panel);
        });
    }

    function createTitleBox(title, subtitle) {
        const titleBox = document.createElement('div');
        titleBox.className = 'panel-title-box';
        titleBox.innerHTML = `<div class="panel-title">${title}</div><div class="panel-subtitle">${subtitle}</div>`;
        return titleBox;
    }

    function createNewItemBox(options) {
        const newItemBox = document.createElement('div');
        newItemBox.className = 'panel-new-item';
        newItemBox.innerHTML = `<img src="path/to/img"/><select class="complex-select">${options.map(option => `<option value="${option.name}">${option.name}</option>`).join('')}</select><svg class="appendIcon"><use href="#appendIcon"></use></svg>`;
        newItemBox.querySelector('.appendIcon').addEventListener('click', () => addItem(newItemBox));
        return newItemBox;
    }

    function createItem(itemConfig,options) {
        const item = document.createElement('div');
        item.className = 'panel-item';

        const expandIcon = document.createElement('div');
        expandIcon.className = 'item-expand';
        expandIcon.innerHTML = '<svg><use href="#expandIcon"></use></svg>';
        expandIcon.addEventListener('click', () => toggleSubItems(item));

        const changeSelect = document.createElement('div');
        changeSelect.className = 'item-change';
        changeSelect.innerHTML = `<select>${options.map(opt => `<option value="${opt.name}">${opt.name}</option>`).join('')}</select>`;
        changeSelect.addEventListener('change', () => updateItemSummary(item));

        const itemSum = document.createElement('div');
        itemSum.className = 'item-sum';
        itemSum.textContent = calculateItemSum(itemConfig,options);

        const deleteIcon = document.createElement('div');
        deleteIcon.className = 'item-delete';
        deleteIcon.innerHTML = '<svg><use href="#deleteIcon"></use></svg>';
        deleteIcon.addEventListener('click', () => confirmDeleteItem(item));

        const duplicateIcon = document.createElement('div');
        duplicateIcon.className = 'item-duplicate';
        duplicateIcon.innerHTML = '<svg><use href="#duplicateIcon"></use></svg>';
        duplicateIcon.addEventListener('click', () => duplicateItem(item));

        item.append(expandIcon, changeSelect, itemSum, deleteIcon, duplicateIcon);

        itemConfig.subItems.forEach(subItemConfig => {
            const subItem = createSubItem(subItemConfig);
            item.appendChild(subItem);
        });

        return item;
    }

    function createSubItem(subItemConfig) {
        const subItem = document.createElement('div');
        subItem.className = 'sub-item';
        subItem.innerHTML = `<img src="${subItemConfig.pic}"/><span>${subItemConfig.name}</span>`;
        // 根据类型添加适当的input/select
        return subItem;
    }

    function toggleSubItems(item) {
        const subItems = item.querySelectorAll('.sub-item');
        subItems.forEach(subItem => subItem.classList.toggle('active'));
    }

    function confirmDeleteItem(item) {
        if (confirm('Delete this item?')) {
            item.remove();
            updateComplexSummary(document.querySelector('.panel'));
        }
    }

    function duplicateItem(item) {
        const clone = item.cloneNode(true);
        item.after(clone);
        updateComplexSummary(document.querySelector('.panel'));
    }

    function updateItemSummary(item) {
        const newValue = calculateItemSum(); // 计算新值
        item.querySelector('.item-sum').textContent = newValue;
        updateComplexSummary(document.querySelector('.panel'));
    }

    function updateComplexSummary(panel) {
        const items = panel.querySelectorAll('.panel-item');
        let totalSum = 0;
        items.forEach(item => {
            totalSum += parseFloat(item.querySelector('.item-sum').textContent);
        });
        panel.querySelector('.panel-summary-box .summary-value').textContent = totalSum;
    }

    // function calculateItemSum(itemConfig,options) {
    //     // 实现根据itemConfig的选项计算小计的逻辑
    //     return baseValue;
    // }

    function createSummaryBox() {
        const summaryBox = document.createElement('div');
        summaryBox.className = 'panel-summary-box';
        summaryBox.innerHTML = `<div class="summary-container"><span class="summary-label">Total:</span><span class="summary-value">0</span></div>`;
        return summaryBox;
    }

    function addItem(newItemBox) {
        const selectElement = newItemBox.querySelector('.complex-select select');
        const selectedItem = selectElement.value;
        const config = getConfigForSelectedItem(selectedItem);

        if (config) {
            const newItem = createItem(config);
            newItemBox.insertAdjacentElement('afterend', newItem);
            updateComplexSummary(document.querySelector('.panel'));
        }
    }

    function getConfigForSelectedItem(selectedItem) {
        // 从配置中查找匹配的item配置
        // 返回对应的配置对象
    }

    function calculateItemSum(itemConfig,options) {
        let sum = itemConfig.baseValue;

        // 单选选项处理
        const singleSelectOption = options.find(opt => opt.type === 'single-select');
        if (singleSelectOption) {
            sum *= (1 + singleSelectOption.list.find(item => item.selected).amp);
        }

        // 多选选项处理
        const multiSelectOption = options.find(opt => opt.type === 'multi-select');
        if (multiSelectOption) {
            sum += multiSelectOption.list.reduce((total, item) => total + (item.selected ? item.offset : 0), 0);
        }

        // check-offset处理
        const checkOffsetOption = options.find(opt => opt.type === 'check-offset');
        if (checkOffsetOption) {
            sum += checkOffsetOption.list.find(item => item.checked).offset;
        }

        // check-amp处理
        const checkAmpOption = options.find(opt => opt.type === 'check-amp');
        if (checkAmpOption) {
            sum *= (1 + checkAmpOption.list.find(item => item.checked).amp);
        }

        return sum;
    }

    function updateComplexSummary(panel) {
        const items = panel.querySelectorAll('.panel-item');
        let totalSum = 0;
        items.forEach(item => {
            const itemSum = parseFloat(item.querySelector('.item-sum').textContent);
            totalSum += isNaN(itemSum) ? 0 : itemSum;
        });
        panel.querySelector('.summary-value').textContent = totalSum;
        updateGrandTotal();
    }

    function updateGrandTotal() {
        const grandTotal = document.querySelector('.grand-total');
        let total = 0;
        document.querySelectorAll('.panel .summary-value').forEach(valueElement => {
            total += parseFloat(valueElement.textContent) || 0;
        });
        grandTotal.textContent = total;
    }
    createComplex()
});