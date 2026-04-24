import moment from "moment";
import Transaction from "../models/TransactionModel.js";

const categories = [
  "Groceries",
  "Rent",
  "Salary",
  "Tip",
  "Food",
  "Medical",
  "Utilities",
  "Entertainment",
  "Transportation",
  "Other",
];

const monthNames = moment.months().map((month) => month.toLowerCase());

const buildSuggestions = (overrides = []) => [
  "Show my expenses for March",
  "How much did I spend on food?",
  "What is my total spending this month?",
  ...overrides,
].slice(0, 4);

const getDateRangeFromMessage = (message) => {
  const normalized = message.toLowerCase();
  const now = moment();

  if (normalized.includes("last month")) {
    return {
      startDate: now.clone().subtract(1, "month").startOf("month").toDate(),
      endDate: now.clone().subtract(1, "month").endOf("month").toDate(),
      periodLabel: "last month",
    };
  }

  if (normalized.includes("this month")) {
    return {
      startDate: now.clone().startOf("month").toDate(),
      endDate: now.clone().endOf("month").toDate(),
      periodLabel: "this month",
    };
  }

  const monthIndex = monthNames.findIndex((month) => normalized.includes(month));

  if (monthIndex !== -1) {
    const yearMatch = normalized.match(/\b(20\d{2})\b/);
    const year = yearMatch ? Number(yearMatch[1]) : now.year();
    const start = moment().year(year).month(monthIndex).startOf("month");
    const end = moment(start).endOf("month");

    return {
      startDate: start.toDate(),
      endDate: end.toDate(),
      periodLabel: `${start.format("MMMM")} ${year}`,
    };
  }

  return null;
};

const getCategoryFromMessage = (message) =>
  categories.find((category) => message.toLowerCase().includes(category.toLowerCase()));

const getTransactionTypeFromMessage = (message) => {
  const normalized = message.toLowerCase();

  if (normalized.includes("income") || normalized.includes("earned") || normalized.includes("credit")) {
    return "credit";
  }

  if (normalized.includes("expense") || normalized.includes("spend") || normalized.includes("spent")) {
    return "expense";
  }

  return null;
};

const formatTransactions = (transactions) =>
  transactions.map((transaction) => ({
    _id: transaction._id,
    title: transaction.title,
    amount: transaction.amount,
    category: transaction.category,
    transactionType: transaction.transactionType,
    date: transaction.date,
    description: transaction.description,
  }));

const buildQuery = (userId, message) => {
  const range = getDateRangeFromMessage(message);
  const category = getCategoryFromMessage(message);
  const transactionType = getTransactionTypeFromMessage(message);

  const query = { user: userId };

  if (range) {
    query.date = {
      $gte: range.startDate,
      $lte: range.endDate,
    };
  }

  if (category) {
    query.category = category;
  }

  if (transactionType) {
    query.transactionType = transactionType;
  }

  return {
    query,
    range,
    category,
    transactionType,
  };
};

const isHelpIntent = (message) => {
  const normalized = message.toLowerCase();
  return ["help", "how do i", "what can you do", "use the app"].some((phrase) =>
    normalized.includes(phrase)
  );
};

const isRecentIntent = (message) => {
  const normalized = message.toLowerCase();
  return normalized.includes("recent") || normalized.includes("latest");
};

const isTotalIntent = (message) => {
  const normalized = message.toLowerCase();
  return normalized.includes("total") || normalized.includes("how much");
};

const buildHelpResponse = () => ({
  success: true,
  intent: "help",
  answer:
    "I can help you review spending totals, category-wise expenses, month-based expenses, recent transactions, and general app usage.",
  suggestions: buildSuggestions(["Show my recent transactions"]),
});

export const processChatbotQuery = async ({ userId, message }) => {
  const trimmedMessage = (message || "").trim();

  if (!trimmedMessage) {
    return {
      success: false,
      intent: "empty",
      answer: "Please enter a question so I can help with your expenses.",
      suggestions: buildSuggestions(),
    };
  }

  if (isHelpIntent(trimmedMessage)) {
    return buildHelpResponse();
  }

  const { query, range, category, transactionType } = buildQuery(userId, trimmedMessage);

  if (isRecentIntent(trimmedMessage)) {
    const transactions = await Transaction.find(query)
      .sort({ date: -1, createdAt: -1 })
      .limit(5);

    return {
      success: true,
      intent: "recent_transactions",
      answer:
        transactions.length > 0
          ? `Here are your ${transactions.length} most recent matching transactions.`
          : "I couldn't find any recent transactions that match that request.",
      data: {
        periodLabel: range?.periodLabel,
        category,
        transactions: formatTransactions(transactions),
      },
      suggestions: buildSuggestions(),
    };
  }

  if (category || isTotalIntent(trimmedMessage) || range || transactionType) {
    const transactions = await Transaction.find(query).sort({ date: -1, createdAt: -1 });
    const total = transactions.reduce((sum, item) => sum + item.amount, 0);
    const descriptor = [
      category ? `${category.toLowerCase()} ` : "",
      transactionType === "credit" ? "income" : transactionType === "expense" ? "expenses" : "transactions",
    ]
      .join("")
      .trim();

    return {
      success: true,
      intent: category ? "category_total" : range ? "period_summary" : "total_summary",
      answer:
        transactions.length > 0
          ? `You have ${transactions.length} ${descriptor} totaling ${total}${range ? ` for ${range.periodLabel}` : ""}.`
          : "I couldn't find any matching transactions for that request.",
      data: {
        total,
        category,
        periodLabel: range?.periodLabel,
        transactions: formatTransactions(transactions.slice(0, 5)),
      },
      suggestions: buildSuggestions(["Show my recent transactions"]),
    };
  }

  return {
    success: true,
    intent: "fallback",
    answer:
      "I can help with totals, categories, months, recent transactions, and app usage tips. Try asking about food spending, March expenses, or recent activity.",
    suggestions: buildSuggestions(),
  };
};
