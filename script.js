/* ========================================================
   STUDENT REGISTRATION SYSTEM - JAVASCRIPT (script.js)
   Beginner-friendly vanilla JavaScript logic
   Features: Add, Edit, Delete, Search, Form Validation,
             LocalStorage Persistence & Live Statistics
======================================================== */

// --- 1. LOCAL STORAGE KEY & APPLICATION STATE ---
const STORAGE_KEY = 'college_students_data';

// Array in memory to store the list of students
let students = [];

// Sample data for quick testing and hackathon demo
const SAMPLE_STUDENTS = [
    {
        id: 'CS202601',
        name: 'Aarav Sharma',
        email: 'aarav.sharma@example.com',
        phone: '9876543210',
        course: 'Computer Science & Engineering',
        year: '3rd Year'
    },
    {
        id: 'IT202615',
        name: 'Priya Patel',
        email: 'priya.patel@example.com',
        phone: '9123456780',
        course: 'Information Technology',
        year: '2nd Year'
    },
    {
        id: 'EC202622',
        name: 'Rahul Varma',
        email: 'rahul.varma@example.com',
        phone: '9845012345',
        course: 'Electronics & Communication',
        year: '4th Year'
    }
];

// --- 2. DOM ELEMENT REFERENCES ---
// Form elements
const studentForm = document.getElementById('student-form');
const editIdInput = document.getElementById('edit-id');
const nameInput = document.getElementById('student-name');
const idInput = document.getElementById('student-id');
const emailInput = document.getElementById('student-email');
const phoneInput = document.getElementById('student-phone');
const courseInput = document.getElementById('student-course');
const yearInput = document.getElementById('student-year');

// Buttons and headers
const formHeading = document.getElementById('form-heading');
const submitBtnText = document.getElementById('submit-btn-text');
const cancelBtn = document.getElementById('cancel-btn');
const editingBadge = document.getElementById('editing-badge');
const loadSampleBtn = document.getElementById('load-sample-btn');

// Table and search elements
const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search-btn');
const tableBody = document.getElementById('students-table-body');
const emptyState = document.getElementById('empty-state');
const emptyTitle = document.getElementById('empty-title');
const emptyDescription = document.getElementById('empty-description');

// Statistics and toast
const totalCountEl = document.getElementById('total-count');
const coursesCountEl = document.getElementById('courses-count');
const toastEl = document.getElementById('toast');

// Error message elements
const nameError = document.getElementById('name-error');
const idError = document.getElementById('id-error');
const emailError = document.getElementById('email-error');
const phoneError = document.getElementById('phone-error');
const courseError = document.getElementById('course-error');
const yearError = document.getElementById('year-error');

// --- 3. TOAST NOTIFICATION HELPER ---
let toastTimeout;
function showToast(message, type = 'success') {
    clearTimeout(toastTimeout);
    toastEl.textContent = message;
    toastEl.className = `toast ${type} show`;

    toastTimeout = setTimeout(() => {
        toastEl.className = 'toast';
    }, 3200);
}

// --- 4. LOCAL STORAGE FUNCTIONS ---
// Load students from localStorage
function loadStudentsFromStorage() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            students = JSON.parse(stored);
        } else {
            // First time loading: start with empty array
            students = [];
        }
    } catch (e) {
        console.error('Error loading data from localStorage', e);
        students = [];
    }
}

// Save students to localStorage
function saveStudentsToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

// --- 5. STATS CALCULATOR ---
function updateStats() {
    totalCountEl.textContent = students.length;

    // Count unique active courses
    const uniqueCourses = new Set(students.map(s => s.course));
    coursesCountEl.textContent = uniqueCourses.size;
}

// --- 6. FORM VALIDATION ---
function clearAllErrors() {
    nameError.textContent = '';
    idError.textContent = '';
    emailError.textContent = '';
    phoneError.textContent = '';
    courseError.textContent = '';
    yearError.textContent = '';

    [nameInput, idInput, emailInput, phoneInput, courseInput, yearInput].forEach(input => {
        input.classList.remove('input-error');
    });
}

