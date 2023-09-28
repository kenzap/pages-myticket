!function(){"use strict";function e(e,t){for(var n=0;n<t.length;n++){var o=t[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,a(o.key),o)}}function t(e,t,n){return(t=a(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e){var t=function(e,t){if("object"!=typeof e||null===e)return e;var a=e[Symbol.toPrimitive];if(void 0!==a){var n=a.call(e,t||"default");if("object"!=typeof n)return n;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===t?String:Number)(e)}(e,"string");return"symbol"==typeof t?t:String(t)}const n=e=>0===(e=String(e)).length?"":e.replace(/[&<>'"]/g,(e=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&apos;",'"':"&quot;"}[e]))),o=()=>{let e=new URLSearchParams(window.location.search);return e.get("sid")?e.get("sid"):""},c=e=>{let t=e+"=",a=decodeURIComponent(document.cookie).split(";");for(let e=0;e<a.length;e++){let n=a[e];for(;" "==n.charAt(0);)n=n.substring(1);if(0==n.indexOf(t))return n.substring(t.length,n.length)}return""};c("kenzap_api_key"),c("locale")&&c("locale"),(()=>{let e=localStorage.hasOwnProperty("header")&&localStorage.hasOwnProperty("header-version")?localStorage.getItem("header-version"):0,t=window.location.hostname+"/"+o()+"/"+c("locale");t!=c("check")&&(e=0,console.log("refresh")),((e,t,a)=>{let n="";if(a){let e=new Date;e.setTime(e.getTime()+24*a*60*60*1e3),n=";expires="+e.toUTCString()}document.cookie=e+"="+(escape(t)||"")+n+";path=/;domain=.kenzap.cloud"})("check",t,5)})(),c("kenzap_token"),o();var r,i,l,s=(r=function e(a){var o=this;!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),t(this,"html",(function(){var e,t,a,c,r;document.querySelector("#content").insertAdjacentHTML("beforeend",'\n        <section id="'.concat(n(o.data.id),'" class="kEfKay ').concat(o.data.c.classes?n(o.data.c.classes):"",'" style="\n        ').concat(o.data.c.section,";\n        ").concat(o.data.borderstyle.value?"--borderStyle:"+o.data.borderstyle.value+"px":"",";\n        ").concat(o.data.bgimage?"background-image:url("+o.data.bgimage.value+")":"background-image:url(https://static.kenzap.com/layouts/event/banner-img.jpg)",";\n        ").concat("--bgcolor:"+o.data.bgcolor.value,";\n        ").concat("--bgcolora:"+(e=o.data.bgcolor.value,t=parseInt(o.data.bgcolorintensity.value)/100,4==e.length?(a=parseInt(e.slice(1,2)+e.slice(1,2),16),c=parseInt(e.slice(2,3)+e.slice(2,3),16),r=parseInt(e.slice(3,4)+e.slice(3,4),16)):(a=parseInt(e.slice(1,3),16),c=parseInt(e.slice(3,5),16),r=parseInt(e.slice(5,7),16)),t?"rgba("+a+", "+c+", "+r+", "+t+")":"rgb("+a+", "+c+", "+r+")"),';\n        ">\n            <div class="container" style="\n            ').concat(o.data.c.container,";\n            ").concat(o.data.borderstyle.value?"--borderStyle:"+o.data.borderstyle.value+"px;":"",' ;\n            ">\n            </div>\n        </section>\n        '))})),t(this,"load",(function(){})),t(this,"render",(function(){document.querySelector("#"+o.data.id+" .container").innerHTML="\n            ".concat(o.data.header.value,'\n            <div class="kp-content">\n                <h1 class="title">').concat(o.data.maintitle.value,'</h1>\n                <p class="caption">').concat(o.data.subtitle.value,'</p>\n                <div class="search">\n                    <input type="text" placeholder="').concat(o.data.searchtext.value,'">\n                </div>\n                <div class="location">\n                    <p><img src="https://static.kenzap.com/layouts/event/location.svg" alt="image"> ').concat(o.data.location.value,' <a href="').concat(o.data.searchurl.value,'">').concat(o.data.locationcta.value,"</a></p>\n                </div>\n            </div>\n        ")})),t(this,"listeners",(function(){var e=document.querySelector("#"+n(o.data.id)+" .search input");e.addEventListener("keypress",(function(t){"Enter"===t.key&&(t.preventDefault(),e.value.length&&(location.href=o.data.searchurl.value+"?s="+encodeURIComponent(e.value)))}))})),t(this,"img",(function(e){return e.img[0]?'<img src="'.concat(("source"==t?"https://kenzap-sites.oss-ap-southeast-1.aliyuncs.com":"https://cdn.kenzap.cloud")+"/S"+e.sid+"/event-"+e._id+"-1-250.webp?"+e.updated,' }" alt="').concat(n(e.title),'"></img>'):'<img src="https://cdn.kenzap.com/loading.png" alt="Placeholder image"></img>';var t})),this.data=a,this.html(),this.render(),this.listeners()},i&&e(r.prototype,i),l&&e(r,l),Object.defineProperty(r,"prototype",{writable:!1}),r);window.kEfKay=s}();
