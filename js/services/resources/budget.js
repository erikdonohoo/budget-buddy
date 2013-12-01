angular.module("BudgetBuddy").factory("Budgets", function($resource, URL) {
	return $resource(URL + 'classes/Budget/:id', 
	{
		'id': '@objectId'
	},
	{
		'query': {
			'method': 'GET',
			'isArray': true,
			'transformResponse': function (data) { return angular.fromJson(data).results; }
		},
		'update': {
			'method': 'PUT'
		}
	})
})