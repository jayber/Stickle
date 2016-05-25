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

document.addEventListener("resume", function () {
    log.debug("resuming");
    socketHandler.ws.$open();
}, false);

document.addEventListener("pause", function () {
    log.debug("paused");
    socketHandler.unbindSockets($interval);
}, false);


angular.module('stickle', ['ionic', 'ngResource', 'ngWebsocket', 'ngAnimate'])
    .controller('stickleCtrl', function ($scope, $ionicPopup, $resource, $websocket, $interval, $ionicSideMenuDelegate) {
        try {
            ionic.Platform.ready(function () {
                try {
                    polyFillMobileAPIs();
                    var contactsDeferred = contactsHandler.populateContacts($scope, $resource);
                    context.checkDetails($scope, $ionicSideMenuDelegate);
                    contactsDeferred.done(function () {
                        socketHandler.startSockets($scope, $websocket, $interval);
                    });
                } catch (err) {
                    log.error("Error - ionic.Platform.ready", err);
                }
            });

            $scope.details = {
                displayName: window.localStorage.getItem(userHandler.displayNameKey),
                phoneNumber: window.localStorage.getItem(userHandler.phoneNumberKey)
            };

            $scope.validateAndRegister = context.validateAndRegisterHandler($ionicSideMenuDelegate, $scope, $resource);

            $scope.acceptStickle = context.stickleResponseHandler("accepted", $scope);

            $scope.unAcceptStickle = context.stickleResponseHandler("un-accepted", $scope);

            $scope.rejectStickle = context.stickleResponseHandler("rejected", $scope);

            $scope.onToggle = context.stickleHandler($scope);

        } catch (err) {
            log.error("Error", err);
        }
    });

var context = {
    serverUrl: "192.168.0.5",

    checkDetails: function ($scope, $ionicSideMenuDelegate) {
        const userId = window.localStorage.getItem(userHandler.userIdKey);
        if ((userId === null) || userId === "") {
            $scope.generalError = "Enter your name and telephone number to get started";
            $ionicSideMenuDelegate.toggleLeft(true);
        }
    },

    validateAndRegisterHandler: function ($ionicSideMenuDelegate, $scope, $resource) {
        return function (form) {
            log.debug("validateAndRegister");
            $scope.generalError = null;
            if (form.$valid) {
                log.debug("valid");
                window.localStorage.setItem(userHandler.displayNameKey, $scope.details.displayName);
                window.localStorage.setItem(userHandler.phoneNumberKey, $scope.details.phoneNumber);

                var promise = userHandler.registerOnServer($resource, $scope.details.phoneNumber, $scope.details.displayName);

                promise.then(function () {
                    $ionicSideMenuDelegate.toggleLeft(false);
                    socketHandler.ws.$close();
                    socketHandler.ws.$open();
                }, function (result) {
                    $scope.generalError = result.data;
                });
            }
            if (form.$invalid) {
                log.debug("invalid");
                $ionicSideMenuDelegate.toggleLeft(true);
            }
        }
    },

    moveToTop: function (contact, model, key) {
        if (model.stickles[key] == null) {
            model.stickles[key] = contact;
            contact.hidden = true;
        }
    },

    removeFromTop: function (contact, model, key) {
        delete model.stickles[key];
        contact.hidden = false;

    },

    setStatusAndDisplay: function (contact, status, model, inbound) {
        var key = (inbound ? "in" : "out") + contact.phoneNumbers[0].value;

        if (status === "rejected" || status === "closed") {
            contact.stickleStatus = null;
            contact.inbound = false;
            contact.stickled = false;
            context.removeFromTop(contact, model, key);
        } else {
            contact.inbound = inbound;
            contact.stickleStatus = status;
            context.moveToTop(contact, model, key);
        }
    },

    stickleResponseHandler: function (status, model) {
        return function (contact) {
            log.debug(status + ": " + contact.displayName + " - " + contact.phoneNumbers[0].value);
            socketHandler.ws.$emit("stickle-response", {
                origin: contact.phoneNumbers[0].value,
                status: status
            });
            context.setStatusAndDisplay(contact, status, model, true);
        }
    },

    stickleHandler: function (model) {
        return function (contact) {
            log.debug("stickling: " + contact.displayName + "; stickled: " + contact.stickled);
            var status = contact.stickled ? "open" : "closed";
            socketHandler.ws.$emit("stickle", {
                to: contact.phoneNumbers[0].value,
                status: status
            });
            context.setStatusAndDisplay(contact, status, model, false);
        }
    },

    checkStatuses: function (model) {
        model.contacts.forEach(function (contact, index) {
            socketHandler.ws.$emit("checkContactStatus", {phoneNum: contact.phoneNumbers[0].value});
        });
    },

    checkStickleStates: function(model) {
        log.debug("checking stickle states");
        for (var key in model.stickles) {
            log.debug("check-state: " + JSON.stringify(model.stickles[key]));
            socketHandler.ws.$emit("check-state", {phoneNum: model.stickles[key].phoneNumbers[0].value, inbound: model.stickles[key].inbound});
        }
    },

    authenticate: function () {
        if (socketHandler.ws.$ready()) {
            log.debug("authenticating");
            socketHandler.ws.$emit("authenticate", {userId: window.localStorage.getItem(userHandler.userIdKey)});
        }
    },

    getOrCreateContact: function (model, key, displayName) {
        var contact = model.contactsMap[key];
        if (contact == null) {
            contact = {
                phoneNumbers: [{type: "mobile", value: key}],
                displayName: displayName
            }
        }
        return contact;
    },

    errorReportFunc: function (err) {
        log.error("Error:" + err.status + " - " + err.statusText + "; " + err.data);
    }
};

