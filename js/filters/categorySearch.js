angular.module("BudgetBuddy").filter('categorySearch', function(){
	return function(expenses, category) {
		console.log(expenses, category);
		var list = [];
		if (!category)
			return expenses

		for (var i = expenses.length - 1; i >= 0; i--) {
			var e = expenses[i];
			if (e.category.objectId == category.objectId)
				list.push(e);
		};

		return list;
	}
});