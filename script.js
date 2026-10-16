// Referencias a elementos del DOM (Document Object Model) - Conectamos las variables de JS con los elementos del HTML
const form = document.getElementById('expense-form');
const descriptionInput = document.getElementById('description'); // El input donde escribimos la descripción
const amountInput = document.getElementById('amount'); // El input donde escribimos el monto del gasto
const descError = document.getElementById('desc-error'); // Donde mostraremos errores de descripción
const amountError = document.getElementById('amount-error'); // Donde mostraremos errores de monto
const expenseList = document.getElementById('expense-list'); // La lista <ul> donde se mostrarán los gastos
const statusIndicator = document.getElementById('status'); // Indicador de "En línea" o "Sin conexión"

// Referencias a elementos relacionados con el saldo
const initialBalanceInput = document.getElementById('initial-balance');
const currentBalanceDisplay = document.getElementById('current-balance');

// --- Configuración de IndexedDB (Base de datos en el navegador) ---
const dbName = 'ExpensesDB'; // Nombre de nuestra base de datos
const dbVersion = 1; // Versión de la base de datos
let db; // Variable global para guardar la conexión a la base de datos

// Pedimos al navegador abrir o crear la base de datos
const request = indexedDB.open(dbName, dbVersion);

// Si hay un error al abrir la BD, lo mostramos en consola
request.onerror = (event) => {
    console.error("IndexedDB error: ", event.target.errorCode);
};

// Este evento ocurre la primera vez que se crea la BD o cuando subimos la versión (dbVersion)
request.onupgradeneeded = (event) => {
    db = event.target.result;
    // Creamos un "almacén de objetos" (como una tabla en SQL) llamado "expenses"
    // Le decimos que cada gasto tendrá un "id" automático (autoIncrement)
    const objectStore = db.createObjectStore("expenses", { keyPath: "id", autoIncrement: true });
    // Creamos índices para poder buscar por estos campos si quisiéramos después
    objectStore.createIndex("description", "description", { unique: false });
    objectStore.createIndex("amount", "amount", { unique: false });
    objectStore.createIndex("date", "date", { unique: false });
};

// Si la base de datos se abre con éxito, guardamos la referencia, cargamos el saldo y renderizamos los gastos
request.onsuccess = (event) => {
    db = event.target.result;
    loadInitialBalance();
    renderExpenses();
};

// --- Lógica de Saldo ---
// Función para cargar el saldo inicial guardado previamente
function loadInitialBalance() {
    // Leemos el valor guardado en localStorage (otra forma más sencilla de guardar datos en el navegador)
    const savedBalance = localStorage.getItem('initialBalance');
    if (savedBalance) {
        initialBalanceInput.value = savedBalance; // Si hay uno, lo ponemos en el input
    }
}

// Escuchamos cada vez que el usuario escribe en el input de saldo inicial
initialBalanceInput.addEventListener('input', () => {
    // Convertimos lo que escribió a un número decimal (float), o a 0 si está vacío/inválido
    const val = parseFloat(initialBalanceInput.value) || 0;
    // Guardamos ese valor en localStorage para que no se pierda si recarga la página
    localStorage.setItem('initialBalance', val);
    renderExpenses(); // Volvemos a renderizar los gastos para recalcular el saldo restante
});

// Función para calcular y mostrar el saldo restante
function calculateAndUpdateBalance(totalExpenses) {
    // Obtenemos el saldo inicial
    const initialBalance = parseFloat(initialBalanceInput.value) || 0;
    // Restamos todos los gastos acumulados
    const currentBalance = initialBalance - totalExpenses;
    
    // Actualizamos el texto en pantalla, forzando a mostrar 2 decimales (toFixed)
    currentBalanceDisplay.textContent = `$${currentBalance.toFixed(2)}`;
    
    // Alerta visual si nos quedamos sin saldo (el saldo es negativo)
    if (currentBalance < 0) {
        currentBalanceDisplay.style.color = 'var(--error-color)'; // Lo ponemos en rojo
    } else {
        currentBalanceDisplay.style.color = 'var(--primary-color)'; // Color normal
    }
}

