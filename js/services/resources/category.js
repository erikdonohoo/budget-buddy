angular.module("BudgetBuddy").factory("Categories", function($resource, URL) {
	return $resource(URL + 'classes/Category/:objectId', 
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