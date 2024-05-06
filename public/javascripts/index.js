const countries = ['bra', 'usa', 'ger', 'eng', 'esp', 'ita', 'fra'];
const randomIndex = Math.floor(Math.random() * countries.length);
const randomCountry = countries[randomIndex];
const seasonYear = (randomCountry === 'usa' || randomCountry === 'bra') ? 2024 : 2023;

fetch('/checkAuth')
    .then(response => response.json())
    .then(data => {
        console.log(data);
        if (data.isAuthenticated) {
            document.getElementById('authButtons').classList.add('d-none'); // Hide buttons for non-authenticated users
            document.getElementById('loggedInButtons').classList.remove('d-none'); // Show buttons for authenticated users
            if (data.logoUrl) {
                const logo = document.getElementById('logo');
                logo.src = data.logoUrl; // Update logo src with team logo URL
            }

            // Add event listener for logout button
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

            // Show/hide links based on authentication status
            //document.getElementById('scoreboardLink').classList.remove('d-none');
            //document.getElementById('myStatsLink').classList.remove('d-none');

            const preferredCountry = data.preferredCountry;
            const userSeasonYear = (data.preferredCountry === 'usa' || data.preferredCountry === 'bra') ? 2024 : 2023;
            fetchPreferredLeagueData(preferredCountry, userSeasonYear);
        } else {
            document.getElementById('authButtons').classList.remove('d-none'); // Show buttons for non-authenticated users
            document.getElementById('loggedInButtons').classList.add('d-none'); // Hide buttons for authenticated users
            document.getElementById('scoreboardLink').classList.add('d-none'); // Hide Scoreboard link
            document.getElementById('myStatsLink').classList.add('d-none'); // Hide My Team's Stats link
            fetchRandomCountryData();
        }
    });


function fetchPreferredLeagueData(league, userSeasonYear) {
    // Fetch preferred league data as before
    fetch(`https://site.web.api.espn.com/apis/v2/sports/soccer/${league}.1/standings?season=${userSeasonYear}`)
        .then(response => {
            // Check if the response is successful
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); // Parse the JSON data
        })
        .then(data => {
            // Populate standings table with preferred league data
            populateStandingsTable(data);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });

    // Fetch news for the preferred league
    fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${league}.1/news`)
        .then(response => {
            // Check if the response is successful
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); // Parse the JSON data
        })
        .then(data => {
            // Populate news section with preferred league data
            populateNewsSection(data);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });

    // Fetch upcoming matches for the preferred league
    fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${league}.1/scoreboard`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Populate upcoming matches section with preferred league data
            populateUpcomingMatchesSection(data);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function fetchRandomCountryData() {
    // Fetch random country data as before
    fetch(`https://site.web.api.espn.com/apis/v2/sports/soccer/${randomCountry}.1/standings?season=${seasonYear}`)
        .then(response => {
            // Check if the response is successful
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); // Parse the JSON data
        })
        .then(data => {
            // Populate standings table with random country data
            populateStandingsTable(data);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });

    fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${randomCountry}.1/news`)
        .then(response => {
            // Check if the response is successful
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); // Parse the JSON data
        })
        .then(data => {
            // Populate news section with random country data
            populateNewsSection(data);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });

    fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${randomCountry}.1/scoreboard`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Populate upcoming matches section with random country data
            populateUpcomingMatchesSection(data);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function populateStandingsTable(data) {
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

function populateNewsSection(data) {
    const newsSection = document.getElementById('news-section');
    data.articles.forEach((article, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.style.width = '100%';
        card.style.marginBottom = '2rem';
        if (article.images && article.images.length > 0) {
            const image = document.createElement('img');
            image.classList.add('card-img-top', 'img-fluid');
            image.src = article.images[0].url;
            image.alt = 'News Image';
            card.appendChild(image);
        }
        const cardBody = document.createElement('div');
        cardBody.classList.add('card-body');
        const cardText = document.createElement('a');
        cardText.classList.add('card-text');
        cardText.href = article.links.web.href;
        cardText.target = '_blank';
        cardText.textContent = article.headline;
        cardText.style.textDecoration = 'none';
        cardBody.appendChild(cardText);
        card.appendChild(cardBody);
        newsSection.appendChild(card);
    });
}

function populateUpcomingMatchesSection(data) {
    const upcomingMatchesSection = document.getElementById('upcomingMatches');
    data.events.forEach((event, index) => {
        const li = document.createElement('li');
        li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center', 'flex-column');
        const div1 = document.createElement('div');
        div1.classList.add('text-center', 'mb-2');
        const imgHomeLogo = document.createElement('img');
        imgHomeLogo.src = event.competitions[0].competitors[0].team.logo;
        imgHomeLogo.style.width = '40px';
        imgHomeLogo.style.height = '40px';
        const spanHomeScore = document.createElement('span');
        spanHomeScore.textContent = event.competitions[0].competitors[0].score;
        const spanDash = document.createElement('span');
        spanDash.textContent = '   -   ';
        const spanAwayScore = document.createElement('span');
        spanAwayScore.textContent = event.competitions[0].competitors[1].score;
        const imgAwayLogo = document.createElement('img');
        imgAwayLogo.src = event.competitions[0].competitors[1].team.logo;
        imgAwayLogo.style.width = '40px';
        imgAwayLogo.style.height = '40px';
        div1.appendChild(imgHomeLogo);
        div1.appendChild(spanHomeScore);
        div1.appendChild(spanDash);
        div1.appendChild(spanAwayScore);
        div1.appendChild(imgAwayLogo);
        const div2 = document.createElement('div');
        div2.classList.add('text-center');
        const spanDate = document.createElement('span');
        spanDate.textContent = event.date;
        const spanLocation = document.createElement('span');
        spanLocation.textContent = event.venue.displayName;
        const spanStatus = document.createElement('span');
        spanStatus.textContent = event.status.type.detail;
        div2.appendChild(spanDate);
        div2.appendChild(spanLocation);
        div2.appendChild(spanStatus);
        li.appendChild(div1);
        li.appendChild(div2);
        upcomingMatchesSection.appendChild(li);
    });
}
