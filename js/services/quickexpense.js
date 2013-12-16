angular.module("BudgetBuddy").factory('QuickExpense', function(User, Expenses, DateHelp) {
	return {
		forMonth: function(date, cat, callback) {
			// Get budgets for set month
			var obj = {};
			obj.where = {};
			obj.where.date = {};
			obj.where.date['$gte'] = {};
			obj.where.date.$gte['__type'] = "Date";
			obj.where.date.$lte = {};
			obj.where.date.$lte['__type'] = "Date";
			obj.where.date['$gte'].iso = DateHelp.getFirstDayOfMonth(date).toISOString();
			obj.where.date['$lte'].iso = DateHelp.getLastDayOfMonth(date).toISOString();
			obj.where.user = {};
			obj.where.user['__type'] = "Pointer";
			obj.where.user.className = "_User";
			obj.where.user.objectId = User.getCurrentUser().id;
			if (cat)
				obj.where.category = cat;
			return Expenses.query({'where': JSON.stringify(obj.where)}, callback || angular.noop);
		},
		beforeMonth: function(date, cat, callback) {
			// Get expenses before given date
			var obj = {};
			obj.where = {};
			obj.where.date = {};
			obj.where.date.$lte = {};
			obj.where.date.$lte['__type'] = "Date";
			obj.where.date['$lte'].iso = DateHelp.getLastDayOfMonth(date).toISOString();
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