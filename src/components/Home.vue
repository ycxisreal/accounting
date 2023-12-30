<template>
    <div>
        <el-container class="ycx">
            <el-header id="header">
                <div class="left-content">
                    <h1>账单管理系统</h1>
                </div>
                <div class="right-content">
                    <el-avatar :size="40">user</el-avatar>
                    <el-dropdown trigger="click" size="large">
                        <span class="el-dropdown-link">
                            <i class="el-icon-arrow-down"></i>
                        </span>
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
                            <el-dropdown-item @click="editAccount">修改账户</el-dropdown-item>
                            <el-dropdown-item @click="viewBillCount">查看账单总数</el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>
                </div>

            </el-header>
            <el-container class="custom-container">
                <el-aside class="y" width="200px">
                    <el-menu default-active="" class="el-menu-vertical-demo" @open="handleOpen" @close="handleClose"
                        active-text-color="#ffd04b" background-color="#79bbff" text-color="#fff">
                        <el-sub-menu index="1">
                            <template #title>
                                <el-icon>
                                    <location />
                                </el-icon>
                                <span>Navigator One</span>
                            </template>
                            <el-menu-item-group title="Group One">
                                <el-menu-item index="1-1" @click="changeRoute(0)">item one</el-menu-item>
                                <el-menu-item index="1-2" @click="changeRoute(1)">item two</el-menu-item>
                            </el-menu-item-group>
                            <el-menu-item-group title="Group Two">
                                <el-menu-item index="1-3" @click="changeRoute(2)">item three</el-menu-item>
                                <el-menu-item index="1-4" @click="changeRoute(3)">item four</el-menu-item>
                            </el-menu-item-group>
                        </el-sub-menu>
                        <el-sub-menu index="2">
                            <template #title>
                                <el-icon><icon-menu /></el-icon>
                                <span>Navigator Two</span>
                            </template>
                            <el-menu-item-group title="Group">
                                <el-menu-item index="2-1" @click="changeRoute(4)">item one</el-menu-item>
                                <el-menu-item index="2-2" @click="changeRoute(5)">item two</el-menu-item>
                            </el-menu-item-group>
                            <el-menu-item-group title="Group">
                                <el-menu-item index="2-3" @click="changeRoute(6)">item one</el-menu-item>
                                <el-menu-item index="2-4" @click="changeRoute(7)">item two</el-menu-item>
                                <el-menu-item index="2-5" @click="changeRoute(8)">item three</el-menu-item>
                            </el-menu-item-group>
                        </el-sub-menu>
                        <el-menu-item index="3">
                            <el-icon>
                                <document />
                            </el-icon>
                            <span>Navigator Three</span>
                        </el-menu-item>
                        <el-menu-item index="4">
                            <el-icon>
                                <setting />
                            </el-icon>
                            <span>Navigator Four</span>
                        </el-menu-item>
                    </el-menu>

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
import { ref } from 'vue'
import { RouterView, RouterLink, useRoute, useRouter } from 'vue-router'
import {
    Document,
    Menu as IconMenu,
    Location,
    Setting,
} from '@element-plus/icons-vue'
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
            routePath = '/'
            break
        }
        case 1: {
            routePath = '/signup'
            break
        }
        case 2: {
            routePath = '/home/submission'
            break
        }
        case 3: {
            routePath = '/home/editc'
            break
        }
        case 4: {
            routePath = '/home/iomanage'
            break
        }
        case 5: {
            routePath = '/home/budget'
            break
        }
        case 6: {
            window.location.href = '/summary.html';
            // routePath = '/home/FSummary'
            break
        }
        case 7: {
            routePath = '/home/BudgetTracking'
            break
        }
        case 8: {
            routePath = '/home/financialGoals'
            break
        }

    }
    router.push(routePath)
}
const logout = () => {
    // 处理退出登录逻辑
}

const editAccount = () => {
    // 处理修改账户逻辑
}

const viewBillCount = () => {
    // 处理查看账单总数逻辑
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
    background-color: #d8ebf8;
    /* background-size: cover;
  background-position: center; */
}

#header {
    background-color: #008cff;
    /* 淡蓝色底色 */
    color: white;
    height: 12%;
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

  