GTxt.Util = {};

GTxt.Util.mail = function(toEmail, body, derivedFromMsgs){
    GASton.Mail.sendToIndividual(Date.now().toString(), body, toEmail);
    derivedFromMsgs.forEach(function(m){ GASton.Mail.markRead(m); });
};

GTxt.Util.getThreadMessagesToForward = function(searchTerms) {
    return GmailApp.search(['in:inbox', 'is:unread'].concat(searchTerms).join(' ')).
        map(function(t){ return t.getMessages().filter(function(m){ return m.isInInbox() && m.isUnread(); }); }).
        filter(function(messages){ return messages.length; });
};
