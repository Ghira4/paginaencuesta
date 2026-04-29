const flujos = {
  'si':        ['contacto', 'perfil', 'datos-personales', 'estado-civil', 'hijos', 'documentacion', 'antepasado', 'aire', 'guardar'],
  'no':        ['contacto', 'perfil', 'datos-personales', 'estado-civil', 'hijos', 'antepasado', 'genealogia', 'guardar'],
  'no_sabe':   ['contacto', 'perfil', 'datos-personales', 'estado-civil', 'hijos', 'antepasado', 'genealogia', 'guardar'],
  'en_tramite':['contacto', 'perfil', 'datos-personales', 'estado-civil', 'hijos', 'antepasado', 'genealogia', 'tramite', 'guardar']
};

let perfilSeleccionado = 'no';
let contadorDomicilios = 0;

const provinciasItaliane = {
  'AG':'Agrigento','AL':'Alessandria','AN':'Ancona','AO':'Aosta','AP':'Ascoli Piceno',
  'AQ':"L'Aquila",'AR':'Arezzo','AT':'Asti','AV':'Avellino','BA':'Bari','BG':'Bergamo',
  'BI':'Biella','BL':'Belluno','BN':'Benevento','BO':'Bologna','BR':'Brindisi',
  'BS':'Brescia','BT':'Barletta-Andria-Trani','BZ':'Bolzano/Bozen','CA':'Cagliari',
  'CB':'Campobasso','CE':'Caserta','CH':'Chieti','CL':'Caltanissetta','CN':'Cuneo',
  'CO':'Como','CR':'Cremona','CS':'Cosenza','CT':'Catania','CZ':'Catanzaro','EN':'Enna',
  'FC':'Forlì-Cesena','FE':'Ferrara','FG':'Foggia','FI':'Firenze','FM':'Fermo',
  'FR':'Frosinone','GE':'Genova','GO':'Gorizia','GR':'Grosseto','IM':'Imperia',
  'IS':'Isernia','KR':'Crotone','LC':'Lecco','LE':'Lecce','LI':'Livorno','LO':'Lodi',
  'LT':'Latina','LU':'Lucca','MB':'Monza e Brianza','MC':'Macerata','ME':'Messina',
  'MI':'Milano','MN':'Mantova','MO':'Modena','MS':'Massa-Carrara','MT':'Matera',
  'NA':'Napoli','NO':'Novara','NU':'Nuoro','OR':'Oristano','PA':'Palermo',
  'PC':'Piacenza','PD':'Padova','PE':'Pescara','PG':'Perugia','PI':'Pisa',
  'PN':'Pordenone','PO':'Prato','PR':'Parma','PT':'Pistoia','PU':'Pesaro e Urbino',
  'PV':'Pavia','PZ':'Potenza','RA':'Ravenna','RC':'Reggio Calabria','RE':'Reggio Emilia',
  'RG':'Ragusa','RI':'Rieti','RM':'Roma','RN':'Rimini','RO':'Rovigo','SA':'Salerno',
  'SI':'Siena','SO':'Sondrio','SP':'La Spezia','SR':'Siracusa','SS':'Sassari',
  'SU':'Sud Sardegna','SV':'Savona','TA':'Taranto','TE':'Teramo','TN':'Trento',
  'TO':'Torino','TP':'Trapani','TR':'Terni','TS':'Trieste','TV':'Treviso','UD':'Udine',
  'VA':'Varese','VB':'Verbano-Cusio-Ossola','VC':'Vercelli','VE':'Venezia',
  'VI':'Vicenza','VR':'Verona','VT':'Viterbo','VV':'Vibo Valentia'
};

let comunasItalianas = [
  "Roma (RM)", "Milano (MI)", "Napoli (NA)", "Torino (TO)", "Palermo (PA)", "Genova (GE)", "Bologna (BO)", "Firenze (FI)", "Treia (MC)"
];

async function cargarComunas() {
  try {
    const response = await fetch('https://raw.githubusercontent.com/matteocontrini/comuni-json/master/comuni.json');
    const data = await response.json();
    comunasItalianas = data.map(c => `${c.nome} (${c.sigla})`);
  } catch (error) {
    console.warn("No se pudo cargar la base de datos de comunas.");
  }
}

function getDocsHTML(prefix, title = "Documentación Italiana") {
    return `
    <div class="sub-bloque">
        <h5 style="margin-top:0; margin-bottom: 10px; color:var(--primary-color);">${title}</h5>
        <div class="grid-3">
          <div>
            <label>Pasaporte:
              <select name="${prefix}_pasaporte" onchange="mostrarArchivoDoc('${prefix}_pasaporte_div', this.value)">
                <option value="">-- Seleccionar --</option><option value="vigente">Vigente</option><option value="vencido">Vencido</option><option value="no_tiene">No tiene</option>
              </select>
            </label>
            <div id="${prefix}_pasaporte_div" class="hidden" style="margin-top:5px;">
               <label style="font-size:0.8em;">Adjuntar foto/archivo: <input type="file" name="${prefix}_pasaporte_file"></label>
            </div>
          </div>
          <div>
            <label>CIE (DNI Italiano):
              <select name="${prefix}_cie" onchange="mostrarArchivoDoc('${prefix}_cie_div', this.value)">
                <option value="">-- Seleccionar --</option><option value="vigente">Vigente</option><option value="vencido">Vencido</option><option value="no_tiene">No tiene</option>
              </select>
            </label>
            <div id="${prefix}_cie_div" class="hidden" style="margin-top:5px;">
               <label style="font-size:0.8em;">Adjuntar foto/archivo: <input type="file" name="${prefix}_cie_file"></label>
            </div>
          </div>
          <div>
            <label>Codice Fiscale:
              <select name="${prefix}_cf" onchange="mostrarArchivoDoc('${prefix}_cf_div', this.value)">
                <option value="">-- Seleccionar --</option><option value="vigente">Vigente</option><option value="vencido">Vencido</option><option value="no_tiene">No tiene</option>
              </select>
            </label>
            <div id="${prefix}_cf_div" class="hidden" style="margin-top:5px;">
               <input type="text" name="${prefix}_cf_numero" placeholder="Escribir el código" style="margin-bottom:5px;">
               <label style="font-size:0.8em;">Adjuntar foto/archivo: <input type="file" name="${prefix}_cf_file"></label>
            </div>
          </div>
        </div>
    </div>
    `;
}

function mostrarArchivoDoc(idContenedor, valor) {
  const el = document.getElementById(idContenedor);
  if(el) valor === 'vigente' ? el.classList.remove('hidden') : el.classList.add('hidden');
}

window.onload = () => {
  agregarDomicilio();
  cargarComunas();

  const dSol = document.getElementById('docs_solicitante_container');
  const dPad = document.getElementById('docs_padre_container');
  const dMad = document.getElementById('docs_madre_container');

  if(dSol) dSol.innerHTML = getDocsHTML('solicitante', 'Mis Documentos Italianos');
  if(dPad) dPad.innerHTML = getDocsHTML('padre', 'Documentos Italianos del Padre');
  if(dMad) dMad.innerHTML = getDocsHTML('madre', 'Documentos Italianos de la Madre');
};

function validarBloque(idBloque) {
    // DESACTIVADO TEMPORALMENTE PARA DESARROLLO / PRUEBAS
    return true;
}

