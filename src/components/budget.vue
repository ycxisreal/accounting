<template>
    <div class="container">
        <div class="budget-container">
            <el-card class="border-card" shadow="hover">
                <el-form :model="form" :rules="rules" ref="budgetForm" class="budget-form" label-width="120px">
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

                    <el-form-item label="数量" prop="amount">
                        <el-input-number v-model="form.amount" controls-position="right" :min="0"></el-input-number>
                    </el-form-item>

                    <el-form-item label="时间单位" prop="timeUnit">
                        <el-radio-group v-model="form.timeUnit">
                            <el-radio label="monthly">每月</el-radio>
                            <el-radio label="yearly">每年</el-radio>
                        </el-radio-group>
                    </el-form-item>

                    <el-form-item label="初始日期" prop="startDate">
                        <el-date-picker v-model="form.startDate" type="date" placeholder="选择日期"></el-date-picker>
                    </el-form-item>

                    <el-form-item label="截止日期" prop="endDate">
                        <el-date-picker v-model="form.endDate" type="date" placeholder="选择日期"></el-date-picker>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="submitForm">提交</el-button>
                    </el-form-item>
                </el-form>
            </el-card>
        </div>
        <el-container id="calendar">
            <el-calendar v-model="form.startDate" header="日期选择"></el-calendar>
        </el-container>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElCard, ElForm, ElFormItem, ElSelect, ElOption, ElInputNumber, ElRadio, ElRadioGroup, ElDatePicker, ElInput, ElButton } from 'element-plus'

const form = ref({
    categoryId: '',
    amount: 0,
    timeUnit: 'yearly',
    startDate: '',
    endDate: '',
})

const rules = ref({
    category: [{ required: true, message: '请选择类别', trigger: 'blur' }],
    amount: [{ required: true, message: '请输入数量', trigger: 'blur' }],
    timeUnit: [{ required: true, message: '请选择时间单位', trigger: 'blur' }],
    startDate: [{ required: true, message: '请选择初始日期', trigger: 'blur' }],
    endDate: [{ required: false, message: '请选择截止日期', trigger: 'blur' }]
})

const calculateEndDate = () => {
    if (!form.value.startDate || !form.value.timeUnit) {
        return;
    }

    const startDate = new Date(form.value.startDate);
    switch (form.value.timeUnit) {
        case 'monthly':
            startDate.setMonth(startDate.getMonth() + 1);
            break;
        case 'yearly':
            startDate.setFullYear(startDate.getFullYear() + 1);
            break;
    }
    form.value.endDate = startDate.toISOString().split('T')[0];
}

// 监听时间单位和初始日期的变化
watch(() => [form.value.startDate, form.value.timeUnit], calculateEndDate);

const submitForm = () => {
    const userId = sessionStorage.getItem('userId'); // 获取用户ID
    const budgetData = {
        userId: userId,
        categoryId: form.value.categoryId,
        amount: form.value.amount,
        budgetPeriod: form.value.timeUnit,
        startDate: form.value.startDate,
        endDate: form.value.endDate
    };
    // 发送 POST 请求
    fetch('http://localhost:8080/api/budgets/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(budgetData)
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Network response was not ok.');
        })
        .then(data => {
            alert('Success');
        })
        .catch(error => {
            console.error('Error:', error);
        });
}
</script>

<style scoped>
.container {
    display: flex;
    justify-content: space-between;
    /* 或者其他对齐方式 */
}



.budget-container,
#calendar {
    width: 48%;
    /* 或者根据需要调整 */
}

.border-card {
    border: 5px solid #ebeef5;
    border-radius: 8px;
}

.border-card {
    border: 1px solid #ebeef5;
    border-radius: 8px;
}

.budget-form {
    margin-top: 20px;
}
</style>
