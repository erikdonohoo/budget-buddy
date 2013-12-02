angular.module("BudgetBuddy").controller('BudgetCtrl', function($timeout, $location, $routeParams, $scope, $filter, User, QuickBudget, DateHelp, Categories, Budgets, QuickExpense, Income, Expenses, QuickIncome, FilterHelper){
	
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

	function getExpenses() {
		$scope.expenses = QuickExpense.forMonth($scope.now, null, function(){
			for (var i = $scope.expenses.length - 1; i >= 0; i--) {
				var e = $scope.expenses[i];
				(function(exp){
					FilterHelper.defer.promise.then(function(){
						exp.cat = $filter('categoryFilter')(exp.category);
						exp.easyDate = $filter('date')(exp.date.iso, 'mediumDate');
					});
				})(e)
			};
		});
	}

	getExpenses();

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
	function updateBudgets() {

		thisMonth = QuickBudget.forMonth($scope.now, function(budgets){
			$scope.loading = false;
			calculateBudgetedAmount();
		});

		$scope.budgets = thisMonth;
	}

	function calculateBudgetedAmount() {

		month.totalBudgeted = 0;
		month.totalSpent = 0;
		for (var i = thisMonth.length - 1; i >= 0; i--) {
			var budget = thisMonth[i];
			month.totalBudgeted += budget.amount;

			// How much money spent in this budget?
			(function(b){
				b.expenses = QuickExpense.forMonth($scope.now, b.category, function(){
					b.totalSpent = 0;
					for (var i = b.expenses.length - 1; i >= 0; i--) {
						var expense = b.expenses[i];
						b.totalSpent += expense.amount;
					};
					month.totalSpent += b.totalSpent;
					b.amountSpent = b.totalSpent / b.amount;
					if (b.amountSpent > 1)
						b.amountSpent = 1;
					b.amountSpent *= 100;
				});
			})(budget);
		};
	}

	updateBudgets();

	$scope.month = month;
	$scope.categories = Categories.query(); // Limit to unused categories

	$scope.totalExpenses = function(expenses) {
		var total = 0;
		for (var i = expenses.length - 1; i >= 0; i--) {
			total += expenses[i].amount;
		};
		return total;
	}

	$scope.addBudget = function() {
		$scope.newBudget = {};
	}
	$scope.cancelNewBudget = function() {
		$scope.newBudget = null;
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
		if (confirm("Are you sure you want to delete this?")) {
			budg.$delete(function() {
				updateBudgets();
			});
		}
	}
	$scope.updateBudget = function(budget) {
		Budgets.update({objectId: budget.objectId, amount: budget.amount}, function(){
			budget.edit = false;
			calculateBudgetedAmount();
		});
	}
	$scope.cancelExpense = function() {
		$scope.newExpense = null;
	}
	$scope.addExpense = function() {
		$scope.newExpense = {};
	}
	$scope.fixDate = function(expense) {
		var stuff = expense.fakeDate.split("-");
		expense.date = new Date(stuff[0], stuff[1]-1, stuff[2]);
	}
	$scope.deleteExpense = function(expense) {
		if (confirm("Are you sure you want to delete this?")) {
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
		Expenses.save($scope.newExpense, function(){
			$scope.cancelExpense();
			getExpenses();
			$timeout(function(){calculateBudgetedAmount();});
		})
	}
	$scope.addIncome = function() {
		$scope.newIncome = {};
	}
	$scope.cancelIncome = function() {
		$scope.newIncome = null;
	}
	$scope.deleteIncome = function(income) {
		income.$delete(function(){
			getIncome();
			calculateBudgetedAmount();
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
		Income.save($scope.newIncome, function(){
			$scope.cancelIncome();
			getIncome();
			$timeout(function(){calculateBudgetedAmount();});
		})
	}
});