function buscarComuna(valor) {
  const sugerencias = document.getElementById('sugerencias_comunas');
  if(!sugerencias) return;
  sugerencias.innerHTML = '';
  if (valor.length < 2) {
      sugerencias.classList.add('hidden');
      return;
  }

  const filtro = valor.toLowerCase();
  const resultados = comunasItalianas.filter(c => c.toLowerCase().includes(filtro)).slice(0, 50);

  if (resultados.length > 0) {
      sugerencias.classList.remove('hidden');
      resultados.forEach(res => {
          const div = document.createElement('div');
          div.style.padding = '10px';
          div.style.cursor = 'pointer';
          div.style.borderBottom = '1px solid #eee';
          div.textContent = res;

          div.onmousedown = function(e) {
              e.preventDefault();
              const match = res.match(/^(.*?)\s*\((\w+)\)$/);
              const comuneEl = document.getElementById('avo_comune');
              const provinciaEl = document.getElementById('avo_provincia');
              if (match) {
                  if (comuneEl) comuneEl.value = match[1];
                  if (provinciaEl) {
                      const cod = match[2];
                      provinciaEl.value = provinciasItaliane[cod] ? `${cod} — ${provinciasItaliane[cod]}` : cod;
                  }
              } else {
                  if (comuneEl) comuneEl.value = res;
              }
              sugerencias.classList.add('hidden');
          };

          div.onmouseover = () => div.style.background = '#f0f8ff';
          div.onmouseout = () => div.style.background = 'white';

          sugerencias.appendChild(div);
      });
  } else {
      sugerencias.classList.add('hidden');
  }
}

function seleccionarPerfil(valor) {
  perfilSeleccionado = valor;
  const todas = ['datos-personales', 'domicilio', 'estado-civil', 'hijos', 'documentacion', 'antepasado', 'genealogia', 'aire', 'tramite', 'guardar', 'resultado'];
  todas.forEach(id => {
     const el = document.getElementById('seccion-' + id);
     if(el) el.classList.add('hidden');
  });

  const origenDiv = document.getElementById('origen_ciudadania_div');
  if (origenDiv) {
     valor === 'si' ? origenDiv.classList.remove('hidden') : origenDiv.classList.add('hidden');
  }
}

function continuarDesde(pasoActual) {
  if (!validarBloque('seccion-' + pasoActual)) {
      return;
  }

  const ruta = flujos[perfilSeleccionado];
  const index = ruta.indexOf(pasoActual);

  if (index !== -1 && index < ruta.length - 1) {
    const siguiente = ruta[index + 1];

    if (siguiente === 'datos-personales') {
        const mensajeTitular = document.getElementById('mensaje-titular');
        const bloqueNombresTitular = document.getElementById('bloque_nombres_titular');
        const para = document.querySelector('input[name="tramite_para"]:checked')?.value;

        const titularNombre = document.getElementById('titular_nombre');
        const titularApellido = document.getElementById('titular_apellido');

        if (para === 'propio' || !para) {
            if(bloqueNombresTitular) bloqueNombresTitular.classList.add('hidden');
            if(mensajeTitular) mensajeTitular.style.display = 'none';

            const cNom = document.querySelector('input[name="contacto_nombre"]');
            const cApe = document.querySelector('input[name="contacto_apellido"]');
            if(titularNombre && cNom) titularNombre.value = cNom.value;
            if(titularApellido && cApe) titularApellido.value = cApe.value;

        } else if (para === 'tercero') {
            if(bloqueNombresTitular) bloqueNombresTitular.classList.remove('hidden');
            const relacionSelect = document.querySelector('select[name="relacion_tercero"]');
            const especifique = document.querySelector('input[name="otro_parentesco"]')?.value;

            let textoRelacion = "la persona interesada";
            if (relacionSelect && relacionSelect.value === 'no_familiar' && especifique) {
                textoRelacion = especifique;
            } else if (relacionSelect && relacionSelect.value) {
                textoRelacion = "tu " + relacionSelect.options[relacionSelect.selectedIndex].text.replace('Soy su ', '');
            }

            if(mensajeTitular) {
               mensajeTitular.innerHTML = `<strong>Atención:</strong> A partir de ahora, completá los datos de <strong>${textoRelacion}</strong> (la persona que hará el trámite), no los tuyos.`;
               mensajeTitular.style.display = 'block';
            }

            const tNomB1 = document.getElementById('titular_nombre_b1');
            const tApeB1 = document.getElementById('titular_apellido_b1');
            if(titularNombre && tNomB1) titularNombre.value = tNomB1.value;
            if(titularApellido && tApeB1) titularApellido.value = tApeB1.value;
        }
    }

    if (siguiente === 'genealogia') {
        construirArbolGenealogico();
    }

    const sigEl = document.getElementById('seccion-' + siguiente);
    if(sigEl) sigEl.classList.remove('hidden');
  }
}

function mostrarOpcionesTercero(valor) {
  const divTercero = document.getElementById('opciones_tercero');
  if (divTercero) {
      valor === 'tercero' ? divTercero.classList.remove('hidden') : divTercero.classList.add('hidden');
  }
  if(valor !== 'tercero') {
      const divOtro = document.getElementById('div_otro_parentesco');
      if(divOtro) divOtro.classList.add('hidden');
      const relSelect = document.querySelector('[name="relacion_tercero"]');
      if(relSelect) relSelect.value = "";
  }
}

function mostrarOtroParentesco(valor) {
  const el = document.getElementById('div_otro_parentesco');
  if(el) valor === 'no_familiar' ? el.classList.remove('hidden') : el.classList.add('hidden');
}

function checkNacionalidadItaliana(prefix) {
   let isItalian = false;
   const inputs = document.querySelectorAll(`input[name^="nacionalidad_${prefix}_"]`);
   inputs.forEach(inp => {
       if(inp.value.toLowerCase().includes('ital')) {
           isItalian = true;
       }
   });

   const container = document.getElementById(`docs_${prefix}_container`);
   if (!container) return;

   if (prefix === 'padre' || prefix === 'madre') {
       const vivoEl = document.getElementById(`${prefix}_vivo`);
       if (vivoEl && vivoEl.value === 'si' && isItalian) {
           container.classList.remove('hidden');
       } else {
           container.classList.add('hidden');
       }
   } else {
       if (isItalian) {
           container.classList.remove('hidden');
       } else {
           container.classList.add('hidden');
       }
   }
}

function generarNacionalidades(prefix, cantidad) {
  const contenedor = document.getElementById('contenedor-nacionalidades-' + prefix);
  if(!contenedor) return;
  contenedor.innerHTML = '';
  const n = parseInt(cantidad) || 0;
  for(let i=1; i<=n; i++) {
     const input = document.createElement('input');
     input.type = 'text';
     input.className = 'req';
     input.name = `nacionalidad_${prefix}_${i}`;
     input.placeholder = `Nacionalidad ${i} (Ej: Argentina, Italiana)`;
     if(i > 1) input.style.marginTop = '5px';
     input.oninput = () => checkNacionalidadItaliana(prefix);
     contenedor.appendChild(input);
  }
  checkNacionalidadItaliana(prefix);
}

function mostrarAclaracionFiliacion(idTarget, valor) {
  const divOtro = document.getElementById(`div_filiacion_${idTarget}_otro`);
  if (divOtro) valor === 'otro' ? divOtro.classList.remove('hidden') : divOtro.classList.add('hidden');
}

function checkDocsParent(tipo) {
   const vivoEl = document.getElementById(tipo + '_vivo');
   const container = document.getElementById('docs_' + tipo + '_container');
   if (!vivoEl || !container) return;
   checkNacionalidadItaliana(tipo);
}

