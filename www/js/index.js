angular.module('stickle', ['ionic', 'ngResource', 'ngWebsocket'])
    .controller('stickleCtrl', function ($scope, $ionicPopup, $timeout, $resource, $websocket, $interval) {
        try {
            ionic.Platform.ready(function () {
                try {
                    polyFillMobileAPIs();
                    contactsProcessor.populateContacts($scope, $resource);
                    userHandler.logon($ionicPopup, $timeout, $resource);
                    context.startCheckingMessages($scope, $websocket, $interval, $timeout);
                } catch (err) {
                    log.error("Error", err);
                }
            });

            $scope.onToggle = userHandler.stickle;

            $scope.promptPhone = userHandler.phonePrompter($ionicPopup, $resource);

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

    startCheckingMessages: function (model, $websocket, $interval, $timeout) {
        context.ws = $websocket.$new({
            url: 'ws://' + context.serverUrl + "/api/ws",
            reconnect: true
        });

        var promise;
        context.ws.$on("$open", function () {
            $timeout(function () {
                context.checkStatuses(model)
            }, 2000);
            promise = $interval(function () {
                context.checkStatuses(model)
            }, 60 * 60 * 1000);
        });

        context.ws.$on("$close", function () {
            $interval.cancel(promise);
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
    },

    errorReportFunc: function (err) {
        log.error("Error:" + err.status + " - " + err.statusText + "; " + err.data);
    }
};