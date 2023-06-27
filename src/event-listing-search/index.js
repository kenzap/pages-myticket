// dependencies
import { __html, attr, html, onClick, parseApiError } from '@kenzap/k-cloud';
import { getCookie, eventLink, eventPrice, priceFormat, getParam, CDN } from "../_/_helpers.js"
import * as noUiSlider from 'nouislider/dist/nouislider.min'

class k0HRWO {

    // init class
    constructor(data){
        
        this._id = '';
        this.date = '';

        // first load
        this.firstLoad = true;

        // search term
        this.s = getParam('s') ? getParam('s') : "";

        // category checkboxes status
        this.cats = {};

        // price range filter
        this.price = [0, parseInt(data.filterprice.value)];

        // cache data
        this.data = data;

        // init container
        this.html();

        // get data from the backend
        this.load();
    }

     /**
     * Render HTML before API contents are loaded 
     * @public
     * @returns {Node} rendered HTML 
     */
    html = () => {

        let self = this;

        // prepare sidebar categiry array structure
        let sidebars = [];
        let i = -1;
        this.data.filtercategories.value.split('\n').forEach(v => {
            
            if(!v.startsWith('-')){ i++; sidebars[i] = []; }
            sidebars[i].push(v);
        });

        document.querySelector('#content').insertAdjacentHTML('beforeend', 
        `
        <section id="${ attr(this.data.id) }" class="k0HRWO ${ this.data.c.classes ? attr(this.data.c.classes) : '' }" style="
            ${ this.data.c.section };
            ${ this.data.borderstyle.value ? '--borderStyle:' + this.data.borderstyle.value + 'px;' : '' };
            ${ this.data.borderstyle.value ? '--borderStyleLess:' + (parseInt(this.data.borderstyle.value) > 24 ? 24 : this.data.borderstyle.value)+'px;' : '' };
            ">
            <div class="container" style="${ this.data.c.container }">
  
                ${ this.data.header.value }
                <div class="kenzap-row">
                    <div class="refine-search">
                        <div class="keyword kenzap-col-6 kenzap-col-4">
                            <label>${ __html('Search term') }</label>
                            <input type="text" class="form-control hasclear filter-search" placeholder="Search" value="${ attr(self.s) }">
                            <span class="clearer"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-x-circle" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg> 
                            </span>
                        </div>
                        <div class="location kenzap-col-6 kenzap-col-3">
                            <label>${ __html('Location') }</label>
                            <select class="location-picker selectpicker dropdown">
                                <option value="">${ __html('Select location') }</option>
                                ${
                                    self.data.filterlocations.value.split('\n').map(location => {

                                        return `<option>${ location }</option>`
                                    }).join('')
                                }
                            </select>
                        </div>
                        <div class="event-date kenzap-col-6 kenzap-col-3">
                            <label>${ __html('Event date') }</label>
                            <select class="date-picker selectpicker dropdown">
                                <option value="">${ __html('Select month') }</option>
                            </select>
                        </div>
                        <div class="kenzap-col-6 kenzap-col-2">
                            <label>&nbsp;</label>
                            <input type="submit" value="${ attr('Search') }" class="search-btn">
                        </div>
                    </div>
                </div>
                
                <div class="kenzap-row">
                    <div id="secondary" class="kenzap-col-3">
                        <div class="search-filter">

                            <div class="search-event-title">
                                <h2><span>${ self.data.sidebartitle.value.split('\n')[0] ? self.data.sidebartitle.value.split('\n')[0] : '' }</span> ${ self.data.sidebartitle.value.split('\n')[1] ? self.data.sidebartitle.value.split('\n')[1] : '' } </h2>
                            </div>

                            ${
                                sidebars.map((ca, c) => {

                                    return `
                                    <div class="search-filter-cb">
                                        <h3>${ html(ca[0]).trim() }</h3>
                                        ${
                                            ca.map((cat, i) => {

                                                return i > 0 ? `
                                                    <div class="kenzap-checkbox cbg-${c}">
                                                        <input id="cat-${c}-${i}" data-c="${c}" data-all="0" class="styled" type="checkbox" ${ self.cats['cat-' + c + '-' + i] ? (self.cats['cat-' + c + '-' + i].checked ? 'checked=""' : '') : '' } value="${ attr(cat.substr(1).trim()) }" >
                                                        <label for="cat-${c}-${i}">
                                                            ${ html(cat.substr(1).trim()) }
                                                        </label>
                                                    </div>`:
                                                    `<div class="kenzap-checkbox all-${c}">
                                                        <input id="cat-${c}-${i}" data-c="${c}" data-all="1" class="styled" type="checkbox" ${ self.cats['cat-' + c + '-' + i] ? (self.cats['cat-' + c + '-' + i].checked ? 'checked=""' : '') : '' } ${ self.firstLoad ? 'checked=""' : '' } value="">
                                                        <label for="cat-${c}-${i}">
                                                            ${ __html('All') }
                                                        </label>
                                                    </div>`

                                            }).join(``)
                                        }
                                    </div>
                                    `

                                }).join('')
                            }

                            <div class="search-filter-price">
                                <h3>${ __html('Price') }</h3>
                                <div id="price-range" ></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="kenzap-col-9 results">

                    </div>
                </div>

            </div>
        </section>
        `
        );
    }