function mostrarEstadoCivil() {
  const estadoEl = document.getElementById('select_estado_civil');
  const divNupcias = document.getElementById('div-nupcias');
  const contenedorMat = document.getElementById('contenedor-matrimonios');
  const nupciasEl = document.getElementById('select_cantidad_nupcias');

  if(!estadoEl || !divNupcias || !contenedorMat || !nupciasEl) return;

  const filaUnionCivil = document.getElementById('fila_acta_union_civil');
  if(filaUnionCivil) {
    filaUnionCivil.style.display = estadoEl.value === 'union_civil' ? 'block' : 'none';
  }

  const estadoActual = estadoEl.value;
  if (estadoActual === 'soltero' || estadoActual === '') {
    divNupcias.classList.add('hidden');
    contenedorMat.classList.add('hidden');
    document.getElementById('lista-matrimonios-dinamicos').innerHTML = '';
    nupciasEl.value = "0";
  } else {
    divNupcias.classList.remove('hidden');
    contenedorMat.classList.remove('hidden');
    if(nupciasEl.value === "0" || nupciasEl.value === "") {
       nupciasEl.value = "1";
    }
    generarMatrimonios();
  }
}

function generarMatrimonios() {
  const nupciasEl = document.getElementById('select_cantidad_nupcias');
  const estadoEl = document.getElementById('select_estado_civil');
  const lista = document.getElementById('lista-matrimonios-dinamicos');

  if(!nupciasEl || !estadoEl || !lista) return;

  const cantidad = nupciasEl.value;
  const estadoActual = estadoEl.value;
  lista.innerHTML = '';
  const n = parseInt(cantidad);
  if (!n) return;

  for (let idMat = 1; idMat <= n; idMat++) {
    let autoEstado = "";
    let hideSelectorEstado = false;

    if (n === 1) {
        hideSelectorEstado = true;
        if(estadoActual === 'casado') autoEstado = 'vigente';
        if(estadoActual === 'divorciado') autoEstado = 'divorcio';
        if(estadoActual === 'viudo') autoEstado = 'fallecimiento';
    }

    const div = document.createElement('div');
    div.className = 'sub-bloque';
    div.innerHTML = `
      <h3 style="margin-top: 0;">Casamiento ${idMat}</h3>
      <div class="grid-2">
        <label>Esposo/a (Nombre): <input type="text" name="mat_${idMat}_nombre"></label>
        <label>Esposo/a (Apellido): <input type="text" name="mat_${idMat}_apellido"></label>
        <label>Fecha en que se casaron: <input type="text" name="mat_${idMat}_fecha_matrimonio" placeholder="Ej: dd/mm/aaaa o 1980"></label>
        <label>Lugar del casamiento: <input type="text" name="mat_${idMat}_lugar_matrimonio"></label>
      </div>
      <div class="grid-3" style="margin-top: 15px; margin-bottom: 15px;">
        <label>Ciudad de nacimiento: <input type="text" name="mat_${idMat}_ciudad_nac"></label>
        <label>Provincia de nacimiento: <input type="text" name="mat_${idMat}_provincia_nac"></label>
        <label>País de nacimiento: <input list="lista_paises" name="mat_${idMat}_pais_nac"></label>
        <label>Fecha de nacimiento: <input type="text" name="mat_${idMat}_fecha_nac" placeholder="Ej: dd/mm/aaaa o año"></label>
      </div>

      <div class="grid-2">
        <div>
          <label>¿Cuántas nacionalidades tiene? (Incluyendo italiana):
            <select onchange="generarNacionalidades('mat_${idMat}', this.value)">
              <option value="1" selected>1</option><option value="2">2</option><option value="3">3</option>
            </select>
          </label>
          <div id="contenedor-nacionalidades-mat_${idMat}" style="margin-top:5px;">
            <input type="text" name="nacionalidad_mat_${idMat}_1" placeholder="Ej: Argentina, Italiana" oninput="checkNacionalidadItaliana('mat_${idMat}')">
          </div>
        </div>

        <label>¿Ya se avisó de este casamiento al Consulado?:
          <select name="mat_${idMat}_consulado" style="width: 100%;">
            <option value="">--</option><option value="si">Sí</option><option value="no">No</option><option value="no_sabe">No sabe</option>
          </select>
        </label>
      </div>

      <div id="docs_mat_${idMat}_container" class="hidden" style="margin-top: 15px;">
        ${getDocsHTML(`mat_${idMat}`, 'Documentos Italianos del Esposo/a')}
      </div>

      <div style="margin-top: 15px; display: ${hideSelectorEstado ? 'none' : 'block'};">
        <label><strong>¿Siguen casados o cómo terminó?</strong><br>
          <select name="mat_${idMat}_estado" id="mat_${idMat}_estado" onchange="mostrarFinMatrimonio(${idMat}, this.value)" style="width: 50%;">
            <option value="">-- Seleccionar --</option><option value="vigente">Siguen Casados (Vigente)</option>
            <option value="divorcio">Se divorciaron</option><option value="fallecimiento">Falleció</option>
          </select>
        </label>
      </div>

      <div id="divorcio_mat_${idMat}" class="${(autoEstado === 'divorcio') ? '' : 'hidden'} sub-bloque alerta">
        <h4 style="margin-top: 0;">Datos del Divorcio</h4>
        <div class="grid-2">
          <label>Fecha: <input type="text" name="mat_${idMat}_fecha_divorcio" placeholder="Ej: dd/mm/aaaa o 2005"></label>
          <label>¿Tiene nota marginal? (El acta dice que se divorció):
            <select name="mat_${idMat}_nota_marginal">
              <option value="">--</option><option value="si">Sí</option><option value="no">No</option>
            </select>
          </label>
          <label style="grid-column: span 2;">Adjuntar sentencia: <input type="file" name="mat_${idMat}_doc_divorcio"></label>
        </div>
      </div>

      <div id="fallecimiento_mat_${idMat}" class="${(autoEstado === 'fallecimiento') ? '' : 'hidden'} sub-bloque alerta">
        <h4 style="margin-top: 0;">Datos del Fallecimiento</h4>
        <div class="grid-2">
          <label>Fecha: <input type="text" name="mat_${idMat}_fecha_fallecimiento" placeholder="Ej: dd/mm/aaaa o 2010"></label>
          <label>Lugar: <input type="text" name="mat_${idMat}_lugar_fallecimiento"></label>
        </div>
      </div>
    `;
    lista.appendChild(div);

    if(hideSelectorEstado) {
        const estadoEl = document.getElementById(`mat_${idMat}_estado`);
        if(estadoEl) estadoEl.value = autoEstado;
    }
  }
}

function mostrarFinMatrimonio(idMat, estado) {
  const divDiv = document.getElementById(`divorcio_mat_${idMat}`);
  const divFal = document.getElementById(`fallecimiento_mat_${idMat}`);

  if(divDiv) estado === 'divorcio' ? divDiv.classList.remove('hidden') : divDiv.classList.add('hidden');
  if(divFal) estado === 'fallecimiento' ? divFal.classList.remove('hidden') : divFal.classList.add('hidden');
}

function toggleHijos(valor) {
  const bloque = document.getElementById('bloque-hijos');
  const cantHijos = document.getElementById('cant_hijos');

  if(!bloque || !cantHijos) return;

  if (valor === 'menores' || valor === 'mayores' || valor === 'ambos') {
      bloque.classList.remove('hidden');
      if(cantHijos.value === "0" || cantHijos.value === "") {
          cantHijos.value = "1";
          generarHijos(1);
      }
  } else {
      bloque.classList.add('hidden');
      cantHijos.value = "0";
      document.getElementById('lista-hijos').innerHTML = '';
  }
}

