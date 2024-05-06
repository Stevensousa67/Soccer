var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var env = require('dotenv').config();
const { v4: uuid } = require('uuid');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var app = express();

var session = require('express-session');
var flash = require('express-flash');

const { Client } = require('pg');
const client = new Client({
    connectionString: process.env.DATABASE_URL
});
client.connect();

var bcrypt = require('bcryptjs');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
},
    function (username, password, done) {
        client.query('SELECT * FROM capstone_users WHERE username = $1', [username], function (err, result) {
            if (err) {
                console.log("SQL error");
                return done(null, false, { message: 'sql error' });
            }
            if (result.rows.length > 0) {
                let matched = bcrypt.compareSync(password, result.rows[0].password);
                if (matched) {
                    console.log("Successful login, ", result.rows[0]);
                    return done(null, result.rows[0]);
                }
            }
            console.log("Bad username or password");
            return done(null, false, { message: 'Bad username or password' });
        });
    })
);

passport.serializeUser(function (user, done) {
    return done(null, user.id); // Pass the user ID to done
});

passport.deserializeUser(function (id, done) {
    // Query the user from the database using the ID
    client.query('SELECT * FROM capstone_users WHERE id = $1', [id], function (err, result) {
        if (err) {
            console.log("SQL error");
            return done(err);
        }
        if (result.rows.length > 0) {
            return done(null, result.rows[0]);
        } else {
            return done(new Error('User not found'));
        }
    });
});

app.use(session({
    secret: 'WebDev',
    resave: false,
    saveUninitialized: true,
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);
app.use('/users', usersRouter);

app.get('/checkAuth', async function (req, res) {
    if (req.isAuthenticated()) {
        const user = req.user;
        try {
            res.json({
                isAuthenticated: true,
                preferredTournament: user.tournament,
                preferredTeam: user.team,
                logoUrl: user.team_logo
            });
        } catch (err) {
            console.error('Error constructing user preferences response:', err);
            res.json({ isAuthenticated: true });
        }
    } else {
        res.json({ isAuthenticated: false });
    }
});

app.get('/getUserInfo', function (req, res) {
    if (req.isAuthenticated()) {
        const user = req.user;
        let year = new Date().getFullYear();
        let tournament = `${year}_${user.tournament.toLowerCase().replace(/\s/g, '_')}`;
        const query = `SELECT team_id FROM "${tournament}" WHERE name = $1`;
        let teamId;

        // Get team id from the database
        const executeQuery = (year, tournament) => {
            client.query(query, [user.team], (err, result) => {
                if (err) {
                    console.error('Error executing query:', err);
                    console.log(`${year} ${user.tournament} not available. Trying previous year...`);
                    year = year - 1;
                    tournament = `${year}_${user.tournament.toLowerCase().replace(/\s/g, '_')}`;
                    if (year >= 2023) {
                        executeQuery(year, tournament);
                    } else {
                        res.status(500).json({ message: 'Tournament not found for any year' });
                    }
                } else {
                    teamId = result.rows[0].team_id;

                    const queryCountry = `SELECT country FROM tournaments WHERE tournament = $1`;
                    client.query(queryCountry, [user.tournament], (err, result) => {
                        if (err) {
                            console.error('Error executing query:', err);
                            res.status(500).json({ message: 'Error retrieving country code' });
                        } else {
                            res.json({ user: user, teamId: teamId, country: result.rows[0].country });
                        }
                    });
                }
            });
        };

        // Call the function to execute the query
        executeQuery(year, tournament);
    } else {
        res.status(401).json({ message: 'Not authenticated' });
    }
});

app.post('/saveUser', function (req, res) {
    if (req.isAuthenticated()) {
        const user = req.user;
        const { username, password, tournament, team, team_logo, team_id } = req.body;
        console.log(req.body);
        const hashedPassword = bcrypt.hashSync(password, 10);

        client.query('UPDATE capstone_users SET username = $1, password = $2, tournament = $3, team = $4, team_logo = $5, team_id = $6 WHERE id = $7', [username, hashedPassword, tournament, team, team_logo, team_id, user.id], function (err) {
            if (err) {
                console.error('Error updating user:', err);
                res.status(500).send('Failed to update user');
            } else {
                res.redirect('/');
            }
        });
    } else {
        res.status(401).send('User not authenticated');
    }
});

app.get('/logout', function (req, res) {
    req.logout(function () {
        res.sendStatus(200);
    });
});


app.get('/signUp', function (req, res) {
    res.sendFile(path.join(__dirname, 'public', 'signUp.html'));
});

app.post('/signUp', async function (req, res) {
    try {

        // Check if db table exists
        const createTableQuery = `CREATE TABLE IF NOT EXISTS capstone_users (
            id UUID PRIMARY KEY NOT NULL,
            username VARCHAR(50) NOT NULL,
            password VARCHAR(100) NOT NULL,
            tournament VARCHAR(50) NOT NULL,
            team VARCHAR(80) NOT NULL,
            team_logo VARCHAR(200) NOT NULL,
            account_created_on DATE NOT NULL
        )`;
        await client.query(createTableQuery);

        // If table exists, create user
        const { username, password, tournament, team, team_logo } = req.body;

        // check if username exists in database
        const result = await client.query('SELECT * FROM capstone_users WHERE username = $1', [username]);
        if (result.rows.length > 0) {
            req.flash('error', 'Username already exists');
            res.redirect('/signUp');
            return;
        }
        // insert new user into database
        const hashedPassword = bcrypt.hashSync(password, 10);
        const id = uuid();
        await client.query('INSERT INTO capstone_users (id, username, password, tournament, team, team_logo, account_created_on) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE)', [id, username, hashedPassword, tournament, team, team_logo]);

        // log new user in and redirect to home page
        const user = { id, username, password: hashedPassword, tournament, team };
        req.login(user, function (err) {
            if (err) {
                console.error('Error logging in:', err);
                req.flash('error', 'Failed to log in user');
                return res.redirect('/signUp');
            }
            return res.redirect('/');
        });
    } catch (error) {
        console.error('Error creating user:', error);
        req.flash('error', 'Failed to create user');
        res.redirect('/signUp');
    }
});

app.get('/login', function (req, res) {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

app.get('/myProfile', function (req, res) {
    if (req.isAuthenticated()) {
        res.sendFile(path.join(__dirname, 'public', 'myProfile.html'));
    }else {
        res.redirect('/login');
    }
});

app.get('/standings', function (req, res) {
    if (req.isAuthenticated) {
        res.sendFile(path.join(__dirname, 'public', 'scoreboard.html'));
    } else {
        res.redirect('/login');
    }
});

app.get('/api/tournaments', async (req, res) => {
    try {
        const result = await client.query('SELECT tournament, logo FROM tournaments');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

app.get('/api/:tournamentName', async (req, res) => {
    const tournamentName = req.params.tournamentName;
    try {
        const query = `SELECT name, logo FROM "${tournamentName}"`;
        const result = await client.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});


module.exports = app;