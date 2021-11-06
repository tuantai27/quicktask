const fs = require('fs');
const Excel = require('exceljs');
const path = require('path');
const puppeteer = require('puppeteer');
const commaNumber = require('comma-number');


async function createTemplate1(browser, dataALLExcel, fileName) {
    let ten_khach_hang = dataALLExcel.ten_khach_hang;
    let khach_phai_tra = dataALLExcel.khach_phai_tra;

    if (dataALLExcel.so_dien_thoai || dataALLExcel.nguoi_lien_he) {
        ten_khach_hang += `(${dataALLExcel.nguoi_lien_he} ${dataALLExcel.so_dien_thoai})`;
    }

    if (dataALLExcel.phi_giao_hang !== 0) {
        khach_phai_tra += dataALLExcel.phi_giao_hang;
    }

    console.log(dataALLExcel.rows);
    const pathFileTemplate = path.join(__dirname,'input','template_1.html');
    console.log(pathFileTemplate);
    let htmlContent = await getFileHTML(pathFileTemplate);
    const html_table = renderTable(dataALLExcel.rows);
    htmlContent = htmlContent.replace('[rows_data]', html_table);
    htmlContent = htmlContent.replace('[tong_so_luong]', dataALLExcel.tong_so_luong);
    htmlContent = htmlContent.replace('[so_hoa_don]', dataALLExcel.so_hoa_don);
    htmlContent = htmlContent.replace('[ngay_hoa_don]', formatDate(dataALLExcel.ngay_hoa_don));
    htmlContent = htmlContent.replace('[ten_khach_hang]', ten_khach_hang);
    htmlContent = htmlContent.replace('[dia_chi_giao_hang]', dataALLExcel.dia_chi_giao_hang);
    htmlContent = htmlContent.replace('[khach_phai_tra]', commaNumber(khach_phai_tra, '.'));
    htmlContent = htmlContent.replace('[phi_giao_hang]', commaNumber(dataALLExcel.phi_giao_hang, '.'));
    htmlContent = htmlContent.replace('[chiet_khau]', dataALLExcel.chiet_khau);
    htmlContent = htmlContent.replace('[tong_tien]', commaNumber(dataALLExcel.tong_tien, '.'));

    const options = {};
    const fileNameOutput = `${dataALLExcel.so_hoa_don}-${fileName}-${dataALLExcel.ten_khach_hang}.pdf`;
    options.path = path.resolve(fileNameOutput);
    options.printBackground = options.printBackground || true;
    options.format = options.format || 'A4';
    options.margin = "none";
    await exportPDF(browser, htmlContent, options);

    return fileNameOutput;
}

function getFileHTML(pathFile) {
    const data = fs.readFileSync(pathFile, 'utf8');
    return data;
}

const exportPDF = async(browser,htmlContent,options) => {
    let result = null;
    const page = await browser.newPage();
    await page.setCacheEnabled(false);
    try {
        await page.evaluate(async(html) => {
            document.body.innerHTML = html;
            const selectors = Array.from(document.querySelectorAll("img"));
            await Promise.all(selectors.map(img => {
                if (img.complete) {return;}
                return new Promise((resolve, reject) => {
                    img.addEventListener('load', resolve);
                    img.addEventListener('error', () => {reject(new Error('source of image wrong'));});
                });
            }));
        },htmlContent);
        await page.evaluateHandle('document.fonts.ready');
        await page.waitFor(1000);
        await page.pdf(options);
    } catch (ex) {
        result = ex;
    } finally {
        if (page) {
            await page.close();
        }
    }
    return result;
};


function formatDate(date) {
    const date2 = new Date();
    if (date2.getDate()) {
        var d = date2.getDate();
        var m = date2.getMonth() + 1; //Month from 0 to 11
        var y = date2.getFullYear();
        return '' + (d <= 9 ? '0' + d : d) + '-' + (m<=9 ? '0' + m : m) + '-' + y;
    } else {
        return '';
    }
}


