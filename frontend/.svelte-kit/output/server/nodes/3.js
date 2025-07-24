

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/demo/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/3.VBqlwJOK.js","_app/immutable/chunks/CIdRdH2t.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/AvMoPzej.js"];
export const stylesheets = ["_app/immutable/assets/3.B93EYOnF.css"];
export const fonts = [];
