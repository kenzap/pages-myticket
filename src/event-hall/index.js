// dependencies
import { __attr, __html, attr, html, slugify, parseApiError, spaceID, onChange } from '@kenzap/k-cloud';
import { loadDependencies, getCookie, setCookie, getParam, priceFormat, makeid, hexToRGB, CDN } from '../_/_helpers.js';
import { EventCheckout } from "../_/_event_checkout.js"
import { Layout } from "../_/_event_layout.js"

class k2ZAuN{

    // init class
    constructor(data){
        
      this.state = {
          firstLoad: true,
          html: '',
          data: {},
          dpi: 0,
          ajaxQueue: 0,
          limit: 25,
          responseKey: [],
          modal: null,
          modalCont: null,
          editor: {},
          debug: getParam('test') ? true : false,
          // seat layout selector
          khl: ".kenzap-hall-layout",
          // hall layout json structure
          hall_js: '',
          // ticket reservation array
          tickets: [],
          // tickets released from reservation
          tickets_release: [],
          // tickets pending reservation
          tickets_reserve: [], 
          // tickets pending booking
          tickets_book: [],
          // tickets pending booking reversal
          tickets_unbook: [],
          // unique booking session identifier
          myticketUserId: sessionStorage.getItem('myticket_user_id') ? sessionStorage.getItem('myticket_user_id') : makeid(),
          // selected zone id
          current_zone_id: -1,
          // init ajax call timer
          myticketCalls: "",
          // adds seat/zone listener delay before bookings are loaded
          pending_reservation_timeout: 0,
          // keys to exclude from kenzap-hall-layout checkout
          exclude: ["coords", "attributes", "points", "price", "bg", "tns", "tws", "title", "height"],
          // summary table
          summary_table: '',
          // used to block UI when AJAX call is delayed
          pending_reservations: true,
          // global variable to store all bookings
          reservations: [], //, reservations_zones: [],
          // to detect if number of reservations changes
          bi_prev: 0,
          // settings: { currency_symb_loc: 'left', currency_symb: '$' },
          price: 0,
          // for resize listener
          innerWidthPrev: 0,
          hidenumbers: false,
          dwidth: 1200,
          mwidth: Math.round(1200 * 10 / parseInt(data.responsiveness.value)),
					smaxwidth: 1200,
          sminwidth: 1200,
          ticketspbooking: parseInt(data.ticketspbooking.value),
					numOpacity: 100,
					numOpacity2: 50,
          hall_js: null
      };

      // cache data
      this.data = data;
      
      // init container
      this.html();

      // render section
      this.load();
    }

    html = () => {

        document.querySelector('#content').insertAdjacentHTML('beforeend', 
        `
        <section id="${ attr(this.data.id) }" class="k2ZAuN ${ this.data.c.classes ? attr(this.data.c.classes) : '' }" style="
				${ this.data.c.section };
				${ this.data.borderstyle.value ? '--borderStyle:'+this.data.borderstyle.value+'px;' : '' } 
				${ '--stc:' + this.data.stc.value };
				${ '--avc:' + this.data.avc.value };
				${ '--avc2:' + hexToRGB(this.data.avc.value, parseInt(this.data.colorintensity.value) / 100) };
				${ '--soc:' + this.data.soc.value };
				${ '--soc2:' + hexToRGB(this.data.soc.value, parseInt(this.data.colorintensity.value) / 100) };
				${ '--sec:' + this.data.sec.value };
				${ '--sec2:' + hexToRGB(this.data.sec.value, parseInt(this.data.colorintensity.value) / 100) };
				">
            <div class="container" style="${ this.data.c.container }">
  

            </div>
        </section>
        `
        );
    }

