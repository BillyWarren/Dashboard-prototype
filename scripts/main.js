case 'ingresos':
            const ingresosPorMes = Array(12).fill(0);
            
            if (datosGlobales.ingresos[anio]) {
                Object.entries(datosGlobales.ingresos[anio]).forEach(([mes, cantidad]) => {
                    ingresosPorMes[parseInt(mes) - 1] = cantidad;
                });
            }
            
            return ingresosPorMes;
            
        default:
            return Array(12).fill(0);
    }
}

// ===== FUNCIONES PARA EXPORTACIÓN DE DATOS =====

// Exportar datos a CSV
function exportarCSV(tipo) {
    let datos = [];
    let nombreArchivo = '';
    let encabezados = [];
    
    switch (tipo) {
        case 'ventas':
            nombreArchivo = 'ventas_export.csv';
            encabezados = ['ID', 'Fecha', 'Cliente', 'Producto', 'Cantidad', 'Precio', 'Total'];
            
            // Obtener todas las ventas de todos los años
            Object.values(datosGlobales.ventas).forEach(ventasAnio => {
                ventasAnio.forEach(venta => {
                    datos.push([
                        venta.id,
                        venta.fecha,
                        venta.cliente,
                        venta.producto,
                        venta.cantidad,
                        venta.precio,
                        venta.total
                    ]);
                });
            });
            break;
            
        case 'ordenes':
            nombreArchivo = 'ordenes_export.csv';
            encabezados = ['ID', 'Cliente', 'Producto', 'Fecha', 'Estado', 'Total'];
            
            datosGlobales.ordenes.forEach(orden => {
                datos.push([
                    orden.id,
                    orden.cliente,
                    orden.producto,
                    orden.fecha,
                    orden.estado,
                    orden.total
                ]);
            });
            break;
            
        case 'usuarios':
            nombreArchivo = 'usuarios_export.csv';
            encabezados = ['ID', 'Nombre', 'Email', 'Fecha', 'Activo'];
            
            datosGlobales.usuarios.forEach(usuario => {
                datos.push([
                    usuario.id,
                    usuario.nombre,
                    usuario.email,
                    usuario.fecha,
                    usuario.activo ? 'Sí' : 'No'
                ]);
            });
            break;
            
        default:
            mostrarNotificacion('Tipo de exportación no válido', 'error');
            return;
    }
    
    // Crear el contenido CSV
    let contenidoCSV = encabezados.join(',') + '\n';
    
    datos.forEach(fila => {
        contenidoCSV += fila.map(celda => {
            // Escapar comas y comillas
            if (typeof celda === 'string' && (celda.includes(',') || celda.includes('"'))) {
                return `"${celda.replace(/"/g, '""')}"`;
            }
            return celda;
        }).join(',') + '\n';
    });
    
    // Crear un enlace para descargar el archivo
    const enlaceDescarga = document.createElement('a');
    enlaceDescarga.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(contenidoCSV);
    enlaceDescarga.download = nombreArchivo;
    enlaceDescarga.style.display = 'none';
    document.body.appendChild(enlaceDescarga);
    enlaceDescarga.click();
    document.body.removeChild(enlaceDescarga);
    
    mostrarNotificacion(`Los datos de ${tipo} han sido exportados correctamente`, 'exito');
}

// ===== FUNCIONES PARA ANÁLISIS Y REPORTES =====

// Generar reporte de ventas
function generarReporteMensual(tipo, anio, mes) {
    const resultados = {
        total: 0,
        promedio: 0,
        maximo: 0,
        minimo: 0,
        cantidad: 0,
        tendencia: 0  // Porcentaje de crecimiento respecto al mes anterior
    };
    
    let datosMes = [];
    let datosMesAnterior = [];
    
    switch (tipo) {
        case 'ventas':
            if (datosGlobales.ventas[anio]) {
                datosMes = datosGlobales.ventas[anio].filter(v => {
                    const fechaVenta = new Date(v.fecha);
                    return fechaVenta.getMonth() === mes - 1 && fechaVenta.getFullYear().toString() === anio.toString();
                });
                
                // Mes anterior (considerando cambio de año)
                const mesAnterior = mes === 1 ? 12 : mes - 1;
                const anioMesAnterior = mes === 1 ? anio - 1 : anio;
                
                if (datosGlobales.ventas[anioMesAnterior]) {
                    datosMesAnterior = datosGlobales.ventas[anioMesAnterior].filter(v => {
                        const fechaVenta = new Date(v.fecha);
                        return fechaVenta.getMonth() === mesAnterior - 1 && fechaVenta.getFullYear().toString() === anioMesAnterior.toString();
                    });
                }
                
                if (datosMes.length > 0) {
                    resultados.total = datosMes.reduce((sum, v) => sum + v.total, 0);
                    resultados.promedio = resultados.total / datosMes.length;
                    resultados.maximo = Math.max(...datosMes.map(v => v.total));
                    resultados.minimo = Math.min(...datosMes.map(v => v.total));
                    resultados.cantidad = datosMes.length;
                }
                
                const totalMesAnterior = datosMesAnterior.reduce((sum, v) => sum + v.total, 0);
                if (totalMesAnterior > 0) {
                    resultados.tendencia = ((resultados.total - totalMesAnterior) / totalMesAnterior) * 100;
                }
            }
            break;
            
        case 'ingresos':
            if (datosGlobales.ingresos[anio] && datosGlobales.ingresos[anio][mes]) {
                resultados.total = datosGlobales.ingresos[anio][mes];
                resultados.promedio = resultados.total;
                resultados.maximo = resultados.total;
                resultados.minimo = resultados.total;
                resultados.cantidad = 1;
                
                // Mes anterior (considerando cambio de año)
                const mesAnterior = mes === 1 ? 12 : mes - 1;
                const anioMesAnterior = mes === 1 ? anio - 1 : anio;
                
                if (datosGlobales.ingresos[anioMesAnterior] && datosGlobales.ingresos[anioMesAnterior][mesAnterior]) {
                    const totalMesAnterior = datosGlobales.ingresos[anioMesAnterior][mesAnterior];
                    resultados.tendencia = ((resultados.total - totalMesAnterior) / totalMesAnterior) * 100;
                }
            }
            break;
            
        case 'visitantes':
            if (datosGlobales.visitantes[anio] && datosGlobales.visitantes[anio][mes]) {
                resultados.total = datosGlobales.visitantes[anio][mes];
                resultados.promedio = resultados.total;
                resultados.maximo = resultados.total;
                resultados.minimo = resultados.total;
                resultados.cantidad = 1;
                
                // Mes anterior (considerando cambio de año)
                const mesAnterior = mes === 1 ? 12 : mes - 1;
                const anioMesAnterior = mes === 1 ? anio - 1 : anio;
                
                if (datosGlobales.visitantes[anioMesAnterior] && datosGlobales.visitantes[anioMesAnterior][mesAnterior]) {
                    const totalMesAnterior = datosGlobales.visitantes[anioMesAnterior][mesAnterior];
                    resultados.tendencia = ((resultados.total - totalMesAnterior) / totalMesAnterior) * 100;
                }
            }
            break;
    }
    
    return resultados;
}

