angular.module("BudgetBuddy").controller('LoginCtrl', function($scope, User, $location){
	
	$scope.user = {};
	$scope.signIn = function() {
		User.signIn($scope.user,
			function(user){
				// Go to overview
				$location.path('/overview');
			}, function(user, err) {
				console.log("error");
				$scope.user = {};
				$scope.user.message = "Invalid credentials, try again";
		});
	}

	// $scope.signUp = function() {
	// 	var user = new Parse.User();
	// 	user.set('username', $scope.user.email);
	// 	user.set('password', $scope.user.password);
	// 	user.set('email', $scope.user.email);

	// 	user.signUp(null, {
	// 		success: function(user) {
	// 			console.log(user);
	// 		},
	// 		error: function(user, err) {
	// 			console.log(user, err);
	// 		}
	// 	})
	// }
});