// dependencies
import { __html, attr, parseApiError} from '@kenzap/k-cloud';
import { hexToRGB, CDN } from "../_/_helpers.js"

class kTFsc3 {

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
        class="kTFsc3 
        ${ this.data.animation.value ? 'kp-animate' : '' }
        ${ this.data.c.classes ? attr(this.data.c.classes) : '' }
        " 
        style="
        ${ this.data.c.section };
        ${ this.data.bgimage ? 'background-image:url(' + this.data.bgimage.value + ');' : '' }
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
            <div class="timeline">
                ${ this.data.cards.map((card, i) => {
                    
                    return `
                        <div class="timeline-content">
                            <div class="kenzap-row">
                                ${
                                    i % 2 == 0 ? `
                                    <div class="kenzap-col-6">
                                        <div class="time">
                                            <strong>${ attr(card.time.value) }</strong>
                                        </div>
                                    </div>
                                    <div class="kenzap-col-6">
                                        <div class="info">
                                            <h3>${ attr(card.title.value) }</h3>
                                            <p>${ attr(card.desc.value) }</p>
                                        </div>
                                    </div>
                                    `
                                    :
                                    `
                                    <div class="kenzap-col-6">
                                        <div class="info">
                                            <h3>${ attr(card.title.value) }</h3>
                                            <p>${ attr(card.desc.value) }</p>
                                        </div>
                                    </div>
                                    <div class="kenzap-col-6">
                                        <div class="time">
                                            <strong>${ attr(card.time.value) }</strong>
                                        </div>
                                    </div>
                                    `
                                }
                            </div>
                        </div>`

                }).join('') }

            </div>
        `;
    }

    listeners = () => {
        
    }
}

window.kTFsc3 = kTFsc3;