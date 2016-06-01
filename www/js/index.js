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
    .controller('stickleCtrl', function ($scope, $ionicPopup, $resource, $interval, $ionicSideMenuDelegate, $ionicModal, $ionicPopover) {
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
            setupHandler.setUpPopover($scope, $ionicPopover);
            setupHandler.setUpFilter($scope);

        } catch (err) {
            log.error("Error", err);
        }
    });

var setupHandler = {

    setUpFilter: function($scope) {
        $scope.contactFilter = {value: ""};
        $scope.toggleFilter = setupHandler.toggleFilter($scope);
    },

    toggleFilter: function ($scope) {
        return function () {
            $scope.showFilter = !$scope.showFilter;
            $scope.contactFilter.value = "";
            $scope.$broadcast('scroll.refreshComplete');
        }
    },

    setUpFeedback: function ($scope, $ionicModal) {
        $scope.feedbackOpen = function () {
            $scope.feedbackModal.show().then(function (modal) {
                $scope.feedback = {};
            });
        };
        $scope.sendFeedback = function (feedbackForm) {
            log.debug("sendFeedback");
            theform = feedbackForm;
            if (feedbackForm.$valid) {
                log.debug("valid");
                socketHandler.ws.emit("feedback", {
                    title: $scope.feedback.title == undefined ? "" : $scope.feedback.title + "",
                    content: $scope.feedback.content + "",
                    displayName: $scope.details.displayName + "",
                    phoneNumber: $scope.details.phoneNumber + "",
                    userId: window.localStorage.getItem(userHandler.userIdKey) + ""
                });
                $scope.feedbackModal.hide().then(setupHandler.showPopover($scope, "Feedback successfully sent."));

                feedbackForm.$setPristine();
                feedbackForm.$setUntouched();
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

    setUpPopover: function ($scope, $ionicPopover) {
        $ionicPopover.fromTemplateUrl('popover.html', {
            scope: $scope
        }).then(function (popover) {
            $scope.popover = popover;
        });
    },

    showPopover: function ($scope, msg) {
        log.trace("popover?");
        $scope.popoverMsg = msg;
        $scope.popover.show($(".main")).then(function () {
            setTimeout(function () {
                $scope.popover.hide();
                log.trace("popover gone?");
            }, 2000)
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

                userHandler.registerOnServer($resource, $scope.details.phoneNumber, $scope.details.displayName)
                    .then(function () {
                        $ionicSideMenuDelegate.toggleLeft(false);
                        socketHandler.startSockets($scope, $interval, $ionicSideMenuDelegate);
                        setupHandler.showPopover($scope, "Successfully registered.");
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