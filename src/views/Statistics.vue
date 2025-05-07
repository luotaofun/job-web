<template>
    <div id="chart" class="chart">

    </div>
</template>

<script setup>
import * as echarts from 'echarts'
import { getJobByCategory } from '@/utils/apis'
import { reactive } from 'vue';
import { ref, onMounted } from 'vue'

// 用categoryData保存后端接口响应数据
const categoryData = reactive({
    category: [],// 岗位名称
    count: [] //岗位数量
})
// 组件已挂载时调用
onMounted(() => {
    // 通过调用 getJobByCategory获取categoryDesc和quantity，并将数据存储到 categoryData 中。
    getJobByCategory().then(res => {
        // console.log(res.data);
        for (let i in res.data) {
            categoryData.category.push(res.data[i]
            ['categoryDesc'])
            categoryData.count.push(res.data[i]
            ['quantity'])
        }
        // 基于准备好的DOM，初始化echarts实例
        var myChart = echarts.init(document.getElementById('chart'))
        var option = {
            title: {
                // text: 'ECharts 入门示例'
            },
            tooltip: {},
            xAxis: {
                data: categoryData.category
            },
            yAxis: {},
            series: [
                {
                    name: '岗位数量',
                    type: 'bar',
                    data: categoryData.count
                }
            ]
        }
        // 绘制图表
        myChart.setOption(option);
    })

})
</script>

<style lang="less" scoped>
.chart {
    width: 100%;
    height: 550px;
}
</style>