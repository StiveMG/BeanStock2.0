const API_URL = "/api/";
let diccionarioRecetaVisual = {}; 
let listadoInsumosNombres = {};
let insumoEditandoId = null;
let bebidaEditandoId = null;

const mesesStr = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

document.addEventListener('DOMContentLoaded', () => {
    cargarFiltroMeses();
});

function cargarFiltroMeses() {
    const select = document.getElementById('filtro-meses');
    if (!select) return;
    const mesActual = new Date().getMonth();
    select.innerHTML = "";
    mesesStr.forEach((mes, index) => {
        const selected = index === mesActual ? "selected" : "";
        select.innerHTML += `<option value="${index}" ${selected}>${mes}</option>`;
    });
}

function mostrarAlerta(mensaje, tipo = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    const isSuccess = tipo === 'success';
    toast.className = `${isSuccess ? 'bg-coffee-800' : 'bg-red-600'} text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 toast-enter border ${isSuccess ? 'border-coffee-500' : 'border-red-400'}`;
    toast.innerHTML = `<div class="${isSuccess ? 'bg-coffee-500' : 'bg-red-500'} p-2 rounded-full"><i class="fa-solid ${isSuccess ? 'fa-check' : 'fa-exclamation'} text-white"></i></div><p class="font-bold tracking-wide">${mensaje}</p>`;
    container.appendChild(toast);
    setTimeout(() => { toast.classList.replace('toast-enter', 'toast-leave'); setTimeout(() => toast.remove(), 300); }, 4000);
}

function parsearErrorDjango(data) {
    if (typeof data === 'string') return data;
    if (data.error) return Array.isArray(data.error) ? data.error[0] : data.error;
    if (data.detail) return data.detail;
    let mensajes = [];
    for (let c in data) { if (Array.isArray(data[c])) mensajes.push(`${data[c][0]}`); }
    return mensajes.length > 0 ? mensajes.join(' ') : "Transacción rechazada.";
}

async function fetchAPI(endpoint, method = 'GET', body = null) {
    const token = localStorage.getItem("access_token");
    const headers = { "Content-Type": "application/json", "Authorization": token ? `Bearer ${token}` : "" };
    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);
    try {
        const res = await fetch(API_URL + endpoint, options);
        if (res.status === 401) { cerrarSesion(); mostrarAlerta("Sesión caducada.", "error"); throw new Error("401"); }
        const data = await res.json().catch(() => ({}));
        return { ok: res.ok, status: res.status, data };
    } catch (e) { return { ok: false, data: { error: "Falla de comunicación interna." } }; }
}

function actualizarDashboardGlobal() {
    document.getElementById('stat-alertas').innerText = Object.values(listadoInsumosNombres).filter(i => i.cant <= 50).length;
    fetchAPI("bebidas/").then(res => { if(res.ok) document.getElementById('stat-bebidas').innerText = res.data.length; });
}

function mostrarTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.getElementById(tabId).classList.remove('hidden');
    if(tabId === 'tab-insumos') cargarInsumos();
    if(tabId === 'tab-bebidas') { cargarBebidas(); cargarSelectInsumosVisual(); }
    if(tabId === 'tab-produccion') cargarSelectsBebidas();
    if(tabId === 'tab-ventas') { cargarSelectsBebidas(); cargarHistorialVentas(); }
    actualizarDashboardGlobal();
}

async function iniciarSesion() {
    const u = document.getElementById('username').value, p = document.getElementById('password').value;
    const res = await fetchAPI("token/", "POST", { username: u, password: p });
    if (res.ok) {
        localStorage.setItem("access_token", res.data.access);
        document.getElementById('user-display').innerText = u;
        document.getElementById('auth-section').classList.add('hidden');
        document.getElementById('dashboard-section').classList.remove('hidden');
        document.getElementById('nav-logout').classList.remove('hidden');
        mostrarAlerta(`Sistema desbloqueado.`, 'success');
        mostrarTab('tab-insumos');
    } else { mostrarAlerta("Credenciales erróneas.", 'error'); }
}

