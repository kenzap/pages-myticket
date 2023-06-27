// dependencies
import { __html, attr, html, parseApiError } from '@kenzap/k-cloud';
import { getCookie, CDN } from "../_/_helpers.js"
import Glide from '@glidejs/glide'

class kqXDlR {

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
        <section id="${ attr(this.data.id) }" class="kqXDlR ${ this.data.imgstyle.value } ${ this.data.c.classes ? attr(this.data.c.classes) : '' }" style="
            ${ this.data.c.section };
            ${ this.data.borderstyle.value ? '--borderStyle:'+this.data.borderstyle.value+'px;' : '' };
            ${ this.data.borderstyle.value ? '--borderStyleLess:'+(parseInt(this.data.borderstyle.value) > 24 ? 24 : this.data.borderstyle.value)+'px;' : '' };
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

        // find years and months
        let dates = {};
        if(this.response.events.dates) this.response.events.dates.forEach(date => {

            let d = new Date(date);
            if(!dates[d.getFullYear()]) dates[d.getFullYear()] = [];
            if(!dates[d.getFullYear()].includes(d.getMonth()))
                dates[d.getFullYear()].push(d.getMonth());
            dates[d.getFullYear()].sort();
        })

        // dates[2024].push(11);

        if(!this.year) this.year = Object.keys(dates)[0];

        document.querySelector('#'+this.data.id+' .container').innerHTML = 
        `
            ${ this.data.header.value }
            <div class="glide"> 
                <div class="glide__track" data-glide-el="track">
                    <ul class="event-tabs owl-carousel lg-carousel glide__slides" >
                        ${ 
                            Object.keys(dates).map((year) => {

                                return dates[year].map((month) => {

                                    return `
                                        <li class="${ self.year && self.month ? (self.year == year && self.month == month ? 'active' : '') : '' }">
                                            <a href="#tab-${ year + '-' + month }"><b>${ months[month].substr(0, 3) }</b> <span>${ year }</span></a>
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
            <div class="tab-content">

                ${ 
                    Object.keys(dates).map(year => {

                        return dates[year].map((month, i) => {

                            return `
                            <div id="tab-${ year + '-' + month }" class="tab-pane ${ self.year == year && self.month == month ? 'show' : '' }">
                                <ul class="clearfix">

                                    ${
                                        this.response.events.data.map((event, i) => {
                
                                        return ((new Date(event.eventbegins).getFullYear()) + '-' + new Date(event.eventbegins).getMonth()) == (year + '-' + month) ?
                                        `
                                            <li>
                                                <div class="date">
                                                    <a href="/event/?id=${event._id}">
                                                        <span class="day"><b>${ new Date(event.eventbegins).getDay() }</b></span>
                                                        <span class="month">${ (months[new Date(event.eventbegins).getMonth()]).substr(0, 3) }</span>
                                                        <span class="year">${ new Date(event.eventbegins).getFullYear() }</span>
                                                    </a>
                                                </div>
                                                <a href="/event/?id=${event._id}">
                                                    ${ this.img(event) }
                                                </a>
                                                <div class="info">
                                                    <div>
                                                        <p>${ html(event.title) } <span>${ event.eventlocation }</span></p>
                                                        <div class="btn-cnt"><a href="/event/?id=${event._id}" class="get-ticket">${ html(this.data.ctatext.value) }</a></div>
                                                    </div>
                                                </div>
                                            </li>
                                        `
                                        :
                                        ``
                                        }).join('')
                                    }
                                </ul>
                            </div>
                            `
                        }).join('')

                    }).join('')
                }
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

        // select first if not yet present
        let show = false;
        [...document.querySelectorAll('#' + attr(this.data.id) + ' ul.event-tabs li')].forEach(el => {

            if(el.classList.contains('active')) show = true;
        });
        
        if(!show){

            document.querySelector('#' + attr(this.data.id) + ' ul.event-tabs li').classList.add('active');
            document.querySelector('#' + attr(this.data.id) + ' .tab-content .tab-pane').classList.add('show');
        }

        let hideAll = () => {

            [...document.querySelectorAll('#' + attr(this.data.id) + ' ul.event-tabs li')].forEach(el => {

                el.classList.remove('active');
            });

            [...document.querySelectorAll('#' + attr(this.data.id) + ' .tab-content .tab-pane')].forEach(el => {

                el.classList.remove('show');
            });
        }

        [...document.querySelectorAll('.event-tabs li a')].forEach(el => {

            el.addEventListener("click", e => {

                e.preventDefault();

                hideAll();

                e.currentTarget.parentElement.classList.add('active');

                let tab = e.currentTarget.getAttribute('href');

                self.year = tab.split('-')[1]
                self.month = tab.split('-')[2]

                document.querySelector('#' + attr(this.data.id) + ' .tab-content '+tab).classList.add('show');

                self.load();
            });
        });

        new Glide('.glide', {
            type: 'slider',
            perView: 5,
            focusAt: 'left',
            breakpoints: {
              800: {
                perView: 4
              },
              700: {
                perView: 3
              },
              600: {
                perView: 2
              },
              420: {
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
     * @name getAPI
     * @description Returns API link
     * @param {object} headers
     */
    getAPI = () => {

        return window.location.host.indexOf("localhost") == 0 ? "https://api.myticket-dev.app.kenzap.cloud/" : "https://api.myticket.app.kenzap.cloud/";
    }

}

window.kqXDlR = kqXDlR;