const salary = require('../datalayer/salary');
const HummusRecipe = require('hummus-recipe');
const fs = require('fs');
const path = require('path');

const out = {};

// (async ()=>{
//     try {
//         //import data;
//         const fileName = `1b0164c5-d5eb-403e-85a4-f34090f495f9.pdf`;
//         const inputFilePath = path.resolve('salary','files', fileName);
//         const outputFilePath = path.resolve('salary','files_done', fileName);
//         const icon = path.resolve('salary','image', 'icon_approval.png');
//         createFile(inputFilePath, outputFilePath, 'Nguyen thi quynh tram mm', '04/07/2021', icon);

//     } catch (error) {
//         console.log(error);
//     }
//     console.log('end');
// })();

out.runCreateFile = async function (uuid) {
    try {
        const result = await salary.selectSalary(uuid);

        if (result && Array.isArray(result) && result.length > 0) {
            const {name, updated_at, status_name, monthly} = result[0];
            const approvalDate = formatDate(updated_at);
            const inputFilePath = path.resolve(__dirname, '../salary','files', uuid);
            const outputFilePath = path.resolve(__dirname, '../salary','files_done', `${monthly} ${name}.pdf`);
            const icon = path.resolve(__dirname,'../salary','image', 'icon_approval.png');
            createFile(inputFilePath, outputFilePath, name, approvalDate, icon);
            await salary.updateSalary({
                uuid : uuid,
                status_name : status_name,
                has_file : 'yes'
            });
        }
    } catch (error) {
        console.log(error);
    }
}

function formatDate(dateTime) {
    const tmp = new Date(dateTime);
    var d = tmp.getDate();
    var m = tmp.getMonth() + 1; //Month from 0 to 11
    var y = tmp.getFullYear();

    return '' + (d <= 9 ? '0' + d : d) + '/' + (m<=9 ? '0' + m : m) + '/' + y;
}

function createFile (inputFilePath, outputFilePath, your_name, currentDate, icon) {
    console.log(inputFilePath);
    console.log(outputFilePath);
    try {
        let pdfDoc = new HummusRecipe(inputFilePath, outputFilePath);
        pdfDoc = pdfDoc.editPage(1);
        const text1 = `Xác nhận bởi: ${your_name}`;
        const text2 = `Ngày: ${currentDate}`;
        let heightIcon = 355;
        
        if (your_name.length > 22) {
            heightIcon = 365;
        }

        pdfDoc = pdfDoc.text(text1 + '\n' + text2, 440, 350, {
            color: '#00D100',
            fontSize: 7,
            bold: true,
            font: 'Helvatica',
            align: 'left left',
            textBox: {
                width: 140,
                lineHeight: 10,
                padding: [6, 4],
                style: { 
                    lineWidth: 1,
                    stroke: '#00D100',
                    fill: '#ffffff',
                    opacity: 0.1
                }
            }
        }).image(icon, 553, heightIcon, {width: 25, keepAspectRatio: true});
        pdfDoc.endPage().endPDF();
    } catch (error) {
        console.log(error);
    }
}

module.exports = out;