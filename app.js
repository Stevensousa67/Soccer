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
var pgSession = require('connect-pg-simple')(session);

const { Client } = require('pg');
const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
});
client.connect(err => {
    if (err) {
        console.error('Connection error:', err.stack);
    } else {
        console.log('Connected to PostgreSQL database');
    }
});

var bcrypt = require('bcryptjs');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
},
    function (username, password, done) {
        client.query('SELECT * FROM soccer.capstone_users WHERE username = $1', [username], function (err, result) {
            if (err) {
                console.log("SQL error:", err);
                return done(null, false, { message: 'SQL error' });
            }
            if (result.rows.length > 0) {
                let matched = bcrypt.compareSync(password, result.rows[0].password);
                if (matched) {
                    console.log("Successful login,", result.rows[0]);
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
    client.query('SELECT * FROM soccer.capstone_users WHERE id = $1', [id], function (err, result) {
        if (err) {
            console.log("SQL error:", err);
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
    store: new pgSession({
        pool: client,              
        schemaName: 'soccer',      
        tableName: 'session',      
        createTableIfMissing: true
    }),
    secret: 'WebDev',              
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
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
            const query = 'SELECT country FROM soccer.tournaments WHERE tournament = $1';
            const result = await client.query(query, [user.tournament]);
            const userCountry = result.rows[0].country;
            res.json({
                isAuthenticated: true,
                preferredTournament: user.tournament,
                preferredCountry: userCountry,
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
        res.json({ username: user.username, tournament: user.tournament, team: user.team, team_logo: user.team_logo });
    } else {
        res.status(401).json({ message: 'Not authenticated' });
    }
});

app.post('/saveUser', function (req, res) {
    if (req.isAuthenticated()) {
        const user = req.user;
        const { username, password, tournament, team, team_logo } = req.body;
        console.log(req.body);
        const hashedPassword = bcrypt.hashSync(password, 10);

        client.query('UPDATE soccer.capstone_users SET username = $1, password = $2, tournament = $3, team = $4, team_logo = $5 WHERE id = $6', [username, hashedPassword, tournament, team, team_logo, user.id], function (err) {
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
        const createTableQuery = `CREATE TABLE IF NOT EXISTS soccer.capstone_users (
            id UUID PRIMARY KEY NOT NULL,
            username VARCHAR(50) NOT NULL,
            password VARCHAR(100) NOT NULL,
            tournament VARCHAR(50) NOT NULL,
            team VARCHAR(80) NOT NULL,
            team_logo VARCHAR(200) NOT NULL,
            account_created_on DATE NOT NULL
        )`;
        await client.query(createTableQuery);

        const { username, password, tournament, team, team_logo } = req.body;

        const result = await client.query('SELECT * FROM soccer.capstone_users WHERE username = $1', [username]);
        if (result.rows.length > 0) {
            req.flash('error', 'Username already exists');
            res.redirect('/signUp');
            return;
        }
        const hashedPassword = bcrypt.hashSync(password, 10);
        const id = uuid();
        await client.query('INSERT INTO soccer.capstone_users (id, username, password, tournament, team, team_logo, account_created_on) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE)', [id, username, hashedPassword, tournament, team, team_logo]);

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
    } else {
        res.redirect('/login');
    }
});

app.get('/standings', function (req, res) {
    if (req.isAuthenticated()) {
        res.sendFile(path.join(__dirname, 'public', 'scoreboard.html'));
    } else {
        res.redirect('/login');
    }
});

app.get('/api/tournaments', async (req, res) => {
    try {
        console.log('Fetching tournaments from "soccer"."tournaments"');
        const result = await client.query('SELECT tournament, logo FROM "soccer"."tournaments"');
        console.log('Tournaments fetched:', result.rows);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching tournaments:', err.stack);
        res.status(500).send('Server error');
    }
});

app.get('/api/:tournamentName', async (req, res) => {
    const tournamentName = req.params.tournamentName;
    try {
        console.log(`Fetching teams from "soccer"."${tournamentName}"`);
        const query = `SELECT name, logo FROM "soccer"."${tournamentName}"`;
        const result = await client.query(query);
        console.log(`Teams fetched for ${tournamentName}:`, result.rows);
        res.json(result.rows);
    } catch (err) {
        console.error(`Error fetching teams for ${tournamentName}:`, err.stack);
        res.status(500).send('Server error');
    }
});

module.exports = app;
