PlayerStatusParser = function(thread){
    this.inPlayers = [];
    this.maybePlayers = [];
    this.outPlayers = [];
    this.unknownPlayers = [];

    var replyMessages = ArrayUtil.filter(thread.getMessages(), function(message){
        return message.getFrom().indexOf(MailSender.getNameUsedForSending()) === -1;
    });
    ArrayUtil.forEach(replyMessages, function(message){
        var fromParts = this._parseFromString(message.getFrom());

        var person = Database.hydrateBy(Person, ['email', fromParts.email]) || new Person(fromParts.email);
        if(!person.firstName || !person.lastName){
            person.firstName = fromParts.firstName;
            person.lastName = fromParts.lastName;
            Database.persist(Person, person);
        }

        this._parseInStatus(message, person);
    }, this);
};

PlayerStatusParser.prototype._parseInStatus = function(message, person){
    var words = ArrayUtil.reduce(message.getPlainBody().split('\n'), function(allWords, line) {
        return line[0] === '>' ? allWords : allWords.concat(ArrayUtil.compact(line.trim().split(' ')));
    }, []);

    if(words.length === 0){
        this.inPlayers.push(person);
        return;
    }

    var statusKnown = ArrayUtil.any(words, function(word){
        if (/^(in|yes|yep|yea|yeah|yay)\W*$/i.test(word)) {
            this.inPlayers.push(person);
            return true;
        } else if (/^(maybe|50\W?50)\W*$/i.test(word)) {
            this.maybePlayers.push(person);
            return true;
        } else if (/^out\W*$/i.test(word)) {
            this.outPlayers.push(person);
            this.inPlayers = ArrayUtil.filter(this.inPlayers, function(inPlayer) {
                return inPlayer.guid !== person.guid;
            });
            return true;
        }
    }, this);
    if(!statusKnown){
        this.unknownPlayers.push(person);
    }
};

PlayerStatusParser.prototype._parseFromString = function(fromString){
    var parts = fromString.split(' ');

    var parsed = {firstName: parts[0]};
    ArrayUtil.remove(parts, parsed.firstName);

    if(parts.length > 1) {
        var emailPart = parts[parts.length - 1];
        parsed.email = emailPart.replace(/[<>]/g, '');
        ArrayUtil.remove(parts, emailPart);
    }

    parsed.lastName = parts.join(' ');

    return parsed;
};
