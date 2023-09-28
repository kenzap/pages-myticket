// dependencies
import { __html, attr, html, parseApiError } from '@kenzap/k-cloud';
import { getCookie, eventLink, CDN } from "../_/_helpers.js"
import Glide from '@glidejs/glide'

class kXzAIG {

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
        <section id="${ attr(this.data.id) }" class="kXzAIG ${ this.data.imgstyle.value } ${ this.data.c.classes ? attr(this.data.c.classes) : '' }" style="
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

        // today
        let today = new Date();
        let today_date = today.getFullYear() + "-" + today.getMonth() + "-" + today.getDate();

        // find years and months
        let dates = {};
        if(this.response.events.dates) this.response.events.dates.forEach(date => {

            let d = new Date(date);
            let k = d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate();
            if(!dates[k]){ dates[k] = []; }
            dates[k].push(date);
            dates[k].sort();
        })

        // sorted list of dates 
        let datesFiltered = Object.keys(dates).sort();

        // filter by upcoming
        if(this.data.eventfilter.value == "upcoming") datesFiltered = datesFiltered.filter(v => v >= today_date);

        // filter by past
        if(this.data.eventfilter.value == "past") datesFiltered = datesFiltered.filter(v => v <= today_date);

        // filter by a particular date, ex., when user clicks on tab
        if(self.date == "") self.date = datesFiltered.sort()[0];

        if(self._id == "") this.response.events.data.map((event, j) => {

            if(self._id == "" && self.date == (new Date(event.eventbegins).getFullYear() + '-' + new Date(event.eventbegins).getMonth() + '-' + new Date(event.eventbegins).getDate())){
                self._id = event._id;
            }
        });

        document.querySelector('#'+this.data.id+' .container').innerHTML = 
        `
            ${ this.data.header.value }
            <div class="schedule-content">

                <div class="glide"> 
                    <div class="glide__track" data-glide-el="track">
                        <ul class="event-tabs owl-carousel lg-carousel glide__slides" >
                            ${ 
                                datesFiltered.map((da, i) => {

                                    return dates[da].map((date, j) => {

                                        console.log(self.date)

                                        return `
                                            <li class="${ self.date == da || (self.date == "" && i == 0 && j == 0) ? 'active' : '' }">
                                                <a href="#tab-${ da }"><b>${ new Date(date).toLocaleString('en-us', {  weekday: 'long' })} </b> ${ new Date(date).getDate() } <span>${ months[new Date(date).getMonth()].substr(0, 3) } ${ new Date(date).getFullYear() }</span></a>
                                            </li>
                                        `
                                    }).join('')

                                }).join('')
                            }
                        </ul>
                    </div>
                    <div class="glide__arrows" data-glide-el="controls" style="display:none">
                        <button class="glide__arrow glide__arrow--left" data-glide-dir="<">prev</button>
                        <button class="glide__arrow glide__arrow--right" data-glide-dir=">">next</button>
                    </div> 
                </div>
                <div class="event-tab-content">

                ${ 
                    Object.keys(dates).map((da, i) => {

                    return `
                    <div class="tab-pane ${ self.date == da || (self.date == "" && i == 0) ? 'active' : '' }" id="tab-${self.date}">
                        <div class="kenzap-row">
                            <div class="kenzap-col-3">
                                <ul class="schedule-tabs">
                                    ${ 
                                        dates[da].map((date, j) => { 

                                            return this.response.events.data.map((event, j) => {

                                                // console.log((new Date(date).getFullYear() + '-' + new Date(date).getMonth() + '-' + new Date(event.eventbegins).getDate()) + " " + (new Date(event.eventbegins).getFullYear() + '-' + new Date(event.eventbegins).getMonth() + '-' + new Date(date).getDate()));

                                                return (new Date(date).getFullYear() + '-' + new Date(date).getMonth() + '-' + new Date(date).getDate()) == (new Date(event.eventbegins).getFullYear() + '-' + new Date(event.eventbegins).getMonth() + '-' + new Date(event.eventbegins).getDate()) ? `
                                                <li class="${ j>-1 ? 'active': '' }" data-_id="${ event._id }">
                                                    <a href="#tab1-hr1">
                                                        <span class="schedule-time">${ new Date(event.eventbegins).toLocaleTimeString([],  { hour: "2-digit", minute: "2-digit" }).substr(0,5) } <strong>${ new Date(event.eventbegins).toLocaleTimeString([],  { hour: "2-digit", minute: "2-digit" }).length == 8 ? new Date(event.eventbegins).toLocaleTimeString([],  { hour: "2-digit", minute: "2-digit" }).substr(6, 2) : "" }</strong></span>
                                                        <span class="schedule-title"><b>${ event.title }</b></span>
                                                        <span class="schedule-ticket-info"><b>${ self.ticketsLeft(event) }</b></span>
                                                    </a>
                                                </li>
                                                `
                                                :
                                                ''

                                            }).join('')

                                        }).join('')
                                    }
                                </ul>
                            </div>
                            <div class="kenzap-col-9">
                                <div class="schedule-tab-content">

                                    ${
                                        this.response.events.data.map((event, i) => {
                
                                        return (event._id == self._id || (self._id == "" && i == 0)) ?
                                        `
                                            <div class="tab-pane active" id="tab1-${event._id}">
                                                ${ this.img(event) }
                                                <div class="full-event-info">
                                                    <div class="full-event-info-header">
                                                        <h2>${ event.title }</h2>
                                                        <span class="ticket-left-info"><b>${ self.ticketsLeft(event) }</b></span>
                                                        <div class="clearfix"></div>
                                                        <span class="event-date-info">${ new Date(event.eventbegins).toLocaleDateString() } ${ (new Date(event.eventbegins).toLocaleTimeString()).substr(0,5) }</span>
                                                        <span class="event-venue-info">${ event.eventlocation }</span>
                                                    </div>
                                                    <div class="full-event-info-content">
                                                        <p>${ event.sdesc }</p>
                                                        <a class="book-ticket" href="${ eventLink(event) }">${ html(this.data.ctatext.value) }</a>
                                                    </div>
                                                </div>
                                            </div>
                                        `
                                        :
                                        ``
                                        }).join('')
                                    }

                                </div>
                            </div>	
                        </div>
                    </div>`
                    }).join('')
                }
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

        new Glide('.glide', {
            type: 'slider',
            perView: 6,
            focusAt: 'left',
            breakpoints: {
              800: {
                perView: 3
              },
              480: {
                perView: 1
              }
            }
        }).mount()
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

        // no packages defined
        if(typeof(event.variations[0]) === 'undefined') return __html("no available tickets");

        // it is ver hard to calculate number of tickets left for hall layout
        if(typeof(event.variations[0]) !== 'undefined') if(event.variations[0].layout == "true") return __html("view tickets");

        // get remaining amount of tickets left
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

window.kXzAIG = kXzAIG;