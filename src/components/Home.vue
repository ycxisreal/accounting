<template>
    <div>
        <el-container class="ycx">
            <el-header id="header">
                <div class="left-content">
                    <h1>账单管理系统</h1>
                    <h1>{{ currentTime }}</h1>
                </div>
                <div class="right-content">
                    <el-avatar :size="80">user</el-avatar>
                    <el-dropdown trigger="click" size="large">
                        <span class="el-dropdown-link">
                            <i class="el-icon-arrow-down"></i>
                        </span>
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item @click="">退出登录</el-dropdown-item>
                            <el-dropdown-item @click="">修改账户</el-dropdown-item>
                            <el-dropdown-item @click="">查看账单总数</el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>
                </div>

            </el-header>
            <el-container class="custom-container">
                <el-aside class="y" width="15%">
                    <el-scrollbar>
                        <el-menu default-active="" class="el-menu-vertical-demo" @open="handleOpen" @close="handleClose"
                            active-text-color="#ffd04b" background-color="#79bbff" text-color="#fff">
                            <el-sub-menu index="1">
                                <template #title>
                                    <el-icon>
                                        <location />
                                    </el-icon>
                                    <span>预算与收支</span>
                                </template>
                                <el-menu-item-group title="收 支 操 作">
                                    <el-menu-item index="1-1" @click="changeRoute(0)">添加收支记录</el-menu-item>
                                    <el-menu-item index="1-2" @click="changeRoute(1)">查看收支记录</el-menu-item>
                                </el-menu-item-group>
                                <el-menu-item-group title="预 算 操 作">
                                    <el-menu-item index="1-3" @click="changeRoute(2)">添加个人预算</el-menu-item>
                                    <el-menu-item index="1-4" @click="changeRoute(3)">预算跟踪</el-menu-item>
                                </el-menu-item-group>
                            </el-sub-menu>
                            <el-sub-menu index="2">
                                <template #title>
                                    <el-icon><icon-menu /></el-icon>
                                    <span>Navigator Two</span>
                                </template>
                                <el-menu-item-group title="Group">
                                    <el-menu-item index="2-1" @click="changeRoute(4)">收支类别管理</el-menu-item>
                                    <el-menu-item index="2-2" @click="changeRoute(5)">item two</el-menu-item>
                                </el-menu-item-group>
                                <el-menu-item-group title="Group">
                                    <el-menu-item index="2-3" @click="changeRoute(6)">item one</el-menu-item>
                                    <el-menu-item index="2-4" @click="changeRoute(7)">item two</el-menu-item>
                                    <el-menu-item index="2-5" @click="changeRoute(8)">item three</el-menu-item>
                                </el-menu-item-group>
                            </el-sub-menu>
                            <el-sub-menu index="3">
                                <template #title>
                                    <el-icon><icon-menu /></el-icon>
                                    <span>可视化数据统计</span>
                                </template>
                            </el-sub-menu>
                            <el-menu-item index="4">
                                <el-icon>
                                    <setting />
                                </el-icon>
                                <span>Navigator Four</span>
                            </el-menu-item>
                        </el-menu>
                    </el-scrollbar>
                </el-aside>

                <el-main>
                    <RouterView name="homeview"></RouterView>
                </el-main>
            </el-container>
        </el-container>
    </div>
</template>
  
<script lang='ts'>
export default {
    name: "App",
}
</script>
<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { RouterView, RouterLink, useRoute, useRouter } from 'vue-router'
import {
    Document,
    Menu as IconMenu,
    Location,
    Setting,
} from '@element-plus/icons-vue'
const currentTime = ref(''); // 用于存储实时时间的响应式数据

// 更新时间的函数
const updateTime = () => {
    const now = new Date();
    currentTime.value = now.toLocaleTimeString(); // 更新时间字符串
};

let intervalId: number | undefined;

onMounted(() => {
    updateTime(); // 首次挂载时立即更新时间
    intervalId = setInterval(updateTime, 1000); // 每秒更新时间
});

onUnmounted(() => {
    if (intervalId) clearInterval(intervalId); // 清除定时器
});

// const jia = ref(0)
const router = useRouter()
const handleOpen = (key: string, keyPath: string[]) => {
    console.log(key, keyPath)
}
const handleClose = (key: string, keyPath: string[]) => {
    console.log(key, keyPath)
}
function changeRoute(value: number) {
    let routePath = ""
    switch (value) {
        case 0: {
            routePath = '/home/submission'
            break
        }
        case 1: {
            routePath = '/home/iomanage'
            break
        }
        case 2: {
            routePath = '/home/budget'

            break
        }
        case 3: {
            routePath = '/home/budgetTracking'
            break
        }
        case 4: {
            routePath = '/home/editc'
            break
        }
        case 5: {
            routePath = '   '
            break
        }
        case 6: {
            window.location.href = '/summary.html';
            // routePath = '/home/FSummary'
            break
        }
        case 7: {
            routePath = '/home/summary'
            break
        }
        case 8: {
            routePath = '/home/test'
            break
        }

    }
    router.push(routePath)
}
</script>
<style scoped>
.y {
    position: relative;
    background-color: #008cff;
    color: black;
}

.ycx {
    height: 100vh;
}

.ycx .custom-container {
    height: 100%;
    background-color: #d8eff8;
    /* background-size: cover;
  background-position: center; */
}

#header {
    background-color: #008cff;
    /* 淡蓝色底色 */
    color: white;
    height: 15%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
}

.left-content {
    flex: 2;
}

.right-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: flex-end;
}

h1 {
    font-size: 24px;
    margin: 0;
}
</style>

  