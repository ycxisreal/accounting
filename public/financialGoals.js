document.getElementById('goalForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const goalName = document.getElementById('goalName').value;
    const targetAmount = document.getElementById('targetAmount').value;
    const deadline = document.getElementById('deadline').value;
    const userId = sessionStorage.getItem('userId'); // 或其他方式获取用户ID

    fetch('http://localhost:8080/api/financialGoals/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, goalName, targetAmount, deadline })
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            // 在这里处理响应，例如更新页面上的目标列表
        })
        .catch(error => console.error('Error:', error));
});

document.addEventListener('DOMContentLoaded', function() {
    fetchCurrentGoal();
});

function fetchCurrentGoal() {
    const userId = sessionStorage.getItem('userId'); // 获取用户ID

    fetch(`http://localhost:8080/api/financialGoals/getby/?userId=${userId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('No active financial goal found.');
            }
            return response.json();
        })
        .then(data => {
            displayCurrentGoal(data);
        })
        .catch(error => {
            console.log(error.message);
            // 显示添加目标的表单
            document.getElementById('goalForm').style.display = 'block';
        });
}

function displayCurrentGoal(goal) {
    const currentGoalContainer = document.getElementById('currentGoalContainer');
    const progress = calculateProgress(goal.currentAmount, goal.targetAmount);

    // 示例：使用简单的文本和进度条显示目标进展
    currentGoalContainer.innerHTML = `
        <h3>${goal.goalName}</h3>
        <p>目标金额: ${goal.targetAmount}</p>
        <p>当前金额: ${goal.currentAmount}</p>
        <p>进度: ${progress}%</p>
        <progress value="${progress}" max="100"></progress>
    `;
}

function calculateProgress(current, target) {
    return (current / target * 100).toFixed(2);
}
