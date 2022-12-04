var arr = []
var model = []
var modelEncontristas = [];
var equipes = []
var circulos = []
var equipeAtual = []
var arrEncontristasAtual = []

$(document).ready(() => {
    fetchDatabase("../database/base_encontristas.json")
    .then((result) => {
        result.forEach(x => { 
            x.Id = x.Circulo.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            x.Id = x.Id.replace(/[^A-Z0-9]+/ig, "");
            x.Id = x.Id.toUpperCase();
        });

        modelEncontristas = result;
    });

    fetchDatabase("../database/equipes.json")
    .then((result) => {
        equipes = result;
    })



    fetchDatabase("../database/base.json")
    .then((result) => { 
        result.forEach(x => { 
            x.Id = x.Equipe.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            x.Id = x.Id.replace(/[^A-Z0-9]+/ig, "");
            x.Id = x.Id.toUpperCase();
            x.Instagram = x.Instagram.replace("@","");
            x.InstagramTio = x.InstagramTio.replace("@","");
            x.InstagramTia = x.InstagramTia.replace("@","");
        });

        groupByKey(result, "Id").then((result) => {
            model = result;
        });
    }).then(() => {
        renderizar();
    })
});

function searchEncontristas() {
    let keyword = $('#iptsearchencontristas').val();
    let encontristasPesquisa = arrEncontristasAtual;

    if(keyword)
    { 
        keyword = keyword.toUpperCase();
        let r = encontristasPesquisa.filter((x) => {
            return x.NomeCompleto.toUpperCase().includes(keyword) || x.Circulo.toUpperCase().includes(keyword);
        });

        montarCardsEncontristas(r);
    }
    else{
        montarCardsEncontristas(arrEncontristasAtual);
    }
}

function searchEquipe() {
    let keyword = $('#iptsearch').val();
    let equipePesquisa = equipeAtual;

    if(keyword)
    { 
        keyword = keyword.toUpperCase();
        let r = equipePesquisa.filter((x) => {
            return x.NomeCompleto.toUpperCase().includes(keyword) || x.NomeTio.toUpperCase().includes(keyword) || x.NomeTia.toUpperCase().includes(keyword);
        });

        montarCardsEquipe(r);
    }
    else{
        montarCardsEquipe(equipeAtual);
    }
}

function renderizar(){
    renderizarEquipes();
}

let fetchDatabase = (pathFile) => {
    return new Promise((resolve, reject) => {
        var model = readTextFile(pathFile);
        var database = JSON.parse(model);

        resolve(database);
    });
}

function renderizarEquipes(){
    let div = $("#divEquipes");
    equipes.sort().forEach((equipe) => {
        div.append(createCard(equipe))
    });
}

function createCard(model){
    let row = "";
        row += `<div class="col-lg-4 col-md-12 mb-4">`;
        row += `    <div class='card cardFixedHeight'>`;
        row += `      <div class='bg-image hover-overlay ripple' data-mdb-ripple-color='light'>`;
        row += `        <img src='${model.Imagem}' width=120 class='img-fluid' />`;
        row += `        <a href='#!'>`;
        row += `          <div class='mask' style='background-color: rgba(251, 251, 251, 0.15);'></div>`;
        row += `        </a>`;
        row += `      </div>`;
        row += `      <div class='card-body'>`;
        row += `        <h5 class='card-title'>${model.Titulo}</h5>`;
        row += `        <p class='card-text'>`;
        row += `          "${model.Frase}"`;
        row += `        <h6>${model.Versiculo}</h6>`;
        row += `        </p>`;
        row += `        <a onclick='abrirModalEquipe(\"${model.Id}\")' class='btn btn-primary c-pointer'>Ver equipe</a>`;
        row += `      </div>`;
        row += `    </div>`;
        row += `</div>`;

    return row;
}

function fecharModalEncontristas(){
    $("#modalEncontristas").modal('hide');
}

function fecharModalEquipe(){
    $('#modalEquipe').modal('hide');
}

function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

function abrirModalEncontristas(){
    $("#modalEncontristas").modal('show');

    arrEncontristasAtual = []
    arrEncontristasAtual = modelEncontristas;
    montarCardsEncontristas(arrEncontristasAtual);
}

