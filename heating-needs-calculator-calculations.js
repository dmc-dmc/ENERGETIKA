// calculations.js - Contains all the main calculation functions

// Constants
const HOURS_IN_YEAR = 8760; // Hours in a year

// Main calculation function
function calculateAll() {
    // Section 1: Building
    calculateAverageHeight();
    
    // Section 2: Heat transfer loss
    calculateHeatTransferTable();
    
    // Section 3: Thermal bridges
    calculateThermalBridges();
    
    // Section 4-5: Total heat transfer & average coefficient
    calculateTotalHeatTransfer();
    
    // Section 6-7: Ventilation heat loss & total heat loss
    calculateVentilationHeatLoss();
    
    // Section 8-10: Solar & internal gains
    calculateSolarGains();
    calculateInternalGains();
    calculateTotalGains();
    
    // Section 11-12: Heat need
    calculateHeatNeed();
    
    // Section 13-16: Building shape factor & normalized values
    calculateBuildingShapeFactor();
    
    // Section 17-18: Evaluations
    evaluateResults();
}

// Calculate average height
function calculateAverageHeight() {
    const volume = parseFloat(document.getElementById('obstavanObjemV').value) || 0;
    const area = parseFloat(document.getElementById('celkovaPodlahovaPlocha').value) || 0;
    
    if (volume > 0 && area > 0) {
        const avgHeight = volume / area;
        document.getElementById('priemernaVyska').value = avgHeight.toFixed(2);
    } else {
        document.getElementById('priemernaVyska').value = "";
    }
}

// Calculate heat transfer table values
function calculateHeatTransferTable() {
    const rows = document.querySelectorAll('#heatTransferTable tbody tr');
    let sumArea = 0;
    let sumBUA = 0;
    
    rows.forEach(row => {
        const areaInput = row.querySelector('input[name^="area_"]');
        const uInput = row.querySelector('input[name^="u_"]');
        
        if (areaInput && uInput) {
            const area = parseFloat(areaInput.value) || 0;
            const u = parseFloat(uInput.value) || 0;
            const bx = parseFloat(row.cells[4].innerText) || 1;
            
            // Calculate U·A
            const ua = area * u;
            row.querySelector(`span[class^="ua_"]`).textContent = ua.toFixed(2);
            
            // Calculate bx·U·A
            const bua = bx * ua;
            row.querySelector(`span[class^="bua_"]`).textContent = bua.toFixed(2);
            
            // Add to sums
            sumArea += area;
            sumBUA += bua;
        }
    });
    
    // Update sums
    document.getElementById('sumArea').textContent = sumArea.toFixed(2);
    document.getElementById('sumBUA').textContent = sumBUA.toFixed(2);
}

// Calculate thermal bridges impact
function calculateThermalBridges() {
    const totalArea = parseFloat(document.getElementById('sumArea').textContent) || 0;
    let deltaU = 0;
    
    // Check which method is selected
    if (document.querySelector('input[name="tepelneMosty"][value="exaktne"]').checked) {
        deltaU = parseFloat(document.getElementById('deltaUExaktne').value) || 0;
    } else {
        // Get selected pausal value
        const selectedPausal = document.querySelector('input[name="pausalneHodnoty"]:checked');
        if (selectedPausal) {
            deltaU = parseFloat(selectedPausal.value) || 0;
        }
    }
    
    // Calculate thermal bridges impact
    const thermalBridgesImpact = deltaU * totalArea;
    document.getElementById('vplyvTepelnychMostov').value = thermalBridgesImpact.toFixed(2);
}

// Calculate total heat transfer and average coefficient
function calculateTotalHeatTransfer() {
    const sumBUA = parseFloat(document.getElementById('sumBUA').textContent) || 0;
    const thermalBridgesImpact = parseFloat(document.getElementById('vplyvTepelnychMostov').value) || 0;
    const totalArea = parseFloat(document.getElementById('sumArea').textContent) || 0;
    
    // Calculate total heat transfer
    const totalHeatTransfer = sumBUA + thermalBridgesImpact;
    document.getElementById('mernaTeplotnaSrataHT').value = totalHeatTransfer.toFixed(2);
    
    // Calculate average heat transfer coefficient
    if (totalArea > 0) {
        const avgCoefficient = totalHeatTransfer / totalArea;
        document.getElementById('priemernyKoeficient').value = avgCoefficient.toFixed(3);
    } else {
        document.getElementById('priemernyKoeficient').value = "";
    }
}

// Calculate ventilation heat loss and total heat loss
function calculateVentilationHeatLoss() {
    const volume = parseFloat(document.getElementById('obstavanObjemV').value) || 0;
    const airExchangeRate = parseFloat(document.getElementById('intenzitaVymenyVzduchu').value) || 0;
    const heatTransferLoss = parseFloat(document.getElementById('mernaTeplotnaSrataHT').value) || 0;
    
    // Calculate ventilation heat loss
    const ventilationHeatLoss = 0.264 * airExchangeRate * volume;
    document.getElementById('mernaTepelnaStrataVetranim').value = ventilationHeatLoss.toFixed(2);
    
    // Calculate total heat loss
    const totalHeatLoss = heatTransferLoss + ventilationHeatLoss;
    document.getElementById('celkovaMernaTepelnaStrata').value = totalHeatLoss.toFixed(2);
}

