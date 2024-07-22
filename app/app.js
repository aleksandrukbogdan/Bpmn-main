import BpmnModeler from 'bpmn-js/lib/Modeler';
import TokenSimulationModule from 'bpmn-js-token-simulation';

import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
} from 'bpmn-js-properties-panel'; //для панели свойств4

import minimapModule from 'diagram-js-minimap';

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
  }).done(function(data) {
    console.log(data)
    let data_keys = [];
    let data_values = [];
    for (let key in data) {
      data_keys.push(key);
      data_values.push(data[key]);
    }
    createTableBody(data_keys, data_values);
    save_content.style.display = 'none';
    window_graphic.style.display = "flex";
    console.log("Расчеты завершены");
});
  }catch(error){
    console.log(error);
  }
})


function createTableBody(data_keys, data_values) {
  let rows = 2;
  let table = document.getElementById('graph_table');
  table.innerHTML = ("<tr>" + ("<td></td>").repeat(data_keys.length) + "</tr>").repeat(rows);
  let td = document.querySelectorAll('td');
  for(let i = 0; i < data_keys.length; i++) {
    td[i].textContent = data_keys[i];
  }
  for(let i = data_keys.length; i < td.length; i++) {
    for(let j = 1; j < data_values[i-data_keys.length].length; j++){
      td[i].innerHTML += String(data_values[i-data_keys.length][j]) + "<br>";
    }
  }
    
}


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