    load = () => {

        let self = this;

        let s = "";

        // do API query
        fetch(this.getAPI(), {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Kenzap-Locale': getCookie('locale') ? getCookie('locale') : "en",
                // 'Kenzap-Token': self.data.token.value,
                'Kenzap-Sid': self.data.sid,
            },
            body: JSON.stringify({
                query: {
                    locale: {
                        type:       'locale',
                        id:         getCookie('lang')
                    },
                    event: {
                        type:       'view-event',
                        id:         getParam('id'),
                    }
                }
            })
        })
        .then(response => response.json())
        .then(response => {

            if(response.success){

              if(this.state.debug) console.log(response);

              this.state.response = response; 

              // make sure layout is preloaded
              this.loadLayout();

              // this.cb();
              // this.render();

              // first load
              this.state.firstLoad = false;

            }else{

                if(response.code == 400){

                    document.querySelector('#' + this.data.id + ' .container').innerHTML = html('Please provide valid event id to load this page.');
                    
                    return;
                }

                parseApiError(response);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    loadLayout = (id = "") => {

      let self = this;
      let layout = "";

      sessionStorage.setItem('myticket_user_id', this.state.myticketUserId);
      id = !id ? sessionStorage.getItem('date_select') : id;

      // get layout json code
      this.state.response.event.variations.forEach((variation, i) => {
    
        // console.log(variation);

        // get first as default
        if(variation.layout == 'true' && !layout){ this.state.price = parseFloat(variation.price); layout = variation.layoutid; sessionStorage.setItem('date_select', variation.id) }
        
        // get selected id provided
        if(variation.layout == 'true' && variation.id == id && (variation.type == "soldout" || variation.type == "visible")){ this.state.price = parseFloat(variation.price); layout = variation.layoutid; sessionStorage.setItem('date_select', variation.id) }
      });

      if(layout == ""){ document.querySelector('#' + this.data.id + ' .container').innerHTML = __html('Please link your layout with the event to load this page. %1$Learn more%2$.','<a target="_blank" href="https://kenzap.com/post/create-seating-chart-for-a-stadium-with-seat-numbers-and-sell-tickets-kenzap-myticket-197659#link-layout">', '</a>'); return; }

      fetch(CDN + '/S'+self.data.sid+'/layout-'+layout+'.json?' + (new Date().getTime()))
      .then(res => res.blob())
      .then(file => file.text())
      .then(text => {

          // console.log(text)
          self.state.hall_js = JSON.parse(text);
          // console.log(self.state.hall_js);
          self.render();

      }).catch((e) => {

        console.log(e);
      });
    }

    // render class html
    render = () => {

			let self = this;
      let event = this.state.response.event;

      // set page title 
      document.title = this.state.response.event.title;
      
      // selected package index
      // let pi = sessionStorage.getItem('date_select') ? parseInt(sessionStorage.getItem('date_select')) : 0;

			// restore unfinished reservations from browser cache if any
			try{
				this.state.tickets = JSON.parse(sessionStorage.getItem("tickets_"+event._id+"_"+sessionStorage.getItem('date_select')));
			}catch(e){}

			if(!Array.isArray(this.state.tickets)) this.state.tickets = [];

			// this.state.tickets = '';
			// console.log(this.state.tickets);
			// console.log(Array.isArray(this.state.tickets))
    
      document.querySelector('#' + this.data.id + ' .container').innerHTML =
        `
				<div class="kenzap-hall-layout">
					<div class="stage-name">
						<h3>
							<select type="text" class="date_select">
                ${
                  event.variations.map((variation, i) => {
                    return variation.layout == 'true' ? `<option ${ variation.id == sessionStorage.getItem('date_select') ? 'selected' : '' } value="${ variation.id }">${ html(variation.title) }</option>` : ``
                  }).join('')
                }
							</select>
						</h3>
						<p>
							<b>${ html(event.title) }</b><br>
							<span><a target="_blank" href="https://maps.google.com/?q=${ encodeURIComponent(event.eventlocation) }">${ html(event.eventlocation) }</a></span>
						</p>
					</div>
	
          ${ this.data.notelocation.value == 'above' ?
          `<p class="seat-info">${ __html(this.data.note.value) }</p>`
          :
          ``
          }

					<div id="kp_wrapper" class="kp_wrapper">
						<div id="kp_image" style="opacity:0.2; display: block; max-width:${ this.state.dwidth }px;min-width:${ this.state.mwidth }px;" class="kp_image">
							<img src="${ this.state.hall_js.img }" alt="#" id="myticket_img" usemap="#map">
							<svg xmlns="http://www.w3.org/2000/svg" version="1.2" baseProfile="tiny" id="svg" class="kp_svg noselect" style="display: block;">
								<g data-id="fTbTcx" data-title="" data-tws="0" data-tns="0" data-height="100">
							</svg>
							<map name="map"></map>
						</div>
					</div>

					<div id="variation_cont_zone" class="variation_cont" >
						<div class="var_toolbar">
							<div class="var_toolbar_close"><span class="times"><svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"></path></svg></span></div>
						</div>
						<div class="variation_cont_inner" >
							<h3>${ __html('Ticket type') }</h3>
							<div>
								<ul class="pvar">

								</ul>
							</div>
						</div>
					</div>

					<div class="seat-label">
						<ul>
							<li>${ __html('Available') }</li>
							<li>${ __html('Sold Out') }</li>
							<li>${ __html('Selected') }</li>
						</ul>
					</div>

					${ this.data.notelocation.value == 'bottom' ?
          `<p class="seat-info">${ __html(this.data.note.value) }</p>`
          :
          ``
          } 

					<div class="ticket-price">
						<table class="kp-table">
								<thead>
										<tr>
												<th>${ __html('Ticket') }</th>
												<th>&nbsp;</th>                                                   <!-- column hidden for mobile screens -->
												<th>${ __html('Price') }</th>                                                 <!-- column hidden for mobile screens -->
												<th>&nbsp;</th>
										</tr>
								</thead>
								<tbody class="kp-ticket-row">

								</tbody>
						</table>
					</div>
		
					<div class="kp-continue-cont">
						<a class="kp-btn-reserve btn-checkout ${ attr(this.data.checkoutbtn.value) }" data-src="#checkout-box" href="javascript:;" data-text="${ attr('Continue') }">${ __html('Continue') }</a>
					</div>
				</div>

        <div id="checkout-box" class="kbox saved-list" >
          <form action="#">
            <div class="popup-data">
                <div class="header">
                    <h2>${ __html('Checkout') }</h2>
                </div>
                <div class="content-area">
                    <div class="content">
                        
                    </div>
                </div>
            </div>
            </form>
            <button data-kbox-close="" class="kbox-close-small">×</button>
        </div>
      `;

			// load image to get its proportions
			const img = new Image();
			img.onload = () => {

				self.state.img_width = img.width;
				self.state.img_height = img.height;

        // console.log(img.width);

				// map polygons accordingly
				self.state.layout = new Layout(self.data, self.state);

				// checkout class
				this.state.checkout = new EventCheckout(this.state, this.data.id, self.data.sid);
			}
			img.src = this.state.hall_js.img;

      this.listeners();
    }

    // all listeners and events
    listeners = () => {

      let self = this;

      let d = document;

      // package picker
      onChange('.date_select', e => {

        e.preventDefault();

        let cb = () => {

          // block UI
          document.querySelector('#kp_wrapper').style.opacity = 0.5;
          document.querySelector('.kp_svg').innerHTML = '';

          // cache selected to keep it after reload
          sessionStorage.setItem('date_select', e.currentTarget.value);
        
          // reset current selections
          self.state.tickets = [];

          // get layout
          self.loadLayout(e.currentTarget.value);
        }

        if(self.state.tickets.length > 0){

          if(confirm( __html('Switch and clear selected tickets?') )){

            cb(); 
          }else{

            d.querySelector('.date_select').value = sessionStorage.getItem('date_select'); 
            return false; 
          }
        }else{
          cb();
        }
      });

      // reload function
      self.state.reload = () => {

        if(this.state.resizing) clearTimeout(this.state.resizing);
        document.querySelector('#myticket_img').style.opacity = '0';
        document.querySelector('.kp_svg').style.opacity = '0';

        this.state.resizing = setTimeout(() => {
         
          self.state.innerWidthPrev = window.innerWidth;
          self.loadLayout(document.querySelector('.date_select').value);
          self.state.reloadPending = false;
          // console.log('reload');

        }, 250);
      }

      // resize listener to reload the layout
      window.addEventListener("resize", e => {

        // only continue if resize is significant
        if(Math.abs(self.state.innerWidthPrev - window.innerWidth) < 100) return;

        // check if popup is not open
        if(document.querySelector('#seat_mapping')){ console.log('skip reload'); self.state.reloadPending = true; return;  }

        self.state.reload();
      });
    }

    // refresh button state
    btnWishlistRef = (revert) => {

      let d = document;
      let oidc = 'o'+this.state.response.event._id;
      let temp = getCookie("favorites");
      if(revert){

          if(!temp.includes(oidc)){
              temp += oidc+"|";
              setCookie("favorites", temp, 100); 
              revert = true;
          }else if(temp.includes(oidc)){
              temp = temp.replace(oidc+"|", "");
              setCookie("favorites", temp, 100); 
              revert = false;
          }
      }else{
          revert = temp.includes(oidc); 
      }

      if(revert){
          d.querySelector(".btn-wish").innerHTML = '<i class="fa fa-heart"></i>'+d.querySelector(".btn-wish").dataset.rem_wishlist;
      }else{
          d.querySelector(".btn-wish").innerHTML = '<i class="fa fa-heart-o"></i>'+d.querySelector(".btn-wish").dataset.add_wishlist;
      }
    }

    // refreshPrice = (t) => {

    //   let d = document;
    //   let pb = d.querySelector('input[name="pack-group"]:checked');
    //   if(!pb) return;

    //   let qty = parseInt(d.querySelector(".num").value);
    //   let price = pb.dataset.price*qty;
    //   let btn = d.querySelector(".btn-checkout");
    //   btn.setAttribute('data-price', price);
    //   btn.innerHTML = btn.getAttribute('data-cont') + ' <span>(' + priceFormat(this.state.response.event, price) + ')</span>';
    //   // btn.dataset.link = "https://pay.kenzap.com/B"+oid+"P"+pb.dataset.box+"P"+qty+"/";

    //   // package variation
    //   switch(t){
    //       // normal package
    //       case true: 

    //           d.querySelector(".qty-area").style.display = "block";
    //       break;
    //       // custom package
    //       case false: 

    //           d.querySelector(".qty-area").style.display = "none";
    //           return;
    //       break;
    //   }

    //   // refreshOfferUrl();
    // }

    doCheckout = (e) => {

      e.preventDefault();
    }

    // sync html with data
    cache = () => {

      localStorage.setItem(this.id, JSON.stringify(this.state));
    }

    dependencies = () => {

        let self = this;

    //     // can not start rendering without jquery
    //     loadDependencies('https://static.kenzap.com/libs/jquery-1.11.0.min.js', () => {
  
    //         self.cb;
    //         // loadDependencies('https://static.kenzap.com/libs/lightslider-1.1.5.css', self.cb);
    //         // loadDependencies('https://static.kenzap.com/libs/lightslider-1.1.5.js', self.cb);
    //         // loadDependencies('https://static.kenzap.com/libs/easyzoom-2.4.0.js', self.cb);
    //     });
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

window.k2ZAuN = k2ZAuN;