/*
 * Árbol genealógico interactivo
 * -----------------------------
 * Lee los datos de familia.json y dibuja el árbol con Cytoscape.js.
 * Todo lo que suele querer cambiarse (tamaño de las fichas, separación entre
 * generaciones, colores...) está en CONFIG, aquí abajo.
 */
const CONFIG = {
    // Tamaño de cada ficha (una persona) en píxeles
    nodeWidth: 150,
    nodeHeight: 240,
    // La foto ocupa este porcentaje del alto de la ficha (el resto es el texto)
    photoHeightRatio: 0.8333,
    // Separación horizontal entre fichas y vertical entre generaciones
    spacingX: 190,
    spacingY: 560,
    // Límites de zoom (0.1 = muy lejos, 2 = muy cerca)
    minZoom: 0.1,
    maxZoom: 2,
    // Colores de las fichas: [hombre, mujer] por generación (0 = raíz)
    colors: [
        ['#e3f2fd', '#1976d2', '#fce4ec', '#e91e63'],
        ['#e8f5e8', '#4caf50', '#fff3e0', '#ff9800'],
        ['#f3e5f5', '#9c27b0', '#e0f2f1', '#009688'],
        ['#ede7f6', '#673ab7', '#fce4ec', '#e91e63']
    ]
};

