const chi_luong = require('./main_chi_luong');

(async () => {
    console.log('test');
    const result = await chi_luong.getDataFile('./data/LGW-OFFCB-2021T04.xlsm');
    console.log(result);

    

})();