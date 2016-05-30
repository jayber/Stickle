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

            setupHandler.setUpDetailsAndRegistration($scope, $ionicSideMenuDelegate, $resource, $interval);
            setupHandler.setUpActions($scope);
            setupHandler.setUpShowDebug($scope);
            setupHandler.setUpFeedback($scope, $ionicModal);

        } catch (err) {
            log.error("Error", err);
        }
    });

var setupHandler = {
    setUpFeedback: function ($scope, $ionicModal) {
        $scope.feedbackOpen = function () {
            $scope.feedbackModal.show();
            $scope.feedback = {};
        };

        $scope.sendFeedback = function (feedbackForm) {
            log.debug("sendFeedback");
            if (feedbackForm.$valid) {
                log.debug("valid");
                socketHandler.ws.emit("feedback", {
                    title: $scope.feedback.title,
                    content: $scope.feedback.content,
                    displayName: $scope.details.displayName,
                    phoneNumber: $scope.details.phoneNumber,
                    userId: window.localStorage.getItem(userHandler.userIdKey)
                });
                feedbackForm.$setPristine();
                feedbackForm.$setUntouched();
                $scope.feedbackModal.hide();
            }
        };
        $scope.feedbackClose = function () {
            $scope.feedbackModal.hide();
        };
        $ionicModal.fromTemplateUrl('feedback.html', function (modal) {
            $scope.feedbackModal = modal;
        }, {
            scope: $scope,
            animation: 'slide-in-up'
        });
    },

    setUpShowDebug: function ($scope) {
        $scope.showLog = context.showLog;
        $scope.debugOn = window.localStorage.getItem("debug") == "true";
        context.showLog($scope.debugOn);
    },

    setUpActions: function ($scope) {
        $scope.acceptStickle = context.stickleResponseHandler("accepted", $scope);
        $scope.unAcceptStickle = context.stickleResponseHandler("un-accepted", $scope);
        $scope.rejectStickle = context.stickleResponseHandler("rejected", $scope);
        $scope.call = contactsHandler.makeCall;
        $scope.onToggle = context.stickleHandler($scope);
    },

    setUpDetailsAndRegistration: function ($scope, $ionicSideMenuDelegate, $resource, $interval) {
        $scope.details = {
            displayName: window.localStorage.getItem(userHandler.displayNameKey),
            phoneNumber: window.localStorage.getItem(userHandler.phoneNumberKey)
        };

        $scope.validateAndRegister = function (form) {
            log.debug("validateAndRegister");
            $scope.generalError = null;
            if (form.$valid) {
                log.debug("valid");
                window.localStorage.setItem(userHandler.displayNameKey, $scope.details.displayName);
                window.localStorage.setItem(userHandler.phoneNumberKey, $scope.details.phoneNumber);

                var promise = userHandler.registerOnServer($resource, $scope.details.phoneNumber, $scope.details.displayName);

                promise.then(function () {
                    $ionicSideMenuDelegate.toggleLeft(false);
                    socketHandler.startSockets($scope, $interval, $ionicSideMenuDelegate)
                }, function (result) {
                    $scope.generalError = result.data;
                });
            }
            if (form.$invalid) {
                log.debug("invalid");
                $ionicSideMenuDelegate.toggleLeft(true);
            }
        }
    }
};