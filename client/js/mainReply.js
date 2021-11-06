(()=>{
    // eslint-disable-next-line no-undef
    let vueApp;
    const methods = {
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
        replyServer () {
            const arr = window.location.pathname.split('/');
            const monthly = arr[2];
            const uuid = arr[3];
            const formData = {
                comment : vueApp.$data.comment
            };

            $.ajax({
                url: `/replySalary/${monthly}/${uuid}?bodyData=${JSON.stringify(formData)}`,
                method: 'POST',
                contentType: false,
                success:function(data,status,req){
                    if (data.status === "finish" && data.result) {
                        console.log(data.result);
                        // vueApp.makeToast('danger', `error`);
                    } else {
                        // vueApp.makeToast('danger', `error`);
                    }
                    document.getElementById('thanks').style = 'display:block;';
    
                    vueApp.$data.flag = false;
                },
                error:function(data) {
                    console.log(data);
                }
            });
        }
    };
    setTimeout(() => {
        vueApp = new Vue({
            components:{
            },
            el:'#vueel',
            data:{
                flag    : true,
                comment : '',
                uuid : ''
            },
            created : () => {
                
            },
            methods:methods
        });
        
    }, 1000);

    // helper function to easily add alerts
    let alertVue;
    
})();
