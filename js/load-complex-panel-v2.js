document.addEventListener("DOMContentLoaded", function () {
    const panelElement = document.getElementById("complex-panel");
    function createComplex(panelElement) {
        fetch('assets/configs/complex-panel.json')
            .then(response => response.json())
            .then(config => {
                const { title, subtitle, items, options } = config;
                // const panelElement = document.createElement('div');

                const titleBox = document.createElement('div');
                titleBox.className = 'panel-title-box';

                const titleDiv = document.createElement('div');
                titleDiv.className = 'panel-title';
                titleDiv.textContent = title;

                const subtitleDiv = document.createElement('div');
                subtitleDiv.className = 'panel-subtitle';
                subtitleDiv.textContent = subtitle;

                titleBox.appendChild(titleDiv);
                titleBox.appendChild(subtitleDiv);

                const itemsDiv = document.createElement('div');
                itemsDiv.className = 'panel-items';
                itemsDiv.id= 'multi-items';


                const newItemDiv = document.createElement('div');
                newItemDiv.className = 'panel-new-item';
                newItemDiv.id = 'panel-new-item';
                createFixedItemSelect(items, options, newItemDiv);

                const summaryBox = document.createElement("div");
                {
                    // 小计
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
                }

                panelElement.appendChild(titleBox);
                panelElement.appendChild(itemsDiv);
                panelElement.appendChild(newItemDiv);
                panelElement.appendChild(summaryBox);


                panelElement.querySelectorAll('.item-expand').forEach(icon => {
                    icon.addEventListener('click', toggleSubItems);
                });
                panelElement.querySelectorAll('.item-change').forEach(select => {
                    select.addEventListener('change', handleItemChange);
                });
                panelElement.querySelectorAll('.item-delete').forEach(icon => {
                    icon.addEventListener('click', confirmDeleteItem);
                });
                panelElement.querySelectorAll('.item-duplicate').forEach(icon => {
                    icon.addEventListener('click', duplicateItem);
                });
                // panelElement.querySelector('.panel-new-item .complex-select')
                //     .addEventListener('change', addNewItem);


            });
    }

    function createOpItem(items, options, itemValue) {
        const chose = items.find(obj => obj.name === itemValue);
        const itemDiv = document.createElement('div');
        
        // Create the main wrapper div for the item
        const panelItemDiv = document.createElement('div');
        panelItemDiv.classList.add('panel-item');
        
        // Create the expand button
        const expandDiv = document.createElement('div');
        const expandSvg = document.createElement('svg');
        const expandUse = document.createElement('use');
        expandUse.setAttribute('href', '#icon-expand');
        expandSvg.appendChild(expandUse);
        expandDiv.appendChild(expandSvg);
        expandDiv.classList.add('item-expand');
        
        // Create the item change select
        const changeDiv = document.createElement('div');
        changeDiv.classList.add('item-change');
        const selectElement = createFlexItemSelect(items, itemDiv, chose.baseValue); // This returns a select element
        changeDiv.appendChild(selectElement);
        
        // Create the item sum div
        const sumDiv = document.createElement('div');
        sumDiv.classList.add('item-sum');
        sumDiv.textContent = '0'; // Initial value
        
        // Create the item delete button
        const deleteDiv = document.createElement('div');
        deleteDiv.classList.add('item-delete');
        const deleteSvg = document.createElement('svg');
        const deleteUse = document.createElement('use');
        deleteUse.setAttribute('href', '#icon-delete');
        deleteSvg.appendChild(deleteUse);
        deleteDiv.appendChild(deleteSvg);
        
        // Create the item duplicate button
        const duplicateDiv = document.createElement('div');
        duplicateDiv.classList.add('item-duplicate');
        const duplicateSvg = document.createElement('svg');
        const duplicateUse = document.createElement('use');
        duplicateUse.setAttribute('href', '#icon-duplicate');
        duplicateSvg.appendChild(duplicateUse);
        duplicateDiv.appendChild(duplicateSvg);
        
        // Append all created elements to the main panel item div
        panelItemDiv.appendChild(expandDiv);
        panelItemDiv.appendChild(changeDiv);
        panelItemDiv.appendChild(sumDiv);
        panelItemDiv.appendChild(deleteDiv);
        panelItemDiv.appendChild(duplicateDiv);
        
        // Create the sub-items div
        const subItemsDiv = document.createElement('div');
        subItemsDiv.classList.add('sub-items', 'collapsed');
        const subItemsContent = createOpItemSubItems(options, itemDiv); // This returns a div element
        subItemsDiv.appendChild(subItemsContent);
        
        // Create a wrapper div to hold both panelItemDiv and subItemsDiv
        const wrapperDiv = document.createElement('div');
        wrapperDiv.appendChild(panelItemDiv);
        wrapperDiv.appendChild(subItemsDiv);
        wrapperDiv.classList.add("compelx-item-wrap");
        
        // Append the wrapper div to the parentDiv
        const parentDiv = document.getElementById('multi-items');
        parentDiv.appendChild(wrapperDiv);
        
        return wrapperDiv;
    }
    

    function createFlexItemSelect(items, selectedName) {
        const selectElement = document.createElement('select');
        selectElement.classList.add('complex-select');

        items.forEach(item => {
            const option = document.createElement('option');
            option.value = item.name;
            option.textContent = item.name;
            selectElement.appendChild(option);
        });
        // selectBox.id = panel.title;
        selectElement.classList.add("item-select")

        selectElement.value = selectedName;
        // selectElement.appendChild(optionElement);
        return selectElement;
    }

    function createOpItemSubItems(item) {
        return document.createElement('div')
        return `<div></div>`; // Placeholder for sub-items
    }

    function createFixedItemSelect(items, options, parentDiv) {
        const selectBox = document.createElement('div');
        selectBox.className = 'complex-select-box';

        const select = document.createElement('select');
        select.className = 'complex-select';

        const addLabel = document.createElement("div");
        addLabel.textContent = "增加";

        items.forEach(item => {
            const option = document.createElement('option');
            option.value = item.name;
            option.textContent = item.name;
            select.appendChild(option);
        });
        // selectBox.id = panel.title;
        select.classList.add("item-select")

        const addButton = document.createElement('button');
        addButton.className = 'append-button';
        addButton.innerHTML = '<svg width="24" height="24"><use href="#icon-add-item"></use></svg>';

        addButton.addEventListener("click", () => {
            createOpItem(items, options, select.value)
        });

        selectBox.appendChild(addLabel);
        selectBox.appendChild(select);
        selectBox.appendChild(addButton);

        parentDiv.appendChild(selectBox)
    }


    function toggleSubItems(event) {
        const subItems = event.target.closest('.panel-item').nextElementSibling;
        subItems.classList.toggle('collapsed');
    }

    function handleItemChange(event) {
        const item = event.target.closest('.panel-item');
        itemSummary(item);
    }

    function confirmDeleteItem(event) {
        if (confirm('Are you sure you want to delete this item?')) {
            const item = event.target.closest('.panel-item');
            item.remove();
            updateComplexSummary();
        }
    }

    function duplicateItem(event) {
        const item = event.target.closest('.panel-item');
        const clonedItem = item.cloneNode(true);
        item.after(clonedItem);
        updateComplexSummary();
    }

    function addNewItem(event) {
        const panelItems = document.querySelector('.panel-items');
        const newItem = createOpItem({ name: event.target.value, baseValue: 0 });
        panelItems.insertBefore(newItem, document.querySelector('.panel-select'));
        updateComplexSummary();
    }
    function itemSummary(item) {
        // Calculation logic here, temporarily empty
    }

    function updateComplexSummary() {
        let grandTotal = 0;
        document.querySelectorAll('.panel-item').forEach(item => {
            // Update grandTotal based on item summary
        });
        document.getElementById('grandTotal').textContent = grandTotal;
    }
    createComplex(panelElement);
});