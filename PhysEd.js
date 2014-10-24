PhysEd = function(){};

PhysEd.TIMES_PER_SPORT_BEFORE_SWITCHING = 2;

PhysEd.prototype.notifyPhysEd = function(){
    var sport = this._determinePhysEdSport(Database.hydrateAllBy(Sport, ['isInPhysEdRotation', 1]));
    InBasedThread.sendInitialEmail(sport.name, 'Tomorrow', sport);

    sport.physEdCount += 1;
    Database.persist(Sport, sport);
};

PhysEd.prototype._determinePhysEdSport = function(physEdSports){
    var lowestSport;
    var lowest = Infinity;
    for(var i = 0; i < physEdSports.length; i++){
        var sport = physEdSports[i];
        var sportInProgress = sport.physEdCount % PhysEd.TIMES_PER_SPORT_BEFORE_SWITCHING !== 0;
        if(sportInProgress){
            return sport;
        }

        if(sport.physEdCount < lowest){
            lowest = sport.physEdCount;
            lowestSport = sport;
        }
    }

    return lowestSport;
};