import Ember from 'ember';
import LoginControllerMixin from 'simple-auth/mixins/login-controller-mixin';
// curl -u "-2:Igd7en1_VCMP59pBpmEF" -H "Content-Type:application/x-www-form-urlencoded" --data "grant_type=http://google.com&username=system@truecron.com" http://dev.truecron.com:3000/oauth/token

export default Ember.Controller.extend(LoginControllerMixin, {
	authenticator: 'authenticator:truecron',
	invitationEmail: '',
	isInvitationEmailError: false,
	isInviteEmailError: function() {
		return this.get('isInvitationEmailError');
	}.property('isInvitationEmailError'),
    //authenticator: 'simple-auth-authenticator:oauth2-password-grant',
    actions: { 
	  	authenticate: function(options) {
	  		console.dir(options);
	  		this._super(options);
	  	},
	  	invite: function() {
	  		var inviteEmail = this.get('invitationEmail');
	  		if (inviteEmail == '') {
	  			console.log('email is empty');
	  			this.set('isInvitationEmailError', true);
	  			console.log(this.get('isInvitationEmailError'));
	  		} else {
	  			var result = Ember.$.ajax('http://dev.truecron.com:3000/beta/signup', { type: 'POST'});
	  			result.success(function(data) { console.log(data)});
	  			result.error(function(error) { console.log(error)});
	  		}
	  	} 
    }
});