export const CDN = 'https://kenzap-sites.oss-ap-southeast-1.aliyuncs.com';

// numbers only with allowed exceptions
export const onlyNumbers = (sel, chars) => {

    if(!document.querySelector(sel)) return;

    // arrow navigation
    chars.push(...[9, 37, 38, 39, 40, 98, 100, 102, 104]);
    
    [...document.querySelectorAll(sel)].forEach(el => {

        el.addEventListener('keydown', (e) => {

            const key = e.key.toLowerCase();

            // track potential paste event
            if(key == 'control' || key == 'meta'){

                window[key] = true;
            }
        
            // console.log(key.length + " / " + isNumber + " / " + e.which);

            // not alphanumeric
            // if (key.length != 1) {

            //     e.preventDefault(); 
            //     return false;
            // }
        
            // const isLetter = (key >= 'a' && key <= 'z');
            const isNumber = (key >= '0' && key <= '9');

            // add exception when Control or Meta (MAC) keys pressed
            // console.log(window['meta'] + " " + window['control']);

            // allow x c v a characters when meta ot control is pressed
            if((window['control'] || window['meta']) && [86, 88, 65, 67, 90].includes(e.which)){ console.log("pushing"); return true; }

            // actual check
            if (!isNumber && !chars.includes(e.which)) {

                e.preventDefault(); 
                return false;
            }
        });

        el.addEventListener('keyup', (e) => {

            const key = e.key.toLowerCase();

            // potential paste event
            if(key == 'control' || key == 'meta'){

                window[key] = false;
            }
        });
    });
}

/**
 * @name setCookie
 * @description Set cookie by its name to all .kenzap.com subdomains
 * @param {string} name - Cookie name.
 * @param {string} value - Cookie value.
 * @param {string} days - Number of days when cookie expires.
 */
 export const setCookie = (name, value, days) => {

    let expires = "";
    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = ";expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (escape(value) || "") + expires + ";path=/"; 
}

/**
 * @name getCookie
 * @description Read cookie by its name.
 * @param {string} cname - Cookie name.
 * 
 * @returns {string} value - Cookie value.
 */
export const getCookie = (cname) => {

    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

/**
 * @name getParam
 * @description Get URL param.
 * 
 * @returns {string} id - Kenzap Cloud space ID.
 */
 export const getParam = (p) => {
    
    let urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(p) ? urlParams.get(p) : "";
}

export const formatTime = (timestamp) => {
	
    let a = new Date(timestamp * 1000);
    let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let year = a.getFullYear();
    let month = months[a.getMonth()];
    let date = a.getDate();
    let hour = a.getHours();
    let min = a.getMinutes();
    let sec = a.getSeconds();
    let time = date + ' ' + month + ' ' + year; // + ' ' + hour + ':' + min + ':' + sec ;
    return time;
}

/**
 * Generates event link
 * Points to Single Event page or Event Hall layout
 * @public
 * @param {Object} event - event
 * @returns {Node} rendered HTML 
 */
export const eventLink = (event) => {
 
    return (event.variations[0].layout == "true") ? `/hall/?id=${event._id}` : `/event/?id=${event._id}`;
}

/**
 * Parse event price
 * @public
 * @param {Object} event
 * @returns {Node} rendered HTML 
 */
export const eventPrice = (event) => {

    let price = 999999999999999;

    event.variations.forEach((v, i) => {

        if(parseFloat(v.price) < price && v.type != 'hidden') price = parseFloat(v.price);
    });

    if(price == 999999999999999) price = 0;

    return priceFormat(event.settings, price);
}

export const replaceQueryParam = (param, newval, search) => {

    let regex = new RegExp("([?;&])" + param + "[^&;]*[;&]?");
    let query = search.replace(regex, "$1").replace(/&$/, '');

    return (query.length > 2 ? query + "&" : "?") + (newval ? param + "=" + newval : '');
}

export const getPageNumberOld = () => {

    let url = window.location.href.split('/');
    let page = url[url.length-1];
    let pageN = 1;
    if(page.indexOf('page')==0){
      pageN = page.replace('page', '').replace('#', '');
    }
    // console.log(pageN);
    return parseInt(pageN);
}

export const getPageNumber = () => {

    let urlParams = new URLSearchParams(window.location.search);
    let page = urlParams.get('page') ? urlParams.get('page') : 1;

    return parseInt(page);
}

export const getPagination = (__, meta, cb) => {

    if(typeof(meta) === 'undefined'){ document.querySelector("#listing_info").innerHTML = __('no records to display'); return; }

    let offset = meta.limit+meta.offset;
    if(offset>meta.total_records) offset = meta.total_records;

    document.querySelector("#listing_info").innerHTML = __("Showing %1$ to %2$ of %3$ entries", (1+meta.offset), (offset), meta.total_records);
    //  "Showing "+(1+meta.offset)+" to "+(offset)+" of "+meta.total_records+" entries";

    let pbc = Math.ceil(meta.total_records / meta.limit);
    document.querySelector("#listing_paginate").style.display = (pbc < 2) ? "none" : "block";

    let page = getPageNumber(); 
    let html = '<ul class="pagination d-flex justify-content-end pagination-flat mb-0">';
    html += '<li class="paginate_button page-item previous" id="listing_previous"><a href="#" aria-controls="order-listing" data-type="prev" data-page="0" tabindex="0" class="page-link"><span aria-hidden="true">&laquo;</span></li>';
    let i = 0;
    while(i<pbc){

        i++; 
        if(((i >= page-3) && (i <= page)) || ((i <= page+3) && (i >=page))){

            html += '<li class="paginate_button page-item '+((page==i)?'active':'')+'"><a href="#" aria-controls="order-listing" data-type="page" data-page="'+i+'" tabindex="0" class="page-link">'+(page==i?i:i)+'</a></li>';      
        }
    }  
    html += '<li class="paginate_button page-item next" id="order-listing_next"><a href="#" aria-controls="order-listing" data-type="next" data-page="2" tabindex="0" class="page-link"><span aria-hidden="true">&raquo;</span></a></li>';
    html += '</ul>'

    document.querySelector("#listing_paginate").innerHTML = html;

    let page_link = document.querySelectorAll(".page-link");
    for (const l of page_link) {
        
        l.addEventListener('click', function(e) {

            let p = parseInt(getPageNumber());
            let ps = p;
            switch(l.dataset.type){ 
                case 'prev': p-=1; if(p<1) p = 1; break;
                case 'page': p=l.dataset.page; break;
                case 'next': p+=1; if(p>pbc) p = pbc; break;
            }
            
            // update url
            if (window.history.replaceState) {

                // let url = window.location.href.split('/page');
                // let urlF = (url[0]+'/page'+p).replace('//page', '/page');

                let str = window.location.search;
                str = replaceQueryParam('page', p, str);
                // window.location = window.location.pathname + str

                // prevents browser from storing history with each change:
                window.history.replaceState("kenzap-cloud", document.title, window.location.pathname + str);
            }

            // only refresh if page differs
            if(ps!=p) cb();
            
            e.preventDefault();
            return false;
        });
    }
}

/**
 * @name getAPI
 * @description Returns API link
 * @param {object} headers
 */
export const getAPI = () => {

    return window.location.host.indexOf("localhost") == 0 ? "https://api.myticket-dev.app.kenzap.cloud/" : "https://api.myticket.app.kenzap.cloud/";
}

export const makeNumber = function(price) {

    price = price ? price : 0;
    price = parseFloat(price);
    price = Math.round(price * 100) / 100;
    return price;
}

export const makeid = function(length = 6) {
    return Math.random().toString(36).substring(2, length+2);
}

/**
* Email format validation script
* 
* @param string email
* @return string
*/
export const validateEmail = (email) => {

    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,14})+$/.test(email)){

        return true;
    }else{

        return false;
    }
}

