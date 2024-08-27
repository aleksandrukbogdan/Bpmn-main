import BpmnModeler from 'bpmn-js/lib/Modeler';
import TokenSimulationModule from 'bpmn-js-token-simulation';

import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
} from 'bpmn-js-properties-panel'; //для панели свойств4

import minimapModule from 'diagram-js-minimap';

import customModule from './custom'; // папка с надстройками bpmn-js

import qaExtension from '../resources/qa'; // подгрузка кастмных моделей обьекта qa
import ltsmExtension from '../resources/ltsm'; // подгрузка кастомных моделей обьекта list
import typeObject from '../resources/typeObject'

import download from 'downloadjs';

import resourcePropertiesProvider from './custom';
import ltsmPropertiesProvider from './custom';

import {ViewWindow} from './InterfaceJS/ViewWindow'
import {UppdateResourceList} from './InterfaceJS/ResourceWindow'
import { StartModelling } from './InterfaceJS/ModellingStart';
import { CreateWindowResult } from './InterfaceJS/VisualizationCalculationResults';
import { ProcessingGlobalActions, InitWorkflow } from './InterfaceJS/WorkflowButton'
import { Show_TypeList } from './InterfaceJS/WorkflowButton'

const buttonSaveXML = document.getElementById("buttonSaveXML")
const buttonSaveSVG = document.getElementById("buttonSaveSVG")
const downloadLink_server = document.getElementById('button_start');

const HIGH_PRIORITY = 1500; // повышаем приоритет что бы система была важнее дефолтной(1000)


const project_list = document.getElementById("project_list")
const flex_workplace = document.getElementById("flex_workplace")
const content = document.getElementById("content")


var modelling_rezult = {} // результаты расчётов
let DiagramList = []   //список данных диаграм
let selectDiagram_ID = 0 // выбранная диаграма 
let BPMNLIst = []  //список обьектов редактора с диаграммами
let DiagramList_max_id = 0 //max id DiagramList

import diagramXML from '../resources/mytry.bpmn'; // путь к заготовке схемы
DiagramList.push({xml: diagramXML, name: "mytry.bpmn", id: 0})
import diagramXML2 from '../resources/monsg.bpmn'
DiagramList.push({xml: diagramXML2, name: "monsg.bpmn", id: 1})
import diagramINIT from '../resources/new.bpmn'

function UppdateProjectListDiv(diagram){
  let element = document.createElement("div")
  element.className = "project_Lable"
  element.id = diagram.id
  element.innerHTML = diagram.name
  let deleteProject = document.createElement("img")
  deleteProject.className = "project_Lable_del"
  deleteProject.src = "./vendor/icons/assets/close.svg"
  deleteProject.alt = " - "
  element.append(deleteProject)

  project_list.append(element)

  let container = document.createElement("div")
  container.id = "container-"+diagram.id
  container.className = "container"
  container.classList.add("hide")
  flex_workplace.append(container)

  let properties = document.createElement("div")
  properties.id = "properties-"+diagram.id
  properties.className = "properties"
  properties.classList.add("hide")
  content.append(properties)
  
  let bpmn = new BpmnModeler({
    container: document.getElementById("container-"+diagram.id),
    propertiesPanel: { // из примера с панелью св
      parent: '#properties-'+diagram.id
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
      ltsm: ltsmExtension, // добавление расширения модели
      to: typeObject
    }})
  importXMLfromFile(diagram.xml, bpmn)
  BPMNLIst.push(bpmn)
  DiagramList_max_id++
  addNewProjectButton()
}
function addNewProjectButton(){
  let rez = document.getElementById("new_project_Lable")
  if(rez !== null){
    rez.remove()
  }
  let element = document.createElement("div")
  element.className = "project_Lable"
  element.id = "new_project_Lable"
  element.innerHTML = " + "
  project_list.append(element)
}

UppdateProjectListDiv(DiagramList[0])//добавляем 2 базовые диаграммы
UppdateProjectListDiv(DiagramList[1])

project_list.addEventListener('wheel', event => {
  const toLeft  = event.deltaY < 0 && project_list.scrollLeft > 0
  const toRight = event.deltaY > 0 && project_list.scrollLeft < project_list.scrollWidth - project_list.clientWidth

  if (toLeft || toRight) {
    event.preventDefault()
    project_list.scrollLeft += event.deltaY
  }
})

project_list.addEventListener("click", (target) => {
  if(target.target.className == "project_Lable"){
    if(target.target.id == "new_project_Lable"){
      DiagramList.push({xml: diagramINIT, name: "new.bpmn", id: DiagramList_max_id})
      UppdateProjectListDiv(DiagramList[DiagramList.length - 1])
      selectDiagram(DiagramList_max_id - 1)
    }
    else{
      selectDiagram(target.target.id)
    }
    
  }
  else if(target.target.className == "project_Lable_del"){
    let NewDiagramList = []
    let NewBPMNLIst = []
    for (let index = 0; index < DiagramList.length; index++) {
      const element = DiagramList[index];
      if(element.id != target.target.parentElement.id){
        NewDiagramList.push(element)
        NewBPMNLIst.push(BPMNLIst[index])
      }
    }
    console.log("fdf",NewDiagramList, NewBPMNLIst)
    document.getElementById("properties-"+target.target.parentElement.id).remove()
    document.getElementById("container-"+target.target.parentElement.id).remove()
    target.target.parentElement.remove()
    DiagramList = NewDiagramList
    BPMNLIst = NewBPMNLIst
    if(DiagramList.length < 1){
      DiagramList_max_id = 0
      DiagramList.push({xml: diagramINIT, name: "new.bpmn", id: DiagramList_max_id})
      UppdateProjectListDiv(DiagramList[DiagramList.length - 1])
      selectDiagram_ID = -1
      selectDiagram(0)
    }
    else if(selectDiagram_ID == target.target.parentElement.id){
      selectDiagram(DiagramList[0].id)
    }
  }
})

