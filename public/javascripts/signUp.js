window.onload = function () {
    const getElement = id => document.getElementById(id);

    const fields = {
        username: getElement('username'),
        password: getElement('password'),
        tournament: getElement('tournament'),
        team: getElement('team'),
        teamLogoUrl: getElement('team_logo')
    };

    const { username, password, tournament, team, teamLogoUrl } = fields;

    let isTeamLogoDisplayed = false;

    tournament.addEventListener('change', () => {
        team.disabled = !tournament.value;
        if (!team.disabled) {
            getElement('teamLogo').src = '';
            getElement('teamLogo').style.display = 'none';
            isTeamLogoDisplayed = false;
        } else {
            getElement('teamLogo').style.display = 'none';
            isTeamLogoDisplayed = false;
        }
    });

    const validateField = field => {
        const isValid = field.checkValidity() && ((field !== tournament && field !== team) || field.value);
        field.classList.toggle('is-invalid', !isValid);
        return isValid;
    }

    getElement('nextButton').addEventListener('click', () => {
        if (validateField(username) && validateField(password)) {
            getElement('dropdownFields').style.display = 'block';
            getElement('buttonGroup').style.display = 'none';
            getElement('submitButtonGroup').style.display = 'block';
        }
    });

    getElement('submitButton').addEventListener('click', async (event) => {
        const isFormValid = Object.values(fields).every(validateField);
        if (!isFormValid) {
            event.preventDefault();
        } else {
            console.log("Form is valid. Updating team logo...");
            await updateTeamLogo();
            console.log("Team logo updated. Logging team_logo value:", getElement('team_logo').value);
            getElement('signupForm').submit();
        }
    });


    Object.values(fields).forEach(field => {
        field.addEventListener('input', () => validateField(field));
    });

    const fetchFromAPI = async (url, errorMessage) => {
        const response = await fetch(url);
        if (!response.ok) throw new Error(errorMessage);
        return response.json();
    }

    const fetchTournaments = async () => {
        try {
            const tournaments = await fetchFromAPI('/api/tournaments', 'Error fetching tournaments');
            const tournamentSelect = getElement('tournament');
            if (!tournamentSelect) throw new Error('Tournament select element not found');
            const fragment = document.createDocumentFragment();
            tournaments.forEach(tournament => {
                const option = document.createElement('option');
                option.value = tournament.tournament;
                option.textContent = tournament.tournament;
                fragment.appendChild(option);
            });
            tournamentSelect.appendChild(fragment);

            tournamentSelect.addEventListener('change', async () => {
                const selectedTournament = tournamentSelect.value;
                const img = document.querySelector('.img-fluid');
                if (!selectedTournament) {
                    img.src = '/images/images.png';
                    getElement('teamLogo').src = '';
                    getElement('teamLogo').style.display = 'none';
                    isTeamLogoDisplayed = false;
                    return;
                }
                const tournament = tournaments.find(t => t.tournament === selectedTournament);
                img.src = tournament ? tournament.logo || '/images/images.png' : '/images/images.png';
                await fetchTeams(selectedTournament);
            });

        } catch (error) {
            console.error('Error:', error);
        }
    }

    const fetchTeams = async tournament => {
        if (!tournament) return;
        let year = new Date().getFullYear();
        let tournamentName = `${year}_${tournament.toLowerCase().replace(/\s/g, '_')}`;
        let teams;
        try {
            teams = await fetchFromAPI(`/api/${encodeURIComponent(tournamentName)}`, 'Error fetching teams');
        } catch (error) {
            console.log('Tournament year not available. Trying previous year...');
            year--;
            tournamentName = `${year}_${tournament.toLowerCase().replace(/\s/g, '_')}`;
            teams = await fetchFromAPI(`/api/${encodeURIComponent(tournamentName)}`, 'Error fetching teams');
            console.log(`Previous year (${year}) found.`);
        }
        const teamSelect = getElement('team');
        if (!teamSelect) throw new Error('Team select element not found');
        teamSelect.innerHTML = '';
        const blankOption = document.createElement('option');
        blankOption.value = '';
        blankOption.textContent = '';
        teamSelect.appendChild(blankOption);
        const fragment = document.createDocumentFragment();
        teams.forEach(team => {
            const option = document.createElement('option');
            option.value = team.name;
            option.textContent = team.name;
            fragment.appendChild(option);
        });
        teamSelect.appendChild(fragment);
    }

    getElement('team').addEventListener('change', async () => {
        await updateTeamLogo();
    });

    const updateTeamLogo = async () => {
        const selectedTeam = team.value;
        const selectedTournament = tournament.value;
        const teamLogo = getElement('teamLogo');
        if (!selectedTeam || !selectedTournament) {
            teamLogo.src = '';
            getElement('teamLogo').style.display = 'none';
            isTeamLogoDisplayed = false;
            return;
        }
        let year = new Date().getFullYear();
        let tournamentName = `${year}_${selectedTournament.toLowerCase().replace(/\s/g, '_')}`;
        let teams;
        try {
            teams = await fetchFromAPI(`/api/${encodeURIComponent(tournamentName)}`, 'Error fetching teams');
        } catch (error) {
            console.log('Tournament year not available. Trying previous year...');
            year--;
            tournamentName = `${year}_${selectedTournament.toLowerCase().replace(/\s/g, '_')}`;
            teams = await fetchFromAPI(`/api/${encodeURIComponent(tournamentName)}`, 'Error fetching teams');
            console.log(`Previous year (${year}) found.`);
        }
        const selectedTeamData = teams.find(team => team.name === selectedTeam);
        if (selectedTeamData && selectedTeamData.logo) {
            teamLogo.src = selectedTeamData.logo;
            getElement('teamLogo').style.display = 'inline';
            isTeamLogoDisplayed = true;
            console.log(selectedTeamData);
            getElement('team_logo').value = selectedTeamData.logo;
            console.log(getElement('team_logo').value);
        } else {
            teamLogo.src = '';
            getElement('teamLogo').style.display = 'none';
            isTeamLogoDisplayed = false;
        }
    };
    fetchTournaments();
};
