(()=>{
    let vueApp;
    let auth2 = null;
    function loadgapi(times) {
        console.log('abcd');
        if (typeof gapi !== 'undefined' && auth2 === null) {
            gapi.load('auth2', function() {
                try {
                    console.log('abcd 2');
                    gapi.auth2.init();
                    auth2 = gapi.auth2.getAuthInstance();
                } catch (error) {
                    console.log('error');
                    console.log(error);    
                }
            });
        } else if (times < 5) {
            times++;
            setTimeout(function(){
                loadgapi(times);
            }, 50);
        } else {
            console.error('gapi didn\'t load');
        }
    };
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
            mounted : () => {
                console.log('heelo');
                let count = 1;
                loadgapi(1);
    

            },
            methods:methods
        });
        
    }, 1000);
})();


window.onSignIn = (function(){
    /**
     * this closure handles all google related signing in and out
     * and finaly returns the function to authorize a sign in to global scope.
     */
    let auth2 = null;
    let m_google_user = null;
    function loadgapi(times) {
        console.log('abcd');
        if (typeof gapi !== 'undefined' && auth2 === null) {
            gapi.load('auth2', function() {
                gapi.auth2.init();
                auth2 = gapi.auth2.getAuthInstance();
            });
        } else if (times < 5) {
            times++;
            setTimeout(function(){
                loadgapi(times);
            },50);
        } else {
            console.error('gapi didn\'t load');
        }
    }
    $(document).ready(function(){
        $('#signout').click(function(e) {
            gapi.load('auth2', function() {
                gapi.auth2.init({
                    client_id: document.querySelector('meta[name="google-signin-client_id"]').getAttribute('content')
                }).then(function success() {
                    auth2 = gapi.auth2.getAuthInstance();
                    auth2.signOut().then(function(){
                        $.ajax({url: "/logout",success: function(){
                            window.location.href = "/logout";
                            m_google_user.disconnect();
                        }});
                    });
                }, function error () {
                    console.log(error);
                });
            });
        });
    });
    function onError(e) {
        auth2 = gapi.auth2.getAuthInstance();
        auth2.signOut().then(function(){
            console.log('oops!');
            console.error(e);
            try {
                const {responseJSON} = e;
                const {error} = responseJSON;
                if (error == 'error in login. Error error move concedo') {
                    window.location.href = "/admin";
                }
                
            } catch (error) {
                console.log(error);
            }
        });
    }
    function finishedJob(data,stat,e) {
        m_google_user.disconnect();
        if(data.error) {
            onError(data.error);
            main.addAlert("warning",data.error);
            if(data.action && data.action === 'signout') {
                auth2.signOut().then(function(){
                    console.log('signed out.');
                });
            }
        } else {
            console.log(data);
            if (data.status === 'success') {
                window.location.href = "/home";    
            } else {
                console.log('invaild_user');
            }

            
        }
    }
    return function(googleUser) {
        //let profile = googleUser.getBasicProfile();
        const authResp = googleUser.getAuthResponse();
        m_google_user = googleUser;
        console.log('running onSignIn');
        $.ajax({
            url:'/token',
            type : 'POST',
            data:{token:authResp.id_token},
            beforeSend:(e,settings)=>{console.log(e);},
            error:onError,
            success:finishedJob
        });
    };
})();