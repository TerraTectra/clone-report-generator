// Начальный список имен (можно расширить)
let namesList = [
    "8689 | CO | Saor",
    "2452 | DCO | Crismas",
    "7531 | INS | Жмых",
    "4460 | INS | Aerthar"
];

// Показать/скрыть формы
function showForm(formType) {
    document.getElementById('mainMenu').classList.add('hidden');
    document.getElementById(formType + 'Form').classList.remove('hidden');
    
    // Инициализация автозаполнения для соответствующих полей
    if(formType === 'specialReport') {
        initAutocomplete('recipient', true); // С разделителем ;
        initAutocomplete('reporter', false); // Без разделителя
    } else if(formType === 'reprimand') {
        initAutocomplete('violator', true); // С разделителем ;
        initAutocomplete('reprimandReporter', false); // Без разделителя
    }
}

function backToMenu() {
    document.getElementById('reprimandForm').classList.add('hidden');
    document.getElementById('specialReportForm').classList.add('hidden');
    document.getElementById('mainMenu').classList.remove('hidden');
}

// Универсальная функция инициализации автодополнения
function initAutocomplete(fieldId, useSemicolon) {
    const input = document.getElementById(fieldId);
    
    input.addEventListener("input", function(e) {
        const val = this.value;
        let currentInput = val;
        
        // Если используется разделитель ;, берем только последнюю часть
        if(useSemicolon) {
            const lastSemicolon = val.lastIndexOf(';');
            currentInput = lastSemicolon >= 0 ? val.substring(lastSemicolon + 1).trim() : val.trim();
        }
        
        closeAllLists();
        if (!currentInput) return false;
        
        const filteredNames = namesList.filter(name => 
            name.toLowerCase().includes(currentInput.toLowerCase())
        );
        
        if (filteredNames.length === 0) return;
        
        const list = document.createElement("div");
        list.setAttribute("class", "autocomplete-items");
        this.parentNode.appendChild(list);
        
        filteredNames.forEach(name => {
            const item = document.createElement("div");
            item.innerHTML = `<strong>${name.substr(0, currentInput.length)}</strong>${name.substr(currentInput.length)}`;
            item.innerHTML += `<input type='hidden' value='${name}'>`;
            item.addEventListener("click", function() {
                const selectedName = this.getElementsByTagName("input")[0].value;
                if(useSemicolon) {
                    const lastSemicolon = val.lastIndexOf(';');
                    let newValue = lastSemicolon >= 0 
                        ? val.substring(0, lastSemicolon + 1) + " " + selectedName
                        : selectedName;
                    input.value = newValue + "; ";
                } else {
                    input.value = selectedName;
                }
                closeAllLists();
            });
            list.appendChild(item);
        });
    });
    
    input.addEventListener("keydown", function(e) {
        const items = document.getElementsByClassName("autocomplete-items");
        if (items.length === 0) return;
        
        const activeItems = document.getElementsByClassName("autocomplete-active");
        
        if (e.keyCode === 40) { // Стрелка вниз
            e.preventDefault();
            if (activeItems.length === 0) {
                items[0].children[0].classList.add("autocomplete-active");
            } else {
                activeItems[0].classList.remove("autocomplete-active");
                if (activeItems[0].nextSibling) {
                    activeItems[0].nextSibling.classList.add("autocomplete-active");
                }
            }
        } else if (e.keyCode === 38) { // Стрелка вверх
            e.preventDefault();
            if (activeItems.length > 0) {
                activeItems[0].classList.remove("autocomplete-active");
                if (activeItems[0].previousSibling) {
                    activeItems[0].previousSibling.classList.add("autocomplete-active");
                }
            }
        } else if (e.keyCode === 13 && activeItems.length > 0) { // Enter
            e.preventDefault();
            activeItems[0].click();
        }
    });
    
    function closeAllLists(elmnt) {
        const items = document.getElementsByClassName("autocomplete-items");
        for (let i = 0; i < items.length; i++) {
            if (elmnt !== items[i] && elmnt !== input) {
                items[i].parentNode.removeChild(items[i]);
            }
        }
    }
    
    document.addEventListener("click", function(e) {
        closeAllLists(e.target);
    });
}

// Проверка и добавление новых имен в список
function checkAndAddNewNames(inputValue) {
    const names = inputValue.split(';')
        .map(name => name.trim())
        .filter(name => name.length > 0);
    
    names.forEach(name => {
        if (!namesList.includes(name)) {
            namesList.push(name);
        }
    });
    
    // Сохраняем обновленный список в localStorage
    localStorage.setItem('namesList', JSON.stringify(namesList));
}

