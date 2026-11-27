import{s as a}from"./UnifiedNotification-Dp6wKfNN.js";import{t as f}from"./i18n-17gNL_HU.js";const e=new Map;function d(o,n={}){const i=n.windowMs??8e3,r=Date.now(),t=n.key??o;if((e.get(t)??0)>r)return e.delete(t),!0;e.set(t,r+i);const s=n.hint??f("utils.dialogs.confirm_hint",{seconds:Math.max(1,Math.floor(i/1e3))});return a(n.level??"warning",`${o}
${s}`),!1}export{d as u};
