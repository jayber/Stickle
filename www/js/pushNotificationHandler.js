var pushNotificationHandler = {
    init: function () {
        log.debug("init push notification");
        var push = PushNotification.init({
            android: {
                senderID: "1080115958403"
            }
        });

        push.on('registration', function (data) {
            log.debug("Push registered: " + data.registrationId);
            window.localStorage.setItem(userHandler.pushRegistrationIdKey, data.registrationId);
        });
    }
};