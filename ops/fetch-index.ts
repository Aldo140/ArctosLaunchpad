// Caches CalgaryWatch's discovery index in ops/.cache for tests and previews.
import { loadDiscoveryIndex } from './lib/discovery';

const index = await loadDiscoveryIndex(console.log);
console.log(`[ops:index] ${index.entities.length} listings, ${index.occurrences.length} dates.`);
