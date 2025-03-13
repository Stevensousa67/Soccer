const { Client } = require('pg');
const fetch = require('node-fetch');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const client = new Client({
    connectionString: process.env.SUPABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});
client.connect();

async function dropAllTables() {
    try {
        // Drop and recreate the soccer schema
        await client.query('DROP SCHEMA IF EXISTS soccer CASCADE');
        await client.query('CREATE SCHEMA soccer');
        console.log('Recreated soccer schema');
    } catch (error) {
        console.error('Error dropping schema:', error);
    }
}

async function seedDatabase() {
    await dropAllTables();

    const countries = ['bra', 'usa', 'eng', 'ger', 'esp', 'fra', 'ita'];

    for (const country of countries) {
        try {
            const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${country}.1/teams`);
            const teamsData = await response.json();
            const sportsData = teamsData.sports;
            if (sportsData.length > 0) {
                const leaguesData = sportsData[0].leagues;
                for (const league of leaguesData) {
                    console.log(`${league.year} ${league.name}`);
                    // Properly quote schema and table name
                    const baseTableName = `${league.year}_${league.name.replace(/\s+/g, '_').toLowerCase()}`;
                    const tableName = `"soccer"."${baseTableName}"`; // e.g., "soccer"."2024_english_premier_league"
                    const createTableSql = `
                        CREATE TABLE IF NOT EXISTS ${tableName} (
                            id SERIAL PRIMARY KEY,
                            name VARCHAR(60),
                            abbreviation VARCHAR(4),
                            logo VARCHAR(80)
                        )
                    `;
                    await client.query(createTableSql);
                    const deleteSql = `DELETE FROM ${tableName}`;
                    await client.query(deleteSql);
                    for (let index = 0; index < league.teams.length; index++) {
                        const teamWrapper = league.teams[index];
                        const team = teamWrapper.team;
                        console.log(`${index + 1} - ${team.name} ${team.abbreviation} ${team.logos[0].href}`);
                        const insertSql = `INSERT INTO ${tableName}(name, abbreviation, logo) VALUES($1, $2, $3)`;
                        const values = [team.name, team.abbreviation, team.logos[0].href];
                        await client.query(insertSql, values);
                    }
                }
            }
        } catch (error) {
            console.error(`Error seeding database for country ${country}:`, error);
        }
    }

    // Create tournaments table in soccer schema
    const leagues = ['Brazilian Serie A', 'MLS', 'German Bundesliga', 'English Premier League', 'Spanish La Liga', 'French Ligue 1', 'Italian Serie A'];

    try {
        const createTableSql = `
            CREATE TABLE IF NOT EXISTS "soccer"."tournaments" (
                id SERIAL PRIMARY KEY,
                tournament VARCHAR(255),
                scoreboard_api VARCHAR(255),
                teams_api VARCHAR(255),
                logo VARCHAR(255),
                standings_api VARCHAR(255),
                news_api VARCHAR(255),
                league_id VARCHAR(100),
                country VARCHAR(3)
            )
        `;
        await client.query(createTableSql);
        const insertSql = `INSERT INTO "soccer"."tournaments"(tournament, scoreboard_api, teams_api, logo, standings_api, news_api, league_id, country) VALUES($1, $2, $3, $4, $5, $6, $7, $8)`;
        const values1 = [leagues[0], 'https://site.api.espn.com/apis/site/v2/sports/soccer/bra.1/scoreboard', 'https://site.api.espn.com/apis/site/v2/sports/soccer/bra.1/teams', 'https://a.espncdn.com/i/leaguelogos/soccer/500/85.png', 'https://site.web.api.espn.com/apis/v2/sports/soccer/bra.1/standings?season=2024', 'https://site.api.espn.com/apis/site/v2/sports/soccer/bra.1/news', '630', 'bra'];
        const values2 = [leagues[1], 'https://site.api.espn.com/apis/site/v2/sports/soccer/usa.1/scoreboard', 'https://site.api.espn.com/apis/site/v2/sports/soccer/usa.1/teams', 'https://a.espncdn.com/i/leaguelogos/soccer/500/19.png', 'https://site.web.api.espn.com/apis/v2/sports/soccer/usa.1/standings?season=2024', 'https://site.api.espn.com/apis/site/v2/sports/soccer/usa.1/news', '770', 'usa'];
        const values3 = [leagues[2], 'https://site.api.espn.com/apis/site/v2/sports/soccer/ger.1/scoreboard', 'https://site.api.espn.com/apis/site/v2/sports/soccer/ger.1/teams', 'https://a.espncdn.com/i/leaguelogos/soccer/500/10.png', 'https://site.web.api.espn.com/apis/v2/sports/soccer/ger.1/standings?season=2023', 'https://site.api.espn.com/apis/site/v2/sports/soccer/ger.1/news', '720', 'ger'];
        const values4 = [leagues[3], 'https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard', 'https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/teams', 'https://a.espncdn.com/i/leaguelogos/soccer/500/23.png', 'https://site.web.api.espn.com/apis/v2/sports/soccer/eng.1/standings?season=2023', 'https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/news', '700', 'eng'];
        const values5 = [leagues[4], 'https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/scoreboard', 'https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/teams', 'https://a.espncdn.com/i/leaguelogos/soccer/500/15.png', 'https://site.web.api.espn.com/apis/v2/sports/soccer/esp.1/standings?season=2023', 'https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/news', '740', 'esp'];
        const values6 = [leagues[5], 'https://site.api.espn.com/apis/site/v2/sports/soccer/fra.1/scoreboard', 'https://site.api.espn.com/apis/site/v2/sports/soccer/fra.1/teams', 'https://a.espncdn.com/i/leaguelogos/soccer/500/9.png', 'https://site.web.api.espn.com/apis/v2/sports/soccer/fra.1/standings?season=2023', 'https://site.api.espn.com/apis/site/v2/sports/soccer/fra.1/news', '710', 'fra'];
        const values7 = [leagues[6], 'https://site.api.espn.com/apis/site/v2/sports/soccer/ita.1/scoreboard', 'https://site.api.espn.com/apis/site/v2/sports/soccer/ita.1/teams', 'https://a.espncdn.com/i/leaguelogos/soccer/500/12.png', 'https://site.web.api.espn.com/apis/v2/sports/soccer/ita.1/standings?season=2023', 'https://site.api.espn.com/apis/site/v2/sports/soccer/ita.1/news', '730', 'ita'];
        await client.query(insertSql, values1);
        await client.query(insertSql, values2);
        await client.query(insertSql, values3);
        await client.query(insertSql, values4);
        await client.query(insertSql, values5);
        await client.query(insertSql, values6);
        await client.query(insertSql, values7);
    } catch (error) {
        console.error('Error seeding tournaments table:', error);
    }
    await client.end();
}

seedDatabase();