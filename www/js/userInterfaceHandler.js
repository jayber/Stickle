var userInterfaceHandler = {

    logoutAction: function ($scope, $ionicSideMenuDelegate) {
        return function () {
            window.localStorage.removeItem(userHandler.authIdKey);
            userHandler.checkDetails($scope, $ionicSideMenuDelegate);
        }
    },

    registrationAction: function ($scope, $ionicSideMenuDelegate, $resource) {
        return function (form) {
            log.debug("validateAndRegister");
            $scope.generalError = null;
            if (form.$valid) {
                log.debug("valid");
                window.localStorage.setItem(userHandler.displayNameKey, $scope.details.displayName);
                window.localStorage.setItem(userHandler.phoneNumberKey, $scope.details.phoneNumber);

                log.trace("about to canonicalize");
                var canonTel = telephone.canonicalize($scope.details.phoneNumber);
                log.trace("about to register");
                userHandler.registerOnServer($resource, canonTel, $scope.details.displayName)
                    .then(function () {
                        $("#phoneNumber,#displayName").prop("disabled", true);
                        $scope.details.status = "registered";
                    }, function (result) {
                        $scope.generalError = result.data;
                    });
            }
            if (form.$invalid) {
                log.debug("invalid");
                $ionicSideMenuDelegate.toggleLeft(true);
            }
        };
    },

    verifyAction: function ($scope, $resource, $interval, $ionicSideMenuDelegate, $ionicScrollDelegate) {
        return function (verifyForm) {
            if (verifyForm.$valid) {
                var canonTel = telephone.canonicalize($scope.details.phoneNumber);
                var verificationCode = $scope.verify.verificationCode;
                log.trace("about to verify: " + verificationCode);
                userHandler.verifyRegistration($resource, canonTel, verificationCode)
                    .then(function () {
                        $scope.details.status = "loggedIn";
                        $scope.verify.verificationCode = "";
                        $scope.generalError = "";
                        $ionicSideMenuDelegate.toggleLeft(false);
                        socketHandler.startSockets($scope, $interval, $ionicSideMenuDelegate, $ionicScrollDelegate);
                        userInterfaceHandler.showPopover($scope, "Successfully registered and verified.");
                    }, function (result) {
                        $scope.generalError = result.data;
                    });
            }
        }
    },

    resendVerificationAction: function ($scope, $resource) {
        return function () {
            var canonTel = telephone.canonicalize($scope.details.phoneNumber);
            log.trace("about to resend: " + canonTel);
            userHandler.resendVerification($resource, canonTel)
                .then(function () {
                    $scope.verify.verificationCode = "";
                    $scope.generalError = "";
                    userInterfaceHandler.showPopover($scope, "Code resent.");
                }, function (result) {
                    $scope.generalError = result.data;
                });
        }
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
        $ionicModal.fromTemplateUrl('templates/splash.html', {
            scope: $scope,
            animation: 'slide-in-down'
        }).then(function (modal) {
            $scope.splash.modal = modal;
            if ($scope.splash.on == true) {
                $scope.splash.modal.show();
            }
        });
    },

    createConnectionWarnModal: function ($scope, $ionicModal) {
        $ionicModal.fromTemplateUrl('templates/connectionWarn.html', {
            scope: $scope,
            animation: 'slide-in-down'
        }).then(function (modal) {
            $scope.connectionWarn.modal = modal;
            if ($scope.connectionWarn.on == true) {
                $scope.connectionWarn.modal.show();
            } else {
                $scope.connectionWarn.modal.hide();
            }
        });
    },

    toggleSplashAction: function (on) {
        window.localStorage.setItem("splash", on);
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