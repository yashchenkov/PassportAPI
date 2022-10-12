import express from 'express';
import session from 'express-session';
import passport from 'passport';
import {modell} from './models/UserModel.js';
import psl from 'passport-local';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename); 



const LocalStrategy = psl.Strategy

const options = {
  usernameField: "username",
  passwordField: "password",
}

const verify = async (username, password, done) => {
  try {
    const user = await modell.find({"username": {$eq: username}});
    if (!user) {
      console.log('ошибка, нет такого пользователя');
      return done('нет такого пользователя', false);
    }
    if(user.username === username && user.password === password) {
      console.log('пользователь найден');
      return done(null, user);
    } else {
      console.log('пользователь не найден');
      return done(null, false)
    }
  } catch(e) {
    console.log(e);
    return done(e, false);
  }
}

passport.use('local', new LocalStrategy(options, verify))

passport.serializeUser((user, cb) => {
  cb(null, user.id)
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await modell.finById(id).select("-__v");
    if (!user) {
      return done('нет пользователя', false)
    }
    return done(null, user);
  } catch(e) {
    console.log(e);
    return done(e, false);
  }
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
app.post('/api/user/login', (req, res) => {
  console.log('post user/me');
  console.log(req.body);
  passport.authenticate('local', { failureRedirect: '/api/user/login' }), 
  (res, req) => {
    console.log("req.user: ", req.user);
    res.redirect('/api/user/me')
  }
})
//запрос на выход из профиля
app.get('/api/user/logout',  (req, res) => {
  console.log('get user/logout');
    req.logout()
    res.redirect('/api/user/me')
  });



async function start(PORT, UrlDB) {
  try {
    await mongoose.connect(UrlDB, { dbName: 'test' });
    app.listen(PORT);
  } catch(e) {
    console.log(e);
  }
}

const PORT = process.env.PORT || 3000
const UrlDB = process.env.UrlDB;
console.log(UrlDB);
start(PORT, UrlDB);


