<template>
    <div class="edit-category-container">
        <h1 class="title">分类管理</h1>
        <el-radio-group v-model="selectedType">
            <el-radio label="income">收入</el-radio>
            <el-radio label="expense">支出</el-radio>
        </el-radio-group>
        <el-table :data="filteredCategories" style="width: 100%">
            <el-table-column prop="id" label="ID"></el-table-column>
            <el-table-column prop="name" label="名称"></el-table-column>
            <el-table-column label="操作">
                <template #default="{ row }">
                    <el-button size="small" @click="showEditCategoryDialog(row)">编辑</el-button>
                    <el-button size="small" @click="deleteCategory(row.id)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-button @click="showAddCategoryDialog">添加分类</el-button>

        <!-- 添加分类对话框 -->
        <el-dialog title="添加新分类" v-model="addCategoryDialogVisible">
            <el-form :model="newCategory">
                <el-form-item label="分类名称" prop="name">
                    <el-input v-model="newCategory.name"></el-input>
                </el-form-item>
                <el-form-item label="类型" prop="type">
                    <el-select v-model="newCategory.type">
                        <el-option label="收入" value="income"></el-option>
                        <el-option label="支出" value="expense"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addCategoryDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addCategory">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 编辑分类对话框 -->
        <el-dialog title="编辑分类" v-model="editCategoryDialogVisible">
            <el-form :model="currentCategory">
                <el-form-item label="分类名称" prop="name">
                    <el-input v-model="currentCategory.name"></el-input>
                </el-form-item>
                <el-form-item label="类型" prop="type">
                    <el-select v-model="currentCategory.type">
                        <el-option label="收入" value="income"></el-option>
                        <el-option label="支出" value="expense"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editCategoryDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editCategory">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElRadioGroup, ElRadio, ElTable, ElTableColumn, ElButton, ElDialog, ElForm, ElFormItem, ElInput, ElSelect, ElOption } from 'element-plus';
import { nextTick } from 'vue';

interface Category {
    id: number;
    name: string;
    type: string;
}

const selectedType = ref('income');
const categories = ref<Category[]>([]);
const addCategoryDialogVisible = ref(false);
const editCategoryDialogVisible = ref(false);
const newCategory = ref({ name: '', type: 'income' });
const currentCategory = ref({ id: 0, name: '', type: 'income' });

const filteredCategories = computed(() => {
    return categories.value.filter(category => category.type === selectedType.value);
});

const fetchData = async () => {
    fetch('http://localhost:8080/api/categories/all')
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Network response was not ok.');
        })
        .then(data => {
            categories.value = data.map((category: { categoryId: any; categoryName: any; categoryType: any; }) => ({
                id: category.categoryId,
                name: category.categoryName,
                type: category.categoryType
            }));
            // alert('数据更新');
        })
        .catch(error => {
            console.error('Error:', error);
        });
};
const showEditCategoryDialog = (category: Category) => {
    currentCategory.value = { ...category };
    editCategoryDialogVisible.value = true;
};

const editCategory = () => {
    const index = categories.value.findIndex(c => c.id === currentCategory.value.id);
    if (index !== -1) {
        categories.value[index] = { ...currentCategory.value };
    }
    editCategoryDialogVisible.value = false;
};

const deleteCategory = (id: number) => {
    categories.value = categories.value.filter(c => c.id !== id);
};

const addCategory = () => {
    if (newCategory.value.name) {
        const newId = categories.value.length + 1; // 简单的 ID 生成逻辑
        categories.value.push({ id: newId, ...newCategory.value });
        newCategory.value = { name: '', type: 'income' }; // 重置表单
        addCategoryDialogVisible.value = false; // 关闭对话框
    }
};

const showAddCategoryDialog = () => {
    addCategoryDialogVisible.value = true;
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

.dialog-footer {
    text-align: right;
}
</style>