// Генерация выговора
function generateReprimand() {
    const reporter = document.getElementById("reprimandReporter").value;
    const activity = document.getElementById("reprimandActivity").value;
    const violator = document.getElementById("violator").value;
    const violation = document.getElementById("violation").value;
    
    if (!reporter || !activity || !violator || !violation) {
        alert("Пожалуйста, заполните все обязательные поля (помеченные *)");
        return;
    }
    
    // Проверяем и добавляем новые имена в список
    checkAndAddNewNames(violator);
    
    let report = "```\n" +
                `#1. Докладывает: ${reporter}\n` +
                `#2. Проведено: ${activity}\n` +
                `#3. Нарушитель: ${violator}\n` +
                `#4. Нарушение: ${violation}\n` +
                `#5. Доказательства: \n` +
                "```";
    
    navigator.clipboard.writeText(report).then(() => {
        const output = document.getElementById("reprimandOutput");
        output.textContent = "Выговор успешно скопирован:\n\n" + report;
        output.style.display = "block";
    }).catch(err => {
        alert("Не удалось скопировать выговор: " + err);
    });
}

// Генерация спец-рапорта
const activityWorkTypes = {
    "Осуществление охранной деятельности": "Пункт 2.1.",
    "Контроль за проведением постовой деятельности": "Пункт 2.2.",
    "Контроль за проведением тренировочной деятельности": "Пункт 2.3.",
    "Проведение опроса на знание устава": "Пункт 2.4.",
    "Контроль за проведением агитационной деятельности": "Пункт 2.5.",
    "Осуществление привлечения к ответственности военнослужащего CT легиона": "Пункт 2.6.",
    "Контроль лекционной деятельности": "Пункт 2.7.",
    "Дежурство на территории Кадетской": "Пункт 2.8.",
    "Осуществление тренировочной/лекционной деятельности": "Пункт 2.9.",
    "Проведение лекции по уставу": "Пункт 2.10.",
    "Проверка личного состава": "Пункт 2.11.",
    "Осуществление задержания сотрудника УК": "Пункт 2.12.",
    "Обучение на должность кандидат/рекрут": "Пункт 2.13.",
    "Повышение/понижение в должности": "Пункт 2.14.",
    "Присвоение специальных наград": "Пункт 2.15."
};

function updateWorkTypes() {
    const activity = document.getElementById("activity").value;
    const workTypeDisplay = document.getElementById("workTypeDisplay");
    const workTypeInput = document.getElementById("workType");
    
    if (activity && activityWorkTypes[activity]) {
        workTypeDisplay.textContent = activityWorkTypes[activity];
        workTypeInput.value = activityWorkTypes[activity];
    } else {
        workTypeDisplay.textContent = "-- Выберите 'Проведено' --";
        workTypeInput.value = "";
    }
}

function generateReport() {
    const reporter = document.getElementById("reporter").value;
    const activity = document.getElementById("activity").value;
    const recipient = document.getElementById("recipient").value;
    const workType = document.getElementById("workType").value;
    const rating = document.getElementById("rating").value;
    
    if (!reporter || !activity || !recipient || !workType) {
        alert("Пожалуйста, заполните все обязательные поля (помеченные *)");
        return;
    }
    
    // Проверяем и добавляем новые имена в список
    checkAndAddNewNames(recipient);
    
    let report = "```\n" +
                `#1. Докладывает: ${reporter}\n` +
                `#2. Проведено: ${activity}\n` +
                `#3. Кому проведено: ${recipient}\n` +
                `#4. Деятельность УК: ${workType}\n` +
                `#5. Оценка: ${rating || "Не указана"}\n` +
                `#6. Доказательства: \n` +
                "```";
    
    navigator.clipboard.writeText(report).then(() => {
        const output = document.getElementById("output");
        output.textContent = "Рапорт успешно скопирован:\n\n" + report;
        output.style.display = "block";
    }).catch(err => {
        alert("Не удалось скопировать рапорт: " + err);
    });
}

// При загрузке страницы пытаемся загрузить сохраненные имена
document.addEventListener('DOMContentLoaded', function() {
    const savedNames = localStorage.getItem('namesList');
    if (savedNames) {
        namesList = JSON.parse(savedNames);
    }
    
    // Инициализация автозаполнения для полей "Докладывает" при загрузке
    initAutocomplete('reporter', false);
    initAutocomplete('reprimandReporter', false);
    
    // Инициализация обработчика изменения для поля "Проведено"
    document.getElementById('activity').addEventListener('change', updateWorkTypes);
});