// Obtener datos comparativos anuales
function obtenerComparativaAnual(tipo, anio, anioComparacion) {
    const resultado = {
        actual: Array(12).fill(0),
        comparacion: Array(12).fill(0),
        diferencia: Array(12).fill(0),
        porcentajeCambio: Array(12).fill(0)
    };
    
    switch (tipo) {
        case 'ventas':
            // Año actual
            if (datosGlobales.ventas[anio]) {
                datosGlobales.ventas[anio].forEach(venta => {
                    const mes = new Date(venta.fecha).getMonth();
                    resultado.actual[mes] += venta.total;
                });
            }
            
            // Año de comparación
            if (datosGlobales.ventas[anioComparacion]) {
                datosGlobales.ventas[anioComparacion].forEach(venta => {
                    const mes = new Date(venta.fecha).getMonth();
                    resultado.comparacion[mes] += venta.total;
                });
            }
            break;
            
        case 'ingresos':
            // Año actual
            if (datosGlobales.ingresos[anio]) {
                Object.entries(datosGlobales.ingresos[anio]).forEach(([mes, cantidad]) => {
                    resultado.actual[parseInt(mes) - 1] = cantidad;
                });
            }
            
            // Año de comparación
            if (datosGlobales.ingresos[anioComparacion]) {
                Object.entries(datosGlobales.ingresos[anioComparacion]).forEach(([mes, cantidad]) => {
                    resultado.comparacion[parseInt(mes) - 1] = cantidad;
                });
            }
            break;
            
        case 'visitantes':
            // Año actual
            if (datosGlobales.visitantes[anio]) {
                Object.entries(datosGlobales.visitantes[anio]).forEach(([mes, cantidad]) => {
                    resultado.actual[parseInt(mes) - 1] = cantidad;
                });
            }
            
            // Año de comparación
            if (datosGlobales.visitantes[anioComparacion]) {
                Object.entries(datosGlobales.visitantes[anioComparacion]).forEach(([mes, cantidad]) => {
                    resultado.comparacion[parseInt(mes) - 1] = cantidad;
                });
            }
            break;
    }
    
    // Calcular diferencias y porcentajes
    for (let i = 0; i < 12; i++) {
        resultado.diferencia[i] = resultado.actual[i] - resultado.comparacion[i];
        if (resultado.comparacion[i] > 0) {
            resultado.porcentajeCambio[i] = (resultado.diferencia[i] / resultado.comparacion[i]) * 100;
        }
    }
    
    return resultado;
}

// ===== FUNCIONES PARA MANIPULACIÓN DE FORMULARIOS DINÁMICOS =====

// Crear formulario dinámico
function crearFormularioDinamico(tipo, contenedor) {
    if (!contenedor) return;
    
    // Limpiar el contenedor
    contenedor.innerHTML = '';
    
    // Crear el formulario según el tipo
    const formulario = document.createElement('form');
    formulario.id = `form-${tipo}`;
    formulario.className = 'form-dinamico';
    
    let campos = [];
    
    switch (tipo) {
        case 'ventas':
            campos = [
                { tipo: 'date', nombre: 'fecha', label: 'Fecha', requerido: true },
                { tipo: 'text', nombre: 'producto', label: 'Producto', requerido: true },
                { tipo: 'number', nombre: 'cantidad', label: 'Cantidad', requerido: true, min: 1 },
                { tipo: 'number', nombre: 'precio', label: 'Precio', requerido: true, min: 0, step: '0.01' },
                { tipo: 'text', nombre: 'cliente', label: 'Cliente', requerido: true }
            ];
            break;
            
        case 'ordenes':
            campos = [
                { tipo: 'text', nombre: 'cliente', label: 'Cliente', requerido: true },
                { tipo: 'text', nombre: 'producto', label: 'Producto', requerido: true },
                { tipo: 'date', nombre: 'fecha', label: 'Fecha', requerido: true },
                { tipo: 'select', nombre: 'estado', label: 'Estado', requerido: true, opciones: [
                    { valor: 'Pendiente', texto: 'Pendiente' },
                    { valor: 'Enviado', texto: 'Enviado' },
                    { valor: 'Completado', texto: 'Completado' },
                    { valor: 'Cancelado', texto: 'Cancelado' }
                ]},
                { tipo: 'number', nombre: 'total', label: 'Total', requerido: true, min: 0, step: '0.01' }
            ];
            break;
            
        case 'visitantes':
            campos = [
                { tipo: 'number', nombre: 'anio', label: 'Año', requerido: true, min: 2020, max: 2030, valor: new Date().getFullYear() },
                { tipo: 'select', nombre: 'mes', label: 'Mes', requerido: true, opciones: MESES.map((m, i) => ({ valor: i + 1, texto: m })) },
                { tipo: 'number', nombre: 'cantidad', label: 'Cantidad de Visitantes', requerido: true, min: 0 }
            ];
            break;
    }
    
    // Crear los campos del formulario
    campos.forEach(campo => {
        const grupo = document.createElement('div');
        grupo.className = 'form-group';
        
        const label = document.createElement('label');
        label.textContent = campo.label;
        label.htmlFor = campo.nombre;
        grupo.appendChild(label);
        
        let elemento;
        
        if (campo.tipo === 'select') {
            elemento = document.createElement('select');
            elemento.name = campo.nombre;
            elemento.id = campo.nombre;
            if (campo.requerido) elemento.required = true;
            
            // Añadir opción vacía
            const opcionVacia = document.createElement('option');
            opcionVacia.value = '';
            opcionVacia.textContent = `Seleccionar ${campo.label}`;
            elemento.appendChild(opcionVacia);
            
            // Añadir opciones
            campo.opciones.forEach(opcion => {
                const opcionElemento = document.createElement('option');
                opcionElemento.value = opcion.valor;
                opcionElemento.textContent = opcion.texto;
                elemento.appendChild(opcionElemento);
            });
        } else {
            elemento = document.createElement('input');
            elemento.type = campo.tipo;
            elemento.name = campo.nombre;
            elemento.id = campo.nombre;
            if (campo.requerido) elemento.required = true;
            if (campo.min !== undefined) elemento.min = campo.min;
            if (campo.max !== undefined) elemento.max = campo.max;
            if (campo.step !== undefined) elemento.step = campo.step;
            if (campo.valor !== undefined) elemento.value = campo.valor;
        }
        
        grupo.appendChild(elemento);
        formulario.appendChild(grupo);
    });
    
    // Añadir botón de envío
    const grupoBoton = document.createElement('div');
    grupoBoton.className = 'form-group';
    
    const boton = document.createElement('button');
    boton.type = 'submit';
    boton.className = 'btn-submit';
    boton.textContent = 'Guardar';
    
    grupoBoton.appendChild(boton);
    formulario.appendChild(grupoBoton);
    
    // Añadir el formulario al contenedor
    contenedor.appendChild(formulario);
    
    return formulario;
}

// ===== FUNCIONES PARA VISUALIZACIÓN DE DATOS AVANZADA =====

