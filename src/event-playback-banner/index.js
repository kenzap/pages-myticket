// dependencies
import { __html, attr, parseApiError} from '@kenzap/k-cloud';
import { hexToRGB, CDN } from "../_/_helpers.js"

class kAesnY {

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
        class="kAesnY 
        ${ this.data.parallax.value ? 'kp-parallax' : '' }
        ${ this.data.c.classes ? attr(this.data.c.classes) : '' }
        " 
        style="
        ${ this.data.c.section };
        ${ this.data.bgimage ? 'background-image:url(' + this.data.bgimage.value + ')' : 'background-image:url(https://static.kenzap.com/layouts/event/banner-img.jpg)' };
        ${ '--bgcolor:' + this.data.bgcolor.value };
        ${ '--bgcolora:' + hexToRGB(this.data.bgcolor.value, parseInt(this.data.bgcolorintensity.value) / 100) };
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
            <div class="kp-content">
                <h2 class="title">${ this.data.maintitle.value }</h2>
                <p class="caption">${ this.data.subtitle.value }</p>
                <div class="action">
                    <a target="_blank" href="${ this.data.link.value }" class="modal-link" rel="modal:open">
                        <svg xmlns="http://www.w3.org/2000/svg" width="88" height="88" fill="#ffffff" class="bi bi-play-circle" viewBox="0 0 16 16">
                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                            <path d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445z"/>
                        </svg>
                    </a>
                </div>
            </div>
        `;
    }

    listeners = () => {
        
    }
}

window.kAesnY = kAesnY;