angular.module("BudgetBuddy").controller('BudgetCtrl', function($timeout, $scope, $filter, User, QuickBudget, Categories, Budgets, QuickExpense, Expenses, QuickIncome){
	
	// Start showing budgets
	$scope.show = 'budgets';

	// Info about months budget
	var month = {};
	month.totalBudgeted = 0;
	month.totalIncome = 0;

	function getExpenses() {
		$scope.expenses = QuickExpense.thisMonth(null, function(){
			for (var i = $scope.expenses.length - 1; i >= 0; i--) {
				var e = $scope.expenses[i];
				$timeout(function(){
					e.cat = $filter('categoryFilter')(e.category);
					e.easyDate = $filter('date')(e.date.iso, 'mediumDate');
				})
			};
		});
	}

	getExpenses();

	QuickIncome.thisMonth(function(incomes) {
		for (var i = incomes.length - 1; i >= 0; i--) {
			var inc = incomes[i];
			month.totalIncome += inc.amount;
		};
	})

	// Get budgets
	$scope.loading = true;
	var thisMonth;
	function updateBudgets() {

		thisMonth = QuickBudget.thisMonth(function(budgets){
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
				b.expenses = QuickExpense.thisMonth(b.category, function(){
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
	$scope.now = new Date();

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
		month.iso = new Date().toISOString();
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
		budg.$delete(function() {
			updateBudgets();
		});
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
		expense.$delete(function(){
			getExpenses();
			updateBudgets();
		})
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
			$timeout(function(){udpateBudgets();});
		})
	}
});