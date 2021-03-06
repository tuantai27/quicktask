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
            <date-picker v-model="displayValue" :config="{format: 'DD-MM-YYYY'}"></date-picker>
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
                    console.log(err);
                }
                this.$emit('input', '');
            }
        }
    }
});
(()=>{
    // eslint-disable-next-line no-undef
    let vueApp;
    const methods = {
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
                    vueApp.$data.configs.rows = arr;
                    console.log(result);
                });
            }, 300);
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
                    const {detail} = row;
                    // debugger;
                    for (let y = 0; y < detail.length; y++) {
                        const {active, day_to, day_from} = detail[y];
                        if (active === true) {
                            row.time.day_to = day_to;
                            row.time.day_from = day_from;
                        }
                    }
                    vueApp.updateData(row, 'employee', function (err, res) {
                        vueApp.$data.modal.showModal = false;
                        if (err) {
                            vueApp.makeToast('error', 'Th???t b???i');
                        } else {
                            vueApp.makeToast('success', 'Th??nh c??ng.');
                        }
                        
                    });
                }
            } catch (error) {
                console.log(error);
            }
        },
        runDeleteDetail : (index) => {
            debugger;
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
                            vueApp.makeToast('success', 'Th??nh c??ng.');
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
            let title = 'Th??ng b??o';
            
            if (variant === 'danger') {
                title = 'Th??ng b??o l???i !';
            }

            if (variant === 'warning') {
                title = 'C???nh b??o !';
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
                for (let i = 0; i < temp.detail.length; i++) {
                    const element = temp.detail[i];
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
            if (typeof date === 'string' && this.stringToDate(date, 'yyyy-mm-dd', '-')) {
                const dateParts = date.split("-");
                temp = new Date(+dateParts[0], dateParts[1] - 1, +dateParts[2]); 
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
                    const detail = row.detail;
                    if (Array.isArray(detail) ) {
                        for (let index = 0; index < detail.length; index++) {
                            const element = detail[index];
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
        getYYYYmm() {
            const date = new Date();
            const m = date.getMonth() + 1; //Month from 0 to 11
            const y = date.getFullYear();
            return '' + y + (m <= 9 ? '0' + m : m);
        },
        beforeCheck() {
            return true;

        },
        runAddData : () => {
            try {
                if (vueApp.beforeCheck()) {
                    const row = vueApp.formatData(vueApp.$data.modal.dataModal);
                    vueApp.insertData(row, 'employee');
                    vueApp.onSearch();
                    vueApp.$data.modal.showModal = false;
                    vueApp.makeToast('success', 'Th??nh c??ng.');
                }
            } catch (error) {
                console.log(error);
            }
        },
        initData() {
            return {
                detail          : [vueApp.initdetail()],
                code            : '',
                name            : '',
                meta_data       : '{}'
            };
        },
        initdetail() {
            return {
                id      : '',
                value   : '',
                name    : ''
            };
        },
        getOptions : (type) => {
            return this.categories[type];
        },
        addData: () => {
            const conf = vueApp.initData();
            conf.title = "Th??m Category";
            conf.action = "add";
            vueApp.$data.modal.dataModal = conf;
            vueApp.$data.modal.showModal = true;

        },
        removeRow(index) {
            vueApp.$data.modal.dataModal.detail.slice(index, 1);
        },
        addRow : () => {
            vueApp.$data.modal.dataModal.detail.push(vueApp.initdetail());
        },
        editData: (row, index) => {
            const {uuid} = row;
            vueApp.selectDataUUID(uuid, 'employee', function(err, result) {
                if (err) {
                    vueApp.makeToast('error', `???? c?? l???i x???y ra ${err}`);
                    return;
                }
                console.log(result);
                const conf = {...vueApp.initData(), ...result};
                conf.title = "S???a Nh??n S???";
                conf.action = "edit";
                vueApp.$data.modal.dataModal = conf;
                vueApp.$data.modal.index = index;
                vueApp.$data.modal.showModal = true; 
            });
            
        },
        duplicateData(row, index) {
            const conf = {...vueApp.initData(), ...row};
            conf.title = "Th??m Nh??n S???";
            conf.action = "duplicate";
            conf.detail = [];
            vueApp.$data.modal.dataModal = conf;
            vueApp.$data.modal.index = index;
            vueApp.$data.modal.showModal = true;
            console.log(vueApp.$data.modal.index);
        },
        deleteData(dataRow, index) {
            let result = confirm('B???n c?? ch???c mu???n x??a?');
            if (result === true) {
                this.deleteRowByUUID(dataRow, 'employee');
                vueApp.$data.configs.rows.splice(index, 1);
            }
        },
    };

    vueApp = new Vue({
        components:{
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
                        label: 'ID',
                        field: 'id',
                    },
                    {
                        label: 'Categrogy Code',
                        field: 'code',
                    },
                    {
                        label: 'Category Name',
                        field: 'name',
                    },
                    {
                        label: 'Updated By',
                        field: 'updated_by'
                    },
                    {
                        label: 'Update At',
                        field: 'updated_at'
                    },
                    {
                        label: 'Action',
                        field: 'Edit'
                    }
                ],
                rows    : [],
                fieldsDetail : [
                    {
                        key: 'Value',
                        label: 'Value'
                    },
                    {
                        key: 'Name',
                        label: 'Name'
                    },
                    {
                        key: 'actions',
                        label: 'Actions'
                    }
                ]
            },
            modal: {
                countDown:0,
                alertText:'',
                variant:'danger',
                showModal:false,
                dataModal:{},
                saveCurrentPage : []
            }
        },
        mounted () {
            
        },
        methods:methods
    });
})();
