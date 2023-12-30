var userId = sessionStorage.getItem('userId'); // 或者其他方式获取当前用户ID

function updateDateSelector() {
    var timePeriodType = document.getElementById('timePeriodType').value;
    var dateSelectorDiv = document.getElementById('dateSelector');
    dateSelectorDiv.innerHTML = '';

    var dateInput = document.createElement('input');
    dateInput.type = 'date';
    dateInput.id = 'selectedDate';

    if (timePeriodType === 'monthly') {
        dateInput.type = 'month';
    } else if (timePeriodType === 'yearly') {
        dateInput.type = 'year';
    }

    dateSelectorDiv.appendChild(dateInput);
}

document.addEventListener('DOMContentLoaded', function() {
    if (!userId) {
        alert("User ID is not available. Please login again.");
        window.location.href = 'login.html';
    }
});

function fetchAndDisplayTrends() {
    const timePeriodType = document.getElementById('timePeriodType').value;
    var selectedDate = document.getElementById('selectedDate').value;

    let categories = {};
    let categoryNames = {};
    let { startDate, endDate } = calculateStartEndDate(timePeriodType, selectedDate);

    fetch('http://localhost:8080/api/categories/all')
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Network response was not ok.');
            }
        })
        .then(fetchedCategories => {
            // 将类别信息存储为一个便于查找的对象
            fetchedCategories.forEach(category => {
                categories[category.categoryId] = category.categoryType;
                categoryNames[category.categoryId] = category.categoryName;
            });
            console.log(categories);
            // 以下URL可能需要根据后端的实现进行调整
            fetch(`http://localhost:8080/api/scheduledTransactions/summary?timePeriodType=${timePeriodType}&selectedDate=${selectedDate}&userId=${userId}`)
                .then(response => response.json())
                .then(scheduledData => {
                    let generatedTransactions = generateScheduledTransactions(scheduledData, timePeriodType, startDate, endDate);

                    fetch(`http://localhost:8080/api/transactions/summary?timePeriodType=${timePeriodType}&selectedDate=${selectedDate}&userId=${userId}`)
                        .then(response => response.json())
                        .then(actualData => {
                            let combinedData = [...actualData, ...generatedTransactions];
                            console.log(combinedData);
                            let incomeData = processData(combinedData, categories, 'income', timePeriodType).sort(sortByDate);
                            let expenseData = processData(combinedData, categories, 'expense', timePeriodType).sort(sortByDate);

                            displayIncomeTrend(incomeData, timePeriodType);
                            displayExpenseTrend(expenseData, timePeriodType);

                        })
                        .catch(error => console.error('Error:', error));
                })
                .catch(error => console.error('Error:', error));
        })
        .catch(error => console.error('Error:', error));
}

function sortByDate(a, b) {
    return new Date(a.date) - new Date(b.date);
}

function processData(data, categories, type, timePeriodType) {
    let processedData = data.filter(item => categories[item.categoryId] === type);

    if (timePeriodType === 'yearly') {
        let monthlySum = {};
        processedData.forEach(item => {
            let month = item.transactionDate.substring(0, 7); // 获取 'YYYY-MM' 格式的月份
            if (!monthlySum[month]) {
                monthlySum[month] = 0;
            }
            monthlySum[month] += item.amount;
        });
        return Object.keys(monthlySum).sort().map(month => {
            return { date: month, amount: monthlySum[month] };
        });
    } else {
        return processedData.map(item => {
            return { date: item.transactionDate, amount: item.amount };
        });
    }
}



function generateScheduledTransactions(data, timePeriodType, startDate, endDate) {
    let generatedTransactions = [];

    data.forEach(scheduledTransaction => {
        let nextDate = new Date(scheduledTransaction.nextOccurrence);
        let endDateObj = new Date(endDate);

        while (nextDate <= endDateObj) {
            if (nextDate >= new Date(startDate)) {
                // 生成记录并添加到列表中
                generatedTransactions.push({
                    transactionId: scheduledTransaction.scheduledId, // 可以使用唯一标识
                    userId: scheduledTransaction.userId,
                    categoryId: scheduledTransaction.categoryId,
                    amount: scheduledTransaction.amount,
                    transactionDate: nextDate.toISOString().split('T')[0], // 格式化日期
                    description: scheduledTransaction.description,
                    isScheduled: true // 标记为定期事务生成的记录
                });
            }

            // 根据类型更新 nextDate
            if (scheduledTransaction.scheduleType === 'daily') {
                nextDate.setDate(nextDate.getDate() + 1);
            } else if (scheduledTransaction.scheduleType === 'weekly') {
                nextDate.setDate(nextDate.getDate() + 7);
            } else if (scheduledTransaction.scheduleType === 'monthly') {
                let month = nextDate.getMonth();
                nextDate.setMonth(month + 1);
                // 处理月底日期问题
                if (nextDate.getMonth() !== (month + 1) % 12) {
                    nextDate.setDate(0);
                }
            } else if (scheduledTransaction.scheduleType === 'yearly') {
                nextDate.setFullYear(nextDate.getFullYear() + 1);
            }
        }
    });

    return generatedTransactions;
}

function calculateStartEndDate(timePeriodType, selectedDate) {
    let startDate, endDate;

    const selectedDateObj = new Date(selectedDate);
    const year = selectedDateObj.getFullYear();
    const month = selectedDateObj.getMonth(); // 月份从 0 开始

    if (timePeriodType === 'monthly') {
        // 月报表：开始日期是该月的第一天，结束日期是该月的最后一天
        startDate = new Date(year, month, 1).toISOString().split('T')[0];
        endDate = new Date(year, month + 1, 0).toISOString().split('T')[0]; // 将日期设为下个月的第0天即为这个月的最后一天
    } else if (timePeriodType === 'yearly') {
        // 年报表：开始日期是该年的1月1日，结束日期是该年的12月31日
        startDate = new Date(year, 0, 1).toISOString().split('T')[0]; // 1月1日
        endDate = new Date(year, 11, 31).toISOString().split('T')[0]; // 12月31日
    }

    return { startDate, endDate };
}

var incomeChart; // 全局变量来存储图表实例
var expenseChart; // 同理

function displayIncomeTrend(incomeData, timePeriodType) {
    const ctx = document.getElementById('incomeTrend').getContext('2d');

    // 检查是否已存在图表实例，如果有则销毁
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
}

function getLabels(data, timePeriodType) {
    if (timePeriodType === 'monthly') {
        // 对于 'monthly' 类型，返回所有不同的天
        const uniqueDates = new Set(data.map(item => item.date.split('T')[0]));
        return Array.from(uniqueDates).sort((a, b) => new Date(a) - new Date(b));
    } else if (timePeriodType === 'yearly') {
        return data.map(item => item.date);
    } else {
        // 默认情况下返回一个空数组
        return [];
    }
}

function displayExpenseTrend(expenseData, timePeriodType) {
    const ctx = document.getElementById('expenseTrend').getContext('2d');

    // 检查是否已存在图表实例，如果有则销毁
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
}

// 初始化日期选择器
updateDateSelector();