// Crear gráfico de comparativa
function crearGraficoComparativa(contenedor, tipo, anio, anioComparacion) {
    if (!contenedor || typeof Chart === 'undefined') return;
    
    // Limpiar el contenedor
    contenedor.innerHTML = '<canvas id="comparativa-chart"></canvas>';
    
    // Obtener el contexto del canvas
    const ctx = document.getElementById('comparativa-chart').getContext('2d');
    
    // Obtener datos comparativos
    const datos = obtenerComparativaAnual(tipo, anio, anioComparacion);
    
    // Crear etiqueta según el tipo
    let etiqueta = '';
    switch (tipo) {
        case 'ventas':
            etiqueta = 'Ventas';
            break;
        case 'ingresos':
            etiqueta = 'Ingresos';
            break;
        case 'visitantes':
            etiqueta = 'Visitantes';
            break;
    }
    
    // Crear gráfico
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: MESES,
            datasets: [
                {
                    label: `${etiqueta} ${anio}`,
                    data: datos.actual,
                    backgroundColor: COLORES.fondoClaro,
                    borderColor: COLORES.primario,
                    borderWidth: 2,
                    pointBackgroundColor: COLORES.primario,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    tension: 0.4,
                    fill: true
                },
                {
                    label: `${etiqueta} ${anioComparacion}`,
                    data: datos.comparacion,
                    backgroundColor: 'transparent',
                    borderColor: COLORES.secundario,
                    borderWidth: 2,
                    pointBackgroundColor: COLORES.secundario,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    tension: 0.4,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (tipo === 'ingresos' || tipo === 'ventas') {
                                label += '$' + context.parsed.y.toFixed(2);
                            } else {
                                label += context.parsed.y.toLocaleString();
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Crear informe de tendencias
function generarInformeTendencias(tipo, anio) {
    const informe = {
        crecimientoAnual: 0,
        tendenciaMensual: [],
        mesMasAlto: { mes: null, valor: 0 },
        mesMasBajo: { mes: null, valor: Number.MAX_SAFE_INTEGER },
        promedio: 0
    };
    
    const datos = cargarDatosGrafico(tipo, anio);
    
    // Calcular promedio
    const sum = datos.reduce((a, b) => a + b, 0);
    informe.promedio = datos.filter(d => d > 0).length > 0 ? sum / datos.filter(d => d > 0).length : 0;
    
    // Encontrar mes más alto y mes más bajo
    datos.forEach((valor, i) => {
        if (valor > informe.mesMasAlto.valor) {
            informe.mesMasAlto = { mes: MESES[i], valor: valor };
        }
        
        if (valor > 0 && valor < informe.mesMasBajo.valor) {
            informe.mesMasBajo = { mes: MESES[i], valor: valor };
        }
    });
    
    // Calcular tendencia mensual (porcentaje de cambio mes a mes)
    for (let i = 1; i < datos.length; i++) {
        if (datos[i - 1] > 0) {
            const cambio = ((datos[i] - datos[i - 1]) / datos[i - 1]) * 100;
            informe.tendenciaMensual.push({
                mes: MESES[i],
                cambio: cambio,
                esPositivo: cambio >= 0
            });
        } else {
            informe.tendenciaMensual.push({
                mes: MESES[i],
                cambio: datos[i] > 0 ? 100 : 0,
                esPositivo: true
            });
        }
    }
    
    // Calcular crecimiento anual (comparando primer y último mes con datos)
    const mesesConDatos = datos.map((v, i) => ({ valor: v, indice: i })).filter(m => m.valor > 0);
    if (mesesConDatos.length >= 2) {
        const primerMes = mesesConDatos[0];
        const ultimoMes = mesesConDatos[mesesConDatos.length - 1];
        
        informe.crecimientoAnual = ((ultimoMes.valor - primerMes.valor) / primerMes.valor) * 100;
    }
    
    return informe;
}

// Mostrar informe en la interfaz
function mostrarInforme(contenedor, tipo, anio) {
    if (!contenedor) return;
    
    // Generar informe
    const informe = generarInformeTendencias(tipo, anio);
    
    // Limpiar contenedor
    contenedor.innerHTML = '';
    
    // Crear el contenido del informe
    const titulo = document.createElement('h3');
    titulo.textContent = `Informe de Tendencias - ${tipo.charAt(0).toUpperCase() + tipo.slice(1)} ${anio}`;
    contenedor.appendChild(titulo);
    
    // Resumen
    const resumen = document.createElement('div');
    resumen.className = 'informe-resumen';
    
    // Crecimiento anual
    const crecimiento = document.createElement('div');
    crecimiento.className = `informe-item ${informe.crecimientoAnual >= 0 ? 'positivo' : 'negativo'}`;
    crecimiento.innerHTML = `
        <h4>Crecimiento Anual</h4>
        <p class="valor">${informe.crecimientoAnual.toFixed(1)}%</p>
    `;
    resumen.appendChild(crecimiento);
    
    // Mes más alto
    const mesMasAlto = document.createElement('div');
    mesMasAlto.className = 'informe-item';
    mesMasAlto.innerHTML = `
        <h4>Mes Más Alto</h4>
        <p class="valor">${informe.mesMasAlto.mes}</p>
        <p class="detalle">${tipo === 'ventas' || tipo === 'ingresos' ? '$' : ''}${informe.mesMasAlto.valor.toLocaleString()}</p>
    `;
    resumen.appendChild(mesMasAlto);
    
    // Mes más bajo
    const mesMasBajo = document.createElement('div');
    mesMasBajo.className = 'informe-item';
    mesMasBajo.innerHTML = `
        <h4>Mes Más Bajo</h4>
        <p class="valor">${informe.mesMasBajo.mes}</p>
        <p class="detalle">${tipo === 'ventas' || tipo === 'ingresos' ? '$' : ''}${informe.mesMasBajo.valor.toLocaleString()}</p>
    `;
    resumen.appendChild(mesMasBajo);
    
    // Promedio
    const promedio = document.createElement('div');
    promedio.className = 'informe-item';
    promedio.innerHTML = `
        <h4>Promedio Mensual</h4>
        <p class="valor">${tipo === 'ventas' || tipo === 'ingresos' ? '$' : ''}${informe.promedio.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
    `;
    resumen.appendChild(promedio);
    
    contenedor.appendChild(resumen);
    
    // Tendencia mensual
    const tendencia = document.createElement('div');
    tendencia.className = 'informe-tendencia';
    tendencia.innerHTML = '<h4>Tendencia Mensual</h4>';
    
    const listaTendencia = document.createElement('ul');
    
    informe.tendenciaMensual.forEach(item => {
        const elementoLista = document.createElement('li');
        elementoLista.className = item.esPositivo ? 'positivo' : 'negativo';
        elementoLista.innerHTML = `
            <span class="mes">${item.mes}</span>
            <span class="cambio">${item.cambio.toFixed(1)}%</span>
            <span class="indicador">${item.esPositivo ? '▲' : '▼'}</span>
        `;
        listaTendencia.appendChild(elementoLista);
    });
    
    tendencia.appendChild(listaTendencia);
    contenedor.appendChild(tendencia);
    
    // Añadir estilos CSS para el informe
    const estilos = document.createElement('style');
    estilos.textContent = `
        .informe-resumen {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }
        
        .informe-item {
            padding: 1rem;
            border-radius: 0.5rem;
            background-color: #fff;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .informe-item h4 {
            font-size: 0.875rem;
            color: var(--text-light);
            margin-bottom: 0.5rem;
        }
        
        .informe-item .valor {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 0.25rem;
        }
        
        .informe-item .detalle {
            font-size: 0.875rem;
            color: var(--text-light);
        }
        
        .informe-item.positivo .valor {
            color: var(--success-color);
        }
        
        .informe-item.negativo .valor {
            color: var(--danger-color);
        }
        
        .informe-tendencia {
            padding: 1rem;
            border-radius: 0.5rem;
            background-color: #fff;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .informe-tendencia h4 {
            font-size: 1rem;
            font-weight: 600;
            margin-bottom: 1rem;
        }
        
        .informe-tendencia ul {
            list-style: none;
            padding: 0;
        }
        
        .informe-tendencia li {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0.5rem 0;
            border-bottom: 1px solid var(--border-color);
        }
        
        .informe-tendencia li:last-child {
            border-bottom: none;
        }
        
        .informe-tendencia .mes {
            font-weight: 500;
        }
        
        .informe-tendencia .cambio {
            font-weight: 600;
        }
        
        .informe-tendencia li.positivo .cambio,
        .informe-tendencia li.positivo .indicador {
            color: var(--success-color);
        }
        
        .informe-tendencia li.negativo .cambio,
        .informe-tendencia li.negativo .indicador {
            color: var(--danger-color);
        }
    `;
    
    document.head.appendChild(estilos);
}

// ===== INICIALIZACIÓN AL CARGAR LA PÁGINA =====
// Este evento ya está registrado al principio del archivo
// ===== CONSTANTES Y VARIABLES GLOBALES =====
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const COLORES = {
    primario: '#3b82f6',
    secundario: '#64748b',
    exito: '#10b981',
    peligro: '#ef4444',
    advertencia: '#f59e0b',
    info: '#3b82f6',
    fondoClaro: 'rgba(59, 130, 246, 0.1)',
    fondoOscuro: 'rgba(59, 130, 246, 0.2)',
};

// Almacenamiento de datos global
let datosGlobales = {
    ventas: {},
    visitantes: {},
    ordenes: [],
    usuarios: [],
    ingresos: {}
};

// ===== FUNCIONES DE INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    inicializarSidebar();
    inicializarFormularios();
    cargarDatosIniciales();
    inicializarNotificaciones();
    inicializarGraficos();
});

// Inicializar la barra lateral
function inicializarSidebar() {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
        });
    }
    
    // Manejo de ítems del menú
    const menuItems = document.querySelectorAll('.sidebar-item a');
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Si no estamos en la página correcta, no prevenir el comportamiento por defecto
            if (this.getAttribute('href') !== window.location.pathname.split('/').pop()) {
                return;
            }
            
            e.preventDefault();
            
            // Remover clase activa de todos los ítems
            menuItems.forEach(i => i.parentElement.classList.remove('active'));
            
            // Añadir clase activa al ítem clickeado
            this.parentElement.classList.add('active');
        });
    });
}

