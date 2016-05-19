log.removeAllAppenders();
var appender = new log4javascript.InPageAppender("errors");
appender.setHeight("100px");
appender.setShowCommandLine(false);
log.addAppender(appender);
appender.addEventListener("load", function () {
    // Find appender's iframe element
    var iframes = document.getElementsByTagName("iframe");
    for (var i = 0, len = iframes.length; i < len; ++i) {
        if (iframes[i].id.indexOf("_InPageAppender_") > -1) {
            var iframeDoc = iframes[i].contentDocument || iframes[i].contentWindow.document;
            iframeDoc.getElementById("switchesContainer").style.display = "none";
            iframeDoc.getElementById("commandLine").style.display = "none";
        }
    }
});

document.addEventListener("touchstart", function () {
}, true);

contactsDeferred = jQuery.Deferred();

angular.module('stickle', ['ionic', 'ngResource', 'ngWebsocket', 'ngAnimate'])
    .controller('stickleCtrl', function ($scope, $ionicPopup, $timeout, $resource, $websocket, $interval, $ionicSideMenuDelegate) {
        try {
            ionic.Platform.ready(function () {
                try {
                    polyFillMobileAPIs();
                    contactsHandler.populateContacts($scope, $resource);
                    context.checkDetails($scope, $ionicSideMenuDelegate);
                    contactsDeferred.done(function() {
                        context.startSockets($scope, $websocket, $interval, $timeout);
                    });
                } catch (err) {
                    log.error("Error", err);
                }
            });

            $scope.details = {
                displayName: window.localStorage.getItem(userHandler.displayNameKey),
                phoneNumber: window.localStorage.getItem(userHandler.phoneNumberKey)
            };

            $scope.validateAndRegister = function (form) {
                context.validateAndRegister(form, $ionicSideMenuDelegate, $scope, $resource);
            };

            $scope.acceptStickle = context.stickleResponseHandler("accepted");

            $scope.unAcceptStickle = context.stickleResponseHandler("un-accepted");

            $scope.rejectStickle = function (contact) {
                context.stickleResponseHandler("rejected")(contact);
                delete $scope.stickles[contact.phoneNumbers[0].value];
                contact.hidden = false;
            };

            $scope.onToggle = context.stickleHandler;

            document.addEventListener("resume", function () {
                log.debug("resuming");
                context.ws.$open();
            }, false);

            document.addEventListener("pause", function () {
                log.debug("paused");
                context.unbindSockets($interval);
            }, false);

        } catch (err) {
            log.error("Error", err);
        }
    });

var context = {
    serverUrl: "192.168.0.3",

    checkDetails: function ($scope, $ionicSideMenuDelegate) {
        const userId = window.localStorage.getItem(userHandler.userIdKey);
        if ((userId === null) || userId === "") {
            $scope.generalError = "Enter your name and telephone number to get started";
            $ionicSideMenuDelegate.toggleLeft(true);
        }
    },

    validateAndRegister: function (form, $ionicSideMenuDelegate, $scope, $resource) {
        log.debug("validateAndRegister");
        $scope.generalError = null;
        if (form.$valid) {
            log.debug("valid");
            window.localStorage.setItem(userHandler.displayNameKey, $scope.details.displayName);
            window.localStorage.setItem(userHandler.phoneNumberKey, $scope.details.phoneNumber);

            var promise = userHandler.registerOnServer($resource, $scope.details.phoneNumber, $scope.details.displayName);

            promise.then(function () {
                $ionicSideMenuDelegate.toggleLeft(false);
                context.ws.$close();
                context.ws.$open();
            }, function (result) {
                $scope.generalError = result.data;
            });
        }
        if (form.$invalid) {
            log.debug("invalid");
            $ionicSideMenuDelegate.toggleLeft(true);
        }
    },

    stickleResponseHandler: function (status) {
        return function (contact) {
            log.debug(status + ": " + contact.displayName + " - " + contact.phoneNumbers[0].value);
            context.ws.$emit("stickle-response", {
                origin: contact.phoneNumbers[0].value,
                status: status
            });
            contact.stickleStatus = status;
        }
    },

    stickleHandler: function (contact) {
        log.debug("stickling: " + contact.displayName + "; stickled: " + contact.stickled);
        context.ws.$emit("stickle", {
            to: contact.phoneNumbers[0].value,
            status: contact.stickled ? "open" : "closed"
        });
        contact.accepted = false;
    },

    checkStatuses: function (model) {
        model.contacts.forEach(function (contact, index) {
            context.ws.$emit("checkContactStatus", {phoneNum: contact.phoneNumbers[0].value});
        });
    },

    authenticate: function () {
        if (context.ws.$ready()) {
            log.debug("authenticating");
            context.ws.$emit("authenticate", {userId: window.localStorage.getItem(userHandler.userIdKey)});
        }
    },

    unbindSockets: function ($interval) {
        context.ws.$close();
        $interval.cancel(context.checkStatusPromise);
    },

    createNewStickle: function (contact, data, model) {
        if (contact == null) {
            contact = {
                phoneNumbers: [{type: "mobile", value: data.from}],
                displayName: data.displayName
            }
        } else {
            contact.hidden = true;
        }
        contact.stickleStatus = data.status;
        model.stickles[data.from] = contact;
    },

    startSockets: function (model, $websocket, $interval, $timeout) {
        const url = 'ws://' + context.serverUrl + "/api/ws";

        context.ws = $websocket.$new({
            url: url
        });

        context.ws.$on("$open", function () {
            context.checkStatusPromise = $interval(function () {
                context.checkStatuses(model)
            }, 60 * 60 * 1000);
        });

        context.ws.$on("$open", function () {
            context.authenticate();
        });

        context.ws.$on("authenticated", function () {
            log.debug("authenticated");

            if (!context.socketBound) {
                log.debug("binding to socket");

                $timeout(function () {
                    context.checkStatuses(model)
                }, 2000);


                context.ws.$on("stickled", function (data) {
                    log.debug("stickled: " + JSON.stringify(data));
                    model.$apply(function () {
                        var contact = model.contactsMap[data.from];
                        if (data.status === "open") {
                            contact = context.createNewStickle(contact, data, model);
                        } else if (data.status === "accepted") {
                            contact.accepted = true;
                        } else if (data.status === "un-accepted") {
                            contact.accepted = false;
                        } else if (data.status === "rejected") {
                            contact.accepted = false;
                            contact.stickled = false;
                        } else {
                            delete model.stickles[data.from];
                            contact.hidden = false;
                        }
                    });
                });

                context.ws.$on("contactStatus", function (data) {
                    log.trace("check status: " + data.status);
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

                context.ws.$on("state", function (data) {
                    log.debug("state: " + data.state + ", originator: " + data.originator + ", recipient: " + data.recipient + ", created: " + data.createdDate + ", name: " + data.originatorDisplayName);
                    model.$apply(function () {
                        try {
                            if (data.originator === window.localStorage.getItem(userHandler.phoneNumberKey)) {
                                var contact = model.contactsMap[data.recipient];
                                contact.stickled = true;
                                if (data.state === "accepted") {
                                    contact.accepted = true;
                                }
                            } else {
                                var contact = model.contactsMap[data.originator];
                                context.createNewStickle(contact,{from: data.originator, displayName: data.originatorDisplayName, status: data.state},model)
                            }
                        } catch (err) {
                            log.error("Error", err);
                        }

                    });
                });
                context.socketBound = true;
            }
        });

    },

    errorReportFunc: function (err) {
        log.error("Error:" + err.status + " - " + err.statusText + "; " + err.data);
    }
};