let bpmnModeler = BPMNLIst[selectDiagram_ID] // начальные настройки 
InitWorkflow(bpmnModeler)
document.getElementById("container-"+selectDiagram_ID).classList.remove("hide")
document.getElementById("properties-"+selectDiagram_ID).classList.remove("hide")
document.getElementById(selectDiagram_ID).classList.add("select")


function selectDiagram(id){
  console.log(DiagramList, BPMNLIst)
  if(id !== selectDiagram_ID)
  {
    try {
      document.getElementById("container-"+selectDiagram_ID).classList.add("hide")
      document.getElementById("properties-"+selectDiagram_ID).classList.add("hide")
      document.getElementById(selectDiagram_ID).classList.remove("select")
    } catch (error) {
      console.log(error)
    }
    let index_array = 0
    for (let index = 0; index < DiagramList.length; index++) {
      const element = DiagramList[index];
      if(element.id == id){
        index_array = index
      }
    }
    bpmnModeler = BPMNLIst[index_array]
    InitWorkflow(bpmnModeler)
    selectDiagram_ID = id
    document.getElementById("container-"+DiagramList[index_array].id).classList.remove("hide")
    document.getElementById("properties-"+DiagramList[index_array].id).classList.remove("hide")
    document.getElementById(selectDiagram_ID).classList.add("select")
  }
}

const buttonViewVindow = document.getElementById('button_ViewWindow')
buttonViewVindow.addEventListener('click', function(){
  ViewWindow(bpmnModeler)
})

const buttonShowResource = document.getElementById('resource_panel');
buttonShowResource.addEventListener('click', async function() {
  UppdateResourceList(bpmnModeler)
})
//отрисовка графиков по нажатью на кнопку результаты расчёта
document.getElementById("button_modelling_rezult").addEventListener("click", async () =>{
  CreateWindowResult(modelling_rezult)
})


// import file button
const buttonImportXML = document.getElementById('file-BPMN');

buttonImportXML.addEventListener('change', function(file_input) {
  if (file_input.target.files[0]) {
    var file = file_input.target.files[0];
    let reader = new FileReader();
    reader.readAsText(file);
    reader.addEventListener('load', (e) => {
      DiagramList.push({xml: reader.result, name: file.name, id: DiagramList_max_id})
      UppdateProjectListDiv(DiagramList[DiagramList.length - 1])
      selectDiagram(DiagramList_max_id - 1)
    });
    reader.addEventListener('error', () => {
      console.error(`Произошла ошибка при чтении файла`);
    });
  }
})

// save file button
buttonSaveXML.addEventListener('click', async function() {
  try {
    const { xml } = await bpmnModeler.saveXML({ format: true });
    download(xml, 'diagram.bpmn' ,'application/xml')
  } catch (err) {
    console.log(err);
  }
});
buttonSaveSVG.addEventListener('click', async function() {
  try {
    const { svg } = await bpmnModeler.saveSVG();
    download(svg, 'diagram.svg', 'application/xml')
  } catch (err) {
    console.log(err);
  }
});

// Обработка нажатия старта моделирования
downloadLink_server.addEventListener("click", async function() {
  modelling_rezult = await StartModelling(bpmnModeler)
  console.log(modelling_rezult)
})





// import XML
function importXMLfromFile(xml, bpmnModelerImport){
  bpmnModelerImport.importXML(xml).then(() => {

/*
  const moddle = bpmnModeler.get('moddle'),
        modeling = bpmnModeler.get('modeling');
  const RootElement = bpmnModeler._definitions.rootElements
*/
  let businessObject,
      element;
  const moddle = bpmnModelerImport.get('moddle')

  bpmnModelerImport.on('element.contextmenu', HIGH_PRIORITY, (event) => { //нужно только для информации по обьекту правой кнопкой мыши( вермено )
    event.originalEvent.preventDefault();
    event.originalEvent.stopPropagation();
    ({ element } = event);
    // ignore root element
    if (!element.parent) {
      return;
    }
    console.log(event)
    businessObject = getBusinessObject(element)
    ProcessingGlobalActions(businessObject, bpmnModeler, event)
    

  });

  bpmnModelerImport.on('element.click', HIGH_PRIORITY, (event) => { //нажатие левой кнопкой по таску
    event.originalEvent.preventDefault();
    event.originalEvent.stopPropagation();
    ({ element } = event);
    // ignore root element
    if (!element.parent) {
      return;
    }
    console.log(element)
  });

  bpmnModelerImport.get('minimap').open();

}).catch((err) => {
  console.error(err);
});
}


