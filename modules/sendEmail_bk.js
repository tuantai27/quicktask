const nodemailer = require('nodemailer');
const fs = require('fs');
const config = require('../config');

const output = {
    user : config.emailFrom,
    pass : config.passwordEmail
};

output.getFile = async function (fileName, pathFile) {
    const resultData = await new Promise((resolve, reject) => {
        fs.readFile(pathFile, (err, data) => {
            if (err) {
                return reject(err);
            }
            return resolve(data);
        });
    });
    // await output.deleteFile(pathFile);

    return {
        filename    : fileName,
        content     : resultData
    };
}

output.deleteFile = async function (pathFile) {
    return await new Promise((resolve, reject) => {
        fs.unlink(pathFile, function(err){
            if(err) {
                return reject(err);
            } 
            resolve('file deleted successfully');
        });
    });
}

output.send = async function(monthly, workerName, emailTo, emailBcc, uuid, attachments) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: output.user,
            pass: output.pass
        }
    });
    const m_monthly = monthly.replace(/[ ]/g,'');

    const arrStyleButton = [];
    arrStyleButton.push(`display: inline-block;`);
    arrStyleButton.push(`font-weight: 400;`);
    arrStyleButton.push(`text-align: center;`);
    arrStyleButton.push(`white-space: nowrap;`);
    arrStyleButton.push(`vertical-align: middle;`);
    arrStyleButton.push(`-webkit-user-select: none;`);
    arrStyleButton.push(`-moz-user-select: none;`);
    arrStyleButton.push(`-ms-user-select: none;`);
    arrStyleButton.push(`user-select: none;`);
    arrStyleButton.push(`border: 1px solid transparent;`);
    arrStyleButton.push(`padding: .375rem .75rem;`);
    arrStyleButton.push(`font-size: 1rem;`);
    arrStyleButton.push(`line-height: 1.5;`);
    arrStyleButton.push(`border-radius: .25rem;`);
    arrStyleButton.push(`transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;`);
    const arrMessage = [];
    arrMessage.push(`<table style="font-size: 1rem;font-weight: 400;padding: 8px;margin: 4px;">`);
    arrMessage.push(`<tr>`);
    arrMessage.push(`<td colspan="2">`);
    arrMessage.push(`Dear ${workerName},`);
    arrMessage.push(`</td>`);
    arrMessage.push(`</tr>`);
    arrMessage.push(`<tr>`);
    arrMessage.push(`<td colspan="2">`);
    arrMessage.push(`????nh k??m Email n??y l?? file chi ti???t l????ng ${monthly}.`);
    arrMessage.push(`</td>`);
    arrMessage.push(`</tr>`);
    arrMessage.push(`<tr>`);
    arrMessage.push(`<td colspan="2">`);
    arrMessage.push(`Anh/ch??? vui l??ng nh???n <strong>X??c nh???n</strong> ho???c <strong>?? ki???n</strong> ????? g???i ph???n h???i n???u c?? th???c m???c v??? b???ng t??nh.`);
    arrMessage.push(`</td>`);
    arrMessage.push(`</tr>`);
    arrMessage.push(`<tr>`);
    arrMessage.push(`<td colspan="2">`);
    arrMessage.push(`????y l?? Email t??? ?????ng, vui l??ng kh??ng tr??? l???i th?? n??y.`);
    arrMessage.push(`</td>`);
    arrMessage.push(`</tr>`);
    arrMessage.push(`<tr>`);
    arrMessage.push(`<td colspan="2">`);
    arrMessage.push(`Thanks and Best regards.`);
    arrMessage.push(`</td>`);
    arrMessage.push(`</tr>`);
    arrMessage.push(`<tr>`);
    arrMessage.push(`<td align="center">`);
    arrMessage.push(`<a style="color: #fff;background-color: #28a745;border-color: #28a745;${arrStyleButton.join('')}" href="${config.domain}/thanks/${m_monthly}/${uuid}" role="button">X??c nh???n</a>`);
    arrMessage.push(`</td>`);
    arrMessage.push(`<td>`);
    arrMessage.push(`<a style="color: #fff;background-color: #007bff;border-color: #007bff;${arrStyleButton.join('')}" href="${config.domain}/replySalary/${m_monthly}/${uuid}" role="button">?? ki???n</a>`);
    arrMessage.push(`</td>`);
    arrMessage.push(`</tr>`);
    arrMessage.push(`</table>`);
    return new Promise((resolve, reject) => {
        transporter.sendMail({
            from      : config.emailFrom,
            to        : emailTo,
            // to        : "tuantai19@gmail.com",
            bcc       : emailBcc,
            subject   : `BANG LUONG NAM ${monthly}-NV ${workerName}`,
            html      : arrMessage.join(''),
            attachments: attachments
        }, function (err, success) {    
            if (err) {
                console.log(err);
                return reject(err);
            }
            console.log({ success });
            resolve(success);
        });
    });
};

module.exports = output;