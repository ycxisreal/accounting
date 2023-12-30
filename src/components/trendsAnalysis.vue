<template>
    <section id="trends">
        <main>
            <h1>财务趋势分析</h1>
            <label for="timePeriodType">选择时间范围：</label>
            <el-select v-model="timePeriodType" placeholder="选择时间范围">
                <el-option label="Monthly" value="monthly"></el-option>
                <el-option label="Yearly" value="yearly"></el-option>
            </el-select>
            <div v-if="timePeriodType">
                <el-date-picker v-model="selectedDate" :type="datePickerType" :value-format="dateFormat"
                    :format="dateFormat" placeholder="选择日期"></el-date-picker>
            </div>
            <el-button @click="fetchAndDisplayTrends">分析</el-button>

            <div id="trendCharts">
                <h2>收入趋势</h2>
                <canvas ref="incomeTrend"></canvas>
                <h2>支出趋势</h2>
                <canvas ref="expenseTrend"></canvas>
            </div>
        </main>
    </section>
</template>

<script setup lang="ts">
import { ref, watch, type Ref, computed } from 'vue';
import { ElSelect, ElOption, ElDatePicker, ElButton } from 'element-plus';
import Chart from 'chart.js/auto';
import type { Category, Transaction, ScheduledTransaction } from "./types";
import type { IDatePickerType } from 'element-plus/lib/components/date-picker/src/date-picker.type.js';
const userId = ref(sessionStorage.getItem('userId'));
const timePeriodType = ref('');
const selectedDate = ref('');
const datePickerType = computed<IDatePickerType>(() => {
    switch (timePeriodType.value) {
        case 'monthly':
            return 'month';
        case 'yearly':
            return 'year';
        default:
            return 'date';
    }
});
const incomeTrend: Ref<HTMLCanvasElement | null> = ref(null);
const expenseTrend: Ref<HTMLCanvasElement | null> = ref(null);
const dateFormat = computed(() => {
    switch (timePeriodType.value) {
        case 'monthly':
            return 'YYYY-MM';
        case 'yearly':
            return 'YYYY';
        default:
            return 'YYYY-MM';
    }
});
// 定义数据和方法
const sortByDate = (a: { date: string }, b: { date: string }) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA.getTime() - dateB.getTime();
};
const fetchAndDisplayTrends = async () => {
    if (!userId.value || !selectedDate.value) {
        console.error('User ID or Date not available');
        return;
    }

    let categories: Record<string, Category> = {};
    let categoryNames: Record<string, string> = {};

    try {
        const categoriesResponse = await fetch('http://localhost:8080/api/categories/all');
        const fetchedCategories: Category[] = await categoriesResponse.json();
        fetchedCategories.forEach(category => {
            categories[category.categoryId] = category;
            categoryNames[category.categoryId] = category.categoryName;
        });

        const { startDate, endDate } = calculateStartEndDate(timePeriodType.value, selectedDate.value);

        const transactionsUrl = `http://localhost:8080/api/transactions/summary?timePeriodType=${timePeriodType.value}&selectedDate=${selectedDate.value}&userId=${userId.value}`;
        const transactionsResponse = await fetch(transactionsUrl);
        const actualData: Transaction[] = await transactionsResponse.json();

        const scheduledDataUrl = `http://localhost:8080/api/scheduledTransactions/summary?timePeriodType=${timePeriodType.value}&selectedDate=${selectedDate.value}&userId=${userId.value}`;
        const scheduledTransactionsResponse = await fetch(scheduledDataUrl);
        const scheduledData: ScheduledTransaction[] = await scheduledTransactionsResponse.json();

        let combinedData = [...actualData, ...generateScheduledTransactions(scheduledData, timePeriodType.value, startDate, endDate)];
        let incomeData = processData(combinedData, categories, 'income', timePeriodType.value).sort(sortByDate);
        let expenseData = processData(combinedData, categories, 'expense', timePeriodType.value).sort(sortByDate);

        displayIncomeTrend(incomeData, timePeriodType.value);
        displayExpenseTrend(expenseData, timePeriodType.value);

    } catch (error) {
        console.error('Error:', error);
    }
};
const processData = (data: Transaction[], categories: Record<string, Category>, type: string, timePeriodType: string) => {
    let processedData = data.filter(item => categories[item.categoryId]?.categoryType === type);

    if (timePeriodType === 'yearly') {
        let monthlySum: Record<string, number> = {};
        processedData.forEach(item => {
            let month = item.transactionDate.substring(0, 7); // 获取 'YYYY-MM' 格式的月份
            monthlySum[month] = (monthlySum[month] || 0) + item.amount;
        });

        return Object.keys(monthlySum).map(month => {
            return { date: month, amount: monthlySum[month] };
        });
    } else {
        return processedData.map(item => {
            return { date: item.transactionDate, amount: item.amount };
        });
    }
};
const generateScheduledTransactions = (data: ScheduledTransaction[], timePeriodType: string, startDate: string, endDate: string): Transaction[] => {
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
};
const calculateStartEndDate = (timePeriodType: string, selectedDate: string) => {
    let startDate = ''; // 初始化为空字符串
    let endDate = '';   // 初始化为空字符串

    const selectedDateObj = new Date(selectedDate);
    const year = selectedDateObj.getFullYear();
    const month = selectedDateObj.getMonth(); // 月份从 0 开始

    if (timePeriodType === 'monthly') {
        startDate = new Date(year, month, 1).toISOString().split('T')[0];
        endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
    } else if (timePeriodType === 'yearly') {
        startDate = new Date(year, 0, 1).toISOString().split('T')[0];
        endDate = new Date(year, 11, 31).toISOString().split('T')[0];
    }

    return { startDate, endDate };
};

let incomeChart: Chart | null = null; // 定义为全局变量

const displayIncomeTrend = (incomeData: { date: string, amount: number }[], timePeriodType: string) => {
    const ctx = incomeTrend.value?.getContext('2d');
    if (!ctx) return;

    if (incomeChart) {
        incomeChart.destroy();
    }

    const labels = getLabels(incomeData, timePeriodType);

    incomeChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '收入',
                data: incomeData.map(item => item.amount),
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
};
const getLabels = (data: { date: string; amount: number }[], timePeriodType: string): string[] => {
    if (timePeriodType === 'yearly') {
        // 对于年度数据，标签是每个数据点的年-月
        return data.map(item => item.date);
    } else if (timePeriodType === 'monthly') {
        // 对于月度数据，标签是每个数据点的日
        const uniqueDays = new Set(data.map(item => item.date.split('-').slice(0, 2).join('-')));
        return Array.from(uniqueDays).sort();
    } else {
        // 默认为空数组
        return [];
    }
};
let expenseChart: Chart | null = null; // 定义为全局变量

const displayExpenseTrend = (expenseData: { date: string, amount: number }[], timePeriodType: string) => {
    const ctx = expenseTrend.value?.getContext('2d');
    if (!ctx) return;

    if (expenseChart) {
        expenseChart.destroy();
    }

    const labels = getLabels(expenseData, timePeriodType);

    expenseChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '支出',
                data: expenseData.map(item => item.amount),
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
};


// 注意：下面的代码仅为结构示意，需要根据实际情况填写逻辑
</script>

<style>
/* 样式内容 */
</style>
