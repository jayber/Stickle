var uIHandler = {

    toggleFilterAction: function ($scope) {
        return function () {
            $scope.contactFilter.show = !$scope.contactFilter.show;
            $scope.contactFilter.value = "";
            $scope.$broadcast('scroll.refreshComplete');
        }
    },

    createFeedbackModal: function ($scope, $ionicModal) {
        $ionicModal.fromTemplateUrl('templates/feedback.html', function (modal) {
            $scope.feedback.modal = modal;
        }, {
            scope: $scope,
            animation: 'slide-in-up'
        });
    },

    openFeedbackAction: function ($scope) {
        return function () {
            $scope.feedback.modal.show().then(function (modal) {
                $scope.feedback.fields = {};
            });
        };
    },

    closeFeedbackAction: function ($scope) {
        return function () {
            $scope.feedback.modal.hide();
        };
    },

    sendFeedbackAction: function ($scope, $resource) {
        return function (feedbackForm) {
            log.debug("sendFeedback");
            if (feedbackForm.$valid) {
                log.debug("valid");
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
                    $scope.feedback.modal.hide().then(uIHandler.showPopover($scope, "Feedback successfully sent."));
                    feedbackForm.$setPristine();
                    feedbackForm.$setUntouched();
                    log.debug("feedback saved!");
                }, context.errorReportFunc);
            }
        };
    },

    createPopover: function ($scope, $ionicPopover) {
        $ionicPopover.fromTemplateUrl('templates/popover.html', {
            scope: $scope
        }).then(function (popover) {
            $scope.popover = popover;
        });
    },

    showPopover: function ($scope, msg) {
        log.trace("popover?");
        $scope.popoverMsg = msg;
        $scope.popover.show($(".main")).then(function () {
            setTimeout(function () {
                $scope.popover.hide();
                log.trace("popover gone?");
            }, 2000)
        });
    },

    toggleLog: function (debug) {
        $("#errors").toggleClass('hidden', !debug);
        window.localStorage.setItem("debug", debug);
    }
};