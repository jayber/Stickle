var context = {
    serverUrl: "192.168.0.3",

    toggleSoundsAction: function (off) {
        if (off) {
            log.debug("turning sounds off");
            window.localStorage.setItem("soundsOff", true);
            setTimeout(function () {
                uIHandler.showPopover(model, "Sounds off.");
            }, 100);
        } else {
            log.debug("turning sounds on");
            window.localStorage.setItem("soundsOff", false);
            setTimeout(function () {
                uIHandler.showPopover(model, "Sounds on.");
            }, 100);
        }
    },

    addEventListeners: function (model, $interval, $ionicSideMenuDelegate) {
        document.addEventListener("touchstart", function () {
        }, true);

        document.addEventListener("resume", function () {
            log.debug("resuming");
            socketHandler.startSockets(model, $interval, $ionicSideMenuDelegate);
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
            alert(message);
        });
    },

    playSound: function (model) {
        if (!(model.sounds.off || model.sounds.timeout)) {
            model.sounds.timeout = true;
            setTimeout(function () {
                model.sounds.timeout = false;
            }, 5000);
            navigator.notification.beep(1);
        }
    }
};