function generarHijos(cantidad) {
  const lista = document.getElementById('lista-hijos');
  if(!lista) return;
  lista.innerHTML = '';
  const n = parseInt(cantidad);
  if (!n) return;

  for (let i = 1; i <= n; i++) {
     const div = document.createElement('div');
     div.className = 'sub-bloque';
     div.style.backgroundColor = '#fff';
     div.innerHTML = `
       <h4 style="margin-top: 0; color: var(--primary-color);">Hijo/a ${i}</h4>
       <div class="grid-3" style="margin-bottom: 15px;">
         <label>Nombre: <input type="text" name="hijo_${i}_nombre"></label>
         <label>Apellido: <input type="text" name="hijo_${i}_apellido"></label>
         <label>Fecha de Nacimiento: <input type="text" name="hijo_${i}_fecha_nac" placeholder="Ej: dd/mm/aaaa"></label>
         <label>Sexo:
           <select name="hijo_${i}_genero">
             <option value="">--</option>
             <option value="M">Masculino</option>
             <option value="F">Femenino</option>
           </select>
         </label>
       </div>

       <div class="grid-3" style="margin-bottom: 15px;">
         <label>Ciudad de nacimiento: <input type="text" name="hijo_${i}_ciudad_nac"></label>
         <label>Provincia de nacimiento: <input type="text" name="hijo_${i}_provincia_nac"></label>
         <label>País de nacimiento: <input list="lista_paises" name="hijo_${i}_pais_nac"></label>
       </div>

       <div class="grid-2">
         <label>¿Cuántas nacionalidades tiene? (Incluyendo italiana):
           <select onchange="generarNacionalidades('hijo_${i}', this.value)">
             <option value="1" selected>1</option><option value="2">2</option><option value="3">3</option>
           </select>
         </label>
         <div id="contenedor-nacionalidades-hijo_${i}" style="margin-top: 5px;">
           <input type="text" name="nacionalidad_hijo_${i}_1" placeholder="Ej: Argentina, Italiana" oninput="checkNacionalidadItaliana('hijo_${i}')">
         </div>
       </div>

       <div class="grid-2" style="border-top: 1px dashed #eee; padding-top:10px; margin-top:15px;">
         <div>
           <div class="grid-2">
              <label>Nombre del Padre: <input type="text" name="hijo_${i}_padre_nombre"></label>
              <label>Apellido del Padre: <input type="text" name="hijo_${i}_padre_apellido"></label>
              <label>Fecha de nac. del Padre: <input type="text" name="hijo_${i}_padre_fecha_nac" placeholder="dd/mm/aaaa o año"></label>
              <label>Ciudadanía/s del Padre: <input type="text" name="hijo_${i}_padre_ciudadania" placeholder="Ej: Argentina, Italiana"></label>
           </div>
           <label style="display: block; margin-top: 10px;">¿Cómo es el vínculo con el Padre? (Filiación):
             <select name="hijo_${i}_filiacion_padre" onchange="mostrarAclaracionFiliacion('hijo_${i}_padre', this.value)">
               <option value="">-- Seleccionar --</option>
               <option value="biologico">1. De sangre (Biológico)</option>
               <option value="adoptivo">2. Adoptivo</option>
               <option value="reproduccion_asistida">3. Tratamiento de fertilidad</option>
               <option value="gestacion_sustitucion">4. Vientre subrogado</option>
               <option value="reconocimiento">5. Reconocido legalmente</option>
               <option value="otro">Otro (Aclarar)</option>
             </select>
           </label>
           <div id="div_filiacion_hijo_${i}_padre_otro" class="hidden" style="margin-top: 5px;">
             <input type="text" name="hijo_${i}_filiacion_padre_otro_texto" placeholder="Aclarar...">
           </div>
         </div>
         <div>
           <div class="grid-2">
             <label>Nombre de la Madre: <input type="text" name="hijo_${i}_madre_nombre"></label>
             <label>Apellido de la Madre: <input type="text" name="hijo_${i}_madre_apellido"></label>
             <label>Fecha de nac. de la Madre: <input type="text" name="hijo_${i}_madre_fecha_nac" placeholder="dd/mm/aaaa o año"></label>
             <label>Ciudadanía/s de la Madre: <input type="text" name="hijo_${i}_madre_ciudadania" placeholder="Ej: Argentina, Italiana"></label>
           </div>
           <label style="display: block; margin-top: 10px;">¿Cómo es el vínculo con la Madre? (Filiación):
             <select name="hijo_${i}_filiacion_madre" onchange="mostrarAclaracionFiliacion('hijo_${i}_madre', this.value)">
               <option value="">-- Seleccionar --</option>
               <option value="biologico">1. De sangre (Biológica)</option>
               <option value="adoptivo">2. Adoptiva</option>
               <option value="reproduccion_asistida">3. Tratamiento de fertilidad</option>
               <option value="gestacion_sustitucion">4. Vientre subrogado</option>
               <option value="reconocimiento">5. Reconocida legalmente</option>
               <option value="otro">Otro (Aclarar)</option>
             </select>
           </label>
           <div id="div_filiacion_hijo_${i}_madre_otro" class="hidden" style="margin-top: 5px;">
             <input type="text" name="hijo_${i}_filiacion_madre_otro_texto" placeholder="Aclarar...">
           </div>
         </div>
       </div>

       <div style="margin-top: 10px;">
           <label>¿Los padres estaban casados cuando nació?
             <select name="hijo_${i}_padres_casados" style="width: 50%;">
               <option value="">--</option><option value="si">Sí</option><option value="no">No</option>
             </select>
           </label>
       </div>

       <div id="docs_hijo_${i}_container" class="hidden" style="border-top: 1px dashed #eee; padding-top: 15px; margin-top: 15px;">
          ${getDocsHTML(`hijo_${i}`, `Documentos Italianos del Hijo/a ${i}`)}
       </div>
     `;
     lista.appendChild(div);
  }
}

function mostrarHijosActa(checked) {
  const div = document.getElementById('div_nombres_hijos_acta');
  if(div) checked ? div.classList.remove('hidden') : div.classList.add('hidden');
}

function mostrarDetallesJuicio(valor) {
  const div = document.getElementById('detalles_juicio');
  if(div) {
    (valor === 'judicial_materna' || valor === 'judicial_falta_turnos')
      ? div.classList.remove('hidden')
      : div.classList.add('hidden');
  }
}

function toggleConcubino(idGen, checked) {
  const div = document.getElementById(`${idGen}_concubino_div`);
  if(div) checked ? div.classList.remove('hidden') : div.classList.add('hidden');
}

function toggleAvoNoSabe(checked) {
    const camposAvo = document.getElementById('campos_avo');
    const btnContinua = document.querySelector('#seccion-antepasado .btn');
    if(camposAvo) {
        checked ? camposAvo.classList.add('hidden') : camposAvo.classList.remove('hidden');
    }
    if (checked && btnContinua) {
        btnContinua.innerHTML = "Avanzar sin los datos del italiano";
    } else if (btnContinua) {
        btnContinua.innerHTML = "Continuar al siguiente paso";
    }
}

function mostrarNaturalizacion(valor) {
  const el = document.getElementById('bloque-naturalizacion');
  if(el) valor === 'si' ? el.classList.remove('hidden') : el.classList.add('hidden');
}

function mostrarPreguntasNuevaLey(valor) {
  const el = document.getElementById('preguntas_nueva_ley');
  if(el) valor === 'no' ? el.classList.remove('hidden') : el.classList.add('hidden');
}

