var socketHandler = {
    getUrl: function () {
        return 'ws://' + context.serverUrl + "/api/ws";
    },

    logAndApply: function (msg, func, model, data) {
        log.trace(msg + ": " + JSON.stringify(data));
        model.$apply(function () {
            try {
                func();
            } catch (err) {
                log.error("Error", err.stack);
            }
        });
    },

    authenticate: function () {
        log.debug("authenticating");
        socketHandler.ws.emit("authenticate", {userId: window.localStorage.getItem(userHandler.userIdKey)});
    },

    checkStatuses: function (model) {
        model.contacts.forEach(function (contact, index) {
            socketHandler.ws.emit("checkContactStatus", {phoneNum: contact.phoneNumbers[0].value});
        });
    },

    checkStickleStates: function (model) {
        log.debug("checking stickle states");
        for (var key in model.stickles) {
            log.debug("check-state: " + JSON.stringify(model.stickles[key]));
            socketHandler.ws.emit("check-state", {
                phoneNum: model.stickles[key].phoneNumbers[0].value,
                inbound: model.stickles[key].inbound
            });
        }
    },

    startSockets: function (model, $interval, $ionicSideMenuDelegate) {
        if (socketHandler.ws != undefined) {
            socketHandler.ws.close();
        }
        socketHandler.ws = new socketHandler.StickleWebSocket(socketHandler.getUrl(), model, $ionicSideMenuDelegate, $interval);
    },

    StickleWebSocket: function (url, model, $ionicSideMenuDelegate, $interval) {
        this.url = url;
        this.ws = new WebSocket(url);

        this.emit = function (event, data) {
            var output = JSON.stringify({"event": event, "data": data});
            log.trace("ws emitting! " + output);
            this.ws.send(output);
        };

        this.close = function () {
            this.ws.onclose = function () {
                log.debug("ws closed - not reopening");
                $interval.cancel(socketHandler.checkStatusPromise);
            };
            this.ws.close();
        };

        this.ws.onopen = function () {
            log.debug("ws open!");
            context.checkStatusPromise = $interval(function () {
                socketHandler.checkStatuses(model)
            }, 60 * 60 * 1000);

            socketHandler.authenticate();
        };

        this.ws.onclose = function () {
            log.debug("ws closed! - trying to reopen");
            setTimeout(function () {
                try {
                    socketHandler.startSockets(model, $interval, $ionicSideMenuDelegate)
                } catch (err) {
                    log.error("Error - ", err, err.stack);
                }
            }, 5000);
        };

        this.ws.onerror = function (error) {
            log.error("ws errored!");
        };

        this.ws.onmessage = function (event) {
            var msg = JSON.parse(event.data);
            var data = msg.data;

            switch (msg.event) { //first 3, or 4, events really just the same thing?
                case "stickled":
                    socketHandler.logAndApply("stickled", function () {
                        var contact = context.getOrCreateContact(model, data.from, data.displayName);
                        context.setContactStatusAndDisplay(contact, data.status, model, true);
                        context.playSound(model);
                    }, model, data);
                    break;
                case "stickle-responded":
                    socketHandler.logAndApply("stickle-responded", function () {
                        var contact = model.contactsMap[data.from];
                        context.setContactStatusAndDisplay(contact, data.status, model, false);
                    }, model, data);
                    context.playSound(model);
                    break;
                case "state":
                    socketHandler.logAndApply("state", function () {
                        var inbound = (data.recipient === window.localStorage.getItem(userHandler.phoneNumberKey));
                        var contact;
                        if (inbound) {
                            contact = context.getOrCreateContact(model, data.originator, data.originatorDisplayName);
                        } else {
                            contact = model.contactsMap[data.recipient];
                            contact.stickled = true;
                        }
                        context.setContactStatusAndDisplay(contact, data.state, model, inbound);
                        if (inbound || data.state == "accepted") {
                            context.playSound(model);
                        }
                    }, model, data);
                    break;
                case "contactStatus":
                    socketHandler.logAndApply("contactStatus", function () {
                        if (data.status === "registered") {
                            model.contactsMap[data.phoneNum].stickler = true;
                        }
                    }, model, data);
                    break;
                case "authenticated":
                    log.debug("authenticated");

                    socketHandler.checkStatuses(model);

                    socketHandler.checkStickleStates(model);
                    break;
                case "authentication-failed":
                    log.debug("authentication-failed");

                    model.generalError = "Authentication failed, please register again.";
                    $ionicSideMenuDelegate.toggleLeft(true);
                    break;
            }
        }
    }
};