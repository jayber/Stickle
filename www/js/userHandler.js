var userHandler = {

    displayNameKey: "displayName",
    userIdKey: "userId",
    phoneNumberKey: "phonenumber",

    sendFeedback: function($scope, $resource, feedbackForm) {
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
            title: $scope.feedback.fields.title == undefined ? "" : $scope.feedback.fields.title + "",
            content: $scope.feedback.fields.content + "",
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
            uIHandler.resetFeedbackDisplay($scope, feedbackForm);
            log.debug("feedback saved!");
        }, context.errorReportFunc);
    },

    registerOnServer: function ($resource, phoneNumber, displayName) {
        var User = $resource('http://:server/api/user/:phoneNum', {
            server: context.serverUrl,
            phoneNum: "@phoneNum"
        });
        log.debug("attempting to register");
        return User.save({phoneNum: phoneNumber}, {displayName: displayName},function (res) {
            window.localStorage.setItem(userHandler.userIdKey, res.userId);
            window.localStorage.setItem(userHandler.phoneNumberKey, phoneNumber);
            log.debug("registered!");
        }, context.errorReportFunc).$promise;
    }
};