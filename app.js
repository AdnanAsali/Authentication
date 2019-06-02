var passportLocalMongoose = require("passport-local-mongoose"),
    expressSession        = require("express-session"),
    LocalStrategy         = require("passport-local"),
    bodyParser            = require("body-parser"),
    mongoose              = require("mongoose"),
    passport              = require("passport"),
    express               = require("express"),
    User                  = require("./models/user"),
    app                   = express();

// CONFIGURATION OF MONGOOSE
mongoose.connect("mongodb://localhost/auth_demo", { useNewUrlParser: true });

app.set("view engine" , "ejs");
//EVERY TIME YOU WANT TO USE A FORM THIS LINE SHOULD EXIST
app.use(bodyParser.urlencoded({extended: true}));


// SETTING PASSPORT UP AND CONFIGURING IT SO IT WILL WORK ON MY APPLICATION
app.use(passport.initialize());
app.use(passport.session());
    app.use(expressSession(
    {
        secret:  "This line should be encoded",
        resave: true,
        saveUninitialized: true
    }));

//THESE TWO LINES ARE RESPONSIBLE FOR READING THE SESSION AND TAKING THE DATA FROM THE SESSION
//THATS ENCODED AND DECODING IT
passport.serializeUser(User.serializeUser());       // RESPONSIBLE FOR ENCODING
passport.deserializeUser(User.deserializeUser());   // RESPONSIBLE FOR DECODING
passport.use(new LocalStrategy(User.authenticate()));


// ======
// ROUTES
// ======
app.get("/", function(req, res)
{
    res.render("home");
});


app.get("/secret", function(req, res)
{
    if(req.isAuthenticated())
    {
        res.render("secret");
    }
});

// ===========
// AUTH ROUTES
// ===========


/* SIGN UP ROUTES */
//GETTING SHOW SIGN UP FORM
app.get("/register", function(req, res)
{
    res.render("register");
});

// HANDLING USER SIGN UP
app.post("/register", function(req, res)
{
    //WE MAKE A NEW USER OBJECT THAT ISNT SAVED TO THE DB YET SO WE ONLY PASS IN THE USERNAME
    //SO WE DONT SAVE THE PASSWORD IN THE DB ITS NOT A GOOD IDEA
    //SO WE PASS THE PASSWORD AS AN ARGUMENT AND THE FUNCTION OF  " REGISTER " WILL HASH THE PASSWORD
    //WHICH MEANS THAT IT WILL CHANGE THE PASSWORD INTO HUGE STRING INTO NUMBERS AND LETTERS
    //THEN STORES IT INTO THE DB IF WE PASSED IT INSIDE THE OBJECT IT WONT BE HASHED AND IT WOULD BE STOLEN
    User.register(new User({username: req.body.username}), req.body.password, function(err, user)
    {
        if(err)
        {
            console.log(err);
        }
        else
        {
            //THE AUTHENTICATE METHOD ALLOWS THE USER TO TO ACTUALLY SIGN UP AND SAVE THEIR DATA INTO THE SESSION
            //AND DEAL WITH THE FUNCTIONS OF SERIALIZE AND DESERIALZE AND ENCODE AND DECODE
            //AND THE "LOCAL" ARGUMENT IS THE STRATEGY THAT WE are using
            passport.authenticate("local")(req, res, function()
            {
                res.redirect("/secret");
            });
        }
    });
    
});



/* LOG IN ROUTES */
app.get("/login", function(req, res) 
{
    res.render("login");
});


//LOGIN LOGIC
app.post("/login", passport.authenticate("local",
{
    successRedirect: "/secret",
    failureRedirect: "/login"
}) ,
function(req, res)
{
    console.log( "From the log in post route" + req.isAuthenticated());
});

/* LOG OUT ROUTES */
app.get("/logout", function(req, res) 
{
    req.logout();
    res.redirect("/");
});


function isLoggedIn(req, res, next)
{
    console.log("Test is logged in " + req.isAuthenticated());
    if(req.isAuthenticated())
    {
        return next();
    }
    res.redirect("/login");
}


app.listen(process.env.PORT, process.env.IP, function()
{
    console.log("AUTH_DEMO SERVER IS : active");
});