var userHandler = {

    displayNameKey: "displayName",
    authIdKey: "authId",
    phoneNumberKey: "phonenumber",
    pushRegistrationIdKey: "pushRegId",

    sendFeedback: function($scope, $resource, feedbackForm) {
        var Feedback = $resource(context.resourceLocation+'/feedback/', {
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
            userId: window.localStorage.getItem(userHandler.authIdKey) + "",
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
            userInterfaceHandler.resetFeedbackDisplay($scope, feedbackForm);
            log.debug("feedback saved!");
        });
    },

    checkDetails: function ($scope, $ionicSideMenuDelegate) {
        const authId = window.localStorage.getItem(userHandler.authIdKey);
        if ((authId === null) || authId === "") {
            $scope.details.status = "unregistered";
            $("#phoneNumber,#displayName").prop("disabled", false);
            $scope.generalError = "Enter your name and mobile phone number to get started";
            $ionicSideMenuDelegate.toggleLeft(true);
        } else {
            $scope.details.status = "loggedIn";
        }
    },

    registerOnServer: function ($resource, phoneNumber, displayName) {
        log.trace("getting registration resource");
        var User = $resource(context.resourceLocation+'/user/:phoneNum', {
            server: context.serverUrl,
            phoneNum: "@phoneNum"
        });
        log.debug("attempting to register");
        return User.save({phoneNum: phoneNumber}, {displayName: displayName}).$promise;
    },

    verifyRegistration: function($resource, phoneNumber, verificationCode) {
        log.trace("getting verification resource");
        var Verification = $resource(context.resourceLocation+'/verification/:phoneNum', {
            server: context.serverUrl,
            phoneNum: "@phoneNum"
        });
        log.debug("attempting to verify: "+verificationCode);
        return Verification.save({phoneNum: phoneNumber}, {verificationCode: verificationCode||""}, function (res) {
            window.localStorage.setItem(userHandler.authIdKey, res.authId);
            log.debug("verified!");
        }).$promise;
    },

    resendVerification: function($resource, phoneNumber) {
        log.trace("getting resend resource");
        var Resend = $resource(context.resourceLocation+'/resend/:phoneNum', {
            server: context.serverUrl,
            phoneNum: "@phoneNum"
        });
        log.debug("attempting to resend");
        return Resend.save({phoneNum: phoneNumber}, {}, function (res) {
            log.debug("resent!");
        }).$promise;

    }
};