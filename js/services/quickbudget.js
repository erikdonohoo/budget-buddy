angular.module("BudgetBuddy").factory('QuickBudget', function(User, Budgets, DateHelp) {
	return {
		forMonth: function(date, callback) {
			// Get budgets for set month
			var obj = {};
			obj.where = {};
			obj.where.month = {};
			obj.where.month['$gte'] = {};
			obj.where.month.$gte['__type'] = "Date";
			obj.where.month.$lte = {};
			obj.where.month.$lte['__type'] = "Date";
			obj.where.month['$gte'].iso = DateHelp.getFirstDayOfMonth(date).toISOString();
			obj.where.month['$lte'].iso = DateHelp.getLastDayOfMonth(date).toISOString();
			obj.where.user = {};
			obj.where.user['__type'] = "Pointer";
			obj.where.user.className = "_User";
			obj.where.user.objectId = User.getCurrentUser().id;
			return Budgets.query({'where': JSON.stringify(obj.where)}, callback || angular.noop);
		}
	}
})