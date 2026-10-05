const r=/[,，]/;function e(t){if(!r.test(t))return{tokens:[],rest:t};const s=t.split(r),n=s.pop()??"";return{tokens:s.map(o=>o.trim()).filter(Boolean),rest:n}}export{e as s};