// Inicializar formularios para entrada de datos
function inicializarFormularios() {
    // Formulario para añadir venta (en la página de ventas)
    const formVentas = document.getElementById('form-ventas');
    if (formVentas) {
        formVentas.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const nuevaVenta = {
                id: generarId('VENTA'),
                fecha: formData.get('fecha'),
                producto: formData.get('producto'),
                cantidad: parseInt(formData.get('cantidad')),
                precio: parseFloat(formData.get('precio')),
                total: parseFloat(formData.get('cantidad')) * parseFloat(formData.get('precio')),
                cliente: formData.get('cliente')
            };
            
            // Añadir la venta a los datos globales
            if (!datosGlobales.ventas[nuevaVenta.fecha.split('-')[0]]) {
                datosGlobales.ventas[nuevaVenta.fecha.split('-')[0]] = [];
            }
            datosGlobales.ventas[nuevaVenta.fecha.split('-')[0]].push(nuevaVenta);
            
            // Actualizar la tabla y los gráficos
            actualizarTablaVentas();
            actualizarGraficos();
            actualizarTarjetasResumen();
            
            // Resetear el formulario
            this.reset();
            
            // Mostrar notificación
            mostrarNotificacion('Venta añadida correctamente', 'exito');
        });
    }
    
    // Formulario para añadir orden (en la página de órdenes)
    const formOrdenes = document.getElementById('form-ordenes');
    if (formOrdenes) {
        formOrdenes.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const nuevaOrden = {
                id: generarId('ORD'),
                cliente: formData.get('cliente'),
                producto: formData.get('producto'),
                fecha: formData.get('fecha'),
                estado: formData.get('estado'),
                total: parseFloat(formData.get('total'))
            };
            
            // Añadir la orden a los datos globales
            datosGlobales.ordenes.push(nuevaOrden);
            
            // Actualizar la tabla y los gráficos
            actualizarTablaOrdenes();
            actualizarGraficos();
            actualizarTarjetasResumen();
            
            // Resetear el formulario
            this.reset();
            
            // Mostrar notificación
            mostrarNotificacion('Orden añadida correctamente', 'exito');
        });
    }
    
    // Formulario para añadir visitante (en la página de estadísticas)
    const formVisitantes = document.getElementById('form-visitantes');
    if (formVisitantes) {
        formVisitantes.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const mes = formData.get('mes');
            const cantidad = parseInt(formData.get('cantidad'));
            const anio = formData.get('anio');
            
            // Añadir o actualizar los visitantes en los datos globales
            if (!datosGlobales.visitantes[anio]) {
                datosGlobales.visitantes[anio] = {};
            }
            datosGlobales.visitantes[anio][mes] = cantidad;
            
            // Actualizar los gráficos
            actualizarGraficos();
            actualizarTarjetasResumen();
            
            // Resetear el formulario
            this.reset();
            
            // Mostrar notificación
            mostrarNotificacion('Datos de visitantes actualizados correctamente', 'exito');
        });
    }
    
    // Formulario para ingresar datos de facturación
    const formFacturacion = document.getElementById('form-facturacion');
    if (formFacturacion) {
        formFacturacion.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const mes = parseInt(formData.get('mes'));
            const cantidad = parseFloat(formData.get('cantidad'));
            const anio = formData.get('anio');
            
            // Añadir o actualizar los ingresos en los datos globales
            if (!datosGlobales.ingresos[anio]) {
                datosGlobales.ingresos[anio] = {};
            }
            datosGlobales.ingresos[anio][mes] = cantidad;
            
            // Actualizar los gráficos y tarjetas
            actualizarGraficoIngresos();
            actualizarTarjetasResumen();
            
            // Resetear el formulario
            this.reset();
            
            // Mostrar notificación
            mostrarNotificacion('Datos de facturación actualizados correctamente', 'exito');
        });
    }
}

// Cargar datos iniciales de ejemplo
function cargarDatosIniciales() {
    // Datos de ventas por mes para el año actual
    const anioActual = new Date().getFullYear();
    datosGlobales.ventas[anioActual] = [
        { id: 'VENTA-001', fecha: `${anioActual}-01-15`, producto: 'Producto A', cantidad: 5, precio: 120, total: 600, cliente: 'Cliente 1' },
        { id: 'VENTA-002', fecha: `${anioActual}-02-20`, producto: 'Producto B', cantidad: 3, precio: 85, total: 255, cliente: 'Cliente 2' },
        { id: 'VENTA-003', fecha: `${anioActual}-03-10`, producto: 'Producto C', cantidad: 8, precio: 45, total: 360, cliente: 'Cliente 3' },
        { id: 'VENTA-004', fecha: `${anioActual}-04-05`, producto: 'Producto A', cantidad: 2, precio: 120, total: 240, cliente: 'Cliente 4' },
        { id: 'VENTA-005', fecha: `${anioActual}-05-12`, producto: 'Producto D', cantidad: 1, precio: 350, total: 350, cliente: 'Cliente 5' },
    ];
    
    // Datos de visitantes por mes para el año actual
    datosGlobales.visitantes[anioActual] = {
        1: 1200,
        2: 1500,
        3: 1800,
        4: 2200,
        5: 2500,
        6: 2300,
        7: 2100,
        8: 2400,
        9: 2700,
        10: 3000,
        11: 3200,
        12: 3500
    };
    
    // Datos de órdenes
    datosGlobales.ordenes = [
        { id: 'ORD-001', cliente: 'Juan Pérez', producto: 'Producto A', fecha: '2025-04-17', estado: 'Completado', total: 120.00 },
        { id: 'ORD-002', cliente: 'María López', producto: 'Producto B', fecha: '2025-04-16', estado: 'Pendiente', total: 85.50 },
        { id: 'ORD-003', cliente: 'Carlos Gómez', producto: 'Producto C', fecha: '2025-04-15', estado: 'Enviado', total: 210.75 }
    ];
    
    // Datos de usuarios
    datosGlobales.usuarios = [
        { id: 1, nombre: 'Usuario 1', email: 'usuario1@example.com', fecha: '2025-01-10', activo: true },
        { id: 2, nombre: 'Usuario 2', email: 'usuario2@example.com', fecha: '2025-02-15', activo: true },
        { id: 3, nombre: 'Usuario 3', email: 'usuario3@example.com', fecha: '2025-03-20', activo: false }
    ];
    
    // Datos de ingresos
    datosGlobales.ingresos = {
        [anioActual]: {
            1: 8500,
            2: 9200,
            3: 10500,
            4: 11000,
            5: 9800,
            6: 10200,
            7: 11500,
            8: 12200,
            9: 13500,
            10: 14000,
            11: 15500,
            12: 16000
        }
    };
    
    // Actualizar la interfaz con estos datos
    actualizarTablaOrdenes();
    actualizarGraficos();
    actualizarTarjetasResumen();
}

