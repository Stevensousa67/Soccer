fetch('/checkAuth')
    .then(response => response.json())
    .then(data => {
        if (data.isAuthenticated) {
            document.getElementById('authButtons').classList.add('d-none'); // Hide buttons for non-authenticated users
            document.getElementById('loggedInButtons').classList.remove('d-none'); // Show buttons for authenticated users
            document.getElementById('scoreboardLink').classList.remove('d-none'); // Show Scoreboard link
            document.getElementById('myStatsLink').classList.remove('d-none'); // Show My Team's Stats link
            if (data.logoUrl) {
                const logo = document.getElementById('logo');
                logo.src = data.logoUrl; // Update logo src with team logo URL
            }

            document.getElementById('logOut').addEventListener('click', function () {
                fetch('/logout')
                    .then(response => {
                        if (response.ok) {
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

function fetchUserInfo() {
    fetch('/getUserInfo')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch user information');
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('username').value = data.username;
            document.getElementById('password').value = data.password;
            fetchLeagues(data.tournament);
            fetchTeams(data.team, data.tournament);
        })
        .catch(error => {
            console.error('Error fetching user information:', error);
        });
}

function fetchLeagues(selectedLeague) {
    fetch('/api/tournaments')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch leagues');
            }
            return response.json();
        })
        .then(leagues => {
            const leagueSelect = document.getElementById('tournament');
            leagues.forEach(league => {
                const option = document.createElement('option');
                option.value = league.tournament;
                option.textContent = league.tournament;
                leagueSelect.appendChild(option);
            });
            leagueSelect.value = selectedLeague;
        })
        .catch(error => {
            console.error('Error fetching leagues:', error);
        });
}

function fetchTeams(selectedTeam, selectedLeague, year = new Date().getFullYear()) {
    fetch(`/api/${year}_${selectedLeague.toLowerCase().replace(/\s/g, '_')}`)
        .then(response => {
            if (!response.ok) {
                if (response.status === 500) {
                    console.log(`${year} ${selectedLeague} not available. Trying previous year...`);
                    fetchTeams(selectedTeam, selectedLeague, year - 1);
                } else {
                    throw new Error('Failed to fetch teams');
                }
            }
            return response.json();
        })
        .then(teams => {
            const teamSelect = document.getElementById('team');
            teamSelect.innerHTML = '';
            teams.forEach(team => {
                const option = document.createElement('option');
                option.value = team.name;
                option.textContent = team.name;
                teamSelect.appendChild(option);
                if (selectedTeam === team.name) {
                    document.getElementById('team_logo').value = team.logo;
                }
            });
            teamSelect.value = selectedTeam;
        })
        .catch(error => {
            if (year !== new Date().getFullYear()) {
                console.error('Error fetching teams:', error);
            }
            // Ignore error when trying previous year
        });
}


document.getElementById('team').addEventListener('change', function () {
    const selectedTeam = this.value;
    const selectedLeague = document.getElementById('tournament').value;
    fetchTeams(selectedTeam, selectedLeague);
});

document.getElementById('saveButton').addEventListener('submit', function (event) {
    event.preventDefault();
    const formData = new FormData(this);
    console.log('Form data:', formData);
    updateProfile(formData);

});

function updateProfile(formData) {
    fetch('/saveUser', {
        method: 'POST',
        body: formData
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update profile');
            }
            console.log('Profile updated successfully');
        })
        .catch(error => {
            console.error('Error updating profile:', error);
        });
}


window.addEventListener('load', fetchUserInfo);
document.getElementById('tournament').addEventListener('change', function () {
    const selectedTournament = this.value; // Get the selected tournament value
    fetchTeams(null, selectedTournament); // Fetch teams for the selected tournament
});