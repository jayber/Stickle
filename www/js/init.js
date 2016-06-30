function initLog() {
    log.removeAllAppenders();
    var appender = new log4javascript.InPageAppender("errors", true);
    appender.setHeight("100px");
    appender.setShowCommandLine(false);
    log.addAppender(appender);
    appender.addEventListener("load", function () {
        // Find appender's iframe element
        var iframes = document.getElementsByTagName("iframe");
        for (var i = 0, len = iframes.length; i < len; ++i) {
            if (iframes[i].id.indexOf("_InPageAppender_") > -1) {
                iframeDoc = iframes[i].contentDocument || iframes[i].contentWindow.document;
                iframeDoc.getElementById("switchesContainer").style.display = "none";
                iframeDoc.getElementById("commandLine").style.display = "none";
            }
        }
    });
}

function errorHandler(func) {
    try {
        func();
    } catch (err) {
        log.error("Error", err);
    }
}

angular.module('stickle', ['ionic', 'ngResource', 'ngAnimate'])
    .controller('stickleCtrl', function ($scope, $ionicPopup, $resource, $interval, $ionicSideMenuDelegate, $ionicModal, $ionicPopover) {
        ionic.Platform.ready(function () {
            errorHandler(function () {
                initLog();
                polyFillMobileAPIs();
                setupHandler.setUpTurnSoundsOff($scope);
                context.addEventListeners($scope, $interval, $ionicSideMenuDelegate);
                context.checkDetails($scope, $ionicSideMenuDelegate);
                contactsHandler.populateContacts($scope, $resource)
                    .done(function () {
                        try {
                            socketHandler.startSockets($scope, $interval, $ionicSideMenuDelegate);
                        } catch (err) {
                            log.error("Error - ", err, err.stack);
                        }
                    });

                setupHandler.setUpDetailsAndRegistration($scope, $ionicSideMenuDelegate, $resource, $interval);
                setupHandler.setUpActions($scope);
                setupHandler.setUpShowDebug($scope);
                setupHandler.setUpFeedback($scope, $ionicModal, $resource);
                setupHandler.setUpPopover($scope, $ionicPopover);
                setupHandler.setUpFilter($scope);
            });
        });
    }).directive('stkincluder', function () {
        return {
            transclude: true,
            templateUrl: function (tE, eA) {
                return eA.src;
            },
            link: function () {
                uIHandler.toggleLog(window.localStorage.getItem("debug") == "true");
            }
        }
    });
