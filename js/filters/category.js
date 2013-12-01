angular.module("BudgetBuddy").filter('categoryFilter', function(Categories){
	var cat = Categories.query();
	return function(obj) {
		for (var i = cat.length - 1; i >= 0; i--) {
			var c = cat[i];
			if (c.objectId == obj.objectId)
				return c.title;
		};

		return null;
	}
});