var app = angular.module("BudgetBuddy", ['ngRoute']);

// Resolution for logging in
var loggedIn =  {
	check: function(User, $q) {
		// Try to get from session
		var defer = $q.defer();
		var currentUser = User.getCurrentUser();
		if (currentUser) {
			User.setUser(currentUser);
			defer.resolve();
		} else {
			console.log("here");
			defer.reject("Not logged in");
		}

		return defer.promise;
	}
};

// Config routes 
app.config(function($routeProvider) {
	$routeProvider
		.when('/', {
			templateUrl: 'partials/login.html',
			controller: "LoginCtrl"
		})
		.when('/overview', {
			templateUrl: 'partials/overview.html',
			controller: "OverviewCtrl",
			resolve: loggedIn
		})
		.otherwise({redirectTo: '/'});
})