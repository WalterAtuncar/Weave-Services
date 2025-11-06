<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>

![](Aspose.Words.3184fba8-1f57-4373-a4d7-5b011bad4160.002.png)

**PROYECTO APP DE GESTIÓN POR PROCESOS** 

Enero 2025 



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>

VERSIONES DEL DOCUMENTO 



|**Versión** |**Fecha** |**Descripción de los Cambios**|**Responsable** |
| - | - | - | - |
|1\.0 |15 ene 2025 |Creación inicial del documento.|Martín |
|2\.0 |19 jun 2025 |Ajustes y Mejoras de acuerdo con avance en Desarrollo. Todos los cambios se muestran con color naranja |Martin Erick Walter |
|||||


<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>

<a name="_page2_x82.00_y190.00"></a>INDICE 

[INDICE ......................................................................................................................3](#_page2_x82.00_y190.00)

1. [**Descripción del Ecosistema Integrado para la Gestión por Procesos** ..................8](#_page7_x82.00_y115.00)
1. [**Objetivo del documento** .....................................................................................8](#_page7_x82.00_y514.00)
1. [**Requerimientos Funcionales** ..............................................................................9 ](#_page8_x82.00_y514.00)[**MÓDULO PROCESOS:** ................................................................................. 9 ](#_page8_x82.00_y556.00)[**Caso de uso: Crear un proceso nuevo** ........................................................10 ](#_page9_x82.00_y521.00)[**Caso de uso: Importar un Diagrama de Proceso** .........................................11 ](#_page10_x82.00_y482.00)

[**Caso de uso: Diagramar un proceso manualmente usando la tabla “Actividades del Proceso”** .........................................................................12 ](#_page11_x82.00_y567.00)

[**Caso de uso:  Diagramar un Proceso con recomendación de IA** ..................13 ](#_page12_x82.00_y706.00)[**Caso de uso: Modificar o Crear una nueva versión de un proceso** ...............15 ](#_page14_x82.00_y310.00)[**Caso de uso: Eliminar un proceso** ..............................................................16 ](#_page15_x82.00_y647.00)[**Caso de uso: Archivar un proceso** ..............................................................17 ](#_page16_x82.00_y627.00)[**Caso de uso: Cambiar el estado de un proceso a NO VIGENTE** ...................18 ](#_page17_x82.00_y487.00)[**Caso de uso: Comparación de versiones de Procesos** ................................19 ](#_page18_x82.00_y390.00)[**Caso de uso: Journey Map** ..........................................................................20 ](#_page19_x82.00_y565.00)[**Caso de uso: Generar Formato Imprimible** .................................................23 ](#_page22_x82.00_y377.00)[**MÓDULO ORGANIZACIÓN:** .........................................................................23 ](#_page22_x82.00_y665.00)[**Caso de uso: Crear o Actualizar el MOF** ......................................................24 ](#_page23_x82.00_y269.00)[**Caso de uso: CRUD de una Organización** ...................................................25 ](#_page24_x82.00_y317.00)[**Caso de uso: CRUD de una Unidad Organizativa**.........................................26 ](#_page25_x82.00_y588.00)[**Caso de uso: CRUD de una Posición** ..........................................................28 ](#_page27_x82.00_y358.00)[**Caso de uso: CRUD de una Persona** ...........................................................29 ](#_page28_x82.00_y662.00)[**Caso de uso: CRUD de una Posición de Persona** ........................................31 ](#_page30_x82.00_y316.00)[**Caso de uso: Carga del Organigrama desde Excel** ......................................32 ](#_page31_x82.00_y560.00)

<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>

[**MÓDULO SISTEMAS:** ..................................................................................36 ](#_page35_x82.00_y115.00)[**Caso de uso: CRUD para la Tabla de SISTEMAS** ..........................................36 ](#_page35_x82.00_y596.00)[**Caso de uso: Carga de los Activos de SISTEMAS desde Excel** .....................38 ](#_page37_x82.00_y272.00)[**Módulo ACTIVOS DE DATA:** .........................................................................40 ](#_page39_x82.00_y355.00)[**Caso de uso: CRUD para la Tabla de ACTIVOS DE DATA**...............................40 ](#_page39_x82.00_y555.00)[**Caso de uso:** Carga de los Activos de DATA desde Excel ................................42 ](#_page41_x82.00_y569.00)[**Módulo DOCUMENTOS:** .............................................................................44 ](#_page43_x82.00_y583.00)[**Caso de uso: CRUD para la Tabla de DOCUMENTOS** ...................................46 ](#_page45_x82.00_y429.00)[**MÓDULO GESTIÓN DE RIESGOS:**................................................................48 ](#_page47_x82.00_y678.00)[**Caso de uso: CRUD de Riesgos** ..................................................................49 ](#_page48_x82.00_y410.00)[**MÓDULO PLANES DE ACCIÓN:**...................................................................51 ](#_page50_x82.00_y525.00)[**Caso de uso: CRUD de Planes de acción** ....................................................52 ](#_page51_x82.00_y413.00)[**Caso de uso: Crear actividad o hacer seguimiento a un Plan de acción** ......54 ](#_page53_x82.00_y637.00)[**MODULO DE AUDITORIA** ............................................................................56 ](#_page55_x82.00_y423.00)[**Caso de uso: CRUD de Planes de auditoria** ................................................57 ](#_page56_x82.00_y398.00)[**Caso de uso: Gestión de hallazgos y no conformidades** .............................59 ](#_page58_x82.00_y480.00)[**Caso de uso: Creación de planes para atender los resultados de auditoría** 61 ](#_page60_x82.00_y181.00)[**Caso de uso: Seguimiento** .........................................................................61 ](#_page60_x82.00_y335.00)[**Caso de uso: Alertas y seguimiento** ...........................................................61 ](#_page60_x82.00_y708.00)[**MODULO INDICADORES DE GESTIÓN** ........................................................62 ](#_page61_x82.00_y492.00)[**Caso de uso: CRUD de Gestión de indicadores** ..........................................63 ](#_page62_x82.00_y145.00)[**Caso de uso: Carga de Resultados de Indicadores desde Excel** ..................64 ](#_page63_x82.00_y463.00)[**Caso de uso: Consulta de indicadores de gestión** ......................................65 ](#_page64_x82.00_y287.00)[**Caso de uso: Construcción de indicadores de la app** .................................65 ](#_page64_x82.00_y560.00)[**MODULO REGLAS DE NEGOCIO** .................................................................68 ](#_page67_x82.00_y493.00)[**Caso de uso: CRUD de Reglas de negocio** ..................................................69 ](#_page68_x82.00_y319.00)[**MODULO DE SISTEMAS DE GESTIÓN** ..........................................................71 ](#_page70_x82.00_y417.00)[**Caso de uso: CRUD de Sistemas de gestión** ...............................................72 ](#_page71_x82.00_y455.00)[**MODULO DE REPORTES** .............................................................................74 ](#_page73_x82.00_y603.00)[**Caso de uso: Gestión de Reportes** .............................................................75 ](#_page74_x82.00_y395.00)

<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>

[**Caso de uso: Observaciones y su relación con los Sistemas de gestión** .....76 ](#_page75_x82.00_y548.00)[**MODULO DE USUARIOS Y PERFILES** ...........................................................77 ](#_page76_x82.00_y681.00)[**Caso de uso: Gestión de Usuarios y Perfiles** ...............................................78 ](#_page77_x82.00_y547.00)

[**Caso de uso: Expiración automática de accesos** ........................................80 ](#_page79_x82.00_y394.00)[**OPCIONES APLICABLES A MÁS DE UN MÓDULO:** ................................ ....... 81 ](#_page80_x82.00_y130.00)[**Caso de uso: WORKFLOW DE APROBACIÓN DE CAMBIOS** .......................... 81 ](#_page80_x131.00_y182.00)[**Caso de uso: Configuración de duración de los procesos** ...........................83 ](#_page82_x82.00_y587.00)

[**Caso de uso: Alertas de vencimientos** .......................................................84 ](#_page83_x82.00_y490.00)[**Caso de uso: Log de accesos a la información** ...........................................86 ](#_page85_x82.00_y130.00)[**Caso de uso: Cronología de versiones de una entidad** ................................86 ](#_page85_x82.00_y592.00)

[**Caso de uso: Parámetros generales de la app** ............................................87 ](#_page86_x82.00_y308.00)

4. [**Requerimientos No Funcionales**....................................................................... 89](#_page88_x82.00_y115.00)
4. [**Diseño de la Solución** ....................................................................................... 89](#_page88_x82.00_y267.00)
4. [**Anexos**............................................................................................................. 90](#_page89_x82.00_y479.00)
4. [**Referencias:** .................................................................................................... 92](#_page91_x82.00_y498.00)
4. [**Diagramas Adicionales:** ................................................................................... 92](#_page91_x82.00_y578.00)
4. [**Estructuras de tablas:** ...................................................................................... 92 ](#_page91_x82.00_y652.00)[Tabla CABECERA DEL PROCESO ..................................................................92 ](#_page91_x82.00_y697.00)[Tabla ACTIVIDADES .....................................................................................95 ](#_page94_x82.00_y215.00)[Tabla ACTIVIDADES - Documentos ...............................................................96 ](#_page95_x82.00_y709.00)[Tabla ACTIVIDADES – Activos de Data ...........................................................97 ](#_page96_x82.00_y523.00)[Tabla ACTIVIDADES – Riesgos .......................................................................98 ](#_page97_x82.00_y140.00)[Tabla JOURNEY MAP - Cabecera ...................................................................98 ](#_page97_x82.00_y353.00)[Tabla JOURNEY MAP – Puntos de contacto ....................................................99 ](#_page98_x82.00_y115.00)[Tabla JOURNEY MAP – Relaciones ................................................................99 ](#_page98_x82.00_y427.00)

[Tabla ORGANIZACIÓN ............................................................................... 100 ](#_page99_x82.00_y166.00)[Tabla Unidad Organizativa.......................................................................... 101 ](#_page100_x82.00_y140.00)[Tabla POSICIONES .................................................................................... 102 ](#_page101_x82.00_y240.00)[Tabla PERSONAS ...................................................................................... 103 ](#_page102_x82.00_y488.00)[Tabla PERSONAS POSICIÓN ...................................................................... 105 ](#_page104_x82.00_y115.00)



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>

[Formato de carga masiva Organigrama. ...................................................... 105 ](#_page104_x82.00_y560.00)[Formato de carga masiva – Posiciones adicionales ...................................... 108 ](#_page107_x82.00_y293.00)[Tabla SISTEMAS ........................................................................................ 109 ](#_page108_x82.00_y146.00)[Tabla SISTEMAS - Módulos ......................................................................... 110 ](#_page109_x82.00_y332.00)[Tabla SISTEMAS – Formato de carga masiva ................................................ 110 ](#_page109_x82.00_y638.00)[Tabla RIESGOS .......................................................................................... 112 ](#_page111_x82.00_y115.00)[Tabla – Riesgos – Soluciones implementadas .............................................. 113 ](#_page112_x82.00_y711.00)[Tabla - Causas de Riesgos .......................................................................... 114 ](#_page113_x82.00_y478.00)[Tabla - Consecuencias de Riesgos .............................................................. 115 ](#_page114_x82.00_y115.00)[Tabla – Clasificación del Riesgo .................................................................. 115 ](#_page114_x82.00_y307.00)[Tabla – Riesgos – Asociaciones ................................................................... 115 ](#_page114_x82.00_y415.00)[Tabla – Planes de Acción ............................................................................ 115 ](#_page114_x82.00_y684.00)[Tabla – Planes de Acción – Asociaciones ..................................................... 117 ](#_page116_x82.00_y115.00)[Tabla – Actividades programadas y seguimiento .......................................... 118 ](#_page117_x82.00_y115.00)[Tabla – Planes de Auditoría......................................................................... 119 ](#_page118_x82.00_y339.00)[Tabla – Equipo de Auditoría ........................................................................ 120 ](#_page119_x82.00_y392.00)[Tabla – Resultados de auditoría .................................................................. 121 ](#_page120_x82.00_y115.00)[Tabla - Flujo de aprobaciones ..................................................................... 122 ](#_page121_x82.00_y351.00)[Tabla - Activos de Data .............................................................................. 123 ](#_page122_x82.00_y178.00)[Tabla - carga masiva - Activos de Data ........................................................ 123 ](#_page122_x82.00_y712.00)[Tabla - Documentos .................................................................................. 125 ](#_page124_x82.00_y115.00)[Tabla – Definiciones - Indicadores .............................................................. 126 ](#_page125_x82.00_y646.00)[Tabla – Metas - Indicadores ........................................................................ 128 ](#_page127_x82.00_y366.00)[Tabla – Reglas de negocio .......................................................................... 129 ](#_page128_x82.00_y301.00)[Tabla – Adjuntos de Reglas de negocio ........................................................ 130 ](#_page129_x82.00_y388.00)[Tabla – Sistemas de Gestión ....................................................................... 131 ](#_page130_x82.00_y115.00)[Tabla - Adjuntos de Sistemas de Gestión ..................................................... 132 ](#_page131_x82.00_y376.00)[Tabla - Relaciones a sistemas de gestión .................................................... 133 ](#_page132_x82.00_y140.00)[Tabla – Resultados - Indicadores ................................................................ 134 ](#_page133_x82.00_y264.00)[Formato de reporte de observaciones vs Sistemas de gestión ...................... 135 ](#_page134_x82.00_y115.00)

<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>

[Tabla – Usuarios y Perfiles .......................................................................... 135 ](#_page134_x82.00_y353.00)[Tabla – Parámetros generales ..................................................................... 136 ](#_page135_x82.00_y302.00)[Tabla - Log de accesos ............................................................................... 137 ](#_page136_x82.00_y115.00)[Tabla - Emociones ..................................................................................... 137 ](#_page136_x82.00_y443.00)[Parámetros del sistema – Alertas y recordatorios ......................................... 137 ](#_page136_x82.00_y717.00)



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>

1. **Descripción<a name="_page7_x82.00_y115.00"></a> del Ecosistema Integrado para la Gestión por Procesos** 

El  ecosistema  para  la  gestión  por  procesos  estará  diseñado  para  integrar  y coordinar  de  manera  efectiva  los  módulos  fundamentales  que  soportan  la operación de una organización. Este gráfico ilustra cómo el Módulo de Procesos actuará como el núcleo central, conectando elementos clave como la gestión de riesgos,  auditorías,  indicadores,  usuarios  y  documentos.  Cada  componente interactúa para garantizar un flujo de información eficiente, una toma de decisiones basada en datos y la mejora continua. 

![](Aspose.Words.3184fba8-1f57-4373-a4d7-5b011bad4160.003.jpeg)

2. **Objetivo<a name="_page7_x82.00_y514.00"></a> del documento** 

El objetivo de este documento es detallar las especificaciones funcionales para el desarrollo de un sistema integral de soporte a la gestión por procesos. Este sistema debe ser una  **herramienta holística** que brinde soporte a las siguientes áreas clave: 

1) Creación de Usuarios y sus Perfiles, Propiedades de la aplicación. 
1) Organización, puestos, reporta a, áreas.  
1) Mapa de Procesos y procesos.  
1) Indicadores de gestión.  
1) Documentos. (Funciones, Políticas, Formularios, otros)
1) Procesos de Auditoría.  
1) Gestión de Riesgos.  
1) Planes de Mejora.  
1) Sistemas (y los servidores en que residen) 
1) Activos de DATA 
1) Reglas de negocio 

<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



12) Sistemas de gestión 
12) Reportes (Asistente) 

Para la elaboración de la documentación funcional de cada uno de los módulos enunciados  se  debe  tener  en  cuenta  que  debe  ser  de  **fácil  uso,  intuitivo  y amigable,**  debe  evitarse  que  sea  una  herramienta  burocrática,  tediosa  o  que requiera el soporte de un especialista en diseño de procesos o que quienes la usen posean  conocimientos  de  la  notación  BPMN  u  otro  conocimiento  técnico  de tecnología o procesos. 

Adicionalmente, se buscará la **aplicabilidad de la IA**, así como definir las **entradas y salidas** de las posibles **integraciones con sistemas externos**. **Se define que la IA será optativa, cada Cliente podrá definir si desea utilizarla o no. Es una función parametrizable.** 

El  sistema  debe  facilitar  la  **reutilización  de  la  documentación  existente** del 

cliente,  evitando  la  necesidad  de  volver  a  redactar  procesos  previamente documentados  en  herramientas  similares  a  Bizagi,  Visio  o  Aris.  Esto  permitirá optimizar  recursos  y  acelerar  la  implementación  al  aprovechar  activos  ya disponibles. 

**Stakeholders Clave:**  



|**Persona** |**Rol** |
| - | - |
|Erick Machuca |Principal |
|Antonio Torre |Ingeniero de Procesos |

3. **Requerimientos<a name="_page8_x82.00_y514.00"></a> Funcionales** 

<a name="_page8_x82.00_y556.00"></a>**MÓDULO PROCESOS:** 

La sección de PROCESOS es el  módulo  dentro del sistema  en la que se tendrán documentados  los  procesos  de  la  compañía,  organizados  en  una  estructura jerárquica  multinivel configurable que pueda visualizarse gráficamente a través de diferentes  vistas  configurables  según  necesidad  del  negocio  (p.e.  Mapa  de procesos, Journey del Cliente, Procesos E2E, etc.). 

Los  procesos  estarán  documentados  bajo  la  notación  BPMN  y  sus  fuentes  de información  para  ser  construido  es  el  Organigrama  (unidades  organizativas, posiciones y personas), la normativa (interna y externa), la base de datos de otros procesos relacionados, la base de datos de sistemas y activos de Data, la base de datos de documentos (formatos, documentos de gestión, imágenes, anexos, etc.), 

<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>

la base de datos de reglas de negocio de la Organización, la base de datos de Riesgos (riesgos identificados, controles y planes de acción) y la base de datos de auditoría (informes, observaciones de  auditoría y planes de acción). El diseño de las tablas asociadas al **Módulo de procesos** son Tabl[a Cabecera del Proceso, Tabla ](#_page91_x82.00_y697.00)[Actividades, ](#_page94_x82.00_y215.00)[Tabla Actividades – Documentos, Ta](#_page95_x82.00_y709.00)[bla Actividades – Activos de Data, ](#_page96_x82.00_y523.00)[Tabla Actividades  – Riesgos, ](#_page97_x82.00_y140.00)[Tabla – Relaciones a sistemas de gestión y se](#_page132_x82.00_y140.00) ubican en la sección **“[**Estructuras de Tablas”**. ](#_page91_x82.00_y652.00)**

Las opciones necesarias para crear o editar procesos son las que mostramos en el cuadro siguiente: 

![](Aspose.Words.3184fba8-1f57-4373-a4d7-5b011bad4160.004.jpeg)

**Roles y Permisos:** Los roles y usuarios con acceso a este módulo son obtenidos de lo que se haya configurado en el módulo “Usuarios y Perfiles”

<a name="_page9_x82.00_y521.00"></a>**Caso de uso: Crear un proceso nuevo** 

**Actor:** Usuario con acceso al módulo 

**Descripción:** Permite al Usuario crear un proceso nuevo

**Flujo Principal:** 

1. Accede al módulo “Procesos”. 
1. Accede al botón “Crear Proceso” o al ícono “+”. 
1. El usuario ingresa datos para crear el proceso de acuerdo con los datos definidos en la sección [ 10. ESTRUCTURAS DE TABLA](#_page91_x82.00_y652.00)S[,](#_page91_x82.00_y652.00) Tabla [“**Cabecera del proceso**” ](#_page91_x82.00_y697.00) y  confirma  la  creación.**   El  nombre  que  el  Usuario  asigne  al proceso  **será  asistido por la IA** que  basado en la información ingresada propondrá  un nombre o lista de posibles nombres.  Finalmente, el Usuario decidirá usar un nombre propuesto o uno nuevo totalmente ingresado por él.



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



4. El sistema confirma la creación asignando un código único de proceso y muestra la pantalla con los datos del proceso creado, a su vez que muestra las  opciones  para  documentar  las  actividades: “Importar”, “Nuevo”, “IA recomienda”. 
4. El flujo continúa con la elección del usuario, pudiendo ser cualquiera de las tres opciones disponibles o salir. 
4. Al ser esta una creación de “cabecera de proceso” no requiere pasar por el flujo  de  aprobaciones,  si  no  hasta  que  el  proceso  esté  completo  (con actividades), que es cuando requerirá de continuar con el **WO[**RKFLOW DE APROBACIÓN DE CAMBIO**](#_page80_x131.00_y182.00)S[**.**](#_page80_x131.00_y182.00)** 

**Precondiciones:**  

- El usuario debe estar autenticado y tener permisos para crear procesos.

**Post condiciones:**  

- El proceso queda registrado y visible para los usuarios autorizados.
- Los  procesos  creados  sin  contenido  **se  eliminarán  automáticamente después de X días** (los que estén configurados en el módulo “Propiedades 

  de la aplicación”). 

<a name="_page10_x82.00_y482.00"></a>**Caso de uso: Importar un Diagrama de Proceso** 

**Actor:** Usuario  

**Descripción:** Permite al Usuario crear un proceso desde un archivo existente en formato  BPMN, Draw.io, Bizagi o Aris.** 

**Flujo Principal:** 

1. Accede al módulo “Procesos” y selecciona el proceso a diagramar
1. El usuario selecciona la opción “Editar” 
1. Si el proceso aún no tiene contenido, el aplicativo muestra las siguientes opciones: **“Importar”,** **“Nuevo”, “IA recomienda”**  
1. El usuario selecciona **“Importar”** 
1. El usuario, en una ventana tipo “Explorer” selecciona el archivo a importar 
1. El sistema reconoce la información del archivo (puede basarse en el XML si existe u otro formato importable) y actualiza el modelo de datos de dicho proceso a partir de la información del archivo importado. 



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



7. El sistema muestra la información hacia el usuario en formato Tabla y Flujograma 
7. El usuario guarda el proceso. 
7. Si el sistema encuentra errores, los resalta y pide corrección.
7. De no existir errores, graba el proceso en estado “edición”.
7. De elegir el usuario iniciar el proceso de aprobación, se activará el proceso descrito en la sección: [ WORKFLOW DE APROBACIÓN DE CAMBI](#_page80_x204.00_y182.00)OS[.](#_page80_x204.00_y182.00)  
7. De llegar la aprobación del proceso, el sistema procede a cambiar el 

   estado a “Publicado”. 

**Flujos Alternativos:** 

- Si falta información obligatoria, se muestra un mensaje de error y no se permite guardar. 
- Si el usuario cancela la operación, no se guarda ningún cambio.

**Pre condiciones:** El usuario debe estar autenticado y tener permisos para crear procesos. 

**Post condiciones:**  

- El proceso queda registrado y visible para los usuarios autorizados.
- El sistema enviará un correo electrónico tomando como destinatarios a los que participaron de la aprobación (si hubo) y a los jefes inmediatos de las personas que participan de las actividades del proceso.

<a name="_page11_x82.00_y567.00"></a>**Caso de uso: Diagramar un proceso manualmente usando la tabla “Actividades del Proceso”** 

**Actor:**  Usuario con acceso 

**Descripción:** Permite al Usuario crear un proceso manualmente con la misma herramienta. 

**Flujo Principal:** 

1. Accede al módulo “Procesos” y selecciona el proceso a diagramar
1. El usuario selecciona la opción “Editar”
1. Si el proceso aún no tiene contenido, el aplicativo  muestra las siguientes opciones: **“Importar”,** **“Nuevo”, “IA recomienda”**  



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



4. El usuario selecciona **“Nuevo”** 
4. El usuario registra  cada  actividad del proceso en la  grilla “Actividades del Proceso”, de acuerdo con lo definido en la sección 10.[ Estructuras de Tablas, “**Tabla Actividades**”.  ](#_page15_x179.00_y166.00)
4. El sistema  permite  insertar,  modificar,  eliminar,  subir,  bajar  arrastrando actividades creadas dentro de la tabla “Actividades del Proceso” 
4. El sistema  irá mostrando  en simultaneo y  en la parte inferior, el diagrama generado  a  partir  de  la  información  que  se  va  ingresando  en  la  tabla “Actividades del Proceso” 
4. El  usuario  puede  modificar  información  desde  la  grilla “Actividades  del proceso” o desde el gráfico que se está generando, si utiliza el gráfico puede utilizar  la caja de herramientas con todos los componentes de notación BPMN. 
4. El sistema sincroniza simultáneamente en la tabla “Actividades del Proceso” todos los cambios realizados en la sección gráfica y viceversa. 
4. El usuario presionar “guardar”. 
4. Si hay errores en la información ingresada, el sistema resalta los errores y pide corrección. 
4. Si no hay errores, guarda el proceso, aún en estado “edición”.
4. De elegir el usuario iniciar el proceso de aprobación, se activará el proceso descrito en la sección: [ WORKFLOW DE APROBACIÓN DE CAMBI](#_page80_x204.00_y182.00)OS[.](#_page80_x204.00_y182.00)  
4. De llegar hasta la aprobación, el sistema procede a crear el proceso y a cambiar el estado a “Vigente”. 

**Precondiciones:**  

- El administrador debe estar autenticado y tener permisos para gestionar empleados. 
- El usuario debe estar seleccionando un proceso existente. 

**Postcondiciones:**  

- El proceso queda registrado y visible para los usuarios autorizados.
- El sistema enviará un correo electrónico tomando como destinatarios a los que participaron de la aprobación (si hubo) y a los jefes inmediatos de las personas que participan de las actividades del proceso.

<a name="_page12_x82.00_y706.00"></a>**Caso de uso:  Diagramar un Proceso con recomendación de IA**  

**Actor:**  Usuario con acceso 

**Descripción:** Permite al Usuario crear un proceso asistido con la recomendación 

<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>

de IA 

**Flujo Principal:** 

1. Accede al módulo “Procesos” y selecciona el proceso a diagramar
1. El usuario selecciona la opción “Editar”
1. Si el proceso aún no tiene contenido, el aplicativo  muestra las siguientes opciones: **“Importar”,** **“Nuevo”, “IA recomienda”**  
1. El usuario selecciona **“IA recomienda”** 
1. El sistema mostrará un cuadro de texto amplio donde el usuario ingresará un prompt  que  servirá  como  instrucción  para  que  la  IA  genere  el  proceso automáticamente.  
1. La IA analiza el prompt y genera una propuesta de flujo de trabajo con pasos detallados, roles y tiempos sugeridos actualizando la grilla del proceso y el gráfico de este simultáneamente. 
1. El  sistema  presenta  el  proceso  generado  para  revisión,  permitiendo  al 

   usuario realizar ajustes o confirmar su aceptación.

   ![ref2]

8. El  usuario  puede  modificar  información  desde  la  grilla “Actividades  del proceso” o desde el gráfico que se está generando, si utiliza el gráfico puede utilizar la caja de herramientas con todos los componentes de notación BPMN. 
8. El sistema sincroniza simultáneamente en la tabla “Actividades del Proceso” todos los cambios realizados en la sección gráfica.  
8. El usuario presiona “grabar” 
8. Si hay errores, el sistema resalta la información errada y pide corregir.
8. De no encontrarse errores en la información del proceso, el sistema guarda 

   el proceso, mantiene el estado “edición”. 

13. De elegir el usuario iniciar el proceso de aprobación, se activará el proceso descrito en la sección: [ WORKFLOW DE APROBACIÓN DE CAMBI](#_page80_x204.00_y182.00)OS[.](#_page80_x204.00_y182.00)  
13. De  llegar  la  aprobación  final,  el  sistema  procede  a  guardar  el  proceso, colocando en el estado “Vigente”. 

<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>

**Precondiciones:**  

- El administrador debe estar autenticado y tener permisos para gestionar empleados. 
- El usuario debe estar seleccionando un proceso existente. 

**Postcondiciones:**  

- El proceso queda registrado y visible para los usuarios autorizados.
- El sistema enviará un correo electrónico tomando como destinatarios a los que participaron de la aprobación (si hubo) y a  los jefes inmediatos de las personas que participan de las actividades del proceso.

<a name="_page14_x82.00_y310.00"></a>**Caso de uso: Modificar o Crear una nueva versión de un proceso**  

**Actor:**  Usuario con acceso** 

**Descripción:** Permite al Usuario editar un proceso y hacerle modificaciones 

**Flujo Principal:** 

1. El Usuario selecciona la opción “Editar” 
1. Si el proceso tiene contenido, el aplicativo muestra las siguientes opciones: “Modificar”, “Anular”, “Archivar”, “Caducar”.  
1. El usuario selecciona **“Modificar”** 
1. El  sistema  presenta  el  proceso  existente  para  revisión,  permitiendo  al usuario realizar modificaciones. 

   ![ref2]

5. El  usuario  puede  modificar  información  desde  la  grilla “Actividades  del proceso” o desde el gráfico, si utiliza el gráfico puede utilizar la caja de herramientas con todos los componentes de notación BPMN.
5. El sistema sincroniza simultáneamente en la tabla “Act[ividades del Proceso” ](#_page94_x82.00_y215.00)todos los cambios realizados en la sección gráfica y viceversa.  

<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



7. El usuario podrá indicar en cada actividad que documentos de entrada o de salida utiliza, en estos casos, el sistema mostrará para elegir cuales son los documentos asociados al proceso, tal como está definido en la estructura de la tabla “<a name="_page15_x179.00_y166.00"></a>[Actividades del proceso”. ](#_page94_x82.00_y215.00)
7. Antes de guardar el proceso, verifica si el Usuario desea crear una nueva versión del proceso. En este punto el usuario debe poder ver que versiones tiene  el  proceso,  con  la  información  mínima  para  poder  entender  la evolución de las versiones:  Versión, estado, fecha de cambio de estado, Usuario que la creó, Usuario que la modificó. 
7. Guarda el proceso con la misma versión o una nueva,  lo que eligiera el usuario, en una versión temporal que continúa en estado “edición”.  
7. De elegir el usuario iniciar el proceso de aprobación, se activará el proceso descrito en la sección: [ WORKFLOW DE APROBACIÓN DE CAMBI](#_page80_x204.00_y182.00)OS[.](#_page80_x204.00_y182.00)   
7. De  llegar  a  la  aprobación  final,  aplica  las  modificaciones  de  la  versión temporal en una versión final que queda en estado “publicado” y la versión anterior en estado “caducado”. 

**Precondiciones:**  

- El administrador debe estar autenticado y tener permisos para  gestionar procesos. 
- Sobre un proceso en estado “Vigente” sólo tienen permiso de edición el Dueño del proceso o Editores designados, definidos en el SOE. 
- El usuario debe estar seleccionando un proceso existente. 

**Postcondiciones:**  

- El proceso queda registrado y visible para los usuarios autorizados
- El sistema enviará un correo electrónico tomando como destinatarios a los que participaron de la aprobación (si hubo) y a los jefes inmediatos de las personas que participan de las actividades del proceso.

<a name="_page15_x82.00_y647.00"></a>**Caso de uso: Eliminar un proceso**  

**Actor:**  Usuario con acceso** 

**Descripción:** Permite al Usuario anular un proceso. 

**Flujo Principal:** 

1. El Usuario selecciona la opción “Editar” 

<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



2. Si el proceso tiene contenido, el aplicativo muestra las siguientes opciones: “Modificar”, “Anular”, “Archivar”, “Rehabilitar”  
2. El usuario selecciona **“Anular”.** 
2. El  sistema  muestra el  proceso  existente  para  revisión,  el  usuario  puede navegar sobre él. 
2. El usuario mediante el botón “confirma anulación” confirma la anulación del ![ref3]

   proceso, tiene que ser el Dueño  si el estado del proceso es VIGENTE en cualquier otro estado uno de los Editores designados. 

6. El  sistema  cambia  el  estado  a  “Anulado”,  registra  la  fecha  y  hora  de ![ref3]anulación, usuario que anula (modifica).
6. Guarda el proceso, el proceso  anulado pasa a “tacho” del cual se puede recuperar (rehabilitar). 

**Precondiciones:**  

- El administrador debe estar autenticado y tener permisos para gestionar empleados. 
- El usuario debe estar seleccionando un proceso existente
- Sobre un proceso en estado “Vigente” sólo tienen permiso de anulación el Dueño del proceso. 

**Postcondiciones:**  

- El proceso no es visible en la vista de procesos activos, puede volverse a ver si  cambio  el  filtro  de  visualización  para  ver  los  estados  no  vigentes  a elección. 
- Los procesos que fueron  adicionados al “Tacho”, quedan disponibles para una eventual recuperación mediante la opción “Rehabilitar”.

**Caso de Uso**  

<a name="_page16_x82.00_y627.00"></a>**Caso de uso: Archivar un proceso**  

**Actor:**  Usuario con acceso** 

**Descripción:** Permite al Usuario archivar un proceso. 

**Flujo Principal:** 

1. El Usuario selecciona la opción “Editar” 



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



2. Si el proceso tiene contenido, el aplicativo muestra las siguientes opciones: “Modificar”, “Anular”, “Archivar”, “Caducar”  
2. El usuario selecciona **“Archivar”**. 
2. El sistema presenta el proceso existente para revisión
2. El  usuario  mediante  el  botón  “confirma  archivamiento”  confirma  el archivamiento del proceso. 
2. El  sistema  cambia  el  estado  a “archivado”,  registra  la  fecha  y  hora  de archivado,  usuario  que  archiva  (usuario  que  modifica).  Los  procesos “Archivados” pueden ser recuperados mediante la opción “Rehabilitar. 
2. Guarda el proceso.  

**Precondiciones:**  

- El administrador debe estar autenticado y tener permisos para gestionar empleados. 
- El usuario debe estar seleccionando un proceso existente

**Postcondiciones:**  

- El proceso no es visible en la vista de procesos activos, puede volverse a ver si  cambio  el  filtro  de  visualización  para  ver  los  estados  no  vigentes  a elección. 

<a name="_page17_x82.00_y487.00"></a>**Caso de uso: Cambiar el estado de un proceso a NO VIGENTE** 

**Actor:**  Proceso automático (proceso nocturno diario) 

**Descripción:** Permite al sistema dar por finalizado la vigencia de un proceso.

**Flujo Principal:** 

1. El sistema identifica y filtra todos los procesos cuya fecha de expiración es menor a la fecha actual. 
1. A todos los procesos que  cumplen con la condición, el sistema cambia el estado del proceso a “No vigente”. 
1. Notifica la acción automática realizada vía correo.
1. Termina el proceso. 

**Precondiciones:**  

- El administrador debe estar autenticado y tener  permisos para gestionar empleados. 



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



- El usuario debe estar seleccionando un proceso existente. 
- Debe  existir  la  configuración  de  “Tiempo  de  vigencia”,  donde  se  pre establece el tiempo que dura un proceso en estado vigente.
- Periódicamente, el sistema notifica a los dueños de procesos el listado de procesos que están (o estarán próximamente) en estado “No vigente”. El listado de procesos incluye un  enlace al proceso en el sistema para su atención. 

**Postcondiciones:**  

- El proceso no es visible en la vista de procesos activos, puede volverse a ver si  cambio  el  filtro  de  visualización  para  ver  los  estados  no  vigentes  a elección. 
- Un proceso que está “No vigente”, el Dueño del proceso puede “extenderle la vigencia” y con ello pasarlo nuevamente a “Vigente”. 

<a name="_page18_x82.00_y390.00"></a>**Caso de uso: Comparación de versiones de Procesos** 

**Actor:**  Analistas de procesos, Usuarios con permisos.  

**Descripción:** Permite comparar dos versiones de procesos en forma gráfica. 

**Flujo Principal:** 

1. El usuario ingresa al Módulo de PROCESOS y elige un Proceso. 
1. El  sistema  le  muestra  las  versiones  del  mismo  Proceso  elegido  por  el Usuario. 
1. El usuario selecciona con un “check” las dos versiones que quiere comparar.
1. La versión más antigua será el “As is” y la más reciente el “To be”. 
1. Elige la opción “Comparación de versiones” 
1. El  sistema  le  muestra  en  pantalla  dividida  horizontalmente  la  versión anterior arriba (As Is) y la nueva versión abajo (To Be). 
1. Estando las dos versiones solicitadas  en pantalla, el usuario aún puede modificar las versiones que quiere comparar, para ello tendrá dos campos desplegables  donde  podrá  elegir  la  versión  a  ver  como  “As  Is”  y  otro desplegable para elegir el “To Be”. 
1. Información para mostrar en el “As Is”, vista superior: 
1) Si una actividad se eliminó en el “To Be”,  se muestra con un “tachito rojo” en la parte superior de la actividad. 
1) En general, toda eliminación en la versión “To Be” se mostrará en color rojo en la versión “As Is” 



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>

3) En general toda modificación en la versión “To Be” se mostrará en color amarillo en la versión “As Is”. 
9. Información para mostrar en la versión “To Be”. 
   1) Toda actividad adicionada, se mostrará de color verde con un signo + para identificar las nuevas actividades. 
   1) Las actividades con modificaciones menores se mostrarán de color amarillo. 
   1) Las  actividades  que  permanecen  igual  a  la  versión  comparada  se mantienen de color negro. 
9. En una pantalla adicional, el sistema permitirá visualizar el comparativo de 

   las versiones seleccionadas en lo referido a: 

1) Dueño del Proceso 
1) Nivel 
1) Criticidad 
1) Estado 
1) Proceso Padre 
1) Acuerdo de nivel de servicio 
1) Número de instancias del periodo
1) Frecuencia del periodo 
1) Tiempo del ciclo del proceso 
1) Duración acumulada 
1) Cantidad de personas 
1) Costo de la actividad 
11. El  Usuario  puede  navegar  por  las  dos  versiones  del  proceso  elegidas, avanzar, retroceder horizontal y verticalmente.
11. No puede realizar modificaciones. 
11. Luego de la revisión el Usuario puede salir presionando “Esc”  o clic en el 

    botón “salir” 

