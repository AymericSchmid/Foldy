export function createUiControls() {
    // Get toggle objects
    const toggleVectors = document.getElementById('toggleVectors');
    const toggleSplines = document.getElementById('toggleSplines');
    const toggleAminoAcids = document.getElementById('toggleAminoAcids');
    const toggleTubeCaps = document.getElementById('toggleTubeCaps');
    const toggleTube = document.getElementById('toggleTube');

    const state = {
        showVectors: toggleVectors.checked,
        showSplines: toggleSplines.checked,
        showAminoAcids: toggleAminoAcids.checked,
        showTubeCaps: toggleTubeCaps.checked,
        showTube: toggleTube.checked
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

    return state;
}