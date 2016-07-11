var setupHandler = {

    initModel: function ($scope, $ionicSideMenuDelegate, $resource, $interval, $ionicModal, $ionicPopover) {
        setupHandler.setUpTurnSoundsOff($scope);
        setupHandler.setUpDetailsAndRegistration($scope, $ionicSideMenuDelegate, $resource, $interval);
        setupHandler.setUpActions($scope);
        setupHandler.setUpShowDebug($scope);
        setupHandler.setUpFeedback($scope, $ionicModal, $resource);
        setupHandler.setUpPopover($scope, $ionicPopover);
        setupHandler.setUpFilter($scope);
    },

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
        $scope.acceptStickle = contactsHandler.stickleResponseHandler("accepted", $scope);
        $scope.unAcceptStickle = contactsHandler.stickleResponseHandler("un-accepted", $scope);
        $scope.rejectStickle = contactsHandler.stickleResponseHandler("rejected", $scope);
        $scope.call = contactsHandler.makeCall($scope);
        $scope.onToggle = contactsHandler.stickleHandler($scope);
    },

    setUpDetailsAndRegistration: function ($scope, $ionicSideMenuDelegate, $resource, $interval) {
        $scope.details = {
            displayName: window.localStorage.getItem(userHandler.displayNameKey),
            phoneNumber: window.localStorage.getItem(userHandler.phoneNumberKey)
        };

        $scope.details.validateAndRegisterAction = uIHandler.registrationAction($scope, $ionicSideMenuDelegate, $resource, $interval);
    }
};