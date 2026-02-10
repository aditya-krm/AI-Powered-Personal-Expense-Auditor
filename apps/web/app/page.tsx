import { prisma } from "@repo/database";
import { deleteTransaction } from "./actions";

export const dynamic = "force-dynamic";

// Configuration
const TRANSACTIONS_PER_PAGE = 100;

export default async function Home() {
  // Fetch recent transactions and aggregates in parallel for performance
  const [transactions, incomeAggregate, expenseAggregate] = await Promise.all([
    prisma.transaction.findMany({
      orderBy: { transactionDate: "desc" },
      take: TRANSACTIONS_PER_PAGE,
    }),
    prisma.transaction.aggregate({
      where: { type: "INCOME" },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { type: "EXPENSE" },
      _sum: { amount: true },
    }),
  ]);

  // Calculate summary using database aggregates
  const income = Number(incomeAggregate._sum.amount ?? 0);
  const expense = Number(expenseAggregate._sum.amount ?? 0);
  const balance = income - expense;

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Finance Dashboard</h1>
          <p className="text-gray-500">Overview of your transactions</p>
        </header>

        {/* Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Total Income</h2>
            <p className="text-3xl font-bold text-green-600 mt-2">₹{income.toFixed(2)}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Total Expenses</h2>
            <p className="text-3xl font-bold text-red-600 mt-2">₹{expense.toFixed(2)}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Net Balance</h2>
            <p className={`text-3xl font-bold mt-2 ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              ₹{balance.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-lg font-semibold text-gray-800">Recent Transactions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {t.transactionDate.toLocaleDateString("en-IN", {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                        {t.category.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {t.description}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${t.type === 'INCOME' ? 'text-green-600' :
                      t.type === 'EXPENSE' ? 'text-red-600' : 'text-gray-900'
                      }`}>
                      {t.type === 'INCOME' ? '+' : t.type === 'EXPENSE' ? '-' : ''} ₹{Number(t.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <form action={deleteTransaction.bind(null, t.id)}>
                        <button className="text-gray-400 hover:text-red-600 transition-colors font-medium text-xs uppercase tracking-wide">
                          Delete
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No transactions found. Start using the bot!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
