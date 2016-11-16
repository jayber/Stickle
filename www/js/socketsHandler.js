var socketHandler = {

    messageBuffer: [],

    getUrl: function () {
        return context.webSocketLocation() +"/ws";
    },

    logAndApply: function (msg, func, model, data) {
        if (noLog.indexOf(msg)===-1) {
            log.trace(msg + ": " + JSON.stringify(data));
        }
        model.$apply(func);
    },

    authenticate: function () {
        log.debug("authenticating");
        socketHandler.ws.emitNoBuffer("authenticate", {
            authId: window.localStorage.getItem(userHandler.authIdKey),
            pushRegistrationId: window.localStorage.getItem(userHandler.pushRegistrationIdKey)
        });
    },

    checkContactStatuses: function (model) {
        model.contacts.forEach(function (contact, index) {
            socketHandler.ws.emitNoBuffer("checkContactStatus", {phoneNum: contact.phoneNumbers[0].canonical});
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

    startSockets: function (model, $interval, $ionicSideMenuDelegate, $ionicScrollDelegate) {
        log.debug("starting sockets");
        if (socketHandler.ws != undefined) {
            socketHandler.ws.close();
        }
        socketHandler.ws = new socketHandler.StickleWebSocket(socketHandler.getUrl(), model, $ionicSideMenuDelegate, $interval, $ionicScrollDelegate);
    },

    StickleWebSocket: function (url, model, $ionicSideMenuDelegate, $interval, $ionicScrollDelegate) {
        this.url = url;
        this.ws = new WebSocket(url);

        this.purgeBufferedMessages = function () {
            log.debug("ws purging: "+socketHandler.messageBuffer.length+" messages");
            if (socketHandler.messageBuffer.length > 0) {
                while (message = socketHandler.messageBuffer.pop()) {
                    log.debug("purging message: "+ message);
                    this.emitNoBufferSimple(message);
                }
            }
        };

        this.packageToEmit= function (event, data) {
            return JSON.stringify({"event": event, "data": data});
        };

        this.emitNoBuffer = function(event, data) {
            var output = this.packageToEmit(event, data);
            this.emitNoBufferSimple(output);
        };

        this.emitNoBufferSimple = function (output) {
            log.trace("ws emitting! " + output);
            this.ws.send(output);
        };

        this.emit = function (event, data) {
            var output = this.packageToEmit(event, data);
            if (this.ws.readyState !== 1) {
                if (socketHandler.messageBuffer.length < 40) {
                    log.debug("ws not ready. buffering: " + output);
                    socketHandler.messageBuffer.unshift(output);
                } else {
                    log.error("WebService message-buffer full, cannot store more messages");
                }
            } else {
                this.emitNoBufferSimple(output);
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
                    socketHandler.startSockets(model, $interval, $ionicSideMenuDelegate, $ionicScrollDelegate)
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
                        contactsHandler.setContactStatusAndDisplay(contact, data.status, model, true, $ionicScrollDelegate);
                        context.playSound(model);
                    }, model, data);
                    break;
                case "stickle-responded":
                    socketHandler.logAndApply("stickle-responded", function () {
                        var contact = model.contactsMap[data.from];
                        contactsHandler.setContactStatusAndDisplay(contact, data.status, model, false, $ionicScrollDelegate);
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
                            if (contact) {
                                contact.stickled = true;
                            }
                        }
                        if (contact) {
                            contactsHandler.setContactStatusAndDisplay(contact, data.state, model, inbound, $ionicScrollDelegate);
                            if (inbound || data.state == "accepted") {
                                //might always be a bad idea, if needed, done by push-notification?
                                //context.playSound(model);
                            }
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

                    socketHandler.ws.purgeBufferedMessages();
                    socketHandler.checkStickleStates(model);
                    socketHandler.checkContactStatuses(model);
                    break;
                case "authentication-failed":
                    log.debug("authentication-failed");

                    model.generalError = "Authentication failed, please register again.";
                    userInterfaceHandler.logoutAction(model,$ionicSideMenuDelegate)();
                    $ionicSideMenuDelegate.toggleLeft(true);
                    break;
            }
        }
    }
};