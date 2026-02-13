// Initialize auto-increment ID counter from localStorage
let currentId = localStorage.getItem('registrationId') ? 
    parseInt(localStorage.getItem('registrationId')) : 0;

// Function to generate next ID
function generateNextId() {
    currentId++;
    localStorage.setItem('registrationId', currentId);
    return currentId;
}

// Get form elements
const form = document.getElementById('registrationForm');
const idInput = document.getElementById('id');
const firstNameInput = document.getElementById('firstName');
const middleNameInput = document.getElementById('middleName');
const lastNameInput = document.getElementById('lastName');
const dateOfBirthInput = document.getElementById('dateOfBirth');
const addressInput = document.getElementById('address');

// Initialize ID field on page load
window.addEventListener('DOMContentLoaded', function() {
    idInput.value = generateNextId();
    displayRegisteredUsers();
});

// Handle form submission
form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Validate required fields
    if (!firstNameInput.value.trim() || !lastNameInput.value.trim() || !dateOfBirthInput.value || !addressInput.value.trim()) {
        alert('Please fill in all required fields!');
        return;
    }
    
    // Collect form data
    const registrationData = {
        id: idInput.value,
        firstName: firstNameInput.value.trim(),
        middleName: middleNameInput.value.trim(),
        lastName: lastNameInput.value.trim(),
        dateOfBirth: dateOfBirthInput.value,
        address: addressInput.value.trim()
    };
    
    // Save data to localStorage
    let registrations = JSON.parse(localStorage.getItem('registrations')) || [];
    registrations.push(registrationData);
    localStorage.setItem('registrations', JSON.stringify(registrations));
    
    // Show success message
    alert('Registration saved successfully!\nID: ' + registrationData.id);
    
    // Clear form and generate new ID
    form.reset();
    idInput.value = generateNextId();
    
    // Refresh the table display
    displayRegisteredUsers();
    
    // Log saved data to console
    console.log('Saved Registration:', registrationData);
    console.log('All Registrations:', registrations);
});

// Function to display registered users in table
function displayRegisteredUsers() {
    const tableBody = document.getElementById('usersTableBody');
    const registrations = JSON.parse(localStorage.getItem('registrations')) || [];
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Add rows for each registration
    registrations.forEach((user, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.firstName}</td>
            <td>${user.middleName || '-'}</td>
            <td>${user.lastName}</td>
            <td>${user.address}</td>
            <td><button class="delete-btn" onclick="deleteUser(${index})">Delete</button></td>
        `;
        tableBody.appendChild(row);
    });
}

// Function to delete a user
function deleteUser(index) {
    if (confirm('Are you sure you want to delete this user?')) {
        let registrations = JSON.parse(localStorage.getItem('registrations')) || [];
        registrations.splice(index, 1);
        localStorage.setItem('registrations', JSON.stringify(registrations));
        displayRegisteredUsers();
        alert('User deleted successfully!');
    }
}

// Handle clear button
const clearButton = form.querySelector('[type="reset"]');
clearButton.addEventListener('click', function() {
    // Reset generates a new ID
    setTimeout(() => {
        idInput.value = generateNextId();
    }, 0);
});