function validateForm() {
    clearAllErrors();
    let isValid = true;

    const nameVal = nameInput.value.trim();
    const idVal = idInput.value.trim();
    const emailVal = emailInput.value.trim();
    const phoneVal = phoneInput.value.trim();
    const courseVal = courseInput.value;
    const yearVal = yearInput.value;
    const currentEditId = editIdInput.value;

    // 1. Name validation (letters and spaces only, minimum 2 characters)
    if (!nameVal) {
        nameError.textContent = 'Please enter student full name.';
        nameInput.classList.add('input-error');
        isValid = false;
    } else if (!/^[a-zA-Z\s.]{2,50}$/.test(nameVal)) {
        nameError.textContent = 'Name should only contain letters (min 2 chars).';
        nameInput.classList.add('input-error');
        isValid = false;
    }

    // 2. Student ID validation (alphanumeric, 3 to 15 characters, unique)
    if (!idVal) {
        idError.textContent = 'Please enter a Student ID.';
        idInput.classList.add('input-error');
        isValid = false;
    } else if (!/^[a-zA-Z0-9_-]{3,15}$/.test(idVal)) {
        idError.textContent = 'ID must be 3-15 alphanumeric characters.';
        idInput.classList.add('input-error');
        isValid = false;
    } else {
        // Check for duplicate ID (ignore if we are editing the same student)
        const isDuplicate = students.some(s => s.id.toLowerCase() === idVal.toLowerCase() && s.id !== currentEditId);
        if (isDuplicate) {
            idError.textContent = 'This Student ID is already registered.';
            idInput.classList.add('input-error');
            isValid = false;
        }
    }

    // 3. Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailVal) {
        emailError.textContent = 'Please enter student email.';
        emailInput.classList.add('input-error');
        isValid = false;
    } else if (!emailPattern.test(emailVal)) {
        emailError.textContent = 'Please enter a valid email address.';
        emailInput.classList.add('input-error');
        isValid = false;
    }

    // 4. Phone validation (10 digits)
    if (!phoneVal) {
        phoneError.textContent = 'Please enter phone number.';
        phoneInput.classList.add('input-error');
        isValid = false;
    } else if (!/^\d{10}$/.test(phoneVal)) {
        phoneError.textContent = 'Phone number must be exactly 10 digits.';
        phoneInput.classList.add('input-error');
        isValid = false;
    }

    // 5. Course validation
    if (!courseVal) {
        courseError.textContent = 'Please select a course.';
        courseInput.classList.add('input-error');
        isValid = false;
    }

    // 6. Year validation
    if (!yearVal) {
        yearError.textContent = 'Please select year of study.';
        yearInput.classList.add('input-error');
        isValid = false;
    }

    return isValid;
}

// Clear individual error as user types
[nameInput, idInput, emailInput, phoneInput, courseInput, yearInput].forEach(field => {
    field.addEventListener('input', () => {
        field.classList.remove('input-error');
        const errSpan = document.getElementById(`${field.id.replace('student-', '')}-error`);
        if (errSpan) errSpan.textContent = '';
    });
});

// Restrict phone input to numbers only
phoneInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
});