// Inicializa todos los gráficos del dashboard
function inicializarGraficos() {
    // Solo proceder si Chart.js está disponible
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js no está disponible. Los gráficos no se inicializarán.');
        return;
    }
    
    // Configurar los colores y estilos globales para Chart.js
    Chart.defaults.color = '#64748b';
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.font.size = 12;
    
    // Inicializar gráficos específicos
    actualizarGraficoVentas();
    actualizarGraficoVisitantes();
    actualizarGraficoIngresos();
    actualizarGraficoComparativo();
}

// ===== FUNCIONES DE ACTUALIZACIÓN DE LA INTERFAZ =====

// Actualizar la tabla de órdenes recientes
function actualizarTablaOrdenes() {
    const tablaBody = document.querySelector('.data-table tbody');
    if (!tablaBody) return;
    
    // Limpiar la tabla
    tablaBody.innerHTML = '';
    
    // Mostrar las órdenes más recientes primero (máximo 5)
    const ordenesRecientes = [...datosGlobales.ordenes]
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        .slice(0, 5);
    
    ordenesRecientes.forEach(orden => {
        const fila = document.createElement('tr');
        
        // Determinar el color del estado
        let estadoClase = '';
        switch (orden.estado.toLowerCase()) {
            case 'completado':
                estadoClase = 'success';
                break;
            case 'pendiente':
                estadoClase = 'warning';
                break;
            case 'enviado':
                estadoClase = 'info';
                break;
            case 'cancelado':
                estadoClase = 'danger';
                break;
        }
        
        fila.innerHTML = `
            <td>${orden.id}</td>
            <td>${orden.cliente}</td>
            <td>${orden.producto}</td>
            <td>${formatearFecha(orden.fecha)}</td>
            <td><span class="badge ${estadoClase}">${orden.estado}</span></td>
            <td>$${orden.total.toFixed(2)}</td>
            <td>
                <button class="btn-view" onclick="verOrden('${orden.id}')">Ver</button>
                <button class="btn-edit" onclick="editarOrden('${orden.id}')">Editar</button>
            </td>
        `;
        
        tablaBody.appendChild(fila);
    });
}

// Actualizar la tabla de ventas
function actualizarTablaVentas() {
    const tablaBody = document.querySelector('#tabla-ventas tbody');
    if (!tablaBody) return;
    
    // Limpiar la tabla
    tablaBody.innerHTML = '';
    
    // Obtener el año actual
    const anioActual = new Date().getFullYear();
    
    // Mostrar las ventas más recientes primero (máximo 10)
    if (datosGlobales.ventas[anioActual]) {
        const ventasRecientes = [...datosGlobales.ventas[anioActual]]
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
            .slice(0, 10);
        
        ventasRecientes.forEach(venta => {
            const fila = document.createElement('tr');
            
            fila.innerHTML = `
                <td>${venta.id}</td>
                <td>${venta.cliente}</td>
                <td>${venta.producto}</td>
                <td>${formatearFecha(venta.fecha)}</td>
                <td>${venta.cantidad}</td>
                <td>$${venta.precio.toFixed(2)}</td>
                <td>$${venta.total.toFixed(2)}</td>
                <td>
                    <button class="btn-view" onclick="verVenta('${venta.id}')">Ver</button>
                    <button class="btn-edit" onclick="editarVenta('${venta.id}')">Editar</button>
                </td>
            `;
            
            tablaBody.appendChild(fila);
        });
    }
}

// Actualizar todos los gráficos
function actualizarGraficos() {
    actualizarGraficoVentas();
    actualizarGraficoVisitantes();
    actualizarGraficoIngresos();
    actualizarGraficoComparativo();
}

