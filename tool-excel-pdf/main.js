const fs = require('fs');
const fsExtra = require('fs-extra');
const Excel = require('exceljs');
const path = require('path');
const config = require('../config');
const commaNumber = require('comma-number');
const { v4 : uuidV4 } = require('uuid');
let chromeTmpDataDir = [];


async function createTemplate1(browser, dataALLExcel, fileName) {
    let ten_khach_hang = dataALLExcel.ten_khach_hang;

    if (dataALLExcel.so_dien_thoai || dataALLExcel.nguoi_lien_he) {
        ten_khach_hang += `(${dataALLExcel.nguoi_lien_he} ${dataALLExcel.so_dien_thoai})`;
    }

    // console.log(dataALLExcel.rows);
    const pathFileTemplate = path.join(__dirname,'input','template_1.html');
    // console.log(pathFileTemplate);
    let htmlContent = await getFileHTML(pathFileTemplate);
    const html_table = renderTable(dataALLExcel.rows);
    htmlContent = htmlContent.replace('[rows_data]', html_table);
    htmlContent = htmlContent.replace('[tong_so_luong]', dataALLExcel.tong_so_luong);
    htmlContent = htmlContent.replace('[so_hoa_don]', dataALLExcel.so_hoa_don);
    htmlContent = htmlContent.replace('[ngay_hoa_don]', formatDate(dataALLExcel.ngay_hoa_don));
    htmlContent = htmlContent.replace('[ten_khach_hang]', ten_khach_hang);
    htmlContent = htmlContent.replace('[dia_chi_giao_hang]', dataALLExcel.dia_chi_giao_hang);
    htmlContent = htmlContent.replace('[khach_phai_tra]', commaNumber(dataALLExcel.khach_phai_tra, '.'));
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

async function createTemplate2(browser, dataALLExcel, fileName) {
    let ten_khach_hang = dataALLExcel.ten_khach_hang;

    // console.log(dataALLExcel.rows);
    const pathFileTemplate = path.join(__dirname,'input','template_2.html');
    let htmlContent2 = await getFileHTML(pathFileTemplate);

    htmlContent2 = htmlContent2.replace('[so_phieu_thu]', dataALLExcel.so_phieu_thu);
    htmlContent2 = htmlContent2.replace('[so_hoa_don]', dataALLExcel.so_hoa_don);
    htmlContent2 = htmlContent2.replace('[so_dien_thoai]', dataALLExcel.so_dien_thoai);
    htmlContent2 = htmlContent2.replace('[ten_khach_hang]', ten_khach_hang);
    htmlContent2 = htmlContent2.replace('[dia_chi_giao_hang]', dataALLExcel.dia_chi_giao_hang);
    htmlContent2 = htmlContent2.replace('[khach_phai_tra]', commaNumber(dataALLExcel.khach_phai_tra, '.'));
    htmlContent2 = htmlContent2.replace('[khach_phai_tra_bang_chu]', DocTienBangChu(dataALLExcel.khach_phai_tra));

    const options = {};
    const fileNameOutput = `${dataALLExcel.so_hoa_don}-${fileName}-${dataALLExcel.ten_khach_hang}.pdf`;
    options.path = path.resolve(fileNameOutput);
    options.printBackground = options.printBackground || true;
    options.format = options.format || 'A4';
    options.margin = "none";
    await exportPDF(browser, htmlContent2, options);
    return fileNameOutput;
}

async function createTemplate3(browser, dataALLExcel, fileName) {
    let ten_khach_hang = dataALLExcel.ten_khach_hang;

    if (dataALLExcel.so_dien_thoai || dataALLExcel.nguoi_lien_he) {
        ten_khach_hang += `(${dataALLExcel.nguoi_lien_he} ${dataALLExcel.so_dien_thoai})`;
    }

    // console.log(dataALLExcel.rows);
    const pathFileTemplate = path.join(__dirname,'input','template_3.html');
    let htmlContent = await getFileHTML(pathFileTemplate);
    const html_table = renderTable2(dataALLExcel.rows);
    htmlContent = htmlContent.replace('[rows_data]', html_table);
    htmlContent = htmlContent.replace('[tong_so_luong]', dataALLExcel.tong_so_luong);
    htmlContent = htmlContent.replace('[so_hoa_don]', dataALLExcel.so_hoa_don);
    htmlContent = htmlContent.replace('[so_hoa_don]', dataALLExcel.so_hoa_don);
    htmlContent = htmlContent.replace('[so_phieu_thu]', dataALLExcel.so_phieu_thu);
    htmlContent = htmlContent.replace('[ngay_hoa_don]', formatDate(dataALLExcel.ngay_hoa_don));
    htmlContent = htmlContent.replace('[ten_khach_hang]', ten_khach_hang);
    htmlContent = htmlContent.replace('[dia_chi_giao_hang]', dataALLExcel.dia_chi_giao_hang);
    htmlContent = htmlContent.replace('[khach_phai_tra]', commaNumber(dataALLExcel.khach_phai_tra, '.'));
    htmlContent = htmlContent.replace('[phi_giao_hang]', dataALLExcel.phi_giao_hang);
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

function getLocation(city, arr) {
    const out = [];
    for (let i = 0; i < arr.length; i++) {
        const element = arr[i];
        for (let y = 0; y < element.length; y++) {
            const item = element[y];
            const tempObject = {
                city_name : city,
                lat : item[0],
                long : item[1]
            }
            // console.log(tempObject);
            out.push(tempObject);
        }
    }
    return out;
}


//1. Hàm đọc số có ba chữ số;
function DocSo3ChuSo(baso){
    var ChuSo=new Array(" không "," một "," hai "," ba "," bốn "," năm "," sáu "," bảy "," tám "," chín ");
    var Tien=new Array( "", " nghìn", " triệu", " tỷ", " nghìn tỷ", " triệu tỷ");
    
    var tram;
    var chuc;
    var donvi;
    var KetQua="";
    tram=parseInt(baso/100);
    chuc=parseInt((baso%100)/10);
    donvi=baso%10;
    if(tram==0 && chuc==0 && donvi==0) return "";
    if(tram!=0)
    {
        KetQua += ChuSo[tram] + " trăm ";
        if ((chuc == 0) && (donvi != 0)) KetQua += " linh ";
    }
    if ((chuc != 0) && (chuc != 1))
    {
            KetQua += ChuSo[chuc] + " mươi";
            if ((chuc == 0) && (donvi != 0)) KetQua = KetQua + " linh ";
    }
    if (chuc == 1) KetQua += " mười ";
    switch (donvi)
    {
        case 1:
            if ((chuc != 0) && (chuc != 1))
            {
                KetQua += " mốt ";
            }
            else
            {
                KetQua += ChuSo[donvi];
            }
            break;
        case 5:
            if (chuc == 0)
            {
                KetQua += ChuSo[donvi];
            }
            else
            {
                KetQua += " lăm ";
            }
            break;
        default:
            if (donvi != 0)
            {
                KetQua += ChuSo[donvi];
            }
            break;
        }
    return KetQua;
}

function DocTienBangChu(SoTien){
    var ChuSo=new Array(" không "," một "," hai "," ba "," bốn "," năm "," sáu "," bảy "," tám "," chín ");
var Tien=new Array( "", " nghìn", " triệu", " tỷ", " nghìn tỷ", " triệu tỷ");

    var lan=0;
    var i=0;
    var so=0;
    var KetQua="";
    var tmp="";
    var ViTri = new Array();
    if(SoTien<0) return "Số tiền âm !";
    if(SoTien==0) return "Không đồng !";
    if(SoTien>0)
    {
        so=SoTien;
    }
    else
    {
        so = -SoTien;
    }
    if (SoTien > 8999999999999999)
    {
        //SoTien = 0;
        return "Số quá lớn!";
    }
    ViTri[5] = Math.floor(so / 1000000000000000);
    if(isNaN(ViTri[5]))
        ViTri[5] = "0";
    so = so - parseFloat(ViTri[5].toString()) * 1000000000000000;
    ViTri[4] = Math.floor(so / 1000000000000);
     if(isNaN(ViTri[4]))
        ViTri[4] = "0";
    so = so - parseFloat(ViTri[4].toString()) * 1000000000000;
    ViTri[3] = Math.floor(so / 1000000000);
     if(isNaN(ViTri[3]))
        ViTri[3] = "0";
    so = so - parseFloat(ViTri[3].toString()) * 1000000000;
    ViTri[2] = parseInt(so / 1000000);
     if(isNaN(ViTri[2]))
        ViTri[2] = "0";
    ViTri[1] = parseInt((so % 1000000) / 1000);
     if(isNaN(ViTri[1]))
        ViTri[1] = "0";
    ViTri[0] = parseInt(so % 1000);
  if(isNaN(ViTri[0]))
        ViTri[0] = "0";
    if (ViTri[5] > 0)
    {
        lan = 5;
    }
    else if (ViTri[4] > 0)
    {
        lan = 4;
    }
    else if (ViTri[3] > 0)
    {
        lan = 3;
    }
    else if (ViTri[2] > 0)
    {
        lan = 2;
    }
    else if (ViTri[1] > 0)
    {
        lan = 1;
    }
    else
    {
        lan = 0;
    }
    for (i = lan; i >= 0; i--)
    {
       tmp = DocSo3ChuSo(ViTri[i]);
       KetQua += tmp;
       if (ViTri[i] > 0) KetQua += Tien[i];
       if ((i > 0) && (tmp.length > 0)) KetQua += ',';//&& (!string.IsNullOrEmpty(tmp))
    }
   if (KetQua.substring(KetQua.length - 1) == ',')
   {
        KetQua = KetQua.substring(0, KetQua.length - 1);
   }
   KetQua = KetQua.substring(1,2).toUpperCase()+ KetQua.substring(2);
   return KetQua + ` đồng`;//.substring(0, 1);//.toUpperCase();// + KetQua.substring(1);
}

function createFileCSv(arrData) {
    const csvWriter = createCsvWriter({
        path: 'indonesiaGeo.csv',
        header: [
            {id: 'city_name', title: 'city_name'},
            {id: 'lat', title: 'lat'},
            {id: 'long', title: 'long'},
        ]
    });

    csvWriter
    .writeRecords(arrData)
    .then(()=> console.log('The CSV file was written successfully'));
}


function checkCity(cityName) {
    let temp = cityName.toLowerCase();
    let arr = ['bogor','depok','tangerang','south','bekasi'];

    for (let i = 0; i < arr.length; i++) {
        const element = arr[i];
        if (temp.indexOf(element) >= 0) {
            return true;
        }
    }

    return false;
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

        const objTempath = await createFileHTML(htmlContent);
        await page.goto(objTempath.urlPrint, {waitUntil: 'networkidle0'});
        await page.evaluateHandle('document.fonts.ready');
        await page.pdf(options);
        deletefile(objTempath.fileServer);
        
    } catch (ex) {
        result = ex;
    } finally {
        if (page) {
            await page.close();
        }
    }
    return result;
};

function deletefile(pathFile) {
    fs.unlink(pathFile, function(err){
        if(err) {
            return console.log(err);
        } 
        console.log('file deleted successfully');
    });
}

async function createFileHTML (htmlContent) {
    const fileName = `${uuidV4()}.html`;
    const filePath = path.resolve(__dirname, '../client', 'temporary', fileName);
    console.log(filePath);
    
    fs.writeFileSync(filePath, htmlContent);

    return {
        fileServer : filePath,
        urlPrint : `${config.domain}/temporary/${fileName}`
    };
}


function formatDate(date) {
    const date2 = new Date(date);
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
            tong_so_luong : 0,
            so_hoa_don : '',
            so_phieu_thu : '',
            ngay_hoa_don : '',
            ten_khach_hang : '',
            dia_chi_giao_hang : '',
            khach_phai_tra : 0,
            phi_giao_hang : 0,
            chiet_khau : 0,
            tong_tien : 0,
            nguoi_lien_he : '',
            so_dien_thoai : '',
            rows : [],
            flagStart : false
        };
        let stt = 1;

        wb.xlsx.readFile(filePath).then(function(){
            // console.log(wb._worksheets);
            try {
                for (let i = 0; i < wb._worksheets.length; i++) {
                    const _worksheets = wb._worksheets[i];
                    // console.log(_worksheets);
                    if (_worksheets) {
                        var sh = _worksheets;
                        for (i = 1; i <= sh.rowCount; i++) {
                            if (sh.getRow(i).getCell(1).value == "NGÀY BKG") {
                                if (    Object.prototype.hasOwnProperty.call(sh.getRow(i).getCell(7).value, 'result')
                                    &&  sh.getRow(i).getCell(7).value.result
                                ) {
                                    output.ngay_hoa_don = sh.getRow(i).getCell(7).value.result;
                                } else {
                                    output.ngay_hoa_don = sh.getRow(i).getCell(7).value;
                                }
                            }
                            if (sh.getRow(i).getCell(1).value == "KHÁCH HÀNG") {
                                output.ten_khach_hang = sh.getRow(i).getCell(3).value;
                            }
                            if (sh.getRow(i).getCell(1).value == "NGƯỜI LIÊN HỆ") {
                                output.nguoi_lien_he = sh.getRow(i).getCell(3).value;
                            }
                            if (sh.getRow(i).getCell(1).value == "SỐ LIÊN LẠC") {
                                output.so_dien_thoai = sh.getRow(i).getCell(3).value;
                            }
            
                            if (sh.getRow(i).getCell(2).value == "Địa chỉ:") {
                                output.dia_chi_giao_hang = sh.getRow(i).getCell(3).value;
                            }
            
                            if (sh.getRow(i).getCell(1).value == "so_hoa_don") {
                                output.so_hoa_don = sh.getRow(i).getCell(2).value;
                            }
            
                            if (sh.getRow(i).getCell(1).value == "so_phieu_thu") {
                                output.so_phieu_thu = sh.getRow(i).getCell(2).value;
                            }
            
                            if (checkEndColumn(sh.getRow(i).getCell(6).value)) {
                                output.flagStart = false;
                            }
            
                            if (sh.getRow(i).getCell(6).value == "Phí xe") {
                                if (sh.getRow(i).getCell(1).value && !isNaN(sh.getRow(i).getCell(1).value)) {
                                    output.phi_giao_hang = Number(sh.getRow(i).getCell(1).value);
                                }
                            }
            
                            if (output.flagStart) {
                                output.rows.push({
                                    sl : sh.getRow(i).getCell(1).value,
                                    don_gia : sh.getRow(i).getCell(2).value,
                                    thanh_tien : sh.getRow(i).getCell(3).value.result,
                                    ten_sp : 'Màng bọc thực phẩm ' + sh.getRow(i).getCell(6).value,
                                    ma_sp : sh.getRow(i).getCell(6).value,
                                    dvt : 'Cuộn',
                                    stt : stt
                                });
                                stt++;
                                output.tong_so_luong += sh.getRow(i).getCell(1).value;
                                output.tong_tien += sh.getRow(i).getCell(3).value.result;
                                output.khach_phai_tra += sh.getRow(i).getCell(3).value.result;
                            }
            
                            
                            if (sh.getRow(i).getCell(1).value == "SL") {
                                output.flagStart = true;
                            }
                        }
                        return resolve(output);
                    }
                }
                
            } catch (error) {
                console.log(error);
            }

            resolve(output);
        });

    });

    // console.log(result);
    return result;
}

function checkEndColumn(name) {
    if (typeof name === 'string') {
        const arr = ['vat', 'hkd'];
        const name2 = name.toLowerCase();

        if (name2.includes('vat') || name2.includes('hkd')) {
            return true;
        }

        return false;
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


const out = {
};


out.createFile = async function (dataALLExcel, browser) {
    try {
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
        deletefile(dataFilePath);
        return dataALLExcel;
    } catch (error) {
        console.log(error);
    }

    return {};
}

module.exports = out;