const fs = require('fs');
const schedule = require('node-schedule');
const fsExtra = require('fs-extra');

const output = {
    pathTemp : `C:/Users/Administrator/AppData/Local/Temp/2`
};

output.getDirectories = function (path) {
  return fs.readdirSync(path).filter(function (file) {
    return fs.statSync(path+'/'+file).isDirectory();
  });
}

output.clear = function () {
    const listFolder = output.getDirectories(output.pathTemp);
    for (let i = 0; i < listFolder.length; i++) {
        try {
            const folderName = listFolder[i];
            if (folderName.indexOf('puppeteer_dev_chrome_profile') > -1) {
                const pathFolder = output.pathTemp + '/' + folderName;
                console.log(pathFolder);
                fsExtra.emptyDirSync(pathFolder);
                fs.rmdirSync(pathFolder, { recursive: true });
            }
            
        } catch (error) {
            
        }
    }
}


output.setScheduleClear = function() {
    const job = schedule.scheduleJob('0 0 0 * * *', function(){
        console.log('The answer to life, the universe, and everything!');
        output.clear();
    });
}

module.exports = output;