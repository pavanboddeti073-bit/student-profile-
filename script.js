/**
 * ============================================================================
 * STUDENT MARKS CALCULATOR - JAVASCRIPT
 * ============================================================================
 * A beginner-friendly, clean script that demonstrates:
 * 1. DOM Element Selection
 * 2. Form Input Validation (Empty fields & range 0-100)
 * 3. Calculation Logic (Total, Percentage, Grade boundaries, Pass/Fail condition)
 * 4. Dynamic UI Updates (Result Card, Subject Breakdown Table, Status Badges)
 * 5. Clear All functionality & Classroom Demo Presets
 * ============================================================================
 */

// Wait until the HTML document is fully loaded before running script
document.addEventListener("DOMContentLoaded", () => {

    // ------------------------------------------------------------------------
    // 1. DOM ELEMENT REFERENCES
    // ------------------------------------------------------------------------
    const form = document.getElementById("marks-form");
    const clearBtn = document.getElementById("btn-clear");
    const studentNameInput = document.getElementById("student-name");

    // Subject input elements mapped with their display names
    const subjects = [
        { id: "maths", name: "Mathematics", input: document.getElementById("maths"), error: document.getElementById("maths-error") },
        { id: "english", name: "English", input: document.getElementById("english"), error: document.getElementById("english-error") },
        { id: "cs", name: "Computer Science", input: document.getElementById("cs"), error: document.getElementById("cs-error") },
        { id: "physics", name: "Physics", input: document.getElementById("physics"), error: document.getElementById("physics-error") },
        { id: "chemistry", name: "Chemistry", input: document.getElementById("chemistry"), error: document.getElementById("chemistry-error") }
    ];

    const nameError = document.getElementById("name-error");

    // Result card containers
    const resultPlaceholder = document.getElementById("result-placeholder");
    const reportCard = document.getElementById("report-card");

    // Output elements inside the report card
    const resStudentName = document.getElementById("res-student-name");
    const resStatusBadge = document.getElementById("res-status-badge");
    const resTotal = document.getElementById("res-total");
    const resPercentage = document.getElementById("res-percentage");
    const resGrade = document.getElementById("res-grade");
    const resStatusBanner = document.getElementById("res-status-banner");
    const resBannerIcon = document.getElementById("res-banner-icon");
    const resBannerText = document.getElementById("res-banner-text");
    const resTableBody = document.getElementById("res-table-body");

    // Classroom demo preset buttons
    const demoPassBtn = document.getElementById("btn-demo-pass");
    const demoFailBtn = document.getElementById("btn-demo-fail");

    // ------------------------------------------------------------------------
    // 2. INPUT VALIDATION FUNCTIONS
    // ------------------------------------------------------------------------

    /**
     * Shows an error message for an input field and adds red border
     * @param {HTMLElement} inputElem - The input element
     * @param {HTMLElement} errorElem - The span/element showing error text
     * @param {string} message - The error message to display
     */
    function showError(inputElem, errorElem, message) {
        inputElem.classList.add("is-invalid");
        errorElem.textContent = message;
    }

    /**
     * Clears error message and restores normal border
     * @param {HTMLElement} inputElem - The input element
     * @param {HTMLElement} errorElem - The error text element
     */
    function clearError(inputElem, errorElem) {
        inputElem.classList.remove("is-invalid");
        errorElem.textContent = "";
    }

    /**
     * Validates all form inputs. Returns false if any input is invalid.
     * @returns {boolean} isValid
     */
    function validateForm() {
        let isValid = true;
        let firstInvalidInput = null;

        // 1. Validate Student Name
        const nameValue = studentNameInput.value.trim();
        if (nameValue === "") {
            showError(studentNameInput, nameError, "Please enter the student's name.");
            isValid = false;
            firstInvalidInput = firstInvalidInput || studentNameInput;
        } else if (nameValue.length < 2) {
            showError(studentNameInput, nameError, "Name must be at least 2 characters long.");
            isValid = false;
            firstInvalidInput = firstInvalidInput || studentNameInput;
        } else {
            clearError(studentNameInput, nameError);
        }

        // 2. Validate Each Subject Mark (0 to 100)
        subjects.forEach(subject => {
            const rawValue = subject.input.value.trim();

            if (rawValue === "") {
                showError(subject.input, subject.error, `Please enter marks for ${subject.name}.`);
                isValid = false;
                firstInvalidInput = firstInvalidInput || subject.input;
                return;
            }

            const numValue = Number(rawValue);

            if (isNaN(numValue)) {
                showError(subject.input, subject.error, "Marks must be a valid number.");
                isValid = false;
                firstInvalidInput = firstInvalidInput || subject.input;
            } else if (numValue < 0 || numValue > 100) {
                showError(subject.input, subject.error, "Marks must be between 0 and 100.");
                isValid = false;
                firstInvalidInput = firstInvalidInput || subject.input;
            } else {
                clearError(subject.input, subject.error);
            }
        });

        // Set focus to the first field that failed validation for better UX
        if (firstInvalidInput) {
            firstInvalidInput.focus();
        }

        return isValid;
    }

    // ------------------------------------------------------------------------
    // 3. GRADE & PASS/FAIL CALCULATION LOGIC
    // ------------------------------------------------------------------------

    /**
     * Calculates Grade based on the grading criteria:
     * - A+ : 90 to 100%
     * - A  : 80 to 89.99%
     * - B  : 70 to 79.99%
     * - C  : 60 to 69.99%
     * - D  : 35 to 59.99%
     * - F  : Below 35% OR Failed in any individual subject (< 35)
     * 
     * @param {number} percentage - The calculated percentage
     * @param {boolean} isPassed - Whether the student passed all individual subjects
     * @returns {string} Grade (A+, A, B, C, D, or F)
     */
    function calculateGrade(percentage, isPassed) {
        // If student failed in one or more subjects, the final awarded grade is F
        if (!isPassed) {
            return "F";
        }

        if (percentage >= 90) {
            return "A+";
        } else if (percentage >= 80) {
            return "A";
        } else if (percentage >= 70) {
            return "B";
        } else if (percentage >= 60) {
            return "C";
        } else if (percentage >= 35) {
            return "D";
        } else {
            return "F";
        }
    }

    /**
     * Executes the calculation and displays the marksheet
     */
    function processCalculation() {
        // Step 1: Validate form inputs
        if (!validateForm()) {
            return;
        }

        const studentName = studentNameInput.value.trim();

        // Step 2: Read marks and calculate total
        let totalMarks = 0;
        let isPassed = true;
        const failedSubjects = [];
        const subjectDetails = [];

        subjects.forEach(subject => {
            const mark = parseFloat(subject.input.value);
            totalMarks += mark;

            // Individual subject pass mark is 35
            const subjectPassed = mark >= 35;
            if (!subjectPassed) {
                isPassed = false;
                failedSubjects.push(subject.name);
            }

            subjectDetails.push({
                name: subject.name,
                max: 100,
                min: 35,
                scored: mark,
                passed: subjectPassed
            });
        });

        // Step 3: Calculate percentage (out of 500)
        // Format to 2 decimal places, e.g. 85.50
        const percentage = (totalMarks / 500) * 100;
        const formattedPercentage = percentage.toFixed(2);

        // Step 4: Determine Grade
        const grade = calculateGrade(percentage, isPassed);

        // Step 5: Render Results to the UI
        displayResults({
            studentName,
            totalMarks,
            percentage: formattedPercentage,
            grade,
            isPassed,
            failedSubjects,
            subjectDetails
        });
    }

    // ------------------------------------------------------------------------
    // 4. UI RENDERING FUNCTION
    // ------------------------------------------------------------------------

    /**
     * Renders calculated marksheet into the Result Card
     * @param {object} result - Computed student result data
     */
    function displayResults(result) {
        // Populate Student Name
        resStudentName.textContent = result.studentName;

        // Populate Total Marks & Percentage
        // If total is whole number, display integer; otherwise show 1 or 2 decimals
        resTotal.textContent = Number.isInteger(result.totalMarks) ? result.totalMarks : result.totalMarks.toFixed(1);
        resPercentage.textContent = `${result.percentage}%`;
        resGrade.textContent = result.grade;

        // Set Grade Color Class
        resGrade.className = "stat-value stat-grade";

        // PASS / FAIL Badge & Status Banner
        if (result.isPassed) {
            resStatusBadge.textContent = "PASS";
            resStatusBadge.className = "badge badge-pass";

            resStatusBanner.className = "status-banner banner-pass";
            resBannerIcon.textContent = "✅";
            resBannerText.textContent = "Congratulations! Passed all 5 subjects with minimum 35 marks.";
        } else {
            resStatusBadge.textContent = "FAIL";
            resStatusBadge.className = "badge badge-fail";

            resStatusBanner.className = "status-banner banner-fail";
            resBannerIcon.textContent = "⚠️";

            if (result.failedSubjects.length > 0) {
                resBannerText.textContent = `Result: FAIL. Scored below 35 in: ${result.failedSubjects.join(", ")}.`;
            } else {
                resBannerText.textContent = "Result: FAIL. Total percentage is below 35%.";
            }
        }

        // Populate Subject Breakdown Table
        resTableBody.innerHTML = "";
        result.subjectDetails.forEach(sub => {
            const row = document.createElement("tr");
            if (!sub.passed) {
                row.classList.add("row-fail");
            }

            row.innerHTML = `
                <td><strong>${sub.name}</strong></td>
                <td>${sub.max}</td>
                <td>${sub.min}</td>
                <td><strong>${sub.scored}</strong></td>
                <td>
                    <span class="status-tag ${sub.passed ? 'status-tag-pass' : 'status-tag-fail'}">
                        ${sub.passed ? 'PASS' : 'FAIL (< 35)'}
                    </span>
                </td>
            `;
            resTableBody.appendChild(row);
        });

        // Hide Placeholder & Show Report Card
        resultPlaceholder.style.display = "none";
        reportCard.style.display = "block";

        // Smooth scroll to result on mobile/smaller screens
        if (window.innerWidth < 992) {
            reportCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
    }

    // ------------------------------------------------------------------------
    // 5. CLEAR ALL FUNCTIONALITY
    // ------------------------------------------------------------------------

    /**
     * Resets form, removes errors, and restores result placeholder
     */
    function clearAll() {
        // Reset form inputs
        form.reset();

        // Clear all validation errors
        clearError(studentNameInput, nameError);
        subjects.forEach(subject => {
            clearError(subject.input, subject.error);
        });

        // Hide Report Card & Show Placeholder
        reportCard.style.display = "none";
        resultPlaceholder.style.display = "block";

        // Reset student name focus
        studentNameInput.focus();
    }

    // ------------------------------------------------------------------------
    // 6. EVENT LISTENERS
    // ------------------------------------------------------------------------

    // Submit form -> Process Calculation
    form.addEventListener("submit", (event) => {
        event.preventDefault(); // Prevent default page refresh
        processCalculation();
    });

    // Clear All button click
    clearBtn.addEventListener("click", () => {
        clearAll();
    });

    // Live validation cleanup: Clear error as soon as user edits an input
    studentNameInput.addEventListener("input", () => {
        if (studentNameInput.value.trim() !== "") {
            clearError(studentNameInput, nameError);
        }
    });

    subjects.forEach(subject => {
        subject.input.addEventListener("input", () => {
            const val = subject.input.value.trim();
            if (val !== "") {
                const num = Number(val);
                if (!isNaN(num) && num >= 0 && num <= 100) {
                    clearError(subject.input, subject.error);
                }
            }
        });
    });

    // ------------------------------------------------------------------------
    // 7. CLASSROOM DEMO PRESETS (Helper buttons for instant demonstrations)
    // ------------------------------------------------------------------------

    // Preset 1: PASS scenario (Aarav Sharma - Total: 439, 87.80%, Grade A, PASS)
    demoPassBtn.addEventListener("click", () => {
        clearAll();
        studentNameInput.value = "Aarav Sharma";
        document.getElementById("maths").value = 92;
        document.getElementById("english").value = 85;
        document.getElementById("cs").value = 95;
        document.getElementById("physics").value = 83;
        document.getElementById("chemistry").value = 84;
        processCalculation();
    });

    // Preset 2: FAIL scenario (Rahul Verma - High marks in 4 subjects, but 28 in Physics)
    // This perfectly demonstrates the rule: "Show PASS only if EVERY subject >= 35"
    demoFailBtn.addEventListener("click", () => {
        clearAll();
        studentNameInput.value = "Rahul Verma";
        document.getElementById("maths").value = 88;
        document.getElementById("english").value = 76;
        document.getElementById("cs").value = 92;
        document.getElementById("physics").value = 28; // < 35 FAIL
        document.getElementById("chemistry").value = 74;
        processCalculation();
    });

});
