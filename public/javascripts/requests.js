async function requestData() {
    const leagueCode = "bra.1";
    const year = 2024;

    try {
        const response = await fetch(`https://site.web.api.espn.com/apis/v2/sports/soccer/${leagueCode}/standings?season=${year}`);
        if (!response.ok) {
            throw new Error("HTTP error " + response.status);
        }

        const jsonResponse = await response.json();
        console.log(jsonResponse);
    } catch (error) {
        console.error(error);
    }
}

function parseData(json) {
    
}

function storeData() {

}