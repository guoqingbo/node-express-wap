$(function () {
    var submitFormDom = $('#submitForm');
    /**
     * 账号登录规则
     */
    var validator = submitFormDom.validate({
        rules: {
            loginName: {
                required: true,
                isMobile: true
            },
            loginPass: {
                required: true,
                rangelength: [6, 20]
            }
        }
    });

    var regValidator = $('#submitFormReg').validate({
        rules: {
            loginName: {
                required: true,
                isMobile: true
            },
            loginPass: {
                required: true,
                rangelength: [6, 20],
                regex: /^(?![\d]+$)(?![a-zA-Z]+$)(?![!#$%^&*]+$)[\da-zA-Z!#$%^&*]{6,20}$/
            },
            enterpassword: {
                equalTo: "#password"
            },
            checkCode: {
                required: true
            }
        }
    });

    var resetValidator = $('#submitFormRest').validate({
        rules: {
            password: {
                required: true,
                rangelength: [6, 20],
                regex: /^(?![\d]+$)(?![a-zA-Z]+$)(?![!#$%^&*]+$)[\da-zA-Z!#$%^&*]{6,20}$/
            },
            enterpassword: {
                equalTo: "#password"
            }
        }
    });

    var codeValid = $('#submitFormReg .input-box:eq(0), #submitForm .input-box:eq(0)').validate({
        rules: {
            loginName: {
                required: true,
                isMobile: true
            }
        }
    });

    /**
     * 快捷登录规则
     */
    var validator2 = submitFormDom.validate({
        rules: {
            mobile: {
                required: true,
                isMobile: true
            },
            checkCode: {
                required: true
            }
        }
    });


    /**
     * 切换登录方式
     * @type {*|jQuery|HTMLElement}
     */
    var loginList = $('.login-list');
    $('#login_type').find('span').on('click', function () {
        var $this = $(this), index = $this.data('index');
        $this.siblings().removeClass('on');
        $this.addClass('on');
        loginList.hide();
        loginList.eq(index).show();
    });

    /**
     * 用户协议选择
     * @type {*|jQuery|HTMLElement}
     */
    var checkedBtn = $('#checkedBtn');
    checkedBtn.unbind('click').click(function () {
        var icon = $(this).find('i'),
            checkBox = $(this).find('input');

        icon.hasClass('checked')
            ? icon.removeClass('checked')
            : icon.addClass('checked');


        checkBox.is(':checked')
            ? checkBox.prop('checked', false)
            : checkBox.prop('checked', true)

    });

    /**
     * 发送验证码
     */
    $('#getCodeBtn').on('click', function () {
        if (codeValid.form()) {
            var sendType = $(this).data('type');
            // 快捷登录or注册
            var mobile = $('#submitLogin').find('input[name=mobile]').val() || $('#submitFormReg').find('input[name=loginName]').val() || $('#submitForm').find('input[name=loginName]').val();

            $.post('/checkCode', {
                sendType: sendType,
                mobile: mobile
            }).success(function (data) {
                var datas = data[0];
                console.log(datas.checkCode);
                $('.tips p').text(datas.message);
                $('.mask,.tips').show();
            })
                .error(function (err) {
                    window.location.href = '/error';
                });
        }
    });

    /**
     * 注册
     */
    $('#registerBtn').on('click', function () {
        if (regValidator.form()) {
            if ($('#check').is(':checked')) {
                $.post('/signIn', $('#submitFormReg').serialize())
                    .success(function (data) {
                        console.log(data);
                        var datas = data[0];
                        if (datas.status === 200) {
                            window.location.href = '/member';
                        } else {
                            $('.tips p').text(datas.message);
                            $('.mask,.tips').show();
                        }
                    })
                    .error(function (err) {
                        window.location.href = '/error';
                    });
            } else {
                $('.tips p').text("请勾选注册协议");
                $('.mask,.tips').show();
            }
        }
    });

    /**
     * 账号登录
     */
    submitFormDom.submit(function () {
        var $this = $(this);
        var data = $(this).serialize();
        if (validator.form()) {
            var url = $this.data('url');
            $.post('/leaguerLogin', data)
                .success(function (data) {
                    var datas = data[0];
                    if (datas.status === 200) {
                        if (url) {
                            window.location.href = url;
                        } else {
                            window.location.href = '/';
                        }
                    } else {
                        new ErrLayer({
                            message: datas.message
                        });
                    }
                })
                .error(function (err) {
                    window.location.href = '/error';
                });
            return false;
        }
    });

    /**
     * 快捷登录
     */
    var submitLogin = $('#submitLogin');
    submitLogin.submit(function () {
        if (validator2.form()) {
            var $this = $(this);
            var loginData = submitLogin.serialize();
            var url = $this.data('url');
            $.post('/phoneNumberLogin', loginData)
                .success(function (res) {
                    var datas = res[0];
                    if (datas.status === 200) {
                        if (url) {
                            window.location.href = url;
                        } else {
                            window.location.href = '/';
                        }
                    } else {
                        new ErrLayer({
                            message: datas.message
                        });
                    }
                })
                .error(function (err) {
                    window.location.href = '/error';
                });
            return false;
        }
    });

    /**
     * 核对验证码
     */
    $('#checkCode').click(function () {
        var $this = $(this);
        if (validator.form()) {
            $.post('/checkPhoneCode', $('#submitForm').serialize())
                .success(function (data) {
                    var datas = data[0];
                    if (datas.status === 200) {
                        new ErrLayer({
                            message: datas.message?datas.message:"校验成功",
                            closeCallBack: function(){
                                window.location.href = '/resetPassword';
                            }
                        });

                    } else {
                        new ErrLayer({
                            message: datas.message
                        });
                    }
                })
                .error(function (err) {
                    window.location.href = '/error';
                });
        }
    });

    /**
     * 设置新密码
     */
    $('#setNewPassword').on('click', function () {
        if (resetValidator.form()) {
            $.post('/setNewPassword', $('#submitFormRest').serialize())
                .success(function (data) {
                    var datas = data[0];
                    if (datas.status === 200) {
                        new ErrLayer({
                            message: datas.message,
                            closeCallBack: function(){
                                window.location.href = '/login';
                            }
                        });
                    } else {
                        new ErrLayer({
                            message: datas.message
                        });
                    }
                })
                .error(function (err) {
                    window.location.href = '/error';
                });
        }
    })
});
