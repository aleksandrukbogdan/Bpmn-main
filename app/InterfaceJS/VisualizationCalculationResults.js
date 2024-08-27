
import Plotly from 'plotly.js-dist-min'

var WorkTask = [];
var WorkResource = [];
var all_id = [];

async function CreateWindowResult(modelling_rezult){
    WorkTask = [];
  WorkResource = [];
  all_id = [];
  document.getElementById("window-graphic_modal").classList.add('show');
  console.log(modelling_rezult)
  let all_keys = [];
  let all_values = [];
  
  WorkTask.push(modelling_rezult['WorkTask'])
  WorkResource.push(modelling_rezult['WorkResource'])

  WorkTask[0].forEach((ind)=> {
    all_id.push(ind['id']);
  })


  for (let key in modelling_rezult) {
    all_keys.push(key);
    all_values.push(modelling_rezult[key]);
  }

  let data_k = [];
  let data_v = [];
  for (let key in all_values[0]) {
    data_k.push(key);
    data_v.push(all_values[0][key]);
  }
  await Scatterpolar(data_k, data_v);
  await Gisto_hrzn(WorkTask, 'Gisto_task', 1);
  await Gisto_hrzn(WorkResource, 'Gisto_resource', 1);
}



function Scatterpolar(data_k, data_v){
    let data_values = data_v.slice(0);
    let th = data_k.slice(0);
    for (let i = data_values.length - 1; i >= 0; i--) {
      data_values[i].splice(0,1);
    }
  
    let maxRow = data_values.map(function(row){ return Math.max.apply(Math, row); });
    for (let i = maxRow.length - 1; i >= 0; i--) {
      if(maxRow[i] == 0 || data_values[i].length == 0){
        maxRow.splice(i, 1);
        th.splice(i, 1);
        data_values.splice(i, 1);
      }
    }
  
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

  const table = document.getElementById('graph_table');



  var n = 0;
  
  function Gisto_hrzn(Work_datas, name, grapf_id){
    let work_data = Work_datas[0][grapf_id-1];
    let datas = work_data['data'];
    let color_toappend = work_data['colors'];
    let legeng_toappend = [];
    let y_toappend =[];
    let x_toappend = [];
    datas.forEach((ind)=> {
      y_toappend.push(ind['Task']);
      y_toappend.push(ind['Task']);
      legeng_toappend.push(ind['Resource']);
      x_toappend.push(ind['Start']);
      x_toappend.push(ind['Finish']);
    })
    
   let data = [];
   let temp_x = [];
   let temp_y = [];
  
   let temp_legend = [];
   let j = 0;
   let data_sets = {x:[], y:[], type: '', 
    opacity: 0.5,
    line: { color: 'red', width: 40 },
    mode: 'lines',  name:'', legendgroup: ''}
   for (let i = 0; i < y_toappend.length/2; i++) {
    temp_x.push(x_toappend[j]);
    temp_x.push(x_toappend[j+1]);
    temp_y.push(y_toappend[j]);
    temp_y.push(y_toappend[j+1]);
    if (temp_legend.includes(legeng_toappend[i])) {
      temp_legend.push(' ');
    }
    else {
      temp_legend.push(legeng_toappend[i])
    }
    console.log(temp_legend);
    j += 2;
  
    data_sets = {x: temp_x, y: temp_y, type: 'scatter', 
      opacity: 0.5, line: {color: color_toappend[i], width: 30 }, 
      mode: 'lines', name: temp_legend[i], legendgroup: legeng_toappend[i]}
    data[i] = data_sets;
    temp_x = [];
    temp_y = [];
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
      Gisto_hrzn(WorkTask, 'Gisto_task', ind);
      Gisto_hrzn(WorkResource, 'Gisto_resource', ind);
    });
  });


export{
    CreateWindowResult
}