const countries = ['bra', 'usa', 'ger', 'eng', 'esp', 'ita', 'fra'];
const randomIndex = Math.floor(Math.random() * countries.length);
const randomCountry = countries[randomIndex];
const seasonYear = (randomCountry === 'usa' || randomCountry === 'bra') ? `${new Date().getFullYear()}` : `${new Date().getFullYear() - 1}`;
var today = new Date();
var lastSevenDays = [];
// Loop through the last seven days, starting with yesterday
for (var i = 1; i <= 7; i++) {
    var day = new Date(today);
    day.setDate(today.getDate() - i);
    lastSevenDays.push(day.toISOString().slice(0, 10).replace(/-/g, ''));
}

// Function to fetch data for the selected league on navbar click
function fetchLeagueData(league) {
    const seasonYear = (league === 'usa' || league === 'bra') ? `${new Date().getFullYear()}` : `${new Date().getFullYear() - 1}`;
    const previousMatchesSection = document.getElementById('previousMatches');
    previousMatchesSection.innerHTML = ''; // Clear previous data
    fetchPreferredLeagueData(league, seasonYear);
}

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

            // Add event listener for logout button
            document.getElementById('logOut').addEventListener('click', function () {
                fetch('/logout')
                    .then(response => {
                        if (response.ok) {
                            window.location.href = '/';
                        } else {
                            console.error('Logout failed');
                        }
                    })
                    .catch(error => console.error('Error during logout:', error));
            });

            const preferredCountry = data.preferredCountry;
            const userSeasonYear = (data.preferredCountry === 'usa' || data.preferredCountry === 'bra') ? `${new Date().getFullYear()}` : `${new Date().getFullYear() - 1}`;
            fetchPreferredLeagueData(preferredCountry, userSeasonYear);
        } else {
            document.getElementById('authButtons').classList.remove('d-none'); // Show buttons for non-authenticated users
            document.getElementById('loggedInButtons').classList.add('d-none'); // Hide buttons for authenticated users
            fetchRandomCountryData();
        }
    });


function fetchPreferredLeagueData(league, userSeasonYear) {
    // Fetch preferred league data as before
    fetch(`https://site.web.api.espn.com/apis/v2/sports/soccer/${league}.1/standings?season=${userSeasonYear}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            populateStandingsTable(data);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });

    // Fetch news for the preferred league
    fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${league}.1/news`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
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
            populateUpcomingMatchesSection(data);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });

    // Fetch previous matches for the preferred league
    async function fetchPreviousMatches() {
        for (let date = 0; date < lastSevenDays.length; date++) {
            try {
                const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${league}.1/scoreboard?dates=${lastSevenDays[date]}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                populatePreviousMatchesSection(data);
            } catch (error) {
                console.error('There was a problem with the fetch operation:', error);
            }
        }
    }
    fetchPreviousMatches();

}

