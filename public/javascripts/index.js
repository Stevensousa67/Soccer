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

function populateStandingsTable(data) {
    // Get the table body
    const tableBody = document.getElementById('standings-table').getElementsByTagName('tbody')[0];

    // Loop through each team in the data and add to the table
    data.children[0].standings.entries.forEach((entry, index) => {
        const team = entry.team;
        const stats = entry.stats;

        // Create a new row and cells
        const row = document.createElement('tr');
        const rankCell = document.createElement('td');
        rankCell.classList.add('rank-cell');
        const teamCell = document.createElement('td');
        teamCell.classList.add('team-cell');
        const pointsCell = document.createElement('td');
        pointsCell.classList.add('points-cell');
        const matchesPlayedCell = document.createElement('td');
        matchesPlayedCell.classList.add('matches-played-cell');
        const winsCell = document.createElement('td');
        winsCell.classList.add('wins-cell');
        const drawsCell = document.createElement('td');
        drawsCell.classList.add('draws-cell');
        const lossesCell = document.createElement('td');
        lossesCell.classList.add('losses-cell');
        const goalDifferenceCell = document.createElement('td');
        goalDifferenceCell.classList.add('goal-difference-cell');

        // Set the text of the cells
        rankCell.textContent = stats[10].value;
        teamCell.textContent = team.displayName;
        pointsCell.textContent = stats[3].value;
        matchesPlayedCell.textContent = stats[0].value;
        winsCell.textContent = stats[7].value;
        drawsCell.textContent = stats[6].value;
        lossesCell.textContent = stats[1].value;
        goalDifferenceCell.textContent = stats[2].value;

        // Append the cells to the row
        row.appendChild(rankCell);
        row.appendChild(teamCell);
        row.appendChild(matchesPlayedCell);
        row.appendChild(pointsCell);
        row.appendChild(winsCell);
        row.appendChild(drawsCell);
        row.appendChild(lossesCell);
        row.appendChild(goalDifferenceCell);

        // Append the row to the table body
        tableBody.appendChild(row);
    });
}

// Fetch News API data
fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/bra.1/news')
    .then(response => {
        // Check if the response is successful
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json(); // Parse the JSON data
    })
    .then(data => {
        // Call the function to populate the news section with the fetched data
        populateNewsSection(data);
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });

function populateNewsSection(data) {
    // Get the news section
    const newsSection = document.getElementById('news-section');

    // Loop through each news item in the data and add to the news section
    data.articles.forEach((article, index) => {
        // Create a new card
        const card = document.createElement('div');
        card.classList.add('card');
        card.style.width = '20rem';
        card.style.marginBottom = '2rem';

        // Create an image element
        const image = document.createElement('img');
        image.classList.add('card-img-top');
        image.src = article.images[0].url;
        image.alt = 'News Image';

        // Create a card body
        const cardBody = document.createElement('div');
        cardBody.classList.add('card-body');

        // Create a card text
        const cardText = document.createElement('p');
        cardText.classList.add('card-text');
        cardText.textContent = article.headline;

        // Append the elements to the card
        cardBody.appendChild(cardText);
        card.appendChild(image);
        card.appendChild(cardBody);

        // Append the card to the news section
        newsSection.appendChild(card);
    });
}