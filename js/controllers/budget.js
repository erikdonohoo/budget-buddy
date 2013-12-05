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
	$scope.month = {};
	$scope.month.totalBudgeted = 0;
	$scope.month.totalIncome = 0;
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
	var catQuery = {};
	catQuery.user = {};
	catQuery.user['__type'] = 'Pointer'; catQuery.user.className = '_User'; catQuery.user.objectId = User.getCurrentUser().id;
	$scope.categories = Categories.query({'where': JSON.stringify(catQuery)}, function(){
		catDefer.resolve();
	}); // Limit to unused categories

	function getIncome() {
		$scope.incomes = QuickIncome.forMonth($scope.now, function(incomes) {
			calcIncome();
		})
	}

	function calcIncome() {
		$scope.month.totalIncome = 0;
		for (var i = $scope.incomes.length - 1; i >= 0; i--) {
			var inc = $scope.incomes[i];
			$scope.month.totalIncome += inc.amount;
		};
	}

	getIncome();
	

	// Get budgets
	$scope.loading = true;
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
		$scope.month.totalBudgeted = 0;
		for (var i = $scope.budgets.length - 1; i >= 0; i--) {
			var budget = $scope.budgets[i];
			budget.totalSpent = 0;
			$scope.month.totalBudgeted += budget.amount;

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
		$scope.month.totalSpent = 0;
		$scope.expenses = QuickExpense.forMonth($scope.now, null, function(){
			for (var i = $scope.expenses.length - 1; i >= 0; i--) {
				var e = $scope.expenses[i];
				$scope.month.totalSpent += e.amount;
				catDefer.promise.then(function(){
					e.cat = $filter('categoryFilter')(e.category, $scope.categories);
					e.easyDate = $filter('date')(e.date.iso, 'mediumDate');
				});
			};

			if (!$scope.budgets)
				updateBudgets(true);
		});
	}

	getExpenses();

	$scope.toggleCatFilter = function() {
		if (!$scope.month.filterByCategory)
			$scope.month.selectedCategory = null;
	}
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
		$scope.newCategory.user = catQuery.user;
		Categories.save($scope.newCategory, function(){
			$scope.categories = Categories.query({'where': JSON.stringify(catQuery)});
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
		Budgets.save($scope.newBudget, function(data) {
			// Add to list
			$scope.newBudget = Budgets.get({objectId: data.objectId}, function(){
				$scope.budgets.push($scope.newBudget);
				$scope.cancelNewBudget();
				updateBudgets();
			})
		});
	}
	$scope.showBudgetExpenses = function(budget) {
		budget.showExpenses = true;
		budget.expenses = [];
		for (var i = $scope.expenses.length - 1; i >= 0; i--) {
			var exp = $scope.expenses[i];
			if (exp.category.objectId == budget.category.objectId) {
				budget.expenses.push(exp);
			}
		};
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
		var amount = expense.amount;
		if (confirm("Are you sure you want to delete this expense? \n Amount: " + expense.amount +" \n Category: " + $filter('categoryFilter')(expense.category, $scope.categories) + "")) {
			expense.$delete(function(){
				$scope.month.totalSpent -= amount;
				$scope.expenses.splice($scope.expenses.indexOf(expense),1);
				updateBudgets();
			})
		}
	}
	$scope.saveExpense = function() {
		$scope.fixDate($scope.newExpense);
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
		Expenses.save($scope.newExpense, function(data){
			$scope.newExpense = Expenses.get({objectId: data.objectId}, function(){
				$scope.expenses.push($scope.newExpense);
				$scope.month.totalSpent += $scope.newExpense.amount;
				$scope.cancelExpense();
				updateBudgets();
			})
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
			$scope.incomes.splice($scope.incomes.indexOf($scope.income),1);
			calcIncome();
			updateBudgets();
		})
	}
	$scope.saveIncome = function() {
		$scope.fixDate($scope.newIncome);
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
		Income.save($scope.newIncome, function(data){
			$scope.newIncome = Income.get({objectId: data.objectId}, function(){
				$scope.incomes.push($scope.newIncome);
				$scope.cancelIncome();
				calcIncome();
				updateBudgets();
			})
		})
	}
});