// ==========================================
// AURA RESORTS & HOTELES - JAVASCRIPT
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    initDatePickers();
    initNavbarScroll();
    initHotelFilters();
});

/**
 * Configura las fechas mínimas y por defecto del formulario de reserva
 */
function initDatePickers() {
    const checkinInput = document.getElementById('checkin');
    const checkoutInput = document.getElementById('checkout');

    if (!checkinInput || !checkoutInput) return;

    // Fecha actual para Check-in
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    checkinInput.min = todayStr;
    checkinInput.value = todayStr;

    // Fecha de salida por defecto (+3 días)
    const defaultCheckout = new Date();
    defaultCheckout.setDate(defaultCheckout.getDate() + 3);
    const checkoutStr = defaultCheckout.toISOString().split('T')[0];
    checkoutInput.min = todayStr;
    checkoutInput.value = checkoutStr;

    // Actualizar mínimo de salida cuando cambia la entrada
    checkinInput.addEventListener('change', () => {
        const nextDay = new Date(checkinInput.value);
        nextDay.setDate(nextDay.getDate() + 1);
        const minCheckout = nextDay.toISOString().split('T')[0];
        checkoutInput.min = minCheckout;
        if (checkoutInput.value <= checkinInput.value) {
            checkoutInput.value = minCheckout;
        }
    });
}

/**
 * Efecto de sombra y fondo en la barra de navegación al hacer scroll
 */
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(15, 23, 42, 0.98)';
            navbar.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.3)';
        } else {
            navbar.style.background = 'rgba(26, 46, 59, 0.92)';
            navbar.style.boxShadow = 'none';
        }
    });
}

/**
 * Sistema de Notificaciones Toast flotantes
 */
function showToast(message, type = 'success') {
    let toast = document.getElementById('toast');
    let toastText = document.getElementById('toast-text');

    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span id="toast-text"></span>`;
        document.body.appendChild(toast);
        toastText = document.getElementById('toast-text');
    }

    if (toastText) {
        toastText.innerText = message;
    }

    // Color según el tipo
    if (type === 'info') {
        toast.style.background = '#2563eb';
    } else if (type === 'warning') {
        toast.style.background = '#f59e0b';
    } else {
        toast.style.background = '#10b981';
    }

    toast.classList.add('show');

    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

/**
 * Búsqueda y filtrado interactivo de hoteles según el destino y fechas
 */
function searchRooms() {
    const destinationSelect = document.getElementById('destination');
    const checkin = document.getElementById('checkin').value;
    const checkout = document.getElementById('checkout').value;
    const guests = document.getElementById('guests').options[document.getElementById('guests').selectedIndex].text;

    const selectedDest = destinationSelect.options[destinationSelect.selectedIndex].text;
    const destValue = destinationSelect.value.toLowerCase();

    // Calcular número de noches
    const nights = calculateNights(checkin, checkout);

    showToast(`Buscando resorts en ${selectedDest} para ${guests} (${nights} noches)...`, 'info');

    // Desplazar a la sección de hoteles
    const hotelesSection = document.getElementById('hoteles');
    if (hotelesSection) {
        hotelesSection.scrollIntoView({ behavior: 'smooth' });
    }

    // Filtrar visualmente las tarjetas
    filterHotels(destValue);
}

/**
 * Filtra las tarjetas de hoteles visibles según el destino
 */
function filterHotels(destination) {
    const cards = document.querySelectorAll('.hotel-card');
    let found = 0;

    cards.forEach(card => {
        const locationText = card.querySelector('.card-location').innerText.toLowerCase();
        if (destination === 'all' || locationText.includes(destination)) {
            card.style.display = 'flex';
            card.style.animation = 'fadeIn 0.5s ease forwards';
            found++;
        } else {
            card.style.display = 'none';
        }
    });

    if (found === 0) {
        // Si no hay ninguno específico de ese destino, volver a mostrar todos
        cards.forEach(c => c.style.display = 'flex');
    }
}

function initHotelFilters() {
    // Escuchar cambios directos en el desplegable
    const select = document.getElementById('destination');
    if (select) {
        select.addEventListener('change', () => {
            filterHotels(select.value);
        });
    }
}

/**
 * Calcula la diferencia en noches entre dos fechas
 */
function calculateNights(start, end) {
    const d1 = new Date(start);
    const d2 = new Date(end);
    const diff = Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));
    return diff;
}

/**
 * Procesa la reserva con confirmación y cálculo de precio estimado
 */
function bookHotel(hotelName) {
    const checkin = document.getElementById('checkin').value;
    const checkout = document.getElementById('checkout').value;
    const nights = calculateNights(checkin, checkout);

    showToast(`¡Solicitud enviada para ${hotelName}! Estancia de ${nights} noche(s). Te contactaremos en breve.`, 'success');
}

/**
 * Copia el código promocional con un clic
 */
function applyPromo() {
    const code = "AURA15";
    navigator.clipboard.writeText(code).then(() => {
        showToast(`¡Cupón ${code} copiado al portapapeles! 15% de descuento aplicado.`, 'success');
    }).catch(() => {
        showToast(`¡Código promocional AURA15 activado con éxito!`, 'success');
    });
}
