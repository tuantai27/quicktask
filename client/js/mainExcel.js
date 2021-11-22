Vue.component('my-currency-input', {
    props: ["value","disabled","size"],
    template: `
        <div>
            <b-form-input type="text" :size="size" style="text-align:right;" v-model="displayValue" @blur="isInputActive = false" @focus="isInputActive = true" :disabled="disabled"/>
        </div>`,
    data: function() {
        return {
            isInputActive: false
        }
    },
    computed: {
        displayValue: {
            get: function() {
                try {
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
                    
                } catch (error) {
                    
                }
                return '';
            },
            set: function(modifiedValue) {
                try {
                    // Recalculate value after ignoring "$" and "," in user input
                    let newValue = parseFloat(modifiedValue.replace(/[^\d\.]/g, ""))
                    // Ensure that it is not NaN
                    if (isNaN(newValue)) {
                        newValue = 0
                    }
                    // Note: we cannot set this.value as it is a "prop". It needs to be passed to parent component
                    // $emit the event so that parent component gets it
                    this.$emit('input', newValue)
                    return;
                } catch (error) {
                    
                }
                this.$emit('input', 0);
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
        runDeleteItem(index) {
            vueApp.modal.dataModal.rows.splice(index, 1);
        },
        beforeAddItem() {
           vueApp.modal.dataModal.rows.push({
                    stt : vueApp.modal.dataModal.rows.length + 1,
                    ma_sp : "",
                    ten_sp : "",
                    dvt : "",
                    sl : "",
                    don_gia : 0,
                    thanh_tien : 0
                });
        },
        beforeAdd() {
            vueApp.modal.dataModal.title = "kiểm tra dữ liệu";
            vueApp.modal.dataModal = {
                rows : [{
                    stt : 1,
                    ma_sp : "",
                    ten_sp : "",
                    dvt : "",
                    sl : "",
                    don_gia : 0,
                    thanh_tien : 0
                }]
            };
            vueApp.modal.showModal = true;
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
                        vueApp.getDataFormByUUID(data.result[0]);
                    } else {
                        vueApp.makeToast('danger', `error`);
                    }
                });
            }
        },
        getDataFormByUUID(uuid) {
            $.ajax({
                url: `/excel/getDataFromUUID?uuid=${uuid}`,
                method: 'POST',
                async: true,
                cache: false,
                contentType: false,
                processData: false,
                timeout: 60000,
                success:function(data,status,req){
                    if (data.status === "finish" && data.result) {
                        console.log(data.result);
                        vueApp.modal.dataModal.title = "Kiểm Tra Dữ Liệu";
                        vueApp.modal.dataModal = data.result;
                        vueApp.modal.showModal = true;
                        
                    } else {
                        vueApp.makeToast('danger', `error`);
                    }
                },
                error:function(data) {
                    console.log(data);
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
            let images = ['png', 'ai', 'bmp', 'gif', 'ico', 'jpeg', 'jpg', 'ps', 'psd', 'svg', 'tif', 'tiff'];
            let files = ['xls', 'xlsx', 'doc', 'zip', 'ppt', 'pptx', 'txt', 'pdf'];
            let ext = vueApp.getFileExtension(filename).toLocaleLowerCase();
            return (images.includes(ext) || files.includes(ext)) ;
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
        dateToDMY(date) {
            if (vueApp.isDate(date) === false ) {
                return '';
            }
            const temp = new Date(date);
            var d = temp.getDate();
            var m = temp.getMonth() + 1; //Month from 0 to 11
            var y = temp.getFullYear();
            return '' + (d <= 9 ? '0' + d : d) + '-' + (m<=9 ? '0' + m : m) + '-' + y;
        },
        stringToDate(_date,_format,_delimiter){
            var formatLowerCase=_format.toLowerCase();
            var formatItems=formatLowerCase.split(_delimiter);
            var dateItems=_date.split(_delimiter);
            var monthIndex=formatItems.indexOf("mm");
            var dayIndex=formatItems.indexOf("dd");
            var yearIndex=formatItems.indexOf("yyyy");
            var month=parseInt(dateItems[monthIndex]);
            month-=1;
            var formatedDate = new Date(dateItems[yearIndex],month,dateItems[dayIndex]);
            return formatedDate;
        },
        runCancel : () => {
            vueApp.$data.modal.showModal = false;
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
            console.log(formData);
            vueApp.$data.modal.show = true; 
            $.ajax({
                url: `/excel/createFile?bodyData=${JSON.stringify(formData)}`,
                method: 'POST',
                async: true,
                cache: false,
                contentType: false,
                processData: false,
                timeout: 60000,
                success:function(data,status,req){
                    vueApp.$data.modal.show = false; 
                    if (data.status === "finish" && data.result) {
                        console.log(data.result);
                        vueApp.downloadFile(data.result);
                        
                    } else {
                        vueApp.makeToast('danger', `error`);
                    }
                },
                error:function(data) {
                    vueApp.$data.modal.show = false; 
                    console.log(data);
                }
            });
            vueApp.$data.modal.showModal = false;
        },
        downloadFile(arr) {
            for (let i = 0; i < arr.length; i++) {
                const file = arr[i];
                const url = `/excel/getFileById/${encodeURIComponent(file)}`;
                setTimeout(() => {
                    vueApp.download(url, file); 
                }, 500 * (i+1));
            }
        },
        download(uri, name) {
            var link = document.createElement("a");
            link.download = name;
            link.href = uri;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            delete link;
        },
    };
    setTimeout(() => {
        vueApp = new Vue({
            components:{},
            el:'#vueel',
            data:{
                modal: {
                    countDown:0,
                    alertText:'',
                    variant:'danger',
                    showModal:false,
                    show:false,
                    dataModal:{},
                    fields : [
                        {
                            key: 'stt',
                            label: 'Stt',
                            class: 'text-center'
                        },
                        {
                            key: 'ma_sp',
                            label: 'Mã',
                            class: 'text-center'
                        }
                        ,
                        {
                            key: 'ten_sp',
                            label: 'Tên',
                            class: 'text-center'
                        }
                        ,
                        {
                            key: 'dvt',
                            label: 'Đvt',
                            class: 'text-center'
                        }
                        ,
                        {
                            key: 'sl',
                            label: 'Số lượng',
                            class: 'text-center'
                        },
                        {
                            key: 'don_gia',
                            label: 'Đơn giá',
                            class: 'text-center'
                        },
                        {
                            key: 'thanh_tien',
                            label: 'Thành tiền',
                            class: 'text-center'
                        },
                        {
                            key: 'action',
                            label: 'Action',
                            class: 'text-center'
                        }
                    ],
                    saveCurrentPage : []
                }
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