var socketHandler = {

    unbindSockets: function ($interval) {
        socketHandler.ws.$close();
        $interval.cancel(context.checkStatusPromise);
    },

    bindSocketEvents: function (model) {

        socketHandler.ws.$on("stickled", function (data) {
            socketHandler.logAndApply("stickled", function () {
                var contact = context.getOrCreateContact(model, data.from, data.displayName);
                context.setStatusAndDisplay(contact, data.status, model, true);
            }, model, data);
        });

        socketHandler.ws.$on("stickle-responded", function (data) {
            socketHandler.logAndApply("stickle-responded", function () {
                var contact = model.contactsMap[data.from];
                context.setStatusAndDisplay(contact, data.status, model, false);
            }, model, data);
        });

        socketHandler.ws.$on("contactStatus", function (data) {
            socketHandler.logAndApply("contactStatus", function () {
                if (data.status === "registered") {
                    model.contactsMap[data.phoneNum].stickler = true;
                }
            }, model, data);
        });

        socketHandler.ws.$on("state", function (data) {
            socketHandler.logAndApply("state", function () {
                var inbound = (data.recipient === window.localStorage.getItem(userHandler.phoneNumberKey));
                var contact;
                if (inbound) {
                    contact = context.getOrCreateContact(model, data.originator, data.originatorDisplayName);
                } else {
                    contact = model.contactsMap[data.recipient];
                    contact.stickled = true;
                }
                context.setStatusAndDisplay(contact, data.state, model, inbound);
            }, model, data);
        });
    },

    startSockets: function (model, $websocket, $interval) {

        const url = 'ws://' + context.serverUrl + "/api/ws";

        socketHandler.ws = $websocket.$new({
            url: url
        });

        socketHandler.ws.$on("$open", function () {
            context.checkStatusPromise = $interval(function () {
                context.checkStatuses(model)
            }, 60 * 60 * 1000);
        });

        socketHandler.ws.$on("$open", function () {
            context.authenticate();
        });

        socketHandler.ws.$on("authenticated", function () {
            log.debug("authenticated");

            if (!socketHandler.socketBound) {
                log.debug("binding to socket");

                socketHandler.bindSocketEvents(model);

                context.checkStatuses(model);

                socketHandler.socketBound = true;
            }

            context.checkStickleStates(model);
        });
    },

    logAndApply: function (msg, func, model, data) {
        log.debug(msg + ": " + JSON.stringify(data));
        model.$apply(function () {
            try {
                func();
            } catch (err) {
                log.error("Error", err);
            }
        });
    }
};