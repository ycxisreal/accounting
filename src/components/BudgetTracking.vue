<template>
    <div class="cards-container">
        <div v-for="budget in budgets" :key="budget.id">
            <el-card class="card" shadow="hover">
                <h3>{{ categoryNames[budget.categoryId] }}</h3>
                <p>预算金额: {{ budget.amount }}</p>
                <p>实际支出: {{ budget.actualSpending }}</p>
                <p>状态: {{ budget.status }}</p>
            </el-card>
        </div>
    </div>
</template>



<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { Budget, Category, ScheduledTransaction, Transaction } from './types'; // 假设类型定义在 './types' 文件中
// 假设类型定义在 './types' 文件中

const userId = ref<string | null>(sessionStorage.getItem('userId'));
const categories = ref<Record<string, Category>>({});
const categoryNames = ref<Record<string, string>>({});
const budgets = ref<Budget[]>([]);

onMounted(async () => {
    if (!userId.value) {
        alert("User ID is not available. Please login again.");
        window.location.href = 'login.html';
        return;
    }

    try {
        const categoriesResponse = await fetch('http://localhost:8080/api/categories/all');
        const fetchedCategories: Category[] = await categoriesResponse.json();
        fetchedCategories.forEach((category) => {
            categories.value[category.categoryId] = category;
            categoryNames.value[category.categoryId] = category.categoryName;
        });

        const budgetsResponse = await fetch(`http://localhost:8080/api/budgets/get?userId=${userId.value}`);
        const fetchedBudgets: Budget[] = await budgetsResponse.json();

        for (const budget of fetchedBudgets) {
            let combineData = await getCombinedData(budget);
            budget.actualSpending = calculateActualSpending(combineData, budget.categoryId);
            budget.status = budget.actualSpending > budget.amount ? '超支' : '正常';
        }


        budgets.value = fetchedBudgets;
    } catch (error) {
        console.error('Error:', error);
    }
});

async function getCombinedData(budget: Budget): Promise<Transaction[]> {
    let startDate = budget.startDate;
    let endDate = budget.endDate;

    try {
        const scheduledDataResponse = await fetch(`http://localhost:8080/api/scheduledTransactions/range?startDate=${startDate}&endDate=${endDate}&userId=${userId.value}`);
        const scheduledData: ScheduledTransaction[] = await scheduledDataResponse.json();
        let generatedTransactions = generateScheduledTransactions(scheduledData, budget.budgetPeriod, startDate, endDate);

        const actualDataResponse = await fetch(`http://localhost:8080/api/transactions/range?startDate=${startDate}&endDate=${endDate}&userId=${userId.value}`);
        const actualData: Transaction[] = await actualDataResponse.json();

        return [...actualData, ...generatedTransactions];
    } catch (error) {
        console.error('Error:', error);
        return []; // In case of error, return an empty array
    }
}
function generateScheduledTransactions(data: ScheduledTransaction[], timePeriodType: string, startDate: string, endDate: string): Transaction[] {
    let generatedTransactions: Transaction[] = [];

    data.forEach(scheduledTransaction => {
        let nextDate = new Date(scheduledTransaction.nextOccurrence);
        let endDateObj = new Date(endDate);

        while (nextDate <= endDateObj) {
            if (nextDate >= new Date(startDate)) {
                generatedTransactions.push({
                    transactionId: scheduledTransaction.scheduledId,
                    userId: scheduledTransaction.userId,
                    categoryId: scheduledTransaction.categoryId,
                    amount: scheduledTransaction.amount,
                    transactionDate: nextDate.toISOString().split('T')[0],
                    isScheduled: true
                });
            }

            // 更新 nextDate
            if (scheduledTransaction.scheduleType === 'daily') {
                nextDate.setDate(nextDate.getDate() + 1);
            } else if (scheduledTransaction.scheduleType === 'weekly') {
                nextDate.setDate(nextDate.getDate() + 7);
            } else if (scheduledTransaction.scheduleType === 'monthly') {
                nextDate.setMonth(nextDate.getMonth() + 1);
            } else if (scheduledTransaction.scheduleType === 'yearly') {
                nextDate.setFullYear(nextDate.getFullYear() + 1);
            }
        }
    });

    return generatedTransactions;
}


function calculateActualSpending(combineData: Transaction[], budgetCategoryId: string): number {
    let totalSpending = 0;
    combineData.forEach((transaction) => {
        if (transaction.categoryId === budgetCategoryId) {
            totalSpending += transaction.amount;
        }
    });
    return totalSpending;
}

</script>

<style scoped>
.cards-container {
    display: flex;
    flex-wrap: wrap;
    gap: 4%;
}

.card {
    width: 100%;
    margin-top: 2%;
    border: 5px solid #dcdee4;
    border-radius: 2px;
}
</style>
