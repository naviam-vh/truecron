import Ember from 'ember';

export default Ember.Route.extend({
	model: function(params) {
		var job = this.modelFor('dashboard.organization.workspace.tasks');
		console.dir('model for tasks.index : ' + job);
	    return job.get('rrule');
	}
});
