import Ember from 'ember';

export default Ember.ObjectController.extend({
    running: function() {
        return this.get('model.id') == 2;
    }.property('model.id'),
    lastRunError: function() {
        return this.get('model.id') == 3;
    }.property('model.id'),
    recurrence: function() {
        var o = RRule.parseString(this.get('model.rrule'));
        o.dtstart = this.get('model.startsAt');
        //console.dir(o);
        var rule = new RRule(o);
        //var rule = RRule.fromString(this.get('model.rrule'));
        //console.dir(rule);
        var now = new Date();
        return {
            text: rule.toText(),
            lastRun: rule.before(now, true),
            nextRun: rule.after(now, true)
        };
    }.property('model.rrule', 'model.startsAt')
});