$(document).ready(function() {
    // Cargar datos del archivo JSON
    let familyData;
    
    // Función para cargar los datos de la familia
    async function loadFamilyData() {
        try {
            const response = await fetch('familia.json');
            familyData = await response.json();
            applyTitle(familyData.title);
            initializeTree();
        } catch (error) {
            console.error('Error al cargar familia.json:', error);
            // Datos de fallback si falla la carga
            familyData = {
                husband: "Abuelo",
                wife: "Abuela",
                children: []
            };
            initializeTree();
        }
    }

    // El título es opcional: familia.json puede traer "title": "Mi familia"
    function applyTitle(title) {
        if (!title) return;
        document.title = title;
        const h1 = document.getElementById('titulo');
        if (h1) h1.textContent = title;
    }
    
    // Función para inicializar el árbol
    function initializeTree() {
        // Generar datos para Cytoscape.js recursivamente
        function generateCytoscapeData() {
            const elements = { nodes: [], edges: [] };
            let nodeIdCounter = 0;
            
            // Función recursiva para procesar nodos
            function processNode(nodeData, parentId = null, level = 0, nodeIndex = 0) {
                const nodeType = level === 0 ? 'root' : level === 1 ? 'child' : level === 2 ? 'grandchild' : 'greatgrandchild';
                
                // Generar IDs según las especificaciones: 0, 1, 2, 3... y sus parejas 0p, 1p, 2p, 3p...
                let baseId;
                if (level === 0) {
                    baseId = '0';
                } else if (parentId) {
                    // Generar ID jerárquico: hijo 1 del nodo 1 = 11, hijo 2 = 12, etc.
                    const parentBaseId = parentId.replace('p', '');
                    baseId = parentBaseId + (nodeIndex + 1);
                }
                
                const husbandId = baseId;
                const wifeId = baseId + 'p';
                
                // Crear label estilo pie de foto para el esposo
                let husbandLabel = nodeData.husband || 'Sin nombre';
                
                // Añadir fecha y lugar de nacimiento en formato: DD/MM/YYYY - Lugar
                if (nodeData.husbandBirthDate || nodeData.husbandBirthPlace) {
                    husbandLabel += '\n';
                    if (nodeData.husbandBirthDate) husbandLabel += nodeData.husbandBirthDate;
                    if (nodeData.husbandBirthDate && nodeData.husbandBirthPlace) husbandLabel += ' - ';
                    if (nodeData.husbandBirthPlace) husbandLabel += nodeData.husbandBirthPlace;
                }
                
                // Añadir fecha y lugar de defunción en formato: DD/MM/YYYY - Lugar
                if (nodeData.husbandDeathDate || nodeData.husbandDeathPlace) {
                    husbandLabel += '\n';
                    if (nodeData.husbandDeathDate) husbandLabel += nodeData.husbandDeathDate;
                    if (nodeData.husbandDeathDate && nodeData.husbandDeathPlace) husbandLabel += ' - ';
                    if (nodeData.husbandDeathPlace) husbandLabel += nodeData.husbandDeathPlace;
                }
                
                // Crear nodo del esposo (nodo principal)
                const husbandInfo = {
                    id: husbandId,
                    label: husbandLabel,
                    husband: nodeData.husband,
                    photo: nodeData.husbandPhoto || null,
                    birthPlace: nodeData.husbandBirthPlace || '',
                    birthDate: nodeData.husbandBirthDate || '',
                    deathPlace: nodeData.husbandDeathPlace || '',
                    deathDate: nodeData.husbandDeathDate || '',
                    level: level,
                    type: nodeType,
                    nodeRole: 'husband'
                };
                
                elements.nodes.push({
                    data: husbandInfo
                });
                
                // Crear nodo de la esposa si existe
                if (nodeData.wife) {
                    // Crear label estilo pie de foto para la esposa
                    let wifeLabel = nodeData.wife;
                    
                    // Añadir fecha y lugar de nacimiento en formato: DD/MM/YYYY - Lugar
                    if (nodeData.wifeBirthDate || nodeData.wifeBirthPlace) {
                        wifeLabel += '\n';
                        if (nodeData.wifeBirthDate) wifeLabel += nodeData.wifeBirthDate;
                        if (nodeData.wifeBirthDate && nodeData.wifeBirthPlace) wifeLabel += ' - ';
                        if (nodeData.wifeBirthPlace) wifeLabel += nodeData.wifeBirthPlace;
                    }
                    
                    // Añadir fecha y lugar de defunción en formato: DD/MM/YYYY - Lugar
                    if (nodeData.wifeDeathDate || nodeData.wifeDeathPlace) {
                        wifeLabel += '\n';
                        if (nodeData.wifeDeathDate) wifeLabel += nodeData.wifeDeathDate;
                        if (nodeData.wifeDeathDate && nodeData.wifeDeathPlace) wifeLabel += ' - ';
                        if (nodeData.wifeDeathPlace) wifeLabel += nodeData.wifeDeathPlace;
                    }
                    
                    const wifeInfo = {
                        id: wifeId,
                        label: wifeLabel,
                        wife: nodeData.wife,
                        photo: nodeData.wifePhoto || null,
                        birthPlace: nodeData.wifeBirthPlace || '',
                        birthDate: nodeData.wifeBirthDate || '',
                        deathPlace: nodeData.wifeDeathPlace || '',
                        deathDate: nodeData.wifeDeathDate || '',
                        level: level,
                        type: nodeType,
                        nodeRole: 'wife'
                    };
                    
                    elements.nodes.push({
                        data: wifeInfo
                    });
                    
                    // Crear conexión entre esposo y esposa
                    elements.edges.push({
                        data: {
                            id: `marriage_${husbandId}_${wifeId}`,
                            source: husbandId,
                            target: wifeId,
                            edgeType: 'marriage'
                        }
                    });
                }
                
                // Crear arista desde el padre si existe
                if (parentId) {
                    elements.edges.push({
                        data: {
                            id: `parent_${parentId}_${husbandId}`,
                            source: parentId,
                            target: husbandId,
                            edgeType: 'parent'
                        }
                    });
                }
                
                // Procesar hijos recursivamente
                if (nodeData.children && nodeData.children.length > 0) {
                    nodeData.children.forEach((childData, childIndex) => {
                        processNode(childData, husbandId, level + 1, childIndex);
                    });
                }
                
                return husbandId;
            }
            
            // Procesar el nodo raíz
            const rootId = processNode(familyData);
            
            return elements;
        }

        // Generar datos primero
        const cytoscapeData = generateCytoscapeData();
        console.log('Datos generados:', cytoscapeData);
        
        // Inicializar Cytoscape.js
        const cy = cytoscape({
            container: document.getElementById('cy'),
            
            boxSelectionEnabled: false,
            autounselectify: true,
            userPanningEnabled: true,
            userZoomingEnabled: true,
            
            // Limitar zoom para que el árbol siempre sea visible
            minZoom: CONFIG.minZoom,
            maxZoom: CONFIG.maxZoom,
            
            // Deshabilitar arrastre de nodos individuales
            autoungrabify: true,
            
            elements: cytoscapeData,
        
            style: [
                {
                    selector: 'node',
                    style: {
                        'background-color': '#ffffff',
                        'border-color': '#007acc',
                        'border-width': 2,
                        'width': CONFIG.nodeWidth + 'px',
                        'height': CONFIG.nodeHeight + 'px',
                        'shape': 'round-rectangle',
                        'border-radius': (CONFIG.nodeWidth / 2) + 'px',
                        'text-halign': 'center',
                        'text-valign': 'center',
                        'text-margin-y': Math.round(CONFIG.nodeHeight / 2 - 20),
                        'text-max-width': (CONFIG.nodeWidth - 4) + 'px',
                        'color': '#333333',
                        'font-size': '10px',
                        'font-weight': '500',
                        'text-wrap': 'wrap',
                        'label': 'data(label)',
                        'overlay-opacity': 0,
                        'transition-property': 'border-color, width, height, display',
                        'transition-duration': '0.3s',
                        'display': 'element',
                        'z-index': 10, // Capa 10: Nodos principales al frente
                        'background-image': 'data(photo)',
                        'background-fit': 'contain',
                        'background-clip': 'node',
                        'background-width': '100%',
                        'background-height': (CONFIG.photoHeightRatio * 100).toFixed(2) + '%',
                        'background-position-x': '50%',
                        'background-position-y': '0%'
                    }
                },
                {
                    selector: 'node[nodeRole="husband"]',
                    style: {
                        'background-color': '#e3f2fd',
                        'border-color': '#1976d2',
                        'border-width': 3
                    }
                },
                {
                    selector: 'node[nodeRole="wife"]',
                    style: {
                        'background-color': '#fce4ec',
                        'border-color': '#e91e63',
                        'border-width': 3
                    }
                },
                {
                    selector: 'node[type="root"][nodeRole="husband"]',
                    style: {
                        'background-color': CONFIG.colors[0][0],
                        'border-color': CONFIG.colors[0][1],
                        'border-width': 4,
                        'font-size': '10px',
                        'font-weight': 'bold',
                        'z-index': 10 // Capa 10: Nodos principales al frente
                    }
                },
                {
                    selector: 'node[type="root"][nodeRole="wife"]',
                    style: {
                        'background-color': CONFIG.colors[0][2],
                        'border-color': CONFIG.colors[0][3],
                        'border-width': 4,
                        'font-size': '10px',
                        'font-weight': 'bold',
                        'z-index': 10 // Capa 10: Nodos principales al frente
                    }
                },
                {
                    selector: 'node[type="child"][nodeRole="husband"]',
                    style: {
                        'background-color': CONFIG.colors[1][0],
                        'border-color': CONFIG.colors[1][1],
                        'z-index': 10 // Capa 10: Nodos principales al frente
                    }
                },
                {
                    selector: 'node[type="child"][nodeRole="wife"]',
                    style: {
                        'background-color': CONFIG.colors[1][2],
                        'border-color': CONFIG.colors[1][3],
                        'z-index': 10 // Capa 10: Nodos principales al frente
                    }
                },
                {
                    selector: 'node[type="grandchild"][nodeRole="husband"]',
                    style: {
                        'background-color': CONFIG.colors[2][0],
                        'border-color': CONFIG.colors[2][1]
                    }
                },
                {
                    selector: 'node[type="grandchild"][nodeRole="wife"]',
                    style: {
                        'background-color': CONFIG.colors[2][2],
                        'border-color': CONFIG.colors[2][3]
                    }
                },
                {
                    selector: 'node[type="greatgrandchild"][nodeRole="husband"]',
                    style: {
                        'background-color': CONFIG.colors[3][0],
                        'border-color': CONFIG.colors[3][1],
                        'font-size': '10px'
                    }
                },
                {
                    selector: 'node[type="greatgrandchild"][nodeRole="wife"]',
                    style: {
                        'background-color': CONFIG.colors[3][2],
                        'border-color': CONFIG.colors[3][3],
                        'font-size': '10px'
                    }
                },
                {
                    selector: 'node:hover',
                    style: {
                        'border-color': '#ff6b6b',
                        'border-width': 4
                    }
                },
                {
                    selector: 'edge',
                    style: {
                        'width': 2,
                        'line-color': '#cccccc',
                        'target-arrow-color': '#cccccc',
                        'target-arrow-shape': 'triangle',
                        'curve-style': 'bezier',
                        'opacity': 0.6,
                        'display': 'element',
                        'transition-property': 'display, line-color, width',
                        'transition-duration': '0.3s',
                        'target-endpoint': '0deg',
                        'z-index': 5000
                    }
                },
                {
                    selector: 'edge[edgeType="marriage"]',
                    style: {
                        'width': 4,
                        'line-color': '#e91e63',
                        'target-arrow-shape': 'none',
                        'curve-style': 'straight',
                        'opacity': 0.8,
                        'source-endpoint': '0px 0px',
                        'target-endpoint': '0px 0px',
                        'z-index': 5000
                    }
                },
                {
                    selector: 'edge[edgeType="parent"]',
                    style: {
                        'width': 2,
                        'line-color': '#1976d2',
                        'target-arrow-color': '#1976d2',
                        'target-arrow-shape': 'triangle',
                        'opacity': 0.7,
                        'curve-style': 'bezier',
                        'source-endpoint': (CONFIG.nodeWidth / 2 - 1) + 'px ' + (CONFIG.nodeHeight / 2) + 'px',
                        'z-index': 5000
                    }
                },
                {
                    selector: 'edge:hover',
                    style: {
                        'width': 3,
                        'line-color': '#007acc',
                        'target-arrow-color': '#007acc',
                        'opacity': 1
                    }
                }
            ],
            
            layout: {
                name: 'breadthfirst',
                directed: true,
                padding: 80,
                spacingFactor: 1.8,
                roots: cytoscapeData.nodes.find(n => n.data.type === 'root' && n.data.nodeRole === 'husband')?.data.id || '0',
                animate: false, // las posiciones finales las pone layoutGrid()
                animationDuration: 1000,
                avoidOverlap: true,
                nodeDimensionsIncludeLabels: true,
                maximalAdjustments: 5,
                animateFilter: function( node, i ){ return true; },
                fit: false
            }
        });

        // Sistema de interacción compatible con táctil y ratón
        let tapTimer;
        let tapCount = 0;
        let isDesktop = !('ontouchstart' in window);
        
        // Función para manejar primer clic/tap (mostrar conexiones)
        function handleFirstTap(node) {
            const connectedEdges = node.connectedEdges();
            const connectedNodes = connectedEdges.connectedNodes();
            
            connectedNodes.animate({
                style: {
                    'border-color': '#ff6b6b',
                    'border-width': 5
                }
            }, {
                duration: 300
            });
            
            tapTimer = setTimeout(() => {
                connectedNodes.animate({
                    style: {
                        'border-color': '',
                        'border-width': ''
                    }
                }, {
                    duration: 300
                });
                tapCount = 0;
            }, 1500);
        }
        
        // Función para expandir/contraer (usada por móvil y escritorio)
        function expandCollapseNode(evt, node) {
            const currentNode = node || evt.target;
            const nodeId = currentNode.id();
            const nodeData = currentNode.data();
            
            // Solo permitir expansión en nodos principales (esposos), no en parejas
            if (nodeId.endsWith('p')) {
                return;
            }
            
            // Construir mapa de hijos con TODOS los nodos (no solo visibles)
            let childrenMap = {};
            cy.nodes().forEach(n => {
                // Solo considerar aristas padre-hijo, no matrimoniales
                const parentEdges = n.incomers('edge').filter(edge => 
                    edge.data('edgeType') === 'parent'
                );
                
                if (parentEdges.length > 0) {
                    let parentId = parentEdges[0].source().id();
                    if (!childrenMap[parentId]) {
                        childrenMap[parentId] = [];
                    }
                    childrenMap[parentId].push(n.id());
                }
            });
            
            let hijos = childrenMap[nodeId] || [];
            if (hijos.length === 0) return;
            
            let anyVisible = hijos.some(hid => cy.getElementById(hid).visible());
            
            if (anyVisible) {
                // Oculta hijos y todos los descendientes
                function hideRec(ids) {
                    ids.forEach(cid => {
                        // Ocultar el nodo principal
                        cy.getElementById(cid).hide();
                        // Ocultar la pareja si existe
                        const partnerNode = cy.getElementById(cid + 'p');
                        if (partnerNode.length > 0) {
                            partnerNode.hide();
                        }
                        // Ocultar todas las aristas relacionadas con este nodo y su pareja
                        cy.edges().filter(e => 
                            e.data('source') === cid || e.data('target') === cid ||
                            e.data('source') === cid + 'p' || e.data('target') === cid + 'p'
                        ).hide();
                        
                        if (childrenMap[cid]) hideRec(childrenMap[cid]);
                    });
                }
                hideRec(hijos);
                
                // Ocultar aristas directas del nodo padre
                cy.edges().filter(e => e.data('source') === nodeId).forEach(edge => {
                    const targetId = edge.data('target');
                    if (!cy.getElementById(targetId).visible()) {
                        edge.hide();
                    }
                });
            } else {
                // Muestra solo hijos directos
                hijos.forEach(cid => {
                    // Mostrar el nodo principal
                    cy.getElementById(cid).show();
                    // Mostrar la pareja si existe
                    const partnerNode = cy.getElementById(cid + 'p');
                    if (partnerNode.length > 0) {
                        partnerNode.show();
                        // Mostrar arista matrimonial
                        cy.edges().filter(e => 
                            (e.data('source') === cid && e.data('target') === cid + 'p') ||
                            (e.data('source') === cid + 'p' && e.data('target') === cid)
                        ).show();
                    }
                    // Mostrar arista padre-hijo
                    cy.edges().filter(e => 
                        e.data('source') === nodeId && e.data('target') === cid && 
                        e.data('edgeType') === 'parent'
                    ).show();
                });
            }
            
            // Aplicar el algoritmo de cuadrícula con centrado en pantalla
            layoutGrid();
            
            // Esperar a que termine la animación del layout (500ms + 50ms buffer)
            setTimeout(() => {
                // Obtener posición renderizada del nodo (en coordenadas del viewport)
                const nodeRenderedPos = currentNode.renderedPosition();
                
                // Calcular el centro de la pantalla
                const containerWidth = $('#cy').width();
                const containerHeight = $('#cy').height();
                const centerX = containerWidth / 2;
                const centerY = containerHeight / 2;
                
                // Calcular cuánto hay que mover el pan
                const currentPan = cy.pan();
                const deltaX = centerX - nodeRenderedPos.x;
                const deltaY = centerY - nodeRenderedPos.y;
                
                // Aplicar el centrado con animación suave
                cy.animate({
                    pan: {
                        x: currentPan.x + deltaX,
                        y: currentPan.y + deltaY
                    }
                }, {
                    duration: 500,
                    easing: 'ease-in-out',
                    complete: function() {
                        // Actualizar restricciones de paneo después del centrado
                        // TEMPORALMENTE DESHABILITADO - causaba problemas de visualización
                        // const newBounds = cy.elements(':visible').boundingBox();
                        // cy.panningConstraints({
                        //     x1: newBounds.x1 - 50,
                        //     x2: newBounds.x2 + 50,
                        //     y1: newBounds.y1 - 50,
                        //     y2: newBounds.y2 + 50
                        // });
                    }
                });
            }, 550);
        }
        
        if (isDesktop) {
            // Eventos para escritorio
            let clickTimer;
            
            cy.on('click', 'node', function(evt) {
                clearTimeout(clickTimer);
                const node = evt.target;
                
                clickTimer = setTimeout(() => {
                    // Solo ejecutar si no fue un doble clic
                    handleFirstTap(node);
                    tapCount = 0;
                }, 250);
            });
            
            cy.on('dblclick', 'node', function(evt) {
                clearTimeout(clickTimer);
                clearTimeout(tapTimer);
                expandCollapseNode(evt, evt.target);
                tapCount = 0;
            });
        } else {
            // Eventos para dispositivos táctiles
            cy.on('tap', 'node', function(evt) {
                tapCount++;
                const node = evt.target;
                
                if (tapCount === 1) {
                    handleFirstTap(node);
                } else if (tapCount === 2) {
                    clearTimeout(tapTimer);
                    expandCollapseNode(evt, node);
                    tapCount = 0;
                }
            });
        }

        // Algoritmo de cuadrícula dinámica con soporte para parejas
        function layoutGrid(animar = true) {
            // Mueve un nodo: con animación al expandir/contraer, sin ella al cargar
            function mover(nodo, x, y) {
                if (animar) {
                    nodo.animate({ position: { x: x, y: y } }, { duration: 500 });
                } else {
                    nodo.position({ x: x, y: y });
                }
            }

            let colMap = {};
            let rowMap = {};
            let childrenMap = {};
            
            // Construir mapa de hijos solo para nodos principales (no parejas)
            cy.nodes().forEach(node => {
                const nodeData = node.data();
                // Solo procesar aristas padre-hijo (no matrimoniales)
                const parentEdges = node.incomers('edge').filter(edge => 
                    edge.data('edgeType') === 'parent'
                );
                
                if (parentEdges.length > 0) {
                    const parentId = parentEdges[0].source().id();
                    if (!childrenMap[parentId]) {
                        childrenMap[parentId] = [];
                    }
                    childrenMap[parentId].push(node.id());
                }
            });
            
            // Calcula cuántas columnas ocupa cada subárbol (solo nodos principales)
            function getSubtreeWidth(nodeId) {
                let hijos = (childrenMap[nodeId]||[]).filter(cid => cy.getElementById(cid).visible());
                if (hijos.length === 0) return 1;
                return hijos.reduce((acc, cid) => acc + getSubtreeWidth(cid), 0);
            }
            
            // Asigna columnas recursivamente, reservando espacio para cada subárbol
            let nextCol = 0;
            function setGridNoOverlap(nodeId, r) {
                rowMap[nodeId] = r;
                let hijos = (childrenMap[nodeId]||[]).filter(cid => cy.getElementById(cid).visible());
                
                if (hijos.length === 0) {
                    colMap[nodeId] = nextCol;
                    nextCol += 2; // Reservar espacio para la pareja
                } else {
                    let startCol = nextCol;
                    hijos.forEach(cid => {
                        setGridNoOverlap(cid, r+1);
                    });
                    let endCol = nextCol-2; // Restar 2 porque se añadió de más en el último hijo
                    
                    // Centrar el nodo padre sobre sus hijos
                    let totalCols = endCol - startCol + 2;
                    let centerCol;
                    if (hijos.length % 2 === 0) {
                        centerCol = startCol + (totalCols / 2) - 1;
                    } else {
                        centerCol = Math.floor((startCol + endCol) / 2);
                    }
                    colMap[nodeId] = centerCol;
                }
            }
            
            // Comenzar con el nodo raíz
            const rootNodeId = '0';
            if (cy.getElementById(rootNodeId).visible()) {
                setGridNoOverlap(rootNodeId, 0);
            }
            
            // Posicionar nodos visibles
            let visibleNodes = cy.nodes(':visible');
            let spacingX = CONFIG.spacingX; // Separación horizontal (>= ancho de la ficha)
            let spacingY = CONFIG.spacingY; // Separación vertical entre generaciones
            
            // Calcular el ancho total del árbol para centrarlo
            let columns = Object.values(colMap);
            if (columns.length > 0) {
                let minCol = Math.min(...columns);
                let maxCol = Math.max(...columns);
                let treeWidth = (maxCol - minCol + 1) * spacingX;
                let offsetX = -treeWidth / 2;
                
                visibleNodes.forEach(function(n){
                    let nodeData = n.data();
                    let nid = n.id();
                    
                    // Determinar si es pareja o nodo principal
                    if (nodeData.nodeRole === 'wife') {
                        // Es una pareja, posicionar al lado del esposo
                        let husbandId = nid.replace('p', '');
                        let husbandCol = colMap[husbandId];
                        
                        if (husbandCol !== undefined) {
                            // Usar la misma base que el esposo y añadir exactamente el ancho del nodo
                            let husbandX = (husbandCol - minCol) * spacingX + offsetX;
                            
                            // Las dos fichas de la pareja comparten el borde central
                            let x = husbandX + CONFIG.nodeWidth - 2;
                            let y = (rowMap[husbandId] || 0) * spacingY;
                            
                            mover(n, x, y);
                        }
                    } else if (nodeData.nodeRole === 'husband') {
                        // Es nodo principal
                        let colValue = colMap[nid];
                        
                        if (colValue !== undefined) {
                            let x = (colValue - minCol) * spacingX + offsetX;
                            let y = (rowMap[nid] || 0) * spacingY;
                            
                            mover(n, x, y);
                        }
                    }
                });
            }
            
            // Actualizar restricciones de paneo para nunca mostrar zona blanca
            // TEMPORALMENTE DESHABILITADO - causaba que no se mostrara el árbol
            // const newBounds = cy.elements(':visible').boundingBox();
            // cy.panningConstraints({
            //     x1: newBounds.x1 - 50,
            //     x2: newBounds.x2 + 50,
            //     y1: newBounds.y1 - 50,
            //     y2: newBounds.y2 + 50
            // });
            
            // TODO: Ajustar endpoints después del layout si es necesario
            // setTimeout(() => {
            //     adjustEdgeEndpoints();
            // }, 600);
        }
        
        // Función para ajustar los endpoints de las conexiones padre-hijo
        function adjustEdgeEndpoints() {
            cy.edges('[edgeType="parent"]').forEach(edge => {
                const sourceNode = edge.source();
                
                // Verificar si el nodo fuente tiene pareja
                const sourcePartnerId = sourceNode.id() + 'p';
                const sourcePartner = cy.getElementById(sourcePartnerId);
                
                if (sourcePartner.length > 0 && sourcePartner.visible()) {
                    // Calcular posición de intersección inferior
                    const sourcePos = sourceNode.renderedPosition();
                    const sourcePartnerPos = sourcePartner.renderedPosition();
                    
                    // Punto central horizontal entre la pareja
                    const centerX = (sourcePos.x + sourcePartnerPos.x) / 2;
                    // Calcular offset relativo al nodo fuente
                    const offsetX = centerX - sourcePos.x;
                    const offsetY = 50; // Desde el centro hacia la parte inferior
                    
                    // Aplicar endpoint personalizado
                    edge.style({
                        'source-endpoint': `${offsetX}px ${offsetY}px`
                    });
                }
            });
        }
        
        // Event listeners para los botones
        document.getElementById('expandAllBtn').addEventListener('click', function() {
            expandAllNodes();
        });

        document.getElementById('centerTreeBtn').addEventListener('click', function() {
            centerTree();
        });

        document.getElementById('yearScaleBtn').addEventListener('click', function() {
            layoutByYear();
        });

        // Función para extraer el año de una fecha en formato DD/MM/YYYY
        function extractYear(dateString) {
            if (!dateString) return null;
            const parts = dateString.split('/');
            if (parts.length === 3) {
                return parseInt(parts[2], 10);
            }
            return null;
        }

        // Función para obtener todos los años de nacimiento únicos
        function getBirthYears() {
            const years = new Set();
            cy.nodes().forEach(node => {
                const birthDate = node.data('birthDate');
                const year = extractYear(birthDate);
                if (year) {
                    years.add(year);
                }
            });
            return Array.from(years).sort((a, b) => a - b);
        }

        // Función para obtener el rango de años (redondeado a décadas múltiplos de 10)
        function getYearRange(years) {
            if (years.length === 0) {
                return { min: 1900, max: 2000 };
            }
            let minYear = Math.min(...years);
            let maxYear = Math.max(...years);
            
            // Redondear a décadas (múltiplos de 10)
            minYear = Math.ceil(minYear / 10) * 10; // Redondear hacia arriba para empezar en década completa
            maxYear = Math.ceil(maxYear / 10) * 10 + 10; // Añadir una década extra para la franja faltante
            
            return { min: minYear, max: maxYear };
        }

        // Función para posicionar nodos por año de nacimiento
        function layoutByYear() {
            const years = getBirthYears();
            const { min, max } = getYearRange(years);
            
            if (years.length === 0) {
                alert('No hay años de nacimiento disponibles para mostrar la escala');
                return;
            }

            // Guardar posiciones X originales del grid layout
            const originalPositions = {};
            cy.nodes().forEach(node => {
                originalPositions[node.id()] = {
                    x: node.position().x
                };
            });

            // Calcular la escala
            const yearRange = max - min;
            const pixelPerYear = 50; // Pixels por año
            const startY = 100; // Margen superior
            
            // Posicionar cada nodo por su año de nacimiento, manteniendo X original
            cy.nodes().forEach(node => {
                const birthDate = node.data('birthDate');
                const year = extractYear(birthDate);
                
                if (year) {
                    // Calcular posición Y basada en el año
                    const y = startY + (year - min) * pixelPerYear;
                    
                    // Mantener la posición X original
                    const x = originalPositions[node.id()]?.x || node.position().x;
                    
                    // Animar a la nueva posición
                    node.animate({
                        position: { x: x, y: y }
                    }, {
                        duration: 500
                    });
                }
            });

            // Dibujar la escala de años y líneas horizontales
            drawYearScale(min, max, startY, pixelPerYear);
            
            // Centrar la vista después de la animación
            setTimeout(() => {
                centerTree();
            }, 600);
        }

        // Variable para almacenar los elementos de la escala (para poder eliminarlos)
        let yearScaleElements = [];

        // Función para dibujar la escala de años usando nodos de Cytoscape
        function drawYearScale(minYear, maxYear, startY, pixelPerYear) {
            // Eliminar escala anterior
            yearScaleElements.forEach(el => el.remove());
            yearScaleElements = [];

            // Encontrar el bounding box de todos los nodos visibles
            const bounds = cy.elements(':visible').boundingBox();
            
            // Posición X de la escala (extremo izquierdo del bounding box menos margen)
            const scaleXPos = bounds.x1 - 500;
            
            // Posición X derecha (extremo derecho del bounding box más margen)
            const rightXPos = bounds.x2 + 200;
            
            // Ancho de las líneas horizontales
            const lineWidth = rightXPos - scaleXPos;
            
            // Altura total de la escala
            const firstY = startY;
            const lastY = startY + (maxYear - minYear) * pixelPerYear;
            const verticalHeight = lastY - firstY + 100;

            // Tamaño de fuente muy grande
            const fontSize = 500;
            const lineSpacing = pixelPerYear * 10; // 500 pixels entre décadas

            // Colores alternativos crema para las franjas de fondo
            const cremaColors = [
                '#FAF0E6', // Década 0 del siglo: Muy claro (1800, 1900, 2000...)
                '#F5E6D3', // Década 1 del siglo: Muy claro
                '#F0DCBC', // Década 2 del siglo: Claro
                '#EBD2A5', // Década 3 del siglo: Claro-medio
                '#E6C89E', // Década 4 del siglo: Medio
                '#E1BE87', // Década 5 del siglo: Medio-oscuro
                '#DCB470', // Década 6 del siglo: Oscuro
                '#D7AA59', // Década 7 del siglo: Bastante oscuro
                '#D2A042', // Década 8 del siglo: Muy oscuro
                '#CD962B'  // Década 9 del siglo: El más oscuro
            ];
            
            for (let year = minYear; year < maxYear; year += 10) {
                const decadeSpacing = pixelPerYear * 10;
                const yearY = startY + (year - minYear) * pixelPerYear - 250 + (decadeSpacing / 2) - 250; // 5 años hacia arriba
                
                const yearBg = cy.add({
                    group: 'nodes',
                    data: {
                        id: `yearBg_${year}`,
                        type: 'yearBackground'
                    },
                    position: { x: scaleXPos + lineWidth / 2, y: yearY }
                });
                yearScaleElements.push(yearBg);
            }

            // Crear líneas horizontales
            for (let year = minYear; year <= maxYear; year += 10) {
                const lineY = startY + (year - minYear) * pixelPerYear - 250 - 250; // 5 años hacia arriba
                const decadeSpacing = pixelPerYear * 10;
                const yearY = lineY + (decadeSpacing / 2);

                // Crear línea horizontal
                const lineNode = cy.add({
                    group: 'nodes',
                    data: {
                        id: `line_${year}`,
                        type: 'yearLine'
                    },
                    position: { x: scaleXPos + lineWidth / 2, y: lineY }
                });
                yearScaleElements.push(lineNode);

                // Crear múltiples etiquetas de año cada 4000 píxeles (6 veces) para que se repitan horizontalmente
                const spacing = 4000;
                for (let i = 0; i < 6; i++) {
                    const yearX = scaleXPos + 30 + (i * spacing);
                    const yearLabel = cy.add({
                        group: 'nodes',
                        data: {
                            id: `year_${year}_${i}`,
                            label: (year - 10).toString(),
                            type: 'yearScale'
                        },
                        position: { x: yearX, y: yearY - 250 } // 5 años hacia arriba
                    });
                    yearScaleElements.push(yearLabel);
                }
            }

            // Línea vertical eliminada (comentada)
            // const verticalLine = cy.add({
            //     group: 'nodes',
            //     data: {
            //         id: 'scale_vertical_line',
            //         type: 'yearVertical'
            //     },
            //     position: { x: scaleXPos + 30, y: firstY + verticalHeight / 2 }
            // });
            // yearScaleElements.push(verticalLine);

            // Aplicar estilos específicos
            cy.batch(() => {
                // Estilo para línea vertical (eliminada)
                // const vLine = cy.getElementById('scale_vertical_line');
                // if (vLine.length > 0) {
                //     vLine.style({
                //         'width': 4,
                //         'height': verticalHeight,
                //         'background-color': 'transparent',
                //         'shape': 'rectangle',
                //         'events': 'no'
                //     });
                // }

                // Estilos para las franjas de color (fondo más lejano)
                cy.nodes('[type="yearBackground"]').forEach(bgNode => {
                    const yearId = bgNode.id().replace('yearBg_', '');
                    const year = parseInt(yearId);
                    
                    // Calcular el índice de color basado en la década del siglo
                    // 1800, 1900, 2000 = índice 1 (desplazado 10 años)
                    // 1810, 1910, 2010 = índice 2
                    // y así sucesivamente hasta índice 9 (más oscuro)
                    const centuryStart = Math.floor(year / 100) * 100 ;
                    const decadeInCentury = Math.floor((year - centuryStart +90 ) / 10); // Sumar 10 años
                    const colorIndex = decadeInCentury % 10;
                    
                    bgNode.style({
                        'width': lineWidth,
                        'height': pixelPerYear * 10,
                        'background-color': cremaColors[colorIndex],
                        'background-opacity': 0.6,
                        'shape': 'rectangle',
                        'z-index': 1, // Capa 1: Fondo más lejano
                        'events': 'no' // No interferir con eventos
                    });
                });

                // Estilos para las líneas horizontales (capa intermedia)
                cy.nodes('[type="yearLine"]').forEach(lineNode => {
                    lineNode.style({
                        'width': lineWidth,
                        'height': 3,
                        'background-color': '#888888',
                        'shape': 'rectangle',
                        'z-index': 2, // Capa 2: Líneas sobre franjas
                        'events': 'no' // No interferir con eventos
                    });
                });

                // Estilos para las etiquetas de año (capa superior a líneas)
                cy.nodes('[type="yearScale"]').forEach(label => {
                    label.style({
                        'width': 500,
                        'height': 450,
                        'background-color': 'rgba(0,0,0,0)',
                        'background-opacity': 0,
                        'border-width': 0,
                        'text-halign': 'center',
                        'text-valign': 'center',
                        'text-margin-y': 0,
                        'font-size': fontSize + 'px',
                        'font-weight': 'bold',
                        'color': '#bbbbbb',
                        'z-index': 3, // Capa 3: Años sobre líneas
                        'events': 'no' // No interferir con eventos
                    });
                });
            });
        }

        // Función para limpiar la escala de años
        function clearYearScale() {
            yearScaleElements.forEach(el => {
                if (el && el.remove) {
                    el.remove();
                }
            });
            yearScaleElements = [];
        }



        // Función para centrar el árbol actual con zoom máximo
        function centerTree() {
            const visibleElements = cy.elements(':visible');
            
            if (visibleElements.length === 0) {
                return;
            }

            // Calcular el bounding box de los elementos visibles
            const bounds = visibleElements.boundingBox();
            
            // Obtener dimensiones del contenedor
            const containerWidth = $('#cy').width();
            const containerHeight = $('#cy').height();
            
            // Calcular el zoom óptimo para que el árbol quepa en la pantalla
            const padding = 100;
            const zoomX = (containerWidth - padding) / bounds.w;
            const zoomY = (containerHeight - padding) / bounds.h;
            const optimalZoom = Math.min(zoomX, zoomY, 2); // No exceder zoom 2
            
            // Calcular la posición central del árbol
            const centerX = (bounds.x1 + bounds.x2) / 2;
            const centerY = (bounds.y1 + bounds.y2) / 2;
            
            // Calcular la posición en el contenedor para centrar
            const panX = (containerWidth / 2) - (centerX * optimalZoom);
            const panY = (containerHeight / 2) - (centerY * optimalZoom);
            
            // Animar al centro con el zoom óptimo
            cy.animate({
                pan: { x: panX, y: panY },
                zoom: optimalZoom
            }, {
                duration: 500,
                easing: 'ease-in-out'
            });
        }

        // Función para expandir todos los nodos del árbol
        function expandAllNodes() {
            clearYearScale();
            // Mostrar todos los nodos y aristas
            cy.elements().show();
            
            // Ejecutar layout para repositionar
            layoutGrid();
            
            // Centrar y ajustar zoom después del layout
            setTimeout(() => {
                centerTree();
            }, 600);
        }
        
        // Layout inicial: colocar y encuadrar el árbol sin animación
        cy.elements().style('display', 'element');
        layoutGrid(false);
        cy.fit(cy.elements(':visible'), 50);

        // Asegurar que los fondos de año no interfieran con el arrastre del canvas
        cy.on('drag', 'node[type="yearBackground"]', function(e) {
            e.preventDefault();
        });

        // Configurar para que el canvas se pueda arrastrar haciendo clic en cualquier área
        cy.ready(function() {
            // El arrastre del canvas ya debería funcionar con userPanningEnabled: true
            // Los fondos no deben interferir con events: 'no'
        });
    }
    
    // Iniciar la carga de datos
    loadFamilyData();
});
