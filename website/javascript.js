const graphElement = document.getElementById('graph') ;
const barMeterElement = document.getElementById('meter') ;
const dailyGraphElement = document.getElementById('daily-graph') ;
let recordsAgo = 0 ;
let daysAgo = 0 ;
let cnt = 0 ;
let waterLevel = 0.0 ; // current water level in cm
let previous = 0.0 ;  // water level in previous interval
let minLevel = 0.0 ;    // min water level in cm
let threshold = 5.0 ; // threshold level in cm for alerting
let maxLevel = 12.0 ;  // max water level in cm
let maxRecords = 10 ;
let maxDays = 5 ;
let hasAlerted = false ;
let alertDuration = 0 ; // how long of system has been alerted in sec
let interval = 3 ; // update interval in sec
let subInterval = 10 ; // amount of main interval update before second graph updates
let avg = 0.0 ; // avg this day
let max = 0.0 ; // max this day
let buff = 0.0 ; // buffer
let buffCnt = 0 ;

const Records = getRecordsLabel(maxRecords)
let dates = getDateLabel(maxDays) ;
let data = [] ;
let dataPerDay = [[],[]] ; // avg, max
let colors = [] ;
let colorsPerDay = [[], []] ;
let meterColor = [['rgb(54, 162, 235)', 'rgba(150, 220, 255, 0.7)', 'rgba(255, 120, 180, 0.7)'], 
                  ['rgb(255, 99, 132)', 'rgba(255, 120, 180, 0.7)', 'rgba(255, 120, 180, 0.7)']] ;

const guageChartText = {
    id: 'guageChartText',
    afterDatasetsDraw(chart, args, pluinOptions) {
        const { ctx, data, chartArea: {top, bottom, left, right, width, height}, scales: {r} } = chart ;

        ctx.save() ;
        const yCoord = chart.getDatasetMeta(0).data[0].y
        ctx.font = '15px sans-serif' ;
        ctx.textBaseLine = 'top' ;
        ctx.fillText(minLevel, left + 60, yCoord + 60) ;
        ctx.fillText(maxLevel, right - 60, yCoord + 60) ;
        ctx.font = '40px sans-serif' ;
        ctx.textAlign = 'center' ;
        ctx.fillText(waterLevel.toFixed(2) + ' cm', (left+right)/2, (top+bottom)/1.55) ;
    }
}
        
const graph = new Chart(graphElement, {
    type: 'bar',
    data: {
        labels: Records
    ,
        datasets: [{
            type: 'bar',
            data: data,
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: colors,
            order: 2
        }, {
            type: 'line',
            data: data,
            fill: false,
            // borderColor: 'rgba(150, 220, 255, 0.7)',
            borderColor: 'rgba(100, 100, 100, 0.7)',
            order: 1
        }]
    },
    options: {
        scales : {
            y: {
                suggestedMin: minLevel,
                suggestedMax: maxLevel,
                title: {
                    display: true,
                    text: 'water level (cm)'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'seconds ago'
                }
            }
        },
        plugins: {
            legend: { display: false },
            annotation : {
                annotations: {
                    line1: {
                        type: 'line',
                        yMin: threshold,
                        yMax: threshold,
                        borderColor: 'rgb(255, 0, 0)',
                        borderWidth: 2
                    }
                }
            }
        }
    }
});

const meter = new Chart(barMeterElement, {
    type: 'pie',
    data: {
        datasets: [{
            data: isDanger(waterLevel) ? [waterLevel, 0, maxLevel-waterLevel] : [waterLevel, threshold-waterLevel, maxLevel-threshold],
            backgroundColor: meterColor[isDanger(waterLevel) ? 1 : 0],
            hoverOffset: 4,
            
        }],
    },
    options: {
        cutout: '65%',
        radius: '90%',
        rotation: -105, 
        circumference: 210,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                enabled: false
            }
        }
    },
    plugins: [guageChartText]
});

const daily = new Chart(dailyGraphElement, {
    type: 'bar',
    data: {
        labels: dates,
        datasets: [{
            type: 'bar',
            label: "average in day",
            data: dataPerDay[0],
            fill: false,
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgb(54, 162, 235)',
            stack: 1
        }, {
            type: 'bar',
            label: "maximum in day",
            data: dataPerDay[1],
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgb(25, 100, 180)',
            stack: 2
        }]
    },
    options: {
        scales : {
            x: {
                stacked: true
            },
            y: {
                suggestedMin: minLevel,
                suggestedMax: maxLevel
            }
        },
        plugins: {
            annotation : {
                annotations: {
                    line1: {
                        type: 'line',
                        yMin: threshold,
                        yMax: threshold,
                        borderColor: 'rgb(255, 0, 0)',
                        borderWidth: 2
                    }
                }
            }
        }
    }
});

// window.setInterval((function() {
//     console.log(waterLevel) ;
// }), 1000) ;

