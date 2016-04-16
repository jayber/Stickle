
angular.module('stickle', ['ionic', 'ngResource'])
    .controller('stickleCtrl', function ($scope, $ionicPopup, $timeout, $resource) {
        try {
            $scope.contacts = [{displayName:"test",stickler:false, phoneNumbers:[{type:"mobile",value:"07791879023"}]},{displayName:"test2",stickler:true, phoneNumbers:[{type:"mobile",value:"07791879023"},{type:"home",value:"02035678906"}]}];
            ionic.Platform.ready(function () {
                try {
                    contactsProcessor.populateContacts($scope);
                    userHandler.logon($ionicPopup, $timeout, $resource);
                } catch (err) {
                    context.print(err);
                }

            });
            $scope.promptPhone = function () {
                userHandler.promptPhone($ionicPopup,
                    userHandler.phoneNumber,
                    false);
            }
        } catch (err) {
            context.print(err);
        }
    });

var userHandler = {

    phoneNumberKey: "phonenumber",
    validationMessage: "<span class='validationMessagePrompt'>enter valid phone number</span>",

    promptPhone: function ($ionicPopup, defaultVal, inValid) {
        return $ionicPopup.prompt({
            title: 'Phone Number',
            inputType: 'tel',
            inputPlaceholder: 'enter mobile phone number',
            defaultText: defaultVal,
            subTitle: inValid ? userHandler.validationMessage : null,
            maxLength: 12
        }).then(function (res) {
            if (res !== undefined) {
                if (res.length < 4) {
                    userHandler.promptPhone($ionicPopup, res, true);
                } else {
                    userHandler.phoneNumber = res;
                    window.localStorage.setItem(userHandler.phoneNumberKey, res);
                }
            } else if (defaultVal === "") {
                userHandler.promptPhone($ionicPopup, "", true);
            }
        });
    },

    logon: function ($ionicPopup, $timeout, $resource) {
        var promise = $timeout();
        userHandler.phoneNumber = window.localStorage.getItem(userHandler.phoneNumberKey);
        if (userHandler.phoneNumber == undefined || userHandler.phoneNumber.length < 4) {
            promise = this.promptPhone($ionicPopup, "", false);
        }
        promise.then(function () {
            try {
                // userHandler.registerOnServer($resource);
            } catch (err) {
                context.print(err);
            }
        });
    },

    registerOnServer: function ($resource) {
        var User = $resource('http://:server/user/:phoneNum', {server: context.serverUrl, phoneNum:userHandler.phoneNumber});
        User.save({phoneNum:userHandler.phoneNumber},function (res) {
            context.print("sent num: " + res);
        }, context.errorReportFunc);
    }
};

var context = {
    serverUrl: "192.168.0.3:3002",
    contactsElement: $('#contacts'),
    errorsElement: $('#errors'),

    errorReportFunc: function (err) {
        context.print(err);
    },

    print: function (error) {
        context.errorsElement.show();
        context.errorsElement.append(error);
    },

    hideContactsLoading: function () {
        // $('.loading').hide();
    }
};