function fetchRandomCountryData() {
    // Fetch standings for the random country
    fetch(`https://site.web.api.espn.com/apis/v2/sports/soccer/${randomCountry}.1/standings?season=${seasonYear}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            populateStandingsTable(data);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });

    // Fetch news for the random country
    fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${randomCountry}.1/news`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            populateNewsSection(data);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });

    // Fetch upcoming matches for the random country
    fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${randomCountry}.1/scoreboard`)
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

    // Fetch previous matches for the random country
    for (let date = 0; date < lastSevenDays.length; date++) {
        fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${randomCountry}.1/scoreboard?dates=${lastSevenDays[date]}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                populatePreviousMatchesSection(data);
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
    }
}

function populateStandingsTable(data) {
    const tableBody = document.getElementById('standings-table').getElementsByTagName('tbody')[0];
    const secondConferenceTableBody = document.getElementById('second-conference-table').getElementsByTagName('tbody')[0];

    tableBody.innerHTML = ''; // Clear previous data
    secondConferenceTableBody.innerHTML = ''; // Clear previous data

    // Function to create a row
    function createRow(entry) {
        const team = entry.team;
        const stats = entry.stats;

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

        rankCell.textContent = stats[10].value;
        teamCell.textContent = team.displayName;
        pointsCell.textContent = stats[3].value;
        matchesPlayedCell.textContent = stats[0].value;
        winsCell.textContent = stats[7].value;
        drawsCell.textContent = stats[6].value;
        lossesCell.textContent = stats[1].value;
        goalDifferenceCell.textContent = stats[2].value;

        row.appendChild(rankCell);
        row.appendChild(teamCell);
        row.appendChild(matchesPlayedCell);
        row.appendChild(pointsCell);
        row.appendChild(winsCell);
        row.appendChild(drawsCell);
        row.appendChild(lossesCell);
        row.appendChild(goalDifferenceCell);

        return row;
    }

    const westernConferenceTitle = document.getElementById('western-conference-title');
    const easternConferenceTitle = document.getElementById('eastern-conference-title');
    const westernConferenceTable = document.getElementById('second-conference-table');

    // Check if the league is USA
    if (data.abbreviation === "MLS") {
        // Show conference titles
        westernConferenceTitle.style.display = 'block';
        westernConferenceTable.style.display = 'block';
        easternConferenceTitle.style.display = 'block';

        // Sort and iterate over Eastern Conference
        data.children[0].standings.entries.sort((a, b) => a.stats[10].value - b.stats[10].value).forEach((entry, index) => {
            const row = createRow(entry);
            tableBody.appendChild(row);
        });

        // Sort and iterate over Western Conference
        data.children[1].standings.entries.sort((a, b) => a.stats[10].value - b.stats[10].value).forEach((entry, index) => {
            const row = createRow(entry);
            secondConferenceTableBody.appendChild(row);
        });
    } else {
        // Hide conference titles and second table
        westernConferenceTitle.style.display = 'none';
        westernConferenceTable.style.display = 'none';
        easternConferenceTitle.style.display = 'none';

        // For other leagues, populate a single table
        data.children[0].standings.entries.forEach((entry, index) => {
            const row = createRow(entry);
            tableBody.appendChild(row);
        });
    }
}

function populateNewsSection(data) {
    const newsSection = document.getElementById('news-section');
    newsSection.innerHTML = ''; // Clear previous data
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
    upcomingMatchesSection.innerHTML = ''; // Clear previous data
    data.events.forEach((event, index) => {
        const li = document.createElement('li');
        li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center', 'flex-column');
        const div1 = document.createElement('div');
        div1.classList.add('text-center', 'mb-2');
        const imgHomeLogo = document.createElement('img');
        imgHomeLogo.src = event.competitions[0].competitors[0].team.logo;
        imgHomeLogo.style.width = '30px';
        imgHomeLogo.style.height = '30px';
        const spanHomeScore = document.createElement('span');
        spanHomeScore.textContent = event.competitions[0].competitors[0].score;
        const spanDash1 = document.createElement('span');
        spanDash1.textContent = '   -   ';
        const spanDash2 = document.createElement('span');
        spanDash2.textContent = '   -   ';
        const spanAwayScore = document.createElement('span');
        spanAwayScore.textContent = event.competitions[0].competitors[1].score;
        const imgAwayLogo = document.createElement('img');
        imgAwayLogo.src = event.competitions[0].competitors[1].team.logo;
        imgAwayLogo.style.width = '30px';
        imgAwayLogo.style.height = '30px';
        div1.appendChild(imgHomeLogo);
        div1.appendChild(spanHomeScore);
        div1.appendChild(spanDash1);
        div1.appendChild(spanAwayScore);
        div1.appendChild(imgAwayLogo);
        const div2 = document.createElement('div');
        div2.classList.add('text-center');
        const spanLocation = document.createElement('span');
        spanLocation.textContent = event.venue.displayName;
        const spanStatus = document.createElement('span');
        spanStatus.textContent = event.status.type.detail;
        div2.appendChild(spanLocation);
        div2.appendChild(spanDash2);
        div2.appendChild(spanStatus);
        li.appendChild(div1);
        li.appendChild(div2);
        upcomingMatchesSection.appendChild(li);
    });
}

function populatePreviousMatchesSection(data) {
    const previousMatchesSection = document.getElementById('previousMatches');
    data.events.forEach((event, index) => {
        const li = document.createElement('li');
        li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center', 'flex-column');
        const div1 = document.createElement('div');
        div1.classList.add('text-center', 'mb-2');
        const imgHomeLogo = document.createElement('img');
        imgHomeLogo.src = event.competitions[0].competitors[0].team.logo;
        imgHomeLogo.style.width = '30px';
        imgHomeLogo.style.height = '30px';
        const spanHomeScore = document.createElement('span');
        spanHomeScore.textContent = event.competitions[0].competitors[0].score;
        const spanDash1 = document.createElement('span');
        spanDash1.textContent = '   -   ';
        const spanDash2 = document.createElement('span');
        spanDash2.textContent = '   -   ';
        const spanAwayScore = document.createElement('span');
        spanAwayScore.textContent = event.competitions[0].competitors[1].score;
        const imgAwayLogo = document.createElement('img');
        imgAwayLogo.src = event.competitions[0].competitors[1].team.logo;
        imgAwayLogo.style.width = '30px';
        imgAwayLogo.style.height = '30px';
        div1.appendChild(imgHomeLogo);
        div1.appendChild(spanHomeScore);
        div1.appendChild(spanDash1);
        div1.appendChild(spanAwayScore);
        div1.appendChild(imgAwayLogo);
        const div2 = document.createElement('div');
        div2.classList.add('text-center');
        const spanLocation = document.createElement('span');
        spanLocation.textContent = event.venue.displayName;
        const spanStatus = document.createElement('span');
        spanStatus.textContent = event.status.type.detail;
        div2.appendChild(spanLocation);
        div2.appendChild(spanDash2);
        div2.appendChild(spanStatus);
        const div3 = document.createElement('div');
        div3.classList.add('text-center');
        const spanDate = document.createElement('span');
        date = new Date(event.date);
        spanDate.textContent = date.toLocaleDateString();
        div3.appendChild(spanDate);
        li.appendChild(div1);
        li.appendChild(div2);
        li.appendChild(div3);
        previousMatchesSection.appendChild(li);
    });
}
