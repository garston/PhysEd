GTxt.Voice = {};
GTxt.Voice.GROUP_TXT_SUBJECT = '"group message"';
GTxt.Voice.MISSED_CALL_SUBJECT = '"missed call"';
GTxt.Voice.NO_REPLY_EMAIL = 'voice-noreply@google.com';
GTxt.Voice.TXT_DOMAIN = 'txt.voice.google.com';
GTxt.Voice.TXT_SUBJECT = '"text message"';
GTxt.Voice.VOICEMAIL_SUBJECT = 'voicemail';

GTxt.Voice.getFirstNumberMentioned = function(str){
    return +JSUtil.StringUtil.matchSafe(str, /\((\d+)\) (\d+)-(\d+)/).slice(1).join('');
};

GTxt.Voice.getTxtEmail = function(contact, config) {
    return ['1' + config.gvNumber, (contact.number.toString().length === 10 ? '1' : '') + contact.number, contact.gvKey].join('.') + '@' + this.TXT_DOMAIN;
};

GTxt.Voice.getTxtLines = function(message, isEndOfTxtFn) {
    var lines = message.getPlainBody().split('\n').map(function(line){ return line.trim(); });
    const endOfTxtIndex = lines.findIndex(isEndOfTxtFn || (line =>
        line === 'To respond to this text message, reply to this email or visit Google Voice.' || line.startsWith('YOUR ACCOUNT ')));
    return endOfTxtIndex < 0 ? [] : lines.slice(2, endOfTxtIndex);
};

GTxt.Voice.parseFromTxt = function(message){
    var match = JSUtil.StringUtil.matchSafe(GASton.Mail.parseFrom(message).email, /^\d+\.1?(\d+)\.(.+)@/);
    return { gvKey: match[2], number: +match[1] };
};
