<template>
    <div class="container">
        <div class="form-container">
            <el-card class="border-card" shadow="hover">
                <el-form :model="form" :rules="rules" ref="signupForm" class="signup-form" label-width="120px">
                    <!-- 事务类型选择 -->
                    <el-form-item label="事务类型" prop="taskType">
                        <el-radio-group v-model="form.taskType">
                            <el-radio label="normal">普通事务</el-radio>
                            <el-radio label="regular">定期事务</el-radio>
                        </el-radio-group>
                    </el-form-item>

                    <!-- 记账类型 -->
                    <el-form-item label="记账类型" prop="accountType">
                        <el-radio-group v-model="form.accountType">
                            <el-radio label="income">收入</el-radio>
                            <el-radio label="outcome">支出</el-radio>
                        </el-radio-group>
                    </el-form-item>

                    <!-- 选择类别 -->
                    <el-form-item label="选择类别" prop="category">
                        <el-select v-model="form.categoryId" placeholder="请选择类别">
                            <el-option label="餐饮" value=1></el-option>
                            <el-option label="购物" value=2></el-option>
                            <el-option label="住房" value=3></el-option>
                            <el-option label="交通" value=4></el-option>
                            <el-option label="娱乐" value=5></el-option>
                            <el-option label="教育" value=6></el-option>
                            <el-option label="医疗健康" value=7></el-option>
                            <el-option label="公共事业" value=8></el-option>
                            <el-option label="投资理财" value=9></el-option>
                            <el-option label="个人护理" value=10></el-option>
                            <el-option label="工资" value=11></el-option>
                            <el-option label="兼职" value=12></el-option>
                            <el-option label="投资" value=13></el-option>
                            <el-option label="礼物" value=14></el-option>
                            <el-option label="其他" value=15></el-option>

                        </el-select>
                    </el-form-item>

                    <!-- 数量 -->
                    <el-form-item label="金额" prop="amount">
                        <el-input-number v-model="form.amount" controls-position="right" :min="0"></el-input-number>
                    </el-form-item>

                    <!-- 时间单位，仅在选择了定期事务时显示 -->
                    <el-form-item label="时间单位" prop="timeUnit" v-if="form.taskType === 'regular'">
                        <el-radio-group v-model="form.scheduleType">
                            <el-radio label="daily">每天</el-radio>
                            <el-radio label="weekly">每周</el-radio>
                            <el-radio label="monthly">每月</el-radio>
                            <el-radio label="yearly">每年</el-radio>
                        </el-radio-group>
                    </el-form-item>

                    <!-- 日期选择 -->
                    <el-form-item label="日期选择" prop="date">
                        <el-date-picker v-model="form.transactionDate" type="date" :format="dateFormat"
                            placeholder="选择日期"></el-date-picker>
                    </el-form-item>

                    <!-- 描述 -->
                    <el-form-item label="描述" prop="description">
                        <el-input v-model="form.description" :rows="2" type="textarea" placeholder="输入描述"></el-input>
                    </el-form-item>

                    <!-- 提交按钮 -->
                    <el-form-item>
                        <el-button type="primary" @click="submitForm">提交</el-button>
                    </el-form-item>
                </el-form>
            </el-card>
        </div>
        <el-container id="calendar">
            <el-calendar v-model="form.transactionDate" header="日期选择"></el-calendar>
        </el-container>
    </div>
</template>

<script lang="ts">
export default {
    name: "submission"
}
</script>
<script setup lang="ts">
import { ref } from 'vue';
import { ElCard, ElForm, ElFormItem, ElRadio, ElRadioGroup, ElSelect, ElOption, ElInputNumber, ElDatePicker, ElInput, ElButton } from 'element-plus';
import router from '@/router';

const form = ref({
    taskType: 'normal', // 事务类型
    accountType: 'income', // 记账类型
    categoryId: 0, // 类别
    amount: 0, // 数量
    scheduleType: 'daily', // 时间单位
    transactionDate: '', // 日期
    description: '' // 描述
});
const dateFormat = 'YYYY-MM-DD';
var userId = sessionStorage.getItem('userId');
const rules = ref({
    taskType: [{ required: true, message: '请选择事务类型', trigger: 'blur' }],
    accountType: [{ required: true, message: '请选择记账类型', trigger: 'blur' }],
    category: [{ required: true, message: '请选择类别', trigger: 'blur' }],
    amount: [{ required: true, message: '请输入数量', trigger: 'blur' }],
    // 时间单位验证规则仅在选择了定期事务时应用
    timeUnit: form.value.taskType === 'regular' ? [{ required: true, message: '请选择时间单位', trigger: 'blur' }] : [],
    description: [{ required: true, message: '请输入描述', trigger: 'blur' }]
});

const submitForm = () => {
    // 提交表单逻辑、
    if (!userId) {
        alert("User ID is not available. Please login again.");
        router.push('/login1')
        return;
    }
    if (form.value.taskType === 'normal') {
        fetch('http://localhost:8080/api/transactions/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId, amount: form.value.amount, transactionDate: form.value.transactionDate, categoryId: form.value.categoryId, description: form.value.description })
        })
            .then(response => {
                if (response.ok) {
                    alert('Transaction recorded successfully');
                    return response.json(); // 如果您需要处理返回的数据
                } else {
                    throw new Error('Server responded with a status: ' + response.status);
                }
            })
            .then(data => {
                // 处理返回的数据（如果有）
            })
            .catch(error => console.error('Error:', error));
    } else {
        fetch('http://localhost:8080/api/scheduledTransactions/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId, categoryId: form.value.categoryId, amount: form.value.amount, scheduleType: form.value.scheduleType, nextOccurrence: form.value.transactionDate, description: form.value.description })
        })
            .then(response => {
                if (response.ok) {
                    alert('Scheduled transaction set successfully');
                } else {
                    alert('Failed to set scheduled transaction');
                }
            })
            .catch(error => console.error('Error:', error));
    }


};
</script>

<style scoped>
/* .form-container {
    width: 100%;
    margin-left: 5%;

}

#calendar {
    width: 100%;
    margin-left: 5%;
} */
.container {
    display: flex;
    justify-content: space-between;
    /* 或者其他对齐方式 */
}

.form-container,
#calendar {
    width: 48%;
    /* 或者根据需要调整 */
}

.border-card {
    border: 5px solid #ebeef5;
    border-radius: 8px;
}

.signup-form {
    margin-top: 20px;
}
</style>
