import Plotly from 'plotly.js-dist-min'

var arrayTask = []
var arrayResource = []
const TaskWindow = document.getElementById('task-window');
const SelectViewObgect = document.getElementById('SelectViewObgect')


function ViewWindow(bpmnModeler){
    arrayTask = []
    arrayResource = []
    TaskWindow.classList.add('show');
    let RootElement = bpmnModeler._definitions.rootElements


    console.log(RootElement)
    RootElement.forEach(element => {
        if(element.$type == "bpmn:Resource"){
            arrayResource.push(element)
        }
        else if(element.$type == "bpmn:Process"){
            element.flowElements.forEach(flow => {
                if(flow.$type == "bpmn:Task"){
                    arrayTask.push(flow)
                }
            });
        }
    });

    console.log(arrayTask, arrayResource)
    CreateHTML()


}

function CreateHTML(){
    SelectViewObgect.innerHTML = ''
    let divResource = document.createElement('div')
    for (let index = 0; index < arrayResource.length; index++) {
        let ButtonResource = document.createElement('button')
        ButtonResource.id = index
        ButtonResource.className = "Resource"
        ButtonResource.innerText = arrayResource[index].name
        divResource.append(ButtonResource)     
    }

    let divTask = document.createElement('div')
    for (let index = 0; index < arrayTask.length; index++) {
        let buttonTask = document.createElement('button')
        buttonTask.id = index
        buttonTask.className = "Task"
        buttonTask.innerText = arrayTask[index].name
        divTask.append(buttonTask)  
    }
    let p = document.createElement('p')
    p.innerText = 'Список ресурсов:'
    SelectViewObgect.append(p)
    SelectViewObgect.append(divResource)
    

    p = document.createElement('p')
    p.innerText = 'Список задач:'
    SelectViewObgect.append(p)
    SelectViewObgect.append(divTask)
    
}
const grapfDiv = document.getElementById('task-ViewGraph')
var Grafarrtime = []
var Grafarrbase = []
var GrafyAxis = []
var GrafColor = []
function CreateGrafData(element){
    let arrtime = []
    let arrbase = []
    let yAxis = []
    let color = []
    let lasttime = 0

    try{
        element.extensionElements.values.forEach(props => {
        if(props.$type == "ltsm:props" && props.hasOwnProperty("availability_time") && props.hasOwnProperty("availability_value")){
          if(props.availability_value == 1){
            arrbase.push(props.availability_time)
            yAxis.push(element.name)
            if(element.$type == "bpmn:Task"){
                color.push('rgba(222,45,38,0.8)')
            }
            else if(element.$type == "bpmn:Resource"){
                color.push('rgba(204,204,204,1)')
            }
            lasttime = props.availability_time
          }
          else{
            if(arrbase.length !== 0){
              arrtime.push(props.availability_time - lasttime)
            }
          }
        }
    })}
    catch (error){
        console.log(error)
    }

    console.log("Работа")
    if(arrbase.length > 0){
        if(arrbase.length > arrtime.length){
          arrtime.push(5)
        }
        if(arrtime.length == arrbase.length && arrbase.length == yAxis.length && color.length == yAxis.length )
        {
            Grafarrtime = Grafarrtime.concat(arrtime)
            Grafarrbase = Grafarrbase.concat(arrbase)
            GrafyAxis = GrafyAxis.concat(yAxis)
            GrafColor = GrafColor.concat(color)
        }
        else{
            alert("Ошибка размера данных окон видимости")
        }
    }
   
    grapfDiv.innerHTML = ''
    Plotly.newPlot(grapfDiv, [{
        type: 'bar',
        y: GrafyAxis,
        x: Grafarrtime,
        orientation: 'h',
        base: Grafarrbase,
        marker:{
            color: GrafColor
        },
      },])
}

TaskWindow.addEventListener('click', function(event){
    if(event.target.id != undefined && event.target.className == "Task"){
        console.log("Задача: ", arrayTask[event.target.id])
        CreateGrafData(arrayTask[event.target.id])
    }
    else if(event.target.id != undefined && event.target.className == "Resource"){
        console.log("Ресурс: ", arrayResource[event.target.id])
        CreateGrafData(arrayResource[event.target.id])
    }
})

export{
    ViewWindow,
}