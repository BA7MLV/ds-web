function p(t){return`page:${t}`}function f(t){return t.trim().split(`
`).map(o=>`> ${o}`).join(`
`)}function b(t){return`${f(t.text)}

${t.sourceLabel}
`}function u(t,o,e,g){const n=(s,r,l)=>Math.min(Math.max(s,r),Math.max(r,l)),i=n(t.x-o.width/2,8,e.width-8-o.width),a=t.top-10-o.height;if(a>=8)return{left:i,top:n(a,8,e.height-8-o.height),placement:"above"};const c=n(t.bottom+10,8,e.height-8-o.height);return{left:i,top:c,placement:"below"}}export{b as a,p as b,f,u as r};
