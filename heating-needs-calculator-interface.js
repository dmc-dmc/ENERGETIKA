// interface.js - Contains event handlers and UI logic

// Initialize everything when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    
    // Initialize form with event listeners
    initializeForm();
    
    // Add event listeners to buttons
    document.getElementById('calculateBtn').addEventListener('click', calculateAll);
    document.getElementById('printBtn').addEventListener('click', printForm);
    
    // Add real-time calculation for building height
    document.getElementById('obstavanObjemV').addEventListener('input', calculateAverageHeight);
    document.getElementById('celkovaPodlahovaPlocha').addEventListener('input', calculateAverageHeight);
    
    // Add event listeners for thermal bridges selection
    document.querySelectorAll('input[name="tepelneMosty"]').forEach(input => {
        input.addEventListener('change', toggleThermalBridgesMethod);
    });
    
    // Add event listeners for all inputs in the heat transfer table
    const heatTransferInputs = document.querySelectorAll('#heatTransferTable input');
    heatTransferInputs.forEach(input => {
        input.addEventListener('input', calculateHeatTransferTable);
    });
    
    // Add event listeners for solar gains inputs
    const solarInputs = document.querySelectorAll('#solarGainsTable input');
    solarInputs.forEach(input => {
        input.addEventListener('input', calculateSolarGains);
    });
    
    // Add event listeners for building type selection
    document.querySelectorAll('input[name="typBudovy"]').forEach(input => {
        input.addEventListener('change', calculateInternalGains);
    });
    
    // Add event listener for air exchange rate
    document.getElementById('intenzitaVymenyVzduchu').addEventListener('input', calculateVentilationHeatLoss);
    
    // Direct event handlers for table popups
    const table3Ref = document.getElementById('table3Reference');
    if (table3Ref) {
        table3Ref.onclick = function(e) {
            e.preventDefault();
            document.getElementById('table3Popup').style.display = 'block';
            console.log('Table 3 clicked');
        };
    }
    
    const table14Ref = document.getElementById('table14Reference');
    if (table14Ref) {
        table14Ref.onclick = function(e) {
            e.preventDefault();
            document.getElementById('table14Popup').style.display = 'block';
            console.log('Table 14 clicked');
        };
    }
    
    // Close buttons for popups
    const closeButtons = document.querySelectorAll('.close-popup');
    closeButtons.forEach(button => {
        button.onclick = function() {
            this.closest('.table-popup').style.display = 'none';
        };
    });
    
    // Also set up the popup functionality the other way
    setupTablePopups();
});

// Initialize form with default values and settings
function initializeForm() {
    // Set default values if needed
    
    // Initialize thermal bridges method
    toggleThermalBridgesMethod();
    
    // Add event listeners for building category selection
    document.querySelectorAll('input[name="kategoriaBudovy"]').forEach(input => {
        input.addEventListener('change', updateBuildingTypeQi);
    });
}

// Function to update qi value based on building category selection
function updateBuildingTypeQi() {
    const selectedBuildingType = document.querySelector('input[name="kategoriaBudovy"]:checked');
    
    if (selectedBuildingType) {
        const buildingType = selectedBuildingType.value;
        
        // Set qi value based on building type
        switch (buildingType) {
            case 'rodinnyDom':
                document.querySelector('input[name="typBudovy"][value="4"]').checked = true;
                break;
            case 'bytovyDom':
                document.querySelector('input[name="typBudovy"][value="5"]').checked = true;
                break;
            default:
                document.querySelector('input[name="typBudovy"][value="6"]').checked = true;
                break;
        }
        
        // Update internal gains calculation
        calculateInternalGains();
        calculateTotalGains();
        calculateHeatNeed();
        calculateBuildingShapeFactor();
        evaluateResults();
    }
}

// Toggle between exact and pausal thermal bridges calculation method
function toggleThermalBridgesMethod() {
    const exaktneSelected = document.querySelector('input[name="tepelneMosty"][value="exaktne"]').checked;
    
    document.getElementById('exaktneContainer').style.display = exaktneSelected ? 'block' : 'none';
    document.getElementById('pausalneContainer').style.display = exaktneSelected ? 'none' : 'block';
    
    // Recalculate thermal bridges impact
    calculateThermalBridges();
}

// Print form function
function printForm() {
    window.print();
}

