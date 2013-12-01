angular.module("BudgetBuddy").factory("Expenses", function($resource, URL) {
	return $resource(URL + 'classes/Expense/:id', 
	{
		'id': '@objectId'
	},
	{
		'query': {
			'method': 'GET',
			'isArray': true,
			'transformResponse': function (data) { return angular.fromJson(data).results; }
		}
	})
})