function abrirModalEquipe(id){

    equipeAtual = []
    var obj = equipes.filter(x => x.Id == id)[0];

    $('#tituloModalEquipe').text(obj.Titulo);
    $('#modalEquipe').modal('show');

    let objModel = model[id];
    equipeAtual = objModel;

    montarCardsEquipe(objModel);
}

function montarCardsEncontristas(objModel){
    let cJovens = [];

    var div = $('#divCardsInfomacoesPessoaisEncontristas');
    div.empty();
    
    let jovens = sortByKey(objModel, "NomeCompleto");
    jovens = sortByKey(jovens, "Circulo");

    jovens.forEach((x) => {
        cJovens.push(createCardInformacoesEncontristas(x));
    });

    cJovens.forEach((x) => div.append(x));
}

function montarCardsEquipe(objModel){
    let cJovens = [];
    let cTios = [];

    var div = $('#divCardsInfomacoesPessoais');
    div.empty();
    
    let tios = objModel.filter((x) => x.DataCasamento);
    let jovens = objModel.filter((x) => !x.DataCasamento);

    tios = sortByKey(tios, "NomeTio");
    jovens = sortByKey(jovens, "NomeCompleto");

    tios.forEach((x) => {
        cTios.push(createCardInformacoesTios(x));   
    });

    jovens.forEach((x) => {
        cJovens.push(createCardInformacoesJovem(x));
    });

    cJovens.forEach((x) => div.append(x));
    cTios.forEach((x) => div.append(x));
}

let groupByKey = (array, key) => {
    return new Promise((resolve, reject) => {
        let result = array
        .reduce((hash, obj) => {
          if(obj[key] === undefined) return hash; 
          return Object.assign(hash, { [obj[key]]:( hash[obj[key]] || [] ).concat(obj)})
        }, {})

        resolve(result);
    })
}

function readTextFile(file)
{
    var rawFile = new XMLHttpRequest();
    var allText;
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                allText = rawFile.responseText
            }else{
                alert("Falha ao abrir base de dados");
            }
        }
    }
    rawFile.send(null);
    return allText;
}

function createCardInformacoesTios(model){
    let row = "";
        row+=`<div class="col-sm-12 col-md-12 col-lg-4 mb-2">`
        row+=`  <div class="card">`;
        row+=`  <div class="card-body">`;
        row+=`    <div class="row my-auto">`;
        row+=`      <div class="col-sm-12 m-0">`;
        row+=`        <div class="d-flex">`;
        row+=`          <div class="pr-4">`;
        row+=`            <span class="badge badge-tio"> </span>`;
        row+=`          </div>`;
        row+=`          <div>`;
        row+=`            <h6  class="pl-4">${model.NomeTio} e ${model.NomeTia}</h6>`;
        row+=`          </div>`;
        row+=`        </div>`;
        row+=`      </div>`;
        row+=`    </div>`;
        row+=`    <span>Aniversário tio: ${formatarDataNascimento(model.DataNascimentoTio)}`;
        row+=`    <br>`;
        row+=`    <span>Aniversário tia: ${formatarDataNascimento(model.DataNascimentoTia)}`;
        row+=`    <br>`;
        row+=`    <span>Endereço : ${model.EnderecoCasal}</span>`;
        row+=`    </span>`;
        row+=`    <br>`;
        row+=`    <span>Celular tio: ${model.CelularTio}</span>`;
        row+=`    <br>`;
        row+=`    <span>Celular tia: ${model.CelularTia}</span>`;

        if(model.EmailTio){
            row+=`    <br>`;
            row+=`    <span>Email tio: ${model.EmailTio}</span>`;
        }

        if(model.EmailTia){
            row+=`    <br>`;
            row+=`    <span>Email tia: ${model.EmailTia}</span>`;
        }
        
        
        if(model.InstagramTio){
            row+=`    <br>`;
            row+=`    <span>`;
            row+=`      Tio: <a class="linkInstagram text-blue" onclick="redirectInstagram('${model.InstagramTio}')" ">`;
            row+=`         <img src="./img/instaicon.png" width="25" style="margin-left: -6px ;">  ${model.InstagramTio}`;
            row+=`      </a>`;
            row+=`    </span>`;
        }

        if(model.InstagramTia){
            row+=`    <br>`;
            row+=`    <span>`;
            row+=`      Tia: <a class="linkInstagram text-blue" onclick="redirectInstagram('${model.InstagramTia}')" >`;
            row+=`        <img src="./img/instaicon.png" width="25" style="margin-left: -6px ;">  ${model.InstagramTia}`;
            row+=`      </a>`;
            row+=`    </span>`;
        }
        
        row+=`  </div>`;
        row+=`</div>`;
        row+=`</div>`;

        return row;
}

