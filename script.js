// ==========================================
// EMPLOYEE MANAGEMENT DASHBOARD
// ==========================================

// API URL
const API_URL = "https://dummyjson.com/users";

// Main employee array
let employees = [];

// Current department filter
let selectedDepartment = "All";

// Current search text
let searchText = "";

// ==========================================
// DOM ELEMENTS
// ==========================================

const employeeContainer = document.getElementById("employeeContainer");
const employeeCount = document.getElementById("employeeCount");
const totalSalaryElement = document.getElementById("totalSalary");
const averageSalaryElement = document.getElementById("averageSalary");
const highestEmployeeElement = document.getElementById("highestEmployee");

const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const sortSelect = document.getElementById("sortSelect");

const employeeForm = document.getElementById("employeeForm");

const loadingMessage = document.getElementById("loadingMessage");
const statusMessage = document.getElementById("statusMessage");
const noEmployees = document.getElementById("noEmployees");

const currentDateElement = document.getElementById("currentDate");
const currentTimeElement = document.getElementById("currentTime");

// ==========================================
// DATE AND TIME
// ==========================================

function updateDateTime() {
    const now = new Date();

    const day = now.getDate();
    const month = now.toLocaleString("en-US", {
        month: "long"
    });
    const year = now.getFullYear();

    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    const period = hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12;

    currentDateElement.innerHTML =
        `Today: ${day} ${month} ${year}`;

    currentTimeElement.innerHTML =
        `Time: ${String(hours).padStart(2, "0")}:${minutes}:${seconds} ${period}`;
}

updateDateTime();

setInterval(updateDateTime, 1000);

// ==========================================
// FETCH EMPLOYEES FROM API
// ==========================================

function fetchEmployees() {

    loadingMessage.style.display = "block";
    statusMessage.style.display = "none";

    fetch(API_URL)
        .then(response => {

            if (!response.ok) {
                throw new Error("Failed to fetch employee data");
            }

            return response.json();
        })

        .then(data => {

            // Destructuring API response
            const { users } = data;

            // map() transforms API users into employee objects
            employees = users.map(user => {

                const {
                    id,
                    firstName,
                    lastName,
                    age,
                    email,
                    phone,
                    image,
                    company
                } = user;

                return {
                    id: id,
                    name: `${firstName} ${lastName}`,
                    age: age,
                    email: email,
                    phone: phone,
                    image: image,
                    department: company.department,
                    salary: 0,
                    isLocal: false
                };
            });

            displayEmployees();

            showStatus(
                "Employee data loaded successfully.",
                "success"
            );
        })

        .catch(error => {

            console.error("Error:", error);

            showStatus(
                "Unable to load employee data. Please try again.",
                "failure"
            );
        })

        .finally(() => {

            loadingMessage.style.display = "none";

            console.log("API request completed.");
        });
}

// ==========================================
// DISPLAY STATUS MESSAGE
// ==========================================

function showStatus(message, type) {

    statusMessage.innerHTML = message;
    statusMessage.className = `message ${type}`;
    statusMessage.style.display = "block";

    setTimeout(() => {
        statusMessage.style.display = "none";
    }, 3000);
}

// ==========================================
// GET FILTERED EMPLOYEES
// ==========================================

function getFilteredEmployees() {

    // Spread operator creates a new array
    let filteredEmployees = [...employees];

    // Search filter using filter() and includes()
    if (searchText !== "") {

        filteredEmployees = filteredEmployees.filter(employee =>
            employee.name.toLowerCase().includes(searchText.toLowerCase())
        );
    }

    // Department filter using if
    if (selectedDepartment !== "All") {

        filteredEmployees = filteredEmployees.filter(employee =>
            employee.department === selectedDepartment
        );
    }

    return filteredEmployees;
}

// ==========================================
// DISPLAY EMPLOYEES
// ==========================================