// --- Notificaciones tipo "Toast" ---
// Muestra un pequeño mensaje de éxito temporal
function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div'); // Creamos un <div>
    toast.className = 'toast'; // Le damos la clase CSS
    
    // Rellenamos el div con HTML (un emoji y el mensaje)
    toast.innerHTML = `<span>✅</span> <div>${message}</div>`;
    
    container.appendChild(toast); // Lo añadimos al contenedor en pantalla
    
    // Desaparece después de 3 segundos (3000 milisegundos)
    setTimeout(() => {
        toast.classList.add('hide'); // Añade la clase que activa la animación CSS de salida
        // Esperamos a que termine la animación (transitionend) antes de borrarlo del HTML
        toast.addEventListener('transitionend', () => {
            toast.remove();
        });
    }, 3000);
}

// --- Validaciones de Formularios ---
// Función genérica para validar cualquier input
function validateInput(input, errorElement, validationFn, errorMsg) {
    // Llamamos a la función de validación que nos pasan por parámetro
    const isValid = validationFn(input.value);
    // Cambiamos atributos de accesibilidad
    input.setAttribute("aria-invalid", !isValid);
    // Mostramos el mensaje de error si es inválido, o lo borramos si es válido
    errorElement.textContent = isValid ? "" : errorMsg;
    return isValid;
}

// Validar mientras el usuario escribe en "Descripción" (al menos un carácter, ignorando espacios al inicio/fin)
descriptionInput.addEventListener('input', () => {
    validateInput(descriptionInput, descError, (val) => val.trim().length > 0, "La descripción no puede estar vacía.");
});

// Validar mientras el usuario escribe en "Monto" (debe ser mayor a 0)
amountInput.addEventListener('input', () => {
    validateInput(amountInput, amountError, (val) => parseFloat(val) > 0, "El monto debe ser mayor a 0.");
});

// --- Acciones de Gastos (Formulario) ---
// Escuchamos cuando el usuario hace click en "Guardar Gasto" (hace 'submit' del form)
form.addEventListener('submit', (e) => {
    e.preventDefault(); // Evitamos que la página se recargue (comportamiento por defecto del form)
    
    // Validamos ambos campos antes de guardar
    const isDescValid = validateInput(descriptionInput, descError, (val) => val.trim().length > 0, "La descripción no puede estar vacía.");
    const isAmountValid = validateInput(amountInput, amountError, (val) => parseFloat(val) > 0, "El monto debe ser mayor a 0.");
    
    // Si todo está correcto, procedemos a guardar
    if (isDescValid && isAmountValid) {
        const description = descriptionInput.value.trim();
        // Creamos el objeto gasto con los datos a guardar
        const expense = {
            description: description,
            amount: parseFloat(amountInput.value),
            date: new Date().toISOString() // Fecha y hora actuales en formato estándar
        };
        
        // Llamamos a la función que guarda en la base de datos
        addExpenseToDB(expense);
        
        // Mostrar la notificación de éxito
        showToast(`<strong>${description}</strong> agregado`);
        
        // Limpiamos el formulario para añadir otro
        form.reset();
        // Reiniciamos los atributos de validación visual
        descriptionInput.setAttribute("aria-invalid", "false");
        amountInput.setAttribute("aria-invalid", "false");
        
        // Retornamos el foco (cursor) al campo de descripción para que el usuario escriba más rápido sin usar el ratón
        descriptionInput.focus();
    } else {
        // Si hay errores, mandamos el cursor al input que falló
        if (!isDescValid) descriptionInput.focus();
        else if (!isAmountValid) amountInput.focus();
    }
});

// Función que inserta un gasto en IndexedDB
function addExpenseToDB(expense) {
    // Abrimos una "transacción" en modo lectura/escritura (readwrite)
    const transaction = db.transaction(["expenses"], "readwrite");
    const objectStore = transaction.objectStore("expenses");
    // Añadimos el nuevo registro
    const addRequest = objectStore.add(expense);
    
    // Si se añadió con éxito, actualizamos la lista en pantalla
    addRequest.onsuccess = () => {
        renderExpenses();
    };
}