export const validateCardNumber = number => {
    //Check if the number contains only numeric value  
    //and is of between 13 to 19 digits
    const regex = new RegExp("^[0-9]{13,19}$");
    if (!regex.test(number)){
        return false;
    }
  
    return luhnCheck(number);
}

const luhnCheck = val => {
    let checksum = 0; // running checksum total
    let j = 1; // takes value of 1 or 2

    // Process each digit one by one starting from the last
    for (let i = val.length - 1; i >= 0; i--) {
      let calc = 0;
      // Extract the next digit and multiply by 1 or 2 on alternative digits.
      calc = Number(val.charAt(i)) * j;

      // If the result is in two digits add 1 to the checksum total
      if (calc > 9) {
        checksum = checksum + 1;
        calc = calc - 10;
      }

      // Add the units element to the checksum total
      checksum = checksum + calc;

      // Switch the value of j
      if (j == 1) {
        j = 2;
      } else {
        j = 1;
      }
    }
  
    //Check if it is divisible by 10 or not.
    return (checksum % 10) == 0;
}

/**
* creditCardValidation
* 
* @param string email
* @return string
*/
export const creditCardValidation = (creditCradNum) => {

    let regEx = /^5[1-5][0-9]{14}$|^2(?:2(?:2[1-9]|[3-9][0-9])|[3-6][0-9][0-9]|7(?:[01][0-9]|20))[0-9]{12}$/;
    if(creditCradNum.match(regEx)){
        
        return true;
    }else{
        
        // alert("Please enter a valid credit card number.");
        return false;
    }
} 

/**
* Render price
* @public
*/
export const priceFormat = (_this, price) => {

    price = makeNumber(price);

    price = (Math.round(parseFloat(price) * 100)/100).toFixed(2);
    
    let settings = {};
    if(_this.currency_symb_loc){ settings = _this; }else{ settings = _this.settings; }

    switch(settings.currency_symb_loc){
        case 'left': price = settings.currency_symb + ' ' + price; break;
        case 'right': price = price + settings.currency_symb; break;
    }

    return price;
}

export const loadDependencies = (dep, cb) => {

    // dependency already loaded, skip
    if(document.getElementById(dep)){ if(typeof cb === 'function') cb.call(); return; }

    // detect dependency type
    let t = dep.split('.').slice(-1)[0];
    switch(t){
      case 'js':
        
        let js = document.createElement("script");
        js.setAttribute("src", dep);
        js.id = dep;
        js.onload = js.onreadystatechange = function() {
 
          if(!this.readyState || this.readyState == 'complete')
            if(typeof cb === 'function') cb.call();
        };
        document.body.appendChild(js);
        
      break;
      case 'css':

        var head  = document.getElementsByTagName('head')[0];
        var css  = document.createElement('link');
        css.id   = dep;
        css.rel  = 'stylesheet';
        css.type = 'text/css';
        css.href = dep;
        head.appendChild(css);

      break;
    }
    
    return true;
}

export const hexToRGB = (hex, alpha) => {
    
    let r,  g,  b;
    
    if(hex.length == 4){
        r = parseInt(hex.slice(1, 2) + hex.slice(1, 2), 16),
        g = parseInt(hex.slice(2, 3) + hex.slice(2, 3), 16),
        b = parseInt(hex.slice(3, 4) + hex.slice(3, 4), 16);
    }else{
        r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);
    }

    if (alpha) {
        return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
    } else {
        return "rgb(" + r + ", " + g + ", " + b + ")";
    }
}