// Actualizar el gráfico de ventas
function actualizarGraficoVentas() {
    const chartContainer = document.querySelector('.chart-body');
    if (!chartContainer || typeof Chart === 'undefined') return;
    
    // Limpiar el contenedor
    chartContainer.innerHTML = '<canvas id="ventas-chart"></canvas>';
    
    // Obtener el contexto del canvas
    const ctx = document.getElementById('ventas-chart').getContext('2d');
    
    // Obtener el año actual
    const anioActual = new Date().getFullYear();
    
    // Calcular ventas por mes
    const ventasPorMes = Array(12).fill(0);
    
    if (datosGlobales.ventas[anioActual]) {
        datosGlobales.ventas[anioActual].forEach(venta => {
            const mes = new Date(venta.fecha).getMonth();
            ventasPorMes[mes] += venta.total;
        });
    }
    
    // Crear gráfico
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: MESES,
            datasets: [{
                label: 'Ventas',
                data: ventasPorMes,
                backgroundColor: COLORES.fondoClaro,
                borderColor: COLORES.primario,
                borderWidth: 2,
                pointBackgroundColor: COLORES.primario,
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += '$' + context.parsed.y.toFixed(2);
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Actualizar el gráfico de visitantes
function actualizarGraficoVisitantes() {
    const chartContainer = document.querySelectorAll('.chart-body')[1];
    if (!chartContainer || typeof Chart === 'undefined') return;
    
    // Limpiar el contenedor
    chartContainer.innerHTML = '<canvas id="visitantes-chart"></canvas>';
    
    // Obtener el contexto del canvas
    const ctx = document.getElementById('visitantes-chart').getContext('2d');
    
    // Obtener el año actual
    const anioActual = new Date().getFullYear();
    
    // Obtener visitantes por mes
    const visitantesPorMes = Array(12).fill(0);
    
    if (datosGlobales.visitantes[anioActual]) {
        Object.entries(datosGlobales.visitantes[anioActual]).forEach(([mes, cantidad]) => {
            visitantesPorMes[parseInt(mes) - 1] = cantidad;
        });
    }
    
    // Crear gráfico
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: MESES,
            datasets: [{
                label: 'Visitantes',
                data: visitantesPorMes,
                backgroundColor: COLORES.fondoClaro,
                borderColor: COLORES.secundario,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Actualizar el gráfico de ingresos
function actualizarGraficoIngresos() {
    const chartContainer = document.querySelector('#ingresos-chart-container');
    if (!chartContainer || typeof Chart === 'undefined') return;
    
    // Limpiar el contenedor
    chartContainer.innerHTML = '<canvas id="ingresos-chart"></canvas>';
    
    // Obtener el contexto del canvas
    const ctx = document.getElementById('ingresos-chart').getContext('2d');
    
    // Obtener el año actual
    const anioActual = new Date().getFullYear();
    const anioAnterior = anioActual - 1;
    
    // Obtener ingresos por mes para año actual y anterior
    const ingresosPorMesActual = Array(12).fill(0);
    const ingresosPorMesAnterior = Array(12).fill(0);
    
    if (datosGlobales.ingresos[anioActual]) {
        Object.entries(datosGlobales.ingresos[anioActual]).forEach(([mes, cantidad]) => {
            ingresosPorMesActual[parseInt(mes) - 1] = cantidad;
        });
    }
    
    if (datosGlobales.ingresos[anioAnterior]) {
        Object.entries(datosGlobales.ingresos[anioAnterior]).forEach(([mes, cantidad]) => {
            ingresosPorMesAnterior[parseInt(mes) - 1] = cantidad;
        });
    }
    
    // Calcular diferencia porcentual para cada mes
    const diferenciasPorcentuales = ingresosPorMesActual.map((actual, index) => {
        const anterior = ingresosPorMesAnterior[index];
        if (anterior === 0) return 0;
        return ((actual - anterior) / anterior) * 100;
    });
    
    // Crear gráfico
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: MESES,
            datasets: [
                {
                    label: `Ingresos ${anioActual}`,
                    data: ingresosPorMesActual,
                    backgroundColor: 'rgba(16, 185, 129, 0.1)', // Color éxito
                    borderColor: COLORES.exito,
                    borderWidth: 2,
                    pointBackgroundColor: COLORES.exito,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    tension: 0.4,
                    fill: true
                },
                {
                    label: `Ingresos ${anioAnterior}`,
                    data: ingresosPorMesAnterior,
                    backgroundColor: 'rgba(100, 116, 139, 0.1)', // Color secundario
                    borderColor: COLORES.secundario,
                    borderWidth: 2,
                    pointBackgroundColor: COLORES.secundario,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += '$' + context.parsed.y.toFixed(2);
                            
                            // Añadir diferencia porcentual en el tooltip del año actual
                            if (context.datasetIndex === 0) {
                                const difPorcentual = diferenciasPorcentuales[context.dataIndex];
                                const signo = difPorcentual >= 0 ? '+' : '';
                                label += ` (${signo}${difPorcentual.toFixed(1)}%)`;
                            }
                            
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
    
    // Mostrar indicadores de ganancia/pérdida para cada mes
    const indicadoresContainer = document.querySelector('#indicadores-ingresos');
    if (indicadoresContainer) {
        indicadoresContainer.innerHTML = '';
        
        diferenciasPorcentuales.forEach((difPorcentual, index) => {
            if (ingresosPorMesActual[index] === 0) return; // Omitir meses sin datos
            
            const indicador = document.createElement('div');
            indicador.className = 'indicador';
            
            const esGanancia = difPorcentual >= 0;
            const colorClase = esGanancia ? 'ganancia' : 'perdida';
            const signo = esGanancia ? '+' : '';
            
            indicador.innerHTML = `
                <span class="mes">${MESES[index]}</span>
                <span class="porcentaje ${colorClase}">${signo}${difPorcentual.toFixed(1)}%</span>
                <span class="valor">$${ingresosPorMesActual[index].toLocaleString()}</span>
            `;
            
            indicadoresContainer.appendChild(indicador);
        });
    }
}

// Actualizar el gráfico comparativo (anual vs mensual)
function actualizarGraficoComparativo() {
    const chartContainer = document.querySelector('#comparativo-chart-container');
    if (!chartContainer || typeof Chart === 'undefined') return;
    
    // Limpiar el contenedor
    chartContainer.innerHTML = '<canvas id="comparativo-chart"></canvas>';
    
    // Obtener el contexto del canvas
    const ctx = document.getElementById('comparativo-chart').getContext('2d');
    
    // Obtener el año actual
    const anioActual = new Date().getFullYear();
    
    // Calcular totales anuales
    const ventasAnual = calcularTotalAnual(datosGlobales.ventas[anioActual]);
    const ingresosAnual = calcularTotalAnualIngresos(datosGlobales.ingresos[anioActual]);
    const ordenesAnual = datosGlobales.ordenes.length;
    const visitantesAnual = calcularTotalAnualVisitantes(datosGlobales.visitantes[anioActual]);
    
    // Calcular datos del mes actual
    const mesActual = new Date().getMonth();
    const ventasMes = calcularTotalMes(datosGlobales.ventas[anioActual], mesActual);
    const ingresosMes = datosGlobales.ingresos[anioActual] ? (datosGlobales.ingresos[anioActual][mesActual + 1] || 0) : 0;
    const ordenesMes = calcularOrdenesMes(mesActual);
    const visitantesMes = datosGlobales.visitantes[anioActual] ? (datosGlobales.visitantes[anioActual][mesActual + 1] || 0) : 0;
    
    // Crear gráfico
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Ventas', 'Ingresos', 'Órdenes', 'Visitantes'],
            datasets: [
                {
                    label: 'Anual',
                    data: [
                        normalizarDato(ventasAnual, 0, ventasAnual),
                        normalizarDato(ingresosAnual, 0, ingresosAnual),
                        normalizarDato(ordenesAnual, 0, ordenesAnual),
                        normalizarDato(visitantesAnual, 0, visitantesAnual)
                    ],
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderColor: COLORES.primario,
                    borderWidth: 2,
                    pointBackgroundColor: COLORES.primario
                },
                {
                    label: 'Mensual',
                    data: [
                        normalizarDato(ventasMes, 0, ventasAnual),
                        normalizarDato(ingresosMes, 0, ingresosAnual),
                        normalizarDato(ordenesMes, 0, ordenesAnual),
                        normalizarDato(visitantesMes, 0, visitantesAnual)
                    ],
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    borderColor: COLORES.exito,
                    borderWidth: 2,
                    pointBackgroundColor: COLORES.exito
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    beginAtZero: true,
                    ticks: {
                        display: false
                    }
                }
            }
        }
    });
}

// Actualizar las tarjetas de resumen
function actualizarTarjetasResumen() {
    // Total de usuarios
    const totalUsuarios = datosGlobales.usuarios.length;
    const usuariosActivos = datosGlobales.usuarios.filter(u => u.activo).length;
    const porcentajeUsuarios = totalUsuarios > 0 ? ((usuariosActivos / totalUsuarios) * 100).toFixed(1) : 0;
    
    const tarjetaUsuarios = document.querySelector('.cards-row .card:nth-child(1) .value');
    const trendUsuarios = document.querySelector('.cards-row .card:nth-child(1) .trend');
    
    if (tarjetaUsuarios) tarjetaUsuarios.textContent = totalUsuarios.toLocaleString();
    if (trendUsuarios) {
        trendUsuarios.textContent = `+${porcentajeUsuarios}%`;
        trendUsuarios.classList.toggle('negative', porcentajeUsuarios < 0);
    }
    
    case 'ingresos':
            const ingresosPorMes = Array(12).fill(0);
            
            if (datosGlobales.ingresos[anio]) {
                Object.entries(datosGlobales.ingresos[anio]).forEach(([mes, cantidad]) => {
                    ingresosPorMes[parseInt(mes) - 1] = cantidad;
                });
            }
            
            return ingresosPorMes;
            
        default:
            return Array(12).fill(0);
    }
}

// ===== FUNCIONES PARA COMPARAR DATOS Y MOSTRAR TENDENCIAS =====

// Calcular la tendencia entre dos valores
function calcularTendencia(actual, anterior) {
    if (anterior === 0) return 100; // Si el valor anterior era 0, consideramos un crecimiento del 100%
    return ((actual - anterior) / anterior) * 100;
}

// Comparar datos mensuales
function compararDatosMensuales(tipo, anio, mes) {
    const mesActual = mes || new Date().getMonth() + 1;
    const mesAnterior = mesActual === 1 ? 12 : mesActual - 1;
    const anioAnterior = mesActual === 1 ? anio - 1 : anio;
    
    let valorActual = 0;
    let valorAnterior = 0;
    
    switch (tipo) {
        case 'ventas':
            // Calcular total de ventas para el mes actual
            if (datosGlobales.ventas[anio]) {
                datosGlobales.ventas[anio].forEach(venta => {
                    const mesVenta = new Date(venta.fecha).getMonth() + 1;
                    if (mesVenta === mesActual) {
                        valorActual += venta.total;
                    }
                });
            }
            
            // Calcular total de ventas para el mes anterior
            if (mesActual === 1) {
                if (datosGlobales.ventas[anioAnterior]) {
                    datosGlobales.ventas[anioAnterior].forEach(venta => {
                        const mesVenta = new Date(venta.fecha).getMonth() + 1;
                        if (mesVenta === mesAnterior) {
                            valorAnterior += venta.total;
                        }
                    });
                }
            } else {
                if (datosGlobales.ventas[anio]) {
                    datosGlobales.ventas[anio].forEach(venta => {
                        const mesVenta = new Date(venta.fecha).getMonth() + 1;
                        if (mesVenta === mesAnterior) {
                            valorAnterior += venta.total;
                        }
                    });
                }
            }
            break;
            
        case 'visitantes':
            valorActual = datosGlobales.visitantes[anio] && datosGlobales.visitantes[anio][mesActual] || 0;
            
            if (mesActual === 1) {
                valorAnterior = datosGlobales.visitantes[anioAnterior] && datosGlobales.visitantes[anioAnterior][mesAnterior] || 0;
            } else {
                valorAnterior = datosGlobales.visitantes[anio] && datosGlobales.visitantes[anio][mesAnterior] || 0;
            }
            break;
            
        case 'ingresos':
            valorActual = datosGlobales.ingresos[anio] && datosGlobales.ingresos[anio][mesActual] || 0;
            
            if (mesActual === 1) {
                valorAnterior = datosGlobales.ingresos[anioAnterior] && datosGlobales.ingresos[anioAnterior][mesAnterior] || 0;
            } else {
                valorAnterior = datosGlobales.ingresos[anio] && datosGlobales.ingresos[anio][mesAnterior] || 0;
            }
            break;
    }
    
    const tendencia = calcularTendencia(valorActual, valorAnterior);
    
    return {
        actual: valorActual,
        anterior: valorAnterior,
        tendencia: tendencia,
        esCrecimiento: tendencia >= 0
    };
}

// Comparar datos anuales
function compararDatosAnuales(tipo, anio) {
    const anioAnterior = anio - 1;
    
    let valorActual = 0;
    let valorAnterior = 0;
    
    switch (tipo) {
        case 'ventas':
            // Calcular total de ventas para el año actual
            if (datosGlobales.ventas[anio]) {
                datosGlobales.ventas[anio].forEach(venta => {
                    valorActual += venta.total;
                });
            }
            
            // Calcular total de ventas para el año anterior
            if (datosGlobales.ventas[anioAnterior]) {
                datosGlobales.ventas[anioAnterior].forEach(venta => {
                    valorAnterior += venta.total;
                });
            }
            break;
            
        case 'visitantes':
            if (datosGlobales.visitantes[anio]) {
                Object.values(datosGlobales.visitantes[anio]).forEach(cantidad => {
                    valorActual += cantidad;
                });
            }
            
            if (datosGlobales.visitantes[anioAnterior]) {
                Object.values(datosGlobales.visitantes[anioAnterior]).forEach(cantidad => {
                    valorAnterior += cantidad;
                });
            }
            break;
            
        case 'ingresos':
            if (datosGlobales.ingresos[anio]) {
                Object.values(datosGlobales.ingresos[anio]).forEach(cantidad => {
                    valorActual += cantidad;
                });
            }
            
            if (datosGlobales.ingresos[anioAnterior]) {
                Object.values(datosGlobales.ingresos[anioAnterior]).forEach(cantidad => {
                    valorAnterior += cantidad;
                });
            }
            break;
    }
    
    const tendencia = calcularTendencia(valorActual, valorAnterior);
    
    return {
        actual: valorActual,
        anterior: valorAnterior,
        tendencia: tendencia,
        esCrecimiento: tendencia >= 0
    };
}

// ===== FUNCIONES PARA GRÁFICOS AVANZADOS =====

// Crear gráfico de comparación de ingresos anuales
function crearGraficoComparacionIngresos(contenedorId, anioActual, anioAnterior) {
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor || typeof Chart === 'undefined') return;
    
    // Limpiar el contenedor
    contenedor.innerHTML = '<canvas id="comparacion-ingresos-chart"></canvas>';
    
    // Obtener el contexto del canvas
    const ctx = document.getElementById('comparacion-ingresos-chart').getContext('2d');
    
    // Obtener datos de ingresos
    const ingresosActual = cargarDatosGrafico('ingresos', anioActual);
    const ingresosAnterior = cargarDatosGrafico('ingresos', anioAnterior);
    
    // Crear gráfico
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: MESES,
            datasets: [
                {
                    label: `Ingresos ${anioActual}`,
                    data: ingresosActual,
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderColor: COLORES.primario,
                    borderWidth: 2,
                    pointBackgroundColor: COLORES.primario,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    tension: 0.4,
                    fill: true
                },
                {
                    label: `Ingresos ${anioAnterior}`,
                    data: ingresosAnterior,
                    backgroundColor: 'rgba(100, 116, 139, 0.1)',
                    borderColor: COLORES.secundario,
                    borderWidth: 2,
                    pointBackgroundColor: COLORES.secundario,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += '$' + context.parsed.y.toFixed(2);
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Crear gráfico de distribución de ventas por producto
function crearGraficoDistribucionVentas(contenedorId, anio) {
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor || typeof Chart === 'undefined') return;
    
    // Limpiar el contenedor
    contenedor.innerHTML = '<canvas id="distribucion-ventas-chart"></canvas>';
    
    // Obtener el contexto del canvas
    const ctx = document.getElementById('distribucion-ventas-chart').getContext('2d');
    
    // Calcular las ventas por producto
    const ventasPorProducto = {};
    
    if (datosGlobales.ventas[anio]) {
        datosGlobales.ventas[anio].forEach(venta => {
            if (!ventasPorProducto[venta.producto]) {
                ventasPorProducto[venta.producto] = 0;
            }
            ventasPorProducto[venta.producto] += venta.total;
        });
    }
    
    // Convertir a arrays para el gráfico
    const productos = Object.keys(ventasPorProducto);
    const valores = Object.values(ventasPorProducto);
    
    // Generar colores para cada producto
    const colores = productos.map((_, index) => {
        const r = 59 + (index * 40) % 200;
        const g = 130 + (index * 55) % 100;
        const b = 246 - (index * 30) % 150;
        return `rgba(${r}, ${g}, ${b}, 0.8)`;
    });
    
    // Crear gráfico
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: productos,
            datasets: [{
                data: valores,
                backgroundColor: colores,
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 15,
                        padding: 15
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: $${value.toLocaleString()} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Exportar datos a CSV
function exportarDatosCSV(tipo) {
    let datos = [];
    let nombreArchivo = '';
    let encabezados = [];
    
    switch (tipo) {
        case 'ventas':
            nombreArchivo = 'ventas_export.csv';
            encabezados = ['ID', 'Fecha', 'Cliente', 'Producto', 'Cantidad', 'Precio', 'Total'];
            
            // Recopilar todas las ventas de todos los años
            Object.values(datosGlobales.ventas).forEach(ventasAnio => {
                ventasAnio.forEach(venta => {
                    datos.push([
                        venta.id,
                        venta.fecha,
                        venta.cliente,
                        venta.producto,
                        venta.cantidad,
                        venta.precio.toFixed(2),
                        venta.total.toFixed(2)
                    ]);
                });
            });
            break;
            
        case 'ordenes':
            nombreArchivo = 'ordenes_export.csv';
            encabezados = ['ID', 'Cliente', 'Producto', 'Fecha', 'Estado', 'Total'];
            
            datosGlobales.ordenes.forEach(orden => {
                datos.push([
                    orden.id,
                    orden.cliente,
                    orden.producto,
                    orden.fecha,
                    orden.estado,
                    orden.total.toFixed(2)
                ]);
            });
            break;
            
        case 'usuarios':
            nombreArchivo = 'usuarios_export.csv';
            encabezados = ['ID', 'Nombre', 'Email', 'Fecha de Registro', 'Activo'];
            
            datosGlobales.usuarios.forEach(usuario => {
                datos.push([
                    usuario.id,
                    usuario.nombre,
                    usuario.email,
                    usuario.fecha,
                    usuario.activo ? 'Sí' : 'No'
                ]);
            });
            break;
            
        default:
            mostrarNotificacion('Tipo de exportación no válido', 'error');
            return;
    }
    
    // Convertir a formato CSV
    let contenidoCSV = encabezados.join(',') + '\n';
    
    datos.forEach(fila => {
        contenidoCSV += fila.join(',') + '\n';
    });
    
    // Crear el archivo y descargarlo
    const blob = new Blob([contenidoCSV], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', nombreArchivo);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    mostrarNotificacion(`Datos exportados a ${nombreArchivo}`, 'exito');
}

// Función para importar datos desde CSV
function importarDatosCSV(tipo, contenido) {
    try {
        // Separar el contenido en filas
        const filas = contenido.split('\n').filter(fila => fila.trim() !== '');
        
        // La primera fila son los encabezados
        const encabezados = filas[0].split(',');
        
        // Procesar los datos según el tipo
        switch (tipo) {
            case 'ventas':
                const ventasImportadas = [];
                
                for (let i = 1; i < filas.length; i++) {
                    const valores = filas[i].split(',');
                    
                    if (valores.length !== encabezados.length) continue;
                    
                    const venta = {
                        id: valores[0],
                        fecha: valores[1],
                        cliente: valores[2],
                        producto: valores[3],
                        cantidad: parseInt(valores[4]),
                        precio: parseFloat(valores[5]),
                        total: parseFloat(valores[6])
                    };
                    
                    ventasImportadas.push(venta);
                }
                
                // Organizar las ventas por año
                ventasImportadas.forEach(venta => {
                    const anio = venta.fecha.split('-')[0];
                    
                    if (!datosGlobales.ventas[anio]) {
                        datosGlobales.ventas[anio] = [];
                    }
                    
                    // Evitar duplicados
                    const ventaExistente = datosGlobales.ventas[anio].findIndex(v => v.id === venta.id);
                    if (ventaExistente !== -1) {
                        datosGlobales.ventas[anio][ventaExistente] = venta;
                    } else {
                        datosGlobales.ventas[anio].push(venta);
                    }
                });
                
                actualizarTablaVentas();
                mostrarNotificacion(`${ventasImportadas.length} ventas importadas correctamente`, 'exito');
                break;
                
            case 'ordenes':
                const ordenesImportadas = [];
                
                for (let i = 1; i < filas.length; i++) {
                    const valores = filas[i].split(',');
                    
                    if (valores.length !== encabezados.length) continue;
                    
                    const orden = {
                        id: valores[0],
                        cliente: valores[1],
                        producto: valores[2],
                        fecha: valores[3],
                        estado: valores[4],
                        total: parseFloat(valores[5])
                    };
                    
                    ordenesImportadas.push(orden);
                }
                
                // Actualizar órdenes
                ordenesImportadas.forEach(orden => {
                    // Evitar duplicados
                    const ordenExistente = datosGlobales.ordenes.findIndex(o => o.id === orden.id);
                    if (ordenExistente !== -1) {
                        datosGlobales.ordenes[ordenExistente] = orden;
                    } else {
                        datosGlobales.ordenes.push(orden);
                    }
                });
                
                actualizarTablaOrdenes();
                mostrarNotificacion(`${ordenesImportadas.length} órdenes importadas correctamente`, 'exito');
                break;
                
            case 'usuarios':
                const usuariosImportados = [];
                
                for (let i = 1; i < filas.length; i++) {
                    const valores = filas[i].split(',');
                    
                    if (valores.length !== encabezados.length) continue;
                    
                    const usuario = {
                        id: parseInt(valores[0]),
                        nombre: valores[1],
                        email: valores[2],
                        fecha: valores[3],
                        activo: valores[4].toLowerCase() === 'sí' || valores[4].toLowerCase() === 'si' || valores[4] === 'true'
                    };
                    
                    usuariosImportados.push(usuario);
                }
                
                // Actualizar usuarios
                usuariosImportados.forEach(usuario => {
                    // Evitar duplicados
                    const usuarioExistente = datosGlobales.usuarios.findIndex(u => u.id === usuario.id);
                    if (usuarioExistente !== -1) {
                        datosGlobales.usuarios[usuarioExistente] = usuario;
                    } else {
                        datosGlobales.usuarios.push(usuario);
                    }
                });
                
                mostrarNotificacion(`${usuariosImportados.length} usuarios importados correctamente`, 'exito');
                break;
                
            default:
                mostrarNotificacion('Tipo de importación no válido', 'error');
                return;
        }
        
        // Actualizar gráficos y tarjetas resumen
        actualizarGraficos();
        actualizarTarjetasResumen();
        
    } catch (error) {
        console.error('Error al importar datos:', error);
        mostrarNotificacion('Error al importar los datos', 'error');
    }
}

// ===== EVENTOS PARA INPUTS Y FORMULARIOS ADICIONALES =====

// Evento para el archivo de importación
document.addEventListener('DOMContentLoaded', function() {
    const importarArchivo = document.getElementById('importar-archivo');
    if (importarArchivo) {
        importarArchivo.addEventListener('change', function(e) {
            const archivo = e.target.files[0];
            if (!archivo) return;
            
            const tipo = document.getElementById('importar-tipo').value;
            const reader = new FileReader();
            
            reader.onload = function(event) {
                importarDatosCSV(tipo, event.target.result);
            };
            
            reader.readAsText(archivo);
        });
    }
    
    // Eventos para filtros de fecha
    const filtroFechaInicio = document.getElementById('filtro-fecha-inicio');
    const filtroFechaFin = document.getElementById('filtro-fecha-fin');
    
    if (filtroFechaInicio && filtroFechaFin) {
        filtroFechaInicio.addEventListener('change', aplicarFiltrosFecha);
        filtroFechaFin.addEventListener('change', aplicarFiltrosFecha);
    }
    
    // Evento para botón de exportar
    const btnExportar = document.getElementById('btn-exportar');
    if (btnExportar) {
        btnExportar.addEventListener('click', function() {
            const tipo = document.getElementById('exportar-tipo').value;
            exportarDatosCSV(tipo);
        });
    }
});

// Aplicar filtros de fecha a las tablas
function aplicarFiltrosFecha() {
    const fechaInicio = document.getElementById('filtro-fecha-inicio').value;
    const fechaFin = document.getElementById('filtro-fecha-fin').value;
    
    if (!fechaInicio && !fechaFin) {
        // Si no hay filtros, mostrar todos los datos
        actualizarTablaOrdenes();
        actualizarTablaVentas();
        return;
    }
    
    // Filtrar órdenes
    const ordenesTabla = document.querySelector('.data-table tbody');
    if (ordenesTabla) {
        // Limpiar la tabla
        ordenesTabla.innerHTML = '';
        
        // Filtrar y mostrar las órdenes que cumplan con el rango de fechas
        const ordenesFiltradas = datosGlobales.ordenes.filter(orden => {
            if (fechaInicio && orden.fecha < fechaInicio) return false;
            if (fechaFin && orden.fecha > fechaFin) return false;
            return true;
        }).sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 5);
        
        ordenesFiltradas.forEach(orden => {
            const fila = document.createElement('tr');
            
            // Determinar el color del estado
            let estadoClase = '';
            switch (orden.estado.toLowerCase()) {
                case 'completado':
                    estadoClase = 'success';
                    break;
                case 'pendiente':
                    estadoClase = 'warning';
                    break;
                case 'enviado':
                    estadoClase = 'info';
                    break;
                case 'cancelado':
                    estadoClase = 'danger';
                    break;
            }
            
            fila.innerHTML = `
                <td>${orden.id}</td>
                <td>${orden.cliente}</td>
                <td>${orden.producto}</td>
                <td>${formatearFecha(orden.fecha)}</td>
                <td><span class="badge ${estadoClase}">${orden.estado}</span></td>
                <td>$${orden.total.toFixed(2)}</td>
                <td>
                    <button class="btn-view" onclick="verOrden('${orden.id}')">Ver</button>
                    <button class="btn-edit" onclick="editarOrden('${orden.id}')">Editar</button>
                </td>
            `;
            
            ordenesTabla.appendChild(fila);
        });
    }
    
    // Similar para la tabla de ventas si existe
    const ventasTabla = document.querySelector('#tabla-ventas tbody');
    if (ventasTabla) {
        // Implementar filtro para ventas
    }
}
