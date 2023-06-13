// dependencies
import { __html, attr, parseApiError, onClick, H } from '@kenzap/k-cloud';
import { getCookie, priceFormat, CDN } from "../_/_helpers.js"

class kibGiH {

    // init class
    constructor(data){
        
      // cache data
      this.data = data;

      // init container
      this.html();

      // get data from the backend
      this.load();
    }

    html = () => {

        document.querySelector('#content').insertAdjacentHTML('beforeend', 
        `
        <section id="${ attr(this.data.id) }" class="kibGiH ${ this.data.c.classes ? attr(this.data.c.classes) : '' }" style="${ this.data.c.section };${ this.data.borderstyle.value ? '--borderStyle:'+this.data.borderstyle.value+'px;' : '' }">
            <div class="container" style="${ this.data.c.container }">
  
            </div>
        </section>
        `
        );
    }

    load = () => {

        let self = this;

        // TODO do API query
        // fetch(getAPI(), {
        fetch(this.getAPI(), {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                // 'Authorization': 'Bearer ' + self.data.token,
                'Kenzap-Locale': getCookie('locale') ? getCookie('locale') : "en",
                // 'Kenzap-Header': checkHeader(),
                // 'Kenzap-Token': self.data.token.value,
                'Kenzap-Sid': self.data.sid,
                // 'Kenzap-Sid': spaceID()
            },
            body: JSON.stringify({
                query: {
                    locale: {
                        type:       'locale',
                        id:         getCookie('lang')
                    },
                    events: {
                        type:       'get-events',
                        category:   self.data.category.value ? self.data.category.value : '',
                    }
                }
            })
        })
        .then(response => response.json())
        .then(response => {

            // console.log(response); 
            if(response.success){

                self.response = response;

                // render section
                self.render();

                // listeners
                self.listeners();

                // first load
                self.firstLoad = false;

            }else{

                if(response.code == 400) document.querySelector('#'+this.data.id+' .container').innerHTML = 
                `
                    <div class="related-posts" style=" ">
                        <div class="posts-">
                            ${ __html('No events found') } 
                        </div>
                    </div>
                `;

                if(response.code > 400) parseApiError(response);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    // render class html
    render = () => {

        document.querySelector('#'+this.data.id+' .container').innerHTML = 
        `
            ${ this.data.header.value }
            <div class="related-posts" style=" ">
                <div class="posts">

                    ${
                        this.response.events.data.map((event, i) => {

                            return`
                            <article class="card">
                                <div class="holder">
                                    <div class="img-area">
                                        <a href="/event/?id=${event._id}">${ this.img(event) }</a>
                                    </div>
                                    <div class="card-body">
                                        <h3><a href="/event/?id=${event._id}">${ event.title }</a></h3>
                                        <strong class="sub-heading">${ event.vendor.name ? event.vendor.name : '' }</strong>
                                        <div class="card-footer">
                                            <span class="price">${ this.price(event) }</span>
                                            <div class="rating-area">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#6c757d" class="bi bi-calendar2-date ms-2 text-dark" viewBox="0 0 16 16">
                                                    <path d="M6.445 12.688V7.354h-.633A12.6 12.6 0 0 0 4.5 8.16v.695c.375-.257.969-.62 1.258-.777h.012v4.61h.675zm1.188-1.305c.047.64.594 1.406 1.703 1.406 1.258 0 2-1.066 2-2.871 0-1.934-.781-2.668-1.953-2.668-.926 0-1.797.672-1.797 1.809 0 1.16.824 1.77 1.676 1.77.746 0 1.23-.376 1.383-.79h.027c-.004 1.316-.461 2.164-1.305 2.164-.664 0-1.008-.45-1.05-.82h-.684zm2.953-2.317c0 .696-.559 1.18-1.184 1.18-.601 0-1.144-.383-1.144-1.2 0-.823.582-1.21 1.168-1.21.633 0 1.16.398 1.16 1.23z"></path>
                                                    <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM2 2a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H2z"></path>
                                                    <path d="M2.5 4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5V4z"></path>
                                                </svg>
                                                <div>${ new Date(event.eventbegins).toLocaleDateString() }</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </article>
                            `;

                        }).join(``)
                    }

                </div>
            </div>
        `;
    }

    listeners = () => {
        
        // onClick('#'+this.data.id+' .card-body a', e => e.preventDefault());
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

    /**
     * Parse start rating
     * @public
     * @param {Integer} i - for id 
     * @param {Integer} rating - amount of full stars
     * @returns {Node} rendered HTML 
     */
    stars = (i, rating) => {

        rating = parseFloat(rating);

        // console.log("a"+rating);
        let output = '';
        output += '\
        <fieldset class="rating">\
            <input type="radio" name="'+i+'rrr" '+((rating>4.5 && rating<=5)?"checked":"")+' value="5"><label class="full" for="star5" ></label>\
            <input type="radio" name="'+i+'rrr" '+((rating>4.0 && rating<=4.5)?"checked":"")+' value="4 and a half"><label class="half" for="star4half" ></label>\
            <input type="radio" name="'+i+'rrr" '+((rating>3.5 && rating<=4.0)?"checked":"")+' value="4"><label class="full" for="star4" ></label>\
            <input type="radio" name="'+i+'rrr" '+((rating>3.0 && rating<=3.5)?"checked":"")+' value="3 and a half"><label class="half" for="star3half" ></label>\
            <input type="radio" name="'+i+'rrr" '+((rating>2.5 && rating<=3.0)?"checked":"")+' value="3"><label class="full" for="star3" ></label>\
            <input type="radio" name="'+i+'rrr" '+((rating>2.0 && rating<=2.5)?"checked":"")+' value="2 and a half"><label class="half" for="star2half" ></label>\
            <input type="radio" name="'+i+'rrr" '+((rating>1.5 && rating<=2.0)?"checked":"")+' value="2"><label class="full" for="star2" ></label>\
            <input type="radio" name="'+i+'rrr" '+((rating>1.0 && rating<=1.5)?"checked":"")+' value="1 and a half"><label class="half" for="star1half" ></label>\
            <input type="radio" name="'+i+'rrr" '+((rating>0.5 && rating<=1.0)?"checked":"")+' value="1"><label class="full" for="star1" ></label>\
            <input type="radio" name="'+i+'rrr" '+((rating>0 && rating<=0.5)?"checked":"")+' value="half"><label class="half" for="starhalf" ></label>\
        </fieldset>\
        ';
        return output;
    }

    /**
     * Parse event price
     * @public
     * @param {Object} event
     * @returns {Node} rendered HTML 
     */
    price = (event) => {

        let price = 999999999999999;

        event.variations.forEach((v, i) => {

            if(parseFloat(v.price) < price) price = parseFloat(v.price);
        });

        if(price == 999999999999999) price = 0; 

        return priceFormat(event.settings, price);
    }

    /**
     * @name getAPI
     * @description Returns API link
     * @param {object} headers
     */
    getAPI = () => {

        return window.location.host.indexOf("localhost") == 0 ? "https://api.myticket-dev.app.kenzap.cloud/" : "https://api.myticket.app.kenzap.cloud/";
    }

}

window.kibGiH = kibGiH;