function generarLineaGenealogica(relacion) {
  const lista = document.getElementById('lista-generaciones');
  if(!lista) return;
  lista.innerHTML = '';

  let numGeneraciones = 0;
  if (relacion === 'nieto') numGeneraciones = 1;
  if (relacion === 'bisnieto') numGeneraciones = 2;
  if (relacion === 'tataranieto') numGeneraciones = 3;
  if (relacion === 'chozno') numGeneraciones = 4;

  for (let i = 1; i <= numGeneraciones; i++) {
    const div = document.createElement('div');
    div.className = 'sub-bloque';
    div.innerHTML = `
      <h4 style="margin-top: 0;">Familiar Intermedio ${i} (Línea directa)</h4>
      <div class="grid-3">
        <label>Género:
          <select name="gen_${i}_genero" id="gen_${i}_genero">
            <option value="">--</option><option value="M">Masculino</option><option value="F">Femenino</option>
          </select>
        </label>
        <label>Nombre: <input type="text" name="gen_${i}_nombre" id="gen_${i}_nombre"></label>
        <label>Apellido: <input type="text" name="gen_${i}_apellido" id="gen_${i}_apellido"></label>
        <label>Ciudad de nacimiento: <input type="text" name="gen_${i}_ciudad_nac"></label>
        <label>Provincia de nacimiento: <input type="text" name="gen_${i}_provincia_nac"></label>
        <label>País de nacimiento: <input list="lista_paises" name="gen_${i}_pais_nac"></label>
        <label>Fecha de nacimiento: <input type="text" name="gen_${i}_fecha_nac" placeholder="Ej: dd/mm/aaaa o Año aprox"></label>
      </div>

      <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ccc;">
        <label><input type="checkbox" onchange="document.getElementById('gen_${i}_fallecido_div').classList.toggle('hidden', !this.checked)"> ¿Falleció?</label>
        <div id="gen_${i}_fallecido_div" class="hidden" style="margin-top: 10px;">
          <label>Fecha de defunción: <input type="text" name="gen_${i}_fecha_def" style="width: 50%;" placeholder="Ej: dd/mm/aaaa o Año aprox"></label>
        </div>
      </div>

      <div style="margin-top: 15px; padding-top: 15px; border-top: 1px dashed #ccc;">
        <label>¿Cuántas veces se casó esta persona?:
          <select name="gen_${i}_cantidad_nupcias" onchange="generarMatrimoniosGeneracion(${i}, this.value)" style="width: 50%;">
            <option value="0">Ninguna / Soltero</option>
            <option value="1">1 vez</option>
            <option value="2">2 veces</option>
            <option value="3">3 veces</option>
            <option value="4">4 o más veces</option>
          </select>
        </label>
        <div id="gen_${i}_matrimonios_container" style="margin-top: 10px;"></div>
      </div>
    `;
    lista.appendChild(div);
  }
}

function generarMatrimoniosGeneracion(idGen, cantidad) {
  const contenedor = document.getElementById(`gen_${idGen}_matrimonios_container`);
  if(!contenedor) return;
  contenedor.innerHTML = '';
  const n = parseInt(cantidad);

  if(!n) return;

  for(let m=1; m<=n; m++) {
     const div = document.createElement('div');
     div.style.marginBottom = "10px";
     div.style.padding = "15px";
     div.style.backgroundColor = "#fff";
     div.style.border = "1px dashed var(--primary-color)";
     div.style.borderRadius = "5px";
     div.innerHTML = `
        <strong style="color: var(--primary-color);">Casamiento ${m}</strong>
        <div class="grid-2" style="margin-top: 10px;">
          <label>Cónyuge (Nombre): <input type="text" name="gen_${idGen}_mat_${m}_nombre"></label>
          <label>Cónyuge (Apellido): <input type="text" name="gen_${idGen}_mat_${m}_apellido"></label>
          <label>Lugar del casamiento: <input type="text" name="gen_${idGen}_mat_${m}_lugar"></label>
          <label>Fecha del casamiento: <input type="text" name="gen_${idGen}_mat_${m}_fecha" placeholder="Ej: dd/mm/aaaa o Año aprox"></label>
        </div>
     `;
     contenedor.appendChild(div);
  }
}

