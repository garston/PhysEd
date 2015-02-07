MailSender = {};

MailSender.forward = function(message, email, body) {
    message.forward(this._getEmail(email), this._getOptions(body, email));
};

MailSender.reply = function(thread, body){
    if(CONST.PROD_MODE) {
        thread.reply(body, this._getOptions(body, CONST.DEBUG_EMAIL));
    } else {
        this.send('test reply', body);
    }
};

MailSender.replyAll = function(thread, body, replyTo){
    if(CONST.PROD_MODE){
        thread.replyAll(body, this._getOptions(body, replyTo));
    }else{
        this.send('test replyAll', body);
    }
};

MailSender.send = function(subject, body, email){
    MailApp.sendEmail(this._getEmail(email), subject, this._getPlainBody(body), this._getOptions(body, email));
};

MailSender._getEmail = function(email){
    return CONST.PROD_MODE ? email : CONST.DEBUG_EMAIL;
};

MailSender._getOptions = function(body, email){
    return {
        bcc: CONST.DEBUG_EMAIL,
        htmlBody: body,
        name: CONST.PHYS_ED_NAME,
        replyTo: email
    };
};

MailSender._getPlainBody = function(body){
    return body.replace(/(<([^>]+)>)/ig, '');
};
