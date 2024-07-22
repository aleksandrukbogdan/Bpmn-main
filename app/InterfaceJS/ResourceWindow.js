const ResourceList = document.getElementById("resource-list");
const ResourceAddSV = document.getElementById("res_add_StrVol_Button");
const ResourceParamsDiv = document.getElementById("resource-params");
const ResourceWindow = document.getElementById('resource-window'); //скрытый контейнер res
import Plotly from 'plotly.js-dist-min'
var RootElement = {}
var moddle = undefined
function UppdateResourceList(bpmnModeler){ //создание списка ресурсов
    ResourceList.innerHTML = ''
    RootElement = bpmnModeler._definitions.rootElements
    moddle = bpmnModeler.get('moddle')
    RootElement.forEach(element => {
      if(element.$type === "bpmn:Resource")
      {
        let resource = document.createElement("div")
        resource.className = "resource"
        resource.id = element.id
        resource.innerHTML = element.name
        ResourceList.append(resource)
      }

    });
    let resource = document.createElement("div")
    resource.className = "resource"
    resource.id = "addRes"
    resource.innerHTML = "Добавить ресурс"
    ResourceList.append(resource)
    console.log(RootElement)
    ResourceWindow.classList.add('show');
  }

  function CreateResource(){
    const Res = moddle.create('bpmn:Resource') // создаём обьект ресурс
      Res.id = "RS_new" // стандартное id ресурса
      Res.name = "Новый" // стандартное имя ресурса
      let resParams = [] // массив параметров
      let resParam = moddle.create("bpmn:ResourceParameter")
      resParam.id = "RS_new_P_1"
      resParam.name = "name"
      resParams.push(resParam)

      resParam = moddle.create("bpmn:ResourceParameter")
      resParam.id = "RS_new_P_2"
      resParam.name = "threads"
      resParams.push(resParam)
      
      resParam = moddle.create("bpmn:ResourceParameter")
      resParam.id = "RS_new_P_3"
      resParam.name = "productivity"
      resParams.push(resParam)

      Res.resourceParameters = resParams // добавляем параметры
      console.log(Res, JSON.stringify(Res))
      bpmnModeler._definitions.rootElements.push(Res)
  }

  ResourceWindow.addEventListener('click', function(event) {
    if (event.target === ResourceWindow) {
      ResourceWindow.classList.remove('show');
    }
  });


  
  ResourceList.addEventListener('click', (event) => {
    const { target } = event;

    if(target.id == "addRes")
    {
      CreateResource()
      UppdateResourceList()
      return
    }
    if(target.className == "resource"){
      RootElement.forEach(element => {
        if(element.id == target.id)
        {
          //console.log("Найден элемент", element)
          CreateResourceEditWindow(element)
          
        }
      });
    }
  });


  function CreateResourceEditWindow(element){
    document.getElementById("res_name").value = element.name
    document.getElementById("res_id").value = element.id
    let divclone = document.getElementById("resource-param-0").cloneNode(true)
    document.getElementById("resource-params").innerHTML = ""
    document.getElementById("jsonObj").innerHTML = JSON.stringify(element)
    console.log(element)
    element.resourceParameters.forEach(param => {
      let div = divclone.cloneNode(true)
      div.id = param.id
      div.children[0].children[0].innerHTML = param.id
      div.children[1].children[0].innerHTML = param.name
      div.children[2].children[0].value = param.value || ""

      document.getElementById("resource-params").append(div)
    });

    let stream = undefined
    let volume = undefined
    try {
      element.extensionElements.values.forEach(prop => { 
        if(prop.$type == "ltsm:props" && prop.hasOwnProperty("stream") && prop.hasOwnProperty("volume")){
          stream = prop.stream
          volume = prop.volume
        }
      })
    } catch (error) {
      //pu pu pu
    }
    if(stream != undefined && volume != undefined)
    {
      ResourceAddSV.style.display = "none"
      const propsDiv = document.getElementById("res-StrVol")
      propsDiv.style.display = "block"
      propsDiv.children[0].children[1].value = stream
      propsDiv.children[1].children[1].value = volume
    }
    else{
      ResourceAddSV.style.display = "block"
      document.getElementById("res-StrVol").style.display = "none"
    }
    let arrtime = []
    let arrbase = []
    let yAxis = []
    let hoverText = []
    let lasttime = 0
    try{
    element.extensionElements.values.forEach(props => {
      if(props.$type == "ltsm:props" && props.hasOwnProperty("availability_time") && props.hasOwnProperty("availability_value")){1
        if(props.availability_value == 1){
          arrbase.push(props.availability_time)
          yAxis.push(0)
          lasttime = props.availability_time
        }
        else{
          arrtime.push(props.availability_time - lasttime)
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

      let grapfDiv = document.getElementById('resource-ViewGraph')
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
      document.getElementById('resource-ViewGraph').innerHTML = ''
    }
  }

  ResourceParamsDiv.addEventListener('change', async function(event) {
    let idres = document.getElementById("res_id").value
    let value = event.target.value
    let target_id = event.target.id
    let id_res_param = event.target.parentElement.parentElement.id
    console.log(idres, value, id_res_param, target_id, RootElement)
    RootElement.forEach(element => {
      if(element.$type === "bpmn:Resource" && element.id == idres){
        element.resourceParameters.forEach(element_param => {
          if(element_param.id == id_res_param)
            {
              if(target_id == "res-param-value")
                element_param.value = value
            }
        });
      }
    });
    console.log(RootElement)
  })


  //работа с stream и volume в окне ресурсов 
  ResourceAddSV.addEventListener('click', async function() {
    let idres = document.getElementById("res_id").value
    console.log(idres, RootElement)
    RootElement.forEach(element => {
      if(element.$type === "bpmn:Resource" && element.id == idres){
        if(!element.hasOwnProperty("extensionElements")){
          console.log("создан ExtensionElements")
          element.extensionElements = moddle.create("bpmn:ExtensionElements")// создаём ExtensionElements
          element.extensionElements.values = []
        }
        let LTSMprops = moddle.create("ltsm:props")
        LTSMprops.stream = 1
        LTSMprops.volume = 1
        element.extensionElements.values.push(LTSMprops)
      }
    });
  })

  const StreamInputResource = document.getElementById("streamRes")
  const VolumrInputResource = document.getElementById("volumeRes")
  StreamInputResource.addEventListener('change', async function(event) {
    let idres = await document.getElementById("res_id").value
    RootElement.forEach(element => {
      if(element.$type === "bpmn:Resource" && element.id == idres){
        console.log(element.extensionElements.values)
        element.extensionElements.values.forEach(props => {
          if(props.$type == "ltsm:props"){
            props.stream = Number(event.target.value)
          }
        })
      }
    });
  })

  VolumrInputResource.addEventListener('change', async function(event) {
    let idres = await document.getElementById("res_id").value
    RootElement.forEach(element => {
      if(element.$type === "bpmn:Resource" && element.id == idres){
        console.log(element.extensionElements.values)
        element.extensionElements.values.forEach(props => {
          if(props.$type == "ltsm:props"){
            props.volume = Number(event.target.value)
          }
        })
      }
    });
  })


  export{
    UppdateResourceList,
  }