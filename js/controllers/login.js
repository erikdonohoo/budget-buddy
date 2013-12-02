angular.module("BudgetBuddy").controller('LoginCtrl', function($scope, User, $location){
	
	// If alredy logged in, go to overview
	if (User.getCurrentUser()) {
		$location.path('/overview');
	}
	
	$scope.user = {};
	$scope.model = {};
	$scope.model.signUp = false;
	$scope.toggleSignUp = function() {
		$scope.model.signUp = !$scope.model.signUp;
	}
	$scope.signIn = function() {
		$scope.user.loading = true;
		User.signIn($scope.user,
			function(user){
				// Go to overview
				$location.path('/overview');
				$scope.user.loading = false;
			}, function(user, err) {
				console.log("error");
				$scope.user = {};
				console.log(user, err);
				$scope.user.message = err.message;
		});
	}

	$scope.signUp = function() {
		var user = new Parse.User();
		user.set('username', $scope.user.email);
		user.set('password', $scope.user.password);
		user.set('email', $scope.user.email);

		$scope.user.loading = true;
		User.signUp($scope.user,
			function(user) {
				$location.path('/overview');
				$scope.user.loading = false;
			},
			function(user, err) {
				console.log("error");
				$scope.user = {};
				$scope.user.message = err.message;
			
		})
	}
});