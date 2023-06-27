// dependencies
import { __html, attr, html, src, parseApiError } from '@kenzap/k-cloud';
import { getCookie, eventLink, CDN } from "../_/_helpers.js"
// import Glide from '@glidejs/glide'

class kle3pt {

    // init class
    constructor(data){
        
        this._id = '';
        this.date = '';

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
        <section id="${ attr(this.data.id) }" class="kle3pt ${ this.data.c.classes ? attr(this.data.c.classes) : '' }" style="
            ${ this.data.c.section };
            ${ this.data.borderstyle.value ? '--borderStyle:' + this.data.borderstyle.value + 'px;' : '' };
            ${ this.data.borderstyle.value ? '--borderStyleLess:' + (parseInt(this.data.borderstyle.value) > 24 ? 24 : this.data.borderstyle.value)+'px;' : '' };
            ">
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
                'Kenzap-Locale': getCookie('locale') ? getCookie('locale') : "en",
                'Kenzap-Sid': self.data.sid,
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
                        detailed:   1,
                        limit:      20,
                        dates:      1,
                        filter_date:       this.year ? this.year + '-' + (this.month.length == 1 ? "0" + (parseInt(this.month) + 1) : (parseInt(this.month) + 1)) : ''
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

                // first load
                self.firstLoad = false;

            }else{

                if(response.code == 400) document.querySelector('#'+this.data.id+' .container').innerHTML = 
                `
                    <div class="kp-content" style=" ">
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

        let self = this;

        const months = [__html('January'), __html('February'), __html('March'), __html('April'), __html('May'), __html('June'), __html('July'), __html('August'), __html('September'), __html('October'), __html('November'), __html('December')];

        console.log(this.response.events);

        // find years and months
        let dates = {};
        if(this.response.events.dates) this.response.events.dates.forEach(date => {

            let d = new Date(date);
            let k = d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate();
            if(!dates[k]){ dates[k] = []; }
            dates[k].push(date);
            dates[k].sort();
        })

        if(self.date == "") self.date = Object.keys(dates)[0];

        if(self._id == "") this.response.events.data.map((event, j) => {

            if(self._id == "" && self.date == (new Date(event.eventbegins).getFullYear() + '-' + new Date(event.eventbegins).getMonth() + '-' + new Date(event.eventbegins).getDate())){
                self._id = event._id;
            }
        });

        document.querySelector('#'+this.data.id+' .container').innerHTML = 
        `
            <div class="row">
                <div class="section-header">
                    ${ this.data.header.value }
                    <span class="todays-date">
                        <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" fill="currentColor" class="bi bi-calendar2-week" viewBox="0 0 16 16"><path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM2 2a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H2z"/><path d="M2.5 4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5V4zM11 7.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm-3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm-5 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1z"/></svg>
                        <div><strong>${ months[new Date(this.response.events.data[0].eventbegins).getMonth()] }</strong> ${ new Date(this.response.events.data[0].eventbegins).getFullYear() }</div>
                    </span>
                </div>
                <div class="section-content scroll-wrapper">
                    <ul class="clearfix">

                        ${ 
                            this.response.events.data.map((event, i) => {

                                return i < 4 ? `
                                <li class="event-${i}">
                                    <span class="event-time">${ new Date(event.eventbegins).toLocaleTimeString([],  { hour: "2-digit", minute: "2-digit" }).substr(0,5) } <strong>${ new Date(event.eventbegins).toLocaleTimeString([],  { hour: "2-digit", minute: "2-digit" }).length == 8 ? new Date(event.eventbegins).toLocaleTimeString([],  { hour: "2-digit", minute: "2-digit" }).substr(6, 2) : "" }</strong></span>
                                    <strong class="event-name">${ event.title }</strong>
                                    <a href="${ eventLink(event) }" class="get-ticket">${ html(this.data.ctatext.value) }</a>
                                </li>
                                `
                                :
                                ``
                            }).join('')
                        }
                    </ul>
                    <strong class="event-list-label"><a href="${ src(this.data.ctalink.value) }" class="cal-link">${ html(this.data.ctalinktext.value) }</a></strong>
                </div>
            </div>
        `;

        if(!this.response.events.data.length) if(document.querySelector('#'+this.data.id+' .container .kp-content')) document.querySelector('#'+this.data.id+' .container .kp-content').innerHTML = 
            `
                <div class="kp-content" style=" ">
                    <div class="posts-">
                        ${ __html('No events found') } 
                    </div>
                </div>
            `;
        
        // listeners
        this.listeners();
    }

    listeners = () => {
        
        let self = this;

        let hideAll = () => {

            [...document.querySelectorAll('#' + attr(this.data.id) + ' ul.event-tabs li')].forEach(el => {

                el.classList.remove('active');
            });

            [...document.querySelectorAll('#' + attr(this.data.id) + ' .schedule-tabs li')].forEach(el => {

                el.classList.remove('active');
            });
        }

        // top date calendar click
        [...document.querySelectorAll('.event-tabs li a')].forEach(el => {

            el.addEventListener("click", e => {

                e.preventDefault();

                hideAll();

                e.currentTarget.parentElement.classList.add('active');

                let tab = e.currentTarget.getAttribute('href');

                self.date = tab.replace('#tab-', '');
                self._id = "";

                self.load();
            });
        });

        // left tab clicked
        [...document.querySelectorAll('.schedule-tabs li')].forEach(el => {

            el.addEventListener("click", e => {

                e.preventDefault();

                hideAll();

                e.currentTarget.classList.add('active');

                self._id = e.currentTarget.dataset._id;

                self.render();
            });
        });

        // new Glide('.glide', {
        //     type: 'slider',
        //     perView: 6,
        //     focusAt: 'left',
        //     breakpoints: {
        //       800: {
        //         perView: 3
        //       },
        //       480: {
        //         perView: 1
        //       }
        //     }
        // }).mount()
    }

    /**
     * Parse event img
     * @public
     * @param {Object} event - event
     * @returns {Node} rendered HTML 
     */
    img = (event) => {

        if(event.img[0]){

            return `<div class="kp-img" style="background-image:url(${ CDN+'/S'+event.sid+'/event-'+event._id+'-1-500.webp?' + event.updated });"></div>`;
        }else{

            return `<div class="kp-img" style="background-image:url(https://cdn.kenzap.com/loading.png);"></div>`;
        } 
    }

    /**
     * Renders total number of tickets left.
     * Stock - Booked
     * @public
     * @param {Object} event - event
     * @returns {Node} rendered HTML 
     */
    ticketsLeft = (event) => {

        let total = 0;
        event.variations.forEach(v => {

            total = (v.stock ? parseInt(v.stock) : 0) - (v.booked ? parseInt(v.booked) : 0);
        })
        
        return __html("%1$ tickets left", total);
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

window.kle3pt = kle3pt;