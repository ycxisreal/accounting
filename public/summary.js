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

function loadSummary() {
    var timePeriodType = document.getElementById('timePeriodType').value;
    var selectedDate = document.getElementById('selectedDate').value;
    // 这里需要一个方式来获取当前登录的用户ID
    var userId = sessionStorage.getItem('userId'); // 从sessionStorage中获取用户ID

    // 确保userId是有效的
    if (!userId) {
        alert("User ID is not available. Please login again.");
        window.location.href = 'login.html';
        return;
    }

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
                            drawBarChart(combinedData, timePeriodType, categories);
                            drawPieChart(combinedData, 'income', categories, categoryNames);
                            drawPieChart(combinedData, 'expense', categories, categoryNames);
                        })
                        .catch(error => console.error('Error:', error));
                })
                .catch(error => console.error('Error:', error));
        })
        .catch(error => console.error('Error:', error));

    // // 可以添加获取定期事务数据的类似逻辑
    // fetch(`/api/scheduledTransactions/summary?timePeriodType=${timePeriodType}&selectedDate=${selectedDate}&userId=${userId}`)
    //     .then(response => response.json())
    //     .then(data => {
    //         console.log(data); // 打印查看数据结构
    //
    //     })
    //     .catch(error => console.error('Error:', error));

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
    const day = selectedDateObj.getDate();

    if (timePeriodType === 'daily') {
        // 日报表：开始和结束日期都是selectedDate
        startDate = endDate = selectedDate;
    } else if (timePeriodType === 'monthly') {
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


function drawBarChart(data, timePeriodType, categories) {
    var ctx = document.getElementById('summaryChart').getContext('2d');
    if (window.myBarChart) {
        window.myBarChart.destroy();
    }

    var chartData = generateChartData(data, timePeriodType, categories);

    window.myBarChart = new Chart(ctx, {
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
}

function generateChartData(data, timePeriodType, categories) {
    var labels = getLabels(data, timePeriodType);
    var incomeData = new Array(labels.length).fill(0);
    var expenseData = new Array(labels.length).fill(0);
    var balanceData = new Array(labels.length).fill(0);

    data.forEach(item => {
        var date = new Date(item.transactionDate);
        var index;
        if (timePeriodType === 'daily') {
            index = 0; // 所有交易都算作同一天
        } else if (timePeriodType === 'monthly') {
            index = labels.indexOf(item.transactionDate.split('T')[0]);
        } else if (timePeriodType === 'yearly') {
            index = date.getMonth(); // 0-11，对应Jan-Dec
        }

        if (index !== -1) {
            if (categories[item.categoryId] === 'income') {
                incomeData[index] += item.amount;
                balanceData[index] += item.amount;
            } else if (categories[item.categoryId] === 'expense') {
                expenseData[index] += item.amount;
                balanceData[index] -= item.amount;
            }
        }
    });

    return {
        labels: labels,
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
                data: expenseData.map(value => -value), // 负值表示支出
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            },
            {
                label: 'Balance',
                data: balanceData,
                backgroundColor: balanceData.map(value => value >= 0 ? 'rgba(75, 192, 192, 0.2)' : 'rgba(255, 206, 86, 0.2)'),
                borderColor: balanceData.map(value => value >= 0 ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 206, 86, 1)'),
                borderWidth: 1
            }
        ]
    };
}

function getLabels(data, timePeriodType) {
    if (timePeriodType === 'daily') {
        // 对于 'daily' 类型，假设所有交易都在同一天发生
        return ['Total'];
    } else if (timePeriodType === 'monthly') {
        // 对于 'monthly' 类型，返回所有不同的天
        const uniqueDates = new Set(data.map(item => item.transactionDate.split('T')[0]));
        return Array.from(uniqueDates).sort((a, b) => new Date(a) - new Date(b));
    } else if (timePeriodType === 'yearly') {
        // 对于 'yearly' 类型，返回每个月的标签
        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    } else {
        // 默认情况下返回一个空数组
        return [];
    }
}

// 在全局范围内创建一个对象来存储饼图实例
var pieCharts = {};

function drawPieChart(data, categoryType, categories, categoryNames) {
    var ctx = document.getElementById(categoryType + 'PieChart').getContext('2d');

    // 检查并销毁旧的饼图实例
    if (pieCharts[categoryType]) {
        pieCharts[categoryType].destroy();
    }

    // 过滤并聚合数据
    var categorySums = data.reduce((acc, item) => {
        if (categories[item.categoryId] === categoryType) {
            const categoryName = categoryNames[item.categoryId];
            acc[categoryName] = (acc[categoryName] || 0) + Math.abs(item.amount);
        }
        return acc;
    }, {});

    // 准备图表数据
    var chartData = {
        labels: Object.keys(categorySums),
        datasets: [{
            data: Object.values(categorySums),
            backgroundColor: generateRandomColors(Object.keys(categorySums).length),
            borderColor: generateRandomColors(Object.keys(categorySums).length, true),
            borderWidth: 1
        }]
    };

    // 创建饼状图
    pieCharts[categoryType] = new Chart(ctx, {
        type: 'pie',
        data: chartData
    });
}

// 生成随机颜色数组
function generateRandomColors(count, isBorder = false) {
    return Array.from({ length: count }, () => {
        var r = Math.floor(Math.random() * 255);
        var g = Math.floor(Math.random() * 255);
        var b = Math.floor(Math.random() * 255);
        return isBorder ? `rgba(${r}, ${g}, ${b}, 1)` : `rgba(${r}, ${g}, ${b}, 0.2)`;
    });
}

// 初始化日期选择器
updateDateSelector();
