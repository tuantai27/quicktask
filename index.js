const path              = require('path');
const puppeteer         = require('puppeteer');
const express           = require('express');
const session           = require('express-session');
const redis             = require('redis');
const redisStore        = require('connect-redis')(session);
const database          = require('./modules/database');
const users             = require('./datalayer/users');
const salary            = require('./datalayer/salary');
const file              = require('./modules/file');
const fileSalary        = require('./modules/fileSalary');
const login             = require('./pages/login');
const pageSalary        = require('./pages/pageSalary');
const pageThanks        = require('./pages/pageThanks');
const pageForm          = require('./pages/pageForm');
const pageCategories    = require('./pages/pageCategories');
const pageUsers         = require('./pages/pageUsers');
const pageRoles         = require('./pages/pageRoles');
const pageDatalayer     = require('./pages/pageDatalayer');
const pageExcel         = require('./pages/pageExcel');
const pageReply         = require('./pages/pageReply');
const clearDisk         = require('./modules/clear_disk');
const config            = require('./config');
const redisClient       = redis.createClient();
fileSalary.init();
const app               = express();

app.set('view engine','pug');
app.set('views',path.join(__dirname,'client','views'));
app.use(express.json({limit: '50mb'}));       // to support JSON-encoded bodies
app.use(express.urlencoded({extended:true,limit: '50mb'})); // to support URL-encoded bodies
app.use('*/js',express.static(path.join(__dirname,'client','js/')));
// app.use('*/.well-known/pki-validation/5D821F1269D79B26C3984DC20FE3B504.txt',express.static(path.join(__dirname,'client','js/5D821F1269D79B26C3984DC20FE3B504.txt')));
// app.use(express.static('wellknown'))
app.use('*/files',express.static(path.join(__dirname,'client','files/')));
app.use('*/google7b9d95b05c8dfc6e.html',express.static(path.join(__dirname,'google7b9d95b05c8dfc6e.html')));
app.use('*/temporary',express.static(path.join(__dirname,'client','temporary/')));
const port = process.env.PORT || 3000;
// const port = 8080;
app.use('*/css',express.static(path.join(__dirname,'client','css/')));
app.use('/favicon.ico',express.static(path.join(__dirname,'client/favicon.ico')));
redisClient.on('error',(err)=>{
    console.log('REDIS rate limiter had error %o',err,{error:err});
});
const mStore = new redisStore({client : redisClient, ttl: config.SESSION_TIMEOUT / 1000, disableTouch: true});
app.use(session({
    store : mStore,
    resave: false, 
    saveUninitialized: false, 
    secret: 'somesecretsd3434#@#@', 
    cookie: { maxAge: config.SESSION_TIMEOUT }
}));

(async ()=>{
    try {
        clearDisk.setScheduleClear();
        login.init(config);
        //import data;
        const m_db = new database(config);
        users.init(m_db);
        salary.init(m_db);
        pageDatalayer.init(m_db);
        const browser = await puppeteer.launch({headless: true, args: [
            '--disable-gpu', '--no-sandbox', '--single-process', 
            '--disable-web-security', '--disable-dev-profile']});
        pageExcel.init(browser);
        app.use('/', login.router);
        app.use('/thanks', pageThanks.router);
        app.post('/token', login.checkToken);        
        app.use('/trigger',  [login.checkAuth, pageThanks.router2]);
        app.use('/form', [login.checkAuth, pageForm.router]);
        app.use('/replySalary', pageReply.router);
        app.use('/salary', [login.checkAuth, pageSalary.router]);
        app.use('/excel', [login.checkAuth, pageExcel.router]);
        app.use('/home', [login.checkAuth, pageExcel.router]);
        app.use('/categories', [login.checkAuth, pageCategories.router]);
        app.use('/users', [login.checkAuth, pageUsers.router]);
        app.use('/roles', [login.checkAuth, pageRoles.router]);
        app.use('/datalayer', [login.checkAuth, pageDatalayer.router]);
        app.post('/uploadfile', [login.checkAuth, file.uploadFile]);
        app.get('/deleteFile/:file_id', [login.checkAuth, file.deleteFile]);
        app.get('/downloadFile/:file_id', [login.checkAuth, file.downloadFile]);
        app.post('/uploadfileSaraly', [login.checkAuth, fileSalary.uploadFile]);
        app.listen(port, () => console.log(`Listening on port ${port}!`));
    } catch (error) {
        console.log(error);
    }
    console.log('end');
})();