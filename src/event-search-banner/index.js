// dependencies
import { __html, attr, parseApiError, onClick, H } from '@kenzap/k-cloud';
import { getCookie, hexToRGB, CDN } from "../_/_helpers.js"

class kEfKay {

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
        <section id="${ attr(this.data.id) }" class="kEfKay ${ this.data.c.classes ? attr(this.data.c.classes) : '' }" style="
        ${ this.data.c.section };
        ${ this.data.borderstyle.value ? '--borderStyle:'+this.data.borderstyle.value+'px' : '' };
        ${ this.data.bgimage ? 'background-image:url(' + this.data.bgimage.value + ')' : 'background-image:url(https://static.kenzap.com/layouts/event/banner-img.jpg)' };
        ${ '--bgcolor:' + this.data.bgcolor.value };
        ${ '--bgcolora:' + hexToRGB(this.data.bgcolor.value, parseInt(this.data.bgcolorintensity.value) / 100) };
        ">
            <div class="container" style="
            ${ this.data.c.container };
            ${ this.data.borderstyle.value ? '--borderStyle:'+this.data.borderstyle.value+'px;' : '' } ;
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

        document.querySelector('#'+this.data.id+' .container').innerHTML = 
        `
            ${ this.data.header.value }
            <div class="kp-content">
                <h1 class="title">${ this.data.maintitle.value }</h1>
                <p class="caption">${ this.data.subtitle.value }</p>
                <div class="search">
                    <input type="text" placeholder="${ this.data.searchtext.value }">
                </div>
                <div class="location">
                    <p><img src="https://static.kenzap.com/layouts/event/location.svg" alt="image"> ${ this.data.location.value } <a href="${ this.data.searchurl.value }">${ this.data.locationcta.value }</a></p>
                </div>
            </div>
        `;
    }

    listeners = () => {
        
        let input = document.querySelector("#"+attr(this.data.id) + " .search input");
        input.addEventListener("keypress", (e) => {
            // If the user presses the "Enter" key on the keyboard
            if (e.key === "Enter") {
              // Cancel the default action, if needed
              e.preventDefault();

              if(input.value.length) location.href = this.data.searchurl.value+'?s='+encodeURIComponent(input.value);
            }
        });
    }

    /**
     * Parse event img
     * @public
     * @param {Object} event - event
     * @returns {Node} rendered HTML 
     */
    img = (event) => {

        if(event.img[0]){

            return `<img src="${ CDN+'/S'+event.sid+'/event-'+event._id+'-1-250.webp?' + event.updated } }" alt="${ attr(event.title) }"></img>`;
        }else{

            return `<img src="https://cdn.kenzap.com/loading.png" alt="Placeholder image"></img>`;
        } 
    }
}

window.kEfKay = kEfKay;