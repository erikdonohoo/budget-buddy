angular.module("BudgetBuddy").filter('categorySearch', function(){
	return function(expenses, category) {
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
angular.module("BudgetBuddy").filter('categoryMatch', function(){
	return function(cat, cats) {

		for (var i = cats.length - 1; i >= 0; i--) {
			var e = cats[i];
			if (e.objectId == cat.objectId)
				return e.objectId;
		};

		return null;
	}
});