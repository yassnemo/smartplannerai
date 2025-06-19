import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Utensils, Car, DollarSign, Film, Zap, ShoppingBag } from "lucide-react";
import type { Transaction } from "@shared/schema";

interface RecentTransactionsProps {
  transactions?: Transaction[];
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Food & Dining":
      return Utensils;
    case "Transportation":
      return Car;
    case "Income":
      return DollarSign;
    case "Entertainment":
      return Film;
    case "Bills & Utilities":
      return Zap;
    case "Shopping":
      return ShoppingBag;
    default:
      return DollarSign;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case "Food & Dining":
      return "text-orange-600 bg-orange-100";
    case "Transportation":
      return "text-blue-600 bg-blue-100";
    case "Income":
      return "text-green-600 bg-green-100";
    case "Entertainment":
      return "text-purple-600 bg-purple-100";
    case "Bills & Utilities":
      return "text-yellow-600 bg-yellow-100";
    case "Shopping":
      return "text-pink-600 bg-pink-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

export default function RecentTransactions({ transactions = [] }: RecentTransactionsProps) {
  if (!transactions.length) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <a href="#transactions" className="text-primary text-sm font-medium hover:underline">
              View All
            </a>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No recent transactions available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Transactions</CardTitle>
          <a href="#transactions" className="text-primary text-sm font-medium hover:underline">
            View All
          </a>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => {
            const Icon = getCategoryIcon(transaction.category);
            const colorClass = getCategoryColor(transaction.category);
            const amount = parseFloat(transaction.amount);
            const isIncome = transaction.isIncome;
            
            return (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${colorClass}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{transaction.description}</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm text-muted-foreground">{transaction.category}</p>
                      <Badge variant="secondary" className="text-xs">
                        {new Date(transaction.transactionDate).toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    isIncome ? 'text-success' : 'text-foreground'
                  }`}>
                    {isIncome ? '+' : ''}{amount < 0 ? '' : isIncome ? '' : '-'}$
                    {Math.abs(amount).toFixed(2)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
