// dependencies
import { __html, attr, html, parseApiError, onClick, H, onChange } from '@kenzap/k-cloud';
import { getCookie, priceFormat, CDN } from "../_/_helpers.js"

class kBC5GW {

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
        <section id="${ attr(this.data.id) }" class="kBC5GW ${ this.data.c.classes ? attr(this.data.c.classes) : '' }" style="
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

        if(this.month === undefined) this.month = "1";
 
        // console.log((self.month+"").length);

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
                        detailed:   1,
                        limit:      20,
                        dates:      1,
                        filter_date:       self.year ? self.year + '-' + (parseInt(self.month) < 9 ? "0" + (parseInt(self.month) + 1) : (parseInt(self.month) + 1)) : ''
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

        console.log(this.response);

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

        // console.log(dates);
        if(!this.year) this.year = Object.keys(dates)[0];

        document.querySelector('#'+this.data.id+' .container').innerHTML = 
        `
            ${ this.data.header.value }
            <div class="kp-header">
                <div class="event-filter">
                    <div class="kenzap-row">
                        <div class="kenzap-col-6">
                            <p>${ __html('Select Month') }</p>
                            <select class="selectpicker" data-type="month">
                                ${ 
                                    dates[this.year] ? dates[this.year].map(month => {

                                        return `
                                            <option value="${ month }" ${ this.month == month ? 'selected' : '' }>${ months[month] }</option>
                                        `
                                    }).join('') : `<option>${ __html('select month') }</option>`
                                }
                            </select>
                        </div>
                        <div class="kenzap-col-6">
                            <p>${ __html('Select Year') }</p>
                            <select class="selectpicker" data-type="year">
                                ${ 
                                    Object.keys(dates).map(year => {

                                        return `
                                            <option value="${ year }" ${ this.year == year ? 'selected' : '' }>${ year }</option>
                                        `
                                    }).join('')
                                }
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            <div class="kp-content">
                ${
                    this.response.events.data.map((event, i) => {

                        return`
                        <div class="event-box">
                            <div class="event-date">
                                <div class="post-date">
                                    <span class="day">${ new Date(event.eventbegins).getDay()+1 }</span>
                                    <span class="month">${ (months[new Date(event.eventbegins).getMonth()]).substr(0, 3) }</span>
                                    <span class="year">${ new Date(event.eventbegins).getFullYear() }</span>
                                </div>
                            </div>
                            <div class="event-content">
                                <h3><a href="/event/?id=${event._id}">${ html(event.title) }</a></h3>
                                <p>${ html(event.sdesc) }</p>
                                <div class="location">
                                    <span>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" class="bi bi-pin-map-fill" viewBox="0 0 16 16">
                                            <path fill-rule="evenodd" d="M3.1 11.2a.5.5 0 0 1 .4-.2H6a.5.5 0 0 1 0 1H3.75L1.5 15h13l-2.25-3H10a.5.5 0 0 1 0-1h2.5a.5.5 0 0 1 .4.2l3 4a.5.5 0 0 1-.4.8H.5a.5.5 0 0 1-.4-.8l3-4z"/>
                                            <path fill-rule="evenodd" d="M4 4a4 4 0 1 1 4.5 3.969V13.5a.5.5 0 0 1-1 0V7.97A4 4 0 0 1 4 3.999z"/>
                                        </svg>
                                        ${ event.eventlocation }
                                    </span><a target="_blank" href="http://maps.google.com/?q=${ encodeURIComponent(event.eventlocation) }">${ html(this.data.ctamaptext.value) }</a> 
                                </div>
                            </div>
                            <div class="event-action">
                                <a href="/event/?id=${event._id}" class="join-now">${ html(this.data.ctatext.value) }</a>
                            </div>
                        </div>
                        `;

                    }).join(``)
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
        onChange(".selectpicker", e => {


            switch(e.currentTarget.dataset.type){
                case 'year':
                    self.year = e.currentTarget.value;
                break;
                case 'month':
                    self.month = e.currentTarget.value;
                break;
            }

            console.log(e.currentTarget.value)

            self.load();
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

            return `<img src="${ CDN()+'/S'+event.sid+'/event-'+event._id+'-1-250.webp?' + event.updated } }" alt="${ attr(event.title) }"></img>`;
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

window.kBC5GW = kBC5GW;