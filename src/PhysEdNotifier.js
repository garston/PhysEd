PhysEd.PhysEdNotifier = function(){};

PhysEd.PhysEdNotifier.TIMES_PER_SPORT_BEFORE_SWITCHING = 2;

PhysEd.PhysEdNotifier.prototype.notifyPhysEd = function(){
    var sport = this._determinePhysEdSport();
    PhysEd.InBasedThread.sendInitialEmails(sport.name, 'Tomorrow');

    sport.physEdCount += 1;
    GASton.Database.persist(PhysEd.Sport, sport);
};

PhysEd.PhysEdNotifier.prototype._determinePhysEdSport = function(){
    var physEdSports = GASton.Database.hydrateAllBy(PhysEd.Sport, ['isInPhysEdRotation', 1]);
    return this._findInProgressSport(physEdSports) || this._findLowestSport(physEdSports);
};

PhysEd.PhysEdNotifier.prototype._findInProgressSport = function(physEdSports) {
    return JSUtil.ArrayUtil.find(physEdSports, function(sport){
        return sport.physEdCount % PhysEd.PhysEdNotifier.TIMES_PER_SPORT_BEFORE_SWITCHING !== 0;
    });
};

PhysEd.PhysEdNotifier.prototype._findLowestSport = function(physEdSports) {
    return physEdSports.reduce(function(lowestSport, sport){
        return sport.physEdCount < lowestSport.physEdCount ? sport : lowestSport;
    });
};
