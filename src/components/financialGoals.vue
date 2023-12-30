<template>
    <div class="financial-goals">
        <!-- 财务目标设定表单 -->
        <form action="" id="goalForm">
            <input v-model="goalName" name="目标名称" required>
            <input v-model.number="targetAmount" name="目标金额" required>
            <input v-model="targetDate" name="日期选择" type="date">
            <button type="submit" @click="submitGoal">提交目标</button>
        </form>


        <div class="currentGoalContainer">
        </div>
    </div>
</template>
<script setup lang="js">
import { ref } from 'vue';


let goalName = ref('')
let targetAmount = ref(1)
let targetDate = ref(null)


function submitGoal() {
    const userId = sessionStorage.getItem('userId'); // 或其他方式获取用户ID

    fetch('http://localhost:8080/api/financialGoals/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, goalName: goalForm.value.goalName, targetAmount: goalForm.value.targetAmount, deadline: goalForm.value.targetDate })
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            // 在这里处理响应，例如更新页面上的目标列表
            fetchCurrentGoal()
        })
        .catch(error => console.error('Error:', error));
}

// document.addEventListener('DOMContentLoaded', function () {
//     fetchCurrentGoal();
// });
// async function fetchCurrentGoal() {
//     try {
//         const userId = sessionStorage.getItem('userId'); // 获取用户ID

//         const response = await fetch(`http://localhost:8080/api/financialGoals/getby/?userId=${userId}`);
//         if (!response.ok) {
//             throw new Error('No active financial goal found.');
//         }

//         const data = await response.json();
//         displayCurrentGoal(data);
//     } catch (error) {
//         console.log(error.message);
//         // 显示添加目标的表单
//         document.getElementById('goalForm').style.display = 'block';
//     }
// }

// function displayCurrentGoal(goal) {
//     const currentGoalContainer = document.getElementById('currentGoalContainer');

//     // 在这里添加安全检查，确保 goal 不为 undefined
//     if (goal && goal.goalName) {
//         const progress = calculateProgress(goal.currentAmount, goal.targetAmount);

//         // 示例：使用简单的文本和进度条显示目标进展
//         currentGoalContainer.innerHTML = `
//             <el-card>
//                 <h3>${goal.goalName}</h3>
//                 <p>目标金额: ${goal.targetAmount}</p>
//                 <p>当前金额: ${goal.currentAmount}</p>
//                 <p>进度: ${progress}%</p>
//                 <progress value="${progress}" max="100"></progress>
//             </el-card>
//         `;
//     } else {
//         console.error('Invalid goal data:', goal);
//     }
// }
function fetchCurrentGoal() {
    const id = sessionStorage.getItem('userId'); // 获取用户ID

    fetch('http://localhost:8080/api/financialGoals/getby', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
    })
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

</script>