window.setInterval(update, 1000*interval) ;

function getDateLabel(length) {
    const dateLabel = [] ;
    for (var i = 1 ; i <= length ; i++)
        dateLabel.push(getDateBefore(new Date(), length-i)) ;
    return dateLabel ;
}

function getRecordsLabel(length) {
    const recordsLabel = [] ;
    for (var i = 1 ; i < length ; i++)
        recordsLabel.push((interval*(length-i)).toString() + 's') ;
    recordsLabel.push('now') ;
    return recordsLabel ;
}

function setNewWaterLevel(newWaterLevel) {
    if (isNaN(newWaterLevel)) buff += previous ;
    else if (Math.abs(waterLevel - newWaterLevel) > 0.6*maxLevel) buff += previous ;
    else                      buff += newWaterLevel ;
    buffCnt++ ;
    console.log(buff, buffCnt) ;
}

let test = [ 0, 0, 1, 3, 4, 5, 6, 7, 6, 6, 8, 6, 5, 3, 2, 5, 6, 7 ] ;
let i = 0 ;
let mxx = test.length ;

function update() {
    // waterLevel = Math.random()*4 ;

    // console.log("ok") ;

    previous = waterLevel ;
    if (i < mxx) {
        waterLevel = test[i] ;
        i++ ;
    }

    // previous = waterLevel ;
    // waterLevel = parseFloat((buff/buffCnt).toFixed(2)) ;
    // buff = waterLevel ;
    // buffCnt = 1 ;

    // waterLevel = parseFloat(newWaterLevel) ;

    // waterLevel += Math.random()*4 + (waterLevel < threshold ? 0 : -10) ;

    if (isNaN(waterLevel))
        waterLevel = previous ;

    if (waterLevel < 0)
        waterLevel = 0 ;

    // if (Math.abs(waterLevel - previous) > 0.3*maxLevel)

    avg = ((cnt*avg + waterLevel) / (cnt+1)).toFixed(2) ;
    max = Math.max(max, waterLevel).toFixed(2) ;
    
    // update bar graph
    if (recordsAgo >= maxRecords)
        data.shift(), colors.shift() ;
    data.push(waterLevel.toFixed(2)) ;
    colors.splice(-1) ;
    if (recordsAgo > 0)
        colors.push(getColor(previous, false)) ;
    colors.push(getColor(waterLevel, true)) ;
    graph.update() ;

    // update meter bar
    meter.data.datasets.forEach((dataset) => {
        if (!isDanger(waterLevel)) {
            dataset.data = [waterLevel, threshold-waterLevel, maxLevel-threshold] ;
            dataset.backgroundColor = meterColor[0] ;
        } else {
            dataset.data = [waterLevel, 0, maxLevel-waterLevel] ;
            dataset.backgroundColor = meterColor[1] ;
        }
    });
    meter.update() ;

    // check alert time
    if (hasAlerted != isDanger(waterLevel)) {
        if (hasAlerted)
            addRecord() ;
        hasAlerted = !hasAlerted ;
        alertDuration = 0 ;
    } else {
        if (hasAlerted)
            alertDuration += interval ;
    }

    // update daily graph
    if (cnt >= subInterval-1) {
        if (daysAgo >= maxDays)
            dataPerDay[0].shift(), dataPerDay[1].shift(), colorsPerDay[0].shift(), colorsPerDay[1].shift() ;
        dataPerDay[0].push(avg), dataPerDay[1].push(max) ;
        colorsPerDay[0].push(getColor(avg)), colorsPerDay[1].push(getColor(max)) ;
        dates = getDateLabel(maxDays) ;
        daily.update() ;

        avg = 0, max = 0 ;
        cnt = 0 ;
        daysAgo++ ;
    } else {
        cnt++ ;
    }

    // console.log("Water level:", waterLevel); // Log the fetched value

    recordsAgo++ ;
}

function isDanger(value) {
    return value >= threshold ;
}

function getColor(value, isHighlight) {
    const normal = ['rgb(255, 99, 132)', 'rgb(54, 162, 235)'] ; // red, blue
    const highlighted = ['rgb(200, 50, 70)', 'rgb(25, 100, 180)'] ; // red, blue
    const barColor = [highlighted, normal] ;

    return barColor[isHighlight ? 0 : 1][isDanger(value) ? 0 : 1]
}

function addRecord() {
    const recordList = document.getElementById('record-list') ;
    if (recordList.childElementCount >= 5)
        recordList.removeChild(recordList.firstChild) ;

    // add new record
    const newRecord = document.createElement('div') ;
    var text = `alerted for ${alertDuration+interval} seconds at ` + new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString();
    const alertText = document.createTextNode(text) ;
    newRecord.appendChild(alertText) ;
    recordList.appendChild(newRecord) ;
}

function getDateBefore(date, before) {
    var d = date ;
    d.setDate(d.getDate() - before) ;
    return d.toLocaleDateString() ;
}