function formatarDataNascimento(date){
    let dia = date.split("/")[0];
    let mes = date.split("/")[1];

    return `${dia}/${mes}`;
}

function createCardInformacoesJovem(model){
    let row = "";
    row+=`<div class="col-sm-12 col-md-12 col-lg-4 mb-2">`
        row+=`  <div class="card">`;
        row+=`  <div class="card-body">`;
        row+=`    <div class="row my-auto">`;
        row+=`      <div class="col-sm-12 m-0">`;
        row+=`        <div class="d-flex">`;
        row+=`          <div class="pr-4">`;
        row+=`            <span class="badge badge-jovem"> </span>`;
        row+=`          </div>`;
        row+=`          <div>`;
        row+=`            <h6  class="pl-4">${model.NomeCompleto}</h6>`;
        row+=`          </div>`;
        row+=`        </div>`;
        row+=`      </div>`;
        row+=`    </div>`;
        row+=`    <span>Aniversário: ${formatarDataNascimento(model.DataNascimentoJovem)}`;
        row+=`    <br>`;
        row+=`    <span>Endereço: ${model.Endereco}</span>`;
        row+=`    </span>`;
        row+=`    <br>`;
        row+=`    <span>Celular: ${model.Celular}</span>`;

        if(model.Email){
            row+=`    <br>`;
            row+=`    <span>Email: ${model.Email}</span>`;
        }
        
        if(model.Instagram){
            row+=`    <br>`;
            row+=`    <span>`;
            row+=`      <a class="linkInstagram text-blue" onclick="redirectInstagram('${model.Instagram}')" >`;
            row+=`        <img src="./img/instaicon.png" width="25" style="margin-left: -6px ;"> ${model.Instagram}`;
            row+=`      </a>`;
            row+=`    </span>`;
        }

        row+=`  </div>`;
        row+=`</div>`;
        row+=`</div>`;


        return row;
}

function createCardInformacoesEncontristas(model){
    let row = "";
    row+=`<div class="col-sm-12 col-md-12 col-lg-4 mb-2">`
        row+=`  <div class="card">`;
        row+=`  <div class="card-body">`;
        row+=`    <div class="row my-auto">`;
        row+=`      <div class="col-sm-12 m-0">`;
        row+=`        <div class="d-flex">`;
        row+=`          <div class="pr-4">`;
        row+=`            <span class="badge badge-${model.Circulo.toLowerCase()}"> </span>`;
        row+=`          </div>`;
        row+=`          <div>`;
        row+=`            <h6  class="pl-4">${model.NomeCompleto}</h6>`;
        row+=`          </div>`;
        row+=`        </div>`;
        row+=`      </div>`;
        row+=`    </div>`;
        row+=`    <span>Aniversário: ${formatarDataNascimento(model.Aniversario)}`;
        row+=`    <br>`;
        row+=`    <span>Endereço: ${model.Endereco}</span>`;
        row+=`    </span>`;
        row+=`    <br>`;
        row+=`    <span>Telefone: ${model.Telefone}</span>`;

        if(model.Email){
            row+=`    <br>`;
            row+=`    <span>Email: ${model.Email}</span>`;
        }
        
        row+=`  </div>`;
        row+=`</div>`;
        row+=`</div>`;


        return row;
}

function redirectInstagram(username){
    var destination = `instagram://user?username=${username}`; 

    if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
        if( navigator.userAgent.match(/Android/i) ) {
            document.location = destination;   
        }   
        else {
        // use iOS redirect
        window.location.replace( destination );
        }
    }
    else
    {
        window.location.href = `https://instagram.com/${username}`;
    }
}



