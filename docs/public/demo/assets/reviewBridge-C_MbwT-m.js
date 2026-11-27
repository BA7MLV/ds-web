let l=null,n=null;function t(e){if(l=e,n!==null){const i=n;n=null,e(i)}}function u(e){return l?l(e):(n=e,Promise.resolve(e.length>0))}export{t as p,u as r};
