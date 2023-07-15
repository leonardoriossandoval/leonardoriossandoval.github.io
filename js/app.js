/* Valors per tots */
Chart.defaults.color = '#000' /* Color del text */
Chart.defaults.borderColor = '#444'



const printCharts = () => {

    renderModelsChart()

}
const renderModelsChart = () => {
    const data = {
        labels: ['Customer Service', 'Coding', 'Engineering','Sales'],
        datasets: [{
            data:[20, 20, 50,10],
            borderColor: getDataColors(),
            backgroundColor:getDataColors(20)
    }]


    }

    const options = {
        /*plugins:{
            legend:{position:'left'}
        }*/
    }



    new Chart('modelsChart', {type:'doughnut',data,options})
}


printCharts()