14. Termina el proceso. 

<a name="_page19_x82.00_y565.00"></a>**Caso de uso: Journey Map** 

**Actor:**  Analistas de procesos, Usuarios con permisos.

**Descripción:** El **Journey Map** está diseñado para apoyar a los usuarios en el **mapeo visual y analítico de la experiencia del cliente** a lo largo de un proceso específico de  la  organización.  El  objetivo  principal  de  este  módulo  es  proporcionar herramientas que permitan identificar, desde la perspectiva del cliente, **los puntos de contacto, interacciones clave, emociones experimentadas, expectativas y posibles fricciones** dentro del flujo del proceso, facilitando así la mejora continua orientada a la experiencia del cliente.** 

Este caso de uso permitirá a los usuarios **definir, visualizar y analizar** el recorrido del cliente  **(Customer Journey)** en cualquier proceso registrado en la aplicación, 

<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>

con un enfoque metodológico. El propósito fundamental es facilitar la comprensión del impacto que tienen los procesos organizacionales sobre los clientes y descubrir oportunidades de mejora que contribuyan a la **optimización de la experiencia del cliente (CX)**. 

A través de esta opción, el usuario podrá: 

- **Modelar** gráficamente los pasos e interacciones que tiene un cliente en un proceso determinado. 
- **Identificar emociones** (positivas, neutras o negativas) asociadas a cada punto de contacto. 
- **Analizar fricciones** (puntos de dolor) que dificulten una experiencia fluida.
- **Proponer  acciones  de  mejora**  para  reducir  fricciones  y  maximizar experiencias positivas. 
- **Vincular el journey con otros módulos** como Procesos, Riesgos, Auditoría, Documentos o Sistemas de Gestión, permitiendo así una visión transversal e integrada del impacto del proceso sobre el cliente.

El  **Journey  Map**  se  convierte  en  una  herramienta  esencial  para  **alinear  los procesos  organizacionales  a  las  expectativas  del  cliente**,  favoreciendo  la optimización del servicio, la fidelización y el posicionamiento de la marca a través 

de experiencias memorables.

Las tablas relacionadas a este caso de uso son Tabl[a Journey Map – Cabecera, Tabla](#_page97_x82.00_y353.00)[ Journey Map – Puntos de contacto y T](#_page98_x82.00_y115.00)[abla Journey Map – Relaciones. ](#_page98_x82.00_y427.00)

**Flujo Principal:** 

1. El usuario ingresa al Módulo de PROCESOS. 
1. El usuario presiona clic sobre la opción “Crear Journey Map”  
1. **Si elige CREAR:** 
1) Le asigna un nombre. 
1) El usuario ingresa una **definición del cliente** que usa en el proceso 
1) Define las etapas del viaje 
1) Define los puntos de contacto
1) Asocia las etapas del viaje con Procesos, Riesgos, Planes de acción o cualquier otro módulo de la app que pueda estar relacionado
1) Define  los  resultados  esperados,  emociones  (ver[  tabla  de emociones), ri](#_page136_x82.00_y443.00)esgos potenciales, y oportunidades por cada punto de contacto. 
1) Aquí una representación gráfica del resultado de los datos ingresados:



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>

![](Aspose.Words.3184fba8-1f57-4373-a4d7-5b011bad4160.007.jpeg)

8) El usuario decide guardar el “Journey Map”, puede establecer grabarlo con una nueva versión o reemplazar la existente.
8) Fin del proceso. 
4. Si elige CONSULTAR: 
   1) El usuario da clic o enter sobre la línea del Journey Map a consultar.  
   1) El sistema muestra los datos que tiene registrados del Journey Map, sin posibilidad de cambios. 
   1) El usuario termina la consulta, presionando ESC o el botón “salir”.
   1) Regresa a la vista principal de los Journey Map. 
   1) Termina el proceso. 
4. Si elige ACTUALIZAR: 
1) El usuario presiona el ícono “editar” en el Journey Map que desea modificar. 
1) El sistema muestra los datos modificables disponibles para cambio y muestra protegidos los datos que por estructura del sistema no pueden ser alterados.
1) El usuario efectúa las modificaciones y registra si desea hacer un cambio de versión. 
1) Confirma la actualización presionando el botón “grabar”, si el sistema no encuentra errores, continúa con el proceso.
1) Graba el registro. 
1) De elegir el usuario iniciar el proceso de aprobación del cambio, se activará el proceso descrito en la sección: W[ORKFLOW DE APROBACIÓN DE CAMBIO](#_page80_x204.00_y182.00)S[.](#_page80_x204.00_y182.00)  
1) Si la respuesta final del workflow de aprobación es “aprobado”, procede hacer los cambios de estado para proceder a la publicación del cambio. 
1) Regresa a la vista principal de los Journey Map. 
1) Fin del proceso. 

<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>

6. Si elige Eliminar: 
1) El usuario posicionado en el Journey Map a eliminar presiona el ícono “tacho” 
1) El sistema muestra una ventana para pedir confirmación de eliminación. 
1) Si confirma, se inicia el proceso de aprobación de la eliminación mediante la activación del proceso W[ORKFLOW DE APROBACIÓN DE CAMBIOS.](#_page80_x204.00_y182.00)  
1) Si la respuesta final del workflow de aprobación es “aprobado”, procede a hacer los cambios de estado para proceder a cambiar el estado del registro a “No vigente”. 
1) Regresa a la vista principal del Módulo de Journey Map. 
1) Fin del proceso. 

<a name="_page22_x82.00_y377.00"></a>**Caso de uso: Generar Formato Imprimible** 

**Actor:**  Usuario con acceso 

**Descripción:** Permite al Usuario generar un formato word/pdf a partir de los datos del proceso. 

**Flujo Principal:** 

1. El usuario hace clic en el botón “Generar Formato” 
1. El  usuario  selecciona  el  tipo  de  formato  a  generar  (Ficha  de  Proceso  o Procedimiento), el tipo de archivo (Word/PDF) y marca si/no desea mostrar el formato generado en el módulo “Documentos”
1. El sistema genera el formato con toda la información disponible del proceso
1. El  usuario  puede  consultar  la  información  del  formato  desde  el  tab “Visualizar Formato” 
1. El usuario puede descargar el archivo generado en word/pdf a su pc local (si es que su perfil cuenta con el acceso). 

<a name="_page22_x82.00_y665.00"></a>**MÓDULO ORGANIZACIÓN:** 

En la sección ORGANIZACIÓN se registran todas las Posiciones de la empresa, esta información  identifica las  **Posiciones**, Personas que ocupan en la actualidad u ocuparon las posiciones en algún momento, las funciones asignadas, la ubicación jerárquica, a quien reporta, quienes reportan a esta posición. El diseño de las tablas 



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>

