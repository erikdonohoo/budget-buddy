angular.module("BudgetBuddy").factory('DateHelp', function() {

	return {
		getFirstDayOfPreviousMonth: function(d) {
			var date = d || new Date();
    		return new Date(date.getFullYear(), date.getMonth() - 1, 1);
		},
		getFirstDayOfLastMonthWithDate: function(date) {
			return new Date(date.getFullYear(), date.getMonth() - 1, 1);
		},
		getFirstDayOfMonth: function(date) {
			return new Date(date.getFullYear(), date.getMonth(), 1);
		},
		getLastDayOfMonth: function(date) {
			return new Date(date.getFullYear(), date.getMonth() + 1, 0);
		},
		getFirstDayOfNextMonth: function() {
			var D = new Date();
		    D.setMonth(D.getMonth()+1,1);
		    D.setHours(0, 0, 0, 0);
		    return D;
		}
	}
})