function construirArbolGenealogico() {
  const relacion = document.getElementById('relacion_avo')?.value;
  const contenedor = document.getElementById('lista-generaciones');
  if(!contenedor) return;
  contenedor.innerHTML = '';

  let niveles = [];

  niveles.push({ id: 'avo', titulo: "🇮🇹 Nivel 1: El Italiano Original (AVO)", tipo: 'avo' });

  if (relacion === 'nieto') {
      niveles.push({ id: 1, titulo: "Nivel 2: Padre o Madre del Titular", tipo: 'padre' });
  } else if (relacion === 'bisnieto') {
      niveles.push({ id: 1, titulo: "Nivel 2: Abuelo/a del Titular", tipo: 'abuelo' });
      niveles.push({ id: 2, titulo: "Nivel 3: Padre o Madre del Titular", tipo: 'padre' });
  } else if (relacion === 'tataranieto') {
      niveles.push({ id: 1, titulo: "Nivel 2: Bisabuelo/a del Titular", tipo: 'bisabuelo' });
      niveles.push({ id: 2, titulo: "Nivel 3: Abuelo/a del Titular", tipo: 'abuelo' });
      niveles.push({ id: 3, titulo: "Nivel 4: Padre o Madre del Titular", tipo: 'padre' });
  } else if (relacion === 'chozno') {
      niveles.push({ id: 1, titulo: "Nivel 2: Tatarabuelo/a del Titular", tipo: 'tatarabuelo' });
      niveles.push({ id: 2, titulo: "Nivel 3: Bisabuelo/a del Titular", tipo: 'bisabuelo' });
      niveles.push({ id: 3, titulo: "Nivel 4: Abuelo/a del Titular", tipo: 'abuelo' });
      niveles.push({ id: 4, titulo: "Nivel 5: Padre o Madre del Titular", tipo: 'padre' });
  }

  niveles.push({ id: 'titular', titulo: "🇦🇷 Nivel Final: Persona Interesada (Titular)", tipo: 'titular' });

  let html = '';
  niveles.forEach((nivel, index) => {
      html += `<div class="arbol-nodo">`;
      html += `<div class="arbol-header">${nivel.titulo}</div>`;

      if (nivel.tipo === 'avo') {
          const avoN = document.querySelector('[name="avo_nombre"]')?.value || '---';
          const avoA = document.querySelector('[name="avo_apellido"]')?.value || '---';
          html += `
            <div class="grid-2" style="margin-bottom:15px; text-align: center; font-size: 1.1em;">
              <div><strong>Nombre:</strong> ${avoN}</div>
              <div><strong>Apellido:</strong> ${avoA}</div>
            </div>
            <div style="background:#f9f9f9; padding:15px; border:1px dashed #ccc; border-radius: 5px;">
              <strong style="color:var(--primary-color);">Datos del Cónyuge del Italiano/a:</strong>
              <div class="grid-2" style="margin-top:10px;">
                <label>Nombre: <input type="text" name="avo_conyuge_nombre"></label>
                <label>Apellido: <input type="text" name="avo_conyuge_apellido"></label>
              </div>
            </div>
          `;
      } else if (nivel.tipo === 'titular') {
          const titN = document.getElementById('titular_nombre')?.value || document.querySelector('[name="contacto_nombre"]')?.value || '---';
          const titA = document.getElementById('titular_apellido')?.value || document.querySelector('[name="contacto_apellido"]')?.value || '---';

          const estadoCivil = document.getElementById('select_estado_civil')?.value || '';
          let conyugesHTML = '';

          if (estadoCivil === 'soltero') {
              // Auto-poblar desde Bloque 6: si titular es F tomamos el padre del hijo_1, si es M la madre
              const titularGenero = document.querySelector('[name="genero_solicitante"]')?.value || '';
              let autoConcN = '', autoConcA = '', autoConcFecha = '', autoConcCiud = '';
              if (titularGenero === 'F') {
                  autoConcN     = document.querySelector('[name="hijo_1_padre_nombre"]')?.value || '';
                  autoConcA     = document.querySelector('[name="hijo_1_padre_apellido"]')?.value || '';
                  autoConcFecha = document.querySelector('[name="hijo_1_padre_fecha_nac"]')?.value || '';
                  autoConcCiud  = document.querySelector('[name="hijo_1_padre_ciudadania"]')?.value || '';
              } else {
                  autoConcN     = document.querySelector('[name="hijo_1_madre_nombre"]')?.value || '';
                  autoConcA     = document.querySelector('[name="hijo_1_madre_apellido"]')?.value || '';
                  autoConcFecha = document.querySelector('[name="hijo_1_madre_fecha_nac"]')?.value || '';
                  autoConcCiud  = document.querySelector('[name="hijo_1_madre_ciudadania"]')?.value || '';
              }
              conyugesHTML = `
                <p style="margin: 5px 0; font-size: 0.85em; color: #666;"><em>Estado civil: Soltero/a</em></p>
                <label style="font-weight: normal; font-size: 0.9em;">Concubino/a o Progenitor/a de los hijos:</label>
                <div class="grid-2" style="margin-top: 5px;">
                  <input type="text" name="concubino_nombre" placeholder="Nombre" value="${autoConcN}">
                  <input type="text" name="concubino_apellido" placeholder="Apellido" value="${autoConcA}">
                  <input type="text" name="concubino_fecha_nac" placeholder="Fecha de nacimiento (dd/mm/aaaa o año)" value="${autoConcFecha}">
                  <input type="text" name="concubino_ciudadania" placeholder="Ciudadanía/s (Ej: Argentina, Italiana)" value="${autoConcCiud}">
                </div>
              `;
          } else {
              const nupcias = parseInt(document.getElementById('select_cantidad_nupcias')?.value) || 0;
              if (nupcias > 0) {
                  conyugesHTML += `<ul style="margin: 5px 0; padding-left: 20px;">`;
                  for(let c=1; c<=nupcias; c++) {
                      const cN = document.querySelector(`[name="mat_${c}_nombre"]`)?.value || '';
                      const cA = document.querySelector(`[name="mat_${c}_apellido"]`)?.value || '';
                      if(cN || cA) conyugesHTML += `<li>${cN} ${cA}</li>`;
                  }
                  conyugesHTML += `</ul>`;
              } else {
                  conyugesHTML = '<br><em>No se cargaron casamientos.</em>';
              }
          }

          let hijosHTML = '';
          const cantHijos = parseInt(document.getElementById('cant_hijos')?.value) || 0;
          if (cantHijos > 0) {
              hijosHTML += `<ul style="margin: 5px 0; padding-left: 20px;">`;
              for(let h=1; h<=cantHijos; h++) {
                  const hN = document.querySelector(`[name="hijo_${h}_nombre"]`)?.value || '';
                  const hA = document.querySelector(`[name="hijo_${h}_apellido"]`)?.value || '';
                  if(hN || hA) hijosHTML += `<li>${hN} ${hA}</li>`;
              }
              hijosHTML += `</ul>`;
          } else {
              hijosHTML = '<br><em>No se cargaron hijos.</em>';
          }

          html += `
            <div class="grid-2" style="margin-bottom:15px; text-align: center; font-size: 1.1em;">
              <div><strong>Nombre:</strong> ${titN}</div>
              <div><strong>Apellido:</strong> ${titA}</div>
            </div>
            <div class="grid-2">
              <div style="background:#f9f9f9; padding:15px; border:1px dashed #ccc; border-radius: 5px;">
                <strong style="color:var(--primary-color);">Cónyuges registrados:</strong>${conyugesHTML}
              </div>
              <div style="background:#f9f9f9; padding:15px; border:1px dashed #ccc; border-radius: 5px;">
                <strong style="color:var(--primary-color);">Hijos registrados:</strong>${hijosHTML}
              </div>
            </div>
          `;
      } else {
          let selectorAutofill = '';
          if (nivel.tipo === 'padre') {
             selectorAutofill = `
               <div style="margin-bottom:15px; padding:10px; background:#e6f7ff; border-radius:4px; border-left: 4px solid var(--primary-color);">
                 <label>¿La ciudadanía baja por la rama del Padre o de la Madre?:
                   <select onchange="autocompletarPadreMadre(this.value, ${nivel.id})" style="width:200px; display:inline-block; margin-left:10px;">
                     <option value="">-- Elegir para autocompletar --</option>
                     <option value="padre">El Padre</option>
                     <option value="madre">La Madre</option>
                   </select>
                 </label>
               </div>
             `;
          }

          html += `
            ${selectorAutofill}
            <div class="grid-3" style="margin-bottom:15px;">
              <label>Nombre: <input type="text" id="gen_${nivel.id}_nombre" name="gen_${nivel.id}_nombre"></label>
              <label>Apellido: <input type="text" id="gen_${nivel.id}_apellido" name="gen_${nivel.id}_apellido"></label>
              <label>Género:
                <select name="gen_${nivel.id}_genero" id="gen_${nivel.id}_genero">
                  <option value="">--</option><option value="M">Masculino</option><option value="F">Femenino</option>
                </select>
              </label>
            </div>
            <div class="grid-3" style="margin-bottom:15px;">
              <label>Ciudad de nacimiento: <input type="text" name="gen_${nivel.id}_ciudad_nac"></label>
              <label>Provincia de nacimiento: <input type="text" name="gen_${nivel.id}_provincia_nac"></label>
              <label>País de nacimiento: <input list="lista_paises" name="gen_${nivel.id}_pais_nac"></label>
            </div>

            <div class="grid-3" style="margin-bottom:15px; padding-top: 15px; border-top: 1px solid #eee;">
              <label>Fecha de nacimiento: <input type="text" name="gen_${nivel.id}_fecha_nac" placeholder="Ej: 15/04/1890 o aprox 1890"></label>
              <div style="grid-column: span 2;">
                 <label><input type="checkbox" onchange="document.getElementById('gen_${nivel.id}_fallecido_div').classList.toggle('hidden', !this.checked)"> ¿Falleció?</label>
                 <div id="gen_${nivel.id}_fallecido_div" class="hidden" style="margin-top: 5px;">
                   <label>Fecha de defunción: <input type="text" name="gen_${nivel.id}_fecha_def" style="width: 50%;" placeholder="Ej: dd/mm/aaaa o Año aprox"></label>
                 </div>
              </div>
            </div>

            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px dashed #ccc;">
              <label>¿Cuántas veces se casó esta persona?:
                <select name="gen_${nivel.id}_cantidad_nupcias" onchange="generarMatrimoniosGeneracion(${nivel.id}, this.value)" style="width: 50%;">
                  <option value="0">Ninguna / Soltero</option>
                  <option value="1">1 vez</option>
                  <option value="2">2 veces</option>
                  <option value="3">3 veces</option>
                  <option value="4">4 o más veces</option>
                </select>
              </label>
              <div id="gen_${nivel.id}_matrimonios_container" style="margin-top: 10px;"></div>
              <div style="margin-top: 10px;">
                <label style="font-weight: normal; cursor: pointer;">
                  <input type="checkbox" onchange="toggleConcubino('gen_${nivel.id}', this.checked)">
                  ¿Hubo concubino/a o progenitor/a de los hijos?
                </label>
                <div id="gen_${nivel.id}_concubino_div" class="hidden" style="margin-top: 8px;">
                  <div class="grid-2">
                    <input type="text" name="gen_${nivel.id}_concubino_nombre" placeholder="Nombre del concubino/a">
                    <input type="text" name="gen_${nivel.id}_concubino_apellido" placeholder="Apellido del concubino/a">
                  </div>
                </div>
              </div>
            </div>
          `;
      }
      html += `</div>`;
      if (index < niveles.length - 1) {
          html += `<div class="arbol-conector"></div>`;
      }
  });

  contenedor.innerHTML = html;
}

