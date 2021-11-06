
const excelToJson       = require('convert-excel-to-json');
const { v4 : uuidv4}    = require('uuid');
const fs                = require('fs'); 

const out = {};

out.importData = async ()=> {
    console.log('import start');
    try {
        const chinhThuc             = await out.readFileExcel('chinh_thuc', 'Chính Thức','Book1.xlsx', true);
        const probation             = await out.readFileExcel('thu_viec', 'Thử Việc','Book2.xlsx', false);
        const nguoi_phu_thuoc       = await out.readFileExcel2('test_abcd.xlsx');
        const all                   = out.mergeData(chinhThuc, probation, nguoi_phu_thuoc);
        await out.writeFile(all);
        await out.readFileExcel('thu_viec');
    } catch (error) {
        console.log(error);
    }
    console.log('import end');
};


out.writeFile = async (data) => {
    fs.writeFileSync('./client/js/dataMain.js', `const dataMain = ${JSON.stringify(data)};`);
};

out.dateToDMY = function (date) {
    if (date.getDate()) {
        const d = date.getDate();
        const m = date.getMonth() + 1; //Month from 0 to 11
        const y = date.getFullYear();
        return '' + (d <= 9 ? '0' + d : d) + '-' + (m <= 9 ? '0' + m : m) + '-' + y;
    } else {
        return '';
    }
};

out.mergeData = function (chinh_thuc, probation, nguoi_phu_thuoc) {
    const out = {};
    const out2 = [];
    const list = chinh_thuc.concat(probation);
    console.log(list.length);
    for (let i = 0; i < list.length; i++) {
        const element = list[i];
        const cmnd = `cmnd_${element.cmnd}`;

        if (!out[cmnd]) {
            out[cmnd] = [];
        }
        out[cmnd].push(element);
    }

    for (const key of Object.keys(out)) {
        const temp = out[key][0];
        temp['uuid'] = uuidV4();
        // console.log(temp.mst);
        const mst = `mst_${temp.mst}`;
        if (nguoi_phu_thuoc[mst]) {
            temp.detail2 = nguoi_phu_thuoc[mst];
            temp.sNpT = nguoi_phu_thuoc[mst].length;
            console.log(temp.worker_name);
            console.log(nguoi_phu_thuoc[mst].length);
        
        }
        for (let x = 1; x < out[key].length; x++) {
            const element = out[key][x];
            temp.detail1 = temp.detail1.concat(element.detail1);
        }
        out2.push(temp);
    }
    return out2;
};

out.readFileExcel2 = async (file_name) => {
    const data = fs.readFileSync(file_name);
    
    try {
        const result = excelToJson({
            source: data,
            header:{
                rows: 1
            }
        });
        const output = {};
        for (let i = 0; i < result.Sheet1.length; i++) {
            const element = result.Sheet1[i];
            const mst = `mst_${element['D']}`;
            
            if ( ! output[mst]) {
                output[mst] = [];
            }
            // console.log(element);
            output[mst].push({
                active              : true,
                name                : element['E'],
                month_from          : element['Q'],
                ngay_sinh           : out.dateToDMY(element['F']),
                quoc_tich           : element['H'],
                quan_he             : element['J'],
                so                  : element['K'],
                quyen               : element['L'],
                quoc_gia            : element['M'],
                tinh_thanh_pho      : element['N'],
                quan_huyen          : element['O'],
                phuong_xa           : element['P'],
                note                : '',
                mst                 : element['G'],
                cmnd                : element['I'],
                filesInfo           : [],
                show_details        : ''
            
            });
        }
        return output;
    } catch (error) {
        console.log(error);  
    }
};

out.readFileExcel = async (type, text_type, file_name, active) => {
    const data = fs.readFileSync(file_name);
    
    try {
        const result = excelToJson({
            source: data,
            header:{
                rows: 1
            }
        });
        const output = [];
        for (let i = 1; i < result.Sheet1.length; i++) {
            const element = result.Sheet1[i];
            const worker_name = element['C'];
            if (worker_name) {
                let sex = '';
                if (element['D']) {
                    sex = element['D'].toLowerCase();
                }
                const detail1 = [];
                const day_from      = out.dateToDMY(new Date(element['AE']));
                const day_to        = out.dateToDMY(new Date(element['AJ']));
                const ngay_sinh     = out.dateToDMY(new Date(element['F']));
                const ngay_cap      = out.dateToDMY(new Date(element['L']));
                detail1.push({
                    active          : active,
                    type            : type,
                    soHD            : element['AC'],
                    luong           : element['AD'],
                    day_from        : day_from,
                    day_to          : day_to,
                    filesInfo       : [],
                    pc_xang_xe      : element['AA'],
                    pc_dien_thoai   : element['AB'],
                    tinh_thang_hdld : element['AF'],
                    ghi_chu         : element['AM']
                });
                output.push({
                    worker_name     : element['C'],
                    sNpT            : 0,
                    time          : {
                        soHD        : element['AC'],
                        day_from    : day_from,
                        day_to      : day_to
                    },
                    status          : {
                        value       : type,
                        text        : text_type
                    },
                    detail1               : detail1,
                    sex                   : sex,
                    chuc_danh             : element['E'],
                    ngay_sinh             : ngay_sinh,
                    nguyen_quan           : element['G'],
                    trinh_do              : element['H'],
                    dc_thuong_tru         : element['I'],
                    dc_hien_tai           : element['J'],
                    cmnd                  : element['K'],
                    ngay_cap              : ngay_cap,
                    noi_cap               : element['M'],
                    mst                   : element['N'],
                    chi_cuc_thue          : element['O'],
                    so_bhxh               : element['P'],
                    the_bhyt              : element['Q'],
                    benh_vien             : element['R'],
                    so_tai_khoan          : element['S'],
                    ngan_hang             : element['T'],
                    sdt_cong_ty           : element['U'],
                    sdt_ca_nhan           : element['V'],
                    so_may_nhanh          : element['W'],
                    email_cong_ty         : element['X'],
                    email_ca_nhan         : element['Y'],
                    skype                 : element['Z'],
                    ten_cong_ty           : element['AG'],
                    company_name          : element['AH'],
                    noi_lam_viec          : 'van_phong'
                });
            }
            
        }
        return output;
    } catch (error) {
        console.log(error);
    }
};

module.exports = out;