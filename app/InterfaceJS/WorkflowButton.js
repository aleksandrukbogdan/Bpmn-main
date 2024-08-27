const LoadDiv = document.getElementById("LoadGif")
const body = document.querySelector("body")
const Action_settings = document.getElementById("Action_settings")
const InfoTaskPage = document.getElementById("InfoTaskPage")
let resource_List = []
let mode = "none"
let bpmnModeler = {}

function InitWorkflow(bpmnModelerNew){
    bpmnModeler = bpmnModelerNew
}

function LoadStatus(status){
  console.log("body",body)
  if(status){
    LoadDiv.style.display = "block"
    InfoTaskPage.style.display="block"
    body.addEventListener("mousemove", (event) =>{
      LoadDiv.style.left = event.clientX+5 + "px"
      LoadDiv.style.top = event.clientY-5 + "px"
      InfoTaskPage.style.left = event.clientX+5 + "px"
      InfoTaskPage.style.top = event.clientY+25 + "px"
    })
  }
  else{
    setTimeout(() => {
      LoadDiv.style.display = "none"
      InfoTaskPage.style.display="none"
      body.removeEventListener("mousemove", () => {})
    }, 500);
  }
}

async function ProcessingGlobalActions(businessObject, bpmnModelerInput, eventGloball){
    bpmnModeler = bpmnModelerInput
    LoadDiv.style.left = eventGloball.originalEvent.clientX+5 + "px"
    LoadDiv.style.top = eventGloball.originalEvent.clientY-5 + "px"
    InfoTaskPage.style.left = eventGloball.originalEvent.clientX+5 + "px"
    InfoTaskPage.style.top = eventGloball.originalEvent.clientY+25 + "px"
    //console.log(eventGloball.originalEvent)
    if(mode == "copy_resource"){
      let id = await document.getElementById("select_recource").value
      let resource_applied = false
      for (let index = 0; index < businessObject.resources.length; index++) {
        const element = businessObject.resources[index];
        if(element.resourceRef.id == resource_List[id].id){
          resource_applied = true
          break
        }
      }
      
      if (!resource_applied) {
        InfoTaskPage.innerText = JSON.stringify(resource_List[id].id, null, 2)
        LoadStatus(true)
        const moddle = await bpmnModeler.get('moddle')
        let resource = await moddle.create('bpmn:Performer')
        resource.id = businessObject.id+ "_" + resource_List[id].id //возможна проблема из за разницы RES / RS
        resource.resourceRef = await resource_List[id]
        businessObject.resources.push(resource)
        LoadStatus(false)
      }
    }
    if(mode == "copy_allparam"){
      let id = await document.getElementById("select_recource").value
      let resource_applied = false
      for (let index = 0; index < businessObject.resources.length; index++) {
        const element = businessObject.resources[index];
        if(element.resourceRef.id == resource_List[id].id){
          //console.log(element.resourceRef.id, resource_List[id].id)
          resource_applied = true
          break
        }
      }
  
      if (!resource_applied) {
        LoadStatus(true)
        const moddle = await bpmnModeler.get('moddle')
        let resource = await moddle.create('bpmn:Performer')
        resource.id = businessObject.id+ "_" + resource_List[id].id //возможна проблема из за разницы RES / RS
        resource.resourceRef = await resource_List[id]
        businessObject.resources.push(resource)
        LoadStatus(false)
      }
    }
    if(mode == "show_json"){
        console.log(JSON.stringify(businessObject, null, 2))
        InfoTaskPage.style.display="block"
        InfoTaskPage.innerText = "" 
        InfoTaskPage.innerText = JSON.stringify(businessObject, null, 2) 
        InfoTaskPage.style.left = eventGloball.originalEvent.clientX+5 + "px"
        InfoTaskPage.style.top = eventGloball.originalEvent.clientY-5 + "px"

        body.addEventListener("click", (event) =>{
            InfoTaskPage.style.display="none"
        })
      }
  }


  document.getElementById("ProjectAction").addEventListener("click", (target) =>{
    console.log(bpmnModeler)
    if(target.target.id == "copy_resource"){
      mode = "copy_resource"
      resource_List = []
      Action_settings.style.display = "flex"
      Action_settings.innerHTML = ""
      let p = document.createElement("p")
      p.innerText = "Выберите ресурс для вставки"
      Action_settings.append(p)
      let select = document.createElement("select")
      select.id = "select_recource"
      const RootElements = bpmnModeler._definitions.rootElements
      for (let index = 0; index < RootElements.length; index++) {
        const element = RootElements[index];
        if(element.$type == 'bpmn:Resource'){
          let options = document.createElement("option")
          options.value = resource_List.length
          options.innerHTML = element.name
          select.append(options)
          resource_List.push(element)
        }
        
      }
      Action_settings.append(select)
      let exit = document.createElement("button")
      exit.innerText = "Закрыть"
      exit.id = "ExitButton"
      Action_settings.append(exit)
    }
    if(target.target.id == "copy_allparam"){
      mode = "copy_allparam"
      Action_settings.style.display = "flex"
      Action_settings.innerHTML = ""
      let p = document.createElement("p")
      p.innerText = "Режим в разработке --- Выберите операцию для копирования"
      Action_settings.append(p)
  
      let exit = document.createElement("button")
      exit.innerText = "Закрыть"
      exit.id = "ExitButton"
      Action_settings.append(exit)
    }
    if(target.target.id == "show_json"){
        mode = "show_json"
        Action_settings.style.display = "flex"
        Action_settings.innerHTML = ""
        let p = document.createElement("p")
        p.innerText = "Выберите обьект ПКМ"
        Action_settings.append(p)
        let exit = document.createElement("button")
        exit.innerText = "Закрыть"
        exit.id = "ExitButton"
        Action_settings.append(exit)
      }
    if(target.target.id == "ExitButton"){
      mode = ""
      Action_settings.style.display = "none"
      Action_settings.innerHTML = ""
    }
  })

  export{
    ProcessingGlobalActions,
    InitWorkflow
  }