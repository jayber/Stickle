log.removeAllAppenders();
BufferedAppender = function () {
    this.logBuffer = [];
    this.doAppend = function (logEvent) {
        bufferedAppender.logBuffer.push(logEvent);
    };
};
BufferedAppender.prototype = new log4javascript.Appender();
bufferedAppender = new BufferedAppender();
//log.addAppender(bufferedAppender);

function initLog() {
    if (typeof appender == 'undefined') {
        log.removeAppender(bufferedAppender);
        appender = new log4javascript.InPageAppender("errors", true, false);
        appender.setHeight("100px");
        appender.setShowCommandLine(false);
        log.addAppender(appender);
        appender.addEventListener("load", function () {
            // Find appender's iframe element
            var iframes = document.getElementsByTagName("iframe");
            for (var i = 0, len = iframes.length; i < len; ++i) {
                if (iframes[i].id.indexOf("_InPageAppender_") > -1) {
                    iframeDoc = iframes[i].contentDocument || iframes[i].contentWindow.document;
                    var switches = iframeDoc.getElementById("switchesContainer");
                    if (switches != null) {
                        switches.style.display = "none";
                    }
                    var commandLine = iframeDoc.getElementById("commandLine");
                    if (commandLine != null) {
                        commandLine.style.display = "none";
                    }
                }
            }
            if (bufferedAppender.logBuffer.length > 0) {
                log.debug("buffered log items: " + bufferedAppender.logBuffer.length + " {");
                for (i = 0; i < bufferedAppender.logBuffer.length; i++) {
                    appender.doAppend(bufferedAppender.logBuffer[i]);
                }
                log.debug("}");
            }
        });
    }
}

angular.module('stickle', ['ionic', 'ngResource', 'ngAnimate'])
    .controller('stickleCtrl', function ($scope, $ionicPopup, $resource, $interval, $ionicSideMenuDelegate, $ionicModal, $ionicPopover) {
        ionic.Platform.ready(function () {
            context.addEventListeners($scope, $interval, $ionicSideMenuDelegate);
            polyFillMobileAPIs();
            setupHandler.initModel($scope, $ionicSideMenuDelegate, $resource, $interval, $ionicModal, $ionicPopover);
            userHandler.checkDetails($scope, $ionicSideMenuDelegate);
            contactsHandler.populateContacts($scope, $resource)
                .done(function () {
                    socketHandler.startSockets($scope, $interval, $ionicSideMenuDelegate);
                    pushNotificationHandler.init();
                });

        });
    }).directive('stkincluder', function () {
        return {
            transclude: true,
            templateUrl: function (tE, eA) {
                return eA.src;
            },
            link: function () {
                initLog();
                uIHandler.toggleLog(window.localStorage.getItem("debug") == "true");
            }
        }
    });
