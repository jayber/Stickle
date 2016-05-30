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

function setUpFeedback($scope, $ionicModal) {
    $scope.feedbackOpen = function () {
        $scope.feedbackModal.show();
        $scope.feedback = {};
    };

    $scope.sendFeedback = function(feedbackForm) {
        log.debug("sendFeedback");
        if (feedbackForm.$valid) {
            log.debug("valid");
            socketHandler.ws.emit("feedback", {title: $scope.feedback.title, content: $scope.feedback.content});
            feedbackForm.$setPristine();
            feedbackForm.$setUntouched();
            $scope.feedbackModal.hide();
        }
    };

    $scope.feedbackClose = function() {
        $scope.feedbackModal.hide();
    };

    $ionicModal.fromTemplateUrl('feedback.html', function(modal) {
        $scope.feedbackModal = modal;
    }, {
        scope: $scope,
        animation: 'slide-in-up'
    });
}

function setUpShowDebug($scope) {
    $scope.showLog = context.showLog;
    $scope.debugOn = window.localStorage.getItem("debug") == "true";
    context.showLog($scope.debugOn);
}

function setUpActions($scope) {
    $scope.acceptStickle = context.stickleResponseHandler("accepted", $scope);

    $scope.unAcceptStickle = context.stickleResponseHandler("un-accepted", $scope);

    $scope.rejectStickle = context.stickleResponseHandler("rejected", $scope);

    $scope.call = contactsHandler.makeCall;

    $scope.onToggle = context.stickleHandler($scope);
}

function setUpDetailsAndRegistration($scope, $ionicSideMenuDelegate, $resource) {
    $scope.details = {
        displayName: window.localStorage.getItem(userHandler.displayNameKey),
        phoneNumber: window.localStorage.getItem(userHandler.phoneNumberKey)
    };

    $scope.validateAndRegister = context.validationAndRegistrationHandler($ionicSideMenuDelegate, $scope, $resource);
}

angular.module('stickle', ['ionic', 'ngResource', 'ngAnimate'])
    .controller('stickleCtrl', function ($scope, $ionicPopup, $resource, $interval, $ionicSideMenuDelegate, $ionicModal) {
        try {
            ionic.Platform.ready(function () {
                try {
                    polyFillMobileAPIs();
                    context.addEventListeners($scope, $interval, $ionicSideMenuDelegate);
                    context.checkDetails($scope, $ionicSideMenuDelegate);
                    contactsHandler.populateContacts($scope, $resource)
                        .done(function () {
                            socketHandler.startSockets($scope, $interval, $ionicSideMenuDelegate);
                        });
                } catch (err) {
                    log.error("Error - ionic.Platform.ready", err);
                }
            });

            setUpDetailsAndRegistration($scope, $ionicSideMenuDelegate, $resource);

            setUpActions($scope);

            setUpShowDebug($scope);

            setUpFeedback($scope, $ionicModal);

        } catch (err) {
            log.error("Error", err);
        }
    });

