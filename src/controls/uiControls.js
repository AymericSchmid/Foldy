export function createUiControls() {
    // Get toggle objects
    const toggleVectors = document.getElementById('toggleVectors');
    const toggleSplines = document.getElementById('toggleSplines');
    const toggleAminoAcids = document.getElementById('toggleAminoAcids');
    const toggleTubeCaps = document.getElementById('toggleTubeCaps');
    const toggleTube = document.getElementById('toggleTube');
    const toggleFXAA = document.getElementById('toggleFXAA');
    const toggleBloom = document.getElementById('toggleBloom');
    const styleSelect = document.getElementById('styleSelect');

    const state = {
        showVectors: toggleVectors.checked,
        showSplines: toggleSplines.checked,
        showAminoAcids: toggleAminoAcids.checked,
        showTubeCaps: toggleTubeCaps.checked,
        showTube: toggleTube.checked,
        fxaaEnabled: toggleFXAA.checked,
        bloomEnabled: toggleBloom.checked,
        style: styleSelect.value
    }

    toggleVectors.addEventListener('change', (e) => {
        state.showVectors = e.target.checked;
    });

    toggleSplines.addEventListener('change', (e) => {
        state.showSplines = e.target.checked;
    });

    toggleAminoAcids.addEventListener('change', (e) => {
        state.showAminoAcids = e.target.checked;
    });

    toggleTubeCaps.addEventListener('change', (e) => {
        state.showTubeCaps = e.target.checked;
    });

    toggleTube.addEventListener('change', (e) => {
        state.showTube = e.target.checked;
    });

    toggleFXAA.addEventListener('change', (e) => {
        state.fxaaEnabled = e.target.checked;
    });

    toggleBloom.addEventListener('change', (e) => {
        state.bloomEnabled = e.target.checked;
    });

    styleSelect.addEventListener('change', (e) => { updateStyle(e.target.value); });

    function updateStyle(newValue) {
        state.style = newValue;

        disableAllToggles();
        uncheckAllToggles();
        toggleTube.checked = true;
        state.showTube = true;
        switch (state.style) {
            case 'halftone':
                toggleFXAA.disabled = false;
                toggleFXAA.checked = true;
                state.fxaaEnabled = true;
                break;
            case 'chrome':
                toggleFXAA.disabled = false;
                toggleFXAA.checked = true;
                state.fxaaEnabled = true;
                toggleBloom.disabled = false;
                toggleBloom.checked = true;
                state.bloomEnabled = true;
                break;
            case 'phong':
                toggleFXAA.disabled = false;
                toggleFXAA.checked = true;
                state.fxaaEnabled = true;
                toggleBloom.disabled = false;
                toggleBloom.checked = true;
                state.bloomEnabled = true;
                toggleAminoAcids.disabled = false;
                toggleSplines.disabled = false;
                toggleVectors.disabled = false;
                toggleTubeCaps.disabled = false;
                toggleTube.disabled = false;
        }
    }

    function disableAllToggles() {
        toggleVectors.disabled = true;
        toggleSplines.disabled = true;
        toggleAminoAcids.disabled = true;
        toggleTubeCaps.disabled = true;
        toggleTube.disabled = true;
        toggleFXAA.disabled = true;
        toggleBloom.disabled = true;
    }

    function uncheckAllToggles() {
        toggleVectors.checked = false;
        toggleSplines.checked = false;
        toggleAminoAcids.checked = false;
        toggleTubeCaps.checked = false;
        toggleTube.checked = false;
        toggleFXAA.checked = false;
        toggleBloom.checked = false;
        state.showVectors = false;
        state.showSplines = false;
        state.showAminoAcids = false;
        state.showTubeCaps = false;
        state.showTube = false;
        state.fxaaEnabled = false;
        state.bloomEnabled = false;
    }

    updateStyle(state.style);

    return state;
}

