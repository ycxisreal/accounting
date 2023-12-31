<!-- <template>
    <el-header>
        <h1>Financial Summary</h1>
            <div>
                <label for="timePeriodType">Select Time Period Type:</label>
                <el-select v-model="timePeriodType" placeholder="Select" @change="updateDateSelector">
                    <el-option label="Daily" value="daily"></el-option>
                    <el-option label="Monthly" value="monthly"></el-option>
                    <el-option label="Yearly" value="yearly"></el-option>
                </el-select>
            </div>
            <div v-if="timePeriodType">
                <el-date-picker v-model="selectedDate" :type="datePickerType" :value-format="dateFormat" :format="dateFormat"
                    placeholder="Choose date"></el-date-picker>
            </div>
            <el-button type="primary" @click="loadSummary">Load Summary</el-button>
    </el-header>
        <div>
            <canvas ref="summaryChart"></canvas>
        </div>
        <div>
            <canvas ref="incomePieChart"></canvas>
        </div>
        <div>
            <canvas ref="expensePieChart"></canvas>
        </div>
</template> -->
<template>
    <div class="container">
        <div class="header">
            <h1>Financial Summary</h1>
            <div class="controls">
                <div>
                    <label for="timePeriodType">Select Time Period Type:</label>
                    <el-select v-model="timePeriodType" placeholder="Select" @change="updateDateSelector">
                        <el-option label="Daily" value="daily"></el-option>
                        <el-option label="Monthly" value="monthly"></el-option>
                        <el-option label="Yearly" value="yearly"></el-option>
                    </el-select>
                </div>
                <div v-if="timePeriodType">
                    <el-date-picker v-model="selectedDate" :type="datePickerType" :value-format="dateFormat"
                        :format="dateFormat" placeholder="Choose date"></el-date-picker>
                </div>
                <el-button type="primary" @click="loadSummary">Load Summary</el-button>
            </div>
        </div>

        <div class="charts">
            <div class="chart bar-chart">
                <canvas ref="summaryChart"></canvas>
            </div>
            <div class="pie-charts">
                <div class="chart">
                    <canvas ref="incomePieChart"></canvas>
                </div>
                <div class="chart">
                    <canvas ref="expensePieChart"></canvas>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { ElSelect, ElOption, ElDatePicker, ElButton } from 'element-plus';
import Chart from 'chart.js/auto';

// 定义响应式数据
const timePeriodType = ref('');
const selectedDate = ref(null);
const summaryChart = ref(null);
const incomePieChart = ref(null);
const expensePieChart = ref(null);
const datePickerType = ref('date');
const dateFormat = computed(() => {
    switch (timePeriodType.value) {
        case 'daily':
            return 'YYYY-MM-DD';
        case 'monthly':
            return 'YYYY-MM';
        case 'yearly':
            return 'YYYY';
        default:
            return 'YYYY-MM-DD';
    }
});
// 省略其他函数的实现，例如 updateDateSelector, loadSummary, 等等
const loadSummary = async () => {
    try {
        const userId = sessionStorage.getItem('userId');
        if (!userId) {
            alert("User ID is not available. Please login again.");
            window.location.href = 'login.html';
            return;
        }

        const { startDate, endDate } = calculateStartEndDate(timePeriodType.value, selectedDate.value);

        const categoriesResponse = await fetch('http://localhost:8080/api/categories/all');
        if (!categoriesResponse.ok) throw new Error('Failed to fetch categories');

        const fetchedCategories = await categoriesResponse.json();
        const categories = {};
        const categoryNames = {};
        fetchedCategories.forEach(category => {
            categories[category.categoryId] = category.categoryType;
            categoryNames[category.categoryId] = category.categoryName;
        });

        const transactionsUrl = `http://localhost:8080/api/transactions/summary?timePeriodType=${timePeriodType.value}&selectedDate=${selectedDate.value}&userId=${userId}`;
        const transactionsResponse = await fetch(transactionsUrl);
        if (!transactionsResponse.ok) throw new Error('Failed to fetch transactions');

        const actualData = await transactionsResponse.json();

        const scheduledTransactionsUrl = `http://localhost:8080/api/scheduledTransactions/summary?timePeriodType=${timePeriodType.value}&selectedDate=${selectedDate.value}&userId=${userId}`;
        const scheduledTransactionsResponse = await fetch(scheduledTransactionsUrl);
        if (!scheduledTransactionsResponse.ok) throw new Error('Failed to fetch scheduled transactions');

        const scheduledData = await scheduledTransactionsResponse.json();
        const generatedTransactions = generateScheduledTransactions(scheduledData, timePeriodType.value, startDate, endDate);

        const combinedData = [...actualData, ...generatedTransactions];
        drawBarChart(combinedData, timePeriodType.value, categories);
        drawPieChart(combinedData, 'income', categories, categoryNames);
        drawPieChart(combinedData, 'expense', categories, categoryNames);

    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load summary data');
    }
};
const generateScheduledTransactions = (data, timePeriodType, startDate, endDate) => {
    const generatedTransactions = [];
    const endDateObj = new Date(endDate);

    data.forEach(scheduledTransaction => {
        let nextDate = new Date(scheduledTransaction.nextOccurrence);

        while (nextDate <= endDateObj) {
            if (nextDate >= new Date(startDate)) {
                generatedTransactions.push({
                    transactionId: scheduledTransaction.scheduledId,
                    userId: scheduledTransaction.userId,
                    categoryId: scheduledTransaction.categoryId,
                    amount: scheduledTransaction.amount,
                    transactionDate: nextDate.toISOString().split('T')[0],
                    description: scheduledTransaction.description,
                    isScheduled: true
                });
            }

            if (scheduledTransaction.scheduleType === 'daily') {
                nextDate.setDate(nextDate.getDate() + 1);
            } else if (scheduledTransaction.scheduleType === 'weekly') {
                nextDate.setDate(nextDate.getDate() + 7);
            } else if (scheduledTransaction.scheduleType === 'monthly') {
                let month = nextDate.getMonth();
                nextDate.setMonth(month + 1);
                if (nextDate.getMonth() !== (month + 1) % 12) {
                    nextDate.setDate(0);
                }
            } else if (scheduledTransaction.scheduleType === 'yearly') {
                nextDate.setFullYear(nextDate.getFullYear() + 1);
            }
        }
    });

    return generatedTransactions;
};
const calculateStartEndDate = (timePeriodType, selectedDate) => {
    let startDate, endDate;

    if (!selectedDate) return { startDate: null, endDate: null };

    const dateObj = new Date(selectedDate);
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth(); // 月份从0开始

    if (timePeriodType === 'daily') {
        startDate = endDate = selectedDate;
    } else if (timePeriodType === 'monthly') {
        startDate = new Date(year, month, 1).toISOString().split('T')[0];
        endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
    } else if (timePeriodType === 'yearly') {
        startDate = new Date(year, 0, 1).toISOString().split('T')[0];
        endDate = new Date(year, 11, 31).toISOString().split('T')[0];
    }

    return { startDate, endDate };
};
let myBarChart = null; // 全局变量，用于保存图表实例

