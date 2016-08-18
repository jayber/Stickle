var userInterfaceHandler = {

    registrationAction: function ($scope, $ionicSideMenuDelegate, $resource, $interval) {
        return function (form) {
            log.debug("validateAndRegister");
            $scope.generalError = null;
            if (form.$valid) {
                log.debug("valid");
                window.localStorage.setItem(userHandler.displayNameKey, $scope.details.displayName);
                window.localStorage.setItem(userHandler.phoneNumberKey, $scope.details.phoneNumber);

                try {
                    log.trace("about to register");
                    var canonTel = telephone.canonicalize($scope.details.phoneNumber);
                    userHandler.registerOnServer($resource, canonTel, $scope.details.displayName)
                        .then(function () {
                            $ionicSideMenuDelegate.toggleLeft(false);
                            socketHandler.startSockets($scope, $interval, $ionicSideMenuDelegate);
                            userInterfaceHandler.showPopover($scope, "Successfully registered.");
                        }, function (result) {
                            $scope.generalError = result.data;
                        });
                } catch (e) {
                    log.debug(e.error.toString());
                }
            }
            if (form.$invalid) {
                log.debug("invalid");
                $ionicSideMenuDelegate.toggleLeft(true);
            }
        };
    },

    toggleFilterAction: function ($scope) {
        return function () {
            $scope.contactFilter.show = !$scope.contactFilter.show;
            $scope.contactFilter.value = "";
            $scope.$broadcast('scroll.refreshComplete');
        };
    },

    createFeedbackModal: function ($scope, $ionicModal) {
        $ionicModal.fromTemplateUrl('templates/feedback.html', function (modal) {
            $scope.feedback.modal = modal;
        }, {
            scope: $scope,
            animation: 'slide-in-up'
        });
    },

    createSplashModal: function ($scope, $ionicModal) {
        $ionicModal.fromTemplateUrl('templates/splash.html',{
            scope: $scope,
            animation: 'slide-in-down'
        }).then( function (modal) {
            $scope.splash.modal = modal;
            if ($scope.splash.on == true) {
                $scope.splash.modal.show();
            }
        });
    },

    toggleSplashAction: function(on) {
        window.localStorage.setItem("splash",on);
    },

    openFeedbackAction: function ($scope) {
        return function () {
            $scope.feedback.modal.show().then(function (modal) {
                $scope.feedback.fields = {};
            });
        };
    },

    closeFeedbackAction: function ($scope) {
        return function () {
            $scope.feedback.modal.hide();
        };
    },

    sendFeedbackAction: function ($scope, $resource) {
        return function (feedbackForm) {
            log.debug("sendFeedback");
            if (feedbackForm.$valid) {
                log.debug("valid");
                userHandler.sendFeedback($scope, $resource, feedbackForm);
            }
        };
    },

    resetFeedbackDisplay: function ($scope, feedbackForm) {
        $scope.feedback.modal.hide().then(userInterfaceHandler.showPopover($scope, "Feedback successfully sent."));
        feedbackForm.$setPristine();
        feedbackForm.$setUntouched();
    },

    createPopover: function ($scope, $ionicPopover) {
        $ionicPopover.fromTemplateUrl('templates/popover.html', {
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

    toggleLog: function (debug) {
        $("#errors").toggleClass('hidden', !debug);
        window.localStorage.setItem("debug", debug);
    }
};