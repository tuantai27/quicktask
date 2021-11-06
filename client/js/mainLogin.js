(()=>{
    let vueApp;
    const methods = {
        getText() {
            return 'Đăng Nhập';
        },
        actionLogin () {
            $.ajax({
                url: `/set_session`,
                method: 'POST',
                data : vueApp.$data,
                success:function(data,status,req){
                    if (data.status === "success") {
                        console.log(data);
                        setTimeout(() => {
                            window.location.href = './excel'; 
                        }, 500);

                    } else {
                        alert(`invalid.`);
                    }
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
                passWord    : '',
                userName    : ''
            },
            created : () => {
                
            },
            methods:methods
        });
        
    }, 1000);
})();
