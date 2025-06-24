import { normalizeModel } from "../utils/geometry";

// Define the PDB fixed-width field ranges for parsing CA atoms
const PDB_FIELDS = {
    atomSerial: [6, 11],
    atomName: [12, 16],
    residueName: [17, 20],
    chainId: [21, 22],
    residueSeqNumber: [22, 26],
    x: [30, 38],
    y: [38, 46],
    z: [46, 54]
}

// Extract a field from a PDB line using substring indices
function extractField(line, [start, end]) {
    return line.substring(start, end).trim();
}

// Parse only CA atoms from a PDB string
function parsePDB(text) {
    const aminoAcids = [];

    const lines = text.split('\n');
    for (const line of lines) {
        if (line.startsWith('ATOM') && extractField(line, PDB_FIELDS.atomName) === 'CA'){
            aminoAcids.push({
                atomSerial: parseInt(extractField(line, PDB_FIELDS.atomSerial)),
                atomName: extractField(line, PDB_FIELDS.atomName),
                residueName: extractField(line, PDB_FIELDS.residueName),
                chainId: extractField(line, PDB_FIELDS.chainId),
                residueSeqNumber: parseInt(extractField(line, PDB_FIELDS.residueSeqNumber)),
                x: parseFloat(extractField(line, PDB_FIELDS.x)),
                y: parseFloat(extractField(line, PDB_FIELDS.y)),
                z: parseFloat(extractField(line, PDB_FIELDS.z))
            })
        }
    }

    return aminoAcids;
}

// Load a PDB file, extract CA atoms, and optionally normalize
export async function loadPDB(url, { normalize = true } = {}){
    const res = await fetch(url);
    const text = await res.text();

    let aminoAcids = parsePDB(text);

    // Normalize CA atom coordinates to a [-0.5, 0.5] cube
    if (normalize){
        const flat = aminoAcids.flatMap(aa => [aa.x, aa.y, aa.z]);
        const normalized = normalizeModel(flat);

        for (let i = 0; i < aminoAcids.length; i++){
            aminoAcids[i].x = normalized[i * 3 + 0];
            aminoAcids[i].y = normalized[i * 3 + 1];
            aminoAcids[i].z = normalized[i * 3 + 2];
        }
    }

    return aminoAcids;
}