// Auto-calculations on input changes
function setupAutoCalculations() {
    // These functions will be called whenever input values change
    
    // Add event listeners for inputs that affect the heat need calculation
    const heatNeedInputs = [
        document.getElementById('obstavanObjemV'),
        document.getElementById('celkovaPodlahovaPlocha'),
        document.getElementById('intenzitaVymenyVzduchu')
    ];
    
    // Add event listeners for solar gains tables inputs
    document.querySelectorAll('#solarGainsTable input').forEach(input => {
        input.addEventListener('input', function() {
            calculateSolarGains();
            calculateTotalGains();
            // Heat need will be triggered by calculateTotalGains
            calculateBuildingShapeFactor();
            evaluateResults();
        });
    });
    
    // Add event listeners to all thermal bridges inputs
    document.querySelectorAll('input[name="pausalneHodnoty"]').forEach(input => {
        input.addEventListener('change', function() {
            calculateThermalBridges();
            calculateTotalHeatTransfer();
            calculateVentilationHeatLoss(); // This will calculate total heat loss
            calculateHeatNeed();
            evaluateResults();
        });
    });
    
    document.getElementById('deltaUExaktne').addEventListener('input', function() {
        calculateThermalBridges();
        calculateTotalHeatTransfer();
        calculateVentilationHeatLoss(); // This will calculate total heat loss
        calculateHeatNeed();
        evaluateResults();
    });
    
    // Add cascading calculation effects
    heatNeedInputs.forEach(input => {
        input.addEventListener('input', function() {
            // Order matters here - calculate from top to bottom of form
            calculateAverageHeight();
            calculateVentilationHeatLoss();
            calculateInternalGains();
            calculateTotalGains();
            // Heat need will be triggered by calculateTotalGains
            calculateBuildingShapeFactor();
            evaluateResults();
        });
    });
    
    // Add a calculate button event listener to ensure all calculations are performed
    document.getElementById('calculateBtn').addEventListener('click', function() {
        calculateAll();
    });
}

// Call setupAutoCalculations when the page is loaded
document.addEventListener('DOMContentLoaded', setupAutoCalculations);

// Setup table popups
function setupTablePopups() {
    // Make sure this function runs after all DOM elements are loaded
    window.addEventListener('load', function() {
        // Table 3 popup
        const table3Reference = document.getElementById('table3Reference');
        const table3Popup = document.getElementById('table3Popup');
        
        if (table3Reference && table3Popup) {
            const table3Close = table3Popup.querySelector('.close-popup');
            
            table3Reference.addEventListener('click', function(e) {
                e.preventDefault();
                table3Popup.style.display = 'block';
                console.log('Table 3 popup opened');
            });
            
            if (table3Close) {
                table3Close.addEventListener('click', function() {
                    table3Popup.style.display = 'none';
                });
            }
        } else {
            console.error('Table 3 popup elements not found:', {
                reference: !!table3Reference,
                popup: !!table3Popup
            });
        }
        
        // Table 14 popup
        const table14Reference = document.getElementById('table14Reference');
        const table14Popup = document.getElementById('table14Popup');
        
        if (table14Reference && table14Popup) {
            const table14Close = table14Popup.querySelector('.close-popup');
            
            table14Reference.addEventListener('click', function(e) {
                e.preventDefault();
                table14Popup.style.display = 'block';
                console.log('Table 14 popup opened');
            });
            
            if (table14Close) {
                table14Close.addEventListener('click', function() {
                    table14Popup.style.display = 'none';
                });
            }
        } else {
            console.error('Table 14 popup elements not found:', {
                reference: !!table14Reference,
                popup: !!table14Popup
            });
        }
        
        // Close popups when clicking outside
        window.addEventListener('click', function(event) {
            if (table3Popup && event.target === table3Popup) {
                table3Popup.style.display = 'none';
            }
            if (table14Popup && event.target === table14Popup) {
                table14Popup.style.display = 'none';
            }
        });
        
        // Add direct event listeners as a fallback
        const allTableReferences = document.querySelectorAll('.table-reference');
        allTableReferences.forEach(function(ref) {
            ref.addEventListener('click', function() {
                const id = this.id;
                let popupId = null;
                
                if (id === 'table3Reference') {
                    popupId = 'table3Popup';
                } else if (id === 'table14Reference') {
                    popupId = 'table14Popup';
                }
                
                if (popupId) {
                    const popup = document.getElementById(popupId);
                    if (popup) {
                        popup.style.display = 'block';
                        console.log(`Popup ${popupId} opened via fallback`);
                    }
                }
            });
        });
    });
}

// Additional utility functions
function validateInput(input, min = 0, max = Infinity) {
    let value = parseFloat(input.value);
    
    if (isNaN(value)) {
        input.value = "";
        return false;
    }
    
    if (value < min) {
        input.value = min;
        value = min;
    } else if (value > max) {
        input.value = max;
        value = max;
    }
    
    return value;
}

// Add keydown event handler for number inputs to prevent non-numeric input
document.addEventListener('DOMContentLoaded', function() {
    const numberInputs = document.querySelectorAll('input[type="number"]');
    
    numberInputs.forEach(input => {
        input.addEventListener('keydown', function(e) {
            // Allow: backspace, delete, tab, escape, enter, and decimal point
            if ([46, 8, 9, 27, 13, 110, 190].indexOf(e.keyCode) !== -1 ||
                 // Allow: Ctrl+A
                (e.keyCode === 65 && e.ctrlKey === true) || 
                 // Allow: Ctrl+C
                (e.keyCode === 67 && e.ctrlKey === true) || 
                 // Allow: Ctrl+X
                (e.keyCode === 88 && e.ctrlKey === true) || 
                 // Allow: home, end, left, right
                (e.keyCode >= 35 && e.keyCode <= 39) || 
                 // Allow minus sign for negative numbers
                (e.keyCode === 189)) {
                     // Let it happen
                     return;
            }
            
            // Ensure that it's a number and stop the keypress if not
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && 
                (e.keyCode < 96 || e.keyCode > 105)) {
                e.preventDefault();
            }
        });
    });
});
