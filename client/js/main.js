Vue.component('my-currency-input', {
    props: ["value","disabled"],
    template: `
        <div>
            <b-form-input type="text" v-model="displayValue" @blur="isInputActive = false" @focus="isInputActive = true" :disabled="disabled"/>
        </div>`,
    data: function() {
        return {
            isInputActive: false
        }
    },
    computed: {
        displayValue: {
            get: function() {
                if (this.isInputActive) {
                    // Cursor is inside the input field. unformat display value for user
                    return this.value.toString()
                } else {
                    // User is not modifying now. Format display value for user interface
                    if (isNaN(this.value)) {
                        return "";
                    }
                    return "" + this.value.toFixed(0).replace(/(\d)(?=(\d{3})+(?:\.\d+)?$)/g, "$1,")
                }
            },
            set: function(modifiedValue) {
                // Recalculate value after ignoring "$" and "," in user input
                let newValue = parseFloat(modifiedValue.replace(/[^\d\.]/g, ""))
                // Ensure that it is not NaN
                if (isNaN(newValue)) {
                    newValue = 0
                }
                // Note: we cannot set this.value as it is a "prop". It needs to be passed to parent component
                // $emit the event so that parent component gets it
                this.$emit('input', newValue)
            }
        }
    }
});
Vue.component('date-picker', VueBootstrapDatetimePicker);
Vue.component('my-date-input', {
    props: ["value","disabled"],
    template: `
        <div>
            <date-picker v-model="displayValue" :config="{format: 'DD-MM-YYYY',  useCurrent: false}"></date-picker>
        </div>`,
    data: function() {
        return {
        }
    },
    methods : {
        isValidDateYYYYMMDD : function (dateString) {
            var regEx = /^\d{4}-\d{2}-\d{2}$/;
            return dateString.match(regEx) != null;
        },
        formattedDDMMYYY(dateString) {
            // debugger;
            try {
                let temp = null;
                const dateParts = dateString.split("-");
                temp = new Date(+dateParts[0], dateParts[1] - 1, +dateParts[2]);
                const d = temp.getDate();
                const m = temp.getMonth() + 1; //Month from 0 to 11
                const y = temp.getFullYear();
                return '' + (d <= 9 ? '0' + d : d) + '-' + (m <=9 ? '0' + m : m) + '-' + y;
                
            } catch (error) {
                console.log(error);
            }
        } 
    },
    computed: {
        displayValue: {
            get: function() {
                // debugger;
                try {
                    let temp = this.value;
                    if (this.isValidDateYYYYMMDD(temp)) {
                        temp = this.formattedDDMMYYY(temp);
                    }
                    return temp;
                } catch(err) {
                    console.log(err);
                }
                return '';
            },
            set: function(modifiedValue) {
                try {
                    this.$emit('input', modifiedValue);
                } catch(err) {
                    this.$emit('input', '');
                    console.log(err);
                }
                
            }
        }
    }
});
(()=>{
    // eslint-disable-next-line no-undef
    let vueApp;
    const methods = {
        getIcon : function (filename) {
            switch (vueApp.getFileExtension(filename)) {
                case 'xls' :
                case 'xlsx' :
                    return 'fa fa-file-excel-o';
                case 'pdf' :
                    return 'fa fa-file-pdf-o';
                case 'doc' :
                    return 'fa fa-file-word-o';
                case 'zip' :
                    return 'fa fa-file-zip-o';
                case 'ppt' :
                case 'pptx' :
                    return 'fa fa-file-powerpoint-o';
                case 'txt' :
                    return 'fa fa-file-text-o';
                default :
                    return '';
            }
        },
        buildUpload (files, index, typeDetail) {
            console.log(files);
            if (files && files.length > 0) {
                const file = files[0];
                if (!vueApp.checkFileExtension(file.name)) {
                    vueApp.makeToast('danger', `file is invalid`);
                    return;
                }
                // this.forms.uploads.document_id = this.current_document.id;
                // this.forms.uploads.file = files[0];
                const row = vueApp.$data.modal.dataModal[typeDetail][index];
                row.filesInfo.push({id:0});
                const indexFile = row.filesInfo.length;
                Vue.set(vueApp.$data.modal.dataModal[typeDetail], index, row);
                const formData = new FormData();
                formData.append("file", files[0], files[0].name);
                formData.append('action', 'add');
                formData.append('action_id', 'file');
                vueApp.runUpload(event, formData, {}, function (data) {
                    console.log(data);
                    if (data.status === "finish" && Array.isArray(data.result) && data.result.length > 0) {
                        const row = vueApp.$data.modal.dataModal[typeDetail][index];
                        row.filesInfo[indexFile - 1] = {
                            id          : data.result[0],
                            file_name   : file.name
                        };
                        Vue.set(vueApp.$data.modal.dataModal[typeDetail], index, row);
                        vueApp.updateViewer();
                    }
                });
            }
        },
        updateViewer() {
            setTimeout(() => {
                if (vueApp.$data.configs.viewer) {
                    vueApp.$data.configs.viewer.destroy();
                }
                vueApp.$data.configs.viewer = new Viewer(document.getElementById('images_document'), {});
            }, 100);
        },
        insertData(row, tableName) {
            $.ajax({
                url: `/datalayer/i/${tableName}`,
                method: 'POST',
                data: {
                    row : JSON.stringify(row)
                },
                success:function(data,status,req){
                    console.log(data);
                },
                error:function(error) {
                }
            });
        },
        deleteRowByUUID(row,tableName) {
            const {uuid} = row;
            // debugger;
            $.ajax({
                url: `/datalayer/d/${tableName}/${uuid}`,
                method: 'DELETE',
                data: {
                    row : JSON.stringify(row)
                },
                success:function(data,status,req){
                    console.log(data);
                },
                error:function(error) {
                }
            });
        },
        updateData(row, tableName, callback) {
            const {uuid} = row;
            $.ajax({
                url: `/datalayer/u/${tableName}/${uuid}`,
                method: 'PUT',
                data: {
                    row : JSON.stringify(row)
                },
                success:function(data,status,req){
                    console.log(data);
                    // debugger;
                    if (status === 'success') {
                        callback(null, data);
                    } else {
                        callback(data);
                    }
                },
                error:function(error) {
                    callback(error);
                }
            });
        },
        selectData(row, tableName, callback) {
            $.ajax({
                url: `/datalayer/s/${tableName}`,
                method: 'GET',
                data: {
                    row : JSON.stringify(row)
                },
                success:function(data,status,req){
                    // debugger;
                    if (status === "success") {
                        callback(null, data.result);
                    } else {
                        callback(data);
                    }
                },
                error:function(error) {
                    callback(error);
                }
            });
        },
        selectDataUUID(uuid, tableName, callback) {
            $.ajax({
                url: `/datalayer/s/${tableName}/${uuid}`,
                method: 'GET',
                data: {},
                success:function(data,status,req){
                    // debugger;
                    if (status === "success") {
                        callback(null, { ...data.result, uuid : uuid});
                    } else {
                        callback(data);
                    }
                },
                error:function(error) {
                    callback(error);
                }
            });
        },
        runUpload(event, formData, params, callback, progressHandling = function (event) {
            let percent = 0;
            let position = event.loaded || event.position;
            let total = event.total;
            if (event.lengthComputable) {
                percent = Math.ceil(position / total * 100);
            }
            console.log(percent,'%');
        }) {
            const url = [];
            for (const key of Object.keys(params)) {
                url.push(`${key}=${params[key]}`);
            }
            event.target.disabled = true;
            $.ajax({
                url: `/uploadfile?${url.join('&')}`,
                method: 'POST',
                xhr: function () {
                    var myXhr = $.ajaxSettings.xhr();
                    if (myXhr.upload) {
                        myXhr.upload.addEventListener('progress', progressHandling, false);
                    }
                    return myXhr;
                },
                async: true,
                data: formData,
                cache: false,
                contentType: false,
                processData: false,
                timeout: 60000,
                success:function(data,status,req){
                    event.target.disabled = false;
                    if(data.error) {
                        vueApp.makeToast('danger','<b>can\'t edit:</b>' + data.error);
                        return;
                    }
                    
                    if (typeof callback === 'function') {
                        callback(data);
                    }
                },
                error:function() {
                    event.target.disabled = false;
                }
            });
           
        },
        checkFileExtension : function(filename) {
            const images = ['png', 'ai', 'bmp', 'gif', 'ico', 'jpeg', 'jpg', 'ps', 'psd', 'svg', 'tif', 'tiff'];
            const files = ['xls', 'xlsx', 'doc', 'zip', 'ppt', 'pptx', 'txt', 'pdf'];
            const ext = vueApp.getFileExtension(filename).toLocaleLowerCase();
            return (images.includes(ext) || files.includes(ext)) ;
        },
        getFileExtension : function(filename) {
            const ext = /^.+\.([^.]+)$/.exec(filename);
            return ext == null ? "" : ext[1];
        },
        isDate : (date) => {
            try {
                // debugger;
                let temp = null;
                if (typeof date === 'string' && date === '') {
                    return false;
                }
                if (typeof date === 'string') {
                    temp = vueApp.stringToDate(date, 'dd-mm-yyyy', '-');
                }
                var dateWrapper = new Date(temp);
                return !isNaN(dateWrapper.getDate());

            } catch (error) {
                return false;
            }
        },
        onSearch : () => {
            setTimeout(() => {
                vueApp.selectData(vueApp.$data.search, 'employee', function (err, result) {
                    const arr = [];
                    for (let i = 0; i < result.length; i++) {
                        const meta_data = result[i];
                        if (typeof meta_data === 'string') {
                            arr.push(JSON.parse(meta_data));
                        } else {
                            const {worker_name, company_name} = meta_data;
                            console.log(worker_name);
                            console.log(company_name);
                            arr.push(meta_data);
                        }
                        
                    }
                    const total = vueApp.total_luong(arr);
                    vueApp.$data.configs.total_luong = total;
                    vueApp.$data.configs.rows2 = arr;
                    vueApp.$data.configs.rows = arr;
                    console.log(result);
                });
            }, 300);
        },
        removeFile(id, type) {
            const rs = confirm('Are you Sure?');
            if (rs) {
                console.log(id);
                // console.log(vueApp.$data.modal.dataModal.detail1);
                const arr = vueApp.$data.modal.dataModal[type];
                for(let i = 0; i < arr.length; i++) {
                    const {filesInfo} = arr[i];
                    for(let y = 0; y < filesInfo.length; y++) {
                        if (filesInfo[y].id === id) {
                            vueApp.removeServerFile(id, function(err, data) {
                                if (err) {
                                    vueApp.makeToast('danger','<b>can\'t edit:</b>' + err.error);
                                    return;
                                }
                            });
                            arr[i].filesInfo.splice(y, 1);
                            Vue.set(vueApp.$data.modal.dataModal[type], i, arr[i]);
                        }
                    }
                }
            }
        },
        removeServerFile(id, callback) {
            $.ajax({
                url: `/deleteFile/${id}`,
                method: 'GET',
                async: true,
                cache: false,
                contentType: false,
                processData: false,
                timeout: 60000,
                success:function(data,status,req){
                    console.log(data);
                    if(data.status !== 'success') {
                        callback(data.error, null);
                    } else {
                        callback(null, data);
                    }
                }
            });
        },
        downloadFile(id, name) {
            const rs = confirm('Are you Sure?');
            if (rs) {
                console.log(id);
                console.log(name);
                fetch(`../client/files/${id}`)
                    .then(resp => resp.blob())
                    .then(blob => {
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.style.display = 'none';
                        a.href = url;
                        // the filename you want
                        a.download = name;
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        alert('your file has downloaded!'); // or you know, something with better UX...
                    })
                    .catch(() => alert('oh no!'));
            }
        },
        getIndexByUUID (row) {
            const table = vueApp.$data.configs.rows;
            for (let i = 0; i < table.length; i++) {
                const element = table[i];
                if (element.uuid == row.uuid) {
                    return i;
                }
            }
            return -1;
        },
        updateAll : () => {
            try {
                for (let i = 0; i < vueApp.$data.configs.rows.length; i++) {
                    const row = vueApp.$data.configs.rows[i];
                    const {detail1} = row;
                    // debugger;
                    for (let y = 0; y < detail1.length; y++) {
                        const {active, day_to, day_from} = detail1[y];
                        if (active === true) {
                            row.time.day_to = day_to;
                            row.time.day_from = day_from;
                        }
                    }
                    vueApp.updateData(row, 'employee', function (err, res) {
                        vueApp.$data.modal.showModal = false;
                        if (err) {
                            vueApp.makeToast('error', 'Thất bại');
                        } else {
                            vueApp.makeToast('success', 'Thành công.');
                        }
                        
                    });
                }
            } catch (error) {
                console.log(error);
            }
        },
        runEdit : () => {
            try {
                if (vueApp.beforeCheck()) {
                    const row = vueApp.formatData(vueApp.$data.modal.dataModal);

                    const index = vueApp.getIndexByUUID(row);
                    if (index === -1) {
                        vueApp.$data.modal.showModal = false;
                        vueApp.makeToast('danger', 'find not found.');
                        return;    
                    }
                    
                    
                    vueApp.updateData(row, 'employee', function (err, res) {
                        vueApp.$data.modal.showModal = false;
                        if (err) {
                            vueApp.makeToast('error', 'That bai');
                        } else {
                            Vue.set(vueApp.$data.configs.rows, index, row);
                            vueApp.makeToast('success', 'Thành công.');
                        }
                        
                    });
                    // vueApp.onSearch();
                   
                }
            } catch (error) {
                console.log(error);
            }
        },
        makeToast(variant = null, msg) {
            // alert(msg);
            let title = 'Thông báo';
            
            if (variant === 'danger') {
                title = 'Thông báo lỗi !';
            }

            if (variant === 'warning') {
                title = 'Cảnh báo !';
            }
            vueApp.$data.modal.countDown = 2;
            vueApp.$data.modal.variant = variant;
            vueApp.$data.modal.alertText = title + msg;
        },
        formatData : (objData) => {
            try {
                // debugger;
                const temp = objData;
                temp['status']    = '';
                temp['soHD']      = '';
                temp['sNpT']      = 0;
                temp['time']      = {
                    day_from    : '',
                    day_to      : '',
                    soHD        : ''
                };
                for (let i = 0; i < temp.detail1.length; i++) {
                    const element = temp.detail1[i];
                    if (element.active === true) {
                        // const day_from = vueApp.dateToDMY(element.day_from);
                        // const day_to = vueApp.dateToDMY(element.day_to);
                        temp['time'].day_from   = element.day_from;
                        temp['time'].day_to     = element.day_to;
                        temp['status']          = element.type;
                        temp['time'].soHD       = element.soHD;
                    }
                }
                for (let i = 0; i < temp.detail2.length; i++) {
                    const element = temp.detail2[i];
                    if (element.active === true) {
                        temp['sNpT'] += 1;
                    }
                }

                return temp;
                
            } catch (error) {
                console.log(error);
            }
        },
        dateToDMY(date) {
            if (vueApp.isDate(date) === false ) {
                return '';
            }
            let temp = null;
            if (typeof date === 'string') {
                // const dateParts = date.split("-");
                return date; 
            } else {
                temp = date;
            }
            const d = temp.getDate();
            const m = temp.getMonth() + 1; //Month from 0 to 11
            const y = temp.getFullYear();
            return '' + (d <= 9 ? '0' + d : d) + '-' + (m <=9 ? '0' + m : m) + '-' + y;
        },
        stringToDate(_date, _format, _delimiter){
            const formatLowerCase = _format.toLowerCase();
            const formatItems = formatLowerCase.split(_delimiter);
            const dateItems = _date.split(_delimiter);
            const monthIndex = formatItems.indexOf("mm");
            const dayIndex = formatItems.indexOf("dd");
            const yearIndex = formatItems.indexOf("yyyy");
            let month = parseInt(dateItems[monthIndex]);
            month -= 1;
            const formattedDate = new Date(dateItems[yearIndex],month,dateItems[dayIndex]);

            return formattedDate;
        },
        getName(type) {
            // debugger;
            const arr = vueApp.getOptions('status');
            for (let i = 0; i < arr.length; i++) {
                const element = arr[i];
                if (element.value === type) {
                    return element;
                }
            }
            return {};
        },
        runCancel : () => {
            vueApp.$data.modal.showModal = false;
        },
        getStt(yyyyMM, company_name) {
            const arr = [];
            const table = vueApp.$data.configs.rows;
            for (let i = 0; i < table.length; i++) {
                const row = table[i];
                if (row.company_name === company_name) {
                    const detail1 = row.detail1;
                    if (Array.isArray(detail1) ) {
                        for (let index = 0; index < detail1.length; index++) {
                            const element = detail1[index];
                            if (Object.prototype.hasOwnProperty.call(element, 'soHD') && element.soHD.indexOf(yyyyMM) >= 0) {
                                arr.push(element);
                            }
                        }
                    }
                    
                }
            }
            // console.log(arr);
            return  '000' + (arr.length + 1);
        },
        clickDetail(row) {
            row.toggleDetails();
            vueApp.updateViewer();
        },
        initSoHD(company_name) {
            const yyyyMM = vueApp.getYYYYmm();
            const stt = vueApp.getStt(yyyyMM, company_name);
            const sttName = stt.substring(stt.length - 3,stt.length);
            return `${yyyyMM}-${sttName}/HĐLĐ-${company_name}`;
        },
        total_luong(table) {
            let total = 0;
            for (let i = 0; i < table.length; i++) {
                const row = table[i];
                const detail1 = row.detail1;
                if (Array.isArray(detail1) ) {
                    for (let index = 0; index < detail1.length; index++) {
                        const element = detail1[index];
                        if (Object.prototype.hasOwnProperty.call(element, 'active')) {
                            if (Object.prototype.hasOwnProperty.call(element, 'luong') && element.luong >= 0) {
                                total += Number(element.luong);
                            }
                        }
                    }
                }
                    
            }
            return total;
        },
        getYYYYmm() {
            const date = new Date();
            const m = date.getMonth() + 1; //Month from 0 to 11
            const y = date.getFullYear();
            return '' + y + (m <= 9 ? '0' + m : m);
        },
        beforeCheck() {
            return true;
            // if (vueApp.$data.modal.dataModal.detail1.length === 0) {
            //     vueApp.makeToast('danger', 'Hợp Đồng bắt buộc nhâp.');
            //     return false;
            // }
            // if (vueApp.$data.modal.dataModal.detail1.length > 0) {
            //     if (vueApp.checkActiveHD() === false) {
            //         vueApp.makeToast('danger', 'Hợp Đồng bắt buộc phải được sử dụng.')
            //         return false;
            //     }
            // }
            // if (vueApp.$data.modal.dataModal.company_name === '') {
            //     vueApp.makeToast('danger', 'Tên công ty bắt buộc nhập.')
            //     return false;
            // }
            // if (vueApp.$data.modal.dataModal.worker_name === '') {
            //     vueApp.makeToast('danger', 'Tên nhân viên bắt buộc nhập.')
            //     return false;
            // }
            // return true;
        },
        checkActiveHD() {
            const arr = vueApp.$data.modal.dataModal.detail1;
            for (let i = 0; i < arr.length; i++) {
                const element = arr[i];
                if (element.active === true) {
                    return true;
                }
            }
            return false;
        },
        runAddData : () => {
            try {
                if (vueApp.beforeCheck()) {
                    const row = vueApp.formatData(vueApp.$data.modal.dataModal);
                    vueApp.insertData(row, 'employee');
                    vueApp.onSearch();
                    vueApp.$data.modal.showModal = false;
                    vueApp.makeToast('success', 'Thành công.');
                }
            } catch (error) {
                console.log(error);
            }
        },
        initData() {
            return {
                detail1         : [vueApp.initDetail1('LGW')],
                detail2         : [],
                company_name    : 0,
                company_id      : 0,
                worker_name     : '',
                sex              : 'nam',
                chuc_danh        : 'Nhân viên',
                ngay_sinh        : '',
                nguyen_quan      : '',
                trinh_do         : '',
                dc_thuong_tru    : '',
                dc_hien_tai      : '',
                cmnd             : '',
                ngay_cap         : '',
                noi_cap          : '',
                mst              : '',
                chi_cuc_thue     : '',
                so_bhxh          : '',
                the_bhyt         : '',
                benh_vien        : '',
                so_tai_khoan     : '',
                ngan_hang        : '',
                sdt_cong_ty      : '',
                sdt_ca_nhan      : '',
                so_may_nhanh     : '',
                email_cong_ty    : '',
                email_ca_nhan    : '',
                skype            : '',
                ten_cong_ty      : '',
                status           : '',
                noi_lam_viec     : 'van_phong'
            };
        },
        changeActive(row, index) {
            setTimeout(() => {
                if (row.active === true) {
                    const arr = vueApp.$data.modal.dataModal.detail1;
                    for (let i = 0; i < arr.length; i++) {
                        if (i === index) {
                            continue;
                        }
                        arr[i].active = false;
                    }
                }
            }, 300);
        },
        sortListHD() {
            const compare =function ( a, b ) {
                if ( a.active > b.active ){
                    return -1;
                }
                if ( a.active < b.active ){
                    return 1;
                }
                return 0;
            };
              
            vueApp.$data.modal.dataModal.detail1.sort(compare);
        },
        initDetail1(company_name) {
            return {
                active          : false,
                type            : 0,
                soHD            : vueApp.initSoHD(company_name),
                luong           : 0,
                day_from        : '',
                day_to          : '',
                pc_xang_xe      : 0,
                pc_dien_thoai   : 0,
                tinh_thang_hdld : '12 thang',
                ghi_chu         : 'LOGI-068',
                show_details    : '',
                filesInfo       : []
            };
        },
        initDetail2() {
            return {
                active              : true,
                name                : '',
                cmnd                : '',
                mst                 : '',
                month_from          : '',
                month_to            : '',
                ngay_sinh           : '',
                quoc_tich           : '',
                quan_he             : '',
                so                  : '',
                quyen               : '',
                quoc_gia            : '',
                tinh_thanh_pho      : '',
                quan_huyen          : '',
                phuong_xa           : '',
                note                : '',
                filesInfo           : [],
                show_details        : ''
            };
        },
        getOptions : (type) => {
            return this.categories[type];
        },
        runDeleteHopDong : (event, index) => {
            // debugger;
            let result = confirm("Want to delete?");
            if (result) {
                //Logic to delete the item
                vueApp.modal.dataModal.detail1.splice(index, 1);
            }
        },
        addData: () => {
            const conf = vueApp.initData();
            conf.title = "Thêm Nhân Sự";
            conf.action = "add";
            vueApp.$data.modal.dataModal = conf;
            vueApp.$data.modal.showModal = true;

        },
        removeRow(index) {
            vueApp.$data.modal.dataModal.detail1.slice(index, 1);
        },
        addRow : () => {
            vueApp.$data.modal.dataModal.detail1.push(vueApp.initDetail1(vueApp.$data.modal.dataModal.company_name));
        },
        addRowNguoiPhuThuoc : () => {
            vueApp.$data.modal.dataModal.detail2.push(vueApp.initDetail2());
        },
        editData: (row, index) => {
            const {uuid} = row;
            vueApp.selectDataUUID(uuid, 'employee', function(err, result) {
                if (err) {
                    vueApp.makeToast('error', `Đã có lỗi xảy ra ${err}`);
                    return;
                }
                console.log(result);
                const conf = {...vueApp.initData(), ...result};
                conf.title = "Sửa Nhân Sự";
                conf.action = "edit";
                vueApp.$data.modal.dataModal = conf;
                vueApp.$data.modal.index = index;
                vueApp.sortListHD();
                vueApp.$data.modal.showModal = true; 
            });
            
        },
        duplicateData(row, index) {
            const conf = {...vueApp.initData(), ...row};
            conf.title = "Thêm Nhân Sự";
            conf.action = "duplicate";
            conf.detail1 = [];
            vueApp.$data.modal.dataModal = conf;
            vueApp.$data.modal.index = index;
            vueApp.sortListHD();
            vueApp.$data.modal.showModal = true;
            console.log(vueApp.$data.modal.index);
        },
        deleteData(dataRow, index) {
            let result = confirm('Bạn có chắc muốn xóa?');
            if (result === true) {
                this.deleteRowByUUID(dataRow, 'employee');
                vueApp.$data.configs.rows.splice(index, 1);
            }
        },
    };

    vueApp = new Vue({
        // components:{Multiselect:window.VueMultiselect.default},
        components:{
            // menuPage : 'menu-page'
        },
        el:'#vueel',
        data:{
            forms:{
                isLoading: false,
                loadingMsg: ''
            },
            categories : window.categories,
            configs: {
                total_luong : 0,
                columns: [
                    {
                        label: 'Tên Công Ty',
                        field: 'company_name',
                    },
                    {
                        label: 'Họ Tên Nhân Viên',
                        field: 'worker_name',
                    },
                    {
                        label: 'Email Công Ty',
                        field: 'email_cong_ty'
                    },
                    {
                        label: 'Trạng Thái',
                        field: 'status'
                    },
                    {
                        label: 'Thời Gian',
                        field: 'time'
                    },
                    {
                        label: 'Số Người Phụ Thuộc',
                        field: 'sNpT'
                    },
                    {
                        label: 'Action',
                        field: 'Edit'
                    }
                ],
                rows2   : [],
                rows    : [],
                fieldsNguoiPhuThuoc : [
                    {
                        key: 'active',
                        label: 'Active'
                    },
                    {
                        key: 'name',
                        label: 'Tên Người phụ thuộc'
                    },
                    {
                        key: 'ngay_sinh',
                        label: 'Ngày Sinh'
                    },
                    {
                        key: 'mst',
                        label: 'Mã Số Thuế'
                    },
                    {
                        key: 'quoc_tich',
                        label: 'Quốc Tịch'
                    },
                    {
                        key: 'cmnd',
                        label: 'CMND'
                    },
                    {
                        key: 'quan_he',
                        label: 'Quan Hệ'
                    },
                    {
                        key: 'note',
                        label: 'Ghi Chú'
                    },
                    {
                        key: 'month_from',
                        label: 'Tháng Từ'
                    },
                    {
                        key: 'show_details',
                        label: 'Actions'
                    }
                ],
                fieldsHD: [
                    {
                        key: 'active',
                        label: 'Active'
                    },
                    {
                        key: 'type',
                        label: 'Loại Hợp Đồng'
                    },
                    {
                        key: 'soHD',
                        label: 'Số Hợp Đồng'
                    },
                    {
                        key: 'day_from',
                        label: 'Ngày Từ'
                    },
                    {
                        key: 'day_to',
                        label: 'Ngày Đến'
                    },
                    {
                        key: 'luong',
                        label: 'Mức Lương'
                    },
                    {
                        key: 'actions',
                        label: 'Actions'
                    }
                ],
                viewer : null,
                configInfo: {team:[]},
                configInfoTeam: '',
                configInfoFolder: '',
                configInfoFolderDisable: false,
                configInfoSubFolder:''
            },
            modal: {
                countDown:0,
                alertText:'',
                variant:'danger',
                showModal:false,
                dataModal:{},
                saveCurrentPage : []
            },
            search : {
                company_name    : '',
                day_from        : '',
                day_to          : '',
                status_name     : [14, 16]
            }
        },
        mounted () {
            setTimeout(() => {
                vueApp.onSearch();
            }, 300);
        },
        methods:methods
    });

    // helper function to easily add alerts
    let alertVue;
    alertVue = new Vue({
        el:'#alertHolder',
        data:{alertText:'',type:'danger',showAlert:false,countDown:0,totalCountDown:8}
    });

    function addAlert(alertType, alertText, totalCountDown) {
        alertVue.$data.alertText = alertText;
        alertVue.$data.type = alertType + ' text-center';
        alertVue.$data.countDown = totalCountDown || alertVue.$data.totalCountDown;
    }
})();
