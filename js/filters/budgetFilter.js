angular.module("BudgetBuddy").filter('budgetFilter', function(){
	return function(cat, budgets) {
		var list = [];
		for (var i = cat.length - 1; i >= 0; i--) {
			var c = cat[i];
			var match = false;
			for (var j = budgets.length - 1; j >= 0; j--) {
				var b = budgets[j];
				if (b.category.objectId == c.objectId)
					match = true;
			};
			if (!match)
				list.push(c);
		};
		return list;
	}
});