// Función para eliminar un gasto usando su ID único de la BD
function deleteExpense(id) {
    const transaction = db.transaction(["expenses"], "readwrite");
    const objectStore = transaction.objectStore("expenses");
    // Eliminamos el registro por su id
    const request = objectStore.delete(id);
    
    // Una vez borrado, actualizamos la lista
    request.onsuccess = () => {
        renderExpenses();
    };
}

// Función que lee todos los gastos y los "dibuja" (renderiza) en el HTML
function renderExpenses() {
    expenseList.innerHTML = ''; // Limpiamos la lista actual en HTML para volver a llenarla
    let totalExpenses = 0; // Acumulador del total gastado
    
    // Abrimos una transacción en modo solo lectura (readonly)
    const transaction = db.transaction(["expenses"], "readonly");
    const objectStore = transaction.objectStore("expenses");
    
    // Abrimos un cursor para iterar (recorrer) cada gasto guardado en la BD
    objectStore.openCursor().onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
            // Sumamos este gasto al total acumulado
            totalExpenses += cursor.value.amount;
            
            // Creamos los elementos HTML mediante JS: <li>, <div>, <h3>, <p>, <span>, <button>
            const li = document.createElement('li');
            
            const infoDiv = document.createElement('div');
            infoDiv.className = 'expense-info';
            
            const title = document.createElement('h3');
            title.textContent = cursor.value.description; // El texto del H3 será la descripción
            
            const date = document.createElement('p');
            // Formateamos la fecha al estilo local del usuario (ej: DD/MM/YYYY)
            date.textContent = new Date(cursor.value.date).toLocaleDateString();
            
            // Metemos el título y fecha dentro del div de info
            infoDiv.appendChild(title);
            infoDiv.appendChild(date);
            
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'expense-actions';
            
            const amount = document.createElement('span');
            amount.className = 'expense-amount';
            // Formateamos el monto con $ y 2 decimales
            amount.textContent = `$${cursor.value.amount.toFixed(2)}`;
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.setAttribute('aria-label', `Eliminar gasto de ${cursor.value.description}`);
            deleteBtn.textContent = 'Eliminar';
            
            // Cuando hacen click en borrar, llamamos a deleteExpense enviándole el ID de ese gasto
            // Usamos una función anónima (closure) para asegurar que cada botón capture su propio ID
            deleteBtn.onclick = (function(id) {
                return function() {
                    deleteExpense(id);
                }
            })(cursor.value.id);
            
            // Juntamos todos los elementos en el <li>
            actionsDiv.appendChild(amount);
            actionsDiv.appendChild(deleteBtn);
            
            li.appendChild(infoDiv);
            li.appendChild(actionsDiv);
            
            // Añadimos el <li> al <ul> del HTML
            expenseList.appendChild(li);
            
            // Le decimos al cursor que avance al siguiente registro de la BD
            cursor.continue();
        } else {
            // Cuando el cursor no tiene más resultados (ya recorrió todos los gastos):
            // Calculamos y actualizamos el saldo final en pantalla
            calculateAndUpdateBalance(totalExpenses);
        }
    };
}

// --- Estado de Conexión (Online/Offline) ---
// Función para cambiar la etiqueta visual que dice "En línea" o "Sin conexión"
function updateOnlineStatus() {
    // navigator.onLine devuelve un booleano (true o false) dependiendo del internet
    if (navigator.onLine) {
        statusIndicator.textContent = "En línea";
        statusIndicator.className = "status-online";
    } else {
        statusIndicator.textContent = "Sin conexión";
        statusIndicator.className = "status-offline";
    }
}

// Escuchamos eventos del sistema operativo para darnos cuenta cuando nos conectamos/desconectamos de red
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
updateOnlineStatus(); // Ejecutamos la función una vez al inicio para ver el estado actual

// --- Registro del Service Worker ---
// Comprobamos si el navegador soporta Service Workers (PWA)
if ('serviceWorker' in navigator) {
    // Esperamos a que toda la página termine de cargar
    window.addEventListener('load', () => {
        // Registramos nuestro archivo sw.js
        navigator.serviceWorker.register('sw.js');
    });
}
