angular.module("BudgetBuddy").factory('QuickExpense', function(User, Expenses, DateHelp) {
	return {
		thisMonth: function(cat, callback) {
			// Get budgets for this month
			var obj = {};
			obj.where = {};
			obj.where.date = {};
			obj.where.date['$gte'] = {};
			obj.where.date.$gte['__type'] = "Date";
			obj.where.date.$gte.iso = DateHelp.getFirstDayOfMonth(new Date()).toISOString();
			obj.where.date.$lte = {};
			obj.where.date.$lte['__type'] = "Date";
			obj.where.date.$lte.iso = DateHelp.getLastDayOfMonth(new Date()).toISOString();
			obj.where.user = {};
			obj.where.user['__type'] = "Pointer";
			obj.where.user.className = "_User";
			obj.where.user.objectId = User.getCurrentUser().id;
			if (cat)
				obj.where.category = cat;
			return Expenses.query({'where': JSON.stringify(obj.where)}, callback || angular.noop);
		},
		nextMonth: function(cat, callback) {
			// Get budgets for next month
			var obj = {};
			obj.where = {};
			obj.where.date = {};
			obj.where.date['$gte'] = {};
			obj.where.date.$gte['__type'] = "Date";
			obj.where.date.$lte = {};
			obj.where.date.$lte['__type'] = "Date";
			obj.where.date.$gte.iso = DateHelp.getFirstDayOfMonth(DateHelp.getFirstDayOfPreviousMonth()).toISOString();
			obj.where.date.$lte.iso = DateHelp.getLastDayOfMonth(DateHelp.getFirstDayOfPreviousMonth()).toISOString();
			obj.where.user = {};
			obj.where.user['__type'] = "Pointer";
			obj.where.user.className = "_User";
			obj.where.user.objectId = User.getCurrentUser().id;
			if (cat)
				obj.where.category = cat;
			return Expenses.query({'where': JSON.stringify(obj.where)}, callback || angular.noop);
		},
		lastMonth: function(cat, callback) {
			// Get budgets for last month
			var obj = {};
			obj.where = {};
			obj.where.date = {};
			obj.where.date['$gte'] = {};
			obj.where.date.$gte['__type'] = "Date";
			obj.where.date.$lte = {};
			obj.where.date.$lte['__type'] = "Date";
			obj.where.date['$gte'].iso = DateHelp.getFirstDayOfMonth(DateHelp.getFirstDayOfNextMonth()).toISOString();
			obj.where.date['$lte'].iso = DateHelp.getLastDayOfMonth(DateHelp.getFirstDayOfNextMonth()).toISOString();
			obj.where.user = {};
			obj.where.user['__type'] = "Pointer";
			obj.where.user.className = "_User";
			obj.where.user.objectId = User.getCurrentUser().id;
			if (cat)
				obj.where.category = cat;
			return Expenses.query({'where': JSON.stringify(obj.where)}, callback || angular.noop);
		}
	}
})