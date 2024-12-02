document.addEventListener('DOMContentLoaded', () => {
    // Add event listeners to tab buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            openTab(tabName);
        });
    });

    // Add event listener to the search button
    const searchButton = document.getElementById('searchButton');
    searchButton.addEventListener('click', searchConnections);
});

function openTab(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));

    // Reset all tab buttons
    const buttons = document.querySelectorAll('.tab-button');
    buttons.forEach(button => button.classList.remove('active'));

    // Activate the selected tab and button
    document.getElementById(tabName).classList.add('active');
    const activeButton = document.querySelector(`.tab-button[data-tab="${tabName}"]`);
    activeButton.classList.add('active');
}

function searchConnections() {
    // Get user input
    const from = document.getElementById('from').value;
    const to = document.getElementById('to').value;

    // Display placeholder results
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = `<p>Searching for connections from ${from} to ${to}...</p>`;

    // TODO: Add logic to fetch and display results
}
