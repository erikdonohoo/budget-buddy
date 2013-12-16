angular.module("BudgetBuddy").controller('OverviewCtrl', function($scope, $location, DateHelp){
	
	$scope.lMonth = DateHelp.getFirstDayOfPreviousMonth();
	$scope.now = new Date();
	$scope.nMonth = DateHelp.getFirstDayOfNextMonth();

	var model = {};
	$scope.visitBudget = function() {
		$location.path('/budgets/choose/' + model.dateString);
	}

	$scope.model = model;

});