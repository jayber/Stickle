var context = {
/*
    serverUrl: "192.168.0.4",
    resourceLocation: 'http://:server/api',
    webSocketPrefix: 'ws://',
*/

    serverUrl: "api.stickle.co",
    resourceLocation: 'https://:server/api',
    webSocketPrefix: 'wss://',

    webSocketLocation: function() {
        return context.webSocketPrefix + context.serverUrl + "/api";
    },

    toggleSoundsAction: function (model) {
        return function (off) {
            if (off) {
                log.debug("turning sounds off");
                window.localStorage.setItem("soundsOff", true);
                setTimeout(function () {
                    userInterfaceHandler.showPopover(model, "Sounds off.");
                }, 100);
            } else {
                log.debug("turning sounds on");
                window.localStorage.setItem("soundsOff", false);
                setTimeout(function () {
                    userInterfaceHandler.showPopover(model, "Sounds on.");
                }, 100);
            }
        }
    },

    addEventListeners: function (model, $interval, $ionicSideMenuDelegate, $ionicScrollDelegate, $ionicModal) {
        document.addEventListener("touchstart", function () {
        }, true);

        document.addEventListener("offline", function() {
            model.connectionWarn.modal.show();
        }, false);

        document.addEventListener("online", function() {
            model.connectionWarn.modal.hide();
        }, false);

        document.addEventListener("resume", function () {
            log.debug("resuming");
            pushNotificationHandler.init();
            socketHandler.startSockets(model, $interval, $ionicSideMenuDelegate, $ionicScrollDelegate);
            setupHandler.setUpConnectionWarn(model,$ionicModal);
        }, false);

        document.addEventListener("pause", function () {
            log.debug("paused");
            socketHandler.ws.close();
        }, false);

        window.addEventListener('error', function (e) {
            var stack = e.error.stack;
            var message = e.error.toString();
            if (stack) {
                message += '\n' + stack;
            }
            log.error(message);
        });
    },

    playSound: function (model) {
        //do nothing - sound in app may be unnecessary, but isn't working anyway

        /*if (!(model.sounds.off || model.sounds.timeout)) {
            model.sounds.timeout = true;
            setTimeout(function () {
                model.sounds.timeout = false;
            }, 5000);
            navigator.notification.beep(1);
        }*/
    }
};