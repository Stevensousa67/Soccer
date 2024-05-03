const Client = require('pg').Client;
const fetch = require('node-fetch');

const client = new Client({
    connectionString: process.env.DATABASE_URL
});
client.connect();

async function seedDatabase() {
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
                    const tableName = `${league.year}_${league.name.replace(/\s+/g, '_').toLowerCase()}`;
                    const createTableSql = `
                        CREATE TABLE IF NOT EXISTS "${tableName}" (
                            id SERIAL PRIMARY KEY,
                            name VARCHAR(60),
                            abbreviation VARCHAR(4),
                            logo VARCHAR(80)
                        )
                    `;
                    await client.query(createTableSql);
                    for (let index = 0; index < league.teams.length; index++) {
                        const teamWrapper = league.teams[index];
                        const team = teamWrapper.team;
                        console.log(`${index + 1} - ${team.name} ${team.abbreviation} ${team.logos[0].href}`);
                        const insertSql = `INSERT INTO "${tableName}"(name, abbreviation, logo) VALUES($1, $2, $3)`;
                        const values = [team.name, team.abbreviation, team.logos[0].href];
                        await client.query(insertSql, values);
                    }
                }
            }
        } catch (error) {
            console.error(`Error seeding database for country ${country}:`, error);
        }
    }

    await client.end();
}

seedDatabase();