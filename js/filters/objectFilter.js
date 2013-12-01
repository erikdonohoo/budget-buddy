
angular.module('BudgetBuddy').filter('objectFilter', ['$filter', function($filter) {
	return function(list, query) {
		if(!query)
			return list;
		if(query['$'] != null)
			query = query['$'];

		var queries = query.split(" ");

		var newlist = list.slice(0);
		for (var i = queries.length - 1; i >= 0; i--) {
			var results = $filter('filter')(list,queries[i]);
			for (var j = newlist.length - 1; j >= 0; j--) {
				if(!~results.indexOf(newlist[j])) {
					newlist.splice(j,1);
				}
			}
		}

		return newlist;
	};
}]);