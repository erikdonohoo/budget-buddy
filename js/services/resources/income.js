angular.module("BudgetBuddy").factory("Income", function($resource, URL) {
	return $resource(URL + 'classes/Income/:objectId', 
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