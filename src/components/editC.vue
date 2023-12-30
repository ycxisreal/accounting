<template>
    <div class="edit-category-container">
        <h1 class="title">分类管理</h1>
        <el-radio-group v-model="selectedType" @change="fetchData">
            <el-radio label="income">收入</el-radio>
            <el-radio label="outcome">支出</el-radio>
        </el-radio-group>
        <el-table :data="categories" style="width: 100%">
            <el-table-column prop="id" label="ID"></el-table-column>
            <el-table-column prop="name" label="名称"></el-table-column>
            <el-table-column label="操作">
                <template #default="{ row }">
                    <el-button size="small" @click="editCategory(row)">编辑</el-button>
                    <el-button size="small" @click="deleteCategory(row.id)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-button @click="addCategory">添加分类</el-button>
    </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElRadio, ElRadioGroup, ElTable, ElTableColumn, ElButton } from 'element-plus';

interface Category {
    id: number;
    name: string;
    type: string;
}

const selectedType = ref('income');
const categories = ref<Category[]>([]);

const fetchData = async () => {
    // 模拟发送请求获取数据
    const response = await fetchCategories(selectedType.value);
    categories.value = response;
};

const fetchCategories = async (type: string): Promise<Category[]> => {
    // 在这里发送请求到服务器，获取对应类型的数据
    // 示例数据
    return [
        { id: 1, name: '分类1', type: 'income' },
        { id: 2, name: '分类2', type: 'outcome' },
        // ...
    ].filter(c => c.type === type);
};

const editCategory = (category: Category) => {
    // 编辑分类的逻辑
    console.log('编辑分类', category);
};

const deleteCategory = async (id: number) => {
    // 删除分类的逻辑
    console.log('删除分类', id);
};

const addCategory = () => {
    // 添加分类的逻辑
    console.log('添加分类');
};

onMounted(() => {
    fetchData();
});
</script>
<style scoped>
.edit-category-container {
    margin: 20px;
}

.title {
    font-size: 24px;
    margin-bottom: 20px;
    text-align: center;
}
</style>
