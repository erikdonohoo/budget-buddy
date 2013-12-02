var app = angular.module("BudgetBuddy", ['ngRoute', 'ngResource']);
app.value("URL", "https://api.parse.com/1/"); // Default URL

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
app.config(function($routeProvider, $httpProvider) {
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
		.when('/budgets/:page', {
			templateUrl: 'partials/budget.html',
			controller: "BudgetCtrl",
			resolve: loggedIn
		})
		.otherwise({redirectTo: '/'});

	// Set headers
	$httpProvider.defaults.headers.common['X-Parse-Application-Id'] = "Ilvxw1893T2VjzlrayOhvpvzryMpbzDWoPK6edxT";
	$httpProvider.defaults.headers.common['X-Parse-REST-API-Key'] = "0wggNB8EzSsk9XqCRPaYwloT4jOVdHGHEF1RXguQ";
})