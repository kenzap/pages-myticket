!function(){"use strict";function e(e,n){for(var r=0;r<n.length;r++){var a=n[r];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(e,t(a.key),a)}}function t(e){var t=function(e,t){if("object"!=typeof e||null===e)return e;var n=e[Symbol.toPrimitive];if(void 0!==n){var r=n.call(e,t||"default");if("object"!=typeof r)return r;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===t?String:Number)(e)}(e,"string");return"symbol"==typeof t?t:String(t)}const n=e=>0===(e=String(e)).length?"":e.replace(/[&<>'"]/g,(e=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&apos;",'"':"&quot;"}[e]))),r=()=>{let e=new URLSearchParams(window.location.search);return e.get("sid")?e.get("sid"):""},a=e=>{let t=e+"=",n=decodeURIComponent(document.cookie).split(";");for(let e=0;e<n.length;e++){let r=n[e];for(;" "==r.charAt(0);)r=r.substring(1);if(0==r.indexOf(t))return r.substring(t.length,r.length)}return""};a("kenzap_api_key"),a("locale")&&a("locale"),(()=>{let e=localStorage.hasOwnProperty("header")&&localStorage.hasOwnProperty("header-version")?localStorage.getItem("header-version"):0,t=window.location.hostname+"/"+r()+"/"+a("locale");t!=a("check")&&(e=0,console.log("refresh")),((e,t,n)=>{let r="";if(n){let e=new Date;e.setTime(e.getTime()+24*n*60*60*1e3),r=";expires="+e.toUTCString()}document.cookie=e+"="+(escape(t)||"")+r+";path=/;domain=.kenzap.cloud"})("check",t,5)})(),a("kenzap_token"),r();var o,i,c,l=(o=function e(r){var a,o,i,c=this;!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),a=this,i=function(){document.querySelector("#content").insertAdjacentHTML("beforeend",'\n        <section id="'.concat(n(c.data.id),'" class="kQFW7T ').concat(c.data.c.classes?n(c.data.c.classes):"",'" style="').concat(c.data.c.section,'">\n            <div class="container" style="').concat(c.data.c.container,'">\n              ').concat(c.data.header.value,'\n              <div class="video-cont">\n                  <iframe src="').concat(c.data.url.value,'" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>\n              </div>\n          </div>\n        </section>\n        '))},(o=t(o="render"))in a?Object.defineProperty(a,o,{value:i,enumerable:!0,configurable:!0,writable:!0}):a[o]=i,this.data=r,this.render()},i&&e(o.prototype,i),c&&e(o,c),Object.defineProperty(o,"prototype",{writable:!1}),o);window.kQFW7T=l}();
