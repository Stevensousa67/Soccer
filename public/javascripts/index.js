fetch('/checkAuth')
    .then(response => response.json())
    .then(data => {
        if (data.isAuthenticated) {
            document.getElementById('authButtons').classList.add('d-none'); // Hide buttons for non-authenticated users
            document.getElementById('loggedInButtons').classList.remove('d-none'); // Show buttons for authenticated users
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
                            window.location.href = '/';
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
        card.style.width = '100%';
        card.style.marginBottom = '2rem';

        // Create an image element
        const image = document.createElement('img');
        image.classList.add('card-img-top', 'img-fluid');
        image.src = article.images[0].url;
        image.alt = 'News Image';

        // Create a card body
        const cardBody = document.createElement('div');
        cardBody.classList.add('card-body');

        // Create a card text
        const cardText = document.createElement('a');
        cardText.classList.add('card-text');
        cardText.href = article.links.web.href;
        cardText.target = '_blank'; // Open link in a new tab
        cardText.textContent = article.headline;
        cardText.style.textDecoration = 'none'; // Remove underline from link

        // Append the elements to the card
        cardBody.appendChild(cardText);
        card.appendChild(image);
        card.appendChild(cardBody);

        // Append the card to the news section
        newsSection.appendChild(card);
    });
}

// Fetch upcoming matches API data

// fetch preferred tournament
fetch('/getUserInfo')
    .then(response => response.json())
    .then(data => {
        const country = data.country;
        // get upcoming matches
        return fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${country}.1/scoreboard`);
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        populateUpcomingMatchesSection(data);
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });

function populateUpcomingMatchesSection(data) {
    // Get the upcoming matches section
    const upcomingMatchesSection = document.getElementById('upcomingMatches');
    // iterate over data.events
    data.events.forEach((event, index) => {
        // create a new li element
        const li = document.createElement('li');
        li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center', 'flex-column'); // Add flex-column class for stacking divs vertically

        // Create a new div element for the first row
        const div1 = document.createElement('div');
        div1.classList.add('text-center', 'mb-2'); // Add Bootstrap classes
        // create img element for home team logo
        const imgHomeLogo = document.createElement('img');
        imgHomeLogo.src = event.competitions[0].competitors[0].team.logo;
        imgHomeLogo.style.width = '40px';
        imgHomeLogo.style.height = '40px';
        // create span element for home team score, if available
        const spanHomeScore = document.createElement('span');
        spanHomeScore.textContent = event.competitions[0].competitors[0].score;
        // create span element for the dash
        const spanDash = document.createElement('span');
        spanDash.textContent = '   -   ';
        // create span element for away team score, if available
        const spanAwayScore = document.createElement('span');
        spanAwayScore.textContent = event.competitions[0].competitors[1].score;
        // create img element for away team logo
        const imgAwayLogo = document.createElement('img');
        imgAwayLogo.src = event.competitions[0].competitors[1].team.logo;
        imgAwayLogo.style.width = '40px';
        imgAwayLogo.style.height = '40px';
        // Append the elements to the first row div
        div1.appendChild(imgHomeLogo);
        div1.appendChild(spanHomeScore);
        div1.appendChild(spanDash);
        div1.appendChild(spanAwayScore);
        div1.appendChild(imgAwayLogo);

        // Create a new div element for the second row
        const div2 = document.createElement('div');
        div2.classList.add('text-center'); // Add Bootstrap classes
        // create span element for the game date
        const spanDate = document.createElement('span');
        spanDate.textContent = event.date;
        // create span element for the game location
        const spanLocation = document.createElement('span');
        spanLocation.textContent = event.venue.displayName;
        // create span element for game status (if full time or not)
        const spanStatus = document.createElement('span');
        spanStatus.textContent = event.status.type.detail;
        // Append the elements to the second row div
        div2.appendChild(spanDate);
        div2.appendChild(spanLocation);
        div2.appendChild(spanStatus);

        // Append the divs to the li
        li.appendChild(div1);
        li.appendChild(div2);

        // Append the li element to the ul element
        upcomingMatchesSection.appendChild(li);
    });
}

// future implementation (make homepage display only preferred tournament standings and news, and preferred team's schedule):
// // get preferred team's id and tournament country
// fetch('/getUserInfo')
//     .then(response => response.json())
//     .then(data => {
//         const teamId = data.teamId;
//         const country = data.country;
//         // get team's schedule
//         return fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${country}.1/teams/${teamId}/schedule`);
//     })
//     .then(response => {
//         if (!response.ok) {
//             throw new Error('Network response was not ok');
//         }
//         return response.json(); // Parse the JSON data
//     })
//     .then(data => {
//         console.log(data); // Log the parsed JSON data
//     })
//     .catch(error => {
//         console.error('There was a problem with the fetch operation:', error);
//     });

// // Display the team's schedule
// document.getElementById('upcomingGames');
// // Loop through each game in the data and add to the upcoming games section
// data.forEach((game, index) => {
//     if (index === 0) return; // Skip the first iteration
//     // Create a new li element
//     console.log(game.date);
//     const li = document.createElement('li');
//     li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
//     // Create a span element for the game date
//     const spanDate = document.createElement('span');
//     spanDate.textContent = game.date;
//     // Create a span element for the game time
//     const spanTime = document.createElement('span');
//     spanTime.textContent = game.time;
//     // Create a span element for the game opponent
//     const spanOpponent = document.createElement('span');
//     spanOpponent.textContent = game.opponent;
//     // Append the span elements to the li element
//     li.appendChild(spanDate);
//     li.appendChild(spanTime);
//     li.appendChild(spanOpponent);
//     // Append the li element to the ul element
//     ul.appendChild(li);
// });