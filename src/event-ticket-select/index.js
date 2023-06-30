// dependencies
import { __html, attr, parseApiError} from '@kenzap/k-cloud';
import { hexToRGB, CDN } from "../_/_helpers.js"

class kNMkI9 {

    // init class
    constructor(data){
        
      // cache data
      this.data = data;

      // init container
      this.html();

      // get data from the backend
      this.render();

      // listeners
      this.listeners();
    }

    html = () => {

        // https://static.kenzap.com/layouts/event/banner-img.jpg
        document.querySelector('#content').insertAdjacentHTML('beforeend', 
        `
        <section id="${ attr(this.data.id) }" 
        class="kNMkI9 
        ${ this.data.c.classes ? attr(this.data.c.classes) : '' }
        " 
        style="
        ${ this.data.c.section };
        ${ this.data.borderstyle.value ? '--borderStyle:' + this.data.borderstyle.value + 'px;' : '' }
        ${ this.data.borderstyle.value ? '--borderStyleLess:' + (parseInt(this.data.borderstyle.value) > 24 ? 24 : this.data.borderstyle.value)+'px;' : '' }
        ">
            <div class="container" style="
            ${ this.data.c.container };
            ">
            </div>
        </section>
        `
        );
    }

    load = () => {

    }

    // render class html
    render = () => {

        // https://static.kenzap.com/layouts/event/location.svg
        document.querySelector('#'+this.data.id+' .container').innerHTML = 
        `
            ${ this.data.header.value }
            <ul class="ticket-nav">
                <li class="selected"><a href="${ attr(this.url(this.data.url.value,1)) }">${ __html('%1$1%2$ ticket','<strong>','</strong>') }</a></li>
                <li><a href="${ attr(this.url(this.data.url.value,2)) }">${ __html('%1$2%2$ tickets','<strong>','</strong>') }</a></li>
                <li><a href="${ attr(this.url(this.data.url.value,3)) }">${ __html('%1$3%2$ tickets','<strong>','</strong>') }</a></li>
                <li><a href="${ attr(this.url(this.data.url.value,4)) }">${ __html('%1$4%2$ tickets','<strong>','</strong>') }</a></li>
                <li><a href="${ attr(this.url(this.data.url.value,1)) }"><svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" class="bi bi-plus" viewBox="0 0 16 16"><path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/></svg></a></li>
            </ul>
        `;
    }

    url = (url, n) => {

        if(url.indexOf('?') > -1){
            url += '&qty='+n
        }else{
            url += '?qty='+n
        }
        return url
    }

    listeners = () => {
        
    }
}

window.kNMkI9 = kNMkI9;