asociadas al **Módulo Organización** se ubica en la sección **“Estructuras de Tablas”** bajo  los  títulos  de  [Tabla  ORGANIZACIÓN,](#_page99_x82.00_y166.00) [ Tabla  Unidad  Organizativa, ](#_page100_x82.00_y140.00) [Tabla POSICIONES,](#_page101_x82.00_y240.00)[ Tabla PERSONAS,](#_page102_x82.00_y488.00)[ Tabla PERSONAS POSICIÓN.](#_page104_x82.00_y115.00) 

Las opciones necesarias para crear o editar posiciones o personas son las que mostramos en el cuadro siguiente:

**Roles y Permisos:** Los roles y usuarios con acceso a este módulo son obtenidos de lo que se haya configurado en el módulo “Usuarios y Perfiles”

<a name="_page23_x82.00_y269.00"></a>**Caso de uso: Crear o Actualizar el MOF** 

**Actor: Sistema**  

**Descripción:** El  sistema  determina  las  funciones  de  una  posición en  base  al análisis de los procesos

**Flujo Principal:** 

1. Este proceso se ejecuta automáticamente, de acuerdo con la programación registrada en la sección “Configuración de la app” 
1. El sistema analiza los procesos, obtiene para cada Posición las actividades que encuentre asignadas en todos los procesos vigentes. 
1. Las agrupa en un “gran texto” de actividades sin modificar la información anterior. 
1. La IA analiza las actividades del “gran texto” y las resume en Funciones que las  registra  en  la  Tabla  “Funciones  de  la  Posición”  sin  modificar  la información anterior. 
1. El sistema lo mostrará al usuario (versión actual vs versión nueva), para que decida su actualización 
1. El usuario puede personalizar las “Funciones de la posición” u otros datos relacionados a la Posición como Objetivo de la posición. 
1. El flujo continúa con la elección del usuario, actualizar o no actualizar. 
1. El sistema marca las actividades de los procesos como “Procesadas” para evitar su análisis en el siguiente proceso de actualización de funciones.
1. Termina el proceso. 

**Pre condiciones:**  

- El sistema envía alertas de cambios en procesos al  líder del área para que decida si ejecuta la actualización del MOF.

<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>

- El sistema debe estar configurado previamente con el número de nivel que será considerado  líder  de  área.  Por  ej.  Si  nivel  0  es  Gerencia  General,  1 vicepresidentes Ejecutivos,  2  vicepresidentes,  3  Gerentes,  4  Subgerentes,  5 jefes, 6 Supervisores y en el sistema se configura que el líder de área es desde 3 Gerentes, las notificaciones llegarán sólo a los niveles 3. Gerente o superiores 

  con las alertas de los cambios en las funciones de su organización hacia abajo.

**Post condiciones:**  

- La posición queda registrada y visible para los usuarios autorizados.

<a name="_page24_x82.00_y317.00"></a>**Caso de uso: CRUD de una Organización** 

**Actor:** Usuario 

**Descripción:** Opciones de mantenimiento general de la información de la Organización.** 

**Flujo Principal:** 

1. El usuario ingresa al Módulo ORGANIZACIÓN. Elige la opción entre  “Crear”, “Consultar”, “Actualizar”, “Eliminar” 

   1\.1. En todas las opciones, el sistema muestra los datos según definición de los 

datos de la Tabla definidos en la sección 10. Ta[bla Organización. ](#_page99_x82.00_y166.00)

2. Si elige CREAR: 
   1. Presiona el ícono “+” (adicionar) 
   1. El sistema muestra los datos a ingresar. 
   1. Si  los  datos  obligatorios  fueron  ingresados  correctamente,  pide confirmación  para  grabar,  si  hay  datos  errados  o  faltan,  pide  sean completados. 
   1. Si la información está completa, el usuario  confirma presionando el botón “grabar”, el sistema graba el registro 
   1. Regresa a la vista principal del Módulo Organización 
   1. Termina el proceso. 
2. Si elige CONSULTAR: 
1. El usuario da clic o enter sobre la línea de la Organización.  
1. El sistema  muestra los datos que tiene registrados de la Organización, sin posibilidad de cambios. 
1. El usuario termina la consulta, presionando ESC o el botón “salir”. 



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



4. Regresa a la vista principal del Módulo Organización. 
4. Termina el proceso. 
4. Si elige ACTUALIZAR: 
1. El  usuario  presiona  el  ícono  “editar”  en  la  Organización  que  desea modificar. 
1. El  sistema  muestra  los  datos  modificables  disponibles  para  cambio  y muestra protegidos los datos que por estructura del sistema no pueden ser alterados. 
1. El usuario efectúa las modificaciones y finalmente presiona “grabar”. 
1. Si se encuentran errores, resalta la información errada y pide corrección.
1. Si el sistema no encuentra errores, graba el registro. 
1. Regresa a la vista principal del Módulo Organización.
1. Fin del proceso. 
5. Si elige ELIMINAR: 
1. El  usuario  posicionado  en  la  Organización  a  eliminar presiona  el  ícono “tacho” 
1. El sistema valida que la Organización a eliminar, no tenga información en sus  niveles inferiores, y sólo en este caso, muestra una ventana para pedir confirmación de eliminación de la Organización y sus niveles  inferiores asociados,  de  lo  contrario,  muestra  el  mensaje  de  impedimento  de eliminación:  “La  Organización  tiene  información  asociada  que  debe eliminar antes” 
1. De no haber impedimento, efectúa la eliminación del registro.
1. Termina el proceso. 

<a name="_page25_x82.00_y588.00"></a>**Caso de uso: CRUD de una Unidad Organizativa** 

**Actor:** Usuario 

**Descripción:** Opciones de mantenimiento general de la información de las Unidades Organizativas** 

**Flujo Principal:** 

1. El usuario ingresa al Módulo  UNIDADES ORGANIZATIVAS 
1. Elige entre las opciones “Crear”, “Consultar”, “Actualizar”, “Eliminar” 



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>

2\.1. En todas las opciones, el sistema muestra los datos según definición de los 

datos  de  la  Tabla  documentados  en  la  sección  10.  T[abla  Unidad Organizativa. ](#_page100_x82.00_y140.00)

3. Si elige CREAR: 
1. Presiona el ícono “+” (adicionar) 
1. El sistema muestra los datos a ingresar.
1. Si  los  datos  obligatorios  fueron  ingresados  correctamente,  pide confirmación  para  grabar,  si  hay  datos  errados  o  faltan,  pide  sean completados. 
1. Si la información está completa, el usuario confirma presionando el botón “grabar”, el sistema graba el registro.
1. Regresa a la vista principal del Módulo Unidades Organizativas 
1. Termina el proceso. 
4. Si elige CONSULTAR: 
1. El usuario da clic o enter sobre la línea de la Unidad Organizativa.  
1. El  sistema  muestra  los  datos  que  tiene  registrados  de  la  Unidad Organizativa, sin posibilidad de cambios. 
1. El usuario termina la consulta, presionando ESC o el botón “salir”.
1. Regresa a la vista principal del Módulo Unidades Organizativas. 
1. Termina el proceso. 
5. Si elige ACTUALIZAR: 
1. El usuario presiona el ícono “editar” en la  Unidad Organizativa que desea modificar. 
1. El  sistema  muestra  los  datos  modificables  disponibles  para  cambio  y muestra protegidos los datos que por estructura del sistema no pueden ser alterados. 
1. El usuario efectúa las modificaciones y presiona “grabar” 
1. Si  el  sistema  encuentra  errores,  resalta  la  información  errada  y  pide corrección. 
1. Si la información es correcta, graba el registro, si el usuario eligió “nueva versión”, cambia el estado de la versión actual a “No vigente” y crea la nueva con estado “Vigente” de lo contrario sólo actualiza sobre la versión actual
1. Regresa a la vista principal del Módulo Unidades Organizativas.
1. Fin del proceso. 
6. Si elige ELIMINAR: 



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



1. El usuario posicionado en la  Unidad Organizativa a eliminar presiona el ícono “tacho” 
1. El  sistema  valida  que  la  Unidad  Organizativa  a  eliminar,  no  tenga información en sus niveles inferiores (Posiciones, Personas, Posiciones de Personas),  y  sólo  en  este  caso,  muestra  una  ventana  para  pedir confirmación  de  eliminación  incluyendo  sus  niveles  inferiores,  de  lo contrario, muestra el mensaje de impedimento de eliminación: “La Unidad Organizativa tiene información asociada que debe eliminar antes”
1. Si la información es correcta, el sistema efectúa el cambio de estado del registro a “No vigente” 
1. Fin del proceso. 

**Caso de Uso**  

<a name="_page27_x82.00_y358.00"></a>**Caso de uso: CRUD de una Posición** 

**Actor:** Usuario 

**Descripción:**  Opciones  de  mantenimiento  general  de  la  información  de  las POSICIONES.** 

**Flujo Principal:** 

1. El usuario ingresa al Módulo POSICIONES. 
1. Elige entre las opciones “Crear”, “Consultar”, “Actualizar”, “Eliminar”

   2\.1. En todas las opciones, el sistema muestra los datos según definición de 

los datos de la Tabla documentados en la sección 10. Tab[la POSICIONES. ](#_page101_x82.00_y240.00)

3. Si elige CREAR: 
1. Presiona el ícono “+” (adicionar) 
1. El sistema muestra los datos a ingresar.
1. Si  los  datos  obligatorios  fueron  ingresados  correctamente,  pide confirmación  para  grabar,  si  hay  datos  errados  o  faltan,  pide  sean completados. 
1. Si la información está completa, el usuario confirma presionando el botón “grabar”, el sistema graba el registro.
1. Regresa a la vista principal del Módulo Posiciones. 
1. Termina el proceso. 
4. Si elige CONSULTAR: 



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



1. El usuario da clic o enter sobre la línea de la Posición a consultar.  
1. El  sistema  muestra  los  datos  que  tiene  registrados  de  la  Posición,  sin posibilidad de cambios. 
1. El usuario termina la consulta, presionando ESC o el botón “salir”.
1. Regresa a la vista principal del Módulo Posiciones. 
1. Termina el proceso. 
5. Si elige ACTUALIZAR: 
1. El usuario presiona el ícono “editar” en la Posición que desea modificar. 
1. El  sistema  muestra  los  datos  modificables  disponibles  para  cambio  y muestra protegidos los datos que por estructura del sistema no pueden ser alterados. 
1. El  usuario  efectúa  las  modificaciones  y  confirma  la  actualización presionando el botón “grabar” 
1. Si el sistema encuentra errores, resalta la información a corregir.
1. Si el sistema no encuentra errores, graba el registro, si el usuario eligió crear una nueva versión, cambia a “No vigente” la posición actual y crea una nueva en estado “Vigente”  
1. Regresa a la vista principal del Módulo Posiciones. 
1. Fin del proceso. 
6. Si elige ELIMINAR: 
1. El usuario posicionado en la Posición a eliminar presiona el ícono “tacho”
1. El sistema valida que la  Posición a eliminar, no tenga información en sus niveles inferiores (Personas, Posiciones de Personas), y sólo en este caso, muestra  una  ventana  para  pedir  confirmación  de  eliminación,  de  lo contrario, muestra el mensaje de impedimento de eliminación: “La Posición tiene información asociada que debe eliminar antes”
1. De proceder la eliminación, efectúa el cambio de estado del registro a “No vigente”. 
1. Fin del proceso. 

<a name="_page28_x82.00_y662.00"></a>**Caso de uso: CRUD de una Persona** 

**Actor:** Usuario 

**Descripción:** Opciones de mantenimiento general de la información de las PERSONAS.** 



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>

**Flujo Principal:** 

1. El usuario ingresa al Módulo PERSONAS. 
1. Elige entre las opciones “Crear”, “Consultar”, “Actualizar”, “Eliminar”

   2\.1. En todas las opciones, el sistema muestra los datos según definición de los datos de la Tabla documentados en la sección 10. Ta[bla PERSONAS. ](#_page102_x82.00_y488.00)

3. Si elige CREAR: 
1. Presiona el ícono “+” (adicionar) 
1. El sistema muestra los datos a ingresar.
1. Si  los  datos  obligatorios  fueron  ingresados  correctamente,  pide confirmación  para  grabar,  si  hay  datos  errados  o  faltan,  pide  sean completados. 
1. Si la información está completa, el usuario confirma presionando el botón “grabar”, el sistema graba el registro.
1. Regresa a la vista principal del Módulo Personas. 
1. Termina el proceso. 
4. Si elige CONSULTAR: 
1. El usuario da clic o enter sobre la línea de la Persona a consultar.  
1. El  sistema  muestra  los  datos  que  tiene  registrados  de  la  Persona,  sin posibilidad de cambios. 
1. El usuario termina la consulta, presionando ESC o el botón “salir”.
1. Regresa a la vista principal del Módulo Personas. 
1. Termina el proceso. 
5. Si elige ACTUALIZAR: 
1. El usuario presiona el ícono “editar” en la Persona que desea modificar. 
1. El  sistema  muestra  los  datos  modificables  disponibles  para  cambio  y muestra protegidos los datos que por estructura del sistema no pueden ser alterados. 
1. El usuario efectúa las modificaciones
1. Confirma la actualización presionando el botón “grabar”,  Si hay errores, resalta los datos a corregir. 
1. Si el sistema no encuentra errores, graba el registro con una nueva versión 

   (si así lo ha decidido el usuario), si es una nueva versión, la anterior queda “No vigente” y la nueva con estado “Vigente”. 

6. Regresa a la vista principal del Módulo Personas. 
6. Fin del proceso. 

<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>

6. Si elige ELIMINAR: 
1. El usuario posicionado en la Persona a eliminar presiona el ícono “tacho”
1. El sistema valida que la Persona a eliminar, no tenga información en su nivel inferior (Posiciones de Personas), y sólo en este caso, muestra una ventana para pedir confirmación de eliminación, de lo contrario, muestra el mensaje de impedimento de eliminación: “La Persona tiene información asociada que debe eliminar antes” 
1. Si  no  hay  impedimento,  efectúa  el  cambio  de  estado  al  registro  a “No vigente”. 
1. Fin del proceso. 

<a name="_page30_x82.00_y316.00"></a>**Caso de uso: CRUD de una Posición de Persona** 

**Actor:** Usuario 

**Descripción:** Opciones de mantenimiento general de la información de las POSICIONES DE PERSONAS en la organización.** 

**Flujo Principal:** 

1. El usuario ingresa al Módulo  POSICIONES DE PERSONAS. 
1. Elige entre las opciones “Crear”, “Consultar”, “Actualizar”, “Eliminar”

   2\.1. En todas las opciones, el sistema muestra los datos según definición de los 

datos  de  la  Tabla  documentados  en  la  sección  10.  [Tabla  PERSONAS POSICIÓN.](#_page104_x82.00_y115.00) 

3. Si elige CREAR: 
1. Presiona el ícono “+” (adicionar) 
1. El sistema muestra los datos a ingresar.
1. Si  los  datos  obligatorios  fueron  ingresados  correctamente,  pide confirmación  para  grabar,  si  hay  datos  errados  o  faltan,  pide  sean completados. 
1. Si la información está completa, el usuario confirma presionando el botón “grabar”, el sistema graba el registro.  
1. Regresa a la vista principal del Módulo Posiciones de Personas. 
1. Termina el proceso.  
4. Si elige CONSULTAR: 
1. El usuario da clic o enter sobre la línea de la Posición de Persona a consultar.  



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



2. El sistema muestra los datos que tiene registrados de la Posición-Persona, sin posibilidad de cambios. 
2. El usuario termina la consulta, presionando ESC o el botón “salir”.
2. Regresa a la vista principal del Módulo Posiciones de Personas. 
2. Termina el proceso. 
5. Si elige ACTUALIZAR: 
1. El  usuario  presiona  el  ícono “editar”  en  la  Posición-Persona  que  desea modificar. 
1. El  sistema  muestra  los  datos  modificables  disponibles  para  cambio  y muestra protegidos los datos que por estructura del sistema no pueden ser alterados. 
1. El usuario efectúa las modificaciones. 
1. Confirma la actualización presionando el botón “grabar”, si el sistema no encuentra errores, graba el registro, de lo contrario resalta la información errada. 
1. Regresa a la vista principal del Módulo Posiciones de Personas. 
1. Fin del proceso. 
6. Si elige ELIMINAR: 
1. El usuario posicionado en la Persona a eliminar presiona el ícono “tacho”
1. El sistema muestra una ventana para pedir confirmación de eliminación. 
1. Si el usuario confirma, el sistema  cambia el estado de la persona a “No vigente”, actualiza los datos de auditoría de modificación. 
1. Fin del proceso. 

<a name="_page31_x82.00_y560.00"></a>**Caso de uso: Carga del Organigrama desde Excel** 

**Actor: Usuario** 

**Descripción:** Esta opción permite al usuario cargar  o modificar  el Organigrama a partir de  dos Excel con la información a procesar en la que por cada línea de información  el  usuario  ha  definido  que  acción  desea  tomar  con  esa  parte  del organigrama. 

El Excel está compuesto por la pestaña: 



|**Nombre de pestaña** |**Requisito** |**Contenido** |
| :- | - | - |



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



|Carga masiva  |Obligatorio |Información para la carga masiva correspondiente a carga  o  modificación  de  Organizaciones,  Unidades Organizativas, Posiciones y Personas|
| - | - | - |
||||
**13 jun** 

Se cargarán en forma manual e individual todas las posiciones adicionales que pueden tener las personas en la organización. 

**25 jun** 

Se modifica la estructura Excel de carga masiva para considerar tener un “Indicador” que automatice la creación del Usuario para los casos en que se active esta opción. 

**Flujo Principal:** 

1. El usuario ingresa al Módulo  ORGANIZACIÓN. 
1. Elige la opción “Carga Masiva” 
1. Selecciona de algún directorio de la red o del equipo el archivo a cargar  que debe estar en el formato detallado en el Anexo “Fo[rmato de carga masiva - Organigrama” ](https://optimussp-my.sharepoint.com/personal/martin_grillo_optimussp_com/Documents/Hualcan/Excel%20de%20carga%20masiva%20-%20Organigrama.xlsx)y en el Anexo “[Formato de carga masiva – Posiciones adicionales”. ](#_page107_x82.00_y293.00)
1. El sistema pide confirmación para cargar el Excel con el organigrama. 
1. El sistema ordena la información  de las dos pestañas  en el siguiente orden: Organización, Unidades Organizativas, Posiciones, Personas.
1. El sistema  consistencia que cada columna del Excel cumpla con los criterios definidos en la sección 10. F[ormato de carga masiva Organigrama y Fo](#_page104_x82.00_y560.00)[rmato de carga masiva – Posiciones adicionales. ](#_page107_x82.00_y293.00)
1. Si  las  columnas  tienen  errores  de  formato,  devuelve  en  pantalla  todos  los errores generales de formato encontrados para la corrección del Excel. 
1. Si  las  columnas  no  tienen  errores  de  formato, continúa  con  el  proceso de validación de acuerdo con la “acción” solicitada por el usuario en cada línea del Excel y de acuerdo con lo descrito en los numerales 15, 16, 17 y 18 de este caso 

   de uso que aplican para las dos pestañas.

9. Al finalizar la validación de todas las líneas del Excel, muestra las líneas en pantalla con el resultado individual 
9. El usuario tendrá la posibilidad de hacer cambios en línea
9. El usuario confirmará la carga, presionando el botón “cargar”



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



12. El sistema procede con la carga masiva del nuevo organigrama, para ello debe cambiar el estado de la versión actual a “No vigente” y crear una nueva versión de este con el estado “Vigente”. 
12. Genera un nuevo Excel  con las dos pestañas  que incluye las modificaciones realizadas en línea por el usuario.
12. Termina el proceso de carga masiva.
12. **Si la Acción de la línea del Excel es “Crear”:** 
1. Si el “Nivel Org A” tiene contenido, procede a validar la información de acuerdo con los criterios definidos  en la  sección 10. [Formato de carga masiva de Organigrama. ](#_page104_x82.00_y560.00)
1. Si  no  hay  errores,  deja  listo  el  registro  para  crear  la  entidad (Organización o Unidad Organizativa) 
1. Si  hay  errores,  registra  el  detalle  del  error  en  las  columnas “Respuesta” y “Detalle Respuesta”.
1. Si el “Nivel Org B” tiene contenido, el sistema validará la información de acuerdo con los criterios definidos en la sección 10.  [Formato de carga masiva  de  Organigrama  ](#_page104_x82.00_y560.00)o  [Formato  de  carga  masiva  –  Posiciones adicionales. ](#_page107_x82.00_y293.00)
1. Si no hay errores, deja listo el registro para crear la entidad (Rol o Persona) 
1. Si  hay  errores,  registra  el  detalle  del  error  en  las  columnas “Respuesta” y “Detalle Respuesta”.
1. Termina la atención de la línea y pasa a la siguiente.
16. **Si la Acción de la línea del Excel es “Modificar”:** 
1. Si el “Nivel Org A” tiene contenido, debe verificar que exista la Entidad y procede a validar la información de acuerdo con los criterios definidos en la sección 10. [Formato de carga masiva de Organigrama. ](#_page104_x82.00_y560.00)
1. Si existe  y  no  hay  errores,  deja  listo  el  registro  para modificar la entidad (Organización o Unidad Organizativa) 
1. Si no existe o hay errores, registra el detalle del error en las columnas “Respuesta” y “Detalle Respuesta”.
1. Si el “Nivel Org B” tiene contenido, debe verificar que exista la Entidad y procede a validar la información de acuerdo con los criterios definidos en la sección 10. [Formato de carga masiva de Organigrama o Fo](#_page104_x82.00_y560.00)[rmato de carga masiva – Posiciones adicionales. ](#_page107_x82.00_y293.00)



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



5. Si existe  y  no  hay  errores,  deja  listo  el  registro para modificar la entidad (Rol o Persona) 
5. Si no existe o hay errores, registra el detalle del error en las columnas “Respuesta” y “Detalle Respuesta”.
5. Termina la atención de la línea y pasa a la siguiente.
17. **Si la Acción de la línea del Excel es “Archivar”:** 
1. Si el “Nivel Org A” tiene contenido, debe verificar que exista la Entidad y procede a validar la información de acuerdo con los criterios definidos en la sección 10. [Formato de carga masiva de Organigrama. ](#_page104_x82.00_y560.00)
1. Si existe, está “Activo” y no hay errores, deja listo el registro para versionar la entidad (Organización o Unidad Organizativa)
1. Si no existe, o está “No vigente” o hay errores, registra el detalle del error en las columnas “Respuesta” y “Detalle Respuesta”.
1. Si el “Nivel Org B” tiene contenido, debe verificar que exista la Entidad y procede a validar la información de acuerdo con los criterios definidos en la sección 10. [Formato de carga masiva de Organigrama o Fo](#_page104_x82.00_y560.00)[rmato de carga masiva – Posiciones adicionales. ](#_page107_x82.00_y293.00)
1. Si existe, está “Activo” y no hay errores, deja listo el registro para versionar la entidad (Rol o Persona) 
1. Si no existe o está “No vigente” o hay errores, registra el detalle del error en las columnas “Respuesta” y “Detalle Respuesta”.
1. Termina la atención de la línea y pasa a la siguiente.
18. **Si la Acción de la línea del Excel es “Eliminar”:** 
1. Si el “Nivel Org A” tiene contenido, debe verificar que exista la Entidad, que  no  tenga  información  asociada  en  sus  niveles  siguientes  (Unidad Organizativa, Posiciones, Personas, Personas-Posiciones)  
1. Si cumple la validación, deja listo el registro para hacer la eliminación lógica del registro. 
1. Si  el  “Nivel  Org  B”  tiene  contenido,  debe  verificar  que  exista  la Entidad,  que  no  tenga  información  asociada  en  sus  niveles  siguientes (Posiciones, Personas, Personas-Posiciones) 
1. Si cumple la validación, deja listo el registro para hacer la eliminación lógica del registro (Cambia el estado a “No vigente”). 
1. Termina la atención de la línea y pasa a la siguiente.



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>

<a name="_page35_x82.00_y115.00"></a>**MÓDULO SISTEMAS:** 

En  la  sección  SISTEMAS,  contamos  con  el  inventario  de  aplicaciones  y herramientas tecnológicas utilizadas en los diferentes procesos de la organización. Esta  información  resulta  crucial,  ya  que,  durante  la  documentación  de  los procesos, cada actividad puede asociarse con los sistemas empleados para su ejecución, lo que proporciona claridad sobre los recursos tecnológicos requeridos y su rol en las operaciones. 

Además, este módulo permite:

- Documentar la jerarquía que existe entre sistemas. 
- Identificar los módulos y el propósito que tiene cada uno de ellos. 
- Proveer datos clave para análisis de impacto ante posibles cambios en los sistemas o interrupciones, apoyando la continuidad operativa.
- Servir como base para la capacitación de personal, ayudando a identificar qué  sistemas  deben  dominar  los  colaboradores  involucrados  en  cada proceso. 

En resumen, el Módulo Sistemas no solo documenta qué aplicaciones se emplean, sino que también constituye una herramienta estratégica para la gestión eficiente y alineada de los recursos tecnológicos con los objetivos de la organización.

Como  complemento  en  este  Módulo  se  ha  incorporado  la  ubicación  física  del Sistema, es decir, cual es el Servidor que lo aloja. Los datos básicos necesarios 

para los Servidores son: Nombre del Servidor, Tipo, Ambiente,  Sistema Operativo, dirección IP, Estado, Fecha de creación.

**Roles y Permisos:** Los roles y usuarios con acceso a este módulo son obtenidos de lo que se haya configurado en el módulo “Usuarios y Perfiles”. 

<a name="_page35_x82.00_y596.00"></a>**Caso de uso: CRUD para la Tabla de SISTEMAS** 

**Actor:** Usuario 

**Descripción:** Define el comportamiento de las opciones de mantenimiento de la información de los Sistemas de la Organización.  

**Flujo Principal:** 

1. El usuario ingresa al Módulo SISTEMAS 
1. Elige entre las opciones “Crear”, “Consultar”, “Actualizar”, “Eliminar” 



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



3. En todas las opciones, el sistema muestra los datos según definición de los datos de la Tabla documentados en la sección 10.  [Tabla SISTEMAS](#_page108_x82.00_y146.00)[ ](#_page109_x82.00_y332.00),[ Tabla SISTEMAS – Módulos y](#_page109_x82.00_y332.00)[ Tabla – Relaciones a sistemas de gestión. ](#_page132_x82.00_y140.00)
3. Si elige CREAR: 
   1. Presiona el ícono “+” (adicionar) 
   1. El sistema muestra los datos a ingresar.
   1. Si  los  datos  obligatorios  fueron  ingresados  correctamente,  pide confirmación para grabar, si hay datos errados o faltan, pide sean completados. 
   1. Si la información está completa, el usuario confirma presionando el botón “grabar”, el sistema graba el registro.
   1. Regresa a la vista principal del Módulo SISTEMAS. 
   1. Termina el proceso. 
3. Si elige CONSULTAR: 
   1. El usuario da clic o enter sobre la línea de la Posición de  Sistema  a consultar.  
   1. El sistema muestra los datos que tiene registrados del Sistema, sin posibilidad de cambios. 
   1. El usuario termina la consulta, presionando ESC o el botón “salir”.
   1. Regresa a la vista principal del Módulo Sistemas. 
   1. Termina el proceso. 
3. Si elige ACTUALIZAR: 
   1. El  usuario  presiona  el  ícono  “editar”  en  el  Sistema  que  desea modificar. 
   1. El sistema muestra los datos modificables disponibles para cambio y muestra  protegidos  los  datos  que  por  estructura  del  sistema  no pueden ser alterados.
   1. El usuario efectúa las modificaciones.
   1. Confirma  la  actualización  presionando  el  botón  “grabar”,  si  el sistema no encuentra errores, graba el registro, de lo contrario resalta la información errada. 
   1. Regresa a la vista principal del Módulo Sistemas. 
   1. Fin del proceso. 
7. Si elige ELIMINAR: 
1. El usuario posicionado en  el Sistema  a eliminar presiona el ícono “tacho” 
1. El  sistema  muestra  una  ventana  para  pedir  confirmación  de eliminación. 



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



3. Si el usuario confirma, el sistema cambia el estado a “Anulado”. 
3. Fin del proceso. 

**Post condiciones:**  

- El proceso queda registrado y visible para los usuarios autorizados. 
- Todos los registros en estado “Anulado” no son visibles en las opciones regulares del sistema, únicamente se pueden ver si accedemos a la opción de “Anulados”. 

<a name="_page37_x82.00_y272.00"></a>**Caso de uso: Carga de los Activos de SISTEMAS desde Excel** 

**Actor: Usuario** 

**Descripción:**  Esta  opción  permite  al  usuario  cargar  o  modificar  la  Tabla  de Sistemas a partir de un Excel con la información a procesar en la que por cada línea 

de información el usuario ha definido que acción desea tomar con  el activo de sistema. 

El Excel está compuesto por una pestaña: 



|**Nombre de pestaña** |**Requisito** |**Contenido** |
| :- | - | - |
|Carga Sistemas |Obligatorio |Información para la carga masiva correspondiente a carga o modificación de los sistemas existentes en la organización |

**Flujo Principal:** 

1. El usuario ingresa al Módulo  ACTIVOS DE SISTEMAS. 
1. Elige la opción “Carga Masiva” 
1. Selecciona de algún directorio de la red o del equipo el archivo a cargar que debe estar en el formato detallado en el Anexo “Fo[rmato de carga masiva  - SISTEMAS”](#_page109_x82.00_y638.00).  
1. El sistema pide confirmación para cargar el Excel.
1. El sistema procesará la información en el orden que viene ordenado el Excel. 
1. El sistema consistencia que cada columna del Excel cumpla con los criterios definidos en el anexo [Formato de carga masiva Sistemas. ](#_page109_x82.00_y638.00)
1. Si  las  columnas  tienen  errores  de  formato,  devuelve  en  pantalla  todos  los errores generales de formato encontrados para la corrección del Excel.



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



8. Si las columnas no tienen errores de formato, continúa con  la validación de acuerdo con la “acción” solicitada por el usuario en cada línea del Excel y de acuerdo con lo descrito en los numerales 15, 16, 17 y 18 de este caso de uso. 
8. Al finalizar la validación de todas las líneas del Excel, muestra las líneas en pantalla con el resultado individual. 
8. El usuario tendrá la posibilidad de hacer cambios en línea
8. El usuario confirmará la carga, presionando el botón “cargar” 
8. El sistema procede  a re validar los cambios que se hicieron, si hay errores, mostrará el mensaje de error para la corrección, si todo OK,  procederá con la carga masiva de los sistemas, para ello  tendrá en cuenta que en el caso de la acción “Modificar” debe cambiar el estado de la versión actual a “No vigente” y crear una nueva versión de este con el estado “Vigente”.
8. Genera un nuevo Excel que incluye las modificaciones realizadas en línea por el usuario. 
8. Termina el proceso de carga masiva.
8. **Si la Acción de la línea del Excel es “Crear”:** 
1. Valida de acuerdo con las especificaciones del Fo[rmato de  carga masiva – Sistemas ](#_page109_x82.00_y638.00)
1. Si no hay errores, deja listo el registro para crear la entidad Sistema. 
1. Si  hay  errores,  registra  el  detalle  del  error  en  las  columnas “Respuesta” y “Detalle Respuesta”.
1. Termina la atención de la línea y pasa a la siguiente.
16. **Si la Acción de la línea del Excel es “Modificar”:** 
1. Debe verificar que exista la Entidad y procede a validar la información de acuerdo con los criterios definidos en el anexo Fo[rmato de carga masiva ](#_page109_x82.00_y638.00)
   1. [Sistemas.  ](#_page109_x82.00_y638.00)
1. Si  existe  y  no  hay  errores,  deja  listo  el  registro  para  modificar  la entidad Sistemas. 
1. Si no existe o hay errores, registra el detalle del error en las columnas “Respuesta” y “Detalle Respuesta”.
1. Termina la atención de la línea y pasa a la siguiente.
17. **Si la Acción de la línea del Excel es “Archivar”:** 
1. Debe verificar que exista la Entidad y procede a validar la información de acuerdo con los criterios definidos en el anexo Fo[rmato de carga masiva ](#_page109_x82.00_y638.00)
- [Sistemas.  ](#_page109_x82.00_y638.00)



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



2. Si existe, está “Activo” y no hay errores, deja listo el registro para versionar la entidad Sistema. 
2. Si no existe, o está “No vigente” o hay errores, registra el detalle del error en las columnas “Respuesta” y “Detalle Respuesta”.
2. Termina la atención de la línea y pasa a la siguiente.
18. **Si la Acción de la línea del Excel es “Eliminar”:** 
1. Debe  verificar  que  exista  la  Entidad,  que  no  esté  referencia  en Actividades de procesos.  
1. Si cumple la validación, deja listo el registro para hacer la eliminación lógica del registro (Cambia el estado a “No vigente”).
1. Termina la atención de la línea y pasa a la siguiente.

<a name="_page39_x82.00_y355.00"></a>**Módulo ACTIVOS DE DATA:** 

El Módulo DATA o de Gobierno de Datos es la sección preparada para gestionar la administración,  responsabilidad  y  control  sobre  los  datos  de  la  organización, estructurados  según  tipos  de  entidades  específicas.  Este  módulo  establece  y documenta  qué  roles  dentro  de  la  organización  tienen  la  autoridad  y responsabilidad para  administrar, validar y actualizar la información, asegurando que los datos sean precisos, consistentes y estén alineados con los estándares organizacionales y normativos. 

**Roles y Permisos:** Los roles y usuarios con acceso a este módulo son obtenidos de lo que se haya configurado en el módulo “Usuarios y Perfiles”

<a name="_page39_x82.00_y555.00"></a>**Caso de uso: CRUD para la Tabla de ACTIVOS DE DATA** 

**Actor:** Usuario. 

**Descripción:** Define el comportamiento de las opciones de mantenimiento de la información de gobierno de datos.  

**Flujo Principal:** 

1. El usuario ingresa al Módulo  ACTIVOS DE DATA 
1. Elige entre las opciones “Crear”, “Consultar”, “Actualizar”, “Eliminar” 
1. En todas las opciones, el sistema muestra los datos según definición de los datos de la Tabla documentados en la sección 10. AC[TIVOS DE DATA y Ta](#_page122_x82.00_y178.00)[bla ](#_page132_x82.00_y140.00)
- [Relaciones a sistemas de gestión. ](#_page132_x82.00_y140.00)



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>

4. Si elige CREAR: 
1. Presiona el ícono “+” (adicionar) 
1. El sistema muestra los datos a ingresar.
1. Si  los  datos  obligatorios  fueron  ingresados  correctamente,  pide confirmación para grabar, si hay datos errados o faltan, pide sean completados. 
1. Si la información está completa, el usuario confirma presionando el botón “grabar”, el sistema graba el registro.
1. De elegir el usuario iniciar el proceso de aprobación, se activará el proceso descrito en la sección:  [WORKFLOW DE APROBACIÓN DE](#_page80_x204.00_y182.00) [CAMBIOS.](#_page80_x204.00_y182.00)  
1. De llegar a la aprobación final, efectúa la creación del registro.
1. Regresa a la vista principal del Módulo Activos de Data. 
1. Termina el proceso. 

5\.  Si elige CONSULTAR: 

1. El usuario da clic o enter sobre la línea del Activo de Data a consultar.  
1. El sistema muestra los datos que tiene registrados del activo de data, sin posibilidad de cambios. 
1. El usuario termina la consulta, presionando ESC o el botón “salir”.
1. Regresa a la vista principal del Módulo Activos de Data. 
1. Termina el proceso. 
6. Si elige ACTUALIZAR: 
1. El usuario presiona el ícono “editar” en el  Activo de data  que desea modificar. 
1. El sistema muestra los datos modificables disponibles para cambio y muestra  protegidos  los  datos  que  por  estructura  del  sistema  no pueden ser alterados.
1. El usuario efectúa las modificaciones y registra si desea hacer un cambio de versión. 
1. Confirma  la  actualización  presionando  el  botón  “grabar”,  si  el sistema no encuentra errores, continúa con el proceso. 
1. Graba el registro. 
1. De elegir el usuario iniciar el proceso de aprobación del cambio, se activará  el  proceso  descrito  en  la  sección:  [WORKFLOW  DE](#_page80_x204.00_y182.00) [APROBACIÓN DE CAMBIO](#_page80_x204.00_y182.00)S[.](#_page80_x204.00_y182.00)  



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



7. Si  la  respuesta  final  del  workflow  de  aprobación  es  “aprobado”, procede hacer los cambios de estado para proceder a la publicación del cambio. 
7. Regresa a la vista principal del Módulo de Activos de Data. 
7. Fin del proceso. 

7\.  Si elige Eliminar: 

1. El usuario posicionado en el  Activo de Data  a eliminar presiona el ícono “tacho” 
1. El  sistema  muestra  una  ventana  para  pedir  confirmación  de eliminación. 
1. Si confirma, se inicia el proceso de aprobación de la eliminación mediante la activación d el proceso [ WORKFLOW DE APROBACIÓN DE](#_page80_x204.00_y182.00) [CAMBIOS.](#_page80_x204.00_y182.00)  
1. Si  la  respuesta  final  del  workflow  de  aprobación  es  “aprobado”, procede a hacer los cambios de estado para proceder a cambiar el estado del registro a “No vigente”. 
1. Regresa a la vista principal del Módulo de Activos de Data.
1. Fin del proceso. 

**Post condiciones:**  

- El proceso queda registrado y visible para los usuarios autorizados.
- Todos los registros en estado “No vigente” no son visibles en las opciones regulares del sistema, únicamente se pueden ver si accedemos a la opción de “Historial de versiones” del activo de data seleccionado.

<a name="_page41_x82.00_y569.00"></a>**Caso de uso:** Carga de los Activos de DATA desde Excel 

**Actor: Usuario** 

**Descripción:** Esta opción permite al usuario cargar o modificar la Tabla de Activos de DATA a partir de un Excel con la información a procesar en la que por cada línea de información el usuario ha definido que acción desea tomar con el activo de Data. 

El Excel está compuesto por una pestaña:



|**Nombre de pestaña** |**Requisito** |**Contenido** |
| :- | - | - |



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



|Carga DATA |Obligatorio |Información para la  carga masiva correspondiente a carga o modificación de los Activos de Data existentes en la organización |
| - | - | - |

**Flujo Principal:** 

1. El usuario ingresa al Módulo ACTIVOS DE DATA. 
1. Elige la opción “Carga Masiva” 
1. Selecciona de algún directorio de la red o del equipo el archivo a cargar que debe estar en el formato detallado en el Anexo “Fo[rmato de carga masiva  – Activos de DATA”](#_page122_x82.00_y712.00).  
1. El sistema pide confirmación para cargar el Excel.
1. El sistema procesará la información en el orden que viene ordenado el Excel.
1. El sistema consistencia que cada columna del Excel cumpla con los criterios definidos en el anexo [Formato de carga masiva - Activos de DATA. ](#_page122_x82.00_y712.00)
1. Si  las  columnas  tienen  errores  de  formato,  devuelve  en  pantalla  todos  los errores generales de formato encontrados para la corrección del Excel.
1. Si las columnas no tienen errores de formato, continúa con la validación de acuerdo con la “acción” solicitada por el usuario en cada línea del Excel y de acuerdo con lo descrito en los numerales 15, 16, 17 y 18 de este caso de uso.
1. Al finalizar la validación de todas las líneas del Excel, muestra las líneas en pantalla con el resultado individual.
1. El usuario tendrá la posibilidad de hacer cambios en línea
1. El usuario confirmará la carga, presionando el botón “cargar”
1. El sistema procede  a re validar los cambios que se hicieron, si hay errores, mostrará el mensaje de error para la corrección, si todo OK, procederá  con la carga masiva de los Activos de Data, para ello  tendrá en cuenta que en el caso de  la acción  “Modificar” debe  cambiar el estado de la versión actual a “No vigente” y crear una nueva versión de este con el estado “Vigente”.
1. Genera un nuevo Excel que incluye las modificaciones realizadas en línea por el usuario. 
1. Termina el proceso de carga masiva.
1. **Si la Acción de la línea del Excel es “Crear”:** 
1. Valida de acuerdo con las especificaciones del  [Formato de carga masiva Activos de DATA ](#_page109_x82.00_y638.00)
1. Si no hay errores, deja listo el registro para crear la entidad Activos de Data. 
1. Si  hay  errores,  registra  el  detalle  del  error  en  las  columnas “Respuesta” y “Detalle Respuesta”.



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>

4. Termina la atención de la línea y pasa a la siguiente.
16. **Si la Acción de la línea del Excel es “Modificar”:** 
1. Debe verificar que exista la Entidad y procede a validar la información de acuerdo con los criterios definidos en el anexo Fo[rmato de carga masiva Activos de DATA.](#_page122_x82.00_y712.00)  
1. Si existe y no hay errores, deja listo el registro para modificar la entidad. 
1. Si no existe o hay errores, registra el detalle del error en las columnas “Respuesta” y “Detalle Respuesta”.
1. Termina la atención de la línea y pasa a la siguiente.
17. **Si la Acción de la línea del Excel es “Archivar”:** 
1. Debe verificar que exista la Entidad y procede a validar la información de acuerdo con los criterios definidos en el anexo Fo[rmato de carga masiva Activos de DATA.](#_page122_x82.00_y712.00)  
1. Si existe, está “Activo” y no hay errores, deja listo el registro para versionar la entidad. 
1. Si no existe, o está “No vigente” o hay errores, registra el detalle del error en las columnas “Respuesta” y “Detalle Respuesta”.
1. Termina la atención de la línea y pasa a la siguiente.
18. **Si la Acción de la línea del Excel es “Eliminar”:** 
1. Debe  verificar  que  exista  la  Entidad,  que  no  esté  referenciada en Actividades de procesos.  
1. Si cumple la validación, deja listo el registro para hacer la eliminación lógica del registro (Cambia el estado a “No vigente”).
1. Termina la atención de la línea y pasa a la siguiente.

<a name="_page43_x82.00_y583.00"></a>**Módulo DOCUMENTOS:** 

El **Módulo de Documentos** es una herramienta central dentro de la app de gestión 

por  procesos,  su  diseño  está  pensado  para  gestionar  y  organizar  de  manera eficiente todos los documentos relacionados con los procesos de la organización. Este módulo permite centralizar, estructurar y relacionar cada documento clave 

con  los  procesos  operativos  y  estratégicos,  asegurando  su  accesibilidad  y trazabilidad. 



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>

El  objetivo  principal  del  módulo  es  garantizar  que  la  información  documental necesaria para la ejecución de los procesos esté siempre disponible, actualizada y asociada al flujo correspondiente. Esto incluye la gestión de:

- **Políticas:** Directrices  organizacionales  que  rigen  el  comportamiento  y  la toma de decisiones. 
- **Normas:** Leyes,  Decretos,  Resoluciones, Estándares, que  establecen  los criterios de funcionamiento de las operaciones o de cumplimiento. 
- **Procedimientos:**  Descripciones  detalladas  de  actividades  específicas dentro de los procesos.
- **Formularios:** Plantillas utilizadas en la recolección o captura de información dentro de los procesos.

**Características Clave:** 

1. **Gestión Documental Centralizada:** 

   Reúne todos los documentos en un repositorio único, categorizados según su relación con los procesos de la organización y el gobierno de datos. 

2. **Relación con los Procesos:**

   Cada  documento  puede  vincularse  a  uno  o  más  procesos,  actividades específicas o roles, asegurando su correcta asociación y disponibilidad.

3. **Versionamiento y Control de Cambios:** 

   Permite mantener un historial de versiones, identificando qué cambios se realizaron, quién los autorizó y en qué fecha.

4. **Accesibilidad y Seguridad:** 

   Gestiona el acceso a los documentos según roles y permisos definidos, protegiendo  la  información  sensible  y  garantizando  que  solo  usuarios autorizados puedan realizar modificaciones.

5. **Cumplimiento Normativo:** 

   Facilita  la  alineación  con  marcos  regulatorios  y  estándares  de  calidad, mediante la documentación adecuada y actualizada de políticas y normas.

6. **Búsqueda y Filtrado:** 

   Ofrece  herramientas  de  búsqueda  avanzada  que  permiten  localizar documentos rápidamente mediante palabras clave, categorías o procesos relacionados. 

Una ayuda de posibles intersecciones entre documentos (busca se mantenga la integridad entre  políticas que  se  relacionan entre  sí).  Que  se  pueda  ver  si  el documento toca puntos que están descritos en otros documentos.



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>

La búsqueda abarca ubicación en títulos y el contenido de los documentos, por ej.: “Que políticas hablan de catástrofes” y que el sistema muestre los documentos que en su título o contenido mencionan el tema. 

**Beneficios** 

- Mejora la eficiencia operativa al garantizar que los equipos tengan acceso rápido a la información relevante. 
- Reduce el riesgo de errores o incumplimientos al contar con documentación actualizada y vinculada a los procesos.
- Fortalece la transparencia y la rendición de cuentas al mantener registros claros de las políticas y procedimientos. 

El **Módulo de Documentos** se convierte, así, en un componente fundamental para la gestión efectiva de la información documental en la organización, alineando los procesos con los objetivos estratégicos y operativos.

**Roles y Permisos:** Los roles y usuarios con acceso a este módulo son obtenidos de lo que se haya configurado en el módulo “Usuarios y Perfiles”. 

<a name="_page45_x82.00_y429.00"></a>**Caso de uso: CRUD para la Tabla de DOCUMENTOS** 

**Actor:** Usuario  

**Descripción:** Define el comportamiento de las opciones de mantenimiento de los documentos de la organización.**  

**Flujo Principal:** 

1. El usuario ingresa al Módulo DOCUMENTOS. 
1. Elige entre las opciones “Crear”, “Consultar”, “Actualizar”, “Caducar”
1. En todas las opciones, el sistema muestra los datos según definición de los datos de la Tabla documentados en la sección 10. [DOCUMENTOS y Ta](#_page124_x82.00_y115.00)[bla – Relaciones a sistemas de gestión. ](#_page132_x82.00_y140.00)
1. Si elige CREAR: 
1. Presiona el ícono “+” (adicionar) 
1. El sistema muestra los datos a ingresar según definición en  Ta[bla DOCUMENTOS](#_page124_x82.00_y115.00) 
1. Si  los  datos  obligatorios  fueron  ingresados  correctamente,  pide confirmación para grabar, si hay datos errados o faltan, pide sean completados. 



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



4. Si la información está completa, el usuario confirma presionando el botón “grabar”, el sistema graba el registro.
4. De elegir el usuario iniciar el proceso de aprobación, se activará el proceso descrito en la sección:  [WORKFLOW DE APROBACIÓN DE](#_page80_x204.00_y182.00) [CAMBIOS.](#_page80_x204.00_y182.00)  
4. De llegar a la aprobación final, efectúa la creación del registro.
4. Regresa a la vista principal del Módulo Documentos. 
4. Termina el proceso. 

5\.  Si elige CONSULTAR: 

1. El usuario da clic o enter sobre la línea del Documento a consultar.  
1. El sistema muestra los datos que tiene registrados del Documento, sin posibilidad de cambios. 
1. El usuario termina la consulta, presionando ESC o el botón “salir”.
1. Regresa a la vista principal del Módulo Documentos. 
1. Termina el proceso. 
6. Si elige ACTUALIZAR: 
   1. El usuario presiona el ícono “editar” en el  Documento que desea modificar. 
   1. El sistema no altera la versión que está publicada. 
   1. El sistema muestra en una “versión temporal” los datos modificables disponibles  para  cambio  y  muestra  protegidos  los  datos  que  por estructura del sistema no pueden ser alterados.
   1. El usuario efectúa las modificaciones y registra si desea hacer un cambio de versión. 
   1. Confirma  la  actualización  presionando  el  botón  “grabar”,  si  el sistema no encuentra errores, continúa con el proceso.
   1. Graba el registro, hasta aquí como una versión temporal, de la misma versión o de una nueva versión, lo que haya elegido el usuario. 
   1. De elegir el usuario iniciar el proceso de aprobación del cambio, se activará  el  proceso  descrito  en  la  sección:  [WORKFLOW  DE](#_page80_x204.00_y182.00) [APROBACIÓN DE CAMBIO](#_page80_x204.00_y182.00)S[.](#_page80_x204.00_y182.00)  
   1. Si  la  respuesta  final  del  workflow  de  aprobación  es  “aprobado”, procede hacer los cambios de estado (en la versión anterior y versión nueva) para proceder a la publicación del cambio.
   1. Regresa a la vista principal del Módulo de Documentos. 
   1. Fin del proceso. 
6. Si elige Eliminar: 



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



1. El usuario posicionado en el Documento a eliminar presiona el ícono “tacho” 
1. El  sistema  muestra  una  ventana  para  pedir  confirmación  de eliminación. 
1. El sistema cambia el estado del registro a “Anulado”. 
1. Regresa a la vista principal del Módulo de Documentos. 
1. Fin del proceso. 

8\.  Si elige Archivar: 

1. El usuario posicionado en el Documento a eliminar presiona el ícono “archivar” 
1. El  sistema  muestra  una  ventana  para  pedir  confirmación  de archivado. 
1. El sistema cambia el estado del registro a “Archivado”. 
1. Regresa a la vista principal del Módulo de Documentos.
1. Fin del proceso. 

**Pre condiciones:**  

- El usuario debe tener acceso al módulo de documentos
- El usuario debe ser dueño o editor del documento para actualizaciones al documento. 
- El usuario debe ser dueño del documento para eliminación o archivado del documento. 

**Post condiciones:**  

- El proceso queda registrado y visible para los usuarios autorizados.
- Todos los registros en estado “Archivado” o “Anulado” no son visibles en las opciones regulares del sistema, únicamente se pueden ver si accedemos a la opción de “Archivados” o “Eliminados”.  
- El sistema enviará un correo electrónico tomando como destinatarios a los que participaron de la aprobación (si hubo) y a los jefes inmediatos de las personas que participan de las actividades del proceso.

<a name="_page47_x82.00_y678.00"></a>**MÓDULO GESTIÓN DE RIESGOS:** 

El  módulo  de  Gestión  de  Riesgos  permitirá  registrar  y  gestionar  los  riesgos identificados  en  la  organización,  proporcionando  herramientas  para  evaluar  su 



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>

impacto, probabilidad de ocurrencia y medidas de mitigación. Esto facilitará la toma de decisiones informadas y la reducción de riesgos operativos y estratégicos.

El módulo permitirá a los usuarios: 

- Registrar nuevos riesgos asociados a procesos organizacionales.
- Evaluar y clasificar los riesgos según su probabilidad e impacto.
- Definir planes de acción para mitigar o responder a los riesgos.
- Calcular el riesgo residual tras la aplicación de medidas de mitigación.
- Hacer  seguimiento  y  documentar  acciones  finales  sobre  los  riesgos identificados. 

Se identifican los siguientes actores para la Gestión de Riesgos:

- **Administrador  de  Riesgos:**  Responsable  de  la  gestión  global  de  riesgos  y aprobación de planes de acción.
- **Usuarios Autorizados:** Pueden registrar, editar y evaluar riesgos.
- **Auditores:** Pueden visualizar y generar informes sobre la gestión de riesgos.

<a name="_page48_x82.00_y410.00"></a>**Caso de uso: CRUD de Riesgos** 

**Actor:** Dueños de Procesos,** Analista de Riesgos,  **Descripción:** Permitir la gestión de los riesgos.**  

Flujo principal: 

1. El usuario ingresa al Módulo RIESGOS. 
1. Elige entre las opciones “Crear”, “Consultar”, “Actualizar”, “Eliminar” 
1. En todas las opciones, el sistema muestra los datos según definición de los datos de la Tabla documentados en la sección Tabla de Riesgos. 
1. Si elige CREAR: 
1. Presiona el ícono “+” (adicionar) 
1. El sistema muestra los datos a ingresar según definición en  [Tabla RIESGOS y Tabla – Relaciones a sistemas de gestión. ](#_page132_x82.00_y140.00)
1. Si  los  datos  obligatorios  fueron  ingresados  correctamente,  pide confirmación para grabar, si hay datos errados o faltan, pide sean completados. 
1. Si la información está completa, el usuario confirma presionando el botón “grabar”, el sistema graba el registro.



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



5. De elegir el usuario iniciar el proceso de aprobación, se activará el proceso descrito en la sección:  [WORKFLOW DE APROBACIÓN DE](#_page80_x204.00_y182.00) [CAMBIOS.](#_page80_x204.00_y182.00)  
5. De llegar a la aprobación final, efectúa la creación del registro.
5. Regresa a la vista principal del Módulo Documentos.
5. Termina el proceso. 
5. Si elige CONSULTAR: 
   1. El usuario da clic o enter sobre la línea del Riesgo a consultar.  
   1. El sistema muestra los datos que tiene registrados del  Riesgo, sin posibilidad de cambios. 
   1. El usuario termina la consulta, presionando ESC o el botón “salir”.
   1. Regresa a la vista principal del Módulo Gestión de Riesgos. 
   1. Termina el proceso. 
5. Si elige ACTUALIZAR: 
1. El usuario presiona el ícono “editar” en el Riesgo que desea modificar. 
1. El sistema no altera la versión que está publicada.
1. El sistema muestra en una “versión temporal” los datos modificables disponibles  para  cambio  y  muestra  protegidos  los  datos  que  por estructura del sistema no pueden ser alterados.
1. El usuario efectúa las modificaciones y registra si desea hacer un cambio de versión. 
1. Confirma  la  actualización  presionando  el  botón  “grabar”,  si  el sistema no encuentra errores, continúa con el proceso. 
1. Graba el registro, hasta aquí como una versión temporal, de la misma versión o de una nueva versión, lo que haya elegido el usuario.
1. De elegir el usuario iniciar el proceso de aprobación del cambio, se activará  el  proceso  descrito  en  la  sección:  [WORKFLOW  DE](#_page80_x204.00_y182.00) [APROBACIÓN DE CAMBIO](#_page80_x204.00_y182.00)S[.](#_page80_x204.00_y182.00)  
1. Si  la  respuesta  final  del  workflow  de  aprobación  es  “aprobado”, procede hacer los cambios de estado (en la versión anterior y versión nueva) para proceder a la publicación del cambio.
1. Regresa a la vista principal del Módulo de Gestión de Riesgos. 
1. Fin del proceso. 

7\.  Si elige Eliminar: 

1. El  usuario  posicionado  en  el  Riesgo a  eliminar  presiona  el  ícono “tacho” 
1. El  sistema  muestra  una  ventana  para  pedir  confirmación  de eliminación. 

<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



3. El sistema cambia el estado del registro a “Anulado”.
3. Regresa a la vista principal del Módulo de Gestión de Riesgos. 
3. Fin del proceso. 

8\.  Si elige Archivar: 

1. El  usuario  posicionado  en  el  Riesgo a  eliminar  presiona  el  ícono “archivar”. 
1. El  sistema  muestra  una  ventana  para  pedir  confirmación  de archivado. 
1. El sistema cambia el estado del registro a “Archivado”.
1. Regresa a la vista principal del Módulo de Gestión de Riesgos. 
1. Fin del proceso. 

**Pre condiciones:**  

- El usuario debe tener acceso al módulo de Gestión de Riesgos 
- El usuario debe ser dueño o editor del Riesgo para actualizaciones 
- El  usuario  debe  ser  dueño  del  Riesgo  para  eliminación  o  archivado  del documento. 

**Post condiciones:**  

- El Riesgo queda registrado y visible para los usuarios autorizados.
- Todos los registros en estado “Archivado” o “Anulado” no son visibles en las opciones regulares del sistema, únicamente se pueden ver si accedemos a la opción de “Archivados” o “Eliminados”.  

<a name="_page50_x82.00_y525.00"></a>**MÓDULO PLANES DE ACCIÓN:** 

El Módulo de **Planes de Acción** tiene como objetivo centralizar y gestionar todas las  acciones  correctivas,  preventivas  y  de  mejora  derivadas  de  los  diferentes procesos de la organización. Este módulo integra los planes de acción generados en distintos módulos de la “App de Gestión por Procesos”, tales como: 

- **Módulo de Riesgos:** Para mitigar o eliminar riesgos identificados en los procesos. 
- **Módulo de Auditoría:** Para atender hallazgos y recomendaciones de auditorías internas y externas.
- Otros módulos que requieran generar planes de acción, como cumplimiento normativo o mejora continua.



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>

A través de este módulo, se asegura un seguimiento estructurado de las acciones propuestas,  asignando  responsables,  estableciendo  plazos  de  ejecución  y permitiendo el monitoreo en tiempo real del avance de cada plan. Además, facilita la trazabilidad de cada acción, garantizando la documentación y gestión eficiente de la resolución de problemas y oportunidades de mejora dentro de la organización.

![](Aspose.Words.3184fba8-1f57-4373-a4d7-5b011bad4160.008.png)

<a name="_page51_x82.00_y413.00"></a>**Caso de uso: CRUD de Planes de acción** 

**Actor:** Dueños de Procesos,** Analista de Riesgos,** Auditores** 

**Descripción:** Permitir la gestión de los planes de acción de la organización   **Flujo principal:** 

1. El usuario ingresa al Módulo  PLANES DE ACCIÓN. 
1. Elige entre las opciones “Crear”, “Consultar”, “Actualizar”, “Eliminar” 
1. En todas las opciones, el sistema muestra los datos según definición de los datos de la Tabla documentados en la sección  [Tabla de  Planes de acción,  ](#_page114_x82.00_y684.00)[Tabla Planes de acción  - Asociaciones y](#_page116_x82.00_y115.00) [Tabla – Relaciones a Sistemas de gestión. ](#_page132_x82.00_y140.00)
1. Si elige CREAR: 
1. Presiona el ícono “+” (adicionar) 
1. El sistema muestra los datos a ingresar según definición en Tabl[a de Planes de acción, T](#_page114_x82.00_y684.00)[abla Planes de acción  - Asociaciones y T](#_page116_x82.00_y115.00)abla – [Relaciones a Sistemas de gestión. ](#_page132_x82.00_y140.00)
1. Si  los  datos  obligatorios  fueron  ingresados  correctamente,  pide confirmación para grabar, si hay datos errados o faltan, pide sean completados. 



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



4. Si la información está completa, el usuario confirma presionando el botón “grabar”, el sistema graba el registro.
4. De elegir el usuario iniciar el proceso de aprobación, se activará el proceso descrito en la sección:  [WORKFLOW DE APROBACIÓN DE](#_page80_x204.00_y182.00) [CAMBIOS.](#_page80_x204.00_y182.00)  
4. De llegar a la aprobación final, efectúa la creación del registro.
4. Regresa a la vista principal de Planes de Acción. 
4. Termina el proceso. 

5\.  Si elige CONSULTAR: 

1. El usuario da clic o enter sobre la línea del Plan de acción.  
1. El sistema muestra los datos que tiene registrados del Plan de acción, sin posibilidad de cambios. 
1. El usuario termina la consulta, presionando ESC o el botón “salir”.
1. Regresa a la vista principal del Módulo de Planes de acción. 
1. Termina el proceso. 
6. Si elige ACTUALIZAR: 
1. El usuario presiona el ícono “editar” en el Plan de acción que desea modificar. 
1. El sistema no altera la versión que está publicada.
1. El sistema muestra en una “versión temporal” los datos modificables disponibles  para  cambio  y  muestra  protegidos  los  datos  que  por estructura del sistema no pueden ser alterados.
1. El usuario efectúa las modificaciones y registra si desea hacer un cambio de versión. 
1. Confirma  la  actualización  presionando  el  botón  “grabar”,  si  el sistema no encuentra errores, continúa con el proceso.
1. Graba el registro, hasta aquí como una versión temporal, de la misma versión o de una nueva versión, lo que haya elegido el usuario.
1. Ante cambios de datos claves como: Fecha de término, Estado del Plan, Alcance, se requiere obligatoriamente el pase a aprobación.
1. De elegir el usuario iniciar el proceso de aprobación del cambio, se activará  el  proceso  descrito  en  la  sección:  [WORKFLOW  DE](#_page80_x204.00_y182.00) [APROBACIÓN DE CAMBIO](#_page80_x204.00_y182.00)S[.](#_page80_x204.00_y182.00)  
1. Si  la  respuesta  final  del  workflow  de  aprobación  es  “aprobado”, procede hacer los cambios de estado (en la versión anterior y versión nueva) para proceder a la publicación del cambio.
1. Regresa a la vista principal del Módulo de Planes de acción. 
1. Fin del proceso. 



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>

7. Si elige Eliminar: 
   1. El usuario posicionado en el  Plan de acción a eliminar presiona el ícono “tacho” 
   1. El  sistema  muestra  una  ventana  para  pedir  confirmación  de eliminación. 
   1. El sistema cambia el estado del registro a “Anulado”.
   1. Regresa a la vista principal del Módulo de Planes de acción. 
   1. Fin del proceso. 
7. Si elige Archivar: 
1. El usuario posicionado en el  Plan de acción a eliminar presiona el ícono “archivar” 
1. El  sistema  muestra  una  ventana  para  pedir  confirmación  de archivado. 
1. El sistema cambia el estado del registro a “Archivado”.
1. Regresa a la vista principal del Módulo de Planes de acción. 
1. Fin del proceso. 

**Pre condiciones:**  

- El usuario debe tener acceso al módulo de Planes de acción 
- El usuario debe ser dueño o editor del Plan de acción para actualizaciones 
- El usuario debe ser dueño del Plan de acción para eliminación o archivado del documento. 

**Post condiciones:**  

- El Plan de acción queda registrado y visible para los usuarios autorizados.
- Todos los registros en estado “Archivado” o “Anulado” no son visibles en las opciones regulares del sistema, únicamente se pueden ver si accedemos a la opción de “Archivados” o “Eliminados”.  

<a name="_page53_x82.00_y637.00"></a>**Caso de uso: Crear actividad o hacer seguimiento a un Plan de acción** 

**Actor:** Dueños de Procesos,** Analista de Riesgos,** Auditores** 

**Descripción:** Permitir registrar e informar la ejecución de las actividades del Plan de acción.** 

**Flujo principal:** 



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



1. El usuario ingresa al Módulo PLANES DE ACCIÓN. 
1. Elige entre las opciones “Crear actividad” o “Seguimiento”. 
1. El  sistema  muestra  los  datos  según  definición  de  los  datos  de  la  Tabla documentados en la sección Ta[bla actividades programadas y seguimiento. ](#_page117_x82.00_y115.00)
1. Si el usuario elige “Crear actividad” 
   1. Presiona el ícono “+” (adicionar) 
   1. El sistema muestra los datos a ingresar según definición en  [Tabla actividades programadas y seguimiento. ](#_page117_x82.00_y115.00)
   1. Si  los  datos  obligatorios  fueron  ingresados  correctamente,  pide confirmación para grabar, si hay datos errados o faltan, pide sean completados. 
   1. Si la información está completa, el usuario confirma presionando el botón “grabar”, el sistema graba el registro.
   1. Regresa a la vista principal de Planes de Acción. 
   1. Termina el proceso. 
1. Si el usuario elige “Seguimiento” 
1. Presiona “Seguimiento” 
1. El sistema muestra los datos a  modificar según definición en  [Tabla actividades programadas y seguimiento. ](#_page117_x82.00_y115.00)
1. El sistema no altera la versión que está publicada.
1. El sistema muestra en una “versión temporal” los datos modificables disponibles  para  cambio  y  muestra  protegidos  los  datos  que  por estructura del sistema no pueden ser alterados.
1. El usuario efectúa las modificaciones y registra si desea hacer un cambio de versión. 
1. El sistema hará cambio de versión automático si hay modificaciones en  los  siguientes  datos:  Fecha  de  inicio,  Fecha  de  fin,  Estado, Dependencia, Actividad y Descripción actividad. 
1. Si  el  Estado  de  la  actividad  es  modificado  a  “Validación”  o “Terminada” deben existir los anexos que evidencien la conclusión de la actividad en [Tabla – Riesgos – Soluciones Implementadas.](#_page112_x82.00_y711.00)
1. Confirma  la  actualización  presionando  el  botón  “grabar”,  si  el sistema no encuentra errores, continúa con el proceso.
1. Graba el registro, hasta aquí como una versión temporal, de la misma versión o de una nueva versión, lo que haya sucedido. 
1. Si grabó el registro, cambia el estado del Plan de acción a fin de que quede disponible para el proceso de aprobación del cambio.
1. Regresa a la vista principal del Módulo de Planes de acción. 


<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>

12. Fin del proceso.  

**Pre condiciones:**  

- El usuario debe estar autenticado y tener permisos para  dar mantenimiento a los Planes de acción. 
- Accesibilidad desde cualquier dispositivo con conexión internet.

**Post condiciones:**  

- El proceso queda registrado y visible para los usuarios autorizados.
- Los procesos creados sin contenido se eliminarán automáticamente después de  X  días  (los  que  estén  configurados  en  el  módulo  “Propiedades  de  la aplicación”). 
- Se deben actualizar las fechas auditorias de usuario y fecha en que se modifica la información. 
- Los planes pueden ser exportados en formato PDF o Excel.

<a name="_page55_x82.00_y423.00"></a>**MODULO DE AUDITORIA** 

El Módulo de Auditoría de la  “App de Gestión por Procesos” tiene como objetivo analizar  y  evaluar  el  cumplimiento  de  los  procesos,  normativas  y  estándares definidos  en  la  organización.  Este  módulo  permite  identificar  inconformidades, generar hallazgos y solicitar acciones correctivas, preventivas o de mejora.

**Para lograrlo, interactúa con otros módulos clave como:**

- **Procesos:**  Evaluando  la  correcta  documentación  y  ejecución  de  los procesos. 
- **Riesgos:** Identificando riesgos no controlados o mal gestionados.
- Organización  y  Personas:  Analizando  roles,  responsabilidades  y cumplimiento normativo. 
- **Indicadores  de  Gestión:**  Evaluando  el  desempeño  y  cumplimiento  de objetivos. 
- **Documentos:**  Verificando  la  actualización  y  aplicación  de  políticas  y normativas. 
- **Planes de  acción:** Re utiliza este módulo para tener el seguimiento de sus propias actividades de Auditoría y los Auditados para gestionar sus planes de acción de medidas correctivas de las observaciones de auditoría.



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>

Este módulo centraliza las auditorías internas y externas, asegurando una gestión efectiva del cumplimiento organizacional y la mejora continua.

![](Aspose.Words.3184fba8-1f57-4373-a4d7-5b011bad4160.009.png)

<a name="_page56_x82.00_y398.00"></a>**Caso de uso: CRUD de Planes de auditoria** 

**Actor:** Auditores, Miembros auditores del equipo de auditoría **Descripción:** Permitir la gestión de los planes de auditoría.   **Flujo principal:** 

1. El usuario ingresa al Módulo  PLANES DE AUDITORÍA. 
1. Elige  entre  las  opciones  “Crear”,  “Consultar”,  “Actualizar”,  “Eliminar”, “Archivar”. 
1. En todas las opciones, el sistema muestra los datos según definición de los datos de la Tabla documentados en la sección  [Tabla de  Auditoria,](#_page118_x82.00_y339.00) [Tabla – Equipo de auditoría, ](#_page119_x82.00_y392.00)[Tabla – Planes de acción, Ta](#_page114_x82.00_y684.00)[bla – Planes de acción  – Asociaciones,  ](#_page116_x82.00_y115.00)[Tabla  Actividades  programadas  y  seguimiento,  Ta](#_page117_x82.00_y115.00)[bla  – Relaciones a Sistemas de gestión.  ](#_page132_x82.00_y140.00)
1. Si elige CREAR: 
1. Presiona el ícono “+” (adicionar) 
1. El sistema muestra los datos a ingresar según definiciones en Tabl[a de Auditoria y](#_page118_x82.00_y339.00)[ Tabla – Equipo de auditoría ](#_page119_x82.00_y392.00)
1. Si  los  datos  obligatorios  fueron  ingresados  correctamente,  pide confirmación para grabar, si hay datos errados o faltan, pide sean completados. 



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>

4. Para registrar las actividades del Plan de auditoría, deberá registrar el detalle del plan en [Tabla – Planes de acción, Ta](#_page114_x82.00_y684.00)[bla – Planes de acción ](#_page116_x82.00_y115.00)
   1. [Asociaciones, ](#_page116_x82.00_y115.00)[Tabla Actividades programadas y seguimiento, Ta](#_page117_x82.00_y115.00)[bla ](#_page132_x82.00_y140.00)
   1. [Relaciones a Sistemas de gestión](#_page132_x82.00_y140.00)
4. El usuario confirma presionando el botón “grabar”, el sistema graba el  registro,  en  este  punto  del  caso,  los  datos  pueden  estar incompletos. 
4. Sólo si la información está completa de acuerdo con los criterios de consistencia de las tablas mencionadas aquí y de elegir el usuario iniciar el proceso de aprobación, se activará el proceso descrito en la sección: [ WORKFLOW DE APROBACIÓN DE CAMBI](#_page80_x204.00_y182.00)OS[.](#_page80_x204.00_y182.00)  
4. De llegar a la aprobación final, efectúa la creación del registro.
4. Regresa a la vista principal de Planes de Auditoría. 
4. Termina el proceso. 
5. Si elige CONSULTAR: 
   1. El usuario da clic o enter sobre la línea del Plan de auditoría.  
   1. El  sistema  muestra  los  datos  que  tiene  registrados  del  Plan  de auditoría, sin posibilidad de cambios. 
   1. El usuario termina la consulta, presionando ESC o el botón “salir”.
   1. Regresa a la vista principal del Módulo de Planes de auditoría. 
   1. Termina el proceso. 
5. Si elige ACTUALIZAR: 
1. El usuario presiona el ícono “editar” en el Plan de auditoría que desea modificar. 
1. El sistema no altera la versión que está publicada.
1. El sistema muestra en una “versión temporal” los datos modificables disponibles  para  cambio  y  muestra  protegidos  los  datos  que  por estructura del sistema no pueden ser alterados.
1. El usuario efectúa las modificaciones y registra si desea hacer un cambio de versión. 
1. Confirma  la  actualización  presionando  el  botón  “grabar”,  si  el sistema no encuentra errores, continúa con el proceso.
1. Graba el registro, hasta aquí como una versión temporal, de la misma versión o de una nueva versión, lo que haya elegido el usuario.
1. De elegir el usuario iniciar el proceso de aprobación del cambio, se activará  el  proceso  descrito  en  la  sección:  [WORKFLOW  DE](#_page80_x204.00_y182.00) [APROBACIÓN DE CAMBIO](#_page80_x204.00_y182.00)S[.](#_page80_x204.00_y182.00)  



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



8. Si  la  respuesta  final  del  workflow  de  aprobación  es  “aprobado”, procede hacer los cambios de estado (en la versión anterior y versión nueva) para proceder a la publicación del cambio.
8. Regresa a la vista principal del Módulo de Planes de acción. 
8. Fin del proceso. 
7. Si elige Eliminar: 
   1. El usuario posicionado en el Plan de  auditoría a eliminar presiona el ícono “tacho” 
   1. El  sistema  muestra  una  ventana  para  pedir  confirmación  de eliminación. 
   1. El sistema cambia el estado del registro a “Anulado”.
   1. Regresa a la vista principal del Módulo de Planes de auditoría. 
   1. Fin del proceso. 
7. Si elige Archivar: 
1. El usuario posicionado en el Plan de  auditoría a eliminar presiona el ícono “archivar” 
1. El  sistema  muestra  una  ventana  para  pedir  confirmación  de archivado. 
1. El sistema cambia el estado del registro a “Archivado”. 
1. Regresa a la vista principal del Módulo de Planes de auditoría. 
1. Fin del proceso. 

<a name="_page58_x82.00_y480.00"></a>**Caso de uso: Gestión de hallazgos y no conformidades** 

**Actor:** Auditores, Miembros auditores del equipo de auditoría

**Descripción:** Permitir el registro del resultado de las actividades de auditoría **Flujo principal:** 

1. El usuario ingresa al Módulo  PLANES DE AUDITORÍA. 
1. El sistema muestra los Planes de auditoría “Vigentes”
1. El usuario ingresa al Plan de auditoría que desea actualizar.
1. Si elige CREAR un “Hallazgo” o “No conformidad” 
1. Estando dentro del Plan de auditoría elegida, elige  el registro de un “Hallazgo” o el registro de una “No conformidad” 
1. El sistema permite el registro, de acuerdo con la definición de la Ta[bla ](#_page120_x82.00_y115.00)
   1. [Resultados de auditoría y T](#_page120_x82.00_y115.00)[abla – Relaciones a Sistemas de gestión](#_page132_x82.00_y140.00)
1. El usuario elige “grabar” 



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



4. Si hay errores en los datos ingresados, el sistema los resalta y solicita la corrección. 
4. De no haber errores, se procede a grabar el registro
4. Fin del proceso. 
5. Si elige CONSULTAR: 
   1. El usuario da clic o enter sobre la línea del hallazgo o no conformidad.  
   1. El sistema muestra los datos que tiene registrados del hallazgo o no conformidad, sin posibilidad de cambios. 
   1. El usuario termina la consulta, presionando ESC o el botón “salir”.
   1. Regresa a la vista de hallazgo o no conformidad. 
   1. Termina el proceso. 
5. Si elige ACTUALIZAR: 
   1. El usuario presiona el ícono “editar” en el hallazgo o no conformidad que desea modificar. 
   1. El sistema muestra los datos modificables disponibles para cambio y muestra  protegidos  los  datos  que  por  estructura  del  sistema  no pueden ser alterados.
   1. El usuario efectúa las modificaciones. 
   1. Confirma  la  actualización  presionando  el  botón  “grabar”,  si  el sistema no encuentra errores, continúa con el proceso o muestra los errores para su corrección. 
   1. Graba el registro. 
   1. Regresa a la vista de hallazgos o no conformidades. 
   1. Fin del proceso. 
5. Si elige Eliminar: 
   1. El usuario posicionado en el  hallazgo o no conformidad a eliminar presiona el ícono “tacho” 
   1. El  sistema  muestra  una  ventana  para  pedir  confirmación  de eliminación. 
   1. El sistema cambia el estado del registro a “Anulado”.
   1. Regresa a la vista principal de hallazgos y no conformidades. 
   1. Fin del proceso. 
5. Si elige Archivar: 
1. El usuario posicionado en el  hallazgo o no conformidad a eliminar presiona el ícono “archivar” 
1. El  sistema  muestra  una  ventana  para  pedir  confirmación  de archivado. 



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



3. El sistema cambia el estado del registro a “Archivado”.
3. Regresa a la vista de hallazgos o no conformidades. 
3. Fin del proceso 

<a name="_page60_x82.00_y181.00"></a>**Caso de uso: Creación de planes para atender los resultados de auditoría** 

**Actor:** Dueños de Procesos, Personas que tienen observaciones de auditoría a cargo.** 

**Descripción:**  Permitir el registro  y ejecución del plan de trabajo para levantar las observaciones  de  auditoría.  Para  ello,  los  actores  responsables  de  estas actividades usan los casos de uso del **Módulo de Planes de acción.** 

<a name="_page60_x82.00_y335.00"></a>**Caso de uso: Seguimiento** 

**Actor:** Auditores, Miembros auditores del equipo de auditoría

**Descripción:** Permitir el registro del resultado de las actividades de auditoría **Flujo principal:** 

1. El usuario ingresa al Módulo  PLANES DE AUDITORÍA. 
1. El sistema muestra los Planes de auditoría “Vigentes”
1. El usuario ingresa al Plan de auditoría que desea actualizar.
1. Si elige SEGUIMIENTO 
1. El  sistema  muestra  el  Resultado  de  auditoría  de  acuerdo  con  la información de la [Tabla – Resultados de auditoría y Ta](#_page120_x82.00_y115.00)[bla – Relaciones a Sistemas de gestión. ](#_page132_x82.00_y140.00)
1. El usuario puede elegir ver “Sólo vigentes” o “No vigente” o todos o ubicar uno en particular. 
1. El usuario ingresa a la observación y efectúa los cambios de acuerdo con el resultado de su revisión.
1. El usuario elige “grabar”. 
1. Si hay errores, el sistema resalta los errores y pide corrección. 
1. De no haber errores, se graba el registro.
1. Termina el proceso. 

<a name="_page60_x82.00_y708.00"></a>**Caso de uso: Alertas y seguimiento** 

**Actor: Sistema** 



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>

**Descripción:** Automatización del** envío de alertas y recordatorios de auditorías en proceso de atención.**  

**Flujo principal:** 

1. El sistema analiza las “Fecha Fin” de la T[abla – Actividades programadas y seguimiento de](#_page117_x82.00_y115.00) las actividades que estén asociadas a un Plan de Auditoria cuando el dato “Plan de auditoría” tenga valores. 
1. Por cada registro que cumple el criterio ejecuta el Caso de Uso:  [Alertas de vencimientos ](#_page83_x82.00_y490.00)
1. El usuario ingresa al Plan de auditoría que desea actualizar.
1. Si elige SEGUIMIENTO 
1. El  sistema  muestra  el  Resultado  de  auditoría  de  acuerdo  con  la información de la [Tabla – Resultados de auditoría. ](#_page120_x82.00_y115.00)
1. El usuario puede elegir ver “Sólo vigentes” o “No vigente” o todos o ubicar uno en particular. 
1. El usuario ingresa a la observación y efectúa los cambios de acuerdo con el resultado de su revisión.
1. El usuario elige “grabar” 
1. Si hay errores, el sistema resalta los errores y pide corrección.
1. De no haber errores, se graba el registro.
1. Termina el proceso. 

<a name="_page61_x82.00_y492.00"></a>**MODULO INDICADORES DE GESTIÓN** 

El **Módulo de Indicadores de Gestión** está diseñado para documentar, centralizar 

y estandarizar la información sobre los indicadores clave de la organización. Su propósito  principal  es  proporcionar  una  estructura  clara  y  unificada  para  la identificación  de  los  indicadores  que  realizan  la  medición  del  desempeño organizacional. 

El  módulo  no  solo  permite  definir  indicadores,  sino  también  relacionarlos  con diferentes  áreas  y  procesos,  estableciendo  una  gobernanza  clara  sobre  su medición,  análisis  y  toma  de  decisiones  estratégicas.  Esto  asegura  que  la organización pueda evaluar su desempeño de manera objetiva y fundamentar sus decisiones en métricas alineadas con sus objetivos.

Además de la centralización de definiciones de indicadores de la empresa, este módulo permite **establecer indicadores de optimización**, los cuales se obtienen del análisis de los procesos y demás entidades definidas en la aplicación. Estos indicadores brindan información valiosa para identificar oportunidades de mejora, 



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>

evaluar la eficiencia de las operaciones y respaldar iniciativas de mejora continua en la organización. 

<a name="_page62_x82.00_y145.00"></a>**Caso de uso: CRUD de Gestión de indicadores** 

**Actor:** Dueños de procesos, usuarios con acceso

**Descripción:** Permitir la gestión de los Indicadores de gestión definidos en la app. **Flujo principal:** 

1. El usuario ingresa al Módulo  INDICADORES DE GESTIÓN. 
1. Elige entre las opciones “Crear”, “Consultar”, “Actualizar”, “Archivar”. 
1. En todas las opciones, el sistema muestra los datos según definición de los datos  de  la  Tabla  documentados  en  la  sección  [Tabla  –  Definiciones  – Indicadores. ](#_page125_x82.00_y646.00)
1. Si elige CREAR: 
1. Presiona el ícono “+” (adicionar) 
1. El sistema muestra los datos a ingresar según definiciones en Tabl[a – Definiciones – Indicadores. ](#_page125_x82.00_y646.00)
1. Si  los  datos  obligatorios  fueron  ingresados  correctamente,  pide confirmación para grabar, si hay datos errados o faltan, pide sean completados. 
1. El usuario confirma presionando el botón “grabar”, el sistema graba el registro. 
1. Sólo si la información está completa de acuerdo con los criterios de consistencia de la [ Tabla – Definiciones  – Indicadores y](#_page125_x82.00_y646.00) de elegir el usuario  iniciar  el  proceso  de  aprobación,  se  activará  el  proceso descrito en la sección: [ WORKFLOW DE APROBACIÓN DE CAMBI](#_page80_x204.00_y182.00)OS[.](#_page80_x204.00_y182.00)  
1. De llegar a la aprobación final, efectúa la creación del registro.
1. Regresa a la vista principal de Indicadores de Gestión. 
1. Termina el proceso. 
5. Si elige CONSULTAR: 
   1. El usuario da clic o enter sobre la línea del Indicador de Gestión.  
   1. El sistema muestra los datos que tiene registrados del Indicador, sin posibilidad de cambios. 
   1. El usuario termina la consulta, presionando ESC o el botón “salir”.
   1. Regresa a la vista principal del Módulo de Indicadores de gestión. 
   1. Termina el proceso. 
5. Si elige ACTUALIZAR: 
1. El usuario presiona el ícono “editar” en el  Indicador de Gestión que desea modificar. 
1. El sistema no altera la versión que está publicada.
1. El sistema muestra en una “versión temporal” los datos modificables disponibles  para  cambio  y  muestra  protegidos  los  datos  que  por estructura del sistema no pueden ser alterados.

<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



4. El usuario efectúa las modificaciones y registra si desea hacer un cambio de versión. 
4. Confirma  la  actualización  presionando  el  botón  “grabar”,  si  el sistema no encuentra errores, continúa con el proceso.
4. Graba el registro, hasta aquí como una versión temporal, de la misma versión o de una nueva versión, lo que haya elegido el usuario.
4. De elegir el usuario iniciar el proceso de aprobación del cambio, se activará  el  proceso  descrito  en  la  sección:  [WORKFLOW  DE](#_page80_x204.00_y182.00) [APROBACIÓN DE CAMBIO](#_page80_x204.00_y182.00)S[.](#_page80_x204.00_y182.00)  
4. Si  la  respuesta  final  del  workflow  de  aprobación  es  “aprobado”, procede hacer los cambios de estado (en la versión anterior y versión nueva) para proceder a la publicación del cambio.
4. Regresa a la vista principal del Módulo de Indicadores de gestión. 
4. Fin del proceso. 

7\.  Si elige Archivar: 

1. El usuario posicionado en el Indicador de Gestión a eliminar presiona el ícono “archivar” 
1. El  sistema  muestra  una  ventana  para  pedir  confirmación  de archivado. 
1. El sistema cambia el estado del registro a “Archivado”.
1. Regresa a la vista principal del Módulo de Indicadores de gestión. 
1. Fin del proceso. 

<a name="_page63_x82.00_y463.00"></a>**Caso de uso: Carga de Resultados de Indicadores desde Excel** 

**Actor: Usuario con acceso** 

**Descripción:** Esta opción permite al usuario cargar o modificar los resultados de los Indicadores  de  gestión a  partir  de  un Excel  con  la  información  a  procesar utilizando el diseño de la Tabla [Resultados - Indicadores. ](#_page133_x82.00_y264.00)

El Excel está compuesto por una pestaña: 



|**Nombre de pestaña** |**Requisito** |**Contenido** |
| :- | - | - |
|Carga masiva  |Obligatorio |Información para la carga masiva correspondiente a carga de los resultados periódicos de los indicadores|

**Flujo Principal:** 

1. El usuario ingresa al Módulo  INDICADORES DE GESTIÓN. 
1. Elige la opción “Carga Masiva” 
1. Selecciona de algún directorio de la red o del equipo el archivo a cargar que debe estar en el formato detallado en el Anexo Ta[bla – Resultados – Indicadores.  ](#_page133_x82.00_y264.00)



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



4. El  sistema  pide  confirmación  para  cargar  el  Excel  con  resultados  de  los Indicadores.  
4. El sistema usa la información en el orden que viene registrada en el Excel. 
4. El sistema consistencia que cada columna del Excel cumpla con los criterios definidos en la definición del archivo T[abla – Resultados - Indicadores. ](#_page133_x82.00_y264.00)
4. Si  las  columnas  tienen  errores  de  formato,  devuelve  en  pantalla  todos  los errores generales de formato encontrados para la corrección del Excel.
4. El usuario confirmará la carga, presionando el botón “cargar”
4. El sistema procede con la carga masiva de los Indicadores de gestión. 
4. Termina el proceso de carga masiva.

<a name="_page64_x82.00_y287.00"></a>**Caso de uso: Consulta de indicadores de gestión** 

**Actor:** Usuarios con acceso a Indicadores de gestión

**Descripción:** Permite visualizar y analizar los indicadores de gestión.   **Flujo principal:** 

1. El usuario ingresa al Módulo INDICADORES DE GESTIÓN. 
1. El sistema muestra los Indicadores de gestión asociados al perfil del Usuario conectado. 
1. El Usuario elige entre “Consultar Indicador”. 
1. El sistema muestra el Indicador sin posibilidad de cambios desde el archivo [Tabla – Resultados – Indicadores en](#_page133_x82.00_y264.00) el formato definido para el indicador en el archivo [Tabla – Definiciones – Indicadores. ](#_page125_x82.00_y646.00)
1. El usuario termina la consulta, presionando ESC o el botón “salir”.
1. Regresa a la vista principal del Módulo de Indicadores de gestión.
1. Termina el proceso. 

<a name="_page64_x82.00_y560.00"></a>**Caso de uso: Construcción de indicadores de la app** 

**Actor:** Sistema** 

**Descripción:**  A  partir  de  la  información  registrada  en  la aplicación,  el  sistema generará indicadores de gestión que permitirán evaluar el desempeño y la eficiencia de los procesos y demás entidades. Estos indicadores facilitarán el análisis de tendencias,  la  identificación  de  oportunidades  de  mejora  y  la  optimización continua de la operación, asegurando una toma de decisiones basada en datos.**   

**Flujo principal:** 



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



1. El sistema ejecuta una tarea programada de acuerdo con la periodicidad registrada en  los parámetros del sistema, pudiendo ser,  diaria, mensual o trimestralmente. 
1. El sistema  analiza los procesos, documentos, riesgos, sistemas, planes de mejora,  activos  de  data  y  demás  entidades  de  la  app  buscando oportunidades de mejora de acuerdo a la siguiente tabla de potenciales oportunidades: 

|**Entidad** |**Búsqueda** |**Motivo** |
| - | - | - |
|Procesos  |Sin riesgos asociados |Identificar  procesos documentados  que  no tengan  riesgos registrados,  lo  que podría  indicar  una omisión  en  la identificación de riesgos. |
|Riesgos |Asociados  a  múltiples procesos |Identificar riesgos que se repiten  en  distintos procesos  para determinar  su  impacto transversal  en  la organización. |
|Riesgos |Sin  Planes  de  acción definidos |Detectar  riesgos documentados  que  no tienen  planes  de mitigación asignados. |
|Riesgos |Riesgos con impacto alto y sin medidas correctivas |Identificar  riesgos críticos que no han sido atendidos. |
|Sistemas |Nuevos  sistemas implementados  sin evaluación de riesgos |Detectar  sistemas recientemente registrados en el módulo de  **Sistemas**  sin  un análisis  de  riesgos asociado |
|Riesgos |Análisis  de  tendencias  en riesgos |Evaluar si ciertos riesgos se  han  vuelto  más frecuentes en un período determinado. |
|Auditorías |Observaciones  sin acciones correctivas |Identificar  hallazgos  de auditoría  que  aún  no tienen un plan de acción asignado. |
|Auditorías |Acciones  correctivas vencidas |Buscar planes de acción derivados  de  auditorías que no se han ejecutado en el plazo definido. |



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



<table><tr><th colspan="2" valign="top">Auditorías </th><th colspan="1" valign="top">Áreas con mayor cantidad de hallazgos pendientes </th><th colspan="3">Evaluar  cuáles departamentos  tienen más  observaciones  no atendidas. </th></tr>
<tr><td colspan="2" valign="top">Auditorías </td><td colspan="1" valign="top">Hallazgos repetitivos </td><td colspan="3">Buscar auditorías donde se  han  reportado  los mismos  hallazgos  en diferentes períodos. </td></tr>
<tr><td colspan="2" valign="top">Riesgos </td><td colspan="1" valign="top">Cruce con riesgos </td><td colspan="3">Identificar si los riesgos registrados en el módulo de  <b>Riesgos</b>  están relacionados  con hallazgos  de  auditoría recientes. </td></tr>
<tr><td colspan="2" valign="top">Procesos </td><td colspan="1" valign="top">Procesos  con  tiempos  de ciclo elevados </td><td colspan="3">Identificar procesos que tardan  más  de  lo esperado  en completarse. </td></tr>
<tr><td colspan="2" valign="top">Procesos </td><td colspan="1" valign="top">Procesos  con  más documentos relacionados</td><td colspan="3">Evaluar  qué  procesos requieren  mayor documentación  y podrían simplificarse. </td></tr>
<tr><td colspan="2" valign="top">Procesos </td><td colspan="1" valign="top">Procesos  con  más sistemas involucrados </td><td colspan="3">Identificar procesos con alta  dependencia tecnológica para evaluar su eficiencia. </td></tr>
<tr><td colspan="2" valign="top">Procesos </td><td colspan="1" valign="top">Procesos  sin  indicadores de gestión asociados </td><td colspan="3">Detectar  procesos  que no tienen métricas para evaluar su desempeño.</td></tr>
<tr><td colspan="2" valign="top">Procesos </td><td colspan="1" valign="top">Cruce  entre  procesos  y observaciones de auditoría</td><td colspan="3">Analizar si los procesos que  tienen  más hallazgos  de  auditoría coinciden  con  los  de mayor riesgo. </td></tr>
<tr><td colspan="2">Procesos </td><td colspan="1" valign="top">Procesos  con  mayor potencial  de automatización </td><td colspan="3">Analizar  que  procesos tienen  actividades manuales  que  por  su descripción (IA) podrían ser automatizables y a la vez  tienen  una  alta captura  de  valor (volumetría,  horas hombre involucradas) </td></tr>
<tr><td colspan="2" valign="top">Data </td><td colspan="1" valign="top">Datos  sin  responsables asignados </td><td colspan="3">Identificar  entidades dentro  del  módulo  de <b>Gobierno de Datos</b> que no  tengan  un  usuario encargado. </td></tr>
<tr><td colspan="1" rowspan="3">![ref1]</td><td colspan="3">Especificaciones funcionales</td><td colspan="1">CÓDIGO: </td><td colspan="1">OPSP-FRM10 </td></tr>
<tr><td colspan="3" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



|Data |Datos  utilizados  en múltiples  módulos  sin control unificado |Detectar  datos  críticos que  aparecen  en  varias entidades  pero  sin  una estrategia  de gobernanza clara. |
| - | - | - |
|Data |Cruce entre datos críticos y sistemas |Evaluar si los datos más sensibles  están  en sistemas  con vulnerabilidades conocidas. |
|Data |Datos  más consultados/modificados|Identificar  qué  tipo  de información  es  más manipulada  en  la organización  para evaluar  riesgos  de seguridad. |



3. Al término de la evaluación la app mostrará en un dashboard el resultado del análisis de la app. 
3. El Usuario podrá la opción “Consultar Indicador” en todos o algunos de los indicadores generados automáticamente.
3. El sistema muestra el Indicador sin posibilidad de cambios desde el archivo [Tabla – Resultados – Indicadores en](#_page133_x82.00_y264.00) el formato definido para el indicador en el archivo [Tabla – Definiciones – Indicadores. ](#_page125_x82.00_y646.00)
3. El usuario termina la consulta, presionando ESC. 

<a name="_page67_x82.00_y493.00"></a>**MODULO REGLAS DE NEGOCIO** 

El Módulo de Reglas de Negocio de la *App de Gestión por Procesos* está diseñado 

para centralizar la documentación de las restricciones, condiciones y criterios que regulan la ejecución de los procesos dentro de la organización. Su propósito es garantizar  que  el  conocimiento  de  reglas  de  negocio  se  encuentre  siempre actualizados  para  que  las  decisiones  operativas  se  alineen  a  estas,  sean normativas internas o normativas legales del país.

Dentro  de  este  módulo,  se  podrán  documentar  reglas  que  establezcan restricciones sobre determinadas operaciones, como el rechazo automático de solicitudes que no cumplan criterios específicos o el ajuste de precios en función de los riesgos asociados a ciertas transacciones. Estas reglas se basarán en el análisis técnico de los riesgos, permitiendo una gestión documentada que optimiza la toma de decisiones y reduce la exposición a riesgos innecesarios.



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>

Las principales características del módulo incluyen:

- **Definición de reglas personalizadas** para distintos procesos y áreas de negocio. 
- **Configuración de condiciones y  restricciones** en función de parámetros como tipo de cliente, monto de la operación, historial de riesgos, entre otros.
- **Monitoreo y ajuste continuo** de reglas, permitiendo su evolución según nuevas condiciones del mercado o cambios regulatorios.

Este  módulo permite estructurar procesos de atención más eficientes, alineados con  el  análisis  de  riesgos  y  con  un  enfoque  preventivo  que  fortalece  la sostenibilidad operativa y financiera de la organización.

<a name="_page68_x82.00_y319.00"></a>**Caso de uso: CRUD de Reglas de negocio** 

**Actor:** Analistas funcionales, Analistas de procesos, Usuarios con acceso **Descripción:** Permitir la gestión de las Reglas de negocio** 

**Flujo principal:** 

1. El usuario ingresa al Módulo  REGLAS DE NEGOCIO. 
1. Elige entre las opciones “Crear”, “Consultar”, “Actualizar”, “Eliminar”, “Archivar”. 
1. En todas las opciones, el sistema muestra los datos según definición de los datos de la Tabla documentados en la sección Ta[bla – Reglas de negocio, ](#_page128_x82.00_y301.00)[Tabla – Adjuntos de Reglas de negocio y ](#_page129_x82.00_y388.00)T[abla – Relaciones a Sistemas de gestión. ](#_page132_x82.00_y140.00)
1. Si elige CREAR: 
1. Presiona el ícono “+” (adicionar) 
1. El sistema muestra los datos a ingresar según definiciones en Tabl[a – Reglas de negocio, ](#_page128_x82.00_y301.00)[Tabla – Adjuntos de Reglas de negocio y T](#_page129_x82.00_y388.00)a[bla – Relaciones a Sistemas de gestión. ](#_page132_x82.00_y140.00)
1. Si  los  datos  obligatorios  fueron  ingresados  correctamente,  pide confirmación para grabar, si hay datos errados o faltan, pide sean completados. 
1. El usuario confirma presionando el botón “grabar”, el sistema graba el registro. 
1. Sólo si la información está completa de acuerdo con los criterios de consistencia de las tablas mencionadas aquí y de elegir el usuario 



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>

iniciar el proceso de aprobación, se activará el proceso descrito en la sección: [ WORKFLOW DE APROBACIÓN DE CAMBI](#_page80_x204.00_y182.00)OS[.](#_page80_x204.00_y182.00)  

6. De llegar a la aprobación final, efectúa la creación del registro.
6. Regresa a la vista principal de Reglas de Negocio. 
6. Termina el proceso. 

5\.  Si elige CONSULTAR: 

1. El usuario da clic o enter sobre la línea de la Regla de negocio.  
1. El sistema muestra los datos que tiene registrados de la Regla de negocio, sin posibilidad de cambios. 
1. El usuario termina la consulta, presionando ESC o el botón “salir”.
1. Regresa a la vista principal del Módulo de Reglas de negocio. 
1. Termina el proceso. 
6. Si elige ACTUALIZAR: 
1. El usuario presiona el ícono “editar” en la Regla de negocio que desea modificar. 
1. El sistema no altera la versión que está publicada.
1. El sistema muestra en una “versión temporal” los datos modificables disponibles  para  cambio  y  muestra  protegidos  los  datos  que  por estructura del sistema no pueden ser alterados.
1. El usuario efectúa las modificaciones y registra si desea hacer un cambio de versión. 
1. Confirma  la  actualización  presionando  el  botón  “grabar”,  si  el sistema no encuentra errores, continúa con el proceso.
1. Graba el registro, hasta aquí como una versión temporal, de la misma versión o de una nueva versión, lo que haya elegido el usuario.
1. De elegir el usuario iniciar el proceso de aprobación del cambio, se activará  el  proceso  descrito  en  la  sección:  [WORKFLOW  DE](#_page80_x204.00_y182.00) [APROBACIÓN DE CAMBIO](#_page80_x204.00_y182.00)S[.](#_page80_x204.00_y182.00)  
1. Si  la  respuesta  final  del  workflow  de  aprobación  es  “aprobado”, procede hacer los cambios de estado (en la versión anterior y versión nueva) para proceder a la publicación del cambio.
1. Regresa a la vista principal del Módulo de Reglas de negocio. 
1. Fin del proceso. 

7\.  Si elige Eliminar: 



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



1. El usuario posicionado en la Regla de negocio a eliminar presiona el ícono “tacho” 
1. El  sistema  muestra  una  ventana  para  pedir  confirmación  de eliminación. 
1. El sistema cambia el estado del registro a “Anulado”.
1. Regresa a la vista principal del Módulo de Reglas de negocio. 
1. Fin del proceso. 

8\.  Si elige Archivar: 

1. El usuario posicionado en la Regla de negocio a eliminar presiona el ícono “archivar” 
1. El  sistema  muestra  una  ventana  para  pedir  confirmación  de archivado. 
1. El sistema cambia el estado del registro a “Archivado”.
1. Regresa a la vista principal del Módulo de Reglas de negocio. 
1. Fin del proceso. 

<a name="_page70_x82.00_y417.00"></a>**MODULO DE SISTEMAS DE GESTIÓN** 

El **Módulo de Sistemas de Gestión** está diseñado para centralizar y organizar toda la documentación relacionada con las normas ISO u otros estándares de gestión aplicables a la organización. Este módulo permite consolidar, mantener y consultar información  estructurada  sobre  los  **sistemas  de  gestión  implementados**, facilitando la alineación de los procesos operativos con los requisitos normativos que regulan o direccionan las actividades del negocio.

La principal función de este módulo es ofrecer un  **repositorio centralizado de normas,  procedimientos,  políticas  y  lineamientos**  derivados  de  estándares reconocidos (como **ISO 9001, ISO 27001, ISO 14001**, entre otros), que sirven como marco de referencia para la gestión de calidad, seguridad, medio ambiente, entre otros aspectos críticos del negocio.

Además, el módulo permitirá la **asociación de las normas ISO** con otras entidades del sistema, como procesos, documentos, riesgos, observaciones de auditoría, planes de acción, indicadores, entre otros, con el fin de evidenciar la trazabilidad entre  la  normativa  y  la  operación  empresarial.  Esto  permitirá  identificar



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>

rápidamente qué elementos del negocio están sujetos a normativas específicas, facilitando las auditorías internas, externas y el cumplimiento regulatorio.

Entre  los  principales  beneficios  del  **Módulo  de  Sistemas  de  Gestión**  se encuentran: 

- **Gestión centralizada** de toda la documentación relacionada con normas ISO. 
- **Asociación  directa**  de  normas  con  procesos,  riesgos,  observaciones, planes de acción, entre otros.
- **Facilitación  de  auditorías**  internas  y  externas  mediante  información estructurada y vinculada. 
- **Monitoreo del cumplimiento normativo** al evaluar si las operaciones del negocio están alineadas con los estándares internacionales.
- **Base documental para la mejora continua**, aprovechando la correlación entre normas, procesos, riesgos y resultados.

Este módulo será clave para que la organización pueda demostrar  **conformidad normativa**,  garantizar  **transparencia  documental**  y  fomentar  una  **cultura  de mejora continua** mediante la gestión efectiva de los  sistemas de gestión bajo estándares internacionales.

<a name="_page71_x82.00_y455.00"></a>**Caso de uso: CRUD de Sistemas de gestión** 

**Actor:** Analistas de procesos, Usuarios con acceso

**Descripción:** Permitir la gestión de la información de los Sistemas de Gestión **Flujo principal:** 

1. El usuario ingresa al Módulo  SISTEMAS DE GESTIÓN. 
1. Elige  entre  las  opciones  “Crear”,  “Consultar”,  “Actualizar”,  “Eliminar”, “Archivar”. 
1. En todas las opciones, el sistema muestra los datos según definición de los datos de la Tabla documentados en la sección Ta[bla – Sistemas de gestión y ](#_page130_x82.00_y115.00)[Tabla – Adjuntos de Sistemas de gestión. ](#_page131_x82.00_y376.00)
1. Si elige CREAR: 
1. Presiona el ícono “+” (adicionar) 
1. El sistema muestra los datos a ingresar según definiciones en Tabl[a – Sistemas de gestión y ](#_page130_x82.00_y115.00)T[abla – Adjuntos de Sistemas de gestión. ](#_page131_x82.00_y376.00)



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



3. Si  los  datos  obligatorios  fueron  ingresados  correctamente,  pide confirmación para grabar, si hay datos errados o faltan, pide sean completados. 
3. El usuario confirma presionando el botón “grabar”, el sistema graba el registro. 
3. Sólo si la información está completa de acuerdo con los criterios de consistencia de las tablas mencionadas aquí y de elegir el usuario iniciar el proceso de aprobación, se activará el proceso descrito en la sección: [ WORKFLOW DE APROBACIÓN DE CAMBI](#_page80_x204.00_y182.00)OS[.](#_page80_x204.00_y182.00)  
3. De llegar a la aprobación final, efectúa la creación del registro.
3. Regresa a la vista principal de Reglas de Negocio.
3. Termina el proceso. 

5\.  Si elige CONSULTAR: 

1. El usuario da clic o enter sobre la línea del Sistema de gestión.  
1. El sistema muestra los datos que tiene registrados  del Sistema de gestión y de los adjuntos, sin posibilidad de cambios. 
1. El usuario puede acceder a cualquiera de los adjuntos que tiene el Sistema de gestión. 
1. El usuario termina la consulta, presionando ESC o el botón “salir”.
1. Regresa a la vista principal del Módulo de Sistemas de gestión. 
1. Termina el proceso. 

6\.  Si elige ACTUALIZAR: 

1. El usuario presiona el ícono “editar” en  el Sistema de gestión  que desea modificar. 
1. El sistema no altera la versión que está publicada.
1. El sistema muestra en una “versión temporal” los datos modificables disponibles  para  cambio  y  muestra  protegidos  los  datos  que  por estructura del sistema no pueden ser alterados. También muestra los adjuntos asociados al Sistema de gestión.
1. El usuario efectúa las modificaciones y registra si desea hacer un cambio de versión. 
1. Confirma  la  actualización  presionando  el  botón  “grabar”,  si  el sistema no encuentra errores, continúa con el proceso.
1. Graba el registro, hasta aquí como una versión temporal, de la misma versión o de una nueva versión, lo que haya elegido el usuario.



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



7. De elegir el usuario iniciar el proceso de aprobación del cambio, se activará  el  proceso  descrito  en  la  sección:  [WORKFLOW  DE](#_page80_x204.00_y182.00) [APROBACIÓN DE CAMBIO](#_page80_x204.00_y182.00)S[.](#_page80_x204.00_y182.00)  
7. Si  la  respuesta  final  del  workflow  de  aprobación  es  “aprobado”, procede hacer los cambios de estado (en la versión anterior y versión nueva) para proceder a la publicación del cambio.
7. Regresa a la vista principal del Módulo de Sistemas de gestión. 
7. Fin del proceso. 

7\.  Si elige Eliminar: 

1. El usuario posicionado en el Sistema de gestión a eliminar presiona el ícono “tacho” o se posiciona dentro del Sistema de gestión en el Adjunto a eliminar y presiona el ícono “tacho” 
1. El  sistema  muestra  una  ventana  para  pedir  confirmación  de eliminación. 
1. El sistema cambia el estado del registro a “Anulado”.
1. Regresa a la vista principal del Módulo de Sistemas de gestión. 
1. Fin del proceso. 

8\.  Si elige Archivar: 

1. El usuario posicionado en el Sistema de gestión a eliminar presiona el ícono “archivar” 
1. El  sistema  muestra  una  ventana  para  pedir  confirmación  de archivado. 
1. El sistema cambia el estado del registro a “Archivado”.
1. Regresa a la vista principal del Módulo de Sistemas de gestión. 
1. Fin del proceso. 

<a name="_page73_x82.00_y603.00"></a>**MODULO DE REPORTES** 

El **Módulo de Reportes** de la  *App de Gestión por Procesos* está diseñado para proporcionar una generación de informes flexible y dinámica mediante el uso de inteligencia artificial. En lugar de depender de reportes predefinidos, este módulo introduce  un  enfoque  innovador  basado  en  un  **asistente  IA** que  interpreta  las solicitudes de los usuarios y genera reportes personalizados en función de los datos almacenados en la aplicación.

El usuario podrá interactuar con el  **asistente IA** mediante prompts en lenguaje natural, especificando el tipo de  reporte que necesita, los filtros a aplicar y el 

<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>

formato deseado. La IA procesará la solicitud, extraerá la información relevante desde  los  diferentes  módulos  del  sistema  (Procesos,  Riesgos,  Auditoría, Indicadores de Gestión, entre otros) y generará un informe estructurado, facilitando la toma de decisiones y el análisis de datos en tiempo real.

Este enfoque basado en IA permitirá: 

- Generación de  reportes personalizados sin necesidad de conocimientos técnicos avanzados. 
- Flexibilidad para adaptar los reportes a necesidades específicas.
- Optimización del tiempo y recursos en la obtención de información clave.
- Capacidad de refinar y ajustar reportes con nuevas solicitudes en tiempo real. 

El  Módulo  de  Reportes  representa  un  avance  significativo  en  la  gestión  de  la información dentro de la organización, brindando herramientas inteligentes para el análisis y la mejora continua de los procesos.

<a name="_page74_x82.00_y395.00"></a>**Caso de uso: Gestión de Reportes** 

**Actor:** Usuarios con acceso al módulo de reportes

**Descripción:** Ambiente de trabajo en donde se almacenan los reportes generados por el Usuario, puede ver los propios y los generados por otros usuarios que definieron el reporte como público.

**Flujo principal:** 

1. El usuario ingresa al Módulo REPORTES. 
1. Visualiza la bandeja de Reportes Generados por él y por otros usuarios que definieron sus reportes como públicos.
1. La información que se visualiza como mínimo es: Nombre del reporte, fecha de creación, usuario creador, fecha de expiración. 
1. El Usuario elige entre las opciones “Crear”, “Consultar”, “Eliminar”
1. **Si elige CREAR:** 
1. Se activa el Asistente IA con las instrucciones de como generar el PROMPT que permitirá a la IA generar el reporte. 
1. El Usuario ingresa su prompt 
1. La  IA  procesa  el  pedido  y  genera  un  reporte  con  las  columnas solicitadas por el usuario, siempre que el usuario no especifica la forma de presentación, la IA asumirá que será en una grilla con las 



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>

columnas solicitadas con una primera línea con el título de cada una 

de ellas. 

4. El usuario puede confirmar el reporte o puede solicitar cambios para que la IA regenere el reporte. 
4. Si el usuario confirma, se graba el reporte en la bandeja de reportes con  los  datos:  Nombre  del  reporte,  fecha  de  creación,  Fecha  de expiración (30 días a partir del día vigente) y usuario que lo creó. 
4. Termina el proceso de creación 

**6.  Si elige Consultar:** 

1. El usuario posicionado en la “Bandeja de reportes” elige uno de los reportes de la grilla y presiona clic o enter.
1. El sistema muestra el reporte generado
1. El usuario, al término de la consulta, presiona “Esc” o el botón “Salir”. 
1. Termina el proceso de consulta.

**7.  Si elige “Eliminar”:** 

1. El  usuario  posicionado  en  la  “Bandeja  de  reportes”  presiona  el “tacho” en la línea del reporte a eliminar o presiona el “tacho” de la parte superior  de la bandeja para seleccionar todos los que desea eliminar. 
1. El usuario presiona enter 
1. El sistema procede a pedir confirmación de la eliminación  (cuenta cuantos son), si es más de uno muestra la cantidad.
1. A la confirmación de eliminación procede a eliminar los reportes.
1. Termina el proceso de eliminación. 

<a name="_page75_x82.00_y548.00"></a>**Caso de uso: Observaciones y su relación con los Sistemas de gestión** 

**Actor:** Usuarios con acceso al módulo de reportes

**Descripción:** Reporte específico que asocia las observaciones de auditoría con el Sistema de Gestión que le sea afín. 

**Flujo principal:** 

1. El usuario ingresa al Módulo REPORTES. 
1. Visualiza la bandeja de Reportes Generados por él y por otros usuarios que definieron sus reportes como públicos.



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



3. La información que se visualiza como mínimo es: Nombre del reporte, fecha de creación, usuario creador, fecha de expiración.
3. El Usuario elige la opción “Obs relacionadas a Sistemas de gestión”. 
3. El sistema muestra los campos para la definición del filtro: 
   1) El sistema muestra los sistemas de gestión para elección, el usuario puede seleccionar uno o varios o seleccionar la opción Todos. El valor por default es “Todos”. 
   1) El sistema muestra las entidades para que el usuario elija de cuales quiere la relación de observaciones, tiene la opción “todas” que es el valor default. 
   1) El  sistema  muestra  un  rango  de  fechas  para  que  el  Usuario seleccione  por fecha de creación de que rango de fechas desea el reporte. El valor default de inicio es año 01/01/1900 y como fecha fin la fecha actual. 
3. El Usuario selecciona y presiona clic en el botón “generar” o enter
3. El sistema genera el reporte con los siguientes datos obtenidos a partir de la [Tabla – Resultados de auditoría (1](#_page120_x82.00_y115.00)) y T[abla – Relaciones a Sistemas de gestión](#_page132_x82.00_y140.00)

   (2) 

1) Sistema de gestión (2) 
1) ID observación (1) 
1) Módulo (1) 
1) Fecha de observación (1) 
1) ID Tipo de resultado (1) 
1) Tipo No conformidad (1) 
1) ID Plan de auditoria (Origen del Hallazgo (1)) 
1) Descripción del hallazgo (Comentarios 1) 
1) Días abierto (1) 
   1. Si estado indica “abierto” es la diferencia de días entre Fecha de observación y Fecha actual. 
   1. Si estado indica “cerrado” es la diferencia de días entre Fecha de observación y Fecha de levantamiento. 
1) Estado del Plan de acción (1) 

<a name="_page76_x82.00_y681.00"></a>**MODULO DE USUARIOS Y PERFILES** 

El **Módulo de Usuarios y Perfiles** permite la administración centralizada de los accesos y permisos de los usuarios dentro del sistema. Su propósito es garantizar que cada persona dentro de la organización tenga **los permisos adecuados según** 

<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>

**su rol y responsabilidades**, asegurando así la seguridad y el correcto uso de la plataforma. 

Este módulo no solo gestiona la creación de usuarios, sino que también define los niveles  de  acceso  a  cada  uno  de  los  módulos  del  sistema,  permitiendo configuraciones detalladas sobre qué acciones pueden realizar los usuarios dentro de  cada  módulo,  tales  como  **crear,  modificar,  consultar,  eliminar  o  archivar información**. 

Además, este módulo facilita la administración mediante la asignación de  **roles predefinidos** que agrupan permisos comunes, reduciendo la complejidad de la gestión  individual  de  accesos.  También  incorpora  la  posibilidad  de  gestionar estados de permisos, accesos temporales y un historial de modificaciones para trazabilidad y auditoría. 

**06 jun** 

**Obs 11:** Se incluye a nivel de Cliente tener la cantidad permitida de Usuarios por Organización. 

**Obs 13:** A su vez, existirán  planes que estarán a elección de los Clientes para suscripción con periodicidad mensual, anual y otros.

**Obs 15:** Los clientes pueden variar el plan de suscripción en cada renovación, por lo que se tendrá un histórico de planes elegidos por el Cliente.

En resumen, el **Módulo de Usuarios y Perfiles** proporciona una estructura flexible 

y  segura  para  la  administración  de  accesos  dentro  de  la  *App  de  Gestión  por Procesos*, asegurando el cumplimiento de los principios de seguridad, control y gobernanza organizacional. 

<a name="_page77_x82.00_y547.00"></a>**Caso de uso: Gestión de Usuarios y Perfiles** 

**Actor:** Administradores de la app de gestión por procesos de la organización

**Descripción:** Crear y asignar los roles que definen el acceso a las diferentes opciones del sistema.**  

**Flujo principal:** 

1. El usuario ingresa al Módulo  USUARIOS Y PERFILES. 
1. Elige entre las opciones “Crear”, “Consultar”, “Actualizar”, “Eliminar”, “Suspender”. 
1. En todas las opciones, el sistema muestra los datos según definición de los datos de la Tabla documentados en la sección Ta[bla Usuario y Perfiles.  ](#_page134_x82.00_y353.00)
1. Si elige CREAR: 



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



1) Presiona el ícono “+” (adicionar) 
1) El sistema muestra los datos a ingresar según definiciones en Tabl[a Usuarios y Perfiles. ](#_page134_x82.00_y353.00)
1) Si los datos obligatorios fueron ingresados correctamente, pide confirmación para grabar, si hay datos errados o faltan, pide sean completados. 
1) El usuario confirma presionando el botón “grabar”. 
1) Sólo si la información está completa de acuerdo con los criterios de consistencia de la tabla mencionada aquí, el sistema crea el registro.  
1) Regresa a la vista principal de Usuarios y Perfiles. 
1) Termina el proceso. 
5. Si elige CONSULTAR: 
1) El usuario da clic o enter sobre la línea del Usuario a consultar.  
1) El sistema muestra los datos que tiene registrados del Usuario, sin posibilidad de cambios. 
1) El usuario termina la consulta, presionando ESC o el botón “salir”.
1) Regresa a la vista principal del Módulo de Usuarios y Perfiles. 
1) Termina el proceso. 
6. Si elige ACTUALIZAR: 
1) El usuario presiona el ícono “editar” en el Usuario que desea modificar. 
1) El sistema muestra los datos modificables disponibles para cambio y muestra protegidos los datos que por estructura del sistema no pueden ser alterados.
1) El usuario efectúa las modificaciones. 
1) Confirma la actualización presionando el botón “grabar”, si el sistema no encuentra errores, continúa con el proceso.
1) Graba el registro, el sistema procede hacer los cambios.  
1) Regresa a la vista principal del Módulo de Usuarios y Perfiles. 
1) Fin del proceso. 
7. Si elige Eliminar: 
1) El usuario posicionado en el Usuario a eliminar presiona el ícono “tacho” 



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



2) El sistema muestra una ventana para pedir confirmación de eliminación. 
2) El sistema cambia el estado del registro a “No vigente” y actualiza los datos de auditoría de cambios.
2) Regresa a la vista principal del Módulo de Usuarios y Perfiles. 
2) Fin del proceso. 
8. Si elige Suspender: 
1) El usuario posicionado en el Usuario a Suspender presiona el ícono “Suspender” 
1) El sistema muestra una ventana para pedir confirmación de suspensión. 
1) El sistema cambia el estado del registro a “Suspendido” y actualiza los datos de auditoría de cambios.
1) Regresa a la vista principal del Módulo de Usuarios y Perfiles. 
1) Fin del proceso. 

<a name="_page79_x82.00_y394.00"></a>**Caso de uso: Expiración automática de accesos** 

**Actor: Sistema** 

**Descripción:** Proceso automático que al cumplimiento de la fecha de expiración de Usuario, cambia de estado.** 

**Flujo principal:** 

1. El sistema analiza y filtra los perfiles de usuario Vigentes que tengan fecha de expiración y que esta fecha sea igual al día actual o anterior.
1. Para todos los perfile de usuarios seleccionados, actualiza el estado a “Expirado” 
1. Actualiza los datos de auditoría por modificación.
1. Graba el registro. 
1. Notifica la acción automática ejecutada.
1. Termina el proceso. 



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>

<a name="_page80_x82.00_y130.00"></a>**OPCIONES APLICABLES A MÁS DE UN MÓDULO:** 

Aquí detallaremos las opciones que pueden ser aplicadas en todos los módulos .<a name="_page80_x131.00_y182.00"></a>**Caso de uso :<a name="_page80_x204.00_y182.00"></a> WORKFLOW DE APROBACIÓN DE CAMBIOS** 

**Actor: Usuario**  

**Descripción:** Todo mantenimiento realizado en los Módulos Procesos, Documentos (internos), Activos de Data, Riesgos, Observaciones de auditoría, Planes de Mejora, Reglas de negocio, pasan por un flujo de aprobación que se inicia cuando el usuario decide solicitar la aprobación para que el documento quede disponible para uso en la Organización.

Los Estados de este workflow son aplicables a todos los Módulos mencionados en el párrafo anterior y son los siguientes: 



|**Estado** |**Comportamiento** |**Ampliaciones** |
| - | - | - |
|Edición |Entidad en creación o en modificación. Mientras una entidad está en modificación, la versión vigente, sigue publicada sin alteraciones ||
|Revisión (opcional) |Este estado corresponde a la entidad a la cual se terminó de hacer las modificaciones y a su aprobación por el revisor debe pasar a aprobación|Puede no existir un revisor salta al aprobador. Puede existir más de un revisor. Para cambiar de estado, debe ser aprobado por todos los revisores. |
|Aprobación (opcional) |Llegan a este estado todas las entidades que han sido aprobadas en la etapa de revisión. |<p>Puede no existir un Aprobador salta a Publicado. </p><p>Puede existir más de un aprobador. Para cambiar de estado, debe ser aprobado por todos los que existen. </p>|
|Publicado |Únicamente las entidades aprobadas, pasan a estado “Vigente” y son visibles para todos en la Organización que tengan nivel de acceso para verlos o usarlos||
Cada cambio de estado debe quedar registrado en la Tabl[a Flujo de aprobaciones ](#_page121_x82.00_y351.00)

**Flujo Principal:** 



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



1. Viene de toda opción que necesite hacer una actualización de una entidad y esta requiere aprobación previa antes de ser publicada. 
1. Modifica el campo “Estado” de la entidad, pasando su estado de “edición” a “revisión” siempre que existan personas con el rol “revisor” para la entidad. 
1. Si existen Revisores, aparecerá en la bandeja de “Aprobaciones pendientes” de los Usuarios que tengan el perfil de “Revisores” de la entidad específica que se desea actualizar.
1) De acuerdo con la configuración del Estado “Revisión” puede ser necesario que todos los “Revisores” configurados aprueben o que baste con que uno de ellos apruebe la creación o cambio. 
1) Si al menos uno de los “Revisores” no aprueba, se deberá ingresar el motivo de comentario de rechazo y el estado regresa a “edición”.
1) Si se aprueba la “Revisión”, se cambia el estado a “Aprobación”. 
4. Si existen Aprobadores, aparecerá en la bandeja de “Aprobaciones pendientes” de los Usuarios que tengan el perfil de “Aprobadores” de la entidad específica que se desea actualizar. 
1) De acuerdo con la configuración del Estado “Aprobación” puede ser necesario que todos los “Aprobadores” configurados aprueben o que baste con que uno de ellos apruebe la creación o cambio.
1) Si al menos uno de los “Aprobadores” no aprueba, se deberá ingresar el motivo de comentario de rechazo y el estado regresa a “edición”. 
5. Si no existen Revisores y Aprobadores o si todos los “Aprobadores” dan su conformidad, entonces, la entidad en cuestión cambia su estado a “Vigente”. 
5. La versión anterior pasa a estado “No vigente” 
5. Se actualiza la tabla de Flujo de aprobaciones.
5. Se termina el proceso. 

Precondiciones: 

- **7 jul 2025:** 
- EL SOE está compuesto por: 
- S: Sponsor (Aprobador) 
- O: Owner (Dueño, también llamado Revisor en el documento) 
- E: Editor 


<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



- Toda persona definida como USUARIO, puede ser miembro del SOE de alguna de las Entidades del sistema. 
- Los miembros del SOE se definen obligatoriamente al crear una nueva entidad en el sistema 
- El Sponsor es único, lo mismo que el Owner.
- En el caso de los Editores, pueden ser uno o más.
- El sistema precargará la lista de revisores y aprobadores definida en el nivel inmediato superior la cual se podrá customizar para el flujo actual. Se define a nivel de Posiciones. 
- El Sponsor y Dueño del proceso son obligatorios y no modificables.
- Puedo aumentar posiciones en revisores, aprobadores.
- El sistema precargará entre los aprobadores a las personas configuradas para el control del proceso (Por ejemplo, Administrador Documental, responsable de publicación,  etc.) en el orden definido en la configuración. Estas personas no podrán eliminarse del workflow de aprobación. 
- El  sistema  enviará  una  notificación  (personalizable)  a  la  persona  que  debe aprobar el workflow que incluye los datos del documento/proceso/riesgo/etc. y un enlace de acceso directo para aprobar o rechazar el documento sin tener que 

  ingresar al sistema. 

- El sistema enviará una notificación (personalizable) al editor del proceso  en caso de que el documento/proceso/riesgo/etc. haya sido rechazado, mostrando los  motivos  o  comentarios  de  rechazo  y  un  enlace  de  acceso  directo  para acceder al documento sin tener que ingresar al sistema.
- El sistema enviará una notificación (personalizable) recordatorio a la persona 

  que tiene que revisar o aprobar, cada X días (configurable) hasta que se apruebe 

- rechace el documento

**Postcondiciones:** 

- **Ninguna** 

<a name="_page82_x82.00_y587.00"></a>**Caso de uso: Configuración de duración de los procesos** 

**Actor:**  Administrador de la plataforma 

**Descripción:** Permite definir el tiempo que un proceso pasa a “No vigente” en forma automática. 

**Flujo Principal:** 

1. El Administrador configura en el **Maestro de parámetros del sistema** el número de años, meses, días, de vigencia posible por cada tipo de proceso.  



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



2. La  fecha  de  expiración  preestablecida  es  un  campo  calculado  **en  cada cabecera de proceso** a partir de la Fecha en que se coloca el proceso en estado “Vigente”. (Fecha  de Expiración = Fecha de publicación + años + meses + días) de esta configuración. 
2. Adicional  a  la  definición  del  tiempo  de  duración  de  un  proceso  se  debe configurar cual es la periodicidad de envío de alertas y recordatorios:
- **Inicio de alertas**: Cantidad de días, si es negativo, es la cantidad de días antes del vencimiento. Si es positivo, es la cantidad de días luego del vencimiento, pudiendo ser cero (el mismo día).
- **Recordatorios**: Se activan  luego del inicio de las alertas, es un número que indica la cantidad de días, ejemplo: 2, la alerta se enviará cada dos días antes del vencimiento, ejemplo: 0, no se enviarán alertas, 365, se 

  enviará cada año. 

Precondiciones:  

- El administrador debe estar autenticado y tener permisos para gestionar los parámetros del sistema.

**Postcondiciones:**  

- Ninguna. 

<a name="_page83_x82.00_y490.00"></a>**Caso de uso: Alertas de vencimientos** 

**Actor:  Sistema** 

**Descripción:** Envío automático de alertas a los Dueños de procesos de los procesos que pasarán a “No vigente” en forma automática o envío de alertas y recordatorios a los responsables de planes de acción por observaciones de auditoría. 

**Flujo Principal:** 

1. El sistema hará el filtro de los procesos que cumplen con la condición de envío de alertas o de recordatorios de vencimiento o vendrá del caso de uso Alertas y Recordatorios del Módulo de Auditoría. 
1. A las  entidades  que  cumplan  con  el  filtro,  el  sistema  enviará  un  correo recordatorio a quien aparece como Dueño de proceso o responsable del plan 



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>

de acción  con el detalle de procesos por vencer y un enlace que lo dirige al proceso o al detalle de la actividad de auditoría por vencer, lo que corresponda. 

**Precondiciones:**  

- Los parámetros de alertas de vencimientos de procesos y de planes de acción por auditoría están definidos. 

**Postcondiciones:**  

- Ninguna. 

**Caso de Uso** 

**Nombre: Rehabilitación de un proceso Actor:  Usuario** 

**Descripción:** Evaluación del usuario de los procesos en estado “No vigente” a fin de tomar acción sobre su rehabilitación o no. 

**Flujo Principal:** 

1. El usuario accede a analizar un proceso “No vigente” 
1. El usuario determina, si debe extender la vigencia del proceso y elige la opción “Rehabilitar” 
1. El sistema  mostrará la nueva fecha de expiración del proceso basado en la configuración del **Maestro de parámetros del sistema**
1. El usuario puede modificar la nueva fecha de expiración, sin restricciones de aumentar o disminuir el tiempo.
1. El usuario confirma la “Rehabilitación”, dando clic en “grabar” o abandona el proceso manteniendo el proceso en estado “No vigente”.
1. El sistema graba la información. 
1. Termina el proceso. 

**Precondiciones:**  

- El proceso se debe encontrar en estado “No vigente”
- El usuario que ingresa debe tener el rol de “Dueño del proceso” en evaluación. 

**Postcondiciones:**  

- Ninguna. 



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>

<a name="_page85_x82.00_y130.00"></a>**Caso de uso: Log de accesos a la información** 

**Actor:  Sistema** 

**Descripción:** 

El **log  de  accesos** es tiene  como  objetivo  **documentar  cada  interacción** que realizan los usuarios dentro de la aplicación, generando un registro de los accesos a los diferentes módulos y consultas realizadas. Cada vez que un usuario acceda a información dentro del sistema, se generará automáticamente un **log de auditoría** que almacenará los  **datos clave de identificación** que se  documenta  en Ta[bla – Log de accesos. ](#_page136_x82.00_y115.00)

Este  registro  proporciona  **trazabilidad  completa**  sobre  quién  accede  a  qué información, lo que permite: 

- **Garantizar la transparencia** en el uso del sistema. 
- **Respaldar auditorías internas y externas** en relación con la seguridad y confidencialidad de la información.
- **Detectar accesos indebidos o no autorizados**. 
- **Analizar patrones de uso del sistema** para identificar posibles mejoras o anomalías operativas. 

El registro de auditoría será **inmutable**, lo que garantiza que no pueda ser alterado 

- eliminado,  proporcionando  así  **pruebas  fiables**  en  caso  de  incidentes  de seguridad o requerimientos regulatorios. Además, podrá ser consultado mediante filtros avanzados por fecha, usuario, módulo o tipo de acción, facilitando así la investigación de eventos específicos.

  <a name="_page85_x82.00_y592.00"></a>**Caso de uso: Cronología de versiones de una entidad** 

  **Actor:  Usuarios con acceso a los módulos**

  **Descripción:** 

  Esta opción permitirá visualizar, a través de una gráfica cronológica, la evolución de las versiones de una entidad dentro del sistema, mostrando claramente la duración de las versiones a lo largo del tiempo. Esto facilitará el entendimiento de duración entre versiones. 

  **Flujo Principal:** 

 

<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



1. El usuario accede a cualquiera de los Módulos de la app
1. El usuario da clic en la opción “Línea de tiempo” de la entidad  
1. El sistema mostrará una línea de tiempo horizontal y generará un punto en cada fecha que la versión fue creada o anulada o reemplazada por una nueva
1. Los datos que deben quedar visibles en cada punto de la línea de tiempo son Nro. de versión, Resumen de la versión, Fecha de creación, Fecha de anulación, Estado de la versión.  
1. El usuario puede dar clic en cualquiera de los puntos de la línea de tiempo y el sistema lo llevará a la versión de la entidad en modo consulta. 
1. Al finalizar, el usuario presiona “Esc” o elige la opción “Salir”.  

<a name="_page86_x82.00_y308.00"></a>**Caso de uso: Parámetros generales de la app** 

**Actor:  Administrador de la app o Super usuario del cliente**

**Descripción:** 

El módulo de  **Parámetros del Sistema** permite la configuración inicial y ajustes generales que determinan el comportamiento de la aplicación. A través de esta funcionalidad, los administradores podrán definir aspectos clave como formato de fecha y hora, moneda, zona horaria, idioma, políticas de seguridad, notificaciones y reglas de operación. Estos parámetros garantizan la adaptabilidad del sistema a las necesidades de cada organización, optimizando su uso y alineándolo con sus estándares de gestión.

**Flujo Principal:** 

1. El usuario accede a la sección “Parámetros del sistema”
1. El sistema muestra los parámetros generales según definición de la  [Tabla - Parámetros generales.](#_page135_x82.00_y302.00)
1. El sistema muestra las opciones disponibles “Crear”, “Modificar”, “Consultar”, “Eliminar”. 
1. El sistema muestra todos los parámetros creados con su información básica: ID de parámetro, Nombre y valor. 
1. Si elige CREAR: 
- Presiona el ícono “+” (adicionar) 
- El sistema muestra los datos a ingresar según definiciones en Tabl[a - Parámetros generales.](#_page135_x82.00_y302.00)



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



- Si los datos obligatorios fueron ingresados correctamente, pide confirmación para grabar, si hay datos errados o faltan, pide sean completados. 
- El usuario confirma presionando el botón “grabar”. 
- Sólo si la información está completa de acuerdo con los criterios de consistencia de la tabla mencionada aquí, el sistema crea el registro. 
- Regresa a la vista principal de Parámetros generales. 
- Termina el proceso. 
6. Si elige CONSULTAR: 
- El usuario da clic o enter sobre la línea del Parámetro a consultar.  
- El sistema muestra los datos que tiene registrados del Parámetro, sin posibilidad de cambios. 
- El usuario termina la consulta, presionando ESC o el botón “salir”.
- Regresa a la vista principal de los Parámetros generales. 
- Termina el proceso. 
7. Si elige ACTUALIZAR: 
   1. El usuario presiona el ícono “editar” en el Parámetro que desea modificar. 
   1. El sistema muestra los datos modificables disponibles para cambio y muestra protegidos los datos que por estructura del sistema no pueden ser alterados. 
   1. El usuario efectúa las modificaciones. 
   1. Confirma la actualización presionando el botón “grabar”, si el sistema no encuentra errores, continúa con el proceso.
   1. Graba el registro, el sistema procede hacer los cambios.  
   1. Regresa a la vista principal de los parámetros generales. 
   1. Fin del proceso. 
8. Si elige Eliminar: 
   1. El usuario posicionado en el parámetro a eliminar presiona el ícono “tacho”
   1. El sistema muestra una ventana para pedir confirmación de eliminación.
   1. El sistema cambia el estado del registro a “No vigente” y actualiza los datos de auditoría de cambios. 
   1. Regresa a la vista principal de los parámetros generales. 
   1. Fin del proceso. 



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>

4. **Requerimientos<a name="_page88_x82.00_y115.00"></a> No Funcionales** 

   **Rendimiento:** Tiempos de respuesta esperados, número máximo de usuarios simultáneos, etc. 

   **Seguridad:** Requerimientos de autenticación, encriptación, y protección de datos. 

   **Compatibilidad:** Navegadores, dispositivos y sistemas operativos soportados. **Escalabilidad:** Capacidad del sistema para crecer según las necesidades del negocio. 

5. **Diseño<a name="_page88_x82.00_y267.00"></a> de la Solución Arquitectura Propuesta:**  

![](Aspose.Words.3184fba8-1f57-4373-a4d7-5b011bad4160.010.jpeg)



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>

**Ubicación de la arquitectura:** 

En este enlace se accede a la arquitectura diseñada: <https://github.com/WalterAtuncar/GestionProcesos>

Para tener acceso a ella con otros usuarios por favor, proporcionar un usuario de GitHub. 

![](Aspose.Words.3184fba8-1f57-4373-a4d7-5b011bad4160.011.jpeg)

6. **Anexos<a name="_page89_x82.00_y479.00"></a>** 

**Glosario de Términos:**  

|**Término** |**Definición** |
| - | - |
|Actor |Entidades que interactúan con el sistema, como usuarios, otros sistemas,  o  dispositivos.  En  el  contexto  de  la  gestión  por procesos, los actores podrían ser empleados, administradores, clientes, etc. |
|API |Conjunto de reglas y herramientas que permiten que la aplicación se comunique con otros sistemas. En una app de gestión por procesos,  las  APIs  pueden  ser  utilizadas  para  integrarse  con sistemas externos como ERP, CRM, etc.|
|Autenticación y Autorización |La manera en que los usuarios se identifican dentro del sistema (autenticación) y cómo se gestionan sus permisos y accesos a diferentes funcionalidades (autorización).|
|Base de datos |Estructura que almacena toda la información necesaria para el funcionamiento  de  la  aplicación,  como  usuarios,  procesos, tareas, estados, etc.|



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



<table><tr><th colspan="2" valign="top">Caso de uso </th><th colspan="3">Escenarios  detallados  que  describen  cómo  los  actores interactúan con la aplicación para realizar una tarea específica. Incluye los pasos, entradas y salidas, y excepciones.</th></tr>
<tr><td colspan="2" valign="top">Control de versiones </td><td colspan="3">Mecanismo para gestionar y registrar los cambios realizados al código fuente de la aplicación, permitiendo su seguimiento y la restauración a versiones anteriores si es necesario.</td></tr>
<tr><td colspan="2" valign="top">Dashboard </td><td colspan="3">Panel  de  control  o  interfaz  visual  que  proporciona  una  visión general de los procesos, tareas y métricas clave de la aplicación. Usualmente incluye gráficos, estadísticas y alertas.</td></tr>
<tr><td colspan="2" valign="top">Dependencias </td><td colspan="3">Relaciones entre distintos procesos o módulos que requieren que uno termine antes de que otro pueda iniciarse.</td></tr>
<tr><td colspan="2" valign="top">DoD </td><td colspan="3">Describe las características, la funcionalidad, el rendimiento y otros requisitos que deben cumplirse antes de que se considere que un módulo u opción del sistema está terminado.</td></tr>
<tr><td colspan="2" valign="top">Escalabilidad </td><td colspan="3">Capacidad del sistema para manejar un aumento en el volumen de usuarios o datos sin afectar su rendimiento.</td></tr>
<tr><td colspan="2" valign="top">Especificación funcional </td><td colspan="3">Descripción detallada de las funcionalidades que la aplicación debe  ofrecer  al  usuario  final,  como  la  creación  de  procesos, seguimiento de tareas, etc.</td></tr>
<tr><td colspan="2" valign="top">Grilla </td><td colspan="3">Tabla  para  el  ingreso  de  datos  o  para  mostrarlos,  tiene interactividad para elegir datos de otras tablas</td></tr>
<tr><td colspan="2" valign="top">Historial de actividad </td><td colspan="3">Registro de todas las acciones realizadas en la aplicación, tanto por los usuarios como por el sistema, que puede ser consultado para auditoría o análisis de rendimiento.</td></tr>
<tr><td colspan="2" valign="top">Integración </td><td colspan="3">Proceso  de  conectar  la  app  de  gestión  con  otros  sistemas  o servicios externos (como herramientas de contabilidad, sistemas ERP,  etc.)  para  intercambiar  datos  y  optimizar  los  flujos  de trabajo. </td></tr>
<tr><td colspan="2" valign="top">Interacción </td><td colspan="3">Cómo el usuario interactúa con la aplicación, incluyendo el flujo de datos entre el sistema y el usuario, y las acciones que pueden desencadenar cambios en el sistema.</td></tr>
<tr><td colspan="2" valign="top">Módulo </td><td colspan="3">Sección o unidad funcional dentro de la aplicación que maneja un conjunto específico de actividades o funciones. Por ejemplo, un módulo de “Gestión de Inventarios” o “Gestión de Tareas”. </td></tr>
<tr><td colspan="2" valign="top">Notificaciones </td><td colspan="3">Alertas  o mensajes  automáticos enviados a  los usuarios para informarles  de  cambios  en  el  estado  de  un  proceso,  tarea,  o evento importante dentro del sistema.</td></tr>
<tr><td colspan="2">Pantalla o interfaz de usuario </td><td colspan="3">Las páginas, formularios, botones y otros componentes gráficos que el usuario ve e interactúa dentro de la aplicación.</td></tr>
<tr><td colspan="2" valign="top">Performance </td><td colspan="3">Medición  de  la  rapidez  con  que  el  sistema  responde  a  las acciones  del  usuario,  como  tiempos  de  carga  de  páginas  y ejecución de tareas. </td></tr>
<tr><td colspan="2" valign="top">Proceso de negocio </td><td colspan="3">Un conjunto de actividades o tareas relacionadas que se agrupan para lograr un objetivo dentro de la organización. En una app de gestión por procesos, se modelan estos procesos para facilitar su automatización. </td></tr>
<tr><td colspan="2" valign="top">Prompt </td><td colspan="3">Instrucción o conjunto de indicaciones proporcionadas por un usuario a un modelo de inteligencia artificial para  obtener una </td></tr>
<tr><td colspan="1" rowspan="3">![ref1]</td><td colspan="2">Especificaciones funcionales</td><td colspan="1">CÓDIGO: </td><td colspan="1">OPSP-FRM10 </td></tr>
<tr><td colspan="2" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



||respuesta o realizar una tarea específica. Un prompt puede incluir texto,  preguntas  o  comandos  diseñados  para  guiar  el comportamiento de la IA en función de los objetivos del usuario|
| :- | - |
|Prueba de usuario |Evaluación de la aplicación por los usuarios finales para verificar que  los  requerimientos  y  funciones  están  implementados correctamente antes de su lanzamiento.|
|Reglas de negocio |Normas o directrices que definen las operaciones, conductas o decisiones dentro del sistema. Estas reglas  controlan cómo los procesos se deben ejecutar en diferentes escenarios.|
|Requerimientos no funcionales |Aspectos  relacionados  con  el  rendimiento,  seguridad, accesibilidad,  y  otros  factores  que  no  están  directamente relacionados con las  funcionalidades, pero son esenciales para el funcionamiento correcto de la aplicación.|
|Seguridad |Conjunto de medidas para garantizar la protección de los datos y el acceso a la aplicación, incluyendo cifrado, protección contra accesos no autorizados, etc.|
|Tareas |Acciones  individuales  o  subprocesos  dentro  de  un  flujo  de trabajo. Pueden ser  asignadas  a usuarios específicos para  su ejecución. |
|Usabilidad |El grado de facilidad con el que los usuarios pueden utilizar la aplicación.  En  la  especificación  funcional,  se  definen  las características  que  hacen  que  la  aplicación  sea  intuitiva  y eficiente. |
|Workflow |Secuencia de pasos o actividades en un proceso de negocio que se modela y automatiza en la aplicación. Representa el camino lógico que sigue una tarea desde su inicio hasta su finalización.|

7. **Referencias:<a name="_page91_x82.00_y498.00"></a>**  

Documentos, estudios o marcos teóricos relevantes.

8. **Diagramas<a name="_page91_x82.00_y578.00"></a> Adicionales:**  

   Diagramas de flujo, wireframes o esquemas detallados.

9. **Estructuras<a name="_page91_x82.00_y652.00"></a> de tablas:**  

<a name="_page91_x82.00_y697.00"></a>Tabla CABECERA DEL PROCESO 



|**Nombre del campo** |**Tipo de dato** |**Descripción** |**Posibles valores** |**Obligatorio** **(Sí/No)** |
| :- | - | - | :- | :-: |



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



|ID |Alfanumérico |Identificador único de cada Proceso ||Sí |
| - | - | :- | :- | - |
|Código de proceso |Alfanumérico |De acuerdo con la estructura de códigos que maneje la organización ||No |
|Nombre Proceso |Texto |Nombre del proceso |Libre |Sí |
|Nivel |Numérico |Establece la ubicación jerárquica del proceso |<p>1 estratégico 2 táctico </p><p>3 operativo </p>|Sí |
|Criticidad |Código |Identifica a los Procesos en base a la importancia para la Empresa |<p>1 crítico </p><p>2 no crítico </p>|Sí |
|**Versión** |Numérico |Nro. De versión del proceso calculado automáticamente por el sistema cada vez que se construye una nueva versión |Números enteros ilimitados |Sí |
|Resumen de la versión |Texto |Breve explicación del contenido de la versión ||Sí |
|**Estado** |Código |Refleja el estado de vigente o no del registro |<p>1 edición </p><p>2 vigente </p><p>3 no vigente 4 archivado 5 eliminado </p>|Sí |
|Proceso Padre |Alfanumérico |<p>Identificador  del proceso  padre  al que pertenece este proceso. El sistema propone en base al título  del  proceso cuál  sería  el proceso  padre  al que  está  asociado, también  el  usuario puede </p><p>seleccionarlo ingresando </p><p>palabras clave para filtrar los procesos</p>|Referenciado de la tabla de Procesos |Sí |
|Acuerdo de nivel de servicio |||||
|Dueño del proceso |Código |Seleccionado de las Posiciones de la Organización |||


<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



<table><tr><th colspan="2">Número de instancias del periodo </th><th colspan="1" valign="top">Numérico </th><th colspan="1">Las veces que se ejecutan en el periodo </th><th colspan="2"></th><th colspan="2"></th></tr>
<tr><td colspan="2" valign="top">Frecuencia del periodo </td><td colspan="1" valign="top">Código </td><td colspan="1"></td><td colspan="2">Diario Semanal Mensual Bi mensual Trimestral Anual </td><td colspan="2"></td></tr>
<tr><td colspan="2" valign="top">Tiempo del ciclo del proceso </td><td colspan="1" valign="top">hh:mm:ss </td><td colspan="1">Calculado con la suma de los tiempos de las actividades </td><td colspan="2"></td><td colspan="2"></td></tr>
<tr><td colspan="2" valign="top">Fecha de inicio </td><td colspan="1" valign="top">Fecha (dd/mm/aaaa) </td><td colspan="1">En que el proceso inicia su vigencia, definido por el usuario, se propone la fecha actual </td><td colspan="2"></td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Fecha de expiración </td><td colspan="1" valign="top">Fecha (dd/mm/aaaa) </td><td colspan="1">Inicialmente calculado con la Fecha de inicio y la suma del tiempo de duración definido en los Parámetros del sistema. El dato calculado puede ser alterado por el Usuario para más o menos tiempo </td><td colspan="2"></td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Fecha de anulación </td><td colspan="1" valign="top">Fecha (dd/mm/aaaa) </td><td colspan="1">Si el Estado del Proceso es Caducado, Archivado, Anulado, esta fecha es obligatoria </td><td colspan="2" valign="top">Fechas mayores a la fecha de inicio </td><td colspan="2" valign="top">Condicionado </td></tr>
<tr><td colspan="2" valign="top">Usuario creador </td><td colspan="1" valign="top">Código </td><td colspan="1">Obtenido de las Posiciones de la Organización </td><td colspan="2"></td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Fecha de Registro </td><td colspan="1" valign="top">Fecha (dd/mm/aaaa) </td><td colspan="1">El sistema registra la Fecha en que se creó por primera vez el proceso </td><td colspan="2" valign="top">Fecha del día </td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Usuario que modifica </td><td colspan="1" valign="top">Código </td><td colspan="1">Guarda la información de la última modificación, es obligatorio en todo tipo de edición que termine en actualización del proceso </td><td colspan="2"></td><td colspan="2" valign="top">Condicionado </td></tr>
<tr><td colspan="2">Fecha de modificación </td><td colspan="1">Fecha (dd/mm/aaaa) </td><td colspan="1">Guarda la fecha de la última </td><td colspan="2"></td><td colspan="2" valign="top">Condicionado </td></tr>
<tr><td colspan="1" rowspan="3">![ref1]</td><td colspan="4">Especificaciones funcionales</td><td colspan="2">CÓDIGO: </td><td colspan="1">OPSP-FRM10 </td></tr>
<tr><td colspan="4" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="2">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="2">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



|||modificación, es obligatorio en todo tipo de edición que termine en actualización del proceso |||
| :- | :- | :- | :- | :- |
<a name="_page94_x82.00_y215.00"></a>Tabla ACTIVIDADES 



<table><tr><th colspan="2"><b>Nombre del campo</b> </th><th colspan="1" valign="top"><b>Tipo de dato</b> </th><th colspan="1" valign="top"><b>Descripción</b> </th><th colspan="3" valign="top"><b>Posibles valores</b> </th><th colspan="1"><b>Obligatorio</b> <b>(Sí/No)</b> </th></tr>
<tr><td colspan="2" valign="top">ID </td><td colspan="1" valign="top">Alfanumérico </td><td colspan="1">Identificador único de cada Proceso </td><td colspan="3"></td><td colspan="1" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Secuencia </td><td colspan="1" valign="top">Numérico </td><td colspan="1">Número de actividad dentro de la secuencia de ejecución. Modificable por el Usuario con ingreso de dato o arrastrándolo </td><td colspan="3"></td><td colspan="1" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Responsable </td><td colspan="1" valign="top">Referenciado de la Organización </td><td colspan="1">Al ingresar este dato, el sistema muestra las POSICIONES de la compañía que coinciden con el texto ingresado y permite seleccionar la POSICION de la compañía </td><td colspan="3"></td><td colspan="1" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Actividad </td><td colspan="1" valign="top">Texto </td><td colspan="1">El sistema valida que el texto ingresado comience con una acción (verbo) y sugiere mediante un pop-up informativo cual es la forma correcta </td><td colspan="3"></td><td colspan="1" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Detalle </td><td colspan="1" valign="top">Texto largo con formato </td><td colspan="1">Detalle de las acciones de la actividad </td><td colspan="3"></td><td colspan="1" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Tipo de objeto BPMN </td><td colspan="1" valign="top">Código </td><td colspan="1" valign="top">Descripción </td><td colspan="3">Inicio Fin Tarea Decisión </td><td colspan="1" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Sub Tipo de objeto </td><td colspan="1" valign="top">Código </td><td colspan="1"></td><td colspan="3"><p>Manual Automático Envío Recepción </p><p>Regla de negocio </p></td><td colspan="1" valign="top">Sí </td></tr>
<tr><td colspan="1" rowspan="3">![ref1]</td><td colspan="4">Especificaciones funcionales</td><td colspan="1">CÓDIGO: </td><td colspan="2">OPSP-FRM10 </td></tr>
<tr><td colspan="4" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="2">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="2">15/01/2025 </td></tr>
</table>



|Tipo de actividad |Código ||Manual Automático |Sí |
| - | - | :- | :- | - |
|Tipo Función |Código ||Digitación Traslado Supervisión Aprobación Revisión |Sí |
|Regla de negocio |Código |Fórmulas de la organización para calcular |Referenciado de la tabla Reglas de negocio |No |
|Siguiente actividad |Numérico |En caso de Decisión, indicará la siguiente actividad del proceso a ejecutar ||No |
|Como |Texto |Descripción de las acciones en esta parte del proceso ||Sí |
|Sistemas |Código |el sistema muestra los SISTEMAS de la compañía que coinciden con el texto ingresado y permite seleccionar el SISTEMA de la compañía (puede seleccionar varios) |Uno o varios de la Tabla Sistemas |No |
|Duración |Tiempo (hh:mm:ss) |Es el tiempo total de esfuerzo en ejecutar la actividad |<p>Horas o minutos </p><p>o segundos </p>|Sí |
|Cantidad de Personas |Número |Cantidad de personas asignadas a esta actividad |Número entero |Sí |
|Costo de la actividad |||||
|Fecha de Registro |Fecha (dd/mm/aaaa) |El sistema registra la Fecha en que se creó por primera vez el proceso |Fecha del día |Sí |
|Usuario de creación |Código |Usuario que crea el regisro |Se obtiene de Personas |Sí |
|Fecha de modificación  |Fecha |Fecha en que se modifica el regitro ||Sí |
|Usuario que modifica |Código |Usuario que modifica el registro |Se obtiene de Personas |Sí |

<a name="_page95_x82.00_y709.00"></a>Tabla ACTIVIDADES - Documentos 



|**Nombre del campo** |**Tipo de dato** |**Descripción** |**Posibles valores** |**Obligatorio** **(Sí/No)** |
| :- | - | - | - | :-: |



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



|ID (k) |Alfanumérico |Identificador único de cada Proceso ||Sí |
| - | - | :- | :- | - |
|Secuencia (k) |Numérico |Número de actividad dentro de la secuencia de ejecución.  ||Sí |
|Tipo |Código |Define si el documento que usa la actividad es de entrada de información o de salida |Entrada Salida |Sí |
|Documento |Código |el sistema muestra los DOCUMENTOS de la compañía que coinciden con el texto ingresado y permite seleccionar el DOCUMENTO de la compañía (puede seleccionar varios) |Uno de la Tabla DOCUMENTOS |No |
|Fecha de Registro |Fecha (dd/mm/aaaa) |El sistema registra la Fecha en que se creó por primera vez el proceso |Fecha del día |Sí |
|Usuario de creación |Código |Usuario que crea el registro |Se obtiene de Personas |Sí |
|Fecha de modificación  |Fecha |Fecha en que se modifica el registro ||Sí |
|Usuario que modifica |Código |Usuario que modifica el registro |Se obtiene de Personas |Sí |

<a name="_page96_x82.00_y523.00"></a>Tabla ACTIVIDADES – Activos de Data 



|**Nombre del campo** |**Tipo de dato** |**Descripción** |**Posibles valores** |**Obligatorio** **(Sí/No)** |
| :- | - | - | - | :-: |
|ID (k) |Alfanumérico |Identificador único de cada Proceso ||Sí |
|Secuencia (k) |Numérico |Número de actividad dentro de la secuencia de ejecución.  ||Sí |
|Activos Data |Código |<p>Al ingresar un valor de búsqueda, el sistema muestra </p><p>los ACTIVOS de la Organización que coinciden con el texto ingresado y permite seleccionar el ACTIVO </p>|Referenciados de la Tabla de “Activos Data” |No |



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>

<a name="_page97_x82.00_y140.00"></a>Tabla ACTIVIDADES – Riesgos 



|**Nombre del campo** |**Tipo de dato** |**Descripción** |**Posibles valores** |**Obligatorio** **(Sí/No)** |
| :- | - | - | - | :-: |
|ID (k) |Alfanumérico |Identificador único de cada Proceso ||Sí |
|Secuencia (k) |Numérico |Número de actividad dentro de la secuencia de ejecución.  ||Sí |
|Riesgo |Código |<p>Se escribe un valor de búsqueda, Se eligen los Riesgos (puede ser ninguno </p><p>o varios) </p>|Referenciados de la “Tabla de Riesgos” |No |

<a name="_page97_x82.00_y353.00"></a>Tabla JOURNEY MAP - Cabecera 



|**Nombre del campo** |**Tipo de dato** |**Descripción** |**Posibles valores** |**Obligatorio (Sí/No)** |
| :- | - | - | :- | :-: |
|Id Journey |Alfanumérico |Identificación única para el Journey Map ||Sí |
|ID Journey  |Alfanumérico |ID dado por el Usuario ||Sí |
|Descripción |Alfanumérico |Nombre del Journey Map ||Sí |
|Definición |Texto |Texto explicativo de la caracterización del cliente ||Sí |
|Versión |||||
|Resumen de la versión |Texto |Breve explicación del contenido de la versión ||Sí |
|Fecha de Registro |Fecha (dd/mm/aaaa) |El sistema registra la Fecha en que se creó por primera vez el registro |Fecha del día |Sí |
|Usuario de creación |Código |Usuario que crea el registro |Se obtiene de Personas |Sí |
|Fecha de modificación  |Fecha |Fecha en que se modifica el registro ||Sí |
|Usuario que modifica |Código |Usuario que modifica el registro |Se obtiene de Personas |Sí |



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>

<a name="_page98_x82.00_y115.00"></a>Tabla JOURNEY MAP – Puntos de contacto 



|**Nombre del campo** |**Tipo de dato** |**Descripción** |**Posibles valores** |**Obligatorio (Sí/No)** |
| :- | - | - | :- | :-: |
|Id Journey (k) |Alfanumérico |Identificación única para el Journey Map ||Sí |
|Secuencia (k) |Numérico |Orden de los puntos de contacto |Automático |Sí |
|Acción |Alfanumérico |Define la etapa del viaje del cliente ||Sí |
|Punto de contacto |Código |Establece el tipo de contacto |Presencial Correo Llamada telefónica WhatsApp Comparte |Sí |
|Emoción |Código |Determina el efecto que causa en el cliente |Ver Tabla Emociones |Sí |
|Valor emoción |Código |Es el valor numérico de la emoción |Se obtiene de la Tabla Emociones |Sí |

<a name="_page98_x82.00_y427.00"></a>Tabla JOURNEY MAP – Relaciones 



|**Nombre del campo** |**Tipo de dato** |**Descripción** |**Posibles valores** |**Obligatorio (Sí/No)** |
| :- | - | - | :- | :-: |
|Id Journey (k) |Alfanumérico |Identificación única para el Journey Map ||Sí |
|Secuencia (k) |Numérico |Orden de los puntos de contacto |Automático |Sí |
|Tipo de relación |Alfanumérico |Respecto de la entidad que relacionan al Journey Map |<p>Proceso Actividad Unidad organizativa Posición </p><p>Persona </p><p>Sistema </p><p>Riesgo </p><p>Plan de acción Plan de auditoría Activo de Data Documento Regla de negocio Sistema de gestión </p>|Sí |
|Entidad relacionada |Código |De la entidad que se relaciona al Journey Map |Nombre en función del Tipo |Sí |



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



||||de relación que se establezca ||
| :- | :- | :- | :- | :- |
<a name="_page99_x82.00_y166.00"></a>Tabla ORGANIZACIÓN 



|**Nombre del campo** |**Tipo de dato** |**Descripción** |**Posibles valores** |**Obligatorio (Sí/No)** |
| :- | - | - | :- | :-: |
|Tipo |Código |Se pueden definir la propia o externas organizaciones |1 propia 2 externo |Sí |
|Nivel |Código |Es el nivel de la organización en la estructura jerárquica |<p>1 organización 2 unidad Organizativa 3 rol </p><p>4 posición </p>|Sí |
|ID Organización |Alfanumérico |Identificador único de la unidad organizativa (Tipo y Nro de documento de identidad) ||Sí |
|Nombre Organización |Texto |Nombre de la Empresa |Razones sociales en general |Sí |
|Nombre corto |Texto |Como se conoce a la empresa en forma abreviada |Libre |No |
|Versión |Número |Correlativo que inicia en 1, porcada creación de nueva versión se incrementa en 1 ||Sí |
|Resumen de la versión |Texto |Breve explicación del contenido de la versión ||Sí |
|Estado workflow |Código |Refleja el estado de vigente o no del registro |<p>1 edición </p><p>2 publicado 3 caducado 4 archivado </p>|Sí |
|Fecha de creación |Fecha |Fecha en que se crea la organización, es automática |Fechas en formado dd/mm/aaaa |Sí |
|Usuario creador |Código |Referencia del Usuario, sale de la Tabla USUARIOS ||Sí |
|Fecha modificación |Fecha |Fecha en que se efectuó el último cambio |Fechas en formado dd/mm/aaaa |Condicionado |
|Usuario modificador |Código |Referencia del Usuario, sale de la Tabla USUARIOS ||Condicionado |



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>

<a name="_page100_x82.00_y140.00"></a>Tabla Unidad Organizativa 



|**Nombre del campo** |**Tipo de dato** |**Descripción** |**Posibles valores** |**Obligatorio (Sí/No)** |
| :- | - | - | - | :-: |
|Nivel |Código |Es el nivel de la organización en la estructura jerárquica |<p>1 organización 2 unidad organizativa </p><p>3 rol </p><p>4 posición </p>|Sí |
|Id Unidad Org |||||
|Código de la Unidad Org |||||
|ID Organización |Alfanumérico |Identificador único de la unidad organizativa ||Sí |
|Nombre Unidad |||||
|Depende De |||||
|Posición |Código |<p>Determina si es parte de la organización jerárquica o corresponde a una unidad de asesoría </p><p>o apoyo </p>|<p>1 staff </p><p>2 asesor (derch.) 3 apoyo (izq.) </p>|Sí |
|Estado  |Código |Indica si la Unidad Org se encuentra vigente o no |Activa Suspendida Vacante Caducada Ausente ||
|Objetivo  |Texto |Describe el propósito de la posición en la organización ||Sí |
|Centro de costo |||||
|Versión |Número |Correlativo que inicia en 1, porcada creación de nueva versión se incrementa en 1 ||Sí |
|Resumen de la versión |Texto |Breve explicación del contenido de la versión ||Sí |
|Estado workflow |Código |Refleja el estado de vigente o no del registro |<p>1 edición </p><p>2 publicado 3 caducado 4 archivado </p>|Sí |
|Fecha de Registro |Fecha (dd/mm/aaaa) |El sistema registra la Fecha en que se |Fecha del día |Sí |



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



|||creó por primera vez el proceso |||
| :- | :- | :- | :- | :- |
|Usuario de creación |Código |Usuario que crea el regisro |Se obtiene de Personas |Sí |
|Fecha de modificación  |Fecha |Fecha en que se modifica el regitro ||Sí |
|Usuario que modifica |Código |Usuario que modifica el registro |Se obtiene de Personas |Sí |

<a name="_page101_x82.00_y240.00"></a>Tabla POSICIONES 



<table><tr><th colspan="2"><b>Nombre del campo</b> </th><th colspan="1" valign="top"><b>Tipo de dato</b> </th><th colspan="1" valign="top"><b>Descripción</b> </th><th colspan="3" valign="top"><b>Posibles valores</b> </th><th colspan="1"><b>Obligatorio (Sí/No)</b> </th></tr>
<tr><td colspan="2" valign="top">Nivel </td><td colspan="1"></td><td colspan="1"></td><td colspan="3"><p>Organización Unidad Org Rol </p><p>Posición </p></td><td colspan="1"></td></tr>
<tr><td colspan="2" valign="top">ID Organización </td><td colspan="1" valign="top">Alfanumérico </td><td colspan="1">Identificador único de la unidad organizativa </td><td colspan="3"></td><td colspan="1" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">ID Unidad Org </td><td colspan="1" valign="top">Código </td><td colspan="1"></td><td colspan="3"></td><td colspan="1"></td></tr>
<tr><td colspan="2" valign="top">ID Posición </td><td colspan="1" valign="top">Código </td><td colspan="1"></td><td colspan="3"></td><td colspan="1"></td></tr>
<tr><td colspan="2" valign="top">Nombre de la Posición </td><td colspan="1" valign="top">Texto </td><td colspan="1"></td><td colspan="3"><p><b>Ejemplos:</b> Asistente Analista Supervisor Jefe </p><p>Sub Gerente Gerente Vicepresidente Vicepresidente Ejecutivo </p></td><td colspan="1"></td></tr>
<tr><td colspan="2" valign="top">Versión </td><td colspan="1" valign="top">Número </td><td colspan="1">Correlativo que inicia en 1, porcada creación de nueva versión se incrementa en 1 </td><td colspan="3"></td><td colspan="1" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Resumen de la versión </td><td colspan="1" valign="top">Texto </td><td colspan="1">Breve explicación del contenido de la versión </td><td colspan="3"></td><td colspan="1" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Estado workflow </td><td colspan="1" valign="top">Código </td><td colspan="1" valign="top">Refleja el estado de vigente o no del registro </td><td colspan="3"><p>1 edición </p><p>2 publicado 3 caducado 4 archivado</b> </p></td><td colspan="1" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Estado  </td><td colspan="1" valign="top">Código </td><td colspan="1" valign="top">Indica si la Posición se encuentra vigente o no </td><td colspan="3">Activa Suspendida Vacante Caducada Ausente </td><td colspan="1" valign="top">Sí </td></tr>
<tr><td colspan="2">Orden de impresión </td><td colspan="1" valign="top">Número entero </td><td colspan="1">Para mostrar el Organigrama en </td><td colspan="3"></td><td colspan="1" valign="top">Sí </td></tr>
<tr><td colspan="1" rowspan="3">![ref1]</td><td colspan="4">Especificaciones funcionales</td><td colspan="1">CÓDIGO: </td><td colspan="2">OPSP-FRM10 </td></tr>
<tr><td colspan="4" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="2">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="2">15/01/2025 </td></tr>
</table>



|||forma gráfica ordenado por jerarquía |||
| :- | :- | - | :- | :- |
|Categoría |Código |Es un agrupador de posiciones |**Ejemplos:**  Empleado Jefe Gerente |Sí |
|Objetivo de la posición |Texto |||Sí |
|Funciones y Responsabilidades |Texto |||Sí |
|Documentos |Referencia ||||
|Procesos |Referencia ||||
|Riesgos |Referencia ||||
|Indicadores |Referencia ||||
|Fecha de Registro |Fecha (dd/mm/aaaa) |El sistema registra la Fecha en que se creó por primera vez el proceso |Fecha del día |Sí |
|Usuario de creación |Código |Usuario que crea el regisro |Se obtiene de Personas |Sí |
|Fecha de modificación  |Fecha |Fecha en que se modifica el regitro ||Sí |
|Usuario que modifica |Código |Usuario que modifica el registro |Se obtiene de Personas |Sí |

<a name="_page102_x82.00_y488.00"></a>Tabla PERSONAS 



|**Nombre del campo** |**Tipo de dato** |**Descripción** |**Posibles valores** |**Obligatorio (Sí/No)** |
| :- | - | - | - | :-: |
|ID Persona **(k)** |Alfanumérico |Identificador único de la Persona, se usa el Tipo y Número de documento de identidad |<p>DNI </p><p>Carné de Extranjería Pasaporte + El número que lo identifica. Ejm: DNI-74010254 </p>|Sí |
|ID Posición **(k)** |Código |Nombre de la Posición, referenciado de la Tabla Posiciones ||Sí |
|Cod Empleado |Alfanumérico |Código interno asignado a la Persona ||No |
|Apellido Paterno |Texto |Todo mayúsculas ||Sí |
|Apellido Materno |Texto |Todo mayúsculas ||No |
|Nombres |Texto |Todo mayúsculas ||Sí |



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



|Estado |Código |<p>Indica si la Persona está laborando normalmente o hay un cambio temporal </p><p>o definitivo </p>|Activo Cesado Ausente |Sí |
| - | - | :- | :- | - |
|Versión |Número |Correlativo que inicia en 1, porcada creación de nueva versión se incrementa en 1 ||Sí |
|Resumen de la versión |Texto |Breve explicación del contenido de la versión ||Sí |
|Estado workflow |Código |Refleja el estado de vigente o no del registro |<p>1 edición </p><p>2 publicado 3 caducado 4 archivado </p>|Sí |
|Foto |Imagen |||No |
|ID Usuario  |Código |Usado para acceder a la plataforma ||Sí |
|Tipo de calle ||||Sí |
|Nombre calle ||||Sí |
|Nro ||||Sí |
|Interior Dpto |||||
|Referencia |||||
|Código Postal ||||Sí |
|Ubigeo ||||Sí |
|Sede |Código |Lugar donde se ubica la Persona |<p>San Isidro Arequipa Piura </p><p>… </p>|Sí |
|Celular |||||
|Email ||||Sí |
|Fecha de nacimiento |Fecha ||||
|Fecha de ingreso ||||Sí |
|Fecha de Registro |Fecha (dd/mm/aaaa) |El sistema registra la Fecha en que se creó por primera vez el proceso |Fecha del día |Sí |
|Usuario de creación |Código |Usuario que crea el regisro |Se obtiene de Personas |Sí |
|Fecha de modificación  |Fecha |Fecha en que se modifica el regitro ||Sí |
|Usuario que modifica |Código |Usuario que modifica el registro |Se obtiene de Personas |Sí |



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>

<a name="_page104_x82.00_y115.00"></a>Tabla PERSONAS POSICIÓN 



|**Nombre del campo** |**Tipo de dato** |**Descripción** |**Posibles valores** |**Obligatorio (Sí/No)** |
| :- | - | - | :- | :-: |
|Id Persona **(k)** ||||Sí |
|Id Posición **(k)** ||||Sí |
|ID Unidad Org **(k)** ||||Sí |
|Estado Posición |Código|Indica si la Posición está vigente, |Activo Caducado Ausente Cesado |Sí |
|Versión |Número |Correlativo que inicia en 1, porcada creación de nueva versión se incrementa en 1 ||Sí |
|Resumen de la versión |Texto |Breve explicación del contenido de la versión ||Sí |
|Estado workflow |Código |Refleja el estado de vigente o no del registro |<p>1 edición </p><p>2 publicado 3 caducado 4 archivado </p>|Sí |
|Fecha de Registro |Fecha (dd/mm/aaaa) |El sistema registra la Fecha en que se creó por primera vez el proceso |Fecha del día |Sí |
|Usuario de creación |Código |Usuario que crea el regisro |Se obtiene de Personas |Sí |
|Fecha de modificación  |Fecha |Fecha en que se modifica el regitro ||Sí |
|Usuario que modifica |Código |Usuario que modifica el registro |Se obtiene de Personas |Sí |

<a name="_page104_x82.00_y560.00"></a>[Formato ](#_page104_x82.00_y115.00)de carga masiva Organigrama. 



|**Nombre del campo** |**Tipo de dato** |**Descripción** |**Posibles valores** |**Obligatorio (Sí/No)** |
| :- | - | - | :- | :-: |
|Acción |Código |Define la acción que el sistema debe ejecutar |Crear Modificar Caducar Eliminar |Sí |
|Respuesta |Código |Es la respuesta que emite el sistema luego de procesar la petición del usuario |Ok Error |Sí |
|Detalle Respuesta |Texto |Detalle o explicación del ||No |



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



|||error encontrado en la operación |||
| :- | :- | :- | :- | :- |
|Tipo |Código |Indica si el Organigrama es de la propia organización o define una entidad externa |1 propia 2 externa |Sí |
|Nivel Org A |Código|Usado para definir el Nivel de la Entidad que el usuario está referenciando |Organización Unidad Org. |No |
|ID Entidad |Código |Es el código de la Organización o de la Unidad Organizativa que quiere usar el usuario ||No |
|Nombre Entidad |Alfanumérico |Nombre de la ID Entidad, puede ser Organización o Unidad Organizativa, se define que es por el Nivel Org A ||No |
|Código Depende De |Código |Código de la Organización o Unidad Organizativa que es el nivel jerárquico superior de la entidad de la línea ||No |
|Nivel Org B |Código |Código del Rol o de la Posición que se está utilizando en la línea |Rol Posición ||
|Id Persona |Código |Identificación de la Persona que se hace referencia, está compuesto por el tipo y el número del documento de identidad separado por un “-“ |DNI Carné de extranjería Pasaporte ||
|Id Posición |Código |Del puesto que desempeña la Persona como Puesto principal, este dato se |||


<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



<table><tr><th colspan="2"></th><th colspan="1"></th><th colspan="1">almacena en la Tabla Personas </th><th colspan="2"></th><th colspan="2"></th></tr>
<tr><td colspan="2" valign="top">Nombre Posición </td><td colspan="1" valign="top">Alfanumérico </td><td colspan="1">Nombre que se da a la Posición </td><td colspan="2"></td><td colspan="2"></td></tr>
<tr><td colspan="2" valign="top">Cod Empleado </td><td colspan="1" valign="top">Alfanumérico </td><td colspan="1">Valor libre, que usan las instituciones para dar una identificación secundaria a las Personas </td><td colspan="2"></td><td colspan="2" valign="top">No </td></tr>
<tr><td colspan="2" valign="top">Ap Paterno </td><td colspan="1"></td><td colspan="1"></td><td colspan="2"></td><td colspan="2"></td></tr>
<tr><td colspan="2" valign="top">Ap Materno </td><td colspan="1"></td><td colspan="1"></td><td colspan="2"></td><td colspan="2"></td></tr>
<tr><td colspan="2" valign="top">Nombres </td><td colspan="1"></td><td colspan="1"></td><td colspan="2"></td><td colspan="2"></td></tr>
<tr><td colspan="2" valign="top">Estado </td><td colspan="1" valign="top">Código </td><td colspan="1"><p>Permite conocer si la Persona trabaja </p><p>o ya no en la organización </p></td><td colspan="2" valign="top">Activo Cesado </td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">URL Foto </td><td colspan="1" valign="top">Link </td><td colspan="1">Es la dirección en la que se encuentra la foto de la Persona para poder cargarla al sistema </td><td colspan="2"></td><td colspan="2" valign="top">No </td></tr>
<tr><td colspan="2" valign="top">ID Usuario </td><td colspan="1" valign="top">Alfanumérico </td><td colspan="1">User Id que se crea para dar acceso a la app de la organización </td><td colspan="2"></td><td colspan="2" valign="top">No </td></tr>
<tr><td colspan="2" valign="top">Tipo de calle </td><td colspan="1" valign="top">Código </td><td colspan="1"></td><td colspan="2"><p>Av. Boulevard Calle </p><p>Jr. </p><p>Óvalo Pasaje  Alameda </p></td><td colspan="2"></td></tr>
<tr><td colspan="2" valign="top">Nombre calle </td><td colspan="1" valign="top">Alfanumérico </td><td colspan="1"></td><td colspan="2"></td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Nro </td><td colspan="1" valign="top">Alfanumérico </td><td colspan="1">Es la numeración del domicilio </td><td colspan="2"></td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Interior dpto </td><td colspan="1" valign="top">Alfanumérico </td><td colspan="1"><p>Si vive en Edificios </p><p>o condominios </p></td><td colspan="2"></td><td colspan="2" valign="top">No </td></tr>
<tr><td colspan="2" valign="top">Referencia </td><td colspan="1" valign="top">Alfanumérico </td><td colspan="1">Info de referencia de ubicación del domicilio </td><td colspan="2"></td><td colspan="2" valign="top">No </td></tr>
<tr><td colspan="2" valign="top">Cod Postal </td><td colspan="1" valign="top">Alfanumérico </td><td colspan="1">De acuerdo con Tabla de Correos </td><td colspan="2"></td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Ubigeo </td><td colspan="1" valign="top">Alfanumérico </td><td colspan="1">De acuerdo con INEI </td><td colspan="2"></td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Id Sede </td><td colspan="1" valign="top">Alfanumérico </td><td colspan="1">Definido en Tabla por la Organización </td><td colspan="2"></td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Celular </td><td colspan="1" valign="top">Número </td><td colspan="1"></td><td colspan="2"></td><td colspan="2" valign="top">No </td></tr>
<tr><td colspan="2" valign="top">Email </td><td colspan="1" valign="top">Alfanumérico </td><td colspan="1"></td><td colspan="2"></td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="1" rowspan="3">![ref1]</td><td colspan="4">Especificaciones funcionales</td><td colspan="2">CÓDIGO: </td><td colspan="2">OPSP-FRM10 </td></tr>
<tr><td colspan="4" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="2">VERSIÓN </td><td colspan="2">01 </td></tr>
<tr><td colspan="2">FECHA: </td><td colspan="2">15/01/2025 </td></tr>
</table>



|Fecha de nacimiento |Fecha dd/mm/aaaa |De la Persona ||Sí |
| :- | :- | - | :- | - |
|Fecha de ingreso |Fecha dd/mm/aaaa |De la Persona ||Sí |
|Fecha de creación |Fecha dd/mm/aaaa |Fecha en que se ejecuta la carga masiva ||Sí |
|Usuario creador |User ID |Usuario conectado en la app ||Sí |
|Fecha modificación |Fecha dd/mm/aaaa |||Condicionado |
|Usuario modifica ||||Condicionado |

<a name="_page107_x82.00_y293.00"></a>[Formato ](#_page104_x82.00_y115.00)de carga masiva – Posiciones adicionales 



<table><tr><th colspan="2"><b>Nombre del campo</b> </th><th colspan="1" valign="top"><b>Tipo de dato</b> </th><th colspan="1" valign="top"><b>Descripción</b> </th><th colspan="2"><b>Posibles valores</b> </th><th colspan="2"><b>Obligatorio (Sí/No)</b> </th></tr>
<tr><td colspan="2" valign="top">Acción </td><td colspan="1" valign="top">Código </td><td colspan="1" valign="top">Define la acción que el sistema debe ejecutar </td><td colspan="2">Crear Modificar Caducar Eliminar </td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Respuesta </td><td colspan="1" valign="top">Código </td><td colspan="1">Es la respuesta que emite el sistema luego de procesar la petición del usuario </td><td colspan="2" valign="top">Ok Error </td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Detalle Respuesta </td><td colspan="1" valign="top">Texto </td><td colspan="1">Detalle o explicación del error encontrado en la operación </td><td colspan="2"></td><td colspan="2" valign="top">Condicionado </td></tr>
<tr><td colspan="2" valign="top">Nivel Org B </td><td colspan="1" valign="top">Código</td><td colspan="1">Usado para definir el Nivel de la Entidad que el usuario está referenciando </td><td colspan="2" valign="top">Rol Posición </td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Id Persona </td><td colspan="1" valign="top">Código </td><td colspan="1">Documento de identidad de la Persona que ocupa una posición adicional en la Organización </td><td colspan="2"></td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Id Posición </td><td colspan="1" valign="top">Código </td><td colspan="1">Código de la Posición, si no existe y la opción es Crear, se adiciona primero como Posición </td><td colspan="2"></td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Nombre Posición </td><td colspan="1" valign="top">Alfanumérico </td><td colspan="1">Nombre de la Posición que ocupa la persona </td><td colspan="2"></td><td colspan="2">Si la acción es Crear, es obligatorio </td></tr>
<tr><td colspan="1" rowspan="3">![ref1]</td><td colspan="4">Especificaciones funcionales</td><td colspan="2">CÓDIGO: </td><td colspan="1">OPSP-FRM10 </td></tr>
<tr><td colspan="4" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="2">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="2">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>

<a name="_page108_x82.00_y146.00"></a>Tabla SISTEMAS 



<table><tr><th colspan="2"><b>Nombre del campo</b> </th><th colspan="1" valign="top"><b>Tipo de dato</b> </th><th colspan="1" valign="top"><b>Descripción</b> </th><th colspan="2"><b>Posibles valores</b> </th><th colspan="2"><b>Obligatorio (Sí/No)</b> </th></tr>
<tr><td colspan="2" valign="top">ID Sistema </td><td colspan="1" valign="top">Código </td><td colspan="1">Código que identifica al Sistema </td><td colspan="2"></td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Código del Sistema </td><td colspan="1" valign="top">Alfanumérico </td><td colspan="1">ID que la organización usa para el sistema </td><td colspan="2"></td><td colspan="2" valign="top">No </td></tr>
<tr><td colspan="2">Nombre del Sistema </td><td colspan="1" valign="top">Alfanumérico </td><td colspan="1">Nombre del Sistema </td><td colspan="2"></td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Estado </td><td colspan="1" valign="top">Código </td><td colspan="1" valign="top">Establece si la información está activa o no </td><td colspan="2">Edición Revisión Aprobación Publicado Caducado Archivado </td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Función principal </td><td colspan="1" valign="top">Texto </td><td colspan="1">Breve explicación del propósito del sistema </td><td colspan="2"></td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Depende de </td><td colspan="1" valign="top">Código </td><td colspan="1">Es la identificación de otro sistema que jerárquicamente es de mayor nivel </td><td colspan="2"></td><td colspan="2" valign="top">No </td></tr>
<tr><td colspan="2" valign="top">Tipo </td><td colspan="1" valign="top">Código </td><td colspan="1">Permite conocer si son sistemas propios de la organización o no </td><td colspan="2">Interno Proveedor Socios de negocios </td><td colspan="2"></td></tr>
<tr><td colspan="2" valign="top"><a name="_page108_x88.00_y519.00"></a>Familia </td><td colspan="1" valign="top">Código </td><td colspan="1" valign="top">Identifica la similitud del sistema con otras herramientas de tal forma que se puedan agrupar </td><td colspan="2"><p>ERP </p><p>CRM </p><p>Gestión de RRHH Colaboración Gestión documental </p><p>BI </p><p>Gestión de proyectos Operaciones Financiero contable Marketing digital Seguridad de la información Gestión por procesos </p><p>Control y Monitoreo </p></td><td colspan="2"></td></tr>
<tr><td colspan="1" rowspan="3">![ref1]</td><td colspan="4">Especificaciones funcionales</td><td colspan="2">CÓDIGO: </td><td colspan="1">OPSP-FRM10 </td></tr>
<tr><td colspan="4" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="2">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="2">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



||||<p>Desarrollo de SW </p><p>Legacy Gestión de activos </p>||
| :- | :- | :- | :- | :- |
|Fecha de Registro |Fecha (dd/mm/aaaa) |El sistema registra la Fecha en que se creó por primera vez el proceso |Fecha del día |Sí |
|Usuario de creación |Código |Usuario que crea el regisro |Se obtiene de Personas |Sí |
|Fecha de modificación  |Fecha |Fecha en que se modifica el regitro ||Sí |
|Usuario que modifica |Código |Usuario que modifica el registro |Se obtiene de Personas |Sí |

<a name="_page109_x82.00_y332.00"></a>Tabla SISTEMAS - Módulos 



|**Nombre del campo** |**Tipo de dato** |**Descripción** |**Posibles valores** |**Obligatorio (Sí/No)** |
| :- | - | - | :- | :-: |
|ID Sistemas |Código |Código que identifica al Sistema ||Sí |
|Nombre del módulo |Alfanumérico |Nombre del módulo ||Sí |
|Función  |Texto |Breve explicación del propósito del módulo ||Sí |
|Fecha de Registro |Fecha (dd/mm/aaaa) |El sistema registra la Fecha en que se creó por primera vez el proceso |Fecha del día |Sí |
|Usuario de creación |Código |Usuario que crea el regisro |Se obtiene de Personas |Sí |
|Fecha de modificación  |Fecha |Fecha en que se modifica el regitro ||Sí |
|Usuario que modifica |Código |Usuario que modifica el registro |Se obtiene de Personas |Sí |

<a name="_page109_x82.00_y638.00"></a>Tabla SISTEMAS – Formato de carga masiva 

**Nombre del  Tipo de dato  Descripción  Posibles  Obligatorio ![](Aspose.Words.3184fba8-1f57-4373-a4d7-5b011bad4160.012.png)campo  valores  (Sí/No)** Acción  Texto  Elección del  Crear  Sí 

Usuario para  Modificar 

ejecutar en la  Eliminar 

carga masiva  Archivar 

Rehabilitar 



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



<table><tr><th colspan="2" valign="top">Respuesta </th><th colspan="1" valign="top">Código </th><th colspan="1">Es la respuesta que emite el sistema luego de procesar la petición del usuario </th><th colspan="2" valign="top">Ok Error </th><th colspan="2" valign="top">Sí </th></tr>
<tr><td colspan="2" valign="top">Detalle de respuesta </td><td colspan="1" valign="top">Texto </td><td colspan="1">Detalle o explicación del error encontrado en la operación </td><td colspan="2"></td><td colspan="2" valign="top">Condicionado </td></tr>
<tr><td colspan="2" valign="top">Código del Sistema </td><td colspan="1" valign="top">Alfanumérico </td><td colspan="1">ID del Sistema que el Usuario solicita tomar la acción. Si no existe y la acción es “Crear”, es correcto, de lo contrario es error. </td><td colspan="2"></td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Nombre del Sistema </td><td colspan="1" valign="top">Alfanumérico </td><td colspan="1">Nombre del Sistema, si la acción es Crear, entonces es obligatorio, de lo contrario no es necesario </td><td colspan="2"></td><td colspan="2" valign="top"><p>Condicionado a que la acción sea “Crear” o </p><p>“Modificar” </p></td></tr>
<tr><td colspan="2" valign="top">Función Principal </td><td colspan="1" valign="top">Texto </td><td colspan="1">Descripción del Propósito del sistema. Si la opción es “crear”, es obligatorio. Puede venir en “modificar” para hacer la corrección </td><td colspan="2"></td><td colspan="2" valign="top"><p>Condicionado a que la acción sea “Crear” o </p><p>“Modificar” </p></td></tr>
<tr><td colspan="2" valign="top">Depende de </td><td colspan="1" valign="top">Texto </td><td colspan="1">Código de otro Sistema del que depende este sistema </td><td colspan="2">El Código del sistema debe existir y estar “Vigente” </td><td colspan="2">Condicionado a que sea Sistema dependiente </td></tr>
<tr><td colspan="2" valign="top">SisGest </td><td colspan="1" valign="top">Código </td><td colspan="1">Sistema de gestión que se asocia al sistema </td><td colspan="2">Obtenidos de la Tabla Sistemas de Gestión </td><td colspan="2" valign="top">No </td></tr>
<tr><td colspan="2" valign="top">Tipo </td><td colspan="1" valign="top">Código </td><td colspan="1"><p>Identifica a que grupo pertenece el sistema. </p><p>Si la opción elegida es “modificar” y tiene información en este campo, se modifica. Para “crear” es obligatorio. </p></td><td colspan="2" valign="top">Interno Proveedor Socios de negocios </td><td colspan="2" valign="top">Condicionado a la opción Crear </td></tr>
<tr><td colspan="2" rowspan="3" valign="top">Familia </td><td colspan="1" rowspan="3" valign="top">Código </td><td colspan="1" valign="top">[Ver definición en ](#_page108_x88.00_y519.00)</td><td colspan="2" rowspan="3"></td><td colspan="2" rowspan="3"></td></tr>
<tr><td colspan="1" valign="top">[Tabla principal. ](#_page108_x88.00_y519.00)</td></tr>
<tr><td colspan="1" valign="top">Para “crear” es obligatorio </td></tr>
<tr><td colspan="1" rowspan="3">![ref1]</td><td colspan="4">Especificaciones funcionales</td><td colspan="2">CÓDIGO: </td><td colspan="1">OPSP-FRM10 </td></tr>
<tr><td colspan="4" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="2">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="2">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>

<a name="_page111_x82.00_y115.00"></a>Tabla RIESGOS  



<table><tr><th colspan="1"><b>Nombre del campo</b> </th><th colspan="1" valign="top"><b>Tipo de dato</b> </th><th colspan="1" valign="top"><b>Descripción</b> </th><th colspan="1"><b>Posibles valores</b> </th><th colspan="1"><b>Obligatorio (Sí/No)</b> </th></tr>
<tr><td colspan="1" valign="top">ID Riesgo (k) </td><td colspan="1" valign="top">Código </td><td colspan="1">Identificación única asignada por el sistema a cada riesgo </td><td colspan="1"></td><td colspan="1" valign="top">Sí </td></tr>
<tr><td colspan="1" valign="top">Código riesgo (k) </td><td colspan="1" valign="top">Código </td><td colspan="1">Identificación que el Usuario define para cada Riesgo que gestiona </td><td colspan="1"></td><td colspan="1" valign="top">Sí </td></tr>
<tr><td colspan="1" valign="top">Nombre Riesgo </td><td colspan="1" valign="top">Texto </td><td colspan="1">Breve descripción del Riesgo </td><td colspan="1"></td><td colspan="1" valign="top">Sí </td></tr>
<tr><td colspan="1" valign="top">ID Tipo Riesgo </td><td colspan="1" valign="top">Código </td><td colspan="1">Identifica si son riesgos detectados a tiempo o se está trabajando acciones correctivas luego de consumarse el riesgo </td><td colspan="1" valign="top"><p>1 riesgo gestionado </p><p>2 riesgo materializado </p></td><td colspan="1" valign="top">Sí </td></tr>
<tr><td colspan="1" valign="top">ID Tipo  de impacto </td><td colspan="1" valign="top">Código </td><td colspan="1" valign="top">Clasificación desde la visión empresarial </td><td colspan="1">Financiero Negocio Legal Operacional </td><td colspan="1" valign="top">Sí </td></tr>
<tr><td colspan="1" valign="top">ID Sub tipo de impacto </td><td colspan="1"></td><td colspan="1">Sub clasificación desde la visión empresarial </td><td colspan="1"></td><td colspan="1" valign="top">No </td></tr>
<tr><td colspan="1" valign="top">Posición Responsable </td><td colspan="1" valign="top">Referencia a Posiciones </td><td colspan="1">Posición que es responsable de gestionar el riesgo </td><td colspan="1">Obtenido de la Tabla Posiciones del Organigrama </td><td colspan="1" valign="top">Sí </td></tr>
<tr><td colspan="1" valign="top">Persona Responsable </td><td colspan="1" valign="top">Referencia a Personas </td><td colspan="1">Nombre de la Persona que ocupa la posición responsable al momento del registro del riesgo </td><td colspan="1" valign="top">Obtenido de la Tabla Personas del Organigrama </td><td colspan="1" valign="top">Sí </td></tr>
<tr><td colspan="1" valign="top">Descripción Riesgo </td><td colspan="1" valign="top">Texto </td><td colspan="1">Detalle del Riesgo, de su naturaleza y consecuencias </td><td colspan="1"></td><td colspan="1" valign="top">Sí </td></tr>
<tr><td colspan="1">Fecha de identificación </td><td colspan="1" valign="top">Fecha </td><td colspan="1">En la que el riesgo es identificado </td><td colspan="1"></td><td colspan="1" valign="top">Sí </td></tr>
<tr><td colspan="1" rowspan="2" valign="top">Causa </td><td colspan="1" rowspan="2" valign="top">Código </td><td colspan="1" rowspan="2">Selección de la tabla Causas de riesgos </td><td colspan="1" valign="top">[Ver Tabla ](#_page112_x82.00_y686.00)</td><td colspan="1" rowspan="2" valign="top">Sí </td></tr>
<tr><td colspan="1"></td></tr>
<tr><td colspan="1" rowspan="2" valign="top">Consecuencia </td><td colspan="1" rowspan="2" valign="top">Código </td><td colspan="1" rowspan="2">Selección de la tabla Consecuencias de riesgos </td><td colspan="1" valign="top">[Ver Tabla ](#_page114_x82.00_y115.00)</td><td colspan="1" rowspan="2" valign="top">Sí </td></tr>
<tr><td colspan="1"></td></tr>
<tr><td colspan="1">Probabilidad de ocurrencia </td><td colspan="1" valign="top">Número </td><td colspan="1"></td><td colspan="1">1 baja  3 media </td><td colspan="1" valign="top">Sí </td></tr>
</table>



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



<table><tr><th colspan="1"></th><th colspan="1"></th><th colspan="1"></th><th colspan="1" valign="top">5 alta </th><th colspan="1"></th></tr>
<tr><td colspan="1" valign="top">Impacto </td><td colspan="1" valign="top">Número </td><td colspan="1"></td><td colspan="1">1 bajo 3 medio 5 alto </td><td colspan="1" valign="top">Sí </td></tr>
<tr><td colspan="1" valign="top">Resultado del riesgo </td><td colspan="1" valign="top">Número </td><td colspan="1">Lo calcula el sistema multiplicando “Probabilidad de ocurrencia * Impacto”. El resultado se clasifica de acuerdo con la ubicación del resultado de la tabla “Clasificación del Riesgo” </td><td colspan="1" valign="top">Valores entre 1 y 25 </td><td colspan="1"></td></tr>
<tr><td colspan="1" valign="top">Tratamiento del Riesgo </td><td colspan="1" valign="top">Código </td><td colspan="1">Clasificación inicial, antes de aplicar medidas correctivas o preventivas </td><td colspan="1" valign="top">Aceptar Tratar Mitigado </td><td colspan="1" valign="top">Sí </td></tr>
<tr><td colspan="1" rowspan="2" valign="top">Consecuencia materializada </td><td colspan="1" rowspan="2"></td><td colspan="1" rowspan="2">Selección de la tabla Causas de riesgos </td><td colspan="1" valign="top">[Ver Tabla ](#_page112_x82.00_y686.00)</td><td colspan="1" rowspan="2"><p>Condicionado a que  ID Tipo </p><p>riesgo = 2 </p></td></tr>
<tr><td colspan="1"></td></tr>
<tr><td colspan="1" valign="top">Como se originó </td><td colspan="1" valign="top">Texto </td><td colspan="1">Explicación de como el riesgo se hizo efectivo </td><td colspan="1"></td><td colspan="1"><p>Condicionado a que ID Tipo </p><p>riesgo = 2 </p></td></tr>
<tr><td colspan="1" valign="top">Fecha de ocurrencia </td><td colspan="1" valign="top">Fecha </td><td colspan="1" valign="top">En la que el riesgo se hizo efectivo </td><td colspan="1"></td><td colspan="1"><p>Condicionado a que ID Tipo </p><p>riesgo = 2 </p></td></tr>
<tr><td colspan="1" valign="top">Fecha de finalización </td><td colspan="1" valign="top">Fecha </td><td colspan="1">En la que el riesgo terminó su accionar o fue detectado </td><td colspan="1"></td><td colspan="1" valign="top"><p>Condicionado a que ID Tipo </p><p>riesgo = 2 </p></td></tr>
<tr><td colspan="1" valign="top">Fecha de Registro </td><td colspan="1" valign="top">Fecha (dd/mm/aaaa) </td><td colspan="1">El sistema registra la Fecha en que se creó por primera vez el proceso </td><td colspan="1" valign="top">Fecha del día </td><td colspan="1" valign="top">Sí </td></tr>
<tr><td colspan="1">Usuario de creación </td><td colspan="1" valign="top">Código </td><td colspan="1">Usuario que crea el regisro </td><td colspan="1">Se obtiene de Personas </td><td colspan="1" valign="top">Sí </td></tr>
<tr><td colspan="1">Fecha de modificación  </td><td colspan="1" valign="top">Fecha </td><td colspan="1">Fecha en que se modifica el regitro </td><td colspan="1"></td><td colspan="1" valign="top">Sí </td></tr>
<tr><td colspan="1">Usuario que modifica </td><td colspan="1" valign="top">Código </td><td colspan="1">Usuario que modifica el registro </td><td colspan="1">Se obtiene de Personas </td><td colspan="1" valign="top">Sí </td></tr>
</table>

<a name="_page112_x82.00_y686.00"></a><a name="_page112_x82.00_y711.00"></a>Tabla – Riesgos – Soluciones implementadas 



<table><tr><th colspan="2"><b>Nombre del campo</b> </th><th colspan="1" valign="top"><b>Tipo de dato</b> </th><th colspan="1" valign="top"><b>Descripción</b> </th><th colspan="2"><b>Posibles valores</b> </th><th colspan="2"><b>Obligatorio (Sí/No)</b> </th></tr>
<tr><td colspan="1" rowspan="3">![ref1]</td><td colspan="4">Especificaciones funcionales</td><td colspan="2">CÓDIGO: </td><td colspan="1">OPSP-FRM10 </td></tr>
<tr><td colspan="4" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="2">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="2">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



|ID Riesgo (k) |Código |Identificación del riesgo ||Sí |
| - | - | :- | :- | - |
|ID Control (k) |Código |ID de cada control que se crea |Sobre la misma tabla, mostrar los existentes para elección |Sí |
|Nombre control |Texto |Descripción del control |Si ya existe, usar el nombre, si es nuevo, permitir el ingreso |Sí |
|Tipo |Código |Clasifica los tipos de soluciones que se implementan |Preventivo Rastreador Correctivo ||
|Categoría |Código |Define el nivel de importancia en su uso |Critico No critico |Sí |
|Sub Tipo |Código |||No |
|Fecha de Registro |Fecha (dd/mm/aaaa) |El sistema registra la Fecha en que se creó por primera vez el proceso |Fecha del día |Sí |
|Usuario de creación |Código |Usuario que crea el registro |Se obtiene de Personas |Sí |
|Fecha de modificación  |Fecha |Fecha en que se modifica el registro ||Sí |
|Usuario que modifica |Código |Usuario que modifica el registro |Se obtiene de Personas |Sí |

<a name="_page113_x82.00_y478.00"></a>Tabla - Causas de Riesgos 

Basado en el estándar **ISO 31000:2018** – de Gestión de Riesgos, que establece principios y directrices para la identificación y categorización de riesgos se definen las siguientes tablas con los valores de Causas y Consecuencias.



|**Código** |**Categoría** |**Descripción** |
| - | - | - |
|CR001 |Humano |Errores humanos, negligencia, falta de capacitación |
|CR002 |Tecnológico |Fallos en sistemas, ciberataques, obsolescencia |
|CR003 |Procesos |Falta de controles, procesos deficientes|
|CR004 |Legal / Regulatorio |Cambios en normas legales, incumplimiento legal|
|CR005 |Financiero |Fluctuaciones económicas, pérdida de liquidez|
|CR006 |Operacional |Fallas en la cadena de suministros, interrupciones|
|CR007 |Ambiental |Desastres naturales, cambio climático|
|CR008 |Seguridad y Salud |Accidentes laborales, enfermedades ocupacionales|
|CR009 |Reputacional |Crisis de imagen, mala percepción pública|
|CR010 |Estratégico |Decisiones erróneas, falta de visión|



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>

<a name="_page114_x82.00_y115.00"></a>Tabla - Consecuencias de Riesgos 



|**Código** |**Categoría** |**Descripción** |
| - | - | - |
|CO001 |Financiera |Pérdidas económicas, multas, sobrecostos|
|CO002 |Legal / Regulatorio |Sanciones, demandas, incumplimiento normativo|
|CO003 |Operacional |Parálisis de procesos, interrupción del servicio.|
|CO004 |Reputacional |Daño a la imagen corporativa, pérdida de clientes.|
|CO005 |Seguridad y Salud |Accidentes, enfermedades, muertes |
|CO006 |Tecnológica |Pérdida de datos, vulnerabilidades de ciberseguridad.|
|CO007 |Ambiental |Contaminación, afectación al entorno.|
|CO008 |Social |Impacto en la comunidad, conflictos laborales.|

<a name="_page114_x82.00_y307.00"></a>Tabla – Clasificación del Riesgo 



|Resultado del Riesgo |Nivel de Riesgo |Color asignado |
| - | - | - |
|1 – 5 |Bajo |Verde |
|6 – 15 |Medio  |Amarillo |
|16 – 25 |Alto |Rojo |

<a name="_page114_x82.00_y415.00"></a>Tabla – Riesgos – Asociaciones 

Los Riesgos se asocian a Procesos o sus actividades que deben ser mejorados o por cualquier otro componente de la App de Gestión por procesos. Todos estos componentes son los que se asocian al Riesgo y se registran en esta tabla.



|**Nombre del campo** |**Tipo de dato** |**Descripción** |**Posibles valores** |**Obligatorio (Sí/No)** |
| :- | - | - | :- | :-: |
|ID Riesgo (k) |Código |Identificación única asignada por el sistema a cada riesgo ||Sí |
|ID Tipo |Código |Identifica que tipo de módulo se asocia al plan |<p>1 proceso </p><p>2 actividad </p><p>5 obs auditoria 6 documento </p>|Sí |
|ID Asociado (k) |Código |ID del Proceso o actividad o obs de auditoria ||Sí |

<a name="_page114_x82.00_y684.00"></a>Tabla – Planes de Acción 



|**Nombre del campo** |**Tipo de dato** |**Descripción** |**Posibles valores** |**Obligatorio (Sí/No)** |
| :- | - | - | :- | :-: |
|ID Plan |Código |Identificación única asignada por ||Sí |



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



|||el sistema a cada Plan de acción |||
| :- | :- | :- | :- | :- |
|Código Plan |Código |Identificación que el Usuario define para cada Plan de acción que gestiona ||Sí |
|Nombre Plan |Texto |Breve descripción del Plan ||Sí |
|Tipo Plan |Código |Permite crear en este mismo módulo todo tipo de planes de trabajo |Proyecto Requerimiento Tarea |Sí |
|Descripción del Plan |Texto |Ampliación del propósito del Plan  ||Sí |
|Objetivo |Texto |||Sí |
|Fecha de Inicio |Fecha |Fecha de inicio del Plan ||Sí |
|Fecha de fin |Fecha |Fecha de fin del Plan ||Sí |
|Responsable |Código |Persona responsable de la ejecución del Plan |Referencia de la Tabla Personas |Sí |
|Estado Plan |Código ||<p>1 edición </p><p>2 vigente </p><p>3 no vigente 4 archivado 5 eliminado </p>|Sí |
|Plan de auditoria |Código |Si el plan busca atender observaciones de auditoría, se registra aquí cual es el plan asociado de “Planes de auditoría” ||Condicionado |
|Fecha de Registro |Fecha (dd/mm/aaaa) |El sistema registra la Fecha en que se creó por primera vez el proceso |Fecha del día |Sí |
|Usuario de creación |Código |Usuario que crea el regisro |Se obtiene de Personas |Sí |
|Fecha de modificación  |Fecha |Fecha en que se modifica el regitro ||Sí |
|Usuario que modifica |Código |Usuario que modifica el registro |Se obtiene de Personas |Sí |



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>

<a name="_page116_x82.00_y115.00"></a>Tabla – Planes de Acción – Asociaciones 

Los planes de acción se definen para resolver problemas generados por Riesgos, por Procesos o sus actividades que deben ser mejorados o por cualquier otro componente de la App de Gestión por procesos. Todas estas relaciones son las **asociaciones** que se registran en esta tabla.



|**Nombre del campo** |**Tipo de dato** |**Descripción** |**Posibles valores** |**Obligatorio (Sí/No)** |
| :- | - | - | :- | :-: |
|ID Plan (k) |Código |Identificación única asignada por el sistema a cada Plan de acción ||Sí |
|ID Tipo (k) |Código |Identifica que tipo de módulo se asocia al plan |<p>1 proceso </p><p>2 actividad </p><p>3 riesgo gestionado </p><p>4 riesgo materializado 5 obs auditoria 6 documento </p>|Sí |
|ID Asociado (k) |Código |ID del Proceso o actividad o riesgo o obs de auditoria ||Sí |
|Probabilidad de ocurrencia |Número |Nuevo valor estimado de concluir el plan de acción |1 baja  3 media 5 alta |Condicionado a que el ID Tipo sea “riesgo” |
|Impacto |Número |Nuevo valor estimado de concluir el plan de acción |1 bajo 3 medio 5 alto |Condicionado a que el ID Tipo sea “riesgo” |
|Resultado del riesgo |Número |Nuevo cálculo. Lo calcula el sistema multiplicando “Probabilidad de ocurrencia \* Impacto”. El resultado se clasifica de acuerdo con la ubicación del resultado de la tabla “Clasificación del Riesgo” |Valores entre 1 y 25 |<p>Condicionado a que el ID Tipo sea </p><p>“riesgo” (3 o 4) </p>|
|Nuevo Tratamiento |Código |Al terminar el plan, el riesgo asociado toma un nuevo estado |Transferir Tratar Aceptar ||


<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>

<a name="_page117_x82.00_y115.00"></a>Tabla – Actividades programadas y seguimiento 



<table><tr><th colspan="2"><b>Nombre del campo</b> </th><th colspan="1" valign="top"><b>Tipo de dato</b> </th><th colspan="1" valign="top"><b>Descripción</b> </th><th colspan="2"><b>Posibles valores</b> </th><th colspan="2"><b>Obligatorio (Sí/No)</b> </th></tr>
<tr><td colspan="2" valign="top">ID Plan (k) </td><td colspan="1" valign="top">Código </td><td colspan="1">Identificación única asignada por el sistema a cada Plan de acción </td><td colspan="2"></td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">ID Actividad (k) </td><td colspan="1" valign="top">Código </td><td colspan="1">Nro. De actividad con que el sistema identifica la fila </td><td colspan="2"></td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">ID Tipo actividad </td><td colspan="1" valign="top">Código </td><td colspan="1"><p>Identifica si es el registro inicial o es un seguimiento. Lo determina el sistema de </p><p>acuerdo con la creación de nuevos registros o modificaciones </p></td><td colspan="2" valign="top">Inicial Seguimiento </td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Versión </td><td colspan="1" valign="top">Numérico </td><td colspan="1">Las modificaciones de las actividades originan que se cree una nueva versión para no perder la información anterior </td><td colspan="2" valign="top">Números </td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Resumen de la versión </td><td colspan="1" valign="top">Texto </td><td colspan="1">Breve explicación del contenido de la versión </td><td colspan="2"></td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Cod Actividad Usuario </td><td colspan="1" valign="top">Texto </td><td colspan="1">ID que el Usuario le da a la actividad para identificarla y ordenarla </td><td colspan="2"></td><td colspan="2" valign="top">No </td></tr>
<tr><td colspan="2" valign="top">Actividad </td><td colspan="1" valign="top">Texto </td><td colspan="1">Nombre corto de la actividad </td><td colspan="2"></td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Descripción actividad </td><td colspan="1" valign="top">Texto </td><td colspan="1">Nombre largo detalle de la actividad </td><td colspan="2"></td><td colspan="2" valign="top">No </td></tr>
<tr><td colspan="2" valign="top">Responsable </td><td colspan="1"></td><td colspan="1">ID de la persona responsable de la actividad </td><td colspan="2"></td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Fecha Inicio </td><td colspan="1"></td><td colspan="1">Fecha de inicio de la actividad </td><td colspan="2"></td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Fecha Fin </td><td colspan="1"></td><td colspan="1">Fecha de fin de la actividad </td><td colspan="2"></td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Estado </td><td colspan="1" valign="top">Código </td><td colspan="1" valign="top">Representa el estado en que se encuentra la actividad </td><td colspan="2">Pendiente En Proceso Validación Terminada Anulada </td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="1" rowspan="3">![ref1]</td><td colspan="4">Especificaciones funcionales</td><td colspan="2">CÓDIGO: </td><td colspan="1">OPSP-FRM10 </td></tr>
<tr><td colspan="4" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="2">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="2">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



|Dependencia |Código |<p>Actividad que debe ser ejecutada </p><p>antes de que esta pueda iniciar </p>||No |
| - | - | :- | :- | - |
|Fecha de creación |Fecha |Fecha del día que se graba el registro por primera vez ||Sí |
|Usuario creador |Código |ID del Usuario que interactúa con el sistema ||Sí |
|Fecha de modificación |Fecha |Fecha del día en que se modifica el registro ||Sí |
|Usuario modificador |Código |ID del Usuario que interactúa con el sistema ||Sí |

<a name="_page118_x82.00_y339.00"></a>Tabla – Planes de Auditoría 



<table><tr><th colspan="2"><b>Nombre del campo</b> </th><th colspan="1" valign="top"><b>Tipo de dato</b> </th><th colspan="1" valign="top"><b>Descripción</b> </th><th colspan="2"><b>Posibles valores</b> </th><th colspan="2"><b>Obligatorio (Sí/No)</b> </th></tr>
<tr><td colspan="2" valign="top">ID Plan Auditoria (k) </td><td colspan="1" valign="top">Código </td><td colspan="1">Identificación única asignada por el sistema a cada Plan de auditoría </td><td colspan="2"></td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Código Plan </td><td colspan="1" valign="top">Código </td><td colspan="1">Identificación que el Usuario define para cada Plan de auditoria </td><td colspan="2"></td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Tipo de Auditoria </td><td colspan="1" valign="top">Código </td><td colspan="1"></td><td colspan="2">Interna Externa </td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2">Nombre Plan Auditoria </td><td colspan="1" valign="top">Texto </td><td colspan="1">Breve descripción del Plan </td><td colspan="2"></td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2">Descripción del Plan </td><td colspan="1" valign="top">Texto </td><td colspan="1">Ampliación del propósito del Plan  </td><td colspan="2"></td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Objetivo </td><td colspan="1" valign="top">Texto </td><td colspan="1"></td><td colspan="2"></td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Alcance </td><td colspan="1" valign="top">Texto </td><td colspan="1">Explicación de lo que abarca el plan </td><td colspan="2"></td><td colspan="2"></td></tr>
<tr><td colspan="2" valign="top">Área auditada </td><td colspan="1" valign="top">Código </td><td colspan="1">De la Organización se define que área es la que se audita </td><td colspan="2"></td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Fecha de Inicio </td><td colspan="1" valign="top">Fecha </td><td colspan="1">Fecha de inicio del Plan </td><td colspan="2"></td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Fecha de fin </td><td colspan="1" valign="top">Fecha </td><td colspan="1">Fecha de fin del Plan </td><td colspan="2"></td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Responsable </td><td colspan="1" valign="top">Código </td><td colspan="1">Persona responsable de la ejecución del Plan </td><td colspan="2" valign="top">Referencia de la Tabla Personas </td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Estado Plan </td><td colspan="1" valign="top">Código </td><td colspan="1"></td><td colspan="2"><p>1 edición </p><p>2 vigente </p><p>3 no vigente </p></td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="1" rowspan="3">![ref1]</td><td colspan="4">Especificaciones funcionales</td><td colspan="2">CÓDIGO: </td><td colspan="1">OPSP-FRM10 </td></tr>
<tr><td colspan="4" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="2">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="2">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



||||4 archivado 5 eliminado ||
| :- | :- | :- | - | :- |
|Versión |||||
|Resumen de la versión |Texto |Breve explicación del contenido de la versión ||Sí |
|ID Plan de acción |Código |Referencia al plan de acción con las actividades del plan de auditoria ||Sí |
|Fecha de Registro |Fecha (dd/mm/aaaa) |El sistema registra la Fecha en que se creó por primera vez el registro |Fecha del día |Sí |
|Usuario de creación |Código |Usuario que crea el regisro |Se obtiene de Personas |Sí |
|Fecha de modificación  |Fecha |Fecha en que se modifica el regitro ||Sí |
|Usuario que modifica |Código |Usuario que modifica el registro |Se obtiene de Personas |Sí |

<a name="_page119_x82.00_y392.00"></a>Tabla – Equipo de Auditoría 



|**Nombre del campo** |**Tipo de dato** |**Descripción** |**Posibles valores** |**Obligatorio (Sí/No)** |
| :- | - | - | :- | :-: |
|ID Plan Auditoria (k) |Código |Identificación única asignada por el sistema a cada Plan de auditoría ||Sí |
|Persona (k) |Código |ID de persona que forma parte del equipo de auditoria |Personas referenciadas de la Organización |Sí |
|Rol |Código |Función que desempeña la persona dentro de la ejecución del plan de auditoria |Auditor Líder Auditor Experto técnico Coordinador Observador Responsable del área auditada |Sí |
|Estado |Código ||Vigente No vigente |Sí |
|Fecha creación |Fecha |||Sí |
|Usuario creador |Usuario que crea el registro |||Sí |
|Fecha modificación |Fecha |||Sí |
|Usuario modificador |Usuario que modifica el registro |||Sí |



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>

<a name="_page120_x82.00_y115.00"></a>Tabla – Resultados de auditoría 



<table><tr><th colspan="2"><b>Nombre del campo</b> </th><th colspan="1" valign="top"><b>Tipo de dato</b> </th><th colspan="1" valign="top"><b>Descripción</b> </th><th colspan="2"><b>Posibles valores</b> </th><th colspan="2"><b>Obligatorio (Sí/No)</b> </th></tr>
<tr><td colspan="2" valign="top">ID Plan Auditoria (k) </td><td colspan="1" valign="top">Código </td><td colspan="1">Identificación única del Plan de auditoría </td><td colspan="2"></td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">ID Observación (k) </td><td colspan="1" valign="top">Código </td><td colspan="1">ID automático que se asigna a la observación del auditor dentro del plan </td><td colspan="2" valign="top">Valores secuenciales empezando en 1 </td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Fecha de observación </td><td colspan="1" valign="top">Fecha </td><td colspan="1" valign="top">Fecha en que el Auditor identificó la observación </td><td colspan="2">Default la fecha actual, puede ser anterior, nunca mayor </td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">ID Tipo Resultado </td><td colspan="1" valign="top">Código </td><td colspan="1" valign="top">Identifica el tipo de observación </td><td colspan="2"><p>1 hallazgo </p><p>2 no conformidad </p></td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Tipificación Resultado </td><td colspan="1" valign="top">Código </td><td colspan="1">Clasifica los hallazgos, sean positivos o negativos </td><td colspan="2">Fortaleza Buena práctica Oportunidad de mejora </td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Tipo No conformidad </td><td colspan="1" valign="top">Código </td><td colspan="1" valign="top">Permite registrar la gravedad de una “no conformidad” </td><td colspan="2" valign="top">Mayor Menor Potencial </td><td colspan="2"><p>Condicionado a que ID Tipo </p><p>Resultado sea “no </p><p>conformidad” </p></td></tr>
<tr><td colspan="2" valign="top">Causa </td><td colspan="1" valign="top">Código </td><td colspan="1" valign="top">Permite tipificar las causas que origina una “no conformidad” </td><td colspan="2">Error humano Deficiencia en proceso Problema Tecnológico Factor organizacional Factores externos </td><td colspan="2" valign="top"><p>Condicionado a que ID Tipo </p><p>Resultado sea “no </p><p>conformidad” </p></td></tr>
<tr><td colspan="2" valign="top">Estado </td><td colspan="1" valign="top">Código </td><td colspan="1">Si la observación es levantada, cambia de estado </td><td colspan="2" valign="top">Vigente No vigente </td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Módulo </td><td colspan="1" valign="top">Código </td><td colspan="1">Relaciona la observación con el módulo del Sistema de gestión por procesos </td><td colspan="2" valign="top">Procesos Documentos Riesgo Etc… </td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Fecha de revisión </td><td colspan="1" valign="top">Fecha </td><td colspan="1">Fecha de revisión del estado de la observación </td><td colspan="2"></td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Fecha de levantamiento </td><td colspan="1" valign="top">Fecha </td><td colspan="1">Fecha en que el auditor da por conforme la solución implementada </td><td colspan="2"></td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="1" rowspan="3">![ref1]</td><td colspan="4">Especificaciones funcionales</td><td colspan="2">CÓDIGO: </td><td colspan="1">OPSP-FRM10 </td></tr>
<tr><td colspan="4" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="2">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="2">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



|Comentarios |Texto |Comentarios del Auditor ||Sí |
| - | - | :- | :- | - |
|Evidencias |Adjuntos |Documentos en general que sustentan la observación registrada ||Sí |
|Fecha de Registro |Fecha (dd/mm/aaaa) |El sistema registra la Fecha en que se creó por primera vez el proceso |Fecha del día |Sí |
|Usuario de creación |Código |Usuario que crea el regisro |Se obtiene de Personas |Sí |
|Fecha de modificación  |Fecha |Fecha en que se modifica el regitro ||Sí |
|Usuario que modifica |Código |Usuario que modifica el registro |Se obtiene de Personas |Sí |

<a name="_page121_x82.00_y351.00"></a>Tabla - Flujo de aprobaciones 



|**Nombre del campo** |**Tipo de dato** |**Descripción** |**Posibles valores** |**Obligatorio (Sí/No)** |
| :- | - | - | :- | :-: |
|ID Entidad |Código |Código que identifica a la entidad del sistema que inicia el workflow |Organización Unidad Organizativa Posición Organigrama Documento Activos DATA Activos Sistemas Indicadores Riesgos |Sí |
|Usuario |Código |Es quien solicita la aprobación ||Sí |
|Fecha ||Fecha en que cambió de estado ||Sí |
|Estado de inicio |Código |Estado en que inicia la actividad ||Sí |
|Estado de fin |Código |Estado en que termina la actividad ||Sí |
|Motivo |Alfanumérico |Describe el motivo del rechazo |Es obligatorio, si se rechaza |Condicionado |
|Usuario  |Código |Usuario que termina la actividad, aprobando o rechazando ||Sí |
|Fecha |Fecha dd/mm/aaaa |Fecha en que cambió de estado ||Sí |



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



|Resultado |Booleano |Indica el resultado de la acción |True: Aprobado False: Rechazado |Sí |
| - | - | :- | :- | - |

<a name="_page122_x82.00_y178.00"></a>Tabla - Activos de Data 



|**Nombre del campo** |**Tipo de dato** |**Descripción** |**Posibles valores** |**Obligatorio (Sí/No)** |
| :- | - | - | :- | :-: |
|ID Posición |Código |Código que identifica a la posición dentro de la organización que gobierna el dato ||Sí |
|Id Tipo de Entidad |Código |Define el ámbito de acción |Personas Empresas Canales Productos Etc.… |Sí |
|Versión |Número |Correlativo que inicia en 1, por cada creación de nueva versión se incrementa en 1 ||Sí |
|Resumen de la versión |Texto |Breve explicación del contenido de la versión |Datos de contacto de clientes |Sí |
|Estado |Código |Refleja el estado de vigente o no del registro |<p>1 edición </p><p>2 publicado 3 caducado 4 archivado </p>|Sí |
|Id Dato |Texto |Contiene el nombre del dato que gobierna |Apellidos Nombres Razón social Celulares Correos etc.… |Sí |
|Fecha de creación |Fecha dd/mm/aaaa |Fecha en que se ejecuta la carga masiva ||Sí |
|Usuario creador |User ID |Usuario conectado en la app ||Sí |
|Fecha modificación |Fecha dd/mm/aaaa |||Condicionado |
|Usuario modifica |User ID |Usuario conectado en la app ||Condicionado |

<a name="_page122_x82.00_y712.00"></a>Tabla - carga masiva - Activos de Data 



<table><tr><th colspan="2"><b>Nombre del campo</b> </th><th colspan="1" valign="top"><b>Tipo de dato</b> </th><th colspan="1" valign="top"><b>Descripción</b> </th><th colspan="2"><b>Posibles valores</b> </th><th colspan="2"><b>Obligatorio (Sí/No)</b> </th></tr>
<tr><td colspan="1" rowspan="3">![ref1]</td><td colspan="4">Especificaciones funcionales</td><td colspan="2">CÓDIGO: </td><td colspan="1">OPSP-FRM10 </td></tr>
<tr><td colspan="4" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="2">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="2">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



|Acción |Texto |Elección del Usuario para ejecutar en la carga masiva |Crear Modificar Eliminar Archivar Rehabilitar |Sí |
| - | - | :- | :- | - |
|Respuesta |Código |Es la respuesta que emite el sistema luego de procesar la petición del usuario |Ok Error |Sí |
|Detalle de respuesta |Texto |Detalle o explicación del error encontrado en la operación ||Condicionado |
|ID Posición |Código |Código que identifica a la posición dentro de la organización que gobierna el dato ||<p>Condicionado. Si es “crear” </p><p>es obligatorio </p>|
|Id Tipo de Entidad |Código |Define el ámbito de acción |Personas Empresas Canales Productos Etc.… |<p>Condicionado. Si es “crear” </p><p>es obligatorio </p>|
|Versión |Número |Correlativo que inicia en 1, porcada creación de nueva versión se incrementa en 1 |Es automático, lo controla el sistema en base a la última versión existente |Sí |
|Estado |Código |Refleja el estado de vigente o no del registro. Es automático, lo controla el sistema en base a lo solicitado en “acción” |<p>1 edición </p><p>2 vigente </p><p>3 no vigente 4 archivado 5 eliminado </p>|Sí |
|Id Dato |Texto |Contiene el nombre del dato que gobierna |Apellidos Nombres Razón social Celulares Correos etc.… |<p>Condicionado. Si es “crear” </p><p>es obligatorio </p>|
|SisGest |Código |Sistema de gestión que se relaciona con el dato |Valores de la Tabla Sistemas de gestión |No |



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>

<a name="_page124_x82.00_y115.00"></a>Tabla - Documentos 



<table><tr><th colspan="2"><b>Nombre del campo</b> </th><th colspan="1" valign="top"><b>Tipo de dato</b> </th><th colspan="1" valign="top"><b>Descripción</b> </th><th colspan="2"><b>Posibles valores</b> </th><th colspan="2"><b>Obligatorio (Sí/No)</b> </th></tr>
<tr><td colspan="2" valign="top">ID </td><td colspan="1" valign="top">Alfanumérico </td><td colspan="1">Identificador único del Proceso asociado al documento </td><td colspan="2"></td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Secuencia </td><td colspan="1" valign="top">Numérico </td><td colspan="1">Número de actividad asociado al documento </td><td colspan="2"></td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Id Documento </td><td colspan="1" valign="top">Alfanumérico </td><td colspan="1">Código asignado al documento </td><td colspan="2"></td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Versión </td><td colspan="1" valign="top">Número </td><td colspan="1">Correlativo que inicia en 1, por cada creación de nueva versión se incrementa en 1 </td><td colspan="2"></td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Resumen de la versión </td><td colspan="1" valign="top">Texto </td><td colspan="1">Breve explicación del contenido de la versión </td><td colspan="2"></td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Estado </td><td colspan="1" valign="top">Código </td><td colspan="1" valign="top">Refleja el estado de vigente o no del documento </td><td colspan="2"><p>1 edición </p><p>2 publicado 3 caducado 4 archivado </p></td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Id Posición </td><td colspan="1" valign="top">Código </td><td colspan="1">Es la posición en la organización que tiene el gobierno de datos, viene de la tabla Activos de Data. </td><td colspan="2"></td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Grupo </td><td colspan="1" valign="top">Alfanumérico </td><td colspan="1">Es un código que agrupa los documentos por familia. Este dato permite ver los documentos en un árbol, cada grupo abre una nueva sección </td><td colspan="2"></td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Tipo </td><td colspan="1" valign="top">Código </td><td colspan="1"><p>Clasifica los documentos. Todos los documentos pasan por aprobación excepto las “Normas país”. Los documentos que </p><p>se muestran en pantalla pueden ser cambiados de TIPO simplemente arrastrando el </p></td><td colspan="2" valign="top"><p>1 norma país 2 política </p><p>3 formulario 4 sistema de gestión </p></td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="1" rowspan="3">![ref1]</td><td colspan="4">Especificaciones funcionales</td><td colspan="2">CÓDIGO: </td><td colspan="1">OPSP-FRM10 </td></tr>
<tr><td colspan="4" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="2">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="2">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



|||documento hacia otro TIPO |||
| :- | :- | :- | :- | :- |
|Word adjunto |Adjunto |Es el documento almacenado para futuras actualizaciones ||Sí |
|Pdf adjunto |Adjunto |Es el documento en vista protegida, usado normalmente para compartirlo, generado automáticamente a partir del Word ||Sí |
|Fecha de expiración |Fecha |Todo documento tiene una media de duración de un año, se calcula automáticamente a partir de la fecha de creación y puede ser modificado por el usuario ||Sí |
|url documento |url |Dirección que se inserta en páginas web y otros lugares de internet que direccionan siempre a la versión publicada del documento ||Sí |
|Fecha de creación |Fecha dd/mm/aaaa |Fecha en que se ejecuta la carga masiva ||Sí |
|Usuario creador |User ID |Usuario conectado en la app ||Sí |
|Fecha modificación |Fecha dd/mm/aaaa |||Condicionado |
|Usuario modifica |User ID |Usuario conectado en la app ||Condicionado |

<a name="_page125_x82.00_y646.00"></a>Tabla – Definiciones - Indicadores 



|**Nombre del campo** |**Tipo de dato** |**Descripción** |**Posibles valores** |**Obligatorio (Sí/No)** |
| :- | - | - | - | :-: |
|ID Indicador (k) |Alfanumérico |Identificación del Indicador |Automático |Sí |
|ID Posición (k) |Alfanumérico |Rol que tiene el gobierno del indicador, viene de ||Sí |



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



<table><tr><th colspan="2"></th><th colspan="1"></th><th colspan="1">Personas – Posición </th><th colspan="3"></th><th colspan="1"></th></tr>
<tr><td colspan="2" valign="top">Módulo (k) </td><td colspan="1" valign="top">Alfanumérico </td><td colspan="1" valign="top">Identificación del módulo dentro de la app al cual pertenece el indicador </td><td colspan="3"><p>Organización Procesos Indicadores Sistemas Activos de Data Documentos Riesgos </p><p>Planes de acción Auditoria </p></td><td colspan="1" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Versión </td><td colspan="1" valign="top">Código </td><td colspan="1">Identifica la versión del Indicador </td><td colspan="3"></td><td colspan="1" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Resumen de la versión </td><td colspan="1" valign="top">Texto </td><td colspan="1">Breve explicación del contenido de la versión </td><td colspan="3"></td><td colspan="1" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">SisGest </td><td colspan="1" valign="top">Código </td><td colspan="1">Sistema de gestión que se asocia al proceso </td><td colspan="3">Obtenidos de la Tabla Sistemas de Gestión </td><td colspan="1" valign="top">No </td></tr>
<tr><td colspan="2" valign="top">Fecha de publicación </td><td colspan="1" valign="top">Fecha </td><td colspan="1">Fecha en que se publica el indicador </td><td colspan="3"></td><td colspan="1" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Objetivo </td><td colspan="1" valign="top">Texto </td><td colspan="1">Que mide el Indicador </td><td colspan="3"></td><td colspan="1" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Tipo </td><td colspan="1" valign="top">Código </td><td colspan="1" valign="top">Clasifica al Indicador </td><td colspan="3">Producción Financiero Tiempo Calidad Productividad Cumplimiento Innovación </td><td colspan="1" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Grupo </td><td colspan="1" valign="top">Código </td><td colspan="1"></td><td colspan="3">Estratégico Operativo </td><td colspan="1" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Frecuencia </td><td colspan="1" valign="top">Código </td><td colspan="1" valign="top">Indica la periodicidad con que se mide el indicador </td><td colspan="3"><p>Diario Semanal Quincenal Mensual </p><p>Bi mensual Trimestral Cuatrimestral Semestral Anual </p></td><td colspan="1" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Tipo de gráfico </td><td colspan="1" valign="top">Imagen </td><td colspan="1" valign="top">Forma en que se muestra el resultado </td><td colspan="3"><p>Serie </p><p>Barras Columnas Barras Combinado Gráfico circular Mapa de calor Cuadro de resultado Dispersión Gráfico de rectángulos Tacómetro </p></td><td colspan="1" valign="top">Sí </td></tr>
<tr><td colspan="1" rowspan="3">![ref1]</td><td colspan="4">Especificaciones funcionales</td><td colspan="1">CÓDIGO: </td><td colspan="3">OPSP-FRM10 </td></tr>
<tr><td colspan="4" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="3">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="3">15/01/2025 </td></tr>
</table>



||||Embudo ||
| :- | :- | :- | - | :- |
|ID Sistema |Código |Sistema que provee la información de las mediciones del indicador ||Sí |
|Fecha creación |Fecha |Fecha de la creación del registro ||Sí |
|Usuario creador |Código |ID Persona de quien crea el registro ||Sí |
|Fecha modificación |Fecha |Fecha de la última modificación del registro ||Sí |
|Usuario modificador |Código |ID Persona de quien modifica el registro ||Sí |

<a name="_page127_x82.00_y366.00"></a>Tabla – Metas - Indicadores 



<table><tr><th colspan="2"><b>Nombre del campo</b> </th><th colspan="1" valign="top"><b>Tipo de dato</b> </th><th colspan="1" valign="top"><b>Descripción</b> </th><th colspan="3" valign="top"><b>Posibles valores</b> </th><th colspan="1"><b>Obligatorio (Sí/No)</b> </th></tr>
<tr><td colspan="2" valign="top">ID Indicador (k) </td><td colspan="1" valign="top">Alfanumérico </td><td colspan="1">Identificación del Indicador </td><td colspan="3" valign="top">Automático </td><td colspan="1" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">ID Posición (k) </td><td colspan="1" valign="top">Alfanumérico </td><td colspan="1">Rol que tiene el gobierno del indicador, viene de Personas – Posición </td><td colspan="3"></td><td colspan="1" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Módulo (k) </td><td colspan="1" valign="top">Alfanumérico </td><td colspan="1" valign="top">Identificación del módulo dentro de la app al cual pertenece el indicador </td><td colspan="3"><p>Organización Procesos Indicadores Sistemas Activos de Data Documentos Riesgos </p><p>Planes de acción Auditoria </p></td><td colspan="1" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Fecha de meta </td><td colspan="1" valign="top">Fecha </td><td colspan="1">Fecha en que se debe obtener un resultado </td><td colspan="3">Puede ser fecha completa o mes o año </td><td colspan="1" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Meta </td><td colspan="1" valign="top">Texto </td><td colspan="1" valign="top">Meta periódica </td><td colspan="3"></td><td colspan="1" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Meta importe </td><td colspan="1" valign="top">Decimal </td><td colspan="1">Meta expresada en número </td><td colspan="3"></td><td colspan="1"></td></tr>
<tr><td colspan="2" valign="top">Umbral+ </td><td colspan="1" valign="top">Numérico </td><td colspan="1">Expresión del límite superior del indicador para considerarlo dentro del rango permitido </td><td colspan="3"></td><td colspan="1" valign="top">Sí </td></tr>
<tr><td colspan="1" rowspan="3">![ref1]</td><td colspan="4">Especificaciones funcionales</td><td colspan="1">CÓDIGO: </td><td colspan="2">OPSP-FRM10 </td></tr>
<tr><td colspan="4" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="2">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="2">15/01/2025 </td></tr>
</table>



|Umbral- |Numérico |Expresión del límite inferior del indicador para considerarlo dentro del rango permitido ||Sí |
| - | - | :- | :- | - |
|Unidad de medida  |Código |En que se expresa el resultado del indicador |Porcentaje Importe |Sí |
|Fórmula |Alfanumérico |Que variables participan del cálculo del indicador ||Sí |

<a name="_page128_x82.00_y301.00"></a>Tabla – Reglas de negocio 



|**Nombre del campo** |**Tipo de dato** |**Descripción** |**Posibles valores** |**Obligatorio (Sí/No)** |
| :- | - | - | - | :-: |
|ID Regla (k) |Alfanumérico |Identificación de la regla |Automático |Sí |
|Dominio (k) |Código |Ámbito general de aplicación de la regla |<p>Créditos </p><p>Seguros </p><p>Producto A Facturación Atención Clientes </p>|Sí |
|Tipo de regla (k) |Código |Agrupación según propósito o función |Cálculo Validación Descuento Recargo Rechazo |Sí |
|Regla (k) |Código |Identificación de la regla |||
|ID Regla Usuario |Alfanumérico |Código de regla ingresada por el Usuario ||No |
|ID Posición (k) |Alfanumérico |Rol que tiene el gobierno de la Regla viene de Personas – Posición ||Sí |
|Módulo (k) |Alfanumérico |Identificación del módulo dentro de la app al cual pertenece la regla |<p>Organización Procesos Indicadores Sistemas Activos de Data Documentos Riesgos </p><p>Planes de acción Auditoria </p>|Sí |



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



|Versión |Código |Identifica la versión de la regla ||Sí |
| - | - | :- | :- | - |
|Resumen de la versión |Texto |Breve explicación del contenido de la versión ||Sí |
|Fórmula |Alfanumérico |Texto descriptivo de la regla de negocio ||Sí |
|Fecha creación |Fecha |Fecha de la creación del registro ||Sí |
|Usuario creador |Código |ID Persona de quien crea el registro ||Sí |
|Fecha modificación |Fecha |Fecha de la última modificación del registro ||Sí |
|Usuario modificador |Código |ID Persona de quien modifica el registro ||Sí |

<a name="_page129_x82.00_y388.00"></a>Tabla – Adjuntos de Reglas de negocio 



|**Nombre del campo** |**Tipo de dato** |**Descripción** |**Posibles valores** |**Obligatorio (Sí/No)** |
| :- | - | - | - | :-: |
|ID Regla (k) |Alfanumérico |Identificación de la regla |Automático |Sí |
|ID Adjunto |Alfanumérico |Identificación del sistema para el adjunto |Automático |Sí |
|Adjunto |Texto |Archivo con el documento que estable la regla de negocio |PDF WORD EXCEL TXT |Sí |
|Versión |Numérico |Correlativo de las versiones del mismo documento ||Sí |
|Fecha creación |Fecha |Fecha de la creación del registro ||Sí |
|Usuario creador |Código |ID Persona de quien crea el registro ||Sí |
|Fecha modificación |Fecha |Fecha de la última modificación del registro ||Sí |
|Usuario modificador |Código |ID Persona de quien modifica el registro ||Sí |



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>

<a name="_page130_x82.00_y115.00"></a>Tabla – Sistemas de Gestión 



|**Nombre del campo** |**Tipo de dato** |**Descripción** |**Posibles valores** |**Obligatorio (Sí/No)** |
| :- | - | - | - | :-: |
|ID SisGest (k) |Alfanumérico |Identificación del Sistema de Gestión |Automático |Sí |
|Tipo de SisGest (k) |Código |Identifica el Tipo de Sistema de gestión |<p>**SGC** Sistema de gestión de calidad **SGA** Sistema de gestión ambiental **SG-SST** Sistema de gestión de seguridad y salud en el trabajo  **SGSI** Sistema de gestión de la seguridad de la información **SGCN** Sistema de gestión de continuidad de l negocio </p><p>**SGR** Sistema de gestión de riesgos **RSE** Sistema de gestión de Responsabilidad social Empresarial **SGA** Sistema de gestión de activos **SGE** Sistema de gestión de energía **SGI** Sistema de gestión de innovación **SGAS** Sistema de gestión antisoborno </p><p>**SGC** Sistema de gestión del conocimiento </p>|Sí |
|Nombre del documento |Texto |Nombre o Título del documento ||Sí |
|Versión |Numérico |Dato numérico que permite establecer cual es el último documento actualizado ||Sí |
|Resumen de la versión |Texto |Breve explicación del contenido de la versión ||Sí |



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



|Fecha de emisión |Fecha |Fecha en la que se publicó el documento ||Sí |
| - | - | :- | :- | - |
|Fecha de actualización |Fecha |Fecha en la que el documento se modificó o se reemplazó ||No |
|Fecha creación |Fecha |Fecha de la creación del registro ||Sí |
|Usuario creador |Código |ID Persona de quien crea el registro ||Sí |
|Fecha modificación |Fecha |Fecha de la última modificación del registro ||Sí |
|Usuario modificador |Código |ID Persona de quien modifica el registro ||Sí |

<a name="_page131_x82.00_y376.00"></a>Tabla - Adjuntos de Sistemas de Gestión 



|**Nombre del campo** |**Tipo de dato** |**Descripción** |**Posibles valores** |**Obligatorio (Sí/No)** |
| :- | - | - | - | :-: |
|ID SisGest (k) |Alfanumérico |Identificación del Sistema de gestión |Automático |Sí |
|ID Adjunto |Alfanumérico |Identificación del sistema para el adjunto |Automático |Sí |
|Título  |Texto |Nombre del documento del Sistema de gestión ||Sí |
|Adjunto |Texto |Archivo con el documento del sistema de gestión |PDF WORD EXCEL TXT |Sí |
|Versión |Numérico |Correlativo de las versiones del mismo documento ||Sí |
|Fecha creación |Fecha |Fecha de la creación del registro ||Sí |
|Usuario creador |Código |ID Persona de quien crea el registro ||Sí |
|Fecha modificación |Fecha |Fecha de la última modificación del registro ||Sí |
|Usuario modificador |Código |ID Persona de quien modifica el registro ||Sí |



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>

<a name="_page132_x82.00_y140.00"></a>Tabla - Relaciones a sistemas de gestión 



<table><tr><th colspan="2"><b>Nombre del campo</b> </th><th colspan="1" valign="top"><b>Tipo de dato</b> </th><th colspan="1" valign="top"><b>Descripción</b> </th><th colspan="2"><b>Posibles valores</b> </th><th colspan="2"><b>Obligatorio</b> <b>(Sí/No)</b> </th></tr>
<tr><td colspan="2" valign="top">ID Módulo Tipo (k) </td><td colspan="1" valign="top">Código </td><td colspan="1">Tipifica de que módulo dentro de la app pertenece la relación. Debe tener una opción “Externo” para relaciones extra app  </td><td colspan="2" valign="top"><p>“Organización” “Proceso” “Riesgo” “Plan de acción” </p><p>“Data” </p><p>Etc… </p></td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">ID Entidad (k) </td><td colspan="1" valign="top">Alfanumérico </td><td colspan="1" valign="top">Identificador único de la Entidad que se relaciona al Sistema de Gestión </td><td colspan="2" valign="top"><p>Código de Organización, Proceso, </p><p>Plan de acción, Riesgo, </p><p>Plan de auditoria  Etc… </p></td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Id Observación (k) </td><td colspan="1" valign="top">Código </td><td colspan="1">Sólo si viene de Auditoria, es la Identificación de la observación de auditoría.  </td><td colspan="2" valign="top">Nulo para Entidades diferentes a Auditoria.  </td><td colspan="2" valign="top">Si el ID Módulo Tipo es “Plan de auditoria” </td></tr>
<tr><td colspan="2" valign="top">SisGest (k) </td><td colspan="1" valign="top">Código </td><td colspan="1">Sistema de gestión que se asocia al proceso </td><td colspan="2">Obtenidos de la Tabla Sistemas de Gestión </td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Descripción Entidad </td><td colspan="1" valign="top">Texto </td><td colspan="1" valign="top">Describe la entidad </td><td colspan="2"></td><td colspan="2">Para cuando el ID Módulo Tipo sea “Externo” </td></tr>
<tr><td colspan="2" valign="top">Usuario creador </td><td colspan="1" valign="top">Código </td><td colspan="1">Obtenido de las Posiciones de la Organización </td><td colspan="2"></td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Fecha de Registro </td><td colspan="1" valign="top">Fecha (dd/mm/aaaa) </td><td colspan="1">El sistema registra la Fecha en que se creó por primera vez el proceso </td><td colspan="2" valign="top">Fecha del día </td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Usuario que modifica </td><td colspan="1" valign="top">Código </td><td colspan="1">Guarda la información de la última modificación, es obligatorio en todo tipo de edición que termine en actualización del proceso </td><td colspan="2"></td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2">Fecha de modificación </td><td colspan="1">Fecha (dd/mm/aaaa) </td><td colspan="1">Guarda la fecha de la última </td><td colspan="2"></td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="1" rowspan="3">![ref1]</td><td colspan="4">Especificaciones funcionales</td><td colspan="2">CÓDIGO: </td><td colspan="1">OPSP-FRM10 </td></tr>
<tr><td colspan="4" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="2">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="2">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



|||modificación, es obligatorio en todo tipo de edición que termine en actualización del proceso |||
| :- | :- | :- | :- | :- |
<a name="_page133_x82.00_y264.00"></a>Tabla – Resultados - Indicadores 



|**Nombre del campo** |**Tipo de dato** |**Descripción** |**Posibles valores** |**Obligatorio (Sí/No)** |
| :- | - | - | - | :-: |
|ID Indicador (k) |Alfanumérico |Identificación del Indicador ||Sí |
|Fecha de medición (k) |Fecha |Fecha que se ejecutó la medición ||Sí |
|ID Persona |Código |Persona responsable del indicador en la fecha ||Sí |
|Periodo desde |Fecha |Rango inicial de medición del indicador ||Sí |
|Periodo hasta |Fecha |Rango final de medición del indicador ||Sí |
|Resultado |Numérico |Número o fracción para porcentaje ||Sí |
|Gráfico |Anexo |El Resultado del Indicador en formato imagen ||No |
|Fecha creación |Fecha |Fecha de la creación del registro ||Sí |
|Usuario creador |Código |ID Persona de quien crea el registro ||Sí |
|Fecha modificación |Fecha |Fecha de la última modificación del registro ||Sí |
|Usuario modificador |Código |ID Persona de quien modifica el registro ||Sí |



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>

<a name="_page134_x82.00_y115.00"></a>Formato de reporte de observaciones vs Sistemas de gestión 



|**Nombre del campo** |**Origen** |
| - | - |
|Sistema de gestión |Resultados de auditoria |
|ID Plan Auditoria |Resultados de auditoria |
|Observación de auditoría |Resultados de auditoria |
|Fecha de la observación |Resultados de auditoria |
|Tipo de resultado |Resultados de auditoria |
|Tipificación Resultado |Resultados de auditoria |
|Tipo No conformidad |Resultados de auditoria |
|Causa |Resultados de auditoria |
|Módulo |Resultados de auditoria |
|Estado de la observación |Resultados de auditoria |
|Última revisión |Resultados de auditoria |

<a name="_page134_x82.00_y353.00"></a>Tabla – Usuarios y Perfiles 



<table><tr><th colspan="2"><b>Nombre del campo</b> </th><th colspan="1" valign="top"><b>Tipo de dato</b> </th><th colspan="1" valign="top"><b>Descripción</b> </th><th colspan="2"><b>Posibles valores</b> </th><th colspan="2"><b>Obligatorio (Sí/No)</b> </th></tr>
<tr><td colspan="2" valign="top">ID Persona (k) </td><td colspan="1" valign="top">Alfanumérico </td><td colspan="1" valign="top">Identificación del Usuario </td><td colspan="2">Referenciado de la Tabla Personas </td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">ID Posición (k) </td><td colspan="1" valign="top">Alfanumérico </td><td colspan="1">Rol que tiene en la organización, viene de Personas – Posición </td><td colspan="2"></td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Módulo </td><td colspan="1" valign="top">Alfanumérico </td><td colspan="1" valign="top">Identificación del módulo dentro de la app al cual se le concede acceso </td><td colspan="2"><p>Organización Procesos Indicadores Sistemas Activos de Data Documentos Riesgos </p><p>Planes de acción Auditoria </p></td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Funcionalidad </td><td colspan="1" valign="top">Alfanumérico </td><td colspan="1">Desagregado de las opciones del Módulo </td><td colspan="2" valign="top">Ej.: Gestión de Hallazgos </td><td colspan="2"></td></tr>
<tr><td colspan="2" valign="top">Permisos </td><td colspan="1" valign="top">Alfanumérico </td><td colspan="1" valign="top">Opciones específicas a las que tiene acceso </td><td colspan="2">Crear Modificar Consultar Eliminar Archivar </td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2" valign="top">Estado </td><td colspan="1" valign="top">Alfanumérico </td><td colspan="1" valign="top">Situación de uso del permiso </td><td colspan="2">Vigente No vigente Suspendido </td><td colspan="2" valign="top">Sí </td></tr>
<tr><td colspan="2">Fecha de expiración </td><td colspan="1" valign="top">Fecha </td><td colspan="1">Cuando se crean usuarios con </td><td colspan="2"></td><td colspan="2" valign="top">No </td></tr>
<tr><td colspan="1" rowspan="3">![ref1]</td><td colspan="4">Especificaciones funcionales</td><td colspan="2">CÓDIGO: </td><td colspan="1">OPSP-FRM10 </td></tr>
<tr><td colspan="4" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="2">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="2">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



|||acceso por tiempo limitado |||
| :- | :- | :- | :- | :- |
|Fecha creación |Fecha |Fecha de creación del Usuario ||Sí |
|Usuario creador |Código |ID Persona de quien crea el registro ||Sí |
|Fecha modificación |Fecha |Fecha de la última modificación del registro ||Sí |
|Usuario modificador |Código |ID Persona de quien modifica el registro ||Sí |

<a name="_page135_x82.00_y302.00"></a>Tabla – Parámetros generales 



|**Nombre del campo** |**Tipo de dato** |**Descripción** |**Posibles valores** |**Obligatorio (Sí/No)** |
| :- | - | - | :- | :-: |
|ID Parámetro |Alfanumérico |Correlativo que identifica el parámetro ||Sí |
|Nombre parámetro |Texto |Descripción del parámetro ||Sí |
|Tipo parámetro |Código |Los parámetros pueden tener diferentes formatos, aquí se especifica que formato usar |Formato Fecha Formato Hora Huso horario Moneda Símbolo decimal Número entero Número con 2 decimales Duración de procesos incompletos |Sí |
|Fecha creación |Fecha |Fecha de creación del registro ||Sí |
|Usuario creador |Código |ID Persona de quien crea el registro ||Sí |
|Fecha modificación |Fecha |Fecha de la última modificación del registro ||Sí |
|Usuario modificador |Código |ID Persona de quien modifica el registro ||Sí |



<table><tr><th colspan="1" rowspan="3">![ref1]</th><th colspan="1">Especificaciones funcionales</th><th colspan="1">CÓDIGO: </th><th colspan="1">OPSP-FRM10 </th></tr>
<tr><td colspan="1" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="1">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="1">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>

<a name="_page136_x82.00_y115.00"></a>Tabla - Log de accesos 



|**Nombre del campo** |**Tipo de dato** |**Descripción** |**Posibles valores** |**Obligatorio (Sí/No)** |
| :- | - | - | :- | :-: |
|ID Log (k) |Alfanumérico |Correlativo que identifica el registro de una acción en el sistema ||Sí |
|ID Fecha |Fecha |Fecha en que se accedió al sistema ||Sí |
|ID Hora |Time |Hora en que se accedió al sistema ||Sí |
|Usuario |Código ||De Personas ID |Sí |
|Módulo |Código |Módulo al cual se accedió ||Sí |
|Acción |Código |Acción realizada |Crear Modificar Consultar Eliminar Archivar |Sí |
|Resumen de la versión |Texto |Breve explicación del contenido de la versión ||Sí |

<a name="_page136_x82.00_y443.00"></a>Tabla - Emociones 



|**Emociones** ||**Descripción** |**Posibles valores** |**Obligatorio (Sí/No)** |
| - | :- | - | :- | :-: |
|ID Cod Emoción (k) |Alfanumérico |ID del registro ||Sí |
|ID Emoción |Texto |Descripción de la emoción |<p>Alegría Confianza Miedo Sorpresa Tristeza Molestia </p><p>Ira Anticipación </p>|Sí |
|ID Valor |Numérico |<p>Cada emoción tiene un valor, en una escala del 1 al </p><p>10\. Cerca al 1 es malo, Cerca del 10 es muy bueno </p>||Sí |

<a name="_page136_x82.00_y717.00"></a>Parámetros del sistema – Alertas y recordatorios 



<table><tr><th colspan="2"><b>Nombre del campo</b> </th><th colspan="1" valign="top"><b>Tipo de dato</b> </th><th colspan="1" valign="top"><b>Descripción</b> </th><th colspan="2"><b>Posibles valores</b> </th><th colspan="2"><b>Obligatorio (Sí/No)</b> </th></tr>
<tr><td colspan="1" rowspan="3">![ref1]</td><td colspan="4">Especificaciones funcionales</td><td colspan="2">CÓDIGO: </td><td colspan="1">OPSP-FRM10 </td></tr>
<tr><td colspan="4" rowspan="2">Proyecto App de Gestión por Procesos </td><td colspan="2">VERSIÓN </td><td colspan="1">01 </td></tr>
<tr><td colspan="2">FECHA: </td><td colspan="1">15/01/2025 </td></tr>
</table>



|ID |Alfanumérico |Entidad a la que aplica el parámetro |<p>Proceso Actividad Organización Auditoría Documento Riesgo </p><p>Etc. </p>|Sí |
| - | - | :- | :- | - |
|Inicio de alertas |Numérico |Número de días para que se inicie la alerta ||Sí |
|Recordatorios |Numérico |Cantidad de días para que el sistema envíe recordatorios mientras la alerta siga vigente ||Sí |
|Expiración |Tiempo |<p>Expresado en años, meses y días que deben transcurrir para que la entidad cambie de estado </p><p>a “No vigente” </p>||No |

[ref1]: Aspose.Words.3184fba8-1f57-4373-a4d7-5b011bad4160.001.png
[ref2]: Aspose.Words.3184fba8-1f57-4373-a4d7-5b011bad4160.005.jpeg
[ref3]: Aspose.Words.3184fba8-1f57-4373-a4d7-5b011bad4160.006.png
