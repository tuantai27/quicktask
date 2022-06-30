const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const credentials = require('./credentials.json');

// Replace with the code you received from Google
// const code = '4/0AX4XfWjz8e2q81iC9TFzgHCn1tdTmQyMjA';
// const code = '4/0AX4XfWjvRvldE4UeyYDxavgbEa8CpzNcrXjg4-abR9U23oRKDrFEp0b54sKg3KsE6E193w';
const code = '4/0AX4XfWiaYvPHj_9jntJYS5OPh4AxqnY_x9_Uy0wgC5MoI9ZguXHtdQvaD7fcXTUXxbqnrg';
const { client_secret, client_id, redirect_uris } = credentials.web;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

oAuth2Client.getToken(code).then(({ tokens }) => {
    const tokenPath = path.join(__dirname, 'token.json');
    fs.writeFileSync(tokenPath, JSON.stringify(tokens));
    console.log('Access token and refresh token stored to token.json');
});