     /**
     * Load Events data from particular space by calling Kenzap Cloud API
     * @public
     * @returns {Node} rendered HTML 
     */
    load = () => {

        let self = this;

        // console.log(this.cats['cat-1-1'] ? this.cats['cat-1-1'].checked : " ");

        if(!this.firstLoad) document.querySelector('.results').classList.add('faded');

        let filter_cats = [];
        Object.keys(this.cats).map(key => {

            this.cats[key].checked ? filter_cats.push(this.cats[key].value) : '';
        })

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
                        limit:      10,
                        dates:      1,
                        filter_date:       document.querySelector('.date-picker').value.trim(),
                        filter_loc:        document.querySelector('.location-picker').value.trim(),
                        filter_cats:       filter_cats,
                        filter_search:     self.s.trim(),
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

                // remove
                document.querySelector('.results').classList.remove('faded');

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

     /**
     * Render dynamic part of HTML content, single event cards
     * @public
     * @returns {Node} rendered HTML 
     */
    render = () => {

        let self = this;

        const months = [__html('January'), __html('February'), __html('March'), __html('April'), __html('May'), __html('June'), __html('July'), __html('August'), __html('September'), __html('October'), __html('November'), __html('December')];

        let events = [];
        this.response.events.data.forEach(event => {
            
            // self.price[0]
            let price_min, price_max;
            event.variations.forEach(v => {

                if(price_min === undefined) price_min = v.price;
                if(price_max === undefined) price_max = v.price;

                if(v.price < price_min) price_min = v.price;
                if(v.price > price_max) price_max = v.price;
            });

            if(price_min >= self.price[0] && price_max<= self.price[1]) events.push(event);
        });

        // dates
        if(!self.dates){

            self.dates = [];
            self.response.events.dates.forEach(date => {

                let month = date.substr(0, 7);
                if(!self.dates.includes(month)) self.dates.push(month);

            });
            self.dates.sort();

            document.querySelector('.date-picker').innerHTML += 
            
            self.dates.map(date => {
              
                return `<option value="${ attr(date) }">${ months[new Date(date + '-01').getMonth()] + ', ' + new Date(date + '-01').getFullYear() }</option>`;
            }).join('');
            
            // console.log(self.dates);
        }
        
        if(!self.sortby) self.sortby = '0';

        // sort by
        switch(self.sortby){

            case '0':
                events.sort((a, b) => new Date(a.eventbegins).getTime() - new Date(b.eventbegins).getTime() )
            break;
            case '1':
                events.sort((a, b) => a.title - b.title);
            break;
            case '2':
                events.sort((a, b) => a.variations[0].price - b.variations[0].price);
            break;
            case '3':
                events.sort((a, b) => b.variations[0].price - a.variations[0].price);
            break;
        }

        // console.log(events);

        document.querySelector('#'+this.data.id+' .results').innerHTML = 
        `
            <div class="search-result-header">
                <div class="kenzap-row">
                    <div class="kenzap-col-7">
                        <h2>${ self.s ?__html('Search results for %1$', self.s) : __html('Showing all records') }</h2>
                        <span>${ __html('Showing %1$-%2$ of %3$ results', 1, events.length, this.response.events.total) }</span>
                    </div>
                    <div class="kenzap-col-5">
                        <div class="sortby">
                            <label>${ __html('Sort By') }</label>
                            <select class="sortby-picker selectpicker dropdown cat">
                                <option value="0" ${ self.sortby == "0" ? "selected" : "" }>${ __html('Closest') }</option>
                                <option value="1" ${ self.sortby == "1" ? "selected" : "" }>${ __html('Alphabetically') }</option>
                                <option value="2" ${ self.sortby == "2" ? "selected" : "" }>${ __html('Price: Low-High') }</option>
                                <option value="3" ${ self.sortby == "3" ? "selected" : "" }>${ __html('Price: High-Low') }</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            ${
                events.map((event, i) => {

                    return `
                    <div class="search-result-item">
                        <div class="kenzap-row">
                            <div class="search-result-item-info kenzap-col-9">
                                <h3>${ event.title }</h3>
                                <ul class="kenzap-row">
                                    <li class="kenzap-col-5 col-lg-6">
                                        <span><b>${ __html('Venue') }</b></span>
                                        ${ html(event.eventlocation) }
                                    </li>
                                    <li class="kenzap-col-4 col-lg-3">
                                        <span><b>${ new Date(event.eventbegins).toLocaleString([], {  weekday: 'long' }) }</b></span>
                                        ${ new Date(event.eventbegins).toLocaleDateString() }
                                    </li>
                                    <li class="kenzap-col-3">
                                        <span><b>${ __html('Time') }</b></span>
                                        ${ new Date(event.eventbegins).toLocaleTimeString([],  { hour: "2-digit", minute: "2-digit" }) }
                                    </li>
                                </ul>
                            </div>
                            <div class="search-result-item-price kenzap-col-3">
                                <span>${ __html('Price From') }</span>
                                <strong>${ eventPrice(event) }</strong>
                                <a href="${ eventLink(event) }">${ __html('Book Now') }</a>
                            </div>
                        </div>
                    </div>
                    `     
                }).join(``)
            }
        
        `;

        if(!events.length) if(document.querySelector('#'+this.data.id+' .results')) document.querySelector('#'+this.data.id+' .results').innerHTML = 
            `
                <div class="kp-content" style=" ">
                    <p class="empty">
                        ${ __html('No events found') }
                    </p>
                </div>
            `;
        
        // listeners
        this.listeners();
    }

     /**
     * Initiale all listeners of this layout
     * @public
     * @returns {Node} rendered HTML 
     */
    listeners = () => {
        
        let self = this;

        // sortby listener
        if(document.querySelector('.sortby-picker')) document.querySelector('.sortby-picker').addEventListener("change", e => {

            e.preventDefault();

            self.sortby = e.currentTarget.value;

            self.render();
        });

        if(!this.firstLoad) return;

        // refresh checkboxes state
        let refreshCheckboxes = (c, all) => {

            if(all == '1'){

                [...document.querySelectorAll('.cbg-' + c + ' input')].forEach(el => {

                    self.cats[el.getAttribute('id')] = { checked: false, value: el.value }

                    el.checked = false;
                });
            }else{

                let checked = false;
                [...document.querySelectorAll('.cbg-' + c + ' input')].forEach(el => {

                    if(el.checked) checked = true;
                });

                // ALL set checked
                if(checked){

                    document.querySelector('.all-' + c + ' input').checked = false;

                // ALL set unchecked  
                }else{

                    document.querySelector('.all-' + c + ' input').checked = true;
                }
            }
        }

        // checkbox tick listener
        [...document.querySelectorAll('.kenzap-checkbox input')].forEach(el => {

            el.addEventListener("change", e => {

                e.preventDefault();

                self.cats[e.currentTarget.getAttribute('id')] = { checked: e.currentTarget.checked, value: e.currentTarget.value }

                refreshCheckboxes(e.currentTarget.dataset.c, e.currentTarget.dataset.all);

                self.load();
            })
        });

        // render price range sidebar filter
        self.data.filterprice.value = parseInt(self.data.filterprice.value);
        let slider = document.getElementById('price-range');
        if(slider) noUiSlider.create(slider, {
            start: [self.price[0] ? self.price[0] : 0, self.price[1] ? self.price[1] : 100],
            connect: true,
            range: {
                'min': 0,
                'max': self.data.filterprice.value
            },
            step: Math.round(self.data.filterprice.value / 10),
            tooltips: true,
            format: {
                to: (value) => {
                    return priceFormat(self.response.events.data[0].settings, value);
                },
                from: (value) => {
                    return value;
                }
            }
        });

        if(slider) slider.noUiSlider.on('slide', (values, handle, unencoded, tap, positions) => {

            self.price = unencoded;
            self.render();
        });
    
        // search term change listener
        document.querySelector('.filter-search').addEventListener("keyup", e => {

            if(self.timeout) clearTimeout(self.timeout);

            self.s = e.currentTarget.value;

            self.timeout = setTimeout(e => { self.load(); }, 1000);

            if(self.s.length) document.querySelector('.clearer').classList.add('show');
            self.focus = '.filter-search';
        });

        // clear search input field
        onClick('.clearer', e => {

            document.querySelector('.filter-search').value = "";
            self.s = "";
            document.querySelector('.clearer').classList.remove('show');
            self.load();
        });

        // search button click listener
        onClick('.search-btn', e => {
        
            if(self.timeout) clearTimeout(self.timeout);

            self.load();
        });

        if(self.s.length) document.querySelector('.clearer').classList.add('show');
        
        this.firstLoad = false;
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

window.k0HRWO = k0HRWO;