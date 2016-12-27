GTxt.MonkeyInTheMiddle = {};
GTxt.MonkeyInTheMiddle.SEPARATOR = '|';

GTxt.MonkeyInTheMiddle.forwardTexts = function(config) {
    GmailApp.search('from:' + GASton.Voice.DOMAIN + ' in:inbox is:unread subject:' + GASton.Voice.SUBJECT).
        map(function(thread){ return GASton.Mail.getMessagesAfterLatestMessageSentByUs(thread).filter(function(message){ return message.isInInbox() && message.isUnread(); }); }).
        filter(function(messages){ return messages.length; }).
        forEach(function(messages){
            var fromNumber = GASton.Voice.parseFromTxt(messages[0]).number;
            var messageBodies = messages.map(function(message){ return GASton.Mail.getMessageWords(message).join(' '); });

            if(fromNumber === config.getPhysicalPhoneContact().number){
                messages.forEach(function(message, index){ this._txtContact(message, messageBodies[index], config); }, this);
            }else{
                this._sendTxt(JSUtil.ArrayUtil.last(messages), [fromNumber].concat(messageBodies).join(this.SEPARATOR), config.getPhysicalPhoneContact(), config);
            }
        }, this);
};

GTxt.MonkeyInTheMiddle._sendTxt = function(message, text, contact, config) {
    GASton.Voice.forwardTxt(message, text, config.gvNumber, contact.number, contact.gvKey);
};

GTxt.MonkeyInTheMiddle._txtContact = function(message, messageBody, config) {
    var messageParts = messageBody.split(this.SEPARATOR);
    var contact = GASton.Database.findBy(GTxt.Contact, 'number', parseInt(messageParts[0]));
    if(contact){
        this._sendTxt(message, messageParts[1], contact, config);
    }else{
        this._sendTxt(message, 'Cannot find contact with number ' + messageParts[0], config.getPhysicalPhoneContact(), config);
    }
};