var context = {
    serverUrl: "192.168.0.4",

    addEventListeners: function (model, $interval, $ionicSideMenuDelegate) {
        document.addEventListener("touchstart", function () {
        }, true);

        document.addEventListener("resume", function () {
            log.debug("resuming");
            try {
                socketHandler.startSockets(model, $interval, $ionicSideMenuDelegate);
            } catch (err) {
                log.error("Error - ", err, err.stack);
            }
        }, false);

        document.addEventListener("pause", function () {
            log.debug("paused");
            socketHandler.ws.close();
        }, false);
    },

    showLog: function (debug) {
        $("#errors").toggleClass('hidden', !debug);
        window.localStorage.setItem("debug", debug);
    },

    checkDetails: function ($scope, $ionicSideMenuDelegate) {
        const userId = window.localStorage.getItem(userHandler.userIdKey);
        if ((userId === null) || userId === "") {
            $scope.generalError = "Enter your name and telephone number to get started";
            $ionicSideMenuDelegate.toggleLeft(true);
        }
    },

    validationAndRegistrationHandler: function ($ionicSideMenuDelegate, $scope, $resource) {
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

        if (inbound) {
            var existingContact = model.stickles[key];
            if (existingContact != null) {
                contact = existingContact;
            }
        }

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
            socketHandler.ws.emit("stickle-response", {
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
            socketHandler.ws.emit("stickle", {
                to: contact.phoneNumbers[0].value,
                status: status
            });
            context.setStatusAndDisplay(contact, status, model, false);
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
    getUrl: function () {
        return 'ws://' + context.serverUrl + "/api/ws";
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
    },

    authenticate: function () {
        log.debug("authenticating");
        socketHandler.ws.emit("authenticate", {userId: window.localStorage.getItem(userHandler.userIdKey)});
    },

    checkStatuses: function (model) {
        model.contacts.forEach(function (contact, index) {
            socketHandler.ws.emit("checkContactStatus", {phoneNum: contact.phoneNumbers[0].value});
        });
    },

    checkStickleStates: function (model) {
        log.debug("checking stickle states");
        for (var key in model.stickles) {
            log.debug("check-state: " + JSON.stringify(model.stickles[key]));
            socketHandler.ws.emit("check-state", {
                phoneNum: model.stickles[key].phoneNumbers[0].value,
                inbound: model.stickles[key].inbound
            });
        }
    },

    startSockets: function (model, $interval, $ionicSideMenuDelegate) {
        socketHandler.ws = new socketHandler.StickleWebSocket(socketHandler.getUrl(), model, $ionicSideMenuDelegate, $interval);
    },

    StickleWebSocket: function (url, model, $ionicSideMenuDelegate, $interval) {
        this.url = url;
        this.ws = new WebSocket(url);

        this.emit = function (event, data) {
            var output = JSON.stringify({"event": event, "data": data});
            log.trace("ws emitting! " + output);
            this.ws.send(output);
        };

        this.close = function () {
            this.ws.onclose = function () {
                log.debug("ws closed - not reopening");
                $interval.cancel(socketHandler.checkStatusPromise);
            };
            this.ws.close();
        };

        this.ws.onopen = function () {
            log.debug("ws open!");
            context.checkStatusPromise = $interval(function () {
                socketHandler.checkStatuses(model)
            }, 60 * 60 * 1000);

            socketHandler.authenticate();
        };

        this.ws.onclose = function () {
            log.debug("ws closed! - trying to reopen");
            setTimeout(function () {
                socketHandler.startSockets(model, $interval, $ionicSideMenuDelegate)
            }, 5000);
        };

        this.ws.onerror = function (error) {
            log.error("ws errored!", error);
        };

        this.ws.onmessage = function (event) {
            var msg = JSON.parse(event.data);
            var data = msg.data;

            switch (msg.event) { //first 3, or 4, events really just the same thing?
                case "stickled":
                    socketHandler.logAndApply("stickled", function () {
                        var contact = context.getOrCreateContact(model, data.from, data.displayName);
                        context.setStatusAndDisplay(contact, data.status, model, true);
                    }, model, data);
                    break;
                case "stickle-responded":
                    socketHandler.logAndApply("stickle-responded", function () {
                        var contact = model.contactsMap[data.from];
                        context.setStatusAndDisplay(contact, data.status, model, false);
                    }, model, data);
                    break;
                case "state":
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
                    break;
                case "contactStatus":
                    socketHandler.logAndApply("contactStatus", function () {
                        if (data.status === "registered") {
                            model.contactsMap[data.phoneNum].stickler = true;
                        }
                    }, model, data);
                    break;
                case "authenticated":
                    log.debug("authenticated");

                    socketHandler.checkStatuses(model);

                    socketHandler.checkStickleStates(model);
                    break;
                case "authentication-failed":
                    log.debug("authentication-failed");

                    model.generalError = "Authentication failed, please register again.";
                    $ionicSideMenuDelegate.toggleLeft(true);
                    break;
            }
        }
    }
};