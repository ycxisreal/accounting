<template>
    <div class="financial-goals">
        <!-- 财务目标设定表单 -->
        <el-form :model="goalForm" :rules="goalFormRules" ref="goalFormRef" label-width="100px">
            <el-form-item label="目标名称" prop="goalName">
                <el-input v-model="goalForm.goalName"></el-input>
            </el-form-item>
            <el-form-item label="目标金额" prop="targetAmount">
                <el-input v-model.number="goalForm.targetAmount"></el-input>
            </el-form-item>
            <el-form-item label="日期选择" prop="targetDate">
                <el-date-picker v-model="goalForm.targetDate" type="date"></el-date-picker>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="submitGoal">提交目标</el-button>
            </el-form-item>
        </el-form>

        <!-- 当前财务目标容器 -->
        <div class="current-goal-container">
            <el-card v-for="(goal, index) in currentGoals" :key="index" class="goal-card">
                <div slot="header" class="goal-card-header">
                    {{ goal.goalName }}
                </div>
                <div class="goal-card-content">
                    <p>目标金额: {{ goal.targetAmount }}</p>
                    <p>当前金额: {{ goal.currentAmount }}</p>
                    <p>进度: {{ goal.progress }}%</p>
                    <el-progress :percentage="goal.progress"></el-progress>
                </div>
            </el-card>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import axios from 'axios';
interface Goal {
    goalName: string;
    targetAmount: number | null;
    currentAmount: number;
    targetDate: Date | null;
    progress: number;
}

const goalForm = ref({
    goalName: '',
    targetAmount: null,
    targetDate: null,
});

const goalFormRules = ref({
    goalName: [{ required: true, message: '请输入目标名称', trigger: 'blur' }],
    targetAmount: [{ required: true, message: '请输入目标金额', trigger: 'blur' }],
    targetDate: [{ required: true, message: '请选择日期', trigger: 'change' }],
});

const goalFormRef = ref<HTMLElement | null>(null);

const currentGoals = ref<Goal[]>([]);
onMounted(() => {
    console.log("11")
    get();
});
const get = () => {
    const userId = sessionStorage.getItem('userId'); // 获取用户ID

    fetch(`http://localhost:8080/api/financialGoals/current?userId=${userId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('No active financial goal found.');
            }
            return response.json();
        })
        .then(data => {
            const nGoal: Goal = {
                goalName: data.goalName,
                targetAmount: data.targetAmount!,
                currentAmount: data.currentAmount!,
                targetDate: data.deadline!,
                progress: 0, // 初始进度为0
            };
            currentGoals.value.push(nGoal)
        })
        .catch(error => {
            console.log(error.message);
        });
}
const submitGoal = async () => {

    // 处理目标提交逻辑，将目标添加到 currentGoals 数组中
    const newGoal: Goal = {
        goalName: goalForm.value.goalName,
        targetAmount: goalForm.value.targetAmount!,
        currentAmount: 0, // 初始当前金额为0
        targetDate: goalForm.value.targetDate!,
        progress: 0, // 初始进度为0
    };
    const id = sessionStorage.getItem('userId');
    // currentGoals.value.push(newGoal);
    try {
        const response = await axios.post('http://localhost:8080/api/financialGoals', {
            id: id, goalName: goalForm.value.goalName, targetAmount: goalForm.value.targetAmount, deadline: goalForm.value.targetDate
        });
        console.log('Response from server:', response.data);
    } catch (error) {
        console.error('Error posting data:', error);
    }
    // 清空表单
    goalForm.value = {
        goalName: '',
        targetAmount: null,
        targetDate: null,
    };

};

</script>

<style scoped>
.financial-goals {}

.current-goal-container {
    display: flex;
    justify-content: space-around;
    margin-top: 20px;
}

.goal-card {
    width: 300px;
    margin-bottom: 20px;
}

.goal-card-header {
    font-size: 16px;
    font-weight: bold;
    padding: 10px;
    background-color: #f0f0f0;
    border-bottom: 1px solid #ccc;
}

.goal-card-content {
    padding: 10px;
}
</style>