function displayEmployees() {

    employeeContainer.innerHTML = "";

    const filteredEmployees = getFilteredEmployees();

    // Update count
    updateEmployeeCount(filteredEmployees);

    // Calculate salary
    calculateSalary(filteredEmployees);

    // Display highest salary employee
    displayHighestSalaryEmployee(filteredEmployees);

    if (filteredEmployees.length === 0) {

        noEmployees.style.display = "block";
        return;

    } else {

        noEmployees.style.display = "none";
    }

    // forEach() displays each employee
    filteredEmployees.forEach(employee => {

        // createElement() creates a new card
        const card = document.createElement("div");
        card.className = "employee-card";

        // Create image
        const image = document.createElement("img");

        image.setAttribute("src", employee.image || "https://via.placeholder.com/100");
        image.setAttribute("alt", employee.name);

        // Create employee name
        const name = document.createElement("h3");
        name.innerHTML = employee.name;

        // Create details
        const age = document.createElement("p");
        age.innerHTML = `Age: ${employee.age}`;

        const email = document.createElement("p");
        email.innerHTML = `Email: ${employee.email}`;

        const phone = document.createElement("p");
        phone.innerHTML = `Phone: ${employee.phone || "Not available"}`;

        const department = document.createElement("span");
        department.className = "department-label";
        department.innerHTML = employee.department;

        const salary = document.createElement("p");
        salary.className = "salary";

        salary.innerHTML = employee.salary > 0
            ? `Salary: ${formatCurrency(employee.salary)}`
            : "Salary: Not specified";

        // Create delete button
        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.innerHTML = "Delete";

        // Event listener for delete
        deleteButton.addEventListener("click", () => {
            deleteEmployee(employee.id);
        });

        // Append elements to card
        card.appendChild(image);
        card.appendChild(name);
        card.appendChild(age);
        card.appendChild(email);
        card.appendChild(phone);
        card.appendChild(department);
        card.appendChild(salary);
        card.appendChild(deleteButton);

        // Append card to container
        employeeContainer.appendChild(card);
    });
}

// ==========================================
// SEARCH EMPLOYEES
// ==========================================

function searchEmployees() {

    searchText = searchInput.value.trim();

    displayEmployees();
}

// Search button event
searchButton.addEventListener("click", searchEmployees);

// Search while typing
searchInput.addEventListener("input", searchEmployees);

// ==========================================
// DEPARTMENT FILTER
// ==========================================

function filterDepartment(department) {

    selectedDepartment = department;

    // Update active button
    const departmentButtons =
        document.querySelectorAll(".department-btn");

    departmentButtons.forEach(button => {

        if (button.dataset.department === department) {
            button.classList.add("active");
        } else {
            button.classList.remove("active");
        }
    });

    displayEmployees();
}

// Add event listeners to department buttons
document.querySelectorAll(".department-btn").forEach(button => {

    button.addEventListener("click", () => {

        const department = button.dataset.department;

        filterDepartment(department);
    });
});

// ==========================================
// EMPLOYEE COUNT
// ==========================================

function updateEmployeeCount(filteredEmployees) {

    employeeCount.innerHTML = filteredEmployees.length;
}

// ==========================================
// SALARY CALCULATION
// ==========================================

function calculateSalary(filteredEmployees) {

    // reduce() calculates total salary
    const totalSalary = filteredEmployees.reduce(
        (total, employee) => total + employee.salary,
        0
    );

    // Calculate average salary
    const averageSalary = filteredEmployees.length > 0
        ? totalSalary / filteredEmployees.length
        : 0;

    totalSalaryElement.innerHTML = formatCurrency(totalSalary);

    averageSalaryElement.innerHTML = formatCurrency(averageSalary);
}

// ==========================================
// HIGHEST SALARY EMPLOYEE
// ==========================================

function displayHighestSalaryEmployee(filteredEmployees) {

    if (filteredEmployees.length === 0) {

        highestEmployeeElement.innerHTML = "No data";
        return;
    }

    // reduce() finds highest salary employee
    const highestEmployee = filteredEmployees.reduce(
        (highest, employee) => {

            return employee.salary > highest.salary
                ? employee
                : highest;

        },
        filteredEmployees[0]
    );

    if (highestEmployee.salary > 0) {

        highestEmployeeElement.innerHTML =
            `${highestEmployee.name}<br>${formatCurrency(highestEmployee.salary)}`;

    } else {

        highestEmployeeElement.innerHTML = "No salary data";
    }
}

// ==========================================
// FORMAT CURRENCY
// ==========================================

function formatCurrency(amount) {

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(amount);
}

// ==========================================
// ADD EMPLOYEE
// ==========================================

