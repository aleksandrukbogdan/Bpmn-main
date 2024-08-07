import BpmnModeler from 'bpmn-js/lib/Modeler';
import TokenSimulationModule from 'bpmn-js-token-simulation';

import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
} from 'bpmn-js-properties-panel'; //для панели свойств4

import minimapModule from 'diagram-js-minimap';

import Plotly from 'plotly.js-dist-min'

import diagramXML from '../resources/mytry.bpmn'; // путь к заготовке схемы

import customModule from './custom'; // папка с надстройками bpmn-js

import qaExtension from '../resources/qa'; // подгрузка кастмных моделей обьекта qa
import ltsmExtension from '../resources/ltsm'; // подгрузка кастомных моделей обьекта list

import resourcePropertiesProvider from './custom';
import ltsmPropertiesProvider from './custom';
import {ViewWindow} from './InterfaceJS/ViewWindow'
import {UppdateResourceList} from './InterfaceJS/ResourceWindow'

const buttonSaveXML = document.querySelector('.button_save');
const HIGH_PRIORITY = 1500; // повышаем приоритет что бы система была важнее дефолтной(1000)

const containerEl = document.getElementById('container') //тут всё отображение




// create modeler
const bpmnModeler = new BpmnModeler({
  container: containerEl,
  propertiesPanel: { // из примера с панелью св
    parent: '#properties'
  },
  additionalModules: [ // подгрузка модулей
    customModule,
    minimapModule,
    
    BpmnPropertiesPanelModule, // из примера с панелью св
    BpmnPropertiesProviderModule, // из примера с панелью св
    resourcePropertiesProvider,
    ltsmPropertiesProvider,
    TokenSimulationModule
    
  ],
  moddleExtensions: {
    qa: qaExtension, 
    ltsm: ltsmExtension // добавление расширения модели
  }
});


const buttonViewVindow = document.getElementById('button_ViewWindow')
buttonViewVindow.addEventListener('click', function(){
  ViewWindow(bpmnModeler)
})

const buttonShowResource = document.getElementById('resource_panel');
buttonShowResource.addEventListener('click', async function() {
  UppdateResourceList(bpmnModeler)
})
// import file button
const buttonImportXML = document.getElementById('file-BPMN');
const reader = new FileReader();
buttonImportXML.addEventListener('change', function(file_input) {
  if (file_input.target.files[0]) {
    var file = file_input.target.files[0];
    reader.readAsText(file);
    reader.addEventListener('load', (e) => {
      importXMLfromFile(reader.result);
    });
    reader.addEventListener('error', () => {
      console.error(`Произошла ошибка при чтении файла`);
    });
  }
})

