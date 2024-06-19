// Equivalent of smart_budget.py function
function computeSmartInitialBudget(data) {
  const df = data;

  const expenses = df.filter((d) => d.amount < 0);
  const income = df.filter((d) => d.amount > 0);

  const groupByMonth = (arr) => {
    return arr.reduce((acc, cur) => {
      const month = cur.date.slice(0, 7);
      if (!acc[month]) {
        acc[month] = 0;
      }
      acc[month] += cur.amount;
      return acc;
    }, {});
  };

  const monthlyExpenses = groupByMonth(expenses);
  const monthlyIncome = groupByMonth(income);

  const months = Object.keys(monthlyIncome)
    .concat(Object.keys(monthlyExpenses))
    .filter((value, index, self) => self.indexOf(value) === index)
    .sort();

  const monthlyDashboard = months.map((month) => {
    const totalIncome = monthlyIncome[month] || 0;
    const totalExpenses = monthlyExpenses[month] || 0;
    const netIncome = totalIncome + totalExpenses;
    return {
      Month: month,
      TotalIncome: totalIncome,
      TotalExpenses: totalExpenses,
      NetIncome: netIncome,
    };
  });

  const sortedExpenses = Object.values(monthlyExpenses)
    .map(Math.abs)
    .sort((a, b) => a - b);
  const secondLowestExpense = sortedExpenses[1];

  monthlyDashboard.forEach((d) => {
    d.PotentialIncome = d.TotalIncome - secondLowestExpense;
  });

  const accountBalance = monthlyDashboard.reduce(
    (acc, cur) => acc + cur.NetIncome,
    0
  );
  const potentialBalance = monthlyDashboard.reduce(
    (acc, cur) => acc + cur.PotentialIncome,
    0
  );

  const potentialSavings = potentialBalance - accountBalance;
  const potentialSavingsYearly =
    Math.round((potentialSavings / monthlyDashboard.length) * 12 * 100) / 100;

  const specificMonth = Object.keys(monthlyExpenses).find(
    (month) => Math.abs(monthlyExpenses[month]) === secondLowestExpense
  );
  const [year, month] = specificMonth.split("-").map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const smartBudget =
    Math.round((secondLowestExpense / daysInMonth) * 100) / 100;

  const result = {
    potentialSavingsYearly: potentialSavingsYearly,
    smartBudget: smartBudget,
  };

  return result;
}

module.exports = { computeSmartInitialBudget };
