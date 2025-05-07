<template>
    <div>
        <el-table :data="tableData" stripe style="width: 100%">
            <el-table-column fix prop="jobTitle" label="岗位名称" width="180" />
            <el-table-column prop="salary" label="薪资" width="180" />
            <el-table-column prop="company" label="企业全称" />
            <el-table-column prop="city" label="工作地点" />
            <el-table-column prop="publishTime" label="发布时间" />
            <el-table-column prop="companyInfo" label="所属行业" />
        </el-table>
    </div>
    <!-- 分页控件。用current-change 事件来处理当前页变动时候触发的事件 -->
    <el-pagination 
    class="pagination"
    background 
    layout="prev, pager, next" 
    :total="total" 
    @current-change="handleCurrentChange"
    />
</template>

<script setup>
import { getJobListData } from '@/utils/apis'
import { reactive } from 'vue';
import { ref, onMounted } from 'vue'
const currentPage = ref(1); // 当前选中的页码
const tableData = reactive([])
const total = ref(0) // 总记录数
const size = ref(0) // 当前页记录数

// 通过调用getJobListData接口获取当前页的数据，并将数据存储到tableData中。
const fetchData = (currentPage) => {
    getJobListData(currentPage.value).then(res => {
        // 拿数据之前要先将tableData清空，否则数据会累加
        tableData.length = 0
        // console.log(res.data.records);
        for (let i in res.data.records) {
            // console.log(res.data.records[i]);
            tableData.push(res.data.records[i]) // 将当前页的每条记录push
        }
        total.value=res.data.total
        size.value=res.data.size
        // console.log('总记录数：' + total.value,'当前页记录数:' + size.value)
    })
}
const handleCurrentChange=(newPage)=>{
    // console.log('改变后选中的页码为：' + newPage)
    currentPage.value=newPage
    fetchData(currentPage) // 选中的页码改变后再次fetchData发请求
}

// 组件已挂载时调用
onMounted(() => {
    fetchData(currentPage)
})
</script>

<style lang="less" scoped>
.pagination {
    margin-top: 30px;
    margin-left: 68%;
}
</style>