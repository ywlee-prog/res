// Tab functionality
function openTab(tabName) {
    const tabContents = document.getElementsByClassName('tab-content');
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].style.display = 'none';
    }

    const tabButtons = document.getElementsByClassName('tab-button');
    for (let i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove('active');
    }

    document.getElementById(tabName).style.display = 'block';
    event.currentTarget.classList.add('active');
}

// Set minimum date to today
window.onload = function() {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    const todayFormatted = yyyy + '-' + mm + '-' + dd;
    
    const dateInput = document.getElementById('date');
    if (dateInput) {
        dateInput.min = todayFormatted;
        dateInput.value = todayFormatted;
    }
    
    updateTimeOptions();
};

// Client-side storage
let reservations = JSON.parse(localStorage.getItem('reservations')) || [];
const startTimeSelect = document.getElementById('startTime');
const endTimeSelect = document.getElementById('endTime');

// Check if a time slot is available
function isTimeSlotAvailable(date, room, startTime, endTime) {
    if (!date || !room) return true;
    
    const toMinutes = (time) => {
        const [h, m] = time.split(':').map(Number);
        return h * 60 + m;
    };
    
    const newStart = toMinutes(startTime);
    const newEnd = toMinutes(endTime);
    
    return !reservations.some(res => {
        if (res.date !== date || res.room !== room) return false;
        
        const resStart = toMinutes(res.startTime);
        const resEnd = toMinutes(res.endTime);
        
        return newStart < resEnd && newEnd > resStart;
    });
}

// Update the time selection dropdowns
function updateTimeOptions() {
    const date = document.getElementById('date').value;
    const room = document.querySelector('input[name="room"]:checked')?.value;
    
    if (!date || !room) return;
    
    const startSelect = document.getElementById('startTime');
    startSelect.innerHTML = '<option value="">시작 시간 선택</option>';
    
    for (let hour = 9; hour <= 17; hour++) {
        const time = `${hour.toString().padStart(2, '0')}:00`;
        const option = document.createElement('option');
        option.value = time;
        
        if (isTimeSlotAvailable(date, room, time, `${hour + 1}:00`)) {
            option.textContent = `${time} (예약 가능)`;
            option.className = 'available-slot';
        } else {
            option.textContent = `${time} (예약 불가)`;
            option.className = 'unavailable-slot';
            option.disabled = true;
        }
        
        startSelect.appendChild(option);
    }
    
    updateEndTimeOptions();
}

// Update end time options based on selected start time
function updateEndTimeOptions() {
    const date = document.getElementById('date').value;
    const room = document.querySelector('input[name="room"]:checked')?.value;
    const startTime = document.getElementById('startTime').value;
    
    if (!startTime) {
        const endSelect = document.getElementById('endTime');
        endSelect.innerHTML = '<option value="">시작 시간을 먼저 선택해주세요</option>';
        return;
    }
    
    const startHour = parseInt(startTime.split(':')[0]);
    const endSelect = document.getElementById('endTime');
    endSelect.innerHTML = '<option value="">종료 시간 선택</option>';
    
    let hasAvailableSlots = false;
    
    for (let hour = startHour + 1; hour <= 18; hour++) {
        const time = `${hour.toString().padStart(2, '0')}:00`;
        const option = document.createElement('option');
        option.value = time;
        
        if (isTimeSlotAvailable(date, room, startTime, time)) {
            option.textContent = `${time} (예약 가능)`;
            option.className = 'available-slot';
            hasAvailableSlots = true;
        } else {
            option.textContent = `${time} (예약 불가)`;
            option.className = 'unavailable-slot';
            option.disabled = true;
        }
        
        endSelect.appendChild(option);
    }
    
    if (!hasAvailableSlots) {
        const option = document.createElement('option');
        option.disabled = true;
        option.textContent = '선택 가능한 종료 시간이 없습니다';
        endSelect.appendChild(option);
    }
    
    const submitButton = document.querySelector('#reservationForm button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = !hasAvailableSlots;
    }
}

// Show message to user
function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    if (!messageDiv) return;
    
    messageDiv.textContent = message;
    messageDiv.className = `alert ${type}`;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}

// Update reservations list
function updateReservationsList() {
    const reservationsList = document.getElementById('reservationsList');
    if (!reservationsList) return;
    
    reservationsList.innerHTML = '';
    
    if (reservations.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="6" class="no-data">예약 내역이 없습니다.</td>';
        reservationsList.appendChild(row);
        return;
    }
    
    const sortedReservations = [...reservations].sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.startTime.localeCompare(b.startTime);
    });
    
    sortedReservations.forEach(reservation => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${reservation.date}</td>
            <td>${reservation.timeRange || reservation.startTime}</td>
            <td>${reservation.room}</td>
            <td>${reservation.name}</td>
            <td>${reservation.department || '-'}</td>
            <td>${reservation.meetingPurpose || '-'}</td>
        `;
        reservationsList.appendChild(row);
    });
}

// Add styles for time slots
const style = document.createElement('style');
style.textContent = `
    .available-slot {
        color: #28a745;
        font-weight: normal;
    }
    .unavailable-slot {
        color: #dc3545;
        text-decoration: line-through;
        font-style: italic;
    }
    select option:disabled {
        color: #dc3545;
        background-color: #f8f9fa;
    }
    select option[value=""] {
        color: #6c757d;
    }
`;
document.head.appendChild(style);

// Event listeners
document.getElementById('startTime')?.addEventListener('change', updateEndTimeOptions);
document.getElementById('date')?.addEventListener('change', updateTimeOptions);
document.querySelectorAll('input[name="room"]').forEach(radio => {
    radio.addEventListener('change', updateTimeOptions);
});

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    updateTimeOptions();
    updateReservationsList();
    
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('date');
    if (dateInput) {
        dateInput.min = today;
        if (!dateInput.value) {
            dateInput.value = today;
        }
    }
});
