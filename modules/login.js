const users  = require('../datalayer/users');
const {OAuth2Client} = require('google-auth-library');
const router = require('express').Router;
const output = {
    config : null
};

output.router = router();
output.router.get('/destroy_session', destroySession);
output.router.get('/'               , getPageLogin);
output.router.post('/set_session'   , setSession);

output.init = function (config) {
    output.config = config;
}

output.checkToken = async function (req, res, next) {
    try {
        const token = req.body.token;
        console.log(token);
        console.log(output.config.GOOGLE_CLIENT_ID);
        const auth = new OAuth2Client(output.config.GOOGLE_CLIENT_ID, output.config.GOOGLE_CLIENT_SECRET, '');
        const ticket = await auth.verifyIdToken({
            idToken: token,
            audience: output.config.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.payload;
        if (payload && payload.email) {
            const email = payload.email;
            const {project_id, id} = await users.checkUserEmail(email);
            if (project_id && id && email) {
                req.session.UserId      = id;  
                req.session.UserEmail   = email;  
                req.session.project_id  = project_id;
                req.session.picture     = payload.picture;
                req.session.name        = payload.name;
                return res.status(200).json({status: 'success'});
            } else {
                return res.status(200).json({status: 'invalid'});
            }

        }
        return res.status(200).send('{"success":"ok"}');
        
    } catch (error) {
        console.log(error);
        return res.status(500).send('{"error":"user_retrieval_error_' + error.message + '"}');
    }
}

output.checkAuth = function(req, res, next) {
    try {
        if(req.session.UserId && req.session.UserEmail && req.session.project_id) {
            return next();
        }
        const URL = `/`;  
        return res.redirect(URL);
        
    } catch (error) {
        return res.status(500).send('{"error":"user_retrieval_error_' + error.message + '"}');
    }
};

async function destroySession(req, res, next) {
    req.session.destroy(function(err) {
        res.redirect('/');
    });
};

async function getPageLogin(req, res, next) {
    if(req.session.UserId && req.session.UserEmail && req.session.project_id) {
        const URL = `/excel`;  
        return res.redirect(URL);
    } else {
        res.render('login',{});
    }    
};

async function setSession(req, res, next) {
    const {passWord, userName} = req.body;
    const {project_id, id, email} = await users.checkUser(userName, passWord);
    if (project_id && id && email) {
        req.session.UserId      = id;  
        req.session.UserEmail   = email;  
        req.session.project_id  = project_id;
        return res.status(200).json({status: 'success'});
    } else {
        return res.status(200).json({status: 'invalid'});
    }
};

module.exports = output;