// Calculate solar gains
function calculateSolarGains() {
    const directions = ['juh', 'vychod', 'zapad', 'sever'];
    const intensities = [320, 200, 200, 100];
    let totalSolarGains = 0;
    
    directions.forEach((direction, index) => {
        const g = parseFloat(document.querySelector(`input[name="g_${direction}"]`).value) || 0;
        const a = parseFloat(document.querySelector(`input[name="a_${direction}"]`).value) || 0;
        const intensity = intensities[index];
        
        // Calculate solar gain for this direction
        // QSj = Isj·0,50·0,9·gsj·Anj
        const solarGain = intensity * 0.5 * 0.9 * g * a;
        document.querySelector(`.qs_${direction}`).textContent = solarGain.toFixed(3);
        
        totalSolarGains += solarGain;
    });
    
    document.getElementById('sumSolarGains').value = totalSolarGains.toFixed(3);
}

// Calculate internal gains
function calculateInternalGains() {
    const floorArea = parseFloat(document.getElementById('celkovaPodlahovaPlocha').value) || 0;
    const selectedType = document.querySelector('input[name="typBudovy"]:checked');
    let qi = 4; // Default value
    
    if (selectedType) {
        qi = parseFloat(selectedType.value) || 4;
    }
    
    // Calculate internal gains
    // Qi = 5· qi ·Ab (multiplied by 5 to convert from W/m² to kWh/year)
    const internalGains = 5 * qi * floorArea;
    document.getElementById('vnutorneZisky').value = internalGains.toFixed(3);
}

// Calculate total gains
function calculateTotalGains() {
    const solarGains = parseFloat(document.getElementById('sumSolarGains').value) || 0;
    const internalGains = parseFloat(document.getElementById('vnutorneZisky').value) || 0;
    
    const totalGains = solarGains + internalGains;
    document.getElementById('celkoveZisky').value = totalGains.toFixed(3);
    
    // Make sure to trigger heat need calculation since it depends on total gains
    calculateHeatNeed();
}

// Calculate heat need
function calculateHeatNeed() {
    const totalHeatLoss = parseFloat(document.getElementById('celkovaMernaTepelnaStrata').value) || 0;
    const internalGains = parseFloat(document.getElementById('vnutorneZisky').value) || 0;
    const solarGains = parseFloat(document.getElementById('sumSolarGains').value) || 0;
    const totalGains = parseFloat(document.getElementById('celkoveZisky').value) || 0;
    const floorArea = parseFloat(document.getElementById('celkovaPodlahovaPlocha').value) || 0;
    
    // Make sure we're using both types of gains correctly
    // QH = 82.1(HT+HV) – 0.95·(Qi+QS)
    const heatNeed = 82.1 * totalHeatLoss - 0.95 * (internalGains + solarGains);
    document.getElementById('potrebaTeplaNaVykurovanie').value = heatNeed.toFixed(3);
    
    // Calculate specific heat need
    if (floorArea > 0) {
        const specificHeatNeed = heatNeed / floorArea;
        document.getElementById('mernaPotrebaTepla').value = specificHeatNeed.toFixed(3);
    } else {
        document.getElementById('mernaPotrebaTepla').value = "";
    }
}

// Calculate building shape factor and normalized values
function calculateBuildingShapeFactor() {
    const totalArea = parseFloat(document.getElementById('sumArea').textContent) || 0;
    const volume = parseFloat(document.getElementById('obstavanObjemV').value) || 0;
    
    // Calculate building shape factor
    if (volume > 0) {
        const shapeFactor = totalArea / volume;
        document.getElementById('faktorTvaruBudovy').value = shapeFactor.toFixed(3);
        
        // Calculate normalized value
        // QH,nd,N1 = 0.5·(28.57 + 71.43 Σ Ai /Vb)
        const normalizedValue = 0.5 * (28.57 + 71.43 * shapeFactor);
        document.getElementById('normalizovanaHodnota').value = normalizedValue.toFixed(3);
        
        // Suggest U_e,m,N based on table 3
        suggestUemNValue(shapeFactor);
        
        // Suggest Q_N,EP based on building type and table 14
        suggestQNEPValue();
    } else {
        document.getElementById('faktorTvaruBudovy').value = "";
        document.getElementById('normalizovanaHodnota').value = "";
    }
}

