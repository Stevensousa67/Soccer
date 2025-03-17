# Soccer

Live Link: https://soccer.stevensousa.com

# Description
A full-stack Node.js/Express app with GCP Cloud SQL (PostgreSQL), delivering real-time soccer updates via ESPN APIs. Users can create accounts with Passport auth, choose from 7 tournmanets and their teams (dynamically linked dropdowns), and view tailored standings, schedules, and news. Content auto-refreshes on login; logged-out users see a random tournament. Built to scale for more leagues.

# Tech Stack

Node.js, Express.js, GCP Cloud SQL (PostgreSQL), HTML, CSS, JS, Bootstrap, and ESPN APIs

# Key Features

- Pulls live data from ESPN APIs: standings, game schedules (current score, location, time), and news for 7 tournaments.
- Passport auth for secure user login and account management.
- Dynamic tournament/team selection with real-time content updates.
- Random tournament display for logged-out users.
