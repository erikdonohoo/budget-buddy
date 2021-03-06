angular.module("BudgetBuddy").factory("User", function($rootScope){
	var _user = null;
	return {
		setUser: function(user) {
			_user = user;
		},
		signIn: function(user, success, error) {
			var that = this;
			Parse.User.logIn(user.email, user.password, {
				success: function (user) {
					_user = user;
					success(user);
					$rootScope.$apply();
				},
				error: function (user,err) {
					if (error) {
						error(user,err);
						$rootScope.$apply();
					}
				}
			});
		},
		signUp: function(user, success, error) {
			var that = this;
			var pUser = new Parse.User();
			pUser.set('username', user.email);
			pUser.set('password', user.password);
			pUser.set('email', user.email);

			pUser.signUp(null, {
				success: function (user) {
					_user = user;
					success(user);
					$rootScope.$apply();
				},
				error: function (user,err) {
					if (error) {
						error(user,err);
						$rootScope.$apply();
					}
				}
			});
		},
		getCurrentUser: function() {
			return Parse.User.current();
		}
	}
})