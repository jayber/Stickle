angular.module('stickle', ['ionic', 'ngResource', 'ngWebsocket'])
    .controller('stickleCtrl', function ($scope, $ionicPopup, $timeout, $resource, $websocket, $interval) {
        try {
            $scope.contacts = [{
                displayName: "test",
                stickler: false,
                phoneNumbers: [{type: "mobile", value: "07791879023"}]
            }, {
                displayName: "test2",
                stickler: true,
                phoneNumbers: [{type: "mobile", value: "08991872567"}, {type: "home", value: "02035678906"}]
            }];
            // $scope.contacts = [];
            ionic.Platform.ready(function () {

                try { //'cos errors in browser, but rest still works
                    contactsProcessor.populateContacts($scope, $resource);
                } catch (err) {
                    log.error("Error",err);
                }

                try {
                    userHandler.logon($ionicPopup, $timeout, $resource);
                    context.startCheckingMessages($scope, $websocket, $interval, $timeout);
                } catch (err) {
                    log.error("Error",err);
                }
            });

            $scope.onToggle = function (contact) {
                userHandler.stickle(contact, $resource);
            };

            $scope.promptPhone = function () {
                var promise = userHandler.promptPhone($ionicPopup,
                    userHandler.phoneNumber,
                    false,
                    function (input) {
                    try {
                        log.debug("Input: "+input);
                        userHandler.registerOnServer($resource);
                    } catch (err) {
                        log.error("Error",err);
                    }
                });
            }
        } catch (err) {
            log.error("Error",err);
        }
    });

var userHandler = {

    phoneNumberRegisteredKey: "registered",
    userIdKey: "userId",
    phoneNumberRegistered: false,
    phoneNumberKey: "phonenumber",
    validationMessage: "<span class='validationMessagePrompt'>enter valid phone number</span>",

    stickle: function (contact, $resource) {

        var Stickle = $resource('http://:server/api/user/:phoneNum/stickle/:stickleNum', {
            server: context.serverUrl,
            phoneNum: "@phoneNum",
            stickleNum: "@stickleNum"
        });
        Stickle.save({phoneNum: userHandler.phoneNumber, stickleNum: contact.phoneNumbers[0].value}, {status: contact.stickled?"open":"closed"}, function (res) {
            log.debug("stickled " + res.status);
        }, context.errorReportFunc);
    },

    promptPhone: function ($ionicPopup, defaultVal, inValid, registerCallback) {
        return $ionicPopup.prompt({
            title: 'Phone Number',
            inputType: 'tel',
            inputPlaceholder: 'enter mobile phone number',
            defaultText: defaultVal,
            subTitle: inValid ? userHandler.validationMessage : null,
            maxLength: 12
        }).then(function (input) {
            if (input !== undefined) {
                if (input.length < 4) {
                    userHandler.promptPhone($ionicPopup, input, true);
                } else {
                    if (input !== userHandler.phoneNumber) {
                        userHandler.phoneNumber = input;
                        window.localStorage.setItem(userHandler.phoneNumberKey, input);
                        window.localStorage.setItem(userHandler.phoneNumberRegisteredKey, "false");
                        if (registerCallback !== undefined) {
                            registerCallback(input);
                        }
                    }
                }
            } else if (defaultVal === "") {
                userHandler.promptPhone($ionicPopup, "", true);
            }
        });
    },

    logon: function ($ionicPopup, $timeout, $resource) {
        var promise = $timeout();
        userHandler.phoneNumber = window.localStorage.getItem(userHandler.phoneNumberKey);
        if (userHandler.phoneNumber == null || userHandler.phoneNumber.length < 4) {
            promise = this.promptPhone($ionicPopup, "", false);
        }

        userHandler.phoneNumberRegistered = window.localStorage.getItem(userHandler.phoneNumberRegisteredKey) == "true";
        if (!userHandler.phoneNumberRegistered) {
            promise.then(function () {
                try {
                    userHandler.registerOnServer($resource);
                } catch (err) {
                    log.error("Error",err);
                }
            });
        }
    },

    registerOnServer: function ($resource) {
        var User = $resource('http://:server/api/user/:phoneNum', {
            server: context.serverUrl,
            phoneNum: "@phoneNum"
        });
        log.debug("attempting to register");
        User.save({phoneNum: userHandler.phoneNumber}, function (res) {
            window.localStorage.setItem(userHandler.phoneNumberRegisteredKey, "true");
            window.localStorage.setItem(userHandler.userIdKey, res.userId);
            userHandler.phoneNumberRegistered = true;
            userHandler.userId = res;
            log.debug("registered!");
        }, context.errorReportFunc);
    }
};

var context = {
    serverUrl: "192.168.0.4",
    contactsElement: $('#contacts'),
    errorsElement: $('#errors'),
    ws: {},

    checkStatuses: function (model) {
        model.contacts.forEach(function (thing, index) {
            context.ws.$emit("checkContactStatus",{phoneNum:thing.phoneNumbers[0].value});
        });
    },

    startCheckingMessages: function (model, $websocket, $interval, $timeout) {
        context.ws = $websocket.$new({
            url: 'ws://'+context.serverUrl+"/api/ws",
            reconnect: true
        });

        var promise;
        context.ws.$on("$open",function () {
            $timeout(function() {context.checkStatuses(model)}, 2*1000);
            promise = $interval(function() {context.checkStatuses(model)}, 60*60*1000);
        });

        context.ws.$on("$close",function () {
            $interval.cancel(promise);
        });

        context.ws.$on("contactStatus", function (data) {
                if (data.status === "registered") {
                    model.$apply(function () {
                        try {
                        model.contactsMap[data.phoneNum].stickler = true;
                        } catch (err) {
                            log.error("Error", err);
                        }
                    });
                }

        });

    },

    errorReportFunc: function (err) {
        log.error("Error:" + err.status + " - " + err.statusText + "<br>" + err.data);
    },

    printOLD: function (error) {
        context.errorsElement.show();
        context.errorsElement.append("<div>" + error + "</div>");
    }
};