// --- 7. RENDER STUDENTS TABLE ---
function renderStudents(listToRender = students, searchTerm = '') {
    tableBody.innerHTML = '';

    if (listToRender.length === 0) {
        emptyState.style.display = 'flex';

        if (searchTerm.trim() !== '') {
            emptyTitle.textContent = 'No Matching Students Found';
            emptyDescription.textContent = `No records matched "${searchTerm}". Check the spelling or clear the search.`;
        } else {
            emptyTitle.textContent = 'No Students Registered Yet';
            emptyDescription.textContent = 'Use the registration form above or click "Load Demo Data" to get started.';
        }
        return;
    }

    emptyState.style.display = 'none';

    listToRender.forEach((student, index) => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${index + 1}</td>
            <td><span class="badge-id">${escapeHtml(student.id)}</span></td>
            <td><strong>${escapeHtml(student.name)}</strong></td>
            <td>${escapeHtml(student.email)}</td>
            <td>${escapeHtml(student.phone)}</td>
            <td><span class="badge-course">${escapeHtml(student.course)}</span></td>
            <td><span class="badge-year">${escapeHtml(student.year)}</span></td>
            <td class="text-center">
                <div class="table-actions">
                    <button class="btn btn-edit" onclick="startEdit('${escapeHtml(student.id)}')" title="Edit Student">
                        ✏️ Edit
                    </button>
                    <button class="btn btn-delete" onclick="deleteStudent('${escapeHtml(student.id)}')" title="Delete Student">
                        🗑️ Delete
                    </button>
                </div>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// Helper to prevent HTML injection in table
function escapeHtml(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// --- 8. ADD & UPDATE STUDENT ---
studentForm.addEventListener('submit', function (e) {
    e.preventDefault();

    // Validate inputs
    if (!validateForm()) {
        showToast('Please fix the errors in the form.', 'danger');
        return;
    }

    const currentEditId = editIdInput.value;
    const studentData = {
        id: idInput.value.trim().toUpperCase(),
        name: nameInput.value.trim(),
        email: emailInput.value.trim().toLowerCase(),
        phone: phoneInput.value.trim(),
        course: courseInput.value,
        year: yearInput.value
    };

    if (currentEditId) {
        // --- UPDATE EXISTING STUDENT ---
        const studentIndex = students.findIndex(s => s.id === currentEditId);
        if (studentIndex !== -1) {
            students[studentIndex] = studentData;
            saveStudentsToStorage();
            showToast(`Updated details for ${studentData.name}! ✨`, 'success');
        }
        exitEditMode();
    } else {
        // --- ADD NEW STUDENT ---
        students.push(studentData);
        saveStudentsToStorage();
        showToast(`Student ${studentData.name} registered successfully! 🎉`, 'success');
        studentForm.reset();
    }

    // Refresh UI
    updateStats();
    applyCurrentSearch();
});

// --- 9. EDIT STUDENT ---
window.startEdit = function (studentId) {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    // Populate form fields
    editIdInput.value = student.id;
    nameInput.value = student.name;
    idInput.value = student.id;
    emailInput.value = student.email;
    phoneInput.value = student.phone;
    courseInput.value = student.course;
    yearInput.value = student.year;

    // Change UI to Edit Mode
    formHeading.textContent = 'Edit Student Details';
    submitBtnText.textContent = 'Update Student';
    cancelBtn.style.display = 'inline-flex';
    editingBadge.style.display = 'inline-block';

    clearAllErrors();

    // Smooth scroll to form
    document.getElementById('register-section').scrollIntoView({ behavior: 'smooth' });
    nameInput.focus();
};

function exitEditMode() {
    editIdInput.value = '';
    formHeading.textContent = 'Register New Student';
    submitBtnText.textContent = 'Submit Registration';
    cancelBtn.style.display = 'none';
    editingBadge.style.display = 'none';
    studentForm.reset();
    clearAllErrors();
}

cancelBtn.addEventListener('click', exitEditMode);

document.getElementById('reset-btn').addEventListener('click', () => {
    if (editIdInput.value) {
        exitEditMode();
    }
    clearAllErrors();
});

// --- 10. DELETE STUDENT ---
window.deleteStudent = function (studentId) {
    const student = students.find(s => s.id === studentId);
    const studentName = student ? student.name : 'this student';

    const confirmed = confirm(`Are you sure you want to remove ${studentName} (ID: ${studentId})?`);
    if (!confirmed) return;

    // Remove student
    students = students.filter(s => s.id !== studentId);
    saveStudentsToStorage();

    // If currently editing the deleted student, reset the form
    if (editIdInput.value === studentId) {
        exitEditMode();
    }

    updateStats();
    applyCurrentSearch();
    showToast(`Removed ${studentName} from records.`, 'danger');
};

// --- 11. SEARCH & FILTER ---
function applyCurrentSearch() {
    const query = searchInput.value.trim().toLowerCase();

    if (query === '') {
        clearSearchBtn.style.display = 'none';
        renderStudents(students);
        return;
    }

    clearSearchBtn.style.display = 'block';

    const filtered = students.filter(student =>
        student.name.toLowerCase().includes(query) ||
        student.id.toLowerCase().includes(query) ||
        student.course.toLowerCase().includes(query)
    );

    renderStudents(filtered, query);
}

searchInput.addEventListener('input', applyCurrentSearch);

clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearSearchBtn.style.display = 'none';
    renderStudents(students);
    searchInput.focus();
});

// --- 12. LOAD SAMPLE DEMO DATA ---
loadSampleBtn.addEventListener('click', () => {
    if (students.length > 0) {
        const replace = confirm('Replace existing student list with sample demo data?');
        if (!replace) return;
    }

    students = JSON.parse(JSON.stringify(SAMPLE_STUDENTS));
    saveStudentsToStorage();
    exitEditMode();
    updateStats();
    searchInput.value = '';
    clearSearchBtn.style.display = 'none';
    renderStudents(students);
    showToast('Demo data loaded successfully! 🚀', 'info');
});

// --- 13. INITIALIZE ON PAGE LOAD ---
document.addEventListener('DOMContentLoaded', () => {
    loadStudentsFromStorage();
    updateStats();
    renderStudents(students);
});