function autocompletarPadreMadre(lado, idGeneracion) {
    if(!lado) return;
    const nombreInput = document.getElementById(`gen_${idGeneracion}_nombre`);
    const apellidoInput = document.getElementById(`gen_${idGeneracion}_apellido`);
    const generoInput = document.getElementById(`gen_${idGeneracion}_genero`);

    let nombreVal = document.querySelector(`[name="${lado}_nombre"]`)?.value || '';
    let apellidoVal = document.querySelector(`[name="${lado}_apellido"]`)?.value || '';

    const conyugeNombreInput = document.querySelector(`[name="gen_${idGeneracion}_mat_1_nombre"]`);
    const conyugeApellidoInput = document.querySelector(`[name="gen_${idGeneracion}_mat_1_apellido"]`);

    let otroLado = (lado === 'padre') ? 'madre' : 'padre';
    let conyugeNombreVal = document.querySelector(`[name="${otroLado}_nombre"]`)?.value || '';
    let conyugeApellidoVal = document.querySelector(`[name="${otroLado}_apellido"]`)?.value || '';

    if(nombreInput) nombreInput.value = nombreVal;
    if(apellidoInput) apellidoInput.value = apellidoVal;
    if(generoInput) generoInput.value = (lado === 'padre') ? 'M' : 'F';

    if(conyugeNombreInput) conyugeNombreInput.value = conyugeNombreVal;
    if(conyugeApellidoInput) conyugeApellidoInput.value = conyugeApellidoVal;
}

function agregarDomicilio() {
  contadorDomicilios++;
  const div = document.createElement('div');
  div.className = 'sub-bloque';
  div.innerHTML = `
    <h4 style="margin-top: 0;">Domicilio o Mudanza ${contadorDomicilios}</h4>
    <div class="grid-2">
      <label>País: <input list="lista_paises" name="domicilio_${contadorDomicilios}_pais" placeholder="Ej: Argentina"></label>
      <label>Ciudad: <input type="text" name="domicilio_${contadorDomicilios}_ciudad"></label>
      <label>Desde (Fecha): <input type="date" name="domicilio_${contadorDomicilios}_desde"></label>
      <label>Hasta (Fecha): <input type="date" name="domicilio_${contadorDomicilios}_hasta"></label>
      <label style="grid-column: span 2; margin-top: 10px;">
         <input type="checkbox" name="domicilio_${contadorDomicilios}_notificado"> ¿Este domicilio fue notificado al Consulado?
      </label>
    </div>
  `;
  document.getElementById('lista-domicilios').appendChild(div);
}