function addEmployee(event) {

    event.preventDefault();

    // Get form values
    const name = document.getElementById("employeeName").value.trim();
    const age = Number(document.getElementById("employeeAge").value);
    const email = document.getElementById("employeeEmail").value.trim();
    const department = document.getElementById("employeeDepartment").value;
    const salary = Number(document.getElementById("employeeSalary").value);

    // Validate form
    const isValid = validateEmployee(
        name,
        age,
        email,
        department,
        salary
    );

    if (!isValid) {
        return;
    }

    // Create employee object
    const newEmployee = {
        id: Date.now(),
        name: name,
        age: age,
        email: email,
        phone: "Not available",
        department: department,
        salary: salary,
        image: "https://i.pravatar.cc/150?img=12",
        isLocal: true
    };

    // Add object to array using spread operator
    employees = [...employees, newEmployee];

    // Display updated employees
    displayEmployees();

    // Clear form
    clearForm();

    showStatus(
        "Employee added successfully.",
        "success"
    );
}

// ==========================================
// VALIDATE EMPLOYEE
// ==========================================

function validateEmployee(name, age, email, department, salary) {

    // Clear previous errors
    clearErrors();

    let isValid = true;

    if (name === "") {

        document.getElementById("nameError").innerHTML =
            "❌ Please enter employee name";

        isValid = false;
    }

    if (age <= 18 || isNaN(age)) {

        document.getElementById("ageError").innerHTML =
            "❌ Age must be greater than 18";

        isValid = false;
    }

    if (email === "") {

        document.getElementById("emailError").innerHTML =
            "❌ Please enter employee email";

        isValid = false;
    }

    if (department === "") {

        document.getElementById("departmentError").innerHTML =
            "❌ Please select a department";

        isValid = false;
    }

    if (salary < 0 || isNaN(salary)) {

        document.getElementById("salaryError").innerHTML =
            "❌ Please enter a valid salary";

        isValid = false;
    }

    return isValid;
}

// ==========================================
// CLEAR VALIDATION ERRORS
// ==========================================

function clearErrors() {

    document.getElementById("nameError").innerHTML = "";
    document.getElementById("ageError").innerHTML = "";
    document.getElementById("emailError").innerHTML = "";
    document.getElementById("departmentError").innerHTML = "";
    document.getElementById("salaryError").innerHTML = "";
}

// ==========================================
// CLEAR FORM
// ==========================================

function clearForm() {

    employeeForm.reset();

    clearErrors();
}

// ==========================================
// DELETE EMPLOYEE
// ==========================================

function deleteEmployee(id) {

    // filter() removes the selected employee
    employees = employees.filter(employee => employee.id !== id);

    // Display updated array
    displayEmployees();

    showStatus(
        "Employee deleted successfully.",
        "success"
    );
}

// ==========================================
// SORT EMPLOYEES
// ==========================================

function sortEmployees() {

    const sortValue = sortSelect.value;

    // Sort the main array
    if (sortValue === "nameAsc") {

        employees.sort((a, b) =>
            a.name.localeCompare(b.name)
        );

    } else if (sortValue === "nameDesc") {

        employees.sort((a, b) =>
            b.name.localeCompare(a.name)
        );

    } else if (sortValue === "ageAsc") {

        employees.sort((a, b) => a.age - b.age);

    } else if (sortValue === "ageDesc") {

        employees.sort((a, b) => b.age - a.age);

    } else if (sortValue === "salaryAsc") {

        employees.sort((a, b) => a.salary - b.salary);

    } else if (sortValue === "salaryDesc") {

        employees.sort((a, b) => b.salary - a.salary);
    }

    displayEmployees();
}

// Sort event listener
sortSelect.addEventListener("change", sortEmployees);

// Form submit event
employeeForm.addEventListener("submit", addEmployee);

// ==========================================
// EXTRA ARRAY METHODS DEMONSTRATION
// ==========================================

// find() - Find an employee by ID
function findEmployee(id) {

    return employees.find(employee => employee.id === id);
}

// some() - Check whether at least one employee belongs to IT
function hasITEmployees() {

    return employees.some(employee => employee.department === "IT");
}

// every() - Check whether all employees are above 18
function areAllEmployeesAdults() {

    return employees.every(employee => employee.age > 18);
}

// map() - Create an array containing only employee names
function getEmployeeNames() {

    return employees.map(employee => employee.name);
}

// ==========================================
// START APPLICATION
// ==========================================

fetchEmployees();