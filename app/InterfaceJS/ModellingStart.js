

async function StartModelling(bpmnModeler){
    let dataModelling = {
        error: "Null Data"
    }
    const { xml } = await bpmnModeler.saveXML();
    //console.log(xml)
    const blob = new Blob([xml], { type: 'application/bpmn' });
    var fd = new FormData();
    fd.append('upload', blob, 'file.bpmn');
    try {
        await $.ajax({
        type: 'POST',
        url: 'http://localhost:3000/api/',
        data: fd,
        processData: false,
        contentType: false
    }).done(async function(data) {
        dataModelling = data
    });
    }catch(error){
        console.log(error);
        dataModelling = {
            error: error
        }
    }
    return dataModelling
}

export{
    StartModelling,
}