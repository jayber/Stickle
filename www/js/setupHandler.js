var setupHandler = {

    setUpTurnSoundsOff: function (model) {
        model.sounds = {off: window.localStorage.getItem("soundsOff") == "true"};
        model.sounds.toggleSoundsAction = context.toggleSoundsAction;
    },

    setUpFilter: function ($scope) {
        $scope.contactFilter = {value: ""};
        $scope.contactFilter.toggleFilterAction = uIHandler.toggleFilterAction($scope);
    },

    setUpFeedback: function ($scope, $ionicModal, $resource) {
        $scope.feedback = {};
        uIHandler.createFeedbackModal($scope, $ionicModal);
        $scope.feedback.openAction = uIHandler.openFeedbackAction($scope);
        $scope.feedback.sendAction = uIHandler.sendFeedbackAction($scope, $resource);
        $scope.feedback.closeAction = uIHandler.closeFeedbackAction($scope);
    },

    setUpPopover: uIHandler.createPopover,

    setUpShowDebug: function ($scope) {
        $scope.debug = {on: window.localStorage.getItem("debug") == "true"};
        uIHandler.toggleLog($scope.debug.on);
        $scope.debug.showLogAction = uIHandler.toggleLog;
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

        $scope.details.validateAndRegisterAction = function (form) {
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
                            uIHandler.showPopover($scope, "Successfully registered.");
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