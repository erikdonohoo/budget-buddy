angular.module("BudgetBuddy").factory("Expenses", function($resource, URL) {
	return $resource(URL + 'classes/Expense/:objectId', 
	{
		'objectId': '@objectId'
	},
	{
		'query': {
			'method': 'GET',
			'isArray': true,
			'transformResponse': function (data) { return angular.fromJson(data).results; }
		}
	})
})