async function getDataFromExcel(filePath) {
    
    var wb = new Excel.Workbook();
    var path = require('path');
    var filePath = path.resolve(__dirname, filePath);

    const result = await new Promise((resolve, reject) => {
        const output = {
            rows : [],
            flagStart : false
        };
        let stt = 1;

        wb.xlsx.readFile(filePath).then(function(){
            try {
                for (let i = 0; i < wb._worksheets.length; i++) {
                    const _worksheets = wb._worksheets[i];
                    if (_worksheets) {
                        if (_worksheets.name === 'MAR') {
                            const sh = _worksheets;
                            for (y = 1; y <= sh.rowCount; y++) {
                                if (sh.getRow(y).getCell(1).value && sh.getRow(y).getCell(1).value === 'No') {
                                    output.flagStart = true;
                                    y++;
                                    continue;
                                }
                                if (output.flagStart) {
                                    if (sh.getRow(y).getCell(1).value === null) {
                                        return resolve(output);
                                    }
                                    const row = sh.getRow(y);

                                    const outRow = [];
                                    const cells = row._cells;
                                    for (let c = 1; c < cells.length; c++) {
                                        const value = row.getCell(c).value;
                                        outRow.push(JSON.stringify(value));    
                                    }
                                    output.rows.push(outRow);    
                                }
                            }
                        }
                    }
                  
                }
                
            } catch (error) {
                console.log(error);
            }

            resolve(output);
        });

    });

    console.log(result);
    return result;
}

function checkEndColumn(name) {
    if (typeof name === 'string') {
        const arr = ['vat', 'hkd'];
        const name2 = name.toLowerCase();

        for (let i = 0; i < arr.length; i++) {
            const element = arr[i];
            if (! name2.includes(element)) {
                return false;
            }
        }

        return true;
    }
    return false;
}


function renderTable2(arr) {
    try {
        let str = '';
        for(let i = 0; i < arr.length; i++) {
            const temp = [];
            temp.push(`<tr style="padding: 8px;">`);
            temp.push(`<td style="text-align: center;padding:4px;">${arr[i].stt}</td>`);
            temp.push(`<td style="text-align: center;">${arr[i].ma_sp}</td>`);
            temp.push(`<td style="">${arr[i].ten_sp}</td>`);
            temp.push(`<td style="text-align: center;">${arr[i].dvt}</td>`);
            temp.push(`<td style="text-align: center;">${arr[i].sl}</td>`);
            temp.push(`</tr>`);
            str += temp.join('');

        }

        return str;
        
    } catch (error) {
        console.log(error);
    } 
}
function renderTable(arr) {
    
    try {
        let str = '';
        for(let i = 0; i < arr.length; i++) {
            const temp = [];
            temp.push(`<tr style="padding: 8px;">`);
            temp.push(`<td style="text-align: center;padding:4px;">${arr[i].stt}</td>`);
            temp.push(`<td style="">${arr[i].ten_sp}</td>`);
            temp.push(`<td style="text-align: center;">${arr[i].dvt}</td>`);
            temp.push(`<td style="text-align: center;">${arr[i].sl}</td>`);
            temp.push(`<td style="padding-right:4px; text-align: right;">${commaNumber(arr[i].don_gia, '.')}</td>`);
            temp.push(`<td style="padding-right:4px;text-align: right;">${commaNumber(arr[i].thanh_tien, '.')}</td>`);
            temp.push(`</tr>`);
            str += temp.join('');

        }

        return str;
        
    } catch (error) {
        console.log(error);
    } 
}


const out = {}
out.createFile = async function (dataALLExcel) {
    try {
        const browser = await puppeteer.launch({headless: true});
        const fileName1 = await createTemplate1(browser, dataALLExcel, 'HDBH');
        const fileName2 = await createTemplate2(browser, dataALLExcel, 'PT');
        const fileName3 = await createTemplate3(browser, dataALLExcel, 'BBGH');

        return [fileName1, fileName2, fileName3];
    } catch (error) {
        console.log(error);
    }
    return [];
}

out.getDataFile = async function (dataFilePath) {
    try {
        const dataALLExcel = await getDataFromExcel(dataFilePath);
        return dataALLExcel;
    } catch (error) {
        console.log(error);
    }

    return {};
}

module.exports = out;