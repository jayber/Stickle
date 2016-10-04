var setupHandler = {

    initModel: function ($scope, $ionicSideMenuDelegate, $resource, $interval, $ionicModal, $ionicPopover, $ionicScrollDelegate, $ionicPopup) {
        setupHandler.setUpTurnSoundsOff($scope);
        setupHandler.setUpDetailsAndRegistration($scope, $ionicSideMenuDelegate, $resource, $interval, $ionicScrollDelegate);
        setupHandler.setUpActions($scope, $ionicScrollDelegate, $ionicPopup);
        setupHandler.setUpShowDebug($scope);
        setupHandler.setUpFeedback($scope, $ionicModal, $resource);
        setupHandler.setUpPopover($scope, $ionicPopover);
        setupHandler.setUpFilter($scope);
        setupHandler.setUpSplash($scope, $ionicModal);
        setupHandler.setUpConnectionWarn($scope, $ionicModal);
    },

    setUpTurnSoundsOff: function (model) {
        model.sounds = {off: window.localStorage.getItem("soundsOff") == "true"};
        model.sounds.toggleSoundsAction = context.toggleSoundsAction(model);
    },

    setUpFilter: function ($scope) {
        $scope.contactFilter = {value: ""};
        $scope.contactFilter.toggleFilterAction = userInterfaceHandler.toggleFilterAction($scope);
    },

    setUpFeedback: function ($scope, $ionicModal, $resource) {
        $scope.feedback = {};
        userInterfaceHandler.createFeedbackModal($scope, $ionicModal);
        $scope.feedback.openAction = userInterfaceHandler.openFeedbackAction($scope);
        $scope.feedback.sendAction = userInterfaceHandler.sendFeedbackAction($scope, $resource);
        $scope.feedback.closeAction = userInterfaceHandler.closeFeedbackAction($scope);
    },

    setUpSplash: function ($scope, $ionicModal) {
        $scope.splash = {on: window.localStorage.getItem("splash") != "false"};
        userInterfaceHandler.createSplashModal($scope, $ionicModal);
        $scope.splash.toggleSplashAction = userInterfaceHandler.toggleSplashAction;
        $scope.splash.show = function() {
            $scope.splash.modal.show();
        }
    },

    setUpConnectionWarn: function($scope, $ionicModal) {
        $scope.connectionWarn = {on: navigator.connection.type == Connection.NONE};
        userInterfaceHandler.createConnectionWarnModal($scope, $ionicModal);
    },

    setUpPopover: function ($scope, $ionicPopover) {
        userInterfaceHandler.createPopover($scope,$ionicPopover);
    },

    setUpShowDebug: function ($scope) {
        $scope.debug = {on: window.localStorage.getItem("debug") == "true"};
        userInterfaceHandler.toggleLog($scope.debug.on);
        $scope.debug.showLogAction = userInterfaceHandler.toggleLog;
    },

    setUpActions: function ($scope, $ionicScrollDelegate, $ionicPopup) {
        $scope.acceptStickle = contactsHandler.stickleResponseHandler("accepted", $scope,$ionicScrollDelegate);
        $scope.unAcceptStickle = contactsHandler.stickleResponseHandler("un-accepted", $scope,$ionicScrollDelegate);
        $scope.rejectStickle = contactsHandler.stickleResponseHandler("rejected", $scope);
        $scope.call = contactsHandler.makeCall($scope, $ionicScrollDelegate);
        $scope.onToggle = contactsHandler.stickleHandler($scope, $ionicScrollDelegate);
        $scope.invite = contactsHandler.inviteSms($scope, $ionicPopup);
    },

    setUpDetailsAndRegistration: function ($scope, $ionicSideMenuDelegate, $resource, $interval, $ionicScrollDelegate) {
        $scope.details = {
            displayName: window.localStorage.getItem(userHandler.displayNameKey),
            phoneNumber: window.localStorage.getItem(userHandler.phoneNumberKey)
        };

        $scope.details.logout = userInterfaceHandler.logoutAction($scope, $ionicSideMenuDelegate);
        $scope.details.registrationAction = userInterfaceHandler.registrationAction($scope, $ionicSideMenuDelegate, $resource);
        $scope.verify = {verificationAction: userInterfaceHandler.verifyAction($scope, $resource, $interval, $ionicSideMenuDelegate, $ionicScrollDelegate)};
        $scope.verify.resend = userInterfaceHandler.resendVerificationAction($scope,$resource);
    }
};