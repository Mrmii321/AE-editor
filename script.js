let isDebugMode = false;

        // Notify about the debug mode
        console.log("Type debugMode() in the console to disable field requirements for this session.");

        // Function to enable debug mode
        function debugMode() {
            isDebugMode = true;
            console.log("Debug mode enabled: Field validations are now bypassed.");
        }

        let variables = {};  // Global variable
        const levels = [];
        const conditions = [];  // Array to store all conditions
        let effectsData = {};
        let targetsData = {};
    
    async function loadVariables() {
        const response = await fetch('https://raw.githubusercontent.com/AdvancedPlugins/Contributions/main/advancedenchantments/variables.json');
        variables = await response.json();  // Assign to global variable
        
        const variableSelect = document.getElementById("conditionVariable");
        for (const key of Object.keys(variables)) {
            const option = document.createElement("option");
            option.value = key;
            option.text = key;
            variableSelect.appendChild(option);
        }
    }


    async function loadComparisons() {
        const response = await fetch('https://raw.githubusercontent.com/AdvancedPlugins/Contributions/refs/heads/main/advancedenchantments/comparisons.json');
        const variables = await response.json();
        const variableSelect = document.getElementById("conditionComparison");

        for (const [key, value] of Object.entries(variables)) {
            const option = document.createElement("option");
            option.value = key;
            option.text = key;
            variableSelect.appendChild(option);
        }
    }

    async function loadOutcomes() {
        const response = await fetch('https://raw.githubusercontent.com/AdvancedPlugins/Contributions/refs/heads/main/advancedenchantments/outcomes.json');
        const variables = await response.json();
        const variableSelect = document.getElementById("conditionOutcome");

        for (const [key, value] of Object.entries(variables)) {
            const option = document.createElement("option");
            option.value = key;
            option.text = key;
            variableSelect.appendChild(option);
        }
    }

    async function loadTriggers() {
        const response = await fetch('https://raw.githubusercontent.com/AdvancedPlugins/Contributions/main/advancedenchantments/triggers.json');
        const triggers = await response.json();
        const triggerSelect = document.getElementById("trigger");

        for (const key of Object.keys(triggers)) {
            const option = document.createElement("option");
            option.value = key;
            option.text = key;
            triggerSelect.appendChild(option);
        }
    }

    async function loadTargets() {
        const response = await fetch('https://raw.githubusercontent.com/AdvancedPlugins/Contributions/main/advancedenchantments/targets.json');
        targetsData = await response.json();
        const targetSelect = document.getElementById("target");

        for (const key in targetsData) {
            const option = document.createElement("option");
            option.value = key;
            option.text = key;
            targetSelect.appendChild(option);
        }
    }

    async function loadMaterials() {
        const response = await fetch('https://raw.githubusercontent.com/AdvancedPlugins/Contributions/refs/heads/main/advancedenchantments/materials.json');
        const materials = await response.json();
        const materialSelect = document.getElementById("material");

        for (const key in materials) {
            const option = document.createElement("option");
            option.value = key;
            option.text = materials[key];
            materialSelect.appendChild(option);
        }
    }

    async function loadEffects() {
        const response = await fetch('https://raw.githubusercontent.com/AdvancedPlugins/Contributions/main/advancedenchantments/effects.json');
        effectsData = await response.json();
        const effectSelect = document.getElementById("effect");

        for (const effectKey in effectsData.actions) {
            const option = document.createElement("option");
            option.value = effectsData.actions[effectKey].effect.action;
            option.text = effectKey;
            effectSelect.appendChild(option);
        }
    }

    function loadArgsForEffect() {
        const selectedEffect = document.getElementById("effect").value;
        const argsContainer = document.getElementById("argsContainer");
        argsContainer.innerHTML = "";

        const effectDetails = Object.values(effectsData.actions).find(
            action => action.effect.action === selectedEffect
        );

        if (effectDetails && effectDetails.effect.args) {
            effectDetails.effect.args.forEach(arg => {
                const label = document.createElement("label");
                label.textContent = `Argument (${arg}):`;

                const input = document.createElement("input");
                input.type = "text";
                input.id = `arg_${arg}`;
                input.placeholder = `Enter ${arg}`;

                const div = document.createElement("div");
                div.appendChild(label);
                div.appendChild(input);
                argsContainer.appendChild(div);
            });
        }
    }

    function loadArgsForTarget() {
        const selectedTarget = document.getElementById("target").value;
        const targetArgsContainer = document.getElementById("targetArgsContainer");
        targetArgsContainer.innerHTML = "";

        const targetDetails = targetsData[selectedTarget];

        if (targetDetails) {
            const usageDiv = document.createElement("div");
            usageDiv.style.marginBottom = "10px";
            usageDiv.style.color = "#aaa";
            usageDiv.innerText = `Usage: ${targetDetails.usage}`;
            targetArgsContainer.appendChild(usageDiv);

            if (targetDetails.usage.includes("{")) {
                const argsRegex = /{([^}]+)}/g;
                let match;
                while ((match = argsRegex.exec(targetDetails.usage)) !== null) {
                    const arg = match[1].split('=')[0].trim();

                    const label = document.createElement("label");
                    label.textContent = `Argument (${arg}):`;

                    const input = document.createElement("input");
                    input.type = "text";
                    input.id = `target_arg_${arg}`;
                    input.placeholder = `Enter ${arg}`;

                    const div = document.createElement("div");
                    div.appendChild(label);
                    div.appendChild(input);
                    targetArgsContainer.appendChild(div);
                }
            }
        }
    }

    function showLevelPopup() {
        document.getElementById("effect").value = "";
        document.getElementById("target").value = "";
        document.getElementById("cooldown").value = "";
        document.getElementById("chance").value = "";
        document.getElementById("argsContainer").innerHTML = "";
        document.getElementById("targetArgsContainer").innerHTML = "";
        document.getElementById("levelPopup").style.display = "block";

        document.getElementById("saveLevelButton").onclick = saveLevel;
    }

    function closeLevelPopup() {
        document.getElementById("levelPopup").style.display = "none";
    }

    function showConditionsPopup() {
        document.getElementById("conditionVariable").value = "";
        document.getElementById("conditionComparison").value = "";
        document.getElementById("conditionOutcome").value = "";
        document.getElementById("conditionsPopup").style.display = "block";

        document.getElementById("saveConditionsButton").onclick = saveCondition;
    }
    function saveCondition() {
        const conditionVariable = document.getElementById("conditionVariable").value;
        const conditionComparison = document.getElementById("conditionComparison").value;
        const conditionOutcome = document.getElementById("conditionOutcome").value;
        const conditionQuery = document.getElementById("conditionQuery").value;

        // Check if debug mode is not enabled and fields are empty
        if (!isDebugMode && (!conditionVariable || !conditionComparison || !conditionOutcome)) {
            alert("Please fill in all required fields.");
            return;
        }

        // Collect arguments
        const argsElements = document.querySelectorAll("#conditionArgsContainer input");
        const args = Array.from(argsElements).reduce((acc, input) => {
            if (input.value.trim() !== "") {
                acc[input.id.replace("condition_arg_", "")] = input.value;
            }
            return acc;
        }, {});

        const condition = {
            variable: conditionVariable,
            comparison: conditionComparison,
            query: conditionQuery,
            outcome: conditionOutcome,
            args: args
        };

        conditions.push(condition);
        updateConditionList();
        closeConditionsPopup();
    }




    function closeConditionsPopup() {
        document.getElementById("conditionsPopup").style.display = "none";
    }

    function saveCondition() {
        const conditionVariable = document.getElementById("conditionVariable").value;
        const conditionComparison = document.getElementById("conditionComparison").value;
        const conditionOutcome = document.getElementById("conditionOutcome").value;
        const conditionQuery = document.getElementById("conditionQuery").value;

        if (!conditionVariable || !conditionComparison || !conditionOutcome) {
            alert("Please fill in all required fields.");
            return;
        }

        // Collect arguments
        const argsElements = document.querySelectorAll("#conditionArgsContainer input");
        const args = Array.from(argsElements).reduce((acc, input) => {
            if (input.value.trim() !== "") {
                acc[input.id.replace("condition_arg_", "")] = input.value;
            }
            return acc;
        }, {});

        const condition = {
            variable: conditionVariable,
            comparison: conditionComparison,
            query: conditionQuery,
            outcome: conditionOutcome,
            args: args
        };

        conditions.push(condition);
        updateConditionList();
        closeConditionsPopup();
    }



    function deleteCondition(index) {
        if (confirm("Are you sure you want to delete this condition?")) {
            conditions.splice(index, 1);
            updateConditionList();
        }
    }

    function editCondition(index) {
        const condition = conditions[index];

        document.getElementById("conditionVariable").value = condition.variable;
        document.getElementById("conditionComparison").value = condition.comparison;
        document.getElementById("conditionOutcome").value = condition.outcome;
        document.getElementById("conditionQuery").value = condition.query;

        document.getElementById("conditionsPopup").style.display = "block";
        document.getElementById("saveConditionsButton").onclick = function() {
            saveEditedCondition(index);
        };
    }

    function saveEditedCondition(index) {
        const conditionVariable = document.getElementById("conditionVariable").value;
        const conditionComparison = document.getElementById("conditionComparison").value;
        const conditionOutcome = document.getElementById("conditionOutcome").value;
        const conditionQuery = document.getElementById("conditionQuery").value;

        conditions[index] = { variable: conditionVariable, comparison: conditionComparison, query: conditionQuery, outcome: conditionOutcome };
        updateConditionList();
        closeConditionsPopup();
    }

    function loadArgsForCondition() {
        const selectedVariable = document.getElementById("conditionVariable").value;
        const argsContainer = document.getElementById("conditionArgsContainer");

        console.log("Selected Variable:", selectedVariable);
        console.log("Condition Details:", variables[selectedVariable]);

        
        // Check if the argsContainer element exists
        if (!argsContainer) {
            console.error("Element with id 'conditionArgsContainer' not found.");
            return;
        }

        argsContainer.innerHTML = ""; // Clear previous arguments

        // Assuming variables is a globally available object with condition details
        const conditionDetails = variables[selectedVariable];
        if (conditionDetails && conditionDetails.args && conditionDetails.args.length > 0) {
            conditionDetails.args.forEach(arg => {
                const label = document.createElement("label");
                label.textContent = `Argument (${arg}):`;

                const input = document.createElement("input");
                input.type = "text";
                input.id = `condition_arg_${arg}`;
                input.placeholder = `Enter ${arg}`;

                const div = document.createElement("div");
                div.appendChild(label);
                div.appendChild(input);
                argsContainer.appendChild(div);
            });
        }
    }



    function updateConditionList() {
        const conditionList = document.getElementById("conditionList");

        if (!conditionList) {
            console.error("Element with id 'conditionList' not found.");
            return;
        }

        conditionList.innerHTML = conditions.length === 0 ? "List of conditions" : "";

        conditions.forEach((condition, index) => {
            const conditionItem = document.createElement("div");
            conditionItem.style.display = "inline-flex";  // Ensure buttons and text are in line
            conditionItem.style.justifyContent = "flex-start"; // Align buttons to the left
            conditionItem.style.alignItems = "center";  // Vertically align items
            conditionItem.style.marginBottom = "5px";

            const conditionText = document.createElement("span");
            conditionText.textContent = `Condition ${index + 1}: ${condition.variable} ${condition.comparison} ${condition.query} : ${condition.outcome}`;

            const editButton = document.createElement("button");
            editButton.innerHTML = '<i class="fas fa-edit"></i>';
            editButton.style.color = "#5c85ff";
            editButton.style.border = "none";
            editButton.style.background = "transparent";
            editButton.style.cursor = "pointer";
            editButton.style.marginLeft = "5px";  // Reduced margin to bring the buttons closer
            editButton.style.padding = "5px";

            const deleteButton = document.createElement("button");
            deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
            deleteButton.style.color = "#ff5c5c";
            deleteButton.style.border = "none";
            deleteButton.style.background = "transparent";
            deleteButton.style.cursor = "pointer";
            deleteButton.style.marginLeft = "5px";  // Reduced margin to bring the buttons closer
            deleteButton.style.padding = "5px";

            deleteButton.onclick = () => deleteCondition(index);
            editButton.onclick = () => editCondition(index);

            conditionItem.appendChild(conditionText);
            conditionItem.appendChild(editButton);
            conditionItem.appendChild(deleteButton);

            conditionList.appendChild(conditionItem);
        });
    }

    function saveLevel() {
        const effect = document.getElementById("effect").value;
        const target = document.getElementById("target").value;
        const cooldown = document.getElementById("cooldown").value;
        const chance = document.getElementById("chance").value;

        const argsElements = document.querySelectorAll("#argsContainer input");
        let args = Array.from(argsElements)
            .filter(input => input.value.trim() !== "")
            .map(input => `:${input.value}`)
            .join(",");

        const targetArgsElements = document.querySelectorAll("#targetArgsContainer input");
        let targetArgs = Array.from(targetArgsElements)
            .filter(input => input.value.trim() !== "")
            .map(input => `:${input.value}`)
            .join(",");

        const level = { effect, target, args, targetArgs, cooldown, chance };
        levels.push(level);

        updateLevelList();
        closeLevelPopup();
    }

    function deleteLevel(index) {
        if (confirm("Are you sure you want to delete this level?")) {
            levels.splice(index, 1);
            updateLevelList();
        }
    }

    function editLevel(index) {
        const level = levels[index];

        document.getElementById("effect").value = level.effect;
        document.getElementById("target").value = level.target;
        document.getElementById("cooldown").value = level.cooldown;
        document.getElementById("chance").value = level.chance;

        loadArgsForEffect();
        const argsElements = document.querySelectorAll("#argsContainer input");
        const argsValues = level.args.split(",").map(arg => arg.slice(1));
        argsElements.forEach((input, i) => {
            input.value = argsValues[i] || "";
        });

        loadArgsForTarget();
        const targetArgsElements = document.querySelectorAll("#targetArgsContainer input");
        const targetArgsValues = level.targetArgs.split(",").map(arg => arg.slice(1));
        targetArgsElements.forEach((input, i) => {
            input.value = targetArgsValues[i] || "";
        });

        function loadArgsForCondition() {
        const selectedVariable = document.getElementById("conditionVariable").value;
        const argsContainer = document.getElementById("conditionArgsContainer");
        argsContainer.innerHTML = ""; // Clear previous arguments

        // Example: variables object contains args for each condition variable
        const conditionDetails = variables[selectedVariable]; // Assume `variables` is already loaded
        if (conditionDetails && conditionDetails.args) {
            conditionDetails.args.forEach(arg => {
                const label = document.createElement("label");
                label.textContent = `Argument (${arg}):`;

                const input = document.createElement("input");
                input.type = "text";
                input.id = `condition_arg_${arg}`;
                input.placeholder = `Enter ${arg}`;

                const div = document.createElement("div");
                div.appendChild(label);
                div.appendChild(input);
                argsContainer.appendChild(div);
            });
        }
    }


        document.getElementById("levelPopup").style.display = "block";
        document.getElementById("saveLevelButton").onclick = function() {
            saveEditedLevel(index);
        };
    }

    function saveEditedLevel(index) {
        const effect = document.getElementById("effect").value;
        const target = document.getElementById("target").value;
        const cooldown = document.getElementById("cooldown").value;
        const chance = document.getElementById("chance").value;

        const argsElements = document.querySelectorAll("#argsContainer input");
        let args = Array.from(argsElements)
            .filter(input => input.value.trim() !== "")
            .map(input => `:${input.value}`)
            .join(",");

        const targetArgsElements = document.querySelectorAll("#targetArgsContainer input");
        let targetArgs = Array.from(targetArgsElements)
            .filter(input => input.value.trim() !== "")
            .map(input => `:${input.value}`)
            .join(",");

        levels[index] = { effect, target, args, targetArgs, cooldown, chance };
        updateLevelList();
        closeLevelPopup();
    }

    function updateLevelList() {
        const levelList = document.getElementById("levelList");

        if (!levelList) {
            console.error("Element with id 'levelList' not found.");
            return;
        }

        levelList.innerHTML = levels.length === 0 ? "List of levels" : "";

        levels.forEach((level, index) => {
            const levelItem = document.createElement("div");
            levelItem.style.display = "inline-flex";  // Ensure buttons and text are in line
            levelItem.style.justifyContent = "flex-start"; // Align buttons to the left
            levelItem.style.alignItems = "center";  // Vertically align items
            levelItem.style.marginBottom = "5px";

            const levelText = document.createElement("span");
            levelText.textContent = `Level ${index + 1}: Effect - ${level.effect}, Target - ${level.target}, Cooldown - ${level.cooldown}s, Chance - ${level.chance}%`;

            const editButton = document.createElement("button");
            editButton.innerHTML = '<i class="fas fa-edit"></i>';
            editButton.style.color = "#5c85ff";
            editButton.style.border = "none";
            editButton.style.background = "transparent";
            editButton.style.cursor = "pointer";
            editButton.style.marginLeft = "5px";  // Reduced margin to bring the buttons closer
            editButton.style.padding = "5px";

            const deleteButton = document.createElement("button");
            deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
            deleteButton.style.color = "#ff5c5c";
            deleteButton.style.border = "none";
            deleteButton.style.background = "transparent";
            deleteButton.style.cursor = "pointer";
            deleteButton.style.marginLeft = "5px";  // Reduced margin to bring the buttons closer
            deleteButton.style.padding = "5px";

            deleteButton.onclick = () => deleteLevel(index);
            editButton.onclick = () => editLevel(index);

            levelItem.appendChild(levelText);
            levelItem.appendChild(editButton);
            levelItem.appendChild(deleteButton);

            levelList.appendChild(levelItem);
        });
    }

    function copyToClipboard() {
            const outputElement = document.getElementById("output");
            const textToCopy = outputElement.innerText;

            navigator.clipboard.writeText(textToCopy).then(() => {
                alert("Template copied to clipboard!");
            }).catch(err => {
                console.error("Failed to copy text: ", err);
            });
        }

    function generateTemplate() {
        const enchantmentName = document.getElementById("enchantmentName").value;
        const enchantmentDescription = document.getElementById("enchantmentDescription").value;
        const group = document.getElementById("group").value;
        const material = document.getElementById("material").value;
        const appliesTo = document.getElementById("appliesTo").value.trim();
        const trigger = Array.from(document.getElementById("trigger").selectedOptions)
            .map(opt => opt.value)
            .join(";");

        if (!appliesTo || !enchantmentDescription || !enchantmentName || !group || !material || !trigger) {
            alert("Please enter all enchantment application details.");
            return;
        }

        // Generate the conditions template
        let conditionsTemplate = "";
        conditions.forEach(condition => {
            // Ensure condition.args is defined and is an object
            const args = condition.args && typeof condition.args === 'object' ? condition.args : {};
            const argsString = Object.entries(args)
                .map(([key, value]) => `${key}: ${value}`)
                .join(", ");
            conditionsTemplate += `        - '${condition.variable} ${condition.comparison} ${condition.query} : ${condition.outcome}${argsString ? ` {${argsString}}` : ""}'\n`;
        });

        // Generate the levels template
        let levelsTemplate = "";
        levels.forEach((level, index) => {
            levelsTemplate += `
            ${index + 1}:
                effects:
                    - "${level.effect}${level.args} @${level.target}${level.targetArgs}"
                cooldown: ${level.cooldown}
                chance: ${level.chance}
    `;
        });

        // Final template
        const template = `
    ${enchantmentName.toLowerCase()}:
        display: "${enchantmentName}"
        description: "${enchantmentDescription}"
        applies-to: "${appliesTo}"
        type: "${trigger}"
        group: "${group}"
        conditions:
    ${conditionsTemplate}    applies:
            - ${material}
        levels:
    ${levelsTemplate}`;

        document.getElementById("output").innerText = template;
    }


    window.onload = function() {
    loadTriggers();
    loadMaterials();
    loadEffects();
    loadTargets();
    loadVariables();
    loadOutcomes();
    loadComparisons();
};