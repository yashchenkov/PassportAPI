import express from 'express';
import session from 'express-session';
import passport from 'passport';
import {modell} from './models/UserModel.js';
import psl from 'passport-local';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mongoose from 'mongoose';
import * as db from './db/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename); 

console.log(db);

const LocalStrategy = psl.Strategy

const options = {
  usernameField: "username",
  passwordField: "password",
}

const verify =  (username, password, done) => {
  db.findByUsername(username, (err, user) => {
      if (err) {return done(err)}
      if (!user) { return done(null, false) }

      if( !db.verifyPassword(user, password)) {
          return done(null, false)
      }

      return done(null, user)
  })
}

passport.use('local', new LocalStrategy(options, verify))

passport.serializeUser((user, cb) => {
  cb(null, user.id)
});

passport.deserializeUser( (id, cb) => {
  db.findById(id,  (err, user) => {
    if (err) { return cb(err) }
    cb(null, user)
  })
});

const app = express()
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded());
app.use(session({ secret: 'SECRET'}));

app.use(passport.initialize())
app.use(passport.session())

//профиль
app.get('/api/user/me', (req, res) => {
  console.log('get user/me');
  res.render('home', {user: req.user});
});
//страница для входа
app.get('/api/user/login', (req, res) => {
  console.log('get user/login');
  res.render('login');
});
//отправка запроса для входа в профиль
app.post('/api/user/login', 
  passport.authenticate('local', { failureRedirect: '/api/user/me' }), 
  (req, res) => {
    console.log('post user/me');
    console.log(req.body);
    console.log("req.user: ", req.username);
    res.redirect('/api/user/me')
})
//запрос на выход из профиля
app.get('/api/user/logout',  (req, res) => {
  console.log('get user/logout');
    req.logout()
    res.redirect('/api/user/me')
  });




const PORT = process.env.PORT || 3000
app.listen(PORT);