// Suggest U_e,m,N value based on the shape factor
function suggestUemNValue(shapeFactor) {
    let uemN = 0;
    
    // Using values from Table 3 - odporúčané hodnoty from 1.1.2016
    if (shapeFactor <= 0.3) {
        uemN = 0.38;
    } else if (shapeFactor <= 0.4) {
        uemN = 0.35;
    } else if (shapeFactor <= 0.5) {
        uemN = 0.33;
    } else if (shapeFactor <= 0.6) {
        uemN = 0.31;
    } else if (shapeFactor <= 0.7) {
        uemN = 0.30;
    } else if (shapeFactor <= 0.8) {
        uemN = 0.29;
    } else if (shapeFactor <= 0.9) {
        uemN = 0.28;
    } else {
        uemN = 0.27;
    }
    
    document.getElementById('normalizovanaHodnotaUemN').value = uemN;
}

// Suggest Q_N,EP value based on building type
function suggestQNEPValue() {
    let qNEP = 0;
    
    // Check which building type is selected
    const buildingType = document.querySelector('input[name="kategoriaBudovy"]:checked');
    
    if (buildingType) {
        const buildingTypeValue = buildingType.value;
        
        // Using values from Table 14 - odporúčaná hodnota from 1.1.2016
        switch (buildingTypeValue) {
            case 'rodinnyDom':
                qNEP = 40.7;
                break;
            case 'bytovyDom':
                qNEP = 25.0;
                break;
            case 'administrativna':
                qNEP = 26.8;
                break;
            case 'skola':
                qNEP = 27.6;
                break;
            case 'nemocnica':
                qNEP = 33.2;
                break;
            case 'hotel':
                qNEP = 33.7;
                break;
            case 'sportovaHala':
                qNEP = 31.5;
                break;
            case 'obchod':
                qNEP = 30.9;
                break;
            default:
                qNEP = 30.0; // Default value
        }
    } else {
        // Default to residential building if none selected
        qNEP = 40.7;
    }
    
    document.getElementById('normalizovanaHodnotaQNEP').value = qNEP.toFixed(1);
}

// Evaluate results against standards
function evaluateResults() {
    const specificHeatNeed = parseFloat(document.getElementById('mernaPotrebaTepla').value) || 0;
    const normalizedValue = parseFloat(document.getElementById('normalizovanaHodnota').value) || 0;
    const avgCoefficient = parseFloat(document.getElementById('priemernyKoeficient').value) || 0;
    const normAvgCoefficient = parseFloat(document.getElementById('normalizovanaHodnotaUemN').value) || 0;
    
    // Evaluate heat transfer coefficient - Step 17
    if (avgCoefficient <= normAvgCoefficient && normAvgCoefficient > 0) {
        document.querySelector('input[name="vyhovujeUem"][value="ano"]').checked = true;
        document.getElementById('uemCompare').textContent = "≤";
        document.getElementById('uemCompare').style.color = "green";
    } else {
        document.querySelector('input[name="vyhovujeUem"][value="nie"]').checked = true;
        document.getElementById('uemCompare').textContent = ">";
        document.getElementById('uemCompare').style.color = "red";
    }
    
    // Update displayed values for U_e,m comparison
    document.getElementById('uemValue').textContent = avgCoefficient.toFixed(3);
    document.getElementById('uemNValue').textContent = normAvgCoefficient.toFixed(3);
    
    // Evaluate specific heat need - Step 18
    if (specificHeatNeed <= normalizedValue && normalizedValue > 0) {
        document.querySelector('input[name="vyhovujeQHnd"][value="ano"]').checked = true;
        document.getElementById('qHndCompare').textContent = "≤";
        document.getElementById('qHndCompare').style.color = "green";
    } else {
        document.querySelector('input[name="vyhovujeQHnd"][value="nie"]').checked = true;
        document.getElementById('qHndCompare').textContent = ">";
        document.getElementById('qHndCompare').style.color = "red";
    }
    
    // Update displayed values for Q_H,nd comparison
    document.getElementById('qHndValue').textContent = specificHeatNeed.toFixed(3);
    document.getElementById('qHndN1Value').textContent = normalizedValue.toFixed(3);
    
    // For QEP comparison, use Q_H,nd (specific heat need) as Q_EP value
    // For this evaluation, compare specific heat need with Q_N,EP
    const qnep = parseFloat(document.getElementById('normalizovanaHodnotaQNEP').value) || 0;
    
    // Update displayed values for Q_EP comparison
    document.getElementById('qEPValue').textContent = specificHeatNeed.toFixed(3);
    document.getElementById('qNEPValue').textContent = qnep.toFixed(3);
    
    if (specificHeatNeed <= qnep && qnep > 0) {
        document.querySelector('input[name="vyhovujeQEP"][value="ano"]').checked = true;
        document.getElementById('qEPCompare').textContent = "≤";
        document.getElementById('qEPCompare').style.color = "green";
    } else {
        document.querySelector('input[name="vyhovujeQEP"][value="nie"]').checked = true;
        document.getElementById('qEPCompare').textContent = ">";
        document.getElementById('qEPCompare').style.color = "red";
    }
}
