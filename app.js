var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose=require('mongoose')
const connectDB=require("./config/database")
const dotenv=require('dotenv')
const session = require('express-session')
const multer=require('multer')
const nocache=require('nocache')




var userRouter = require('./routes/userRouter');
var adminRouter = require('./routes/adminRouter');


dotenv.config();
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

connectDB();



const storage=multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads')
  },
  filename:(req,file,cb)=>{
    cb(null,Date.now()+"-"+file.originalname);
}
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png') {
    cb(new Error('Only jpeg and png files are allowed'));
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 }, // 1MB
  fileFilter: fileFilter
}).array('productimage',4);


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// app.use(nocache())

app.use(nocache())

app.use(
  session({
    secret: "key",
    saveUninitialized: false,
    resave: false,
    cookie: { maxAge: 600000 },
  })
);
app.use(function (req, res, next) {
  res.locals.user = req.session.userid || null;
  next();
});

app.use('/uploads',express.static(path.join(__dirname, 'uploads')));

app.use((req, res, next) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json(err);
    } else if (err) {
      return res.status(500).json(err);
    }
    next();
  });
});

app.use('/', userRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler

app.use(function (err, req, res, next) {
  if (err.status === 404) {
    res.status(404).render("404");
  } else {
    res.status(err.status || 500);
    res.render("error", { error: err });
  }
});
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