function guardarFicha() {
  if (!validarBloque('seccion-guardar')) return;

  const filiacionPadre = document.querySelector('[name="filiacion_padre"]')?.value || '';
  const filiacionMadre = document.querySelector('[name="filiacion_madre"]')?.value || '';
  const estadoCivilTitular = document.getElementById('select_estado_civil')?.value || '';

  let alertaAdopcion = '';
  let notaUnionCivil = '';

  if (estadoCivilTitular === 'union_civil') {
    notaUnionCivil = '<div class="alerta" style="border-left-color:#9c27b0; background:#f3e5f5; padding:15px; margin-top:10px;">ℹ️ <strong>NOTA — UNIÓN CIVIL:</strong> La persona está unida civilmente con persona del mismo sexo. Verificar que el acta de unión civil esté transcripta en el Comune italiano correspondiente y actualizar la inscripción en el AIRE como pareja civil.</div>';
  }
  if (filiacionPadre === 'adoptivo' || filiacionMadre === 'adoptivo') {
    alertaAdopcion = '<div class="alerta" style="border-left-color:#9c27b0; background:#f3e5f5; padding:15px; margin-top:10px;">⚠️ <strong>ALERTA FILIACIÓN ADOPTIVA:</strong> Se registró un vínculo adoptivo con uno de los padres. La transmisión de ciudadanía italiana por adopción depende del tipo y la fecha. <strong>Adopción plena posterior a 1983</strong>: se equipara a la filiación biológica. Para adopciones anteriores o simples corresponde análisis legal específico antes de avanzar.</div>';
  }

  const avoNoSabe = document.getElementById('avo_no_sabe')?.checked;
  const comuna = (document.getElementById('avo_comune')?.value || '') + ' ' + (document.getElementById('avo_provincia')?.value || '');
  const fechaEmigracion = document.querySelector('[name="avo_fecha_emigracion"]')?.value || '';
  const naturalizado = document.querySelector('[name="avo_naturalizado"]')?.value || '';
  const tieneHijos = document.getElementById('tiene_hijos')?.value || '';
  const origenCiudadania = document.getElementById('origen_ciudadania')?.value || '';
  const anioObtencion = document.querySelector('[name="anio_obtencion"]')?.value || 'desconocido';

  const resultadoSection = document.getElementById('seccion-resultado');
  if(resultadoSection) resultadoSection.classList.remove('hidden');

  const resultado = document.getElementById('resultado-contenido');
  if(!resultado) return;

  const territoriosAH = ['Trento', 'Bolzano', 'Trieste', 'Gorizia'];
  const esTerritorioAH = territoriosAH.some(t => comuna.includes(t));

  const regexYear = /\b(18|19|20)\d{2}\b/;
  let matchEmigracion = fechaEmigracion.match(regexYear);
  let anioEmigracionNum = matchEmigracion ? parseInt(matchEmigracion[0]) : null;

  let alertaAustrohungara = '';
  if (esTerritorioAH && anioEmigracionNum && anioEmigracionNum < 1920) {
    alertaAustrohungara = '<div class="alerta alerta-roja" style="padding: 15px; margin-top: 15px;">🚫 <strong>ALERTA AUSTRO-HÚNGARA:</strong> El antepasado emigró de Trento, Trieste, Gorizia o Bolzano antes del <strong>16 de julio de 1920</strong>. En esa época la zona no era de Italia. El trámite no se puede hacer por vía normal.</div>';
  }

  let alertaHijosMenores = '';
  if (tieneHijos === 'menores' || tieneHijos === 'ambos') {
    alertaHijosMenores = '<div class="alerta alerta-roja" style="padding: 15px; margin-top: 15px;">⚠️ <strong>ALERTA LEY 74/2025 (Hijos Menores):</strong> Al tener hijos menores de 18 años, la nueva ley exige presentar el trámite de ellos ante el Consulado ANTES del 31 de mayo de 2029.</div>';
  }

  let bloqueadoPorDL2025 = false;
  if (perfilSeleccionado === 'no' || perfilSeleccionado === 'no_sabe') {
    const turnoPrevio = document.querySelector('[name="turno_previo_2025"]')?.value;
    if (turnoPrevio === 'no') {
        const ancestroExclusivo = document.querySelector('[name="ancestro_exclusivo"]')?.value;
        const residencia2Anios = document.querySelector('[name="residencia_2_anios"]')?.value;
        if (ancestroExclusivo !== 'si' && residencia2Anios !== 'si') {
            bloqueadoPorDL2025 = true;
        }
    }
  }

  let viaJudicialMaterna = false;
  const relacionAvo = document.getElementById('relacion_avo')?.value || '';
  let numGen = 0;
  if (relacionAvo === 'nieto') numGen = 1;
  if (relacionAvo === 'bisnieto') numGen = 2;
  if (relacionAvo === 'tataranieto') numGen = 3;
  if (relacionAvo === 'chozno') numGen = 4;

  const linaje = [];
  if (!avoNoSabe) {
      linaje.push({
        nombre: 'AVO',
        genero: document.querySelector('[name="avo_genero"]')?.value,
        fechaNac: document.querySelector('[name="avo_fecha_nacimiento"]')?.value
      });

      for (let i = 1; i <= numGen; i++) {
        linaje.push({
          nombre: `Gen ${i}`,
          genero: document.querySelector(`[name="gen_${i}_genero"]`)?.value,
          fechaNac: document.querySelector(`[name="gen_${i}_fecha_nac"]`)?.value
        });
      }

      linaje.push({
        nombre: 'Titular',
        genero: document.querySelector('[name="genero_solicitante"]')?.value,
        fechaNac: document.querySelector('[name="fecha_nacimiento"]')?.value
      });

      const corte1948 = new Date('1948-01-01');
      for (let i = 0; i < linaje.length - 1; i++) {
        const actual = linaje[i];
        const siguiente = linaje[i+1];
        if (actual && siguiente && actual.genero === 'F' && siguiente.fechaNac) {
          let matchNac = siguiente.fechaNac.match(regexYear);
          let anioNacNum = matchNac ? parseInt(matchNac[0]) : null;
          if (anioNacNum && anioNacNum < 1948) {
            viaJudicialMaterna = true;
            break;
          }
        }
      }
  }

  let textoOrigen = '';
  if(origenCiudadania === 'consulado') textoOrigen = 'Reconocimiento en Consulado';
  else if(origenCiudadania === 'italia') textoOrigen = 'Reconocimiento Administrativo en Italia';
  else if(origenCiudadania === 'juicio') textoOrigen = 'Reconocimiento por Juicio en Italia';
  else if(origenCiudadania === 'matrimonio') textoOrigen = 'Naturalización por Matrimonio';
  else if(origenCiudadania === 'no_sabe') textoOrigen = 'Vía desconocida / A confirmar';
  else if(origenCiudadania === 'otro') textoOrigen = 'Otra vía legal';

  let veredictoViabilidad = '';

  if (avoNoSabe) {
     veredictoViabilidad = '<div class="alerta" style="border-left-color:#005b9f; background:#eef; padding:15px; margin-bottom: 10px;">🔍 <strong>INFORME LEGAL - BÚSQUEDA DE ACTAS NECESARIA:</strong> El cliente no cuenta con los datos del italiano original. <strong>Corresponde iniciar primero el servicio de Búsqueda de Antepasados en Italia</strong> antes de poder definir la viabilidad y la vía del trámite.</div>';
  }
  else if (bloqueadoPorDL2025) {
     veredictoViabilidad = '<div class="alerta" style="border-left-color:#f57c00; background:#fff3e0; padding:15px; margin-bottom: 10px;">⚖️ <strong>INFORME LEGAL - VIABLE SÓLO POR JUICIO EN ITALIA (DL 36/2025):</strong> Al no tener turno antes de marzo de 2025 y no cumplir las excepciones impuestas por la Ley 74/2025, la transmisión administrativa por Consulado se interrumpe. <strong>El caso SÍ puede avanzar presentando un recurso judicial contra las filas en los tribunales de Italia.</strong></div>';
  }
  else if (naturalizado === 'si') {
    const hijosAntes = document.querySelector('[name="avo_hijos_antes_naturalizacion"]')?.value;
    if (hijosAntes === 'no') {
      veredictoViabilidad = '<div class="alerta alerta-roja" style="padding:15px; margin-bottom: 10px;">🚫 <strong>INFORME LEGAL - NO VIABLE:</strong> El antepasado se naturalizó ANTES de que naciera su hijo/a. La línea de descendencia se interrumpe en ese punto, sin posibilidades legales de reclamo.</div>';
    } else if (hijosAntes === 'si') {
      veredictoViabilidad = viaJudicialMaterna
        ? '<div class="alerta" style="border-left-color:#f57c00; background:#fff3e0; padding:15px; margin-bottom: 10px;">⚖️ <strong>INFORME LEGAL - VIABLE VÍA JUDICIAL (Ley 1948):</strong> El antepasado se naturalizó después de tener a su descendiente, conservando la transmisión. Sin embargo, existe una mujer en la línea que dio a luz antes de 1948. <strong>Se debe accionar mediante juicio en Italia (Vía Materna), el Consulado no lo permite.</strong></div>'
        : '<div class="alerta" style="border-left-color:#388e3c; background:#e8f5e9; padding:15px; margin-bottom: 10px;">✅ <strong>INFORME LEGAL - VIABLE POR CONSULADO:</strong> Línea conservada (el antepasado se naturalizó después del nacimiento del hijo) y sin restricciones por la ley de 1948 ni la nueva normativa 2025. <strong>Corresponde armado de carpeta para Consulado.</strong></div>';
    } else {
      veredictoViabilidad = '<p style="color: #f57c00;">⚠️ <strong>FALTAN DATOS:</strong> No se indicó si el familiar original tuvo a su hijo antes o después de naturalizarse. Es imprescindible este dato para el análisis legal.</p>';
    }
  }
  else if (naturalizado === 'no' || naturalizado === 'no_sabe') {
     veredictoViabilidad = viaJudicialMaterna
        ? '<div class="alerta" style="border-left-color:#f57c00; background:#fff3e0; padding:15px; margin-bottom: 10px;">⚖️ <strong>INFORME LEGAL - VIABLE VÍA JUDICIAL (Ley 1948):</strong> Existe una mujer en la familia que tuvo a su descendiente directo antes del 1 de enero de 1948. <strong>Corresponde juicio de reconocimiento en los tribunales italianos. El Consulado no admite este caso por vía administrativa.</strong></div>'
        : '<div class="alerta" style="border-left-color:#388e3c; background:#e8f5e9; padding:15px; margin-bottom: 10px;">✅ <strong>INFORME LEGAL - VIABLE POR CONSULADO:</strong> Línea pura paterna o descendencia posterior a 1948, sin verse afectada por la Ley 74/2025. <strong>El caso es plenamente viable para trámite administrativo consular.</strong></div>';
  }

  if (perfilSeleccionado === 'en_tramite') {
    resultado.innerHTML = '<p>📋 <strong>INFORME:</strong> Ficha de seguimiento de trámite creada exitosamente. Se deberá hacer seguimiento al protocolo cargado.</p>' + notaUnionCivil + alertaAdopcion + alertaAustrohungara + alertaHijosMenores;
  } else if (perfilSeleccionado === 'si') {
    let notaViaMaterna = '';
    if (!avoNoSabe && viaJudicialMaterna) {
        notaViaMaterna = '<div class="alerta" style="border-left-color:#f57c00; background:#fff3e0; padding:15px; margin-top:10px;">⚖️ <strong>ANÁLISIS GENEALÓGICO — VÍA MATERNA 1948:</strong> El árbol confirma que existe una mujer en la línea de descendencia que transmitió la ciudadanía a un hijo/a nacido/a <strong>antes del 1 de enero de 1948</strong>. Esto es consistente con el reconocimiento obtenido por vía judicial.</div>';
    }
    resultado.innerHTML = `<p>🇮🇹 <strong>INFORME:</strong> El titular ya cuenta con el reconocimiento de su ciudadanía italiana.</p>
    <div class="sub-bloque"><strong>Análisis del sistema:</strong><br>Fue reconocido mediante <strong>${textoOrigen}</strong> en el año <strong>${anioObtencion}</strong>.</div>` + notaViaMaterna + notaUnionCivil + alertaAdopcion + alertaAustrohungara + alertaHijosMenores;
  } else {
    if (alertaAustrohungara) {
       resultado.innerHTML = alertaAustrohungara + notaUnionCivil + alertaAdopcion + alertaHijosMenores + '<p><em>Nota: La alerta Austro-Húngara bloquea todo análisis posterior.</em></p>';
    } else {
       resultado.innerHTML = veredictoViabilidad + notaUnionCivil + alertaAdopcion + alertaHijosMenores;
    }
  }
}
