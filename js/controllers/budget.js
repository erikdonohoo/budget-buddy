angular.module("BudgetBuddy").controller('BudgetCtrl', function($q, $timeout, $location, $routeParams, $scope, $filter, User, QuickBudget, DateHelp, Categories, Budgets, QuickExpense, Income, Expenses, QuickIncome, FilterHelper){
	
	// Start showing budgets
	$scope.show = 'budgets';

	// Figure out month
	if ($routeParams.page == 'thismonth') {
		$scope.now = new Date();
	} else if ($routeParams.page == 'lastmonth') {
		$scope.now = DateHelp.getFirstDayOfPreviousMonth();
	} else if ($routeParams.page == 'nextmonth') {
		$scope.now = DateHelp.getFirstDayOfNextMonth();
	} else {
		$location.path('/overview');
	}

	// Info about months budget
	var month = {};
	month.totalBudgeted = 0;
	month.totalIncome = 0;
	$scope.firstDayOfMonth = DateHelp.getFirstDayOfMonth;
	$scope.lastDayOfMonth = DateHelp.getLastDayOfMonth;

	// Determine carryover
	var lastMonth = DateHelp.getFirstDayOfLastMonthWithDate($scope.now);
	QuickExpense.forMonth(lastMonth, null, function(expenses) {
		$scope.spentLastMonth = 0;
		for (var i = expenses.length - 1; i >= 0; i--) {
			$scope.spentLastMonth += expenses[i].amount;
		};
	});
	QuickIncome.forMonth(lastMonth, function(incomes) {
		$scope.incomeLastMonth = 0;
		for (var i = incomes.length - 1; i >= 0; i--) {
			$scope.incomeLastMonth += incomes[i].amount;
		};
	})
	var catDefer = $q.defer();
	$scope.categories = Categories.query(function(){
		catDefer.resolve();
	}); // Limit to unused categories

	function getIncome() {
		month.totalIncome = 0;
		$scope.incomes = QuickIncome.forMonth($scope.now, function(incomes) {
			for (var i = incomes.length - 1; i >= 0; i--) {
				var inc = incomes[i];
				month.totalIncome += inc.amount;
			};
		})
	}

	getIncome();
	

	// Get budgets
	$scope.loading = true;
	var thisMonth;
	function updateBudgets(animate) {

		$scope.budgets = QuickBudget.forMonth($scope.now, function(budgets){
			$scope.loading = false;
			calculateBudgetedAmount(animate);
		});
	}

	function calculateBudgetedAmount(animate) {

		
		if (animate) {
			$timeout(doCalculate, 50);
		} else {
			doCalculate();
		}
		
	}

	function doCalculate() {
		month.totalBudgeted = 0;
		for (var i = $scope.budgets.length - 1; i >= 0; i--) {
			var budget = $scope.budgets[i];
			budget.totalSpent = 0;
			month.totalBudgeted += budget.amount;

			// How much money spent in this budget?
			for (var j = $scope.expenses.length - 1; j >= 0; j--) {
				var expense = $scope.expenses[j];
				if (expense.category.objectId == budget.category.objectId) {
					budget.totalSpent += expense.amount;
				}
			};

			budget.amountSpent = budget.totalSpent / budget.amount;
			if (budget.amountSpent > 1)
				budget.amountSpent = 1;
			budget.amountSpent *= 100;
		};
	}

	function getExpenses() {
		month.totalSpent = 0;
		$scope.expenses = QuickExpense.forMonth($scope.now, null, function(){
			for (var i = $scope.expenses.length - 1; i >= 0; i--) {
				var e = $scope.expenses[i];
				month.totalSpent += e.amount;
				(function(exp){
					catDefer.promise.then(function(){
						exp.cat = $filter('categoryFilter')(exp.category, $scope.categories);
						exp.easyDate = $filter('date')(exp.date.iso, 'mediumDate');
					});
				})(e)
			};

			if (!$scope.budgets)
				updateBudgets(true);
		});
	}

	getExpenses();

	$scope.month = month;

	$scope.totalExpenses = function(expenses) {
		var total = 0;
		for (var i = expenses.length - 1; i >= 0; i--) {
			total += expenses[i].amount;
		};
		return total;
	}
	$scope.addCategory = function() {
		$scope.newCategory = {};
	}
	$scope.cancelCategory = function() {
		$scope.newCategory = null;
	}
	$scope.saveCategory = function() {

		Categories.save($scope.newCategory, function(){
			$scope.categories = Categories.query();
			$scope.cancelCategory();
		})
	}
	$scope.addBudget = function() {
		$scope.newBudget = {};
	}
	$scope.cancelNewBudget = function() {
		$scope.newBudget = null;
	}
	$scope.budgetCopy = {};
	$scope.editBudget = function(budget) {
		budget.edit = true;
		$scope.budgetCopy = angular.copy(budget);
	}
	$scope.saveBudget = function() {
		var user = {};
		var cat = {};
		var month = {};
		month['__type'] = "Date";
		month.iso = $scope.now.toISOString();
		user['__type'] = cat['__type'] = "Pointer";
		cat.objectId = $scope.newBudget.category.objectId;
		cat.className = "Category";
		user.objectId = User.getCurrentUser().id;
		user.className = "_User";
		$scope.newBudget.user = user;
		$scope.newBudget.category = cat;
		$scope.newBudget.month = month;
		Budgets.save($scope.newBudget, function() {
			// Add to list
			updateBudgets();
			$scope.newBudget = null;
		});
	}
	$scope.deleteBudget = function(budg) {
		if (confirm("Are you sure you want to delete this budget for " + $filter('categoryFilter')(budg.category, $scope.categories) + "?")) {
			budg.$delete(function() {
				updateBudgets();
			});
		}
	}
	$scope.updateBudget = function(budget) {
		budget.amount = $scope.budgetCopy.amount;
		Budgets.update({objectId: budget.objectId, amount: budget.amount}, function(){
			budget.edit = false;
			doCalculate();
		});
	}
	$scope.cancelExpense = function() {
		$scope.newExpense = null;
	}
	$scope.addExpense = function() {
		$scope.newExpense = {};
		$scope.newExpense.fakeDate = $filter('date')($scope.now, 'yyyy-MM-dd');
	}
	$scope.fixDate = function(expense) {
		var stuff = expense.fakeDate.split("-");
		expense.date = new Date(stuff[0], stuff[1]-1, stuff[2]);
	}
	$scope.deleteExpense = function(expense) {
		if (confirm("Are you sure you want to delete this expense? \n Amount: " + expense.amount +" \n Category: " + $filter('categoryFilter')(expense.category, $scope.categories) + "")) {
			expense.$delete(function(){
				getExpenses();
				updateBudgets();
			})
		}
	}
	$scope.saveExpense = function() {
		var user = {};
		var cat = {};
		var date = {};
		user['__type'] = cat['__type'] = "Pointer";
		cat.objectId = $scope.newExpense.category.objectId;
		cat.className = "Category";
		user.objectId = User.getCurrentUser().id;
		user.className = "_User";
		date['__type'] = "Date";
		date.iso = $scope.newExpense.date.toISOString();
		$scope.newExpense.date = date;
		$scope.newExpense.user = user;
		$scope.newExpense.category = cat;
		delete $scope.newExpense.fakeDate;
		Expenses.save($scope.newExpense, function(){
			$scope.cancelExpense();
			getExpenses();
			updateBudgets();
		})
	}
	$scope.validateDate = function(date) {
		// Is date between start and end date of month?
		var start = DateHelp.getFirstDayOfMonth($scope.now).getTime();
		var end = DateHelp.getLastDayOfMonth($scope.now).getTime();
		return (start <= date.getTime() && date.getTime() <= end);
	}
	$scope.addIncome = function() {
		$scope.newIncome = {};
		$scope.newIncome.fakeDate = $filter('date')($scope.now, 'yyyy-MM-dd');
	}
	$scope.cancelIncome = function() {
		$scope.newIncome = null;
	}
	$scope.deleteIncome = function(income) {
		income.$delete(function(){
			getIncome();
			updateBudgets();
		})
	}
	$scope.saveIncome = function() {
		var user = {};
		var date = {};
		user['__type'] = "Pointer";
		user.objectId = User.getCurrentUser().id;
		user.className = "_User";
		date['__type'] = "Date";
		date.iso = $scope.newIncome.date.toISOString();
		$scope.newIncome.date = date;
		$scope.newIncome.user = user;
		delete $scope.newIncome.fakeDate;
		Income.save($scope.newIncome, function(){
			$scope.cancelIncome();
			getIncome();
			updateBudgets();
		})
	}
});