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
(()=>{
    // eslint-disable-next-line no-undef
    let vueApp;
    const methods = {
        clickDownloadReports : function() {
            const monthly = vueApp.$data.search.monthly;                
            var link = document.createElement("a");
            link.download = `${monthly}.json`;
            link.href = `/salary/downloadReports/${monthly}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            delete link;
        },
        clickEdit :function (uuid) {
            const rows = vueApp.$data.configs.rows3;
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                if (row.uuid === uuid) {
                    console.log(row);
                    
                    vueApp.$data.modal2.dataModal = row;
                    vueApp.$data.modal2.showModal = true;
                    break;
                }
            }
        },
        clickDelete :function (uuid) {
            const result = confirm('Are you sure ?');
            console.log(result);
            if (result) {
                $.ajax({
                    url     : `/salary/deleteSalary`,
                    method  : 'POST',
                    data    : {
                        uuid : uuid
                    },
                    success:function(data,status,req){
                        if(data.error) {
                            vueApp.makeToast('danger','<b>can\'t edit:</b>' + data.error);
                            return;
                        }
                        console.log(data);
                        vueApp.onSearch();
                    }
                });
            }
        },
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
        buildUpload_2(files, index, typeDetail) {
            if (files && files.length > 0) {
                const file = files[0];
                if (!vueApp.checkFileExtension(file.name)) {
                    vueApp.makeToast('danger', `file is invalid`);
                    return;
                }
                const formData = new FormData();
                formData.append("file", files[0], files[0].name);
                formData.append('action', 'add');
                formData.append('action_id', 'file');
                vueApp.runUpload(event, formData, {}, function (data) {
                    console.log(data);
                    if (data.status === "finish" && Array.isArray(data.result) && data.result.length > 0) {
                        console.log(data.result);
                        const uuid = data.result[0].uuid;
                        vueApp.modal.dataModal.subDetail.push(uuid);
                    } else {
                        vueApp.makeToast('danger', `error`);
                    }
                });
            }
        },
        buildUpload (files, index, typeDetail) {
            if (files && files.length > 0) {
                const file = files[0];
                if (!vueApp.checkFileExtension(file.name)) {
                    vueApp.makeToast('danger', `file is invalid`);
                    return;
                }
                vueApp.modal.showModal = false;
                const formData = new FormData();
                formData.append("file", files[0], files[0].name);
                formData.append('action', 'add');
                formData.append('action_id', 'file');
                vueApp.runUpload(event, formData, {}, function (data) {
                    console.log(data);
                    if (data.status === "finish" && Array.isArray(data.result) && data.result.length > 0) {
                        console.log(data.result);
                        const name = data.result[0].name;
                        const user = vueApp.findUserByName(name);
                        if (user) {
                            vueApp.modal.dataModal.title = "kiểm tra dữ liệu";
                            vueApp.modal.dataModal = {
                                ...data.result[0],
                                password : user.ngay_sinh,
                                email : user.email_ca_nhan,
                                uuid_worker : user.uuid,
                                subDetail : []
                            };
                            vueApp.modal.showModal = true;
                        } else {
                            vueApp.makeToast('danger', `error ! find not found worker ${name}`);    
                        }
                        
                    } else {
                        vueApp.makeToast('danger', `error`);
                    }
                });
            }
        },
        runSendEmail() {
            const formData = vueApp.$data.modal.dataModal;
            vueApp.modal.showModal = false;

            $.ajax({
                url: `/salary/sendEmailSalary?bodyData=${JSON.stringify(formData)}`,
                method: 'POST',
                async: true,
                cache: false,
                contentType: false,
                processData: false,
                timeout: 60000,
                success:function(data,status,req){
                    if (data.status === "finish" && data.result) {
                        console.log(data.result);
                        vueApp.makeToast('success', `success`);
                    } else {
                        vueApp.makeToast('danger', `error`);
                    }
                },
                error:function(data) {
                    console.log(data);
                }
            });
        },
        updateViewer() {
            setTimeout(() => {
                if (vueApp.$data.configs.viewer) {
                    vueApp.$data.configs.viewer.destroy();
                }
                vueApp.$data.configs.viewer = new Viewer(document.getElementById('images_document'), {});
            }, 100);
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
                url: `/uploadfileSaraly?${url.join('&')}`,
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
            let images = ['png', 'ai', 'bmp', 'gif', 'ico', 'jpeg', 'jpg', 'ps', 'psd', 'svg', 'tif', 'tiff'];
            let files = ['xls', 'xlsx', 'doc', 'zip', 'ppt', 'pptx', 'txt', 'pdf'];
            let ext = vueApp.getFileExtension(filename).toLocaleLowerCase();
            return (images.includes(ext) || files.includes(ext)) ;
        },
        findUserByName : function (name) {
            const table = vueApp.$data.configs.rows;
            name = name.replace(/[ ]/g,'');
            name = name.toLocaleLowerCase();
            for (let i = 0; i < table.length; i++) {
                const row = table[i];
                if (row.worker_name) {
                    let workerName = row.worker_name.replace(/[ ]/g,'');
                    workerName = workerName.toLocaleLowerCase();
                    console.log(i);
                    console.log(workerName);
                    console.log(name);
                    if (workerName === name) {
                        return row;
                    }
                }
                
            }

            return null;
        },
        getFileExtension : function(filename) {
            let ext = /^.+\.([^.]+)$/.exec(filename);
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
        clickSearch : () => {
            
            vueApp.onSearchMonth();
            vueApp.onSearch();
            
        },
        runUpdate : () => {
            $.ajax({
                url: `/salary/updateSalary`,
                method: 'POST',
                data : vueApp.$data.modal2.dataModal,
                success:function(data,status,req){
                    if(data.error) {
                        vueApp.makeToast('danger','<b>can\'t edit:</b>' + data.error);
                        return;
                    }
                    console.log(data);
                    vueApp.modal2.showModal = false;
                    vueApp.onSearch();
                }
            });
        },
        onSearchMonth : (callback)=> {
            $.ajax({
                url: `/salary/getDataSalaryMonth`,
                method: 'GET',
                success:function(data,status,req){
                    if(data.error) {
                        vueApp.makeToast('danger','<b>can\'t edit:</b>' + data.error);
                        return;
                    }

                    const options = [];
                    for (let i = 0; i < data.result.length; i++) {
                        const element = data.result[i];
                        const value = element.replace('.json','');
                        options.push({value: value, text : value});
                    }
                    vueApp.$data.search.arrMonthly = options;

                    if (typeof callback === 'function') {
                        callback();
                    }
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
                        callback(null, data.result)
                    } else {
                        callback(data)
                    }
                },
                error:function(error) {
                    callback(error)
                }
            });
        },
        loadData : () => {
            vueApp.selectData({}, 'employee', function (err, result) {
                
                vueApp.$data.configs.rows = result;
                console.log(vueApp.$data.configs.rows);
            });
        },
        onSearch : () => {
            if (vueApp.$data.search.monthly) {
                const monthly = vueApp.$data.search.monthly;
                $.ajax({
                    url: `/salary/getDataSalary/${monthly}`,
                    method: 'GET',
                    success:function(data,status,req){
                        if(data.error) {
                            vueApp.makeToast('danger','<b>can\'t edit:</b>' + data.error);
                            return;
                        }
                        vueApp.$data.configs.rows3 = data.result;
                    }
                });
            }
        },
        formatLocalData : (datetime) => {
            const tmp = new Date(datetime);
            var d = tmp.getDate();
            var m = tmp.getMonth() + 1; //Month from 0 to 11
            var y = tmp.getFullYear();
            return '' + y + '-' + (m<=9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);
        },
        makeToast(variant = null, msg) {
            let title = 'Thông báo';
            
            if (variant === 'danger') {
                title = 'Thông báo lỗi !';
            }

            if (variant === 'warning') {
                title = 'Cảnh báo !';
            }
            vueApp.modal.countDown = 2;
            vueApp.modal.variant = variant;
            vueApp.modal.alertText = title + msg;
        },
        runCancel : () => {
            vueApp.$data.modal.showModal = false;
        },
        runCancel2 : () => {
            vueApp.$data.modal2.showModal = false;
        },
        getYYYYmm() {
            const date = new Date();
            var d = date.getDate();
            var m = date.getMonth() + 1; //Month from 0 to 11
            var y = date.getFullYear();
            return '' + y + (m<=9 ? '0' + m : m);
        },
        runCreate () {
            const formData = vueApp.$data.modal.dataModal;

            $.ajax({
                url: `/createFile?bodyData=${JSON.stringify(formData)}`,
                method: 'POST',
                async: true,
                cache: false,
                contentType: false,
                processData: false,
                timeout: 60000,
                success:function(data,status,req){
                    if (data.status === "finish" && data.result) {
                        console.log(data.result);
                        vueApp.downloadFile(data.result);
                        
                    } else {
                        vueApp.makeToast('danger', `error`);
                    }
                },
                error:function(data) {
                    console.log(data);
                }
            });
            vueApp.$data.modal.showModal = false;
        },
    };
    setTimeout(() => {
        vueApp = new Vue({
            components:{
            },
            el:'#vueel',
            data:{
                forms:{
                    isLoading: false,
                    loadingMsg: ''
                },
                configs: {
                    total_luong : 0,
                    rows2 : [],
                    rows3 : [],
                    columns3 : [
                        {
                            label: 'Họ Tên Nhân Viên',
                            field: 'name',
                        },
                        {
                            label: 'Tháng Năm',
                            field: 'monthly'
                        },
                        {
                            label: 'Email',
                            field: 'email'
                        },
                        {
                            label: 'Trạng Thái',
                            field: 'status_name'
                        },
                        {
                            label: 'Ý kiến',
                            field: 'comment'
                        },
                        {
                            label: 'Thời Gian',
                            field: 'updated_at'
                        },
                        {
                            label: 'action',
                            field: 'action'
                        }
                    ],
                    rows: [],
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
                    dataModal:{
                        subDetail : []
                    },
                    saveCurrentPage : []
                },
                modal2: {
                    countDown:0,
                    alertText:'',
                    variant:'danger',
                    showModal:false,
                    dataModal:{},
                    saveCurrentPage : []
                },
                search : {
                    monthly     : '',
                    arrMonthly  : []
                }
            },
            created () {
                setTimeout(() => {
                    vueApp.onSearchMonth(); 
                    vueApp.loadData(); 
                }, 1000);
                setInterval(() => {
                    vueApp.onSearch();
                }, 1000 * 60 * 15);

               
            },
            methods:methods
        });
        
    }, 1000);

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