const drawBarChart = (data, timePeriodType, categories) => {
    const ctx = summaryChart.value.getContext('2d');
    if (myBarChart) {
        myBarChart.destroy();
    }

    const chartData = generateChartData(data, timePeriodType, categories);

    myBarChart = new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
};
const generateChartData = (data, timePeriodType, categories) => {
    const labels = getLabels(data, timePeriodType);
    const incomeData = new Array(labels.length).fill(0);
    const expenseData = new Array(labels.length).fill(0);
    const balanceData = new Array(labels.length).fill(0);

    data.forEach(item => {
        const date = new Date(item.transactionDate);
        let index;
        if (timePeriodType === 'daily') {
            index = 0;
        } else if (timePeriodType === 'monthly') {
            index = date.getDate() - 1; // 0-based index for day of month
        } else if (timePeriodType === 'yearly') {
            index = date.getMonth(); // 0-11 for Jan-Dec
        }

        if (categories[item.categoryId] === 'income') {
            incomeData[index] += item.amount;
            balanceData[index] += item.amount;
        } else if (categories[item.categoryId] === 'expense') {
            expenseData[index] += item.amount;
            balanceData[index] -= item.amount;
        }
    });

    return {
        labels,
        datasets: [
            {
                label: 'Income',
                data: incomeData,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            },
            {
                label: 'Expense',
                data: expenseData,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            },
            {
                label: 'Balance',
                data: balanceData,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }
        ]
    };
};
const getLabels = (data, timePeriodType) => {
    if (timePeriodType === 'daily') {
        return ['Total'];
    } else if (timePeriodType === 'monthly') {
        const uniqueDates = new Set(data.map(item => new Date(item.transactionDate).getDate()));
        return Array.from(uniqueDates).sort((a, b) => a - b);
    } else if (timePeriodType === 'yearly') {
        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    } else {
        return [];
    }
};
const pieCharts = {}; // 存储饼图的全局对象

const drawPieChart = (data, categoryType, categories, categoryNames) => {
    const ctx = categoryType === 'income' ? incomePieChart.value.getContext('2d') : expensePieChart.value.getContext('2d');

    if (pieCharts[categoryType]) {
        pieCharts[categoryType].destroy();
    }

    const filteredData = data.filter(item => categories[item.categoryId] === categoryType);
    const categorySums = filteredData.reduce((acc, item) => {
        const categoryName = categoryNames[item.categoryId];
        acc[categoryName] = (acc[categoryName] || 0) + Math.abs(item.amount);
        return acc;
    }, {});

    const chartData = {
        labels: Object.keys(categorySums),
        datasets: [{
            data: Object.values(categorySums),
            backgroundColor: generateRandomColors(Object.keys(categorySums).length),
            borderColor: generateRandomColors(Object.keys(categorySums).length, true),
            borderWidth: 1
        }]
    };

    pieCharts[categoryType] = new Chart(ctx, {
        type: 'pie',
        data: chartData
    });
};
const generateRandomColors = (count, isBorder = false) => {
    return Array.from({ length: count }, () => {
        const r = Math.floor(Math.random() * 255);
        const g = Math.floor(Math.random() * 255);
        const b = Math.floor(Math.random() * 255);
        return isBorder ? `rgba(${r}, ${g}, ${b}, 1)` : `rgba(${r}, ${g}, ${b}, 0.2)`;
    });
};


watch(timePeriodType, (newValue) => {
    // 根据 timePeriodType 更新 datePickerType
    datePickerType.value = newValue === 'monthly' ? 'month' : newValue === 'yearly' ? 'year' : 'date';
});


</script>

<style scoped>
.container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
}

.header {
    text-align: center;
    width: 80%;
    /* 标题和控制区的宽度 */
}

.controls {
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: 10px;
    width: 100%;
    /* 控制元素宽度*/
}

.charts {
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: 20px;
    margin-top: 20px;
    width: 100%;
    /* 图表区域宽度 */
}

.bar-chart {
    flex: 1;
}

.pie-charts {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 25%;
    /* 饼图容器宽度*/
}

.chart {
    width: 100%;
    /* 图表宽度 */
}
</style>
