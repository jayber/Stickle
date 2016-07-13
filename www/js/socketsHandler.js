var socketHandler = {

    getUrl: function () {
        return 'ws://' + context.serverUrl + "/api/ws";
    },

    logAndApply: function (msg, func, model, data) {
        if (noLog.indexOf(msg)===-1) {
            log.trace(msg + ": " + JSON.stringify(data));
        }
        model.$apply(func);
    },

    authenticate: function () {
        log.debug("authenticating");
        socketHandler.ws.emit("authenticate", {
            userId: window.localStorage.getItem(userHandler.userIdKey),
            pushRegistrationId: window.localStorage.getItem(userHandler.pushRegistrationIdKey)
        });
    },

    checkContactStatuses: function (model) {
        model.contacts.forEach(function (contact, index) {
            socketHandler.ws.emit("checkContactStatus", {phoneNum: contact.phoneNumbers[0].canonical});
        });
    },

    checkStickleStates: function (model) {
        log.debug("checking stickle states");
        for (var key in model.stickles) {
            log.debug("check-state: " + JSON.stringify(model.stickles[key]));
            socketHandler.ws.emit("check-state", {
                phoneNum: model.stickles[key].phoneNumbers[0].canonical,
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
        this.messageBuffer = [];

        this.purgeBufferedMessages = function () {
            if (this.messageBuffer.length > 0) {
                log.debug("ws purging: "+this.messageBuffer.length+" messages");
                while (message = this.messageBuffer.pop()) {
                    this.ws.send(message);
                }
            }
        };

        this.emit = function (event, data) {
            var output = JSON.stringify({"event": event, "data": data});
            log.trace("ws emitting! " + output);
            if (this.ws.readyState !== 1) {
                this.messageBuffer.push(output);
            } else {
                this.ws.send(output);
            }
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
                socketHandler.checkContactStatuses(model)
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

            switch (msg.event) { //first 2, or 3, cases really just the same thing?
                case "stickled":
                    socketHandler.logAndApply("stickled", function () {
                        var contact = contactsHandler.getOrCreateContact(model, data.from, data.displayName);
                        contactsHandler.setContactStatusAndDisplay(contact, data.status, model, true);
                        context.playSound(model);
                    }, model, data);
                    break;
                case "stickle-responded":
                    socketHandler.logAndApply("stickle-responded", function () {
                        var contact = model.contactsMap[data.from];
                        contactsHandler.setContactStatusAndDisplay(contact, data.status, model, false);
                    }, model, data);
                    context.playSound(model);
                    break;
                case "state":
                    socketHandler.logAndApply("state", function () {
                        var inbound = (data.recipient === telephone.canonicalize(window.localStorage.getItem(userHandler.phoneNumberKey)));
                        var contact;
                        if (inbound) {
                            log.debug("trying to update state for: "+data.originator);
                            contact = contactsHandler.getOrCreateContact(model, data.originator, data.originatorDisplayName);
                        } else {
                            contact = model.contactsMap[data.recipient];
                            contact.stickled = true;
                        }
                        contactsHandler.setContactStatusAndDisplay(contact, data.state, model, inbound);
                        if (inbound || data.state == "accepted") {
                            //might always be a bad idea, if needed, done by push-notification?
                            //context.playSound(model);
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

                    socketHandler.checkContactStatuses(model);
                    socketHandler.checkStickleStates(model);
                    socketHandler.ws.purgeBufferedMessages();
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