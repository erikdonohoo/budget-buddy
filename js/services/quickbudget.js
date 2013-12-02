angular.module("BudgetBuddy").factory('QuickBudget', function(User, Budgets, DateHelp) {
	return {
		thisMonth: function(callback) {
			// Get budgets for this month
			var obj = {};
			obj.where = {};
			obj.where.month = {};
			obj.where.month['$gte'] = {};
			obj.where.month.$gte['__type'] = "Date";
			obj.where.month.$gte.iso = DateHelp.getFirstDayOfMonth(new Date()).toISOString();
			obj.where.month.$lte = {};
			obj.where.month.$lte['__type'] = "Date";
			obj.where.month.$lte.iso = DateHelp.getLastDayOfMonth(new Date()).toISOString();
			obj.where.user = {};
			obj.where.user['__type'] = "Pointer";
			obj.where.user.className = "_User";
			obj.where.user.objectId = User.getCurrentUser().id;
			return Budgets.query({'where': JSON.stringify(obj.where)}, callback || angular.noop);
		},
		nextMonth: function(callback) {
			// Get budgets for next month
			var obj = {};
			obj.where = {};
			obj.where.month = {};
			obj.where.month['$gte'] = {};
			obj.where.month.$gte['__type'] = "Date";
			obj.where.month.$lte = {};
			obj.where.month.$lte['__type'] = "Date";
			obj.where.month.$gte.iso = DateHelp.getFirstDayOfMonth(DateHelp.getFirstDayOfNextMonth()).toISOString();
			obj.where.month.$lte.iso = DateHelp.getLastDayOfMonth(DateHelp.getFirstDayOfNextMonth()).toISOString();
			obj.where.user = {};
			obj.where.user['__type'] = "Pointer";
			obj.where.user.className = "_User";
			obj.where.user.objectId = User.getCurrentUser().id;
			return Budgets.query({'where': JSON.stringify(obj.where)}, callback || angular.noop);
		},
		lastMonth: function(callback) {
			// Get budgets for last month
			var obj = {};
			obj.where = {};
			obj.where.month = {};
			obj.where.month['$gte'] = {};
			obj.where.month.$gte['__type'] = "Date";
			obj.where.month.$lte = {};
			obj.where.month.$lte['__type'] = "Date";
			obj.where.month['$gte'].iso = DateHelp.getFirstDayOfMonth(DateHelp.getFirstDayOfPreviousMonth()).toISOString();
			obj.where.month['$lte'].iso = DateHelp.getLastDayOfMonth(DateHelp.getFirstDayOfPreviousMonth()).toISOString();
			obj.where.user = {};
			obj.where.user['__type'] = "Pointer";
			obj.where.user.className = "_User";
			obj.where.user.objectId = User.getCurrentUser().id;
			return Budgets.query({'where': JSON.stringify(obj.where)}, callback || angular.noop);
		}
	}
})