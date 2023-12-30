export interface Category {
    categoryId: string;
    categoryName: string;
    categoryType: string;
}

export interface Budget {
    id: string;
    categoryId: string;
    amount: number;
    startDate: string;
    endDate: string;
    budgetPeriod: string;
    status?: string;  // 可选属性，表示预算的状态
    actualSpending?: number;
}

export interface Transaction {
    transactionId: string;
    userId: string;
    categoryId: string;
    amount: number;
    transactionDate: string;
    description?: string;
    isScheduled?: boolean;
}

export interface ScheduledTransaction {
    scheduledId: string;
    userId: string;
    categoryId: string;
    amount: number;
    nextOccurrence: string;
    scheduleType: string;
}
