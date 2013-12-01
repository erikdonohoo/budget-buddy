angular.module("BudgetBuddy").controller('NavCtrl', function($scope, User, $location) {

	$scope.$location = $location;
	$scope.$watch('$location.path()', function(newVal) {
		$scope.path = newVal;
	})
	
	$scope.logout = function() {
		Parse.User.logOut();
		$location.path('/');
		loggedIn = false;
	}

	$scope.loggedIn = function() {
		return User.getCurrentUser();
	}

	// Listen for bad route requests
	$scope.$on("$routeChangeError", function(e) {
		console.log("Route change error", e);
		$location.path('/');
	})
})