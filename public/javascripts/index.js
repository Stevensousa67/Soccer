fetch('/checkAuth')
    .then(response => response.json())
    .then(data => {
        if (data.isAuthenticated) {
            document.getElementById('authButtons').classList.add('d-none'); // Hide buttons for non-authenticated users
            document.getElementById('loggedInButtons').classList.remove('d-none'); // Show buttons for authenticated users
            //document.getElementById('scoreboardLink').classList.remove('d-none'); // Show Scoreboard link
            //document.getElementById('myStatsLink').classList.remove('d-none'); // Show My Team's Stats link
            if (data.logoUrl) {
                const logo = document.getElementById('logo');
                logo.src = data.logoUrl; // Update logo src with team logo URL
            }

            document.getElementById('logOut').addEventListener('click', function () {
                // Send request to log out the user
                fetch('/logout')
                    .then(response => {
                        if (response.ok) {
                            // Redirect to the login page after successful logout
                            window.location.href = '/login';
                        } else {
                            console.error('Logout failed');
                        }
                    })
                    .catch(error => console.error('Error during logout:', error));
            });

        } else {
            document.getElementById('authButtons').classList.remove('d-none'); // Show buttons for non-authenticated users
            document.getElementById('loggedInButtons').classList.add('d-none'); // Hide buttons for authenticated users
            document.getElementById('scoreboardLink').classList.add('d-none'); // Hide Scoreboard link
            document.getElementById('myStatsLink').classList.add('d-none'); // Hide My Team's Stats link
        }
    });

// Fetch the Standings API data
fetch('https://site.web.api.espn.com/apis/v2/sports/soccer/bra.1/standings?season=2024')
    .then(response => {
        // Check if the response is successful
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json(); // Parse the JSON data
    })
    .then(data => {
        // Call the function to populate the standings table with the fetched data
        populateStandingsTable(data);
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });

// Function to populate the standings table dynamically
function populateStandingsTable(data) {
    const standingsList = document.getElementById('standings-table'); // Select the list by its ID

    // Loop through each team in the data and create HTML elements
    data.children[0].standings.entries.forEach((entry, index) => {
        const team = entry.team;
        const stats = entry.stats;
        console.log(team, stats)

        // Create li element for each team
        const listItem = document.createElement('li');
        listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');

        // Populate the li element with team data
        listItem.innerHTML = `
            <span>${stats[10].value}</span>
            <!-- <span><img src="${team.logos[0].href}" alt="${team.displayName}" style="width: 20px; height: 20px;"></span> -->
            <span>${team.displayName}</span>
            <span>${stats[3].value}</span>
            <span>${stats[0].value}</span>
            <span>${stats[7].value}</span>
            <span>${stats[6].value}</span>
            <span>${stats[1].value}</span>
            <span>${stats[2].value}</span>
        `;

        // Append the li element to the standings list
        standingsList.appendChild(listItem);
    });
}