// save file button
const saveWindow = document.getElementById('save-window');
// Обработчик клика по кнопке "Сохранить"
buttonSaveXML.addEventListener('click', async function() {
  try {
    const { xml } = await bpmnModeler.saveXML();
    //console.log(xml);
    const blob = new Blob([xml], { type: 'application/bpmn' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.getElementById('downloadLink');
    downloadLink.href = url;
    saveWindow.classList.add('show');
    
  } catch (err) {
    console.log(err);
    alert("ERROR")
  }

});
var save_content = document.getElementById("save-content")
var window_graphic = document.getElementById("window-graphic");
var download_text = document.getElementById('download-text')
const downloadLink_server = document.getElementById('downloadLink-server');
var WorkTask = [];
var WorkResource = [];
var all_id = [];
// Обработчик нажатия на загрузку на сервер
downloadLink_server.addEventListener("click", async function() {
  const { xml } = await bpmnModeler.saveXML();
  // Создаем Blob объект с типом text/xml
  const blob = new Blob([xml], { type: 'application/bpmn' });
  console.log(blob, "nen")
  // Создаем ссылку для скачивания файла
  var fd = new FormData();
  download_text.innerText = "Файл загружается на сервер..."
  fd.append('upload', blob, 'file.bpmn');
  try {
    $.ajax({
      type: 'POST',
      url: 'http://localhost:3000/api/',
      data: fd,
      processData: false,
      contentType: false
  }).done(async function(data) {
    var all_keys = [];
    var all_values = [];
    
    WorkTask.push(data['WorkTask'])
    WorkResource.push(data['WorkResource'])

    WorkTask[0].forEach((ind)=> {
      all_id.push(ind['id']);
    })


    console.log(WorkTask);
    console.log(WorkResource);
    console.log(all_id);
    for (let key in data) {
      all_keys.push(key);
      all_values.push(data[key]);
    }
    console.log(all_keys);
    console.log(all_values);

    let data_k = [];
    let data_v = [];
    let data_graph = [];
    for (let key in all_values[0]) {
      data_k.push(key);
      data_v.push(all_values[0][key]);
    }
    console.log(data_k);
    console.log(data_v);
    await Scatterpolar(data_k, data_v);
    await Gisto_hrzn(WorkTask, 'Gisto_task', 1);
    await Gisto_hrzn(WorkResource, 'Gisto_resource', 1);
    save_content.style.display = 'none';
    window_graphic.style.display = "flex";
    console.log("Расчеты завершены");
});
  }catch(error){
    console.log(error);
  }
})


function Scatterpolar(data_k, data_v){
  let data_keys = [];
  let data_values = [];
  data_keys = data_k.slice(0);
  data_values = data_v.slice(0);
  console.log(data_values);
  let th = [];
  th = data_keys;
  for (let i = data_values.length - 1; i >= 0; i--) {
    data_values[i].splice(0,1);
  }

  console.log(data_values);
  let maxRow = data_values.map(function(row){ return Math.max.apply(Math, row); });
  for (let i = maxRow.length - 1; i >= 0; i--) {
    if(maxRow[i] == 0 || data_values[i].length == 0){
      maxRow.splice(i, 1);
      th.splice(i, 1);
      data_values.splice(i, 1);
    }
  }
  console.log(data_values);
  console.log(th);
  console.log(maxRow);

  let size = th.length;
  let r_values_r = [];
  for (let i = 0; i < data_values[0].length; i++) {
    r_values_r[i] = []; 
    for (let j = 0; j < size; j++) {
      r_values_r[i][j] = data_values[j][i]/maxRow[j]; 
      if (isNaN(r_values_r[i][j])) {
        r_values_r[i][j] = 0;
      }
    }
  }
  console.log(r_values_r);
    //r_values_r[i-1] = Array.from(r_values_r, x => x ?? 0);
  let data = [];
  let data_sets = {r:[], theta:[], type: '', 
      fill: '',
      name:''}
  for (let i = 0; i < all_id.length; i++) {
      data_sets = {r:r_values_r[i], theta:th, type: 'scatterpolar', 
        fill: 'toself',
        name: 'i = ' + String(i+1)}
      data[i] = data_sets;
    }
  Plotly.newPlot('Scatterplot', data);
  createTableBody(th, data_values);
}

function createTableBody(data_keys, data_values) {
  let rows = 2;
  let table = document.getElementById('graph_table');
  table.innerHTML = ("<tr>" + ("<td></td>").repeat(data_keys.length) + "</tr>").repeat(rows);
  let td = document.querySelectorAll('td');
  for(let i = 0; i < data_keys.length; i++) {
    td[i].textContent = data_keys[i];
  }
  for(let i = data_keys.length; i < td.length; i++) {
    for(let j = 0; j < data_values[i-data_keys.length].length; j++){
      td[i].innerHTML += String(data_values[i-data_keys.length][j]) + "<br>";
    }
  }   
}

var n = 0;

function Gisto_hrzn(Work_datas, name, grapf_id){
  let work_data = Work_datas[0][grapf_id-1];
  let datas = [];
  let color_toappend = [];
  let legeng_toappend = [];
  datas.push(work_data['data']);
  color_toappend.push(work_data['colors']);
  
  console.log(color_toappend);
  console.log(work_data);
  console.log(datas);
  let y_toappend =[];
  let x_toappend = [];
  datas[0].forEach((ind)=> {
    y_toappend.push(ind['Task']);
    y_toappend.push(ind['Task']);
    legeng_toappend.push(ind['Resource']);
    //legeng_toappend.push(ind['Resource']);
    x_toappend.push(ind['Start']);
    x_toappend.push(ind['Finish']);
  })
  
  console.log(y_toappend);
  console.log(x_toappend);
  console.log(legeng_toappend);
  /*
  for(let items in datas) {
    for (let key in items){
      if (key === 'Task' && name === 'Gisto_task') {
        y_toappend.push(datas[items][key]);
        x_toappend.push(datas[items][''])
      }
      else if (key === 'Task' && name === 'Gisto_resource') {
        y_toappend.push(datas[items][key]);
      }
    }
  }*/
 let data = [];
 let temp_x = [];
 let temp_y = [];
 let temp_name = [];
 let j = 0;
 let data_sets = {x:[], y:[], type: '', 
  opacity: 0.5,
  line: { color: 'red', width: 40 },
  mode: 'lines',  name:''}
 for (let i = 0; i < y_toappend.length/2; i++) {
  temp_x.push(x_toappend[j]);
  temp_x.push(x_toappend[j+1]);
  temp_y.push(y_toappend[j]);
  temp_y.push(y_toappend[j+1]);
  j += 2;

  data_sets = {x: temp_x, y: temp_y, type: 'scatter', 
    opacity: 0.5, line: {color: color_toappend[0][i], width: 30 }, 
    mode: 'lines', name: legeng_toappend[i]}
  data[i] = data_sets;
  temp_x = [];
  temp_y = [];
  temp_name = [];
 }
 let title = '';
  if (n%2 == 0) {
    title = 'Расписание работ по ресурсам';
  }
  else {
    title = 'Расписание работ по задачам';
  }
  let layout = {
    showlegend: true,
    legend: {
      orientation: "h",
      family: 'Times New Roman',
      size: 12,
      color: 'rgb(82, 82, 82)'
    },
    height: 400,
    width: 900,
    //title: title,
    xaxis: {
      showline: true,
      showgrid: false,
      showticklabels: true,
      linecolor: 'rgb(204,204,204)',
      linewidth: 2,
      autotick: true,
      ticks: 'outside',
      tickcolor: 'rgb(204,204,204)',
      tickwidth: 2,
      ticklen: 5,
      tickfont: {
        family: 'Times New Roman',
        size: 12,
        color: 'rgb(82, 82, 82)'
      }
    },
    yaxis: {
      showgrid: false,
      zeroline: false,
      showline: true,
      showticklabels: true,
      linecolor: 'rgb(204,204,204)',
      linewidth: 2,
      autotick: false,
      ticks: 'outside',
      tickcolor: 'rgb(204,204,204)',
      tickwidth: 2,
      ticklen: 5,
      tickfont: {
        family: 'Times New Roman',
        size: 12,
        color: 'rgb(82, 82, 82)'
      }
    },
    autosize: true,
    margin: {
      autoexpand: false,
      l: 200,
      r: 100,
      t: 100
    },
    annotations: [
      {
        xref: 'paper',
        yref: 'paper',
        x: 0.0,
        y: 1.05,
        xanchor: 'left',
        yanchor: 'bottom',
        text: title,
        font:{
          family: 'Times New Roman',
          size: 20,
          color: 'rgb(37,37,37)'
        },
        showarrow: false
      }
    ]
  };
  
  Plotly.newPlot(name, data, layout);
  n += 1;
}

var button_pages = document.querySelectorAll('button.id_text');
button_pages.forEach(function(elem) {
  elem.addEventListener("click", async function() {
    let ind = Number(elem.textContent);
    console.log(ind);
    Gisto_hrzn(WorkTask, 'Gisto_task', ind);
    Gisto_hrzn(WorkResource, 'Gisto_resource', ind);
      
  });
});



// Закрытие модального окна при клике на фон
saveWindow.addEventListener('click', function(event) {
  if (event.target === saveWindow) {
    saveWindow.classList.remove('show');
    save_content.style.display = 'block';
    window_graphic.style.display = 'none';
    download_text.innerText = "Файл готов к загрузке"
  }
  
});

// import XML
importXMLfromFile(diagramXML); //предустановка
function importXMLfromFile(file){
  
bpmnModeler.importXML(file).then(() => {
  /*
  const moddle = bpmnModeler.get('moddle'),
        modeling = bpmnModeler.get('modeling');
  const RootElement = bpmnModeler._definitions.rootElements
*/
  
  let businessObject,
      element;

  /*Это было добавление кнопки окон видимости в панель свойств
  let panel = document.getElementsByClassName("bio-properties-panel-scroll-container")[0] //Добавление кнопки на панель
  let buttonDiv = document.createElement("button")
  buttonDiv.innerHTML = 'Другое'
  buttonDiv.id = "button-showViewWindow"
  panel.append(buttonDiv)
  const Button_infoTask = document.getElementById("button-showViewWindow")
  Button_infoTask.style.display = "none"*/


  bpmnModeler.on('element.contextmenu', HIGH_PRIORITY, (event) => { //нужно только для информации по обьекту правой кнопкой мыши( вермено )
    event.originalEvent.preventDefault();
    event.originalEvent.stopPropagation();
    ({ element } = event);
    // ignore root element
    if (!element.parent) {
      return;
    }
    businessObject = getBusinessObject(element)
    console.log(element)
  });


  bpmnModeler.on('element.click', HIGH_PRIORITY, (event) => { //нажатие левой кнопкой по таску
    event.originalEvent.preventDefault();
    event.originalEvent.stopPropagation();
    ({ element } = event);
    // ignore root element
    if (!element.parent) {
      return;
    }
    //businessObject = getBusinessObject(element)
    /*
    if(businessObject.$type == "bpmn:Task"){
      Button_infoTask.style.display = "block"
    }else{
      Button_infoTask.style.display = "none"
    }*/
    console.log(element)
  });

  /* Отображене окон видимости операции
  const TaskWindow = document.getElementById('task-window');
  TaskWindow.addEventListener('click', function(event) {
    if (event.target === TaskWindow) {
      TaskWindow.classList.remove('show');
    }
  });
  Button_infoTask.addEventListener("click", function(event){
    TaskWindow.classList.add('show');
    console.log(businessObject)
    let arrtime = []
    let arrbase = []
    let yAxis = []
    let hoverText = []
    let lasttime = 0
    try{
      businessObject.extensionElements.values.forEach(props => {
      if(props.$type == "ltsm:props" && props.hasOwnProperty("availability_time") && props.hasOwnProperty("availability_value")){
        if(props.availability_value == 1){
          arrbase.push(props.availability_time)
          yAxis.push(0)
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
    if(arrbase.length > 0){

      
      if(arrbase.length > arrtime.length){
        arrtime.push(5)
      }
      for (let index = 0; index < arrbase.length; index++) {
        hoverText.push(String(arrbase[index]) + " to " + String(arrbase[index] + arrtime[index]))
        console.log(String(arrbase[index]) + " to " + String(arrbase[index] + arrtime[index]))
      }

      console.log(arrtime, arrbase)

      let grapfDiv = document.getElementById('task-ViewGraph')
      grapfDiv.innerHTML = ''
      Plotly.newPlot(grapfDiv, [{
        type: 'bar',
        y: yAxis,
        x: arrtime,
        orientation: 'h',
        text: hoverText,
        base: arrbase
      },])
    }
    else{
      document.getElementById('task-ViewGraph').innerHTML = ''
    }
  })*/


  bpmnModeler.get('minimap').open();

}).catch((err) => {
  console.error(err);
});
}
