angular.module("BudgetBuddy").controller('OverviewCtrl', function($scope, QuickBudget, DateHelp){
	
	// Get budgets
	var thisMonth = QuickBudget.thisMonth();
	var lastMonth = QuickBudget.lastMonth();
	var nextMonth = QuickBudget.nextMonth();

	$scope.lMonth = DateHelp.getFirstDayOfPreviousMonth();
	$scope.now = new Date();
	$scope.nMonth = DateHelp.getFirstDayOfNextMonth();
});