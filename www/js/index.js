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

angular.module('stickle', ['ionic', 'ngResource', 'ngWebsocket'])
    .controller('stickleCtrl', function ($scope, $ionicPopup, $timeout, $resource, $websocket, $interval) {
        try {
            ionic.Platform.ready(function () {
                try {
                    polyFillMobileAPIs();
                    contactsHandler.populateContacts($scope, $resource);
                    userHandler.logon($ionicPopup, $timeout, $resource);
                    context.startSockets($scope, $websocket, $interval, $timeout);
                } catch (err) {
                    log.error("Error", err);
                }
            });

            $scope.onToggle = context.stickleHandler;

            $scope.promptPhone = userHandler.phonePrompter($ionicPopup, $resource);

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
    serverUrl: "192.168.0.4",

    stickleHandler: function (contact) {
        log.debug("stickling: " + contact.displayName + "; stickled: " + contact.stickled);
        context.ws.$emit("stickle", {from: userHandler.phoneNumber, to: contact.phoneNumbers[0].value, status: contact.stickled ? "open" : "closed"});
    },

    checkStatuses: function (model) {
        model.contacts.forEach(function (thing, index) {
            context.ws.$emit("checkContactStatus", {phoneNum: thing.phoneNumbers[0].value});
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
                        if (data.status === "open") {
                            model.stickles[data.from] = model.contactsMap[data.from];
                            model.contactsMap[data.from].hidden = true;
                        } else {
                            delete model.stickles[data.from];
                            model.contactsMap[data.from].hidden = false;

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
                context.socketBound = true;
            }
        });

    },

    errorReportFunc: function (err) {
        log.error("Error:" + err.status + " - " + err.statusText + "; " + err.data);
    }
};