function cerrarSesion() {
    localStorage.removeItem("access_token");
    document.getElementById('auth-section').classList.remove('hidden');
    document.getElementById('dashboard-section').classList.add('hidden');
    document.getElementById('nav-logout').classList.add('hidden');
    document.getElementById('username').value = ""; document.getElementById('password').value = "";
}

async function registrar() {
    const u = document.getElementById('username').value, p = document.getElementById('password').value;
    if(!u || !p) return mostrarAlerta("Datos incompletos.", "error");
    const res = await fetch("/api/registro/", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: u, password: p }) });
    if(res.ok) { mostrarAlerta("Credencial creada.", 'success'); }
    else { mostrarAlerta("El usuario ya se encuentra registrado.", 'error'); }
}

async function cargarInsumos() {
    const res = await fetchAPI("insumos/");
    const tbody = document.getElementById('tabla-insumos');
    tbody.innerHTML = "";
    listadoInsumosNombres = {};
    
    res.data.forEach(ins => {
        listadoInsumosNombres[ins.id_producto] = { nombre: ins.nombre, uni: ins.unidad_medida, cant: ins.cantidad };
        const isLow = ins.cantidad <= 50;
        tbody.innerHTML += `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-5 font-mono text-xs font-bold text-gray-400">${ins.id_producto}</td>
                <td class="px-6 py-5 font-black text-gray-800 text-lg">${ins.nombre}</td>
                <td class="px-6 py-5">
                    <span class="${isLow ? 'bg-red-100 text-red-700' : 'bg-coffee-100 text-coffee-800'} px-3 py-1 rounded-lg font-black border ${isLow ? 'border-red-200' : 'border-coffee-200'}">
                        ${ins.cantidad} <span class="text-xs font-bold uppercase ml-1">${ins.unidad_medida}</span>
                    </span>
                </td>
                <td class="px-6 py-5 text-right space-x-2">
                    <button onclick="prepararEdicionInsumo('${ins.id_producto}')" class="text-blue-500 hover:text-blue-700 bg-blue-50 w-10 h-10 rounded-xl transition"><i class="fa-solid fa-pen"></i></button>
                    <button onclick="eliminarEntidad('insumos', '${ins.id_producto}')" class="text-red-500 hover:text-red-700 bg-red-50 w-10 h-10 rounded-xl transition"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>`;
    });
    actualizarDashboardGlobal();
}

function prepararEdicionInsumo(id) {
    const ins = listadoInsumosNombres[id];
    insumoEditandoId = id;
    document.getElementById('titulo-form-insumo').innerText = `Actualizando: ${id}`;
    document.getElementById('ins-nombre').value = ins.nombre;
    document.getElementById('ins-cant').value = ins.cant;
    document.getElementById('ins-uni').value = ins.uni;
    document.getElementById('btn-guardar-insumo').innerHTML = '<i class="fa-solid fa-rotate mr-2"></i> Actualizar Ficha';
    document.getElementById('btn-guardar-insumo').classList.replace('bg-coffee-800', 'bg-blue-600');
    document.getElementById('btn-guardar-insumo').classList.replace('hover:bg-coffee-900', 'hover:bg-blue-700');
    document.getElementById('btn-cancelar-insumo').classList.remove('hidden');
    document.getElementById('form-insumos-container').classList.add('ring-4', 'ring-blue-100');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelarEdicionInsumo() {
    insumoEditandoId = null;
    document.getElementById('titulo-form-insumo').innerText = "Registrar Nuevo Insumo";
    document.getElementById('ins-nombre').value = ''; document.getElementById('ins-cant').value = '';
    document.getElementById('btn-guardar-insumo').innerHTML = '<i class="fa-solid fa-save mr-2"></i> Guardar en Bodega';
    document.getElementById('btn-guardar-insumo').classList.replace('bg-blue-600', 'bg-coffee-800');
    document.getElementById('btn-guardar-insumo').classList.replace('hover:bg-blue-700', 'hover:bg-coffee-900');
    document.getElementById('btn-cancelar-insumo').classList.add('hidden');
    document.getElementById('form-insumos-container').classList.remove('ring-4', 'ring-blue-100');
}

async function guardarInsumo() {
    const body = { nombre: document.getElementById('ins-nombre').value, cantidad: parseFloat(document.getElementById('ins-cant').value), unidad_medida: document.getElementById('ins-uni').value };
    const method = insumoEditandoId ? "PUT" : "POST";
    const endpoint = insumoEditandoId ? `insumos/${insumoEditandoId}/` : "insumos/";
    const res = await fetchAPI(endpoint, method, body);
    if(res.ok) { 
        mostrarAlerta(insumoEditandoId ? "Ficha actualizada." : "Materia prima registrada.", 'success'); 
        cancelarEdicionInsumo(); cargarInsumos();
    } else { mostrarAlerta(parsearErrorDjango(res.data), 'error'); }
}

async function cargarSelectInsumosVisual() {
    const res = await fetchAPI("insumos/");
    const sel = document.getElementById('sel-insumo');
    sel.innerHTML = '<option value="">-- Buscar Ingrediente --</option>';
    res.data.forEach(ins => { sel.innerHTML += `<option value="${ins.id_producto}">${ins.nombre} (${ins.unidad_medida})</option>`; });
}

function agregarAlDiccionario() {
    const id = document.getElementById('sel-insumo').value;
    const cant = parseFloat(document.getElementById('sel-cant').value);
    if(!id || !cant) return mostrarAlerta("Define el ingrediente y la dosis.", "error");
    diccionarioRecetaVisual[id] = cant;
    actualizarListaRecetaVisual();
    document.getElementById('sel-cant').value = '';
}

function quitarDelDiccionario(id) { delete diccionarioRecetaVisual[id]; actualizarListaRecetaVisual(); }

function actualizarListaRecetaVisual() {
    const ul = document.getElementById('lista-receta-visual');
    const placeholder = document.getElementById('receta-vacia');
    ul.innerHTML = "";
    const keys = Object.keys(diccionarioRecetaVisual);
    if(keys.length === 0) { placeholder.classList.remove('hidden'); } 
    else {
        placeholder.classList.add('hidden');
        keys.forEach(id => {
            const obj = listadoInsumosNombres[id];
            const nombreStr = obj ? obj.nombre : id;
            const uni = obj ? obj.uni : '';
            ul.innerHTML += `
                <li class="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-200 shadow-sm">
                    <span class="font-bold text-gray-800">${nombreStr}</span>
                    <div class="flex items-center gap-4">
                        <span class="bg-white px-3 py-1 rounded border border-gray-200 font-black text-coffee-800">${diccionarioRecetaVisual[id]} <span class="text-xs font-medium text-gray-400">${uni}</span></span>
                        <button onclick="quitarDelDiccionario('${id}')" class="text-red-400 hover:text-red-600"><i class="fa-solid fa-circle-minus text-xl"></i></button>
                    </div>
                </li>`;
        });
    }
}

async function cargarBebidas() {
    const res = await fetchAPI("bebidas/");
    const div = document.getElementById('lista-bebidas-cards');
    div.innerHTML = "";
    res.data.forEach(b => {
        let itemsReceta = Object.entries(b.receta).map(([id, cant]) => {
            const n = listadoInsumosNombres[id] ? listadoInsumosNombres[id].nombre : id;
            return `<div class="flex justify-between text-sm py-1 border-b border-gray-100 last:border-0"><span class="text-gray-600 font-medium">${n}</span><span class="font-bold text-coffee-900">${cant}</span></div>`;
        }).join('');
        div.innerHTML += `
            <div class="bg-white border border-gray-100 rounded-2xl p-6 shadow-xl relative hover:shadow-2xl transition flex flex-col h-full">
                <div class="absolute top-4 right-4 flex gap-2">
                    <button onclick="prepararEdicionBebida('${b.id_producto}')" class="text-blue-500 hover:text-blue-700 bg-blue-50 w-10 h-10 rounded-xl transition"><i class="fa-solid fa-pen"></i></button>
                    <button onclick="eliminarEntidad('bebidas', '${b.id_producto}')" class="text-red-500 hover:text-red-700 bg-red-50 w-10 h-10 rounded-xl transition"><i class="fa-solid fa-trash"></i></button>
                </div>
                <h4 class="font-black text-2xl text-coffee-900 pr-24 leading-tight">${b.nombre}</h4>
                <p class="text-xs text-gray-400 font-bold font-mono mb-6">${b.id_producto}</p>
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center"><span class="block text-xs text-gray-400 uppercase font-bold mb-1">Stock Vitrina</span><span class="font-black text-2xl text-coffee-800">${b.cantidad}</span></div>
                    <div class="bg-green-50 p-3 rounded-xl border border-green-100 text-center"><span class="block text-xs text-green-600/70 uppercase font-bold mb-1">Precio</span><span class="font-black text-2xl text-green-700">$${b.precio_venta}</span></div>
                </div>
                <div class="mt-auto bg-gray-50 p-4 rounded-xl border border-gray-200"><p class="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Composición</p>${itemsReceta || '<p class="text-sm text-red-500 font-bold">Fórmula no definida</p>'}</div>
            </div>`;
    });
    actualizarDashboardGlobal();
}

async function prepararEdicionBebida(id) {
    const res = await fetchAPI(`bebidas/${id}/`);
    if(!res.ok) return mostrarAlerta("No se pudo cargar la bebida.", "error");
    const b = res.data;
    bebidaEditandoId = id;
    document.getElementById('titulo-form-bebida').innerText = `Reconfigurando: ${id}`;
    document.getElementById('beb-nombre').value = b.nombre;
    document.getElementById('beb-precio').value = b.precio_venta;
    diccionarioRecetaVisual = b.receta || {};
    actualizarListaRecetaVisual();
    document.getElementById('btn-guardar-bebida').innerHTML = '<i class="fa-solid fa-rotate mr-2"></i> Actualizar Producto';
    document.getElementById('btn-guardar-bebida').classList.replace('bg-coffee-800', 'bg-blue-600');
    document.getElementById('btn-guardar-bebida').classList.replace('hover:bg-coffee-900', 'hover:bg-blue-700');
    document.getElementById('btn-cancelar-bebida').classList.remove('hidden');
    document.getElementById('form-bebidas-container').classList.add('ring-4', 'ring-blue-100');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelarEdicionBebida() {
    bebidaEditandoId = null;
    document.getElementById('titulo-form-bebida').innerText = "Definir Producto";
    document.getElementById('beb-nombre').value = ''; document.getElementById('beb-precio').value = '';
    diccionarioRecetaVisual = {}; actualizarListaRecetaVisual();
    document.getElementById('btn-guardar-bebida').innerHTML = '<i class="fa-solid fa-save mr-2"></i> Guardar en Catálogo';
    document.getElementById('btn-guardar-bebida').classList.replace('bg-blue-600', 'bg-coffee-800');
    document.getElementById('btn-guardar-bebida').classList.replace('hover:bg-blue-700', 'hover:bg-coffee-900');
    document.getElementById('btn-cancelar-bebida').classList.add('hidden');
    document.getElementById('form-bebidas-container').classList.remove('ring-4', 'ring-blue-100');
}

async function guardarBebida() {
    if(Object.keys(diccionarioRecetaVisual).length === 0) return mostrarAlerta("La fórmula exige al menos un insumo.", "error");
    const body = { nombre: document.getElementById('beb-nombre').value, precio_venta: document.getElementById('beb-precio').value, receta: diccionarioRecetaVisual };
    const method = bebidaEditandoId ? "PUT" : "POST";
    const endpoint = bebidaEditandoId ? `bebidas/${bebidaEditandoId}/` : "bebidas/";
    
    if(bebidaEditandoId) { const old = await fetchAPI(`bebidas/${bebidaEditandoId}/`); body.cantidad = old.data.cantidad; }
    else { body.cantidad = 0; }

    const res = await fetchAPI(endpoint, method, body);
    if(res.ok) { 
        mostrarAlerta(bebidaEditandoId ? "Catálogo actualizado." : "Referencia codificada.", 'success'); 
        cancelarEdicionBebida(); cargarBebidas();
    } else { mostrarAlerta(parsearErrorDjango(res.data), 'error'); }
}

async function cargarSelectsBebidas() {
    const res = await fetchAPI("bebidas/");
    let options = "";
    res.data.forEach(b => options += `<option value="${b.id_producto}">${b.nombre} — Stock: ${b.cantidad}</option>`);
    document.getElementById('prod-bebida').innerHTML = options;
    document.getElementById('ven-bebida').innerHTML = options;
}

async function ejecutarProduccion() {
    const body = { bebida: document.getElementById('prod-bebida').value, cantidad_preparada: parseInt(document.getElementById('prod-cant').value) };
    const res = await fetchAPI("produccion/", "POST", body);
    if(res.ok) { mostrarAlerta("Operación exitosa. Bodega actualizada.", 'success'); cargarSelectsBebidas(); document.getElementById('prod-cant').value = 1; actualizarDashboardGlobal(); } 
    else { mostrarAlerta(parsearErrorDjango(res.data), 'error'); }
}

async function ejecutarVenta() {
    const body = { bebida: document.getElementById('ven-bebida').value, cantidad_vendida: parseInt(document.getElementById('ven-cant').value) };
    const res = await fetchAPI("ventas/", "POST", body);
    if(res.ok) { mostrarAlerta("Venta liquidada.", 'success'); cargarSelectsBebidas(); cargarHistorialVentas(); document.getElementById('ven-cant').value = 1; actualizarDashboardGlobal(); } 
    else { mostrarAlerta(parsearErrorDjango(res.data), 'error'); }
}

async function cargarHistorialVentas() {
    const res = await fetchAPI("ventas/");
    const tbody = document.getElementById('tabla-ventas');
    tbody.innerHTML = "";
    let recaudoTotal = 0;
    
    const selectorMes = document.getElementById('filtro-meses');
    const mesFiltro = selectorMes ? parseInt(selectorMes.value) : new Date().getMonth();
    const añoActual = new Date().getFullYear();

    res.data.reverse().forEach(v => {
        const fecha = new Date(v.fecha_venta);
        if (fecha.getMonth() === mesFiltro && fecha.getFullYear() === añoActual) {
            const d = fecha.getDate().toString().padStart(2, '0');
            const m = (fecha.getMonth() + 1).toString().padStart(2, '0');
            const h = fecha.getHours().toString().padStart(2, '0');
            const min = fecha.getMinutes().toString().padStart(2, '0');
            const fechaFormat = `${d}/${m} - ${h}:${min}`;
            
            const totalVenta = (v.precio_unitario || 0) * v.cantidad_vendida;
            recaudoTotal += totalVenta;
            tbody.innerHTML += `
                <tr class="hover:bg-gray-50 border-b border-gray-100 transition-colors">
                    <td class="px-6 py-4 text-xs font-bold text-gray-500 tracking-wider">${fechaFormat}</td>
                    <td class="px-6 py-4 font-black text-coffee-800 text-lg">${v.nombre_bebida || 'Ref. Retirada'}</td>
                    <td class="px-6 py-4 text-center font-black text-xl text-gray-700">${v.cantidad_vendida}</td>
                    <td class="px-6 py-4 text-right text-green-700 font-black text-xl">$${totalVenta.toLocaleString('es-CO')}</td>
                </tr>`;
        }
    });
    document.getElementById('total-recaudado').innerText = recaudoTotal.toLocaleString('es-CO');
    document.getElementById('stat-ingresos').innerText = recaudoTotal.toLocaleString('es-CO');
}

async function eliminarEntidad(ruta, id) {
    const res = await fetchAPI(`${ruta}/${id}/`, "DELETE");
    if(res.ok) {
        mostrarAlerta("Información eliminada.", 'success');
        if(ruta === 'insumos') cargarInsumos();
        if(ruta === 'bebidas') cargarBebidas();
    } else { mostrarAlerta("No se permite eliminar un objeto en uso.", 'error'); }
}