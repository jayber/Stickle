var setupHandler = {

    setUpTurnSoundsOff: function (model) {
        model.sounds = {off: window.localStorage.getItem("soundsOff") == "true"};
        model.turnSoundsOff = function (off) {
            if (off) {
                log.debug("turning sounds off");
                window.localStorage.setItem("soundsOff", true);
                setTimeout(function () {
                    setupHandler.showPopover(model, "Sounds off.");
                }, 100);
            } else {
                log.debug("turning sounds on");
                window.localStorage.setItem("soundsOff", false);
                setTimeout(function () {
                    setupHandler.showPopover(model, "Sounds on.");
                }, 100);
            }
        }
    },

    setUpFilter: function ($scope) {
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

    setUpFeedback: function ($scope, $ionicModal, $resource) {
        $scope.feedbackOpen = function () {
            $scope.feedbackModal.show().then(function (modal) {
                $scope.feedback = {};
            });
        };
        $scope.sendFeedback = function (feedbackForm) {
            log.debug("sendFeedback");
            if (feedbackForm.$valid) {
                log.debug("valid");
                var Feedback = $resource('http://:server/api/feedback/', {
                    server: context.serverUrl
                });
                log.debug("sending feedback");
                var output = "";
                //if ($scope.feedback.attachLog) {
                $("#log", iframeDoc).find("span").each(function () {
                    output = output + $(this).text();
                });
                //}
                Feedback.save({
                    title: $scope.feedback.title == undefined ? "" : $scope.feedback.title + "",
                    content: $scope.feedback.content + "",
                    displayName: $scope.details.displayName + "",
                    phoneNumber: $scope.details.phoneNumber + "",
                    userId: window.localStorage.getItem(userHandler.userIdKey) + "",
                    log: output,
                    browserInfo: {
                        websockets: typeof WebSocket === "function",
                        browserEngine: navigator.product,
                        userAgent: navigator.userAgent,
                        browserLanguage: navigator.language,
                        browserOnline: navigator.onLine,
                        browserPlatform: navigator.platform,
                        sizeScreenW: screen.width,
                        sizeScreenH: screen.height
                    }
                }, function (res) {
                    $scope.feedbackModal.hide().then(setupHandler.showPopover($scope, "Feedback successfully sent."));
                    feedbackForm.$setPristine();
                    feedbackForm.$setUntouched();
                    log.debug("feedback saved!");
                }, context.errorReportFunc);
            }
        };
        $scope.feedbackClose = function () {
            $scope.feedbackModal.hide();
        };
        $ionicModal.fromTemplateUrl('/templates/feedback.html', function (modal) {
            $scope.feedbackModal = modal;
        }, {
            scope: $scope,
            animation: 'slide-in-up'
        });
    },

    setUpPopover: function ($scope, $ionicPopover) {
        $ionicPopover.fromTemplateUrl('/templates/popover.html', {
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
        var toggleLog = function (debug) {
            $("#errors").toggleClass('hidden', !debug);
            window.localStorage.setItem("debug", debug);
        };
        $scope.debug = {on: window.localStorage.getItem("debug") == "true"};
        toggleLog($scope.debug.on);
        $scope.showLog = toggleLog;
    },

    setUpActions: function ($scope) {
        $scope.acceptStickle = context.stickleResponseHandler("accepted", $scope);
        $scope.unAcceptStickle = context.stickleResponseHandler("un-accepted", $scope);
        $scope.rejectStickle = context.stickleResponseHandler("rejected", $scope);
        $scope.call = contactsHandler.makeCall($scope);
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
                        try {
                            $ionicSideMenuDelegate.toggleLeft(false);
                            socketHandler.startSockets($scope, $interval, $ionicSideMenuDelegate);
                            setupHandler.showPopover($scope, "Successfully registered.");
                        } catch (err) {
                            log.error("Error - ", err, err.stack);
                        }
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