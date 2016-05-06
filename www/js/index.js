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

            $scope.onToggle = userHandler.stickle;

            $scope.promptPhone = userHandler.phonePrompter($ionicPopup, $resource);

            document.addEventListener("resume", function () {
                log.debug("resuming");
                context.startSockets($scope, $websocket, $interval, $timeout);
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

    stickle: function (event, from, to) {
        log.trace(event, from, to);
        if (context.ws.$ready()) {
            log.trace("ws ready");
            context.ws.$emit(event, {from: from, to: to});
        }
    },

    stickleOn: function (from, to) {
        context.stickle("stickleOn", from, to);
    },

    stickleOff: function (from, to) {
        context.stickle("stickleOff", from, to);
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
        context.ws.$un("stickled");
        context.ws.$un("contactStatus");
        context.ws.$un("authenticated");
        context.ws.$un("$open");
        context.ws.$un("$closed");
        $interval.cancel(context.checkStatusPromise);
    },

    startSockets: function (model, $websocket, $interval, $timeout) {
        context.ws = $websocket.$new({
            url: 'ws://' + context.serverUrl + "/api/ws"
        });

        context.ws.$on("$open", function () {

            context.authenticate();

            context.ws.$on("authenticated", function () {

                log.debug("authenticated");

                $timeout(function () {
                    context.checkStatuses(model)
                }, 2000);
                context.checkStatusPromise = $interval(function () {
                    context.checkStatuses(model)
                }, 60 * 60 * 1000);


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
            });
        });

        context.ws.$on("$close", function () {
            this.unbindSockets($interval);
        });

    },

    errorReportFunc: function (err) {
        log.error("Error:" + err.status + " - " + err.statusText + "; " + err.data);
    }
};