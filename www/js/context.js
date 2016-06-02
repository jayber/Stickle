var context = {
    serverUrl: "192.168.0.4",

    completeStickle: function(contact, model) {
        var status = "completed";
        socketHandler.ws.emit("stickle", {
            to: contact.phoneNumbers[0].value,
            status: status
        });
        context.setStatusAndDisplay(contact, status, model, false);
    },

    addEventListeners: function (model, $interval, $ionicSideMenuDelegate) {
        document.addEventListener("touchstart", function () {
        }, true);

        document.addEventListener("resume", function () {
            log.debug("resuming");
            try {
                socketHandler.startSockets(model, $interval, $ionicSideMenuDelegate);
            } catch (err) {
                log.error("Error - ", err, err.stack);
            }
        }, false);

        document.addEventListener("pause", function () {
            log.debug("paused");
            socketHandler.ws.close();
        }, false);
    },

    checkDetails: function ($scope, $ionicSideMenuDelegate) {
        const userId = window.localStorage.getItem(userHandler.userIdKey);
        if ((userId === null) || userId === "") {
            $scope.generalError = "Enter your name and telephone number to get started";
            $ionicSideMenuDelegate.toggleLeft(true);
        }
    },

    playSound: function (model) {
        if (!(model.sounds.off || model.sounds.timeout)) {
            model.sounds.timeout = true;
            setTimeout(function () {
                model.sounds.timeout = false;
            }, 5000);
            navigator.notification.beep(1);
        }
    },

    moveToTop: function (contact, model, key) {
        if (model.stickles[key] == null) {
            model.stickles[key] = contact;
            contact.hidden = true;
        }
    },

    removeFromTop: function (contact, model, key) {
        if (model.stickles[key] != null) {
            delete model.stickles[key];
            contact.hidden = false;
        }
    },

    setStatusAndDisplay: function (contact, status, model, inbound) {
        var key = (inbound ? "in" : "out") + contact.phoneNumbers[0].value;

        if (inbound) {
            var existingContact = model.stickles[key];
            if (existingContact != null) {
                contact = existingContact;
            }
        }

        if (status === "rejected" || status === "closed" || status === "completed") {
            contact.stickleStatus = null;
            contact.inbound = false;
            contact.stickled = false;
            context.removeFromTop(contact, model, key);
        } else {
            contact.inbound = inbound;
            contact.stickleStatus = status;
            context.moveToTop(contact, model, key);
        }

    },

    stickleResponseHandler: function (status, model) {
        return function (contact) {
            log.debug(status + ": " + contact.displayName + " - " + contact.phoneNumbers[0].value);
            try {
                socketHandler.ws.emit("stickle-response", {
                    origin: contact.phoneNumbers[0].value,
                    status: status
                });
                setupHandler.showPopover(model, status.charAt(0).toUpperCase() + status.substring(1).toLowerCase() + " stickle from \"" + contact.displayName + "\".");
                context.setStatusAndDisplay(contact, status, model, true);
            } catch (err) {
                setupHandler.showPopover(model, "Oops, there was an error. Please try again.");
            }
        }
    },

    stickleHandler: function (model) {
        return function (contact) {
            log.debug("stickling: " + contact.displayName + "; stickled: " + contact.stickled);
            var status = contact.stickled ? "open" : "closed";
            try {
                socketHandler.ws.emit("stickle", {
                    to: contact.phoneNumbers[0].value,
                    status: status
                });
                setupHandler.showPopover(model, "\"" + contact.displayName + "\" " + (contact.stickled ? "stickled" : "un-stickled") + ".");
            } catch (err) {
                setupHandler.showPopover(model, "Oops, there was an error. Please try again.");
                status = contact.stickled ? "closed" : "open";
            }
            context.setStatusAndDisplay(contact, status, model, false);
        }
    },

    getOrCreateContact: function (model, key, displayName) {
        var contact = model.contactsMap[key];
        if (contact == null) {
            contact = {
                phoneNumbers: [{type: "mobile", value: key}],
                displayName: displayName
            }
        }
        return contact;
    },

    errorReportFunc: function (err) {
        log.error("Error:" + err.status + " - " + err